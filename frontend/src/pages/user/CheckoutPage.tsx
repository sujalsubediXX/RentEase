import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, CreditCard, User, Phone, ShieldCheck, ShoppingBag } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    rentalPrice: number;
    originalPrice?: number;
    images: string[];
    category: string;
    brand: string;
    location: string;
}

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract product passed from state
    const product = location.state?.product as Product;

    // Form states
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [deliveryAddress, setDeliveryAddress] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('cod');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Calculate rental duration in days
    const rentalDays = useMemo(() => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        return differenceInDays > 0 ? differenceInDays : 1;
    }, [startDate, endDate]);

    // Order summary calculations
    const subtotal = product ? product.rentalPrice * rentalDays : 0;
    const securityDeposit = product ? Math.round(product.rentalPrice * 1.5) : 0; // Configurable deposit rule
    const deliveryFee = 150; // Flat fee structure example
    const totalAmount = subtotal + securityDeposit + deliveryFee;

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        if (paymentMethod === 'digital') {
            // Forward everything directly to the eSewa Confirm Booking gateway page
            navigate('/confirm-booking', {
                state: {
                    product,
                    startDate,
                    endDate,
                    fullName,
                    phoneNumber,
                    deliveryAddress,
                    rentalDays
                }
            });
        } else {
            // Handle Cash on Delivery (COD) process right here
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                alert('Order placed successfully via Cash on Delivery! Redirecting you to home.');
                navigate('/');
            }, 2000);
        }
    };

    // Fallback state if user visits /checkout without picking an item
    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-5">
                    <ShoppingBag size={28} className="text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">No item selected for checkout</h3>
                <p className="text-stone-400 text-sm mb-5">Please browse our collection and select a product to rent.</p>
                <Link
                    to="/"
                    className="px-5 py-2.5 bg-stone-900 text-amber-400 rounded-xl font-semibold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-sm"
                >
                    Go to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50/50 text-stone-800 pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-6"
                >
                    <ChevronLeft size={14} /> Back to Products
                </button>

                <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 tracking-tight">Secure Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Checkout Forms */}
                    <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">

                        {/* Rental Duration */}
                        <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                <Calendar size={16} className="text-amber-600" />
                                <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wider">Rental Period</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        disabled={!startDate}
                                        min={startDate}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            {startDate && endDate && (
                                <p className="mt-3 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg w-max">
                                    Total Booking Duration: {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                                </p>
                            )}
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                <User size={16} className="text-amber-600" />
                                <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wider">Delivery Details</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">Phone Number</label>
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
                                        <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">City Location</label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                            <input
                                                type="text"
                                                disabled
                                                value={product.location}
                                                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">Delivery Address</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Street name, building identity, house number..."
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                <CreditCard size={16} className="text-amber-600" />
                                <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wider">Payment Options</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-stone-900 bg-stone-50/50' : 'border-stone-200 hover:border-stone-300'}`}>
                                    <div className="flex items-center gap-3">
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
                                    </div>
                                </label>

                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'digital' ? 'border-stone-900 bg-stone-50/50' : 'border-stone-200 hover:border-stone-300'}`}>
                                    <div className="flex items-center gap-3">
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
                                            <p className="text-[11px] text-stone-400">Fonepay / eSewa / Khalti</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button for Mobile View visibility integration */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full lg:hidden py-3.5 bg-stone-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting 
                                ? 'Processing Order...' 
                                : paymentMethod === 'digital'
                                    ? `Proceed to Confirmation — Rs. ${totalAmount.toLocaleString()}`
                                    : `Confirm COD Order — Rs. ${totalAmount.toLocaleString()}`
                            }
                        </button>
                    </form>

                    {/* Sticky Side Order Summary Panel */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                            <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-stone-100">
                                Order Summary
                            </h2>

                            {/* Product brief layout */}
                            <div className="flex gap-4 mb-5 pb-5 border-b border-stone-100">
                                <div className="w-20 h-20 bg-stone-100 border border-stone-100 rounded-xl overflow-hidden shrink-0">
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{product.brand}</span>
                                    <h3 className="font-semibold text-stone-800 text-sm line-clamp-1 mb-1">{product.name}</h3>
                                    <div className="flex items-center gap-1 text-stone-400">
                                        <MapPin size={11} />
                                        <span className="text-[11px]">{product.location}</span>
                                    </div>
                                    <p className="text-xs font-bold text-stone-900 mt-2">Rs. {product.rentalPrice.toLocaleString()}/day</p>
                                </div>
                            </div>

                            {/* Calculation Line Items */}
                            <div className="space-y-3 text-sm pb-4 border-b border-stone-100">
                                <div className="flex justify-between text-stone-500">
                                    <span>Rental Fees ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</span>
                                    <span className="font-medium text-stone-800">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-stone-500">
                                    <span>Refundable Security Deposit</span>
                                    <span className="font-medium text-stone-800">Rs. {securityDeposit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-stone-500">
                                    <span>Delivery Charge</span>
                                    <span className="font-medium text-stone-800">Rs. {deliveryFee.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Grand Total */}
                            <div className="flex justify-between items-baseline pt-4 mb-6">
                                <span className="text-sm font-semibold text-stone-800">Total Amount</span>
                                <span className="text-xl font-black text-stone-900">Rs. {totalAmount.toLocaleString()}</span>
                            </div>

                            {/* Protection badge info */}
                            <div className="flex gap-2.5 bg-stone-50 border border-stone-100 rounded-xl p-3 mb-6">
                                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-stone-500 leading-relaxed">
                                    Your security deposit is entirely refundable and will be transferred immediately back to your original source upon item pickup check parameters verification.
                                </p>
                            </div>

                            {/* Desktop submit handle */}
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
                                    ? 'Processing Order...' 
                                    : paymentMethod === 'digital'
                                        ? 'Review & Pay with eSewa'
                                        : 'Confirm COD Order'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;