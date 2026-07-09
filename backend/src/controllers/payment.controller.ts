import type { Request,Response } from 'express';
import  crypto from 'crypto';
import Rentals from '../models/Rentals.model.ts';

const ESEWA_CONFIG = {
  PRODUCT_CODE: 'EPAYTEST',
  SECRET_KEY: '8gBm/:&EnhH.1/q', // Official eSewa test secret key
  GATEWAY_URL: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  SUCCESS_URL: `${process.env.CLIENT_URL}/payment-success`, // Your frontend redirect routes
  FAILURE_URL: `${process.env.CLIENT_URL}/payment-failure`
};





export const initiatePayment = async (req: Request, res: Response) => {

  try {
    const { rentalIds, tax_amount = 0, product_service_charge = 0, product_delivery_charge = 0 } = req.body;

    if (!rentalIds || !Array.isArray(rentalIds) || rentalIds.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No rentals provided' });
    }

    // Look up rentals in DB and sum their real amounts — never trust client-sent price
    const rentals = await Rentals.find({ _id: { $in: rentalIds } });
    if (rentals.length !== rentalIds.length) {
      return res.status(400).json({ status: 'error', message: 'One or more rentals not found' });
    }

    const amt = rentals.reduce((sum, r) => sum + r.totalPrice, 0); // adjust field name to your schema
    const taxAmt = Math.round(parseFloat(tax_amount || 0));
    const serviceCharge = Math.round(parseFloat(product_service_charge || 0));
    const deliveryCharge = Math.round(parseFloat(product_delivery_charge || 0));

    const total_amount = amt + taxAmt + serviceCharge + deliveryCharge;

    if (total_amount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid computed amount' });
    }

    const transaction_uuid = `rent-${Date.now()}`;

    const signatureMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_CONFIG.PRODUCT_CODE}`;
    const signature = crypto
      .createHmac('sha256', ESEWA_CONFIG.SECRET_KEY)
      .update(signatureMessage)
      .digest('base64');

    return res.status(200).json({
      status: 'success',
      payment_payload: {
        amount: amt,
        tax_amount: taxAmt,
        product_service_charge: serviceCharge,
        product_delivery_charge: deliveryCharge,
        total_amount,
        transaction_uuid,
        product_code: ESEWA_CONFIG.PRODUCT_CODE,
        success_url: ESEWA_CONFIG.SUCCESS_URL,
        failure_url: ESEWA_CONFIG.FAILURE_URL,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
      gateway_url: ESEWA_CONFIG.GATEWAY_URL,
    });
  } catch (error) {
    console.error('eSewa Initiation Error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
/**
 * Endpoint 2: Complete Hook Verification Callback Server Verification
 */
export const verifyPayment=(req:Request, res:Response) => {
 try {
    const { data } = req.body;
    if (!data) {
      console.log("❌ Error: No data payload received in body");
      return res.status(400).json({ status: 'error', message: 'Missing token data' });
    }

    // Decode the payload
    const decodedString = Buffer.from(data, 'base64').toString('utf-8');
    const responseData = JSON.parse(decodedString);
    
    

    const { status, signature, transaction_uuid, total_amount, product_code, signed_field_names } = responseData;

    if (status !== 'COMPLETE') {
      console.log(`❌ Error: Transaction status is ${status}, not COMPLETE`);
      return res.status(400).json({ status: 'failed', message: 'Transaction incomplete' });
    }

    // Reconstruct the message string dynamically based on eSewa's signed_field_names
    // This avoids hardcoding order or formatting bugs
    const fields = signed_field_names.split(',');
    const signatureMessage = fields.map((field: string | number) => `${field}=${responseData[field]}`).join(',');

    // 🔍 DEBUG LOG 2: Compare the constructed signature strings


    const localSignature = crypto
      .createHmac('sha256', ESEWA_CONFIG.SECRET_KEY)
      .update(signatureMessage)
      .digest('base64');


    if (localSignature === signature) {
      return res.status(200).json({ status: 'verified', orderDetails: responseData });
    } else {
      console.log("❌ Error: Signature Validation Mismatch!");
      return res.status(400).json({ status: 'tampered', message: 'Signature validation mismatch' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error' });
  }
};
