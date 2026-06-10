import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar, MapPin, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    rentalPrice: number;
    images: string[];
    brand: string;
    location: string;
}

interface CheckoutData {
    product: Product;
    startDate: string;
    endDate: string;
    fullName: string;
    phoneNumber: string;
    deliveryAddress: string;
    rentalDays: number;
}

interface EsewaPayload {
    amount: number;
    tax_amount: number;
    product_service_charge: number;
    product_delivery_charge: number;
    total_amount: number;
    transaction_uuid: string;
    product_code: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

const ConfirmBookingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const checkoutData = location.state as CheckoutData;

    const [loading, setLoading] = useState<boolean>(false);
    const [esewaPayload, setEsewaPayload] = useState<EsewaPayload | null>(null);
    const [gatewayUrl, setGatewayUrl] = useState<string>('');

    // Fallback protection guard routing patterns
    useEffect(() => {
        if (!checkoutData || !checkoutData.product) {
            navigate('/');
        }
    }, [checkoutData, navigate]);

    if (!checkoutData) return null;

    const { product, startDate, endDate, fullName, phoneNumber, deliveryAddress, rentalDays } = checkoutData;

    // Breakdown price computations structures
    const subtotal = product.rentalPrice * rentalDays;
    const securityDeposit = Math.round(product.rentalPrice * 1.5);
    const deliveryCharge = 150;
    const grandTotal = subtotal + securityDeposit + deliveryCharge;

    const handleBookingConfirmation = async () => {
        setLoading(true);
        try {
            // 1. Fetch encrypted parameters credentials maps securely from API Backend 
            const response = await fetch('http://localhost:3000/api/payment/esewa/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: subtotal,
                    tax_amount: 0,
                    delivery_charge: deliveryCharge,
                    security_deposit: securityDeposit,
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                setEsewaPayload(result.payment_payload);
                setGatewayUrl(result.gateway_url);

                // 2. Delay slightly to guarantee DOM rendering registers the hidden form elements 
                setTimeout(() => {
                    const form = document.getElementById('esewa-form') as HTMLFormElement;
                    if (form) form.submit();
                }, 300);
            } else {
                alert('Failed to initialize connection interface with eSewa node.');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            alert('Network connectivity loss detected during processing transaction.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50/50 text-stone-800 pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">

                {/* Progress Navigation Header Tracking */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h1 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="text-amber-500" size={20} /> Verify & Confirm Booking
                    </h1>
                    <p className="text-xs text-stone-400">
                        Please perform a final validation pass check on your rental scheduling parameters before connecting with digital processing routing nodes.
                    </p>
                </div>

                {/* Dynamic Parameter Summary Layout Panels */}
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm mb-6">
                    <div className="bg-stone-900 text-amber-400 p-4 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider">Item Breakdown Details</span>
                        <span className="text-xs px-2.5 py-1 bg-stone-800 border border-stone-700 text-stone-300 rounded-lg">
                            {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'} Rental duration
                        </span>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Context Summary Meta Item Card Row Component */}
                        <div className="flex gap-4 pb-4 border-b border-stone-100">
                            <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-xl border" />
                            <div>
                                <span className="text-[10px] font-bold text-amber-600 uppercase">{product.brand}</span>
                                <h3 className="font-semibold text-stone-800 text-sm line-clamp-1">{product.name}</h3>
                                <p className="text-xs font-bold text-stone-900 mt-1">Rs. {product.rentalPrice.toLocaleString()} / day</p>
                            </div>
                        </div>

                        {/* Dates & Logistics Summary Parameters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-4 border-b border-stone-100">
                            <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                <span className="text-stone-400 font-medium block">RENTAL SCHEDULING</span>
                                <div className="flex items-center gap-1.5 font-semibold text-stone-700 mt-1">
                                    <Calendar size={13} className="text-amber-500" />
                                    {startDate} <ArrowRight size={10} /> {endDate}
                                </div>
                            </div>
                            <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                <span className="text-stone-400 font-medium block">DELIVERY LOGISTICS DESTINATION</span>
                                <div className="flex items-center gap-1.5 font-semibold text-stone-700 mt-1">
                                    <MapPin size={13} className="text-amber-500" />
                                    <span className="truncate">{deliveryAddress}, {product.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recipient Verification */}
                        <div className="text-xs space-y-1 text-stone-600">
                            <p><span className="text-stone-400 font-medium">Customer Holder:</span> {fullName}</p>
                            <p><span className="text-stone-400 font-medium">Primary Contact line:</span> {phoneNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Calculation Invoice Line Blocks */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Final Invoice Summary</h3>
                    <div className="space-y-2.5 text-xs pb-3 border-b border-stone-100">
                        <div className="flex justify-between text-stone-500">
                            <span>Rental Processing Fee Base</span>
                            <span className="font-medium text-stone-800">Rs. {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                            <span>Refundable Escrow Security Deposit</span>
                            <span className="font-medium text-stone-800">Rs. {securityDeposit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                            <span>Fulfillment & Delivery Courier logistics</span>
                            <span className="font-medium text-stone-800">Rs. {deliveryCharge.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-baseline pt-3">
                        <span className="text-xs font-bold text-stone-800">Total Digital Invoice Capture</span>
                        <span className="text-lg font-black text-stone-900">Rs. {grandTotal.toLocaleString()}</span>
                    </div>
                </div>

                {/* Security Disclaimers Badge Information element */}
                <div className="flex gap-3 bg-stone-900 text-stone-300 rounded-2xl p-4 mb-6 shadow-md border border-stone-800">
                    <ShieldCheck size={24} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                        By executing payment processing operations below, you authenticate integration routing redirects to secure eSewa Merchant Gateway validation processing centers. Financial asset records metrics execute with standard TLS encryption layers.
                    </p>
                </div>

                {/* Primary Action Button Gate Triggers */}
                <button
                    onClick={handleBookingConfirmation}
                    disabled={loading}
                    className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Securing Gateway Channel...
                        </>
                    ) : (
                        `Pay Securely with eSewa — Rs. ${grandTotal.toLocaleString()}`
                    )}
                </button>

                {/* Hidden Form Required for Post-Initiation Redirect Operations */}
                {esewaPayload && (
                    <form id="esewa-form" action={gatewayUrl} method="POST" className="hidden">
                        {Object.entries(esewaPayload).map(([key, value]) => (
                            <input key={key} type="hidden" name={key} value={value.toString()} />
                        ))}
                    </form>
                )}

            </div>
        </div>
    );
};

export default ConfirmBookingPage;