import { useState } from "react";
import {
  Package, CalendarCheck, Star,
  Bell, Search, Plus, ChevronRight,

 ArrowUpRight, ArrowDownRight, Wallet,
  Menu, X, ChevronDown, Upload,

} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

import { useSidebar } from "../../contexts/SidebarContext";


const LISTING_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  PENDING: "pending"
} as const;

const BOOKING_STATUS = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  CANCELLED: "cancelled"
} as const;

type ListingStatus = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];
type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];


interface EarningsData {
  month: string;
  earnings: number;
  bookings: number;
}

interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  unit: string;
  location: string;
  status: ListingStatus;
  rating: number;
  reviews: number;
  views: number;
  bookings: number;
  image: string;
  color: string;
  earnings: number;
}



interface Notification {
  icon: string;
  text: string;
  time: string;
}

interface Review {
  name: string;
  item: string;
  stars: number;
  text: string;
  daysAgo: number;
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  accent: string;
}



interface AddListingModalProps {
  onClose: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const earningsData: EarningsData[] = [
  { month: "Jan", earnings: 3200, bookings: 8 },
  { month: "Feb", earnings: 4100, bookings: 11 },
  { month: "Mar", earnings: 3800, bookings: 9 },
  { month: "Apr", earnings: 5600, bookings: 14 },
  { month: "May", earnings: 4900, bookings: 12 },
  { month: "Jun", earnings: 7200, bookings: 18 },
  { month: "Jul", earnings: 8400, bookings: 21 },
  { month: "Aug", earnings: 7800, bookings: 19 },
  { month: "Sep", earnings: 6500, bookings: 16 },
  { month: "Oct", earnings: 5200, bookings: 13 },
  { month: "Nov", earnings: 4800, bookings: 12 },
  { month: "Dec", earnings: 6100, bookings: 15 },
];

const listings: Listing[] = [
  {
    id: 1, title: "Canon EOS R5 Camera Kit", category: "Electronics",
    price: 85, unit: "day", location: "Kathmandu, Nepal",
    status: LISTING_STATUS.ACTIVE, rating: 4.9, reviews: 34,
    views: 1240, bookings: 28, image: "📷", color: "#dbeafe",
    earnings: 2380,
  },
  {
    id: 2, title: 'MacBook Pro 16" M3', category: "Electronics",
    price: 65, unit: "day", location: "Lalitpur, Nepal",
    status: LISTING_STATUS.ACTIVE, rating: 4.8, reviews: 19,
    views: 876, bookings: 15, image: "💻", color: "#d1fae5",
    earnings: 975,
  },
  {
    id: 3, title: "Trek Mountain Bike", category: "Sports",
    price: 20, unit: "day", location: "Pokhara, Nepal",
    status: LISTING_STATUS.PAUSED, rating: 4.7, reviews: 12,
    views: 540, bookings: 9, image: "🚵", color: "#fef3c7",
    earnings: 180,
  },
  {
    id: 4, title: "DJI Mavic 3 Drone", category: "Electronics",
    price: 120, unit: "day", location: "Bhaktapur, Nepal",
    status: LISTING_STATUS.PENDING, rating: 0, reviews: 0,
    views: 102, bookings: 0, image: "🚁", color: "#fce7f3",
    earnings: 0,
  },
  {
    id: 5, title: "Camping Tent (4-Person)", category: "Outdoors",
    price: 15, unit: "day", location: "Kathmandu, Nepal",
    status: LISTING_STATUS.ACTIVE, rating: 4.6, reviews: 8,
    views: 320, bookings: 6, image: "⛺", color: "#ede9fe",
    earnings: 90,
  },
];



const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, sub, trend, accent }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: accent + "22" }}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-stone-800 tracking-tight">{value}</p>
      <p className="text-sm text-stone-500 mt-0.5">{label}</p>
    </div>
    {sub && <p className="text-xs text-stone-400 border-t border-stone-50 pt-2">{sub}</p>}
  </div>
);


const AddListingModal: React.FC<AddListingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<number>(1);
  const categories: string[] = ["Electronics", "Vehicles", "Sports", "Outdoors", "Tools", "Clothing", "Furniture", "Other"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Add New Listing</h2>
            <p className="text-sm text-stone-400">Step {step} of 3 — {["Basic Info", "Details & Pricing", "Photos"][step - 1]}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4 flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-amber-500" : "bg-stone-100"}`} />
          ))}
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Item Title</label>
                <input className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" placeholder="e.g. Canon EOS R5 Camera Kit" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(c => (
                    <button key={c} className="border border-stone-200 rounded-xl py-2 text-xs text-stone-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors">{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                <textarea rows={3} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="Describe your item…" />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Daily Price (रू)</label>
                  <input type="number" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Weekly Price (रू)</label>
                  <input type="number" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Location</label>
                <input className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Kathmandu, Nepal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Deposit Amount (रू)</label>
                <input type="number" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="0.00" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <input type="checkbox" id="instant" className="accent-amber-500 w-4 h-4" />
                <label htmlFor="instant" className="text-sm text-stone-700">Enable <strong>Instant Booking</strong> (no approval needed)</label>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100">
                  <Upload size={22} className="text-amber-500" />
                </div>
                <p className="text-sm font-medium text-stone-700">Drop photos here or click to upload</p>
                <p className="text-xs text-stone-400 mt-1">PNG, JPG up to 10MB · Minimum 3 photos</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["📷", "🖼️", "🌅"].map((e, i) => (
                  <div key={i} className="aspect-square bg-stone-100 rounded-xl flex items-center justify-center text-2xl relative group">
                    {e}
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <X size={16} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
              Back
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(s => s + 1) : onClose()}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm">
            {step === 3 ? "Publish Listing" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-stone-800 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <p className="font-semibold mb-1">{label}</p>
        <p>Earnings: <span className="text-amber-400 font-bold">रू{payload[0]?.value?.toLocaleString()}</span></p>
        <p>Bookings: <span className="text-sky-400 font-bold">{payload[1]?.value}</span></p>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────


export default function Dashboard() {
  const [showAddListing, setShowAddListing] = useState<boolean>(false);
  const [listingItems, setListingItems] = useState<Listing[]>(listings);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<Listing | null>(null);
  const [chartView, setChartView] = useState<"area" | "bar">("area");



  const totalEarnings: number = listingItems.reduce((s, l) => s + l.earnings, 0);
  const activeCount: number = listingItems.filter(l => l.status === "active").length;
  const totalBookings: number = listingItems.reduce((s, l) => s + l.bookings, 0);
  const avgRating: string = (listingItems.filter(l => l.rating).reduce((s, l, _, a) => s + l.rating / a.length, 0)).toFixed(1);

  const notifications: Notification[] = [
    { icon: "✅", text: "New booking for Canon R5", time: "2m ago" },
    { icon: "⭐", text: "Priya left a 5-star review", time: "1h ago" },
    { icon: "💬", text: "Message from Aarav Sharma", time: "3h ago" },
    { icon: "🕐", text: "Your Trek Bike listing was paused", time: "1d ago" },
  ];

  const latestReviews: Review[] = [
    { name: "Priya T.", item: "MacBook Pro", stars: 5, text: "Excellent condition, super easy to pick up. Highly recommend this owner!", daysAgo: 1 },
    { name: "Aarav S.", item: "Canon EOS R5", stars: 5, text: "Camera was pristine and ready to use. Will definitely rent again for my next shoot.", daysAgo: 4 },
    { name: "Bishal R.", item: "Mountain Bike", stars: 4, text: "Great bike, very smooth ride. Minor scratches but nothing that affects performance.", daysAgo: 11 },
  ];


  const { toggleSidebar } = useSidebar();
  return (
    <>

      <div className="flex-1 flex flex-col overflow-hidden">{
        editItem && (
          "EditItemModal"
        )

      }
        <header className="h-16 bg-white border-b border-stone-100 flex items-center gap-4 px-6 shrink-0">
          <button onClick={toggleSidebar} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-500 transition-colors">
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" placeholder="Search listings, bookings…" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-500 relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 bg-white border border-stone-200 rounded-2xl shadow-xl w-72 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                    <p className="font-semibold text-sm text-stone-800">Notifications</p>
                    <span className="text-xs text-amber-600 font-semibold">3 new</span>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer ${i < 3 ? "bg-amber-50/40" : ""}`}>
                      <span className="text-lg">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-700 font-medium">{n.text}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-100">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                RB
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-stone-800 leading-none">Ramesh B.</p>
                <p className="text-xs text-stone-400 mt-0.5">Owner Account</p>
              </div>
              <ChevronDown size={14} className="text-stone-400" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-stone-800">Good morning, Ramesh! 👋</h1>
              <p className="text-stone-400 text-sm mt-0.5">Here's what's happening with your listings today.</p>
            </div>
            <button onClick={() => setShowAddListing(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-amber-200 transition-colors">
              <Plus size={18} />
              <span>New Listing</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Total Listings" value={listingItems.length} trend={12} accent="#f59e0b" sub={`${activeCount} active · ${listingItems.length - activeCount} inactive`} />
            <StatCard icon={CalendarCheck} label="Total Bookings" value={totalBookings} trend={8} accent="#3b82f6" sub="Last 6 months" />
            <StatCard icon={Wallet} label="Total Earnings" value={`रू${totalEarnings.toLocaleString()}`} trend={21} accent="#10b981" sub="All time net earnings" />
            <StatCard icon={Star} label="Avg. Rating" value={avgRating} trend={0.2} accent="#f43f5e" sub="Based on all reviews" />
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-stone-800">Earnings Overview</h2>
                <p className="text-sm text-stone-400">12-month performance</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setChartView("area")}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${chartView === "area" ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-100"}`}>
                  Area
                </button>
                <button onClick={() => setChartView("bar")}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${chartView === "bar" ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-100"}`}>
                  Bar
                </button>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "area" ? (
                  <AreaChart data={earningsData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} tickFormatter={v => `रू${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={2.5} fill="url(#earningsGrad)" dot={false} />
                    <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fill="url(#bookingsGrad)" dot={false} />
                  </AreaChart>
                ) : (
                  <BarChart data={earningsData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} tickFormatter={v => `रू${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="earnings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

                {/* Reviews Snapshot */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-stone-800">Latest Reviews</h2>
              <button className="text-sm text-amber-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {latestReviews.map((r, i) => (
                <div key={i} className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-stone-300 text-stone-700 text-xs font-bold flex items-center justify-center">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800">{r.name}</p>
                      <p className="text-xs text-stone-400">{r.item}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={11} className={si < r.stars ? "fill-amber-400 text-amber-400" : "text-stone-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{r.text}</p>
                  <p className="text-xs text-stone-300 mt-2">{r.daysAgo === 0 ? "Today" : `${r.daysAgo}d ago`}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {showAddListing && <AddListingModal onClose={() => setShowAddListing(false)} />}
    </>
  );
}