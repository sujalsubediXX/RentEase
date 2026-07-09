import { Clock, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { TopBar } from "../../components/owner/TopBar";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import API_BASE_URL from "../../config/api";

type ListingStatus = "active" | "paused" | "rented";

interface Listing {
    id: string;
    title: string;
    category: string;
    price: number;
    priceUnit: string;
    location: string;
    status: ListingStatus;
    rating: number;
    reviews: number;
    bookings: number;
    image: string;
    earnings: number;
}

interface MonthlyEarning {
    month: string;
    val: number;
}

interface EarningsStats {
    thisMonth: number;
    totalEarned: number;
    pendingPayout: number;
    monthlyData: MonthlyEarning[];
    listings: Listing[];
}

//  Helper Functions 
const getApiUrl = (endpoint: string) => {
    if (API_BASE_URL.endsWith('/api')) {
        return `${API_BASE_URL}${endpoint}`;
    }
    return `${API_BASE_URL}/api${endpoint}`;
};

export const Earnings = () => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EarningsStats>({
        thisMonth: 0,
        totalEarned: 0,
        pendingPayout: 0,
        monthlyData: [],
        listings: []
    });
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const getAvailableYears = () => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    };

    const fetchEarningsData = async () => {
        try {
            setLoading(true);
            
            if (!isAuthenticated || !user) {
                toast.error('Please login to view earnings');
                setLoading(false);
                return;
            }

            const token = authService.getAccessToken();
            
            if (!token) {
                toast.error('Authentication token not found');
                setLoading(false);
                return;
            }

            // 1. Fetch owner's items
            const itemsResponse = await axios.get(
                getApiUrl(`/items/getitemsbyownerId/${user.id}`),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 2. Fetch all bookings
            const bookingsResponse = await axios.get(
                getApiUrl('/rentals/filterStatus?status=all'),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const items = itemsResponse.data.data || itemsResponse.data || [];
            const bookings = bookingsResponse.data.data || [];

            const itemMap = new Map();
            items.forEach((item: any) => {
                itemMap.set(item._id.toString(), item);
            });

            const ownerBookings = bookings.filter((booking: any) => {
                let itemId = null;
                if (booking.itemId) {
                    if (typeof booking.itemId === 'string') {
                        itemId = booking.itemId;
                    } else if (typeof booking.itemId === 'object' && booking.itemId._id) {
                        itemId = booking.itemId._id;
                    } else if (typeof booking.itemId === 'object' && booking.itemId.id) {
                        itemId = booking.itemId.id;
                    }
                }
                return itemMap.has(itemId?.toString());
            });

            // Calculate monthly earnings
            const monthlyMap: { [key: string]: number } = {};
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            ownerBookings.forEach((booking: any) => {
                if (booking.createdAt) {
                    const date = new Date(booking.createdAt);
                    const monthKey = months[date.getMonth()];
                    const year = date.getFullYear().toString();
                    
                    if (year === selectedYear) {
                        if (booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'ongoing') {
                            monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + (booking.totalPrice || 0);
                        }
                    }
                }
            });

            const monthlyData = months.map(month => ({
                month,
                val: monthlyMap[month] || 0
            }));

            // Calculate total earnings
            const totalEarned = ownerBookings
                .filter((b: any) => b.status === 'confirmed' || b.status === 'completed' || b.status === 'ongoing')
                .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

            // Calculate this month's earnings
            const currentMonth = new Date().getMonth();
            const currentMonthName = months[currentMonth];
            const thisMonth = monthlyMap[currentMonthName] || 0;

            // Calculate pending payout
            const pendingPayout = ownerBookings
                .filter((b: any) => b.status === 'pending')
                .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

            // Build listings with their earnings
            const listingsWithEarnings = items.map((item: any) => {
                const itemId = item._id.toString();
                
                const itemBookings = ownerBookings.filter((b: any) => {
                    let bookingItemId = null;
                    if (b.itemId) {
                        if (typeof b.itemId === 'string') {
                            bookingItemId = b.itemId;
                        } else if (typeof b.itemId === 'object' && b.itemId._id) {
                            bookingItemId = b.itemId._id;
                        } else if (typeof b.itemId === 'object' && b.itemId.id) {
                            bookingItemId = b.itemId.id;
                        }
                    }
                    return bookingItemId?.toString() === itemId;
                });
                
                const totalBookings = itemBookings.length;
                const earnings = itemBookings
                    .filter((b: any) => b.status === 'confirmed' || b.status === 'completed' || b.status === 'ongoing')
                    .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

                let categoryName = 'Uncategorized';
                if (item.categoryId) {
                    if (typeof item.categoryId === 'object' && item.categoryId.name) {
                        categoryName = item.categoryId.name;
                    } else if (typeof item.categoryId === 'string') {
                        categoryName = item.categoryId;
                    }
                }

                let status: ListingStatus = 'paused';
                if (item.availability === 'available') status = 'active';
                else if (item.availability === 'rented') status = 'rented';

                return {
                    id: item._id.toString(),
                    title: item.title || 'Unknown Item',
                    category: categoryName,
                    price: item.price || 0,
                    priceUnit: 'day',
                    location: item.location || 'N/A',
                    status: status,
                    rating: item.rating || 0,
                    reviews: item.reviews || 0,
                    bookings: totalBookings,
                    image: item.image || '📦',
                    earnings: earnings
                };
            });

            setStats({
                thisMonth,
                totalEarned,
                pendingPayout,
                monthlyData,
                listings: listingsWithEarnings.sort((a: any, b: any) => b.earnings - a.earnings)
            });

        } catch (err: any) {
            console.error("Error fetching earnings data:", err);
            toast.error(err.response?.data?.message || "Failed to load earnings data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarningsData();
    }, [isAuthenticated, selectedYear]);

    const maxVal = Math.max(...stats.monthlyData.map(b => b.val), 1);

    const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString()}`;
    };

    const getMonthName = () => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[new Date().getMonth()];
    };

    if (loading) {
        return (
            <div className="flex-1 h-screen overflow-y-auto bg-stone-50">
                <TopBar title="Earnings" subtitle="Track your rental income" />
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                            <p className="mt-4 text-stone-600">Loading earnings...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-stone-50">
            <TopBar title="Earnings" subtitle="Track your rental income" />
          
            <div className="p-6 space-y-5">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { 
                            label: "This Month", 
                            value: formatCurrency(stats.thisMonth), 
                            sub: `${getMonthName()} ${selectedYear}`, 
                            icon: TrendingUp, 
                            up: stats.thisMonth > 0 
                        },
                        { 
                            label: "Total Earned", 
                            value: formatCurrency(stats.totalEarned), 
                            sub: "All time", 
                            icon: DollarSign, 
                            up: stats.totalEarned > 0 
                        },
                        { 
                            label: "Pending Payout", 
                            value: formatCurrency(stats.pendingPayout), 
                            sub: "Awaiting confirmation", 
                            icon: Clock, 
                            up: null 
                        },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                                <s.icon size={20} />
                            </div>
                            <p className="text-stone-500 text-sm">{s.label}</p>
                            <p className="text-3xl font-black text-stone-900 mt-1">{s.value}</p>
                            <p className="text-xs text-stone-400 mt-1">{s.sub}</p>
                            {s.up !== null && (
                                <p className={`text-xs font-medium mt-2 ${s.up ? "text-emerald-600" : "text-stone-500"}`}>
                                    {s.up ? "↑ Earnings recorded" : "No earnings yet"}
                                </p>
                            )}
                            {s.up === null && stats.pendingPayout > 0 && (
                                <p className="text-xs font-medium mt-2 text-amber-600">
                                    ⏳ {formatCurrency(stats.pendingPayout)} pending
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-stone-800">Monthly Earnings</h3>
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            {getAvailableYears().map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    {stats.monthlyData.some(m => m.val > 0) ? (
                        <div className="flex items-end gap-3 h-40">
                            {stats.monthlyData.map((b, index) => {
                                const isCurrentMonth = index === new Date().getMonth();
                                const heightPercent = maxVal > 0 ? (b.val / maxVal) * 100 : 0;
                                return (
                                    <div key={b.month} className="flex-1 flex flex-col items-center gap-2">
                                        <span className="text-xs text-stone-400">
                                            {b.val > 0 ? `Rs${(b.val / 1000).toFixed(0)}k` : ''}
                                        </span>
                                        <div 
                                            className={`w-full rounded-t-lg transition-opacity hover:opacity-100 ${
                                                isCurrentMonth ? 'bg-amber-600' : 'bg-amber-400'
                                            }`}
                                            style={{ 
                                                height: `${heightPercent}%`,
                                                minHeight: b.val > 0 ? '4px' : '0'
                                            }} 
                                        />
                                        <span className={`text-xs font-medium ${isCurrentMonth ? 'text-amber-600 font-bold' : 'text-stone-500'}`}>
                                            {b.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-stone-400">
                            <p className="text-sm">No earnings data for {selectedYear}</p>
                        </div>
                    )}
                </div>

                {/* Earnings by Listing */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
                    <div className="p-5 border-b border-stone-100">
                        <h3 className="font-bold text-stone-800">Earnings by Listing</h3>
                        <p className="text-sm text-stone-400 mt-0.5">Your top earning items</p>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {stats.listings.length > 0 ? (
                            stats.listings.map(l => {
                                const maxEarning = stats.listings[0]?.earnings || 1;
                                const percentage = maxEarning > 0 ? (l.earnings / maxEarning) * 100 : 0;
                                return (
                                    <div key={l.id} className="flex items-center gap-4 px-5 py-4">
                                        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-xl">
                                            {l.image}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-stone-800 text-sm truncate">{l.title}</p>
                                            <p className="text-xs text-stone-400">
                                                {l.bookings} bookings · {formatCurrency(l.price)}/day
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-stone-900 text-sm">
                                                {formatCurrency(l.earnings)}
                                            </p>
                                            <div className="w-24 bg-stone-100 rounded-full h-1.5 mt-1.5">
                                                <div 
                                                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                                                    style={{ width: `${Math.min(percentage, 100)}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-stone-400">
                                <p>No listings with earnings yet</p>
                                <p className="text-sm mt-1">When you start renting out items, they'll appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};