import { Check, X, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Avatar } from "../../components/owner/Avatar";
import { TopBar } from "../../components/owner/TopBar";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";

type BookingStatus = "pending" | "confirmed" | "ongoing" | "completed" | "cancelled" | "rejected";

interface Booking {
    _id: string;
    itemId: {
        _id: string;
        title: string;
        images?: string[];
        price: number;
        location?: string;
        ownerId?: string | { _id: string; fullName: string; email: string };
    };
    userId: string;
    startDate: string;
    returnDate: string;
    totalPrice: number;
    status: BookingStatus;
    rejectionReason?: string;
    customerDetails: {
        fullName: string;
        phoneNumber: string;
        deliveryAddress: string;
    };
    paymentMethod: "cod" | "digital";
    rentalDays: number;
    quantity: number;
    securityDeposit: number;
    createdAt: string;
}

const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    ongoing: "bg-blue-100 text-blue-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-100 text-red-600",
    rejected: "bg-red-100 text-red-600",
};

// Reject Modal Component
const RejectModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    bookingId,
    updating 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: (bookingId: string, reason: string) => void; 
    bookingId: string;
    updating: boolean;
}) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-stone-900 mb-2">Reject Booking</h3>
                <p className="text-sm text-stone-500 mb-4">Please provide a reason for rejecting this booking.</p>
                
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={4}
                />
                
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(bookingId, reason)}
                        disabled={updating || !reason.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? "Rejecting..." : "Reject Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BookingsPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [tab, setTab] = useState<"all" | BookingStatus>("all");
    const [selected, setSelected] = useState<string | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; bookingId: string | null }>({
        isOpen: false,
        bookingId: null
    });

    // Helper to build API URL with /api prefix
    const getApiUrl = (endpoint: string) => {
        // If API_BASE_URL already ends with /api, don't add it again
        if (API_BASE_URL.endsWith('/api')) {
            return `${API_BASE_URL}${endpoint}`;
        }
        // Otherwise add /api
        return `${API_BASE_URL}/api${endpoint}`;
    };

    const fetchAllBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!isAuthenticated || !user) {
                setError('Please login to view bookings');
                setLoading(false);
                return;
            }

            const token = authService.getAccessToken();
            
            if (!token) {
                setError('Authentication token not found. Please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.get(
                getApiUrl('/rentals/owner?status=all'),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setBookings(response.data.data);
            } else {
                setError("Failed to fetch bookings");
                toast.error("Failed to fetch bookings");
            }
        } catch (err: any) {
            console.error("Error fetching bookings:", err);
            
            if (err.response?.status === 401) {
                setError("Session expired. Please login again.");
                toast.error("Session expired. Please login again.");
            } else {
                setError("Failed to load bookings. Please try again.");
                toast.error("Failed to load bookings. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus, reason?: string) => {
        try {
            setUpdating(bookingId);
            const token = authService.getAccessToken();
            
            if (!token) {
                toast.error('Please login first');
                return;
            }

            if (newStatus === 'rejected') {
                await axios.put(
                    getApiUrl(`/rentals/${bookingId}/cancel`),
                    { 
                        reason: reason || 'No reason provided',
                        action: 'reject'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                toast.success('Booking rejected successfully');
            } else if (newStatus === 'cancelled') {
                await axios.put(
                    getApiUrl(`/rentals/${bookingId}/cancel`),
                    { 
                        reason: reason || 'Cancelled by user or owner',
                        action: 'cancel'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                toast.success('Booking cancelled successfully');
            } else if (newStatus === 'confirmed') {
                await axios.put(
                    getApiUrl('/rentals/approve'),
                    { rentalIds: [bookingId] },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                toast.success('Booking approved successfully');
            }
            
            await fetchAllBookings();
        } catch (err: any) {
            console.error("Error updating booking:", err);
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            } else {
                toast.error(err.response?.data?.message || "Failed to update booking status. Please try again.");
            }
        } finally {
            setUpdating(null);
            setRejectModal({ isOpen: false, bookingId: null });
        }
    };

    useEffect(() => {
        fetchAllBookings();
    }, [isAuthenticated]);

    const filteredBookings = tab === "all" 
        ? bookings 
        : bookings.filter(b => b.status === tab);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDuration = (startDate: string, endDate: string) => {
        const days = Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
            (1000 * 60 * 60 * 24)
        );
        return Math.max(1, days);
    };

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto bg-stone-50">
                <TopBar title="Bookings" subtitle="Manage rental requests and reservations" />
                <div className="p-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                                <p className="mt-4 text-stone-600">Loading bookings...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 overflow-y-auto bg-stone-50">
                <TopBar title="Bookings" subtitle="Manage rental requests and reservations" />
                <div className="p-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
                        <div className="text-center">
                            <p className="text-red-600">{error}</p>
                            <button 
                                onClick={fetchAllBookings}
                                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50">
            <TopBar title="Bookings" subtitle="Manage rental requests and reservations" />
            
            <RejectModal
                isOpen={rejectModal.isOpen}
                onClose={() => setRejectModal({ isOpen: false, bookingId: null })}
                onConfirm={(bookingId, reason) => updateBookingStatus(bookingId, 'rejected', reason)}
                bookingId={rejectModal.bookingId || ''}
                updating={updating === rejectModal.bookingId}
            />

            <div className="p-6 space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-white border border-stone-200 p-1 rounded-xl w-fit overflow-x-auto">
                    {(["all", "pending", "confirmed", "ongoing", "completed", "cancelled", "rejected"] as const).map(t => {
                        const count = t === "all" 
                            ? bookings.length 
                            : bookings.filter(b => b.status === t).length;
                        return (
                            <button 
                                key={t} 
                                onClick={() => setTab(t)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                                    tab === t 
                                        ? "bg-amber-600 text-white shadow-sm" 
                                        : "text-stone-600 hover:bg-stone-50"
                                }`}
                            >
                                {t}
                                <span className="ml-1.5 text-xs opacity-70">({count})</span>
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="divide-y divide-stone-100">
                        {filteredBookings.map((b) => (
                            <div 
                                key={b._id} 
                                className={`p-5 hover:bg-stone-50 transition-colors cursor-pointer ${
                                    selected === b._id ? "bg-amber-50" : ""
                                }`}
                                onClick={() => setSelected(selected === b._id ? null : b._id)}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar 
                                        initials={getInitials(b.customerDetails.fullName)} 
                                        size="md" 
                                        color="bg-stone-600" 
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-stone-800">
                                                {b.customerDetails.fullName}
                                            </p>
                                            <span className="text-stone-300">·</span>
                                            <p className="text-xs text-stone-400 font-mono">
                                                {b._id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                        <p className="text-sm text-stone-500 truncate mt-0.5">
                                            {b.itemId?.title || "Unknown Item"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-400 sm:hidden">
                                            <span>रू {b.totalPrice.toLocaleString()}</span>
                                            <span>·</span>
                                            <span>{formatDate(b.startDate)} → {formatDate(b.returnDate)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-stone-900">
                                            रू {b.totalPrice.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-stone-400">
                                            {formatDate(b.startDate)} → {formatDate(b.returnDate)}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[b.status]}`}>
                                        {b.status}
                                    </span>
                                </div>

                                {selected === b._id && (
                                    <div className="mt-4 pt-4 border-t border-stone-100">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center mb-4">
                                            {[
                                                ["Pickup", formatDate(b.startDate)],
                                                ["Return", formatDate(b.returnDate)],
                                                ["Duration", `${getDuration(b.startDate, b.returnDate)} days`],
                                                ["Quantity", `${b.quantity} item(s)`],
                                                ["Payment", b.paymentMethod.toUpperCase()],
                                                ["Deposit", `रू ${b.securityDeposit.toLocaleString()}`],
                                            ].map(([label, value]) => (
                                                <div key={label} className="bg-stone-50 rounded-xl p-3">
                                                    <p className="text-xs text-stone-400 mb-1">{label}</p>
                                                    <p className="text-sm font-semibold text-stone-700">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {b.customerDetails.deliveryAddress && (
                                            <div className="bg-stone-50 rounded-xl p-3 mb-4">
                                                <p className="text-xs text-stone-500 font-medium mb-1">Delivery Address</p>
                                                <p className="text-sm text-stone-700">{b.customerDetails.deliveryAddress}</p>
                                                <p className="text-xs text-stone-400 mt-1">📞 {b.customerDetails.phoneNumber}</p>
                                            </div>
                                        )}

                                        {b.rejectionReason && (
                                            <div className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
                                                <p className="text-xs text-red-500 font-medium mb-1">Rejection Reason</p>
                                                <p className="text-sm text-red-700">{b.rejectionReason}</p>
                                            </div>
                                        )}

                                        {(b.status === "pending" || b.status === "confirmed") && (
                                            <div className="flex gap-2">
                                                {b.status === "pending" && (
                                                    <>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateBookingStatus(b._id, "confirmed");
                                                            }}
                                                            disabled={updating === b._id}
                                                            className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                                        >
                                                            {updating === b._id ? (
                                                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                            ) : (
                                                                <>
                                                                    <Check size={16} /> Approve
                                                                </>
                                                            )}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setRejectModal({ isOpen: true, bookingId: b._id });
                                                            }}
                                                            disabled={updating === b._id}
                                                            className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                                        >
                                                            <X size={16} /> Decline
                                                        </button>
                                                    </>
                                                )}
                                                {b.status === "confirmed" && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm("Are you sure you want to cancel this confirmed booking?")) {
                                                                updateBookingStatus(b._id, "cancelled");
                                                            }
                                                        }}
                                                        disabled={updating === b._id}
                                                        className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === b._id ? (
                                                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></span>
                                                        ) : (
                                                            <>
                                                                <X size={16} /> Cancel Booking
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {filteredBookings.length === 0 && (
                        <div className="text-center py-16 text-stone-400">
                            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No {tab} bookings</p>
                            {tab === "all" && (
                                <p className="text-sm mt-2">When someone rents your items, they'll appear here</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;