import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar, MapPin, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

interface Product {
    id: string;
    name: string;
    rentalPrice: number;
    images: string[];
    brand: string;
    location: string;
}

interface OrderItem {
    id: string;
    name: string;
    rentalPrice: number;
    images: string[];
    startDate: string;
    endDate: string;
    rentalDays: number;
    quantity: number;
    location?: string;
    brand?: string;
}

interface CheckoutData {
    product?: Product;
    items?: OrderItem[];
    startDate?: string;
    endDate?: string;
    fullName: string;
    phoneNumber: string;
    deliveryAddress: string;
    rentalDays?: number;
    totalAmount?: number;
    subtotal?: number;
    securityDeposit?: number;
    deliveryFee?: number;
    customer?: {
        fullName: string;
        phoneNumber: string;
        deliveryAddress: string;
    };
    paymentMethod?: string;
    type?: 'single' | 'cart';
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
    const { user } = useAuth();
    const checkoutData = location.state as CheckoutData;

    const [loading, setLoading] = useState<boolean>(false);
    const [esewaPayload, setEsewaPayload] = useState<EsewaPayload | null>(null);
    const [gatewayUrl, setGatewayUrl] = useState<string>('');
    const [creatingRental, setCreatingRental] = useState<boolean>(false);
    const [rentalIds, setRentalIds] = useState<string[]>([]);

    // Fallback protection guard routing patterns
    useEffect(() => {
        if (!checkoutData || (!checkoutData.product && !checkoutData.items)) {
            navigate('/');
        }
    }, [checkoutData, navigate]);

    if (!checkoutData || (!checkoutData.product && !checkoutData.items)) {
        return null;
    }

    // ── Get the first product for display (for single item checkout) ──
    const product = checkoutData.product || (checkoutData.items && checkoutData.items[0]);
    
    // ── Use data from checkoutData or fallback ──
    const startDate = checkoutData.startDate || (checkoutData.items && checkoutData.items[0]?.startDate) || '';
    const endDate = checkoutData.endDate || (checkoutData.items && checkoutData.items[0]?.endDate) || '';
    const fullName = checkoutData.customer?.fullName || checkoutData.fullName || user?.fullName || '';
    const phoneNumber = checkoutData.customer?.phoneNumber || checkoutData.phoneNumber || user?.phoneNumber || '';
    const deliveryAddress = checkoutData.customer?.deliveryAddress || checkoutData.deliveryAddress || user?.address || '';
    const rentalDays = checkoutData.rentalDays || (checkoutData.items && checkoutData.items[0]?.rentalDays) || 1;

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">No product data found. Please go back and try again.</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // ── Price calculations ──
    const subtotal = product.rentalPrice * rentalDays;
    const securityDeposit = Math.round(product.rentalPrice * 1.5);
    const deliveryCharge = 150;
    const grandTotal = subtotal + securityDeposit + deliveryCharge;

    // ── Create rental before payment ──
    const createRentalAndInitiatePayment = async () => {
        try {
            setCreatingRental(true);

            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Please login again');
                return;
            }

            // Prepare order data
            const orderData = {
                items: checkoutData.items || [
                    {
                        id: product.id,
                        startDate: startDate,
                        endDate: endDate,
                        rentalDays: rentalDays,
                        quantity: 1
                    }
                ],
                customer: {
                    fullName: fullName,
                    phoneNumber: phoneNumber,
                    deliveryAddress: deliveryAddress
                },
                paymentMethod: 'digital',
                subtotal: subtotal,
                securityDeposit: securityDeposit,
                deliveryFee: deliveryCharge,
                totalAmount: grandTotal,
                type: checkoutData.type || 'single'
            };

            // Create rental
            const response = await axios.post(
                `${API_BASE_URL}/rentals/create`,
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const rentalIds = response.data.data.rentalIds;
                setRentalIds(rentalIds);
                
                // Now initiate payment
                await initiatePayment();
            } else {
                alert('Failed to create rental. Please try again.');
                setCreatingRental(false);
            }
        } catch (error: any) {
            console.error('Error creating rental:', error);
            alert(error.response?.data?.message || 'Failed to create rental');
            setCreatingRental(false);
        }
    };

    // ── Initiate eSewa Payment ──
    const initiatePayment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Please login again');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/payment/initiate`,
                {
                    amount: subtotal,
                    tax_amount: 0,
                    delivery_charge: deliveryCharge,
                    security_deposit: securityDeposit,
                    rentalIds: rentalIds
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const result = response.data;

            if (result.status === 'success') {
                setEsewaPayload(result.payment_payload);
                setGatewayUrl(result.gateway_url);

                // Submit the form to eSewa
                setTimeout(() => {
                    const form = document.getElementById('esewa-form') as HTMLFormElement;
                    if (form) form.submit();
                }, 300);
            } else {
                alert('Failed to initialize payment with eSewa.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Payment initiation error:', err);
            alert(err.response?.data?.message || 'Network error during payment processing.');
            setLoading(false);
        }
    };

    const handleBookingConfirmation = async () => {
        await createRentalAndInitiatePayment();
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
                            {product.images && product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-xl border" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
                                    📦
                                </div>
                            )}
                            <div>
                                <span className="text-[10px] font-bold text-amber-600 uppercase">{product.brand || 'RentEase'}</span>
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
                                    <span className="truncate">{deliveryAddress}, {product.location || 'Kathmandu'}</span>
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
                    disabled={loading || creatingRental}
                    className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creatingRental ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating Rental...
                        </>
                    ) : loading ? (
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