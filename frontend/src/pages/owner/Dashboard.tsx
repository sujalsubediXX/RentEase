import { useState, useEffect } from "react";
import {
  Package,
  CalendarCheck,
  Star,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";
import { toast } from "sonner";
import { TopBar } from "../../components/owner/TopBar";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import API_BASE_URL from "../../config/api";

// ─── Types 
interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  accent: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

interface Review {
  _id: string;
  userID: {
    _id: string;
    fullName?: string;
    profileImage?: string;
  };
  itemID: {
    _id: string;
    title?: string;
  };
  rating: number;
  message: string;
  createdAt: string;
}

interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  distribution: { rating: number; count: number }[];
}

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  totalEarnings: number;
  avgRating: number;
  totalReviews: number;
  monthlyData: Array<{
    month: string;
    earnings: number;
    bookings: number;
  }>;
  recentReviews: Review[];
  recentListings: Array<{
    _id: string;
    title: string;
    price: number;
    status: string;
    bookings: number;
    earnings: number;
  }>;
}

// ─── Helper Functions ─────────────────────────────────────────────────────
const getApiUrl = (endpoint: string) => {
  if (API_BASE_URL.endsWith("/api")) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/api${endpoint}`;
};

// ─── Components ──────────────────────────────────────────────────────────
const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  accent,
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center`}
        style={{ background: accent + "22" }}
      >
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {trend >= 0 ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-stone-800 tracking-tight">
        {value}
      </p>
      <p className="text-sm text-stone-500 mt-0.5">{label}</p>
    </div>
    {sub && (
      <p className="text-xs text-stone-400 border-t border-stone-50 pt-2">
        {sub}
      </p>
    )}
  </div>
);

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-stone-800 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <p className="font-semibold mb-1">{label}</p>
        <p>
          Earnings:{" "}
          <span className="text-amber-400 font-bold">
            Rs {payload[0]?.value?.toLocaleString()}
          </span>
        </p>
        <p>
          Bookings:{" "}
          <span className="text-sky-400 font-bold">{payload[1]?.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

//  Main Dashboard 
export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    totalEarnings: 0,
    avgRating: 0,
    totalReviews: 0,
    monthlyData: [],
    recentReviews: [],
    recentListings: [],
  });
  const [chartView, setChartView] = useState<"area" | "bar">("area");
  const [greeting, setGreeting] = useState("Good morning");

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !user) {
        toast.error("Please login to view dashboard");
        setLoading(false);
        return;
      }

      const token = authService.getAccessToken();

      if (!token) {
        toast.error("Authentication token not found");
        setLoading(false);
        return;
      }

      // 1. Fetch owner's bookings (used for booking count / earnings / chart)
      const itemsResponse = await axios.get(
        getApiUrl("/rentals/owner?status=all"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // 1b. Fetch owner's actual items for real listing counts
      // (mirrors the fetch used on the "My Listings" page)
      let totalListings = 0;
      let activeListings = 0;

      try {
        const listingsRes = await fetch(
          `${API_BASE_URL}/api/items/getitemsbyownerId/${user.id}`
        );
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          const rawItems: any[] = Array.isArray(listingsData)
            ? listingsData
            : listingsData.items ||
              listingsData.data ||
              listingsData.products ||
              [];
          totalListings = rawItems.length;
          activeListings = rawItems.filter(
            (item: any) => item.availability === "available"
          ).length;
        } else {
          console.log(
            "Failed to fetch listings for dashboard:",
            listingsRes.status
          );
        }
      } catch (listingsErr: any) {
        console.log("Listings endpoint not available:", listingsErr.message);
      }

      // 2. Fetch owner's reviews (same endpoints as the Reviews page)
      let reviews: Review[] = [];
      let avgRating = 0;
      let totalReviews = 0;

      try {
        const reviewsResponse = await axios.get(getApiUrl("/rating/owner"), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        reviews = reviewsResponse.data.reviews || [];
      } catch (reviewErr: any) {
        console.log("Reviews endpoint not available:", reviewErr.message);
        // Continue with empty reviews
      }

      try {
        const summaryResponse = await axios.get(
          getApiUrl("/rating/owner/summary"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        avgRating = summaryResponse.data.avgRating || 0;
        totalReviews = summaryResponse.data.totalReviews || 0;
      } catch (summaryErr: any) {
        console.log("Summary endpoint not available:", summaryErr.message);
        // Calculate summary from reviews if available
        if (reviews.length > 0) {
          const totalRating = reviews.reduce(
            (sum: number, r: Review) => sum + r.rating,
            0,
          );
          avgRating = totalRating / reviews.length;
          totalReviews = reviews.length;
        }
      }

      // Process bookings data
      const bookings = itemsResponse.data.data || [];

      const totalBookings = bookings.length;

      const totalEarnings = bookings
        .filter(
          (b: any) =>
            b.status === "confirmed" ||
            b.status === "completed" ||
            b.status === "ongoing",
        )
        .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

      // Generate monthly data
      const monthlyData = generateMonthlyData(bookings);

      // Get recent reviews (limit to 3)
      const recentReviews = reviews.slice(0, 3);

      setStats({
        totalListings,
        activeListings,
        totalBookings,
        totalEarnings,
        avgRating,
        totalReviews,
        monthlyData,
        recentReviews,
        recentListings: [],
      });
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      toast.error(
        err.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate monthly data from bookings
  const generateMonthlyData = (bookings: any[]) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = months.map((month) => ({
      month,
      earnings: 0,
      bookings: 0,
    }));

    bookings.forEach((booking: any) => {
      if (booking.createdAt) {
        const date = new Date(booking.createdAt);
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex].bookings += 1;
          if (
            booking.status === "confirmed" ||
            booking.status === "completed"
          ) {
            monthlyData[monthIndex].earnings += booking.totalPrice || 0;
          }
        }
      }
    });

    return monthlyData;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAuthenticated]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  };

  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={11}
        className={
          i < rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
        }
      />
    ));
  };

  // Get user name for greeting
  const getUserName = () => {
    if (!user) return "Owner";
    return user.fullName || user.email?.split("@")[0] || "Owner";
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto h-screen">
        <TopBar title="Dashboard" />
        <div className="px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-stone-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto h-screen space-y-6">
      <TopBar title="Dashboard" />
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-800">
              {greeting}, {getUserName()}! 👋
            </h1>
            <p className="text-stone-400 text-sm mt-0.5">
              Here's what's happening with your listings today.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Package}
            label="Total Listings"
            value={stats.totalListings}
            accent="#f59e0b"
            sub={`${stats.activeListings} active · ${stats.totalListings - stats.activeListings} inactive`}
          />
          <StatCard
            icon={CalendarCheck}
            label="Total Bookings"
            value={stats.totalBookings}
            accent="#3b82f6"
            sub="All time bookings"
          />
          <StatCard
            icon={Wallet}
            label="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            accent="#10b981"
            sub="Net earnings from confirmed bookings"
          />
          <StatCard
            icon={Star}
            label="Avg. Rating"
            value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
            accent="#f43f5e"
            sub={`Based on ${stats.totalReviews} review${stats.totalReviews !== 1 ? "s" : ""}`}
          />
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-stone-800">
                Earnings Overview
              </h2>
              <p className="text-sm text-stone-400">12-month performance</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartView("area")}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  chartView === "area"
                    ? "bg-stone-800 text-white"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartView("bar")}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  chartView === "bar"
                    ? "bg-stone-800 text-white"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                Bar
              </button>
            </div>
          </div>
          <div className="h-52 w-full" style={{ minHeight: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              {stats.monthlyData.length > 0 ? (
                chartView === "area" ? (
                  <AreaChart
                    data={stats.monthlyData}
                    margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="earningsGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="bookingsGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#a8a29e" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: "#a8a29e" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#a8a29e" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="earnings"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fill="url(#earningsGrad)"
                      dot={false}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="bookings"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#bookingsGrad)"
                      dot={false}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={stats.monthlyData}
                    margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#a8a29e" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#a8a29e" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="earnings"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-stone-400">
                  No data available
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reviews Snapshot */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-stone-800">
              Latest Reviews
            </h2>
            <button className="text-sm text-amber-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div key={review._id} className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-stone-300 text-stone-700 text-xs font-bold flex items-center justify-center">
                      {review.userID?.fullName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800">
                        {review.userID?.fullName || "Anonymous"}
                      </p>
                      <p className="text-xs text-stone-400">
                        {review.itemID?.title || "Unknown Item"}
                      </p>
                    </div>
                    <div className="ml-auto flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {review.message || "No comment provided"}
                  </p>
                  <p className="text-xs text-stone-300 mt-2">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-stone-400">
                <Star size={32} className="mx-auto mb-2 opacity-30" />
                <p>No reviews yet</p>
                <p className="text-sm mt-1">
                  When renters leave reviews, they'll appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}