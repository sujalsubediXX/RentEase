import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
type KycStatus = "pending" | "under_review" | "verified" | "rejected";
type TabFilter = "all" | KycStatus;
import API_BASE_URL from "../../config/api";
interface KYCListItem {
  _id: string;
  user: { _id: string; name: string; email: string };
  personalInfo: { fullName: string; phone: string };
  documentInfo: { docType: string };
  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
}

interface Counts {
  all: number;
  pending: number;
  under_review: number;
  verified: number;
  rejected: number;
}

const STATUS_CONFIG: Record<KycStatus, { label: string; dot: string; badge: string }> = {
  pending: { label: "Pending", dot: "bg-stone-400", badge: "bg-stone-100 text-stone-600" },
  under_review: { label: "Under Review", dot: "bg-blue-400", badge: "bg-blue-50 text-blue-600" },
  verified: { label: "Approved", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "Rejected", dot: "bg-red-400", badge: "bg-red-50 text-red-600" },
};

const TABS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "verified", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: string }) {

  const cfg = STATUS_CONFIG[status as KycStatus] || { label: "Unknown", dot: "bg-stone-400", badge: "bg-stone-100 text-stone-600" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function Kycreviewpage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [kycs, setKycs] = useState<KYCListItem[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const fetchKYCs = useCallback(async (status: TabFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/kyc/admin`, {
        params: {
          status: status === "all" ? undefined : status,
        },
        headers: { Authorization: `Bearer ${token}` },
      });


      setKycs(res.data.data);
      setCounts(res.data.counts);
    } catch {
      setError("Network error while loading submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKYCs(activeTab);
  }, [activeTab, fetchKYCs]);

  return (
    <div className="min-h-screen bg-stone-950 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">KYC Review</h1>
          <p className="text-sm text-stone-400 mt-1">Verify user identity submissions before they can rent on RentEase.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-stone-800 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = counts ? counts[tab.key] : undefined;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
                  ${isActive ? "border-amber-500 text-amber-400" : "border-transparent text-stone-400 hover:text-stone-200"}
                `}
              >
                {tab.label}
                {count !== undefined && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? "bg-amber-500 text-stone-950" : "bg-stone-800 text-stone-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-stone-500 text-sm">Loading submissions…</div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-900 rounded-xl p-4 text-red-300 text-sm">{error}</div>
        ) : kycs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-stone-400 text-sm">No submissions in this category.</p>
          </div>
        ) : (
          <div className="border border-stone-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-900 text-stone-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-5 py-3 font-semibold">Document</th>
                  <th className="text-left px-5 py-3 font-semibold">Submitted</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {kycs.map((kyc) => (
                  <tr
                    key={kyc._id}
                    onClick={() => navigate(`/admin/kyc/${kyc._id}`)}
                    className="border-t border-stone-800 hover:bg-stone-900/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{kyc.personalInfo.fullName}</p>
                      <p className="text-xs text-stone-500">{kyc.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-stone-300">{kyc.documentInfo.docType}</td>
                    <td className="px-5 py-4 text-stone-400">{formatDate(kyc.submittedAt)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={kyc.status} />
                    </td>
                    <td className="px-5 py-4 text-right text-amber-400 text-xs font-semibold">
                      Review →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}