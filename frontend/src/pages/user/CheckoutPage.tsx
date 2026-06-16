import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Calendar, MapPin, CreditCard,
  User, Phone, ShieldCheck, ShoppingBag, Package
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of a single product coming from CategoryPage's "Rent Now" */
interface Product {
  id: string;
  name: string;
  description?: string;
  rentalPrice: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  brand?: string;
  location?: string;
}

/**
 * Shape of an item coming from CartPage.
 * The backend returns nested itemId with title/price.
 */
interface CartItem {
  _id: string;
  itemId: {
    _id: string;
    title: string;
    price: number;
  };
  quantity: number;
  rentalDays: number;
  startDate: string;
  endDate: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcDays = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const diff = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff);
};

const today = new Date().toISOString().split('T')[0];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
    <span className="text-amber-600">{icon}</span>
    <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wider">
      {label}
    </h2>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

 
  const checkoutType: 'single' | 'cart' = location.state?.type ?? 'single';
  const rawItems: any[] = location.state?.items ?? [];


  // For single flow: product info without dates (user picks dates below)
  const singleProduct: Product | null =
    checkoutType === 'single' && rawItems.length > 0
      ? (rawItems[0].item as Product)
      : null;

  // For cart flow: already have dates per item from CartPage
  const cartItems: CartItem[] =
    checkoutType === 'cart' ? (rawItems as CartItem[]) : [];

  // ── Form state ───────────────────────────────────────────────────────────

  // Date pickers are only shown for single flow
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'digital'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Calculations ─────────────────────────────────────────────────────────

  /** Rental days for the single-item flow, driven by the date pickers */
  const singleRentalDays = useMemo(
    () => calcDays(startDate, endDate),
    [startDate, endDate]
  );

  
  
  const subtotal = useMemo(() => {
    if (checkoutType === 'single') {
      return singleProduct ? singleProduct.rentalPrice * singleRentalDays : 0;
    }
    return cartItems.reduce(
      (acc, item) => acc + item.itemId.price * item.rentalDays,
      0
    );
  }, [checkoutType, singleProduct, singleRentalDays, cartItems]);

 
  const securityDeposit = useMemo(() => {
    if (checkoutType === 'single') {
      return singleProduct ? Math.round(singleProduct.rentalPrice * 1.5) : 0;
    }
    return cartItems.reduce(
      (acc, item) => acc + Math.round(item.itemId.price * 1.5),
      0
    );
  }, [checkoutType, singleProduct, cartItems]);

  const deliveryFee = 150;
  const totalAmount = subtotal + securityDeposit + deliveryFee;

  // ── Guard: nothing to checkout ───────────────────────────────────────────

  const hasItems =
    checkoutType === 'single' ? !!singleProduct : cartItems.length > 0;

  if (!hasItems) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-500">
        <ShoppingBag size={40} className="text-stone-300" />
        <p className="text-base font-medium">No items found for checkout.</p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-stone-900 text-amber-400 rounded-xl text-sm font-semibold hover:bg-amber-500 hover:text-stone-950 transition-all"
        >
          Browse Items
        </Link>
      </div>
    );
  }


  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates for single flow
    if (checkoutType === 'single' && (!startDate || !endDate)) return;

    const orderData = {
      type: checkoutType,
      // normalise to a unified shape for the confirmation page
      items:
        checkoutType === 'single'
          ? [
              {
                id: singleProduct!.id,
                name: singleProduct!.name,
                images: singleProduct!.images,
                rentalPrice: singleProduct!.rentalPrice,
                startDate,
                endDate,
                rentalDays: singleRentalDays,
                quantity: 1,
              },
            ]
          : cartItems.map((ci) => ({
              id: ci.itemId._id,
              name: ci.itemId.title,
              images: [],
              rentalPrice: ci.itemId.price,
              startDate: ci.startDate,
              endDate: ci.endDate,
              rentalDays: ci.rentalDays,
              quantity: ci.quantity,
            })),
      customer: { fullName, phoneNumber, deliveryAddress },
      paymentMethod,
      subtotal,
      securityDeposit,
      deliveryFee,
      totalAmount,
    };

    if (paymentMethod === 'digital') {
      navigate('/confirm-booking', { state: orderData });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Order placed successfully!');
      navigate('/');
    }, 1500);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-800 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-6"
        >
          <ChevronLeft size={14} /> Back
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 tracking-tight">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left: Form ── */}
          <form
            onSubmit={handlePlaceOrder}
            className="lg:col-span-7 space-y-6"
          >

            {/* ── Date picker (single flow only) ── */}
            {checkoutType === 'single' && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <SectionHeader
                  icon={<Calendar size={16} />}
                  label="Rental Period"
                />

            

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        // reset end date if it's before new start
                        if (endDate && e.target.value > endDate) setEndDate('');
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      Return Date
                    </label>
                    <input
                      type="date"
                      required
                      disabled={!startDate}
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <p className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg w-max">
                    {singleRentalDays} {singleRentalDays === 1 ? 'day' : 'days'} rental ·
                    Rs. {(singleProduct!.rentalPrice * singleRentalDays).toLocaleString()} rental fee
                  </p>
                )}
              </div>
            )}

        
          

            {/* ── Delivery Details ── */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
              <SectionHeader icon={<User size={16} />} label="Delivery Details" />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder="98XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      City
                    </label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Kathmandu"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Street name, building, house number..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ── Payment Method ── */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
              <SectionHeader icon={<CreditCard size={16} />} label="Payment Options" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* COD */}
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-stone-900 bg-stone-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-stone-900"
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Cash on Delivery</p>
                    <p className="text-[11px] text-stone-400">Pay when item arrives</p>
                  </div>
                </label>

                {/* Digital */}
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'digital'
                      ? 'border-stone-900 bg-stone-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="digital"
                    checked={paymentMethod === 'digital'}
                    onChange={() => setPaymentMethod('digital')}
                    className="accent-stone-900"
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Digital Wallet</p>
                    <p className="text-[11px] text-stone-400">eSewa</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Mobile submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:hidden py-3.5 bg-stone-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Processing…'
                : paymentMethod === 'digital'
                ? `Pay with eSewa — Rs. ${totalAmount.toLocaleString()}`
                : `Confirm COD Order — Rs. ${totalAmount.toLocaleString()}`}
            </button>
          </form>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-stone-100">
                Order Summary
              </h2>
                  {singleProduct && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-stone-50 border border-stone-100 rounded-xl">
                    {singleProduct.images?.[0] ? (
                      <img
                        src={singleProduct.images[0]}
                        alt={singleProduct.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-amber-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {singleProduct.name}
                      </p>
                      <p className="text-xs text-stone-400">
                        Rs. {singleProduct.rentalPrice.toLocaleString()}/day
                      </p>
                    </div>
                  </div>
                )}
          

              {/* Line items */}
              <div className="space-y-2 text-sm pb-4 border-b border-stone-100">
                {checkoutType === 'single' && singleProduct && (
                  <div className="flex justify-between text-stone-500">
                    <span>
                      {singleProduct.name}{' '}
                      <span className="text-stone-400">
                        × {singleRentalDays} {singleRentalDays === 1 ? 'day' : 'days'}
                      </span>
                    </span>
                    <span className="font-medium text-stone-800">
                      Rs. {(singleProduct.rentalPrice * singleRentalDays).toLocaleString()}
                    </span>
                  </div>
                )}

                {checkoutType === 'cart' &&
                  cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between text-stone-500">
                      <span className="truncate max-w-[60%]">
                        {item.itemId.title}{' '}
                        <span className="text-stone-400">× {item.rentalDays}d</span>
                      </span>
                      <span className="font-medium text-stone-800">
                        Rs. {(item.itemId.price * item.rentalDays).toLocaleString()}
                      </span>
                    </div>
                  ))}

                <div className="flex justify-between text-stone-500 pt-1">
                  <span>Refundable Security Deposit</span>
                  <span className="font-medium text-stone-800">
                    Rs. {securityDeposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-stone-800">
                    Rs. {deliveryFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Grand total */}
              <div className="flex justify-between items-baseline pt-4 mb-5">
                <span className="text-sm font-semibold text-stone-800">Total Amount</span>
                <span className="text-xl font-black text-stone-900">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Security badge */}
              <div className="flex gap-2.5 bg-stone-50 border border-stone-100 rounded-xl p-3 mb-5">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Your security deposit is fully refundable and returned immediately after
                  the item is checked back in.
                </p>
              </div>

              {/* Desktop submit */}
              <button
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }}
                className="hidden lg:block w-full py-3.5 bg-stone-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Processing…'
                  : paymentMethod === 'digital'
                  ? 'Review & Pay with eSewa'
                  : 'Confirm COD Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;