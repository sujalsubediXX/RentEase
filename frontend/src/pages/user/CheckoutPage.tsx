import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Calendar, MapPin, CreditCard,
  User, Phone, ShieldCheck, ShoppingBag, Package
} from 'lucide-react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import API_BASE_URL from '../../config/api';
import { authService } from '../../services/auth.services';
import { toast } from "sonner";
// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category?: string;
  brand?: string;
  address?: string;
}

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

interface BlockedRange {
  start: Date;
  end: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcDays = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const diff = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff);
};

const toIsoDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isDateBlocked = (date: Date, ranges: BlockedRange[]) =>
  ranges.some((r) => date >= r.start && date <= r.end);

const findNextAvailableDate = (start: Date, ranges: BlockedRange[]): Date => {
  const candidate = new Date(start);
  candidate.setHours(0, 0, 0, 0);
  let guard = 0;
  while (isDateBlocked(candidate, ranges) && guard < 365) {
    candidate.setDate(candidate.getDate() + 1);
    guard++;
  }
  return candidate;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const validatePhone = (value: string): string => {
  if (!value) return 'Phone number is required';
  if (value.length !== 10) return 'Phone number must be exactly 10 digits';
  if (!/^(98|97)/.test(value)) return 'Phone number must start with 98 or 97';
  return '';
};

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

  const singleProduct: Product | null =
    checkoutType === 'single' && rawItems.length > 0
      ? (rawItems[0].item as Product)
      : null;

  const cartItems: CartItem[] =
    checkoutType === 'cart' ? (rawItems as CartItem[]) : [];

  // ── Form state ───────────────────────────────────────────────────────────

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [availLoading, setAvailLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'digital'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = authService.getAccessToken();

  useEffect(() => {
    if (checkoutType !== 'single' || !singleProduct?.id) return;

    const fetchAvailability = async () => {
      try {
        setAvailLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/rentals/availability/${singleProduct.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }
        );
        const ranges: BlockedRange[] = (res.data?.data?.fullyBookedRanges || []).map(
          (r: any) => ({ start: new Date(r.start), end: new Date(r.end) })
        );
        setBlockedRanges(ranges);
        console.log('Fetched blocked ranges:', ranges);

        if (isDateBlocked(today, ranges)) {
          const next = findNextAvailableDate(today, ranges);
          setStartDate(toIsoDate(next));
        }
      } catch (err) {
        console.log('Failed to fetch availability', err);
      } finally {
        setAvailLoading(false);
      }
    };

    fetchAvailability();
  }, [checkoutType, singleProduct?.id]);

  // ── Calculations ─────────────────────────────────────────────────────────

  const singleRentalDays = useMemo(
    () => calcDays(startDate, endDate),
    [startDate, endDate]
  );

  const totalAmount = useMemo(() => {
    if (checkoutType === 'single') {
      return singleProduct ? singleProduct.price * singleRentalDays : 0;
    }
    return cartItems.reduce(
      (acc, item) => acc + item.itemId.price * item.rentalDays,
      0
    );
  }, [checkoutType, singleProduct, singleRentalDays, cartItems]);





  // ── Date change handlers (single flow) ───────────────────────────────────

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    const iso = toIsoDate(date);
    setStartDate(iso);
    if (endDate && iso >= endDate) setEndDate('');
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    setEndDate(toIsoDate(date));
  };

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutType === 'single' && (!startDate || !endDate)) {
      toast.error('Please select rental dates');
      return;
    }

    if (checkoutType === 'single' && startDate && endDate) {
      const s = new Date(startDate);
      const eDate = new Date(endDate);
      const overlaps = blockedRanges.some((r) => s <= r.end && eDate >= r.start);
      if (overlaps) {
        toast.error('Those dates just became unavailable. Please pick different dates.');
        return;
      }
    }

    const phoneValidationError = validatePhone(phoneNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      toast.error(phoneValidationError);
      return;
    }

    const orderData = {
      type: checkoutType,
      items: checkoutType === 'single'
        ? [
          {
            id: singleProduct!.id,
            startDate: startDate,
            endDate: endDate,
            rentalDays: singleRentalDays,
            quantity: 1
          }
        ]
        : cartItems.map((ci) => ({
          id: ci.itemId._id,
          name: ci.itemId.title,
          price: ci.itemId.price,
          startDate: ci.startDate,
          endDate: ci.endDate,
          rentalDays: ci.rentalDays,
          quantity: ci.quantity
        })),
      customer: {
        fullName,
        phoneNumber,
        deliveryAddress
      },
      paymentMethod,
      totalAmount,
    };

  if (paymentMethod === 'digital') {
  const enrichedItems = checkoutType === 'single'
    ? [
        {
          id: singleProduct!.id,
          name: singleProduct!.name,
          price: singleProduct!.price,
          images: singleProduct!.images || [],
          location: singleProduct!.address || 'Kathmandu',
          startDate,
          endDate,
          rentalDays: singleRentalDays,
          quantity: 1,
        },
      ]
    : cartItems.map((ci) => ({
        id: ci.itemId._id,
        name: ci.itemId.title,
        price: ci.itemId.price,
        images: [], // CartItem doesn't carry images today — see note below
        startDate: ci.startDate,
        endDate: ci.endDate,
        rentalDays: ci.rentalDays,
        quantity: ci.quantity,
      }));

  navigate('/confirm-booking', {
    state: {
      items: enrichedItems,
      fullName,
      phoneNumber,
      deliveryAddress,
      totalAmount,
      customer: { fullName, phoneNumber, deliveryAddress },
      paymentMethod,
      type: checkoutType,
    },
  });
  return;
}
    // COD flow - call backend directly
    try {
      setIsSubmitting(true);


      const response = await axios.post(
        `${API_BASE_URL}/api/rentals/create`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );


      if (response.data.success) {
        toast.success('Order placed successfully! Check your rentals.');


        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-800 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">

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

          <form
            onSubmit={handlePlaceOrder}
            className="lg:col-span-7 space-y-6"
          >

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
                    <DatePicker
                      selected={startDate ? new Date(startDate) : null}
                      onChange={handleStartDateChange}
                      excludeDateIntervals={blockedRanges}
                      minDate={today}
                      disabled={availLoading}
                      placeholderText={availLoading ? 'Checking availability…' : 'Select start date'}
                      dateFormat="yyyy-MM-dd"
                      wrapperClassName="w-full"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      Return Date
                    </label>
                    <DatePicker
                      selected={endDate ? new Date(endDate) : null}
                      onChange={handleEndDateChange}
                      excludeDateIntervals={blockedRanges}
                      minDate={startDate ? new Date(startDate) : today}
                      disabled={!startDate || availLoading}
                      placeholderText="Select return date"
                      dateFormat="yyyy-MM-dd"
                      wrapperClassName="w-full"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {blockedRanges.length > 0 && (
                  <p className="mt-3 text-xs text-stone-500">
                    This item is already booked on some dates — those are greyed out above.
                  </p>
                )}

                {startDate && endDate && (
                  <p className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg w-max">
                    {singleRentalDays} {singleRentalDays === 1 ? 'day' : 'days'} rental ·
                    Rs. {(singleProduct!.price * singleRentalDays).toLocaleString()} rental fee
                  </p>
                )}
              </div>
            )}

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
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="98XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhoneNumber(digitsOnly);
                          setPhoneError(digitsOnly.length === 10 ? validatePhone(digitsOnly) : '');
                        }}
                        onBlur={() => setPhoneError(validatePhone(phoneNumber))}
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-1 transition-all ${phoneError
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                          : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/30'
                          }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                    )}
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

            <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
              <SectionHeader icon={<CreditCard size={16} />} label="Payment Options" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod'
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

                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'digital'
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
                      Rs. {singleProduct.price}/day
                    </p>
                  </div>
                </div>
              )}

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
                      Rs. {(singleProduct.price * singleRentalDays).toLocaleString()}
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


              </div>

              <div className="flex justify-between items-baseline pt-4 mb-5">
                <span className="text-sm font-semibold text-stone-800">Total Amount</span>
                <span className="text-xl font-black text-stone-900">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2.5 bg-stone-50 border border-stone-100 rounded-xl p-3 mb-5">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Your security deposit is fully refundable and returned immediately after
                  the item is checked back in.
                </p>
              </div>

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