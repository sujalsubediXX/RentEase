import type { Request,Response } from 'express';
import  crypto from 'crypto';


const ESEWA_CONFIG = {
  PRODUCT_CODE: 'EPAYTEST',
  SECRET_KEY: '8gBm/:&EnhH.1/q', // Official eSewa test secret key
  GATEWAY_URL: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  SUCCESS_URL: 'http://localhost:5173/payment-success', // Your frontend redirect routes
  FAILURE_URL: 'http://localhost:5173/payment-failure'
};


export const initiatePayment= async (req:Request, res:Response) => {
 try {
    const { amount, tax_amount, delivery_charge, security_deposit } = req.body;
    
    // Force clean integers to eliminate JavaScript floating-point precision traps
    const amt = Math.round(parseFloat(amount || 0));
    const tax = Math.round(parseFloat(tax_amount || 0));
    const service = 0;
    const delivery = Math.round(parseFloat(delivery_charge || 0));
    const deposit = Math.round(parseFloat(security_deposit || 0));
    
    // Strictly calculate total as an integer
    const total_amount = amt + tax + service + delivery + deposit;
    
    // Simplified transaction UUID format (purely lowercase alphanumeric and hyphen)
    const transaction_uuid = `rent-${Date.now()}`;

    // Reconstruct precise signature string matching eSewa v2 requirements
    const signatureMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_CONFIG.PRODUCT_CODE}`;

    // Create the cryptographic HMAC-SHA256 Hash signature
    const signature = crypto
      .createHmac('sha256', ESEWA_CONFIG.SECRET_KEY)
      .update(signatureMessage)
      .digest('base64');

    // Return the response payload
    return res.status(200).json({
      status: 'success',
      payment_payload: {
        amount: amt,
        tax_amount: tax,
        product_service_charge: service,
        product_delivery_charge: delivery + deposit, 
        total_amount: total_amount,
        transaction_uuid: transaction_uuid,
        product_code: ESEWA_CONFIG.PRODUCT_CODE,
        success_url: ESEWA_CONFIG.SUCCESS_URL,
        failure_url: ESEWA_CONFIG.FAILURE_URL,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature
      },
      gateway_url: ESEWA_CONFIG.GATEWAY_URL
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
    
    // 🔍 DEBUG LOG 1: Look at exactly what eSewa sent back
    console.log("🔍 Decoded eSewa Response Data:", responseData);

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
    console.log("🔍 Local Signature Message built:", signatureMessage);

    const localSignature = crypto
      .createHmac('sha256', ESEWA_CONFIG.SECRET_KEY)
      .update(signatureMessage)
      .digest('base64');

    console.log("🔍 eSewa Signature: ", signature);
    console.log("🔍 Local Signature: ", localSignature);

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
