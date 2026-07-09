import { useEffect, useState } from "react";
import { DollarSign, Package, Users, CalendarCheck, TrendingUp, TrendingDown, AlertTriangle, Star, ChevronRight } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import API_BASE_URL from "../../config/api";

interface DashboardStats {
  totalRevenue: number;
  activeListings: number;
  totalUsers: number;
  bookingsToday: number;
  revenueChange: number;
  listingsChange: number;
  usersChange: number;
  bookingsChange: number;
}

interface RevenueCategory {
  category: string;
  revenue: number;
}

interface Activity {
  text: string;
  time: string;
  type: "user" | "alert" | "payment" | "booking" | "review";
}

interface Booking {
  id: string;
  item: string;
  renter: string;
  owner: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  date: string;
}

interface DashboardData {
  stats: DashboardStats;
  revenueByCategory: RevenueCategory[];
  recentActivity: Activity[];
  recentBookings: Booking[];
}

const getApiUrl = (endpoint: string) => {
  if (API_BASE_URL.endsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/api${endpoint}`;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    confirmed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    completed: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    suspended: "bg-red-500/15 text-red-400 border border-red-500/30",
    cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
    flagged: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    inactive: "bg-stone-600/40 text-stone-400 border border-stone-600/50",
  };
  return map[status] ?? "bg-stone-700 text-stone-300";
};

const formatCurrency = (amount: number) => {
  return `Rs ${amount.toLocaleString()}`;
};

const MiniSparkline: React.FC<{ up: boolean }> = ({ up }) => (
  <svg width="56" height="24" viewBox="0 0 56 24" fill="none" className="opacity-70">
    {up ? (
      <polyline points="0,20 10,16 20,18 30,10 40,8 56,2" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <polyline points="0,4 10,8 20,6 30,14 40,16 56,20" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const RevenueBar: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-stone-500 w-8 shrink-0">{label}</span>
    <div className="flex-1 bg-stone-800 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className="text-xs text-stone-400 w-14 text-right shrink-0">{formatCurrency(value)}</span>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalrevenue] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRevenueData();
  }, [isAuthenticated]);

    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        
        if (!isAuthenticated || !user) {
          toast.error('Please login to view revenue');
          setLoading(false);
          return;
        }
  
        const token = authService.getAccessToken();
        
        if (!token) {
          toast.error('Authentication token not found');
          setLoading(false);
          return;
        }
  
        let payments = [];
        let rentals = [];
  
        // Try to fetch payments first
        try {
          const paymentsResponse = await axios.get(
            getApiUrl('/payment/getpayments'),
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          payments = paymentsResponse.data.data || paymentsResponse.data || [];
          console.log('Payments found:', payments.length);
        } catch (paymentErr) {
          console.log('No payments endpoint or no payments found, using rentals instead');
        }
  
        // If no payments, fetch rentals for revenue data
        if (payments.length === 0) {
          const rentalsResponse = await axios.get(
            getApiUrl('/rentals/filterStatus?status=all'),
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          rentals = rentalsResponse.data.data || rentalsResponse.data || [];
          console.log('Rentals found:', rentals.length);
          
          // Use confirmed/completed rentals as revenue
          const completedRentals = rentals.filter((r: any) => 
            r.status === 'confirmed' || r.status === 'completed' || r.status === 'ongoing'
          );
          
          // Convert rentals to payment-like objects
          payments = completedRentals.map((r: any) => ({
            amount: r.totalPrice || 0,
            status: 'completed',
            createdAt: r.createdAt,
            _id: r._id
          }));
        }
  
        // Filter completed payments
        const completedPayments = payments.filter((p: any) => p.status === 'completed');
  
        // Calculate total revenue
        const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        setTotalrevenue(totalRevenue)
  
       
  
      } catch (err: any) {
        console.error("Error fetching revenue data:", err);
        toast.error(err.response?.data?.message || 'Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };
  

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated || !user) {
        toast.error('Please login to view dashboard');
        setLoading(false);
        return;
      }

      const token = authService.getAccessToken();
      
      if (!token) {
        toast.error('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        getApiUrl('/admin/dashboard'),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to load dashboard');
      }
    } catch (err: any) {
      console.error("Error fetching dashboard:", err);
      toast.error(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertTriangle size={13} />;
      case 'payment': return <DollarSign size={13} />;
      case 'review': return <Star size={13} />;
      case 'booking': return <CalendarCheck size={13} />;
      default: return <Users size={13} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'alert': return 'bg-red-500/15 text-red-400';
      case 'payment': return 'bg-emerald-500/15 text-emerald-400';
      case 'review': return 'bg-amber-500/15 text-amber-400';
      case 'booking': return 'bg-sky-500/15 text-sky-400';
      default: return 'bg-sky-500/15 text-sky-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-stone-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-stone-900 rounded-2xl p-8 text-center border border-stone-800">
          <p className="text-stone-400">No data available</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, revenueByCategory, recentActivity, recentBookings } = data;
  const maxRevenue = Math.max(...revenueByCategory.map(r => r.revenue), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Revenue", 
            value: formatCurrency(totalEarned), 
            change: 33.5, 
            icon: DollarSign, 
            color: "amber" 
          },
          { 
            label: "Active Listings", 
            value: stats.activeListings.toLocaleString(), 
            change: stats.listingsChange, 
            icon: Package, 
            color: "emerald" 
          },
          { 
            label: "Total Users", 
            value: stats.totalUsers.toLocaleString(), 
            change: stats.usersChange, 
            icon: Users, 
            color: "sky" 
          },
          { 
            label: "Bookings Today", 
            value: stats.bookingsToday.toLocaleString(), 
            change: stats.bookingsChange, 
            icon: CalendarCheck, 
            color: "violet" 
          },
        ].map((s) => (
          <div key={s.label} className="bg-stone-900 rounded-2xl p-5 border border-stone-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">{s.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                s.color === "amber" ? "bg-amber-500/15 text-amber-400" : 
                s.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" : 
                s.color === "sky" ? "bg-sky-500/15 text-sky-400" : 
                "bg-violet-500/15 text-violet-400"
              }`}>
                <s.icon size={16} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{s.value}</span>
              <MiniSparkline up={s.change > 0} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${s.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {s.change > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(s.change)}% vs last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue by Category */}
        <div className="xl:col-span-2 bg-stone-900 rounded-2xl p-5 border border-stone-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Revenue by Category</h2>
            <span className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded-lg">All time</span>
          </div>
          <div className="space-y-3.5">
            {revenueByCategory.length > 0 ? (
              revenueByCategory.map((item) => (
                <RevenueBar 
                  key={item.category} 
                  label={item.category.slice(0, 4)} 
                  value={item.revenue} 
                  max={maxRevenue} 
                />
              ))
            ) : (
              <div className="text-center text-stone-500 py-8 text-sm">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${getActivityColor(a.type)}`}>
                    {getActivityIcon(a.type)}
                  </div>
                  <div>
                    <p className="text-xs text-stone-300 leading-snug">{a.text}</p>
                    <p className="text-[11px] text-stone-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-stone-500 py-8 text-sm">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
    <h2 className="text-sm font-semibold text-white">Recent Bookings</h2>
    <Link 
      to="/admin/bookings" 
      className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
    >
      View all <ChevronRight size={12} />
    </Link>
  </div>
        <div className="overflow-x-auto">
          {recentBookings.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  {["ID", "Item", "Renter", "Owner", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="text-left text-xs text-stone-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-stone-800/50 hover:bg-stone-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-stone-500 font-mono text-xs">#{b.id}</td>
                    <td className="px-5 py-3.5 text-stone-200 font-medium">{b.item}</td>
                    <td className="px-5 py-3.5 text-stone-400">{b.renter}</td>
                    <td className="px-5 py-3.5 text-stone-400">{b.owner}</td>
                    <td className="px-5 py-3.5 text-white font-semibold">{formatCurrency(b.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 text-xs">{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-stone-500 py-8 text-sm">
              No bookings yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};