import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, CreditCard, Eye, Loader2, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { getAdminPayments, type PaymentRecord, type PaymentStatus } from "../../services/payment.service";

const statusBadge = (status: PaymentStatus) => {
  const map: Record<PaymentStatus, string> = {
    completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    failed: "bg-red-500/15 text-red-400 border border-red-500/30",
  };
  return map[status];
};

const methodBadge = (method?: string) => {
  if (!method) return "bg-stone-700 text-stone-300 border border-stone-700";
  return method === "esewa"
    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
    : "bg-stone-700 text-stone-300 border border-stone-700";
};

const formatCurrency = (amount: number) => `Rs ${amount.toLocaleString()}`;

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const records = await getAdminPayments();
      setPayments(records);
    } catch (error: any) {
      console.error("Error fetching payment records:", error);
      toast.error(error?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const statusMatch = statusFilter === "all" || payment.status === statusFilter;
      const userName = typeof payment.userId === "object" ? payment.userId?.fullName || "" : "";
      const userEmail = typeof payment.userId === "object" ? payment.userId?.email || "" : "";
      const searchable = [payment.transactionId, payment.esewaTransactionUuid, payment.paymentMethod, userName, userEmail]
        .join(" ")
        .toLowerCase();

      return statusMatch && searchable.includes(query);
    });
  }, [payments, search, statusFilter]);

  const totals = useMemo(() => {
    const completed = payments.filter((payment) => payment.status === "completed");

    return {
      total: payments.length,
      completed: completed.length,
      pending: payments.filter((payment) => payment.status === "pending").length,
      revenue: completed.reduce((sum, payment) => sum + (payment.amount || 0), 0),
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 text-stone-400 gap-2">
          <Loader2 size={18} className="animate-spin" />
          Loading payment records...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Payments</h1>
          <p className="text-xs text-stone-500 mt-0.5">Stored MongoDB payment records</p>
        </div>
        <button
          onClick={fetchPayments}
          className="px-3 py-2 rounded-xl bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: totals.total, icon: CreditCard, color: "amber" },
          { label: "Completed", value: totals.completed, icon: CheckCircle2, color: "emerald" },
          { label: "Pending", value: totals.pending, icon: Clock3, color: "sky" },
          { label: "Revenue", value: formatCurrency(totals.revenue), icon: CreditCard, color: "violet" },
        ].map((card) => (
          <div key={card.label} className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color === "amber" ? "bg-amber-500/15 text-amber-400" : card.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" : card.color === "sky" ? "bg-sky-500/15 text-sky-400" : "bg-violet-500/15 text-violet-400"}`}>
              <card.icon size={18} />
            </div>
            <p className="text-xs text-stone-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-col md:flex-row">
        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 flex-1">
          <Search size={14} className="text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-stone-300 placeholder-stone-600 text-sm w-full"
            placeholder="Search by transaction id, user, or method..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | PaymentStatus)}
          className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                {[
                  "Transaction",
                  "User",
                  "Amount",
                  "Status",
                  "Method",
                  "Rentals",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="text-left text-xs text-stone-500 font-medium px-5 py-3 whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-stone-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const user = typeof payment.userId === "object" ? payment.userId : undefined;

                  return (
                    <tr key={payment._id} className="border-b border-stone-800/50 hover:bg-stone-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-stone-300 font-mono text-xs whitespace-nowrap">
                        {payment.transactionId}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="text-stone-200 font-medium truncate">{user?.fullName || "Unknown"}</p>
                          <p className="text-xs text-stone-500 truncate">{user?.email || "No email"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-200 font-medium whitespace-nowrap">
                        {formatCurrency(payment.amount || 0)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${methodBadge(payment.paymentMethod)}`}>
                          {payment.paymentMethod || "unknown"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 text-xs whitespace-nowrap">
                        {payment.rentalIds?.length || 0}
                      </td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs whitespace-nowrap">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors"
                        >
                          <Eye size={13} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-stone-800">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Payment details</p>
                <h2 className="text-xl font-bold text-white mt-1 font-mono">{selectedPayment.transactionId}</h2>
                <p className="text-sm text-stone-400">{formatCurrency(selectedPayment.amount || 0)}</p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">User</p>
                  <p className="mt-2 text-sm text-stone-200 font-medium">{typeof selectedPayment.userId === "object" ? selectedPayment.userId?.fullName || "Unknown" : "Unknown"}</p>
                  <p className="text-xs text-stone-500">{typeof selectedPayment.userId === "object" ? selectedPayment.userId?.email || "" : ""}</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Status</p>
                  <p className="mt-2 text-sm text-stone-200">{selectedPayment.status}</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Method</p>
                  <p className="mt-2 text-sm text-stone-200">{selectedPayment.paymentMethod || "unknown"}</p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">eSewa UUID</p>
                  <p className="mt-2 text-sm text-stone-200 font-mono break-all">{selectedPayment.esewaTransactionUuid || selectedPayment.transactionId}</p>
                </div>
              </div>

              <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Rental IDs</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedPayment.rentalIds || []).length > 0 ? (
                    selectedPayment.rentalIds?.map((id) => (
                      <span key={id} className="px-2 py-1 rounded-lg bg-stone-800 text-stone-200 text-xs font-mono">
                        {id}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-stone-400">No linked rentals</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Payment Payload</p>
                <pre className="mt-2 text-xs text-stone-300 whitespace-pre-wrap wrap-break-word bg-stone-950/60 border border-stone-800 rounded-xl p-3 overflow-auto">
                  {JSON.stringify(selectedPayment.paymentDetails || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
