import { useEffect, useState } from "react";
import { DollarSign, Zap, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { getAdminPayments, type PaymentRecord } from "../../services/payment.service";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  shortLabel: string;
}

interface RevenueStats {
  totalRevenue: number;
  platformCommission: number;
  ownerPayouts: number;
  monthlyData: MonthlyRevenue[];
}

export const RevenuePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    platformCommission: 0,
    ownerPayouts: 0,
    monthlyData: []
  });
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated || !user) {
        toast.error('Please login to view revenue');
        setLoading(false);
        return;
      }

      const payments = await getAdminPayments();

      if (payments.length === 0) {
        setStats({
          totalRevenue: 0,
          platformCommission: 0,
          ownerPayouts: 0,
          monthlyData: [],
        });
        return;
      }

      // Filter completed payments
      const completedPayments = payments.filter((p: PaymentRecord) => p.status === 'completed');

      // Calculate total revenue
      const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      // Platform commission (15%)
      const platformCommission = totalRevenue * 0.15;

      // Owner payouts (85%)
      const ownerPayouts = totalRevenue * 0.85;

      // Generate monthly data for the selected year
      const monthlyData = generateMonthlyData(completedPayments, selectedYear);

      setStats({
        totalRevenue,
        platformCommission,
        ownerPayouts,
        monthlyData
      });

    } catch (err: any) {
      console.error("Error fetching revenue data:", err);
      toast.error(err.response?.data?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (payments: PaymentRecord[], year: string): MonthlyRevenue[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue: { [key: string]: number } = {};

    months.forEach(m => monthlyRevenue[m] = 0);

    payments.forEach((payment: PaymentRecord) => {
      if (payment.createdAt) {
        const date = new Date(payment.createdAt);
        const paymentYear = date.getFullYear().toString();
        if (paymentYear === year) {
          const monthKey = months[date.getMonth()];
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (payment.amount || 0);
        }
      }
    });

    return months.map((month) => ({
      month: month,
      shortLabel: month.substring(0, 1),
      revenue: monthlyRevenue[month] || 0
    }));
  };

  useEffect(() => {
    fetchRevenueData();
  }, [isAuthenticated, selectedYear]);

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-stone-400">Loading revenue data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate max revenue for chart
  const maxRevenue = Math.max(...stats.monthlyData.map(m => m.revenue), 1);
  const hasData = stats.totalRevenue > 0 || stats.monthlyData.some(m => m.revenue > 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Revenue Overview</h1>
          <p className="text-xs text-stone-500 mt-0.5">Total earnings and payouts</p>
        </div>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {getAvailableYears().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: "Total Earnings (All Time)", 
            value: hasData ? formatCurrency(stats.totalRevenue) : "No Data", 
            icon: DollarSign, 
            color: "amber" 
          },
          { 
            label: "Platform Commission (15%)", 
            value: hasData ? formatCurrency(stats.platformCommission) : "No Data", 
            icon: Zap, 
            color: "emerald" 
          },
          { 
            label: "Owner Payouts", 
            value: hasData ? formatCurrency(stats.ownerPayouts) : "No Data", 
            icon: Globe, 
            color: "sky" 
          },
        ].map(c => (
          <div key={c.label} className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              c.color === "amber" ? "bg-amber-500/15 text-amber-400" : 
              c.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" : 
              "bg-sky-500/15 text-sky-400"
            }`}>
              <c.icon size={18} />
            </div>
            <p className="text-xs text-stone-500 uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Monthly Revenue ({selectedYear})</h2>
          <span className="text-xs text-stone-500">
            Total: {hasData ? formatCurrency(stats.monthlyData.reduce((sum, m) => sum + m.revenue, 0)) : "No Data"}
          </span>
        </div>
        {hasData ? (
          <div className="flex items-end gap-3 h-40">
            {stats.monthlyData.map((item, i) => {
              const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const isCurrentMonth = i === new Date().getMonth() && parseInt(selectedYear) === new Date().getFullYear();
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div
                    className={`w-full rounded-t-lg transition-all cursor-pointer ${
                      isCurrentMonth ? 'bg-amber-400' : 'bg-amber-500'
                    } hover:bg-amber-400`}
                    style={{ 
                      height: `${Math.max(heightPercent, 2)}%`,
                      minHeight: item.revenue > 0 ? '4px' : '0'
                    }}
                    title={`${item.month}: ${formatCurrency(item.revenue)}`}
                  />
                  <span className={`text-[10px] ${isCurrentMonth ? 'text-amber-400 font-bold' : 'text-stone-600'}`}>
                    {item.shortLabel}
                  </span>
                  {item.revenue > 0 && (
                    <span className="text-[8px] text-stone-500 hidden group-hover:block absolute -mt-8">
                      {formatCurrency(item.revenue)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-stone-500 text-sm">
            No revenue data for {selectedYear}. Start making sales!
          </div>
        )}
      </div>
    </div>
  );
};