import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar, MapPin, CheckCircle, ArrowRight, Loader2, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { toast } from "sonner";
// ─── Types ────────────────────────────────────────────────────────────────────

/** A single line item, whether it came from single-item checkout or the cart */
interface CheckoutItem {
    id: string;
    name: string;
    price: number;
    images: string[];
    startDate: string;
    endDate: string;
    rentalDays: number;
    quantity: number;

    location?: string;
}

interface CheckoutData {
    items: CheckoutItem[];
    fullName: string;
    phoneNumber: string;
    deliveryAddress: string;
    totalAmount: number;
    subtotal: number;
    securityDeposit: number;
    deliveryFee: number;
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
    const checkoutData = location.state as CheckoutData | null;
    console.log(checkoutData)

    const [loading, setLoading] = useState<boolean>(false);
    const [esewaPayload, setEsewaPayload] = useState<EsewaPayload | null>(null);
    const [gatewayUrl, setGatewayUrl] = useState<string>('');
    const [creatingRental, setCreatingRental] = useState<boolean>(false);
    const [rentalIds, setRentalIds] = useState<string[]>([]);

    // Fallback protection guard routing patterns
    useEffect(() => {
        if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
            navigate('/');
        }
    }, [checkoutData, navigate]);

    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        return null;
    }

    const items = checkoutData.items;
    console.log(items)
    const isMultiItem = items.length > 1;

    // ── Contact / delivery info ──
    const fullName = checkoutData.customer?.fullName || checkoutData.fullName || user?.fullName || '';
    const phoneNumber = checkoutData.customer?.phoneNumber || checkoutData.phoneNumber || user?.phoneNumber || '';
    const deliveryAddress = checkoutData.customer?.deliveryAddress || checkoutData.deliveryAddress || user?.address || '';

    // ── Trust the totals CheckoutPage already computed across ALL items ──
    // (Recomputing here from a single item was the bug that dropped cart items from the invoice.)
    const subtotal = checkoutData.subtotal;
    const securityDeposit = checkoutData.securityDeposit;
    const deliveryCharge = checkoutData.deliveryFee;
    const grandTotal = checkoutData.totalAmount;

    // ── Create rental before payment ──
    const createRentalAndInitiatePayment = async () => {
        try {
            setCreatingRental(true);

            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please login again');
                return;
            }

            const orderData = {
                items: items.map((it) => ({
                    id: it.id,
                    startDate: it.startDate,
                    endDate: it.endDate,
                    rentalDays: it.rentalDays,
                    quantity: it.quantity,
                })),
                customer: {
                    fullName,
                    phoneNumber,
                    deliveryAddress,
                },
                paymentMethod: 'digital',
                subtotal,
                securityDeposit,
                deliveryFee: deliveryCharge,
                totalAmount: grandTotal,
                type: checkoutData.type || 'single',
            };

            const response = await axios.post(
                `${API_BASE_URL}/rentals/create`,
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                const ids = response.data.data.rentalIds;
                setRentalIds(ids);
                await initiatePayment(ids);
            } else {
                toast.error('Failed to create rental. Please try again.');
                setCreatingRental(false);
            }
        } catch (error: any) {
            console.error('Error creating rental:', error);
            toast.error(error.response?.data?.message || 'Failed to create rental');
            setCreatingRental(false);
        }
    };

    // ── Initiate eSewa Payment ──
    const initiatePayment = async (ids: string[]) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please login again');
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
                    rentalIds: ids,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const result = response.data;

            if (result.status === 'success') {
                setEsewaPayload(result.payment_payload);
                setGatewayUrl(result.gateway_url);

                setTimeout(() => {
                    const form = document.getElementById('esewa-form') as HTMLFormElement;
                    if (form) form.submit();
                }, 300);
            } else {
                toast.error('Failed to initialize payment with eSewa.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Payment initiation error:', err);
            toast.error(err.response?.data?.message || 'Network error during payment processing.');
            setLoading(false);
        }
    };

    const handleBookingConfirmation = async () => {
        await createRentalAndInitiatePayment();
    };

    return (
        <div className="min-h-screen bg-stone-50/50 text-stone-800 pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">

                {/* Header */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h1 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="text-amber-500" size={20} /> Verify & Confirm Booking
                    </h1>
                    <p className="text-xs text-stone-400">
                        Please double-check your rental details below before proceeding to payment.
                    </p>
                </div>

                {/* Item breakdown — supports 1 or many items */}
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm mb-6">
                    <div className="bg-stone-900 text-amber-400 p-4 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isMultiItem ? `Items (${items.length})` : 'Item Breakdown'}
                        </span>
                    </div>

                    <div className="p-5 space-y-4">
                        {items.map((item, idx) => (
                            <div
                                key={`${item.id}-${idx}`}
                                className={`flex gap-4 ${idx < items.length - 1 ? 'pb-4 border-b border-stone-100' : ''}`}
                            >
                                {item.images && item.images.length > 0 ? (
                                    <img
                                        src={item.images[0]}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-xl border shrink-0"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                        <Package size={22} className="text-amber-500" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  
                                    <h3 className="font-semibold text-stone-800 text-sm line-clamp-1">{item.name}</h3>
                                    <p className="text-xs font-bold text-stone-900 mt-1">
                                        Rs. {item.price} / day
                                        {item.quantity > 1 && (
                                            <span className="text-stone-400 font-normal"> × {item.quantity}</span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
                                        <Calendar size={12} className="text-amber-500" />
                                        {item.startDate} <ArrowRight size={9} /> {item.endDate}
                                        <span className="text-stone-400">
                                            ({item.rentalDays} {item.rentalDays === 1 ? 'day' : 'days'})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Delivery & customer info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                            <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                <span className="text-stone-400 font-medium block">DELIVERY ADDRESS</span>
                                <div className="flex items-center gap-1.5 font-semibold text-stone-700 mt-1">
                                    <MapPin size={13} className="text-amber-500" />
                                    <span className="truncate">
                                        {deliveryAddress}, {items[0].location || 'Kathmandu'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                <span className="text-stone-400 font-medium block">CUSTOMER</span>
                                <p className="font-semibold text-stone-700 mt-1">{fullName}</p>
                                <p className="text-stone-500">{phoneNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice summary — uses totals computed once on CheckoutPage across all items */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Final Invoice Summary</h3>
                    <div className="space-y-2.5 text-xs pb-3 border-b border-stone-100">
                        <div className="flex justify-between text-stone-500">
                            <span>Rental Fee{isMultiItem ? ' (all items)' : ''}</span>
                            <span className="font-medium text-stone-800">Rs. {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                            <span>Refundable Security Deposit</span>
                            <span className="font-medium text-stone-800">Rs. {securityDeposit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                            <span>Delivery Charge</span>
                            <span className="font-medium text-stone-800">Rs. {deliveryCharge.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-baseline pt-3">
                        <span className="text-xs font-bold text-stone-800">Total Amount</span>
                        <span className="text-lg font-black text-stone-900">Rs. {grandTotal.toLocaleString()}</span>
                    </div>
                </div>

                {/* Security note */}
                <div className="flex gap-3 bg-stone-900 text-stone-300 rounded-2xl p-4 mb-6 shadow-md border border-stone-800">
                    <ShieldCheck size={24} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                        By proceeding with payment below, you'll be redirected to the secure eSewa payment
                        gateway. All transactions use standard TLS encryption.
                    </p>
                </div>

                {/* Confirm button */}
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

                {/* Hidden auto-submit form for eSewa redirect */}
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