import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle, Calendar,  ArrowRight } from 'lucide-react';
import API_BASE_URL from '../../config/api';
interface VerifiedDetails {
  transaction_uuid: string;
  total_amount: string;
  transaction_code: string;
  status: string;
}

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderDetails, setOrderDetails] = useState<VerifiedDetails | null>(null);

  useEffect(() => {
    const verifyEsewaPayment = async () => {
      // eSewa v2 appends a '?data=...' base64 parameter to your success URL
      const dataToken = searchParams.get('data');

      if (!dataToken) {
        setVerificationStatus('error');
        return;
      }

      try {
        // Forward token to backend server hook for secure cryptographic verification
        const response = await fetch(`${API_BASE_URL}/api/payment/esewa/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: dataToken }),
        });

        const result = await response.json();

        if (result.status === 'verified') {
          setOrderDetails(result.orderDetails);
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
        }
      } catch (err) {
        console.error('Verification connection exception error:', err);
        setVerificationStatus('error');
      }
    };

    verifyEsewaPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-800 pt-28 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        
        {/* State 1: Verifying Signature Layer */}
        {verificationStatus === 'loading' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
            <Loader2 className="mx-auto text-amber-500 animate-spin" size={40} />
            <h2 className="text-lg font-bold text-stone-900">Verifying Transaction</h2>
            <p className="text-xs text-stone-400">
              Securing connection handshakes with eSewa node settlement networks. Do not refresh this page...
            </p>
          </div>
        )}

        {/* State 2: Verified Success Receipt Display */}
        {verificationStatus === 'success' && orderDetails && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-emerald-600" size={26} />
              </div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">Booking Confirmed!</h2>
              <p className="text-xs text-stone-400 mt-1"> Your rental allocation parameters have been locked in.</p>
              
              <div className="mt-6 border-t border-b border-stone-100 py-4 space-y-2.5 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">System reference ID</span>
                  <span className="font-semibold text-stone-700 font-mono">{orderDetails.transaction_uuid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">eSewa Transaction Code</span>
                  <span className="font-semibold text-stone-700 font-mono">{orderDetails.transaction_code}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-stone-400">Settled Amount Total</span>
                  <span className="text-sm font-bold text-stone-900">Rs. {parseInt(orderDetails.total_amount).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2 bg-stone-50 border border-stone-100 rounded-xl p-3 text-left">
                <Calendar size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-stone-500 leading-normal">
                  Our fulfillment team will contact your provided primary line shortly to complete shipping coordination schedules.
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="w-full py-3 bg-stone-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              Return to Catalog Home <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* State 3: Failure Flag Security Catch */}
        {verificationStatus === 'error' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="text-rose-600" size={26} />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Verification Failure</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              The cryptographic payment token could not be verified by our servers. If money was deducted, it will automatically roll back within 24 hours.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-block px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccessPage;