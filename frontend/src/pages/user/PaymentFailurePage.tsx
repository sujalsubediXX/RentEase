import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-800 pt-28 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-amber-600" size={26} />
          </div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">Transaction Cancelled</h2>
          <p className="text-xs text-stone-400 mt-1">
            The processing sequence was cancelled or dropped by the gateway portal node interface.
          </p>

          <div className="my-5 p-3 bg-stone-50 border border-stone-100 text-left rounded-xl flex gap-2.5">
            <AlertTriangle size={16} className="text-stone-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-stone-500 space-y-0.5">
              <p className="font-semibold text-stone-700">Common causes for gateway failure:</p>
              <p>• Incorrect eSewa transaction secret MPIN credentials</p>
              <p>• Insufficient wallet resource balance liquidity parameters</p>
              <p>• Network timeout latency on checkout callback tracking hoops</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => navigate(-2)} // Steps backwards out of routing stack loops safely back to checkout
              className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw size={12} /> Retry Order
            </button>
            <Link
              to="/"
              className="py-2.5 bg-stone-900 hover:bg-stone-950 text-amber-400 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Storefront Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentFailurePage;