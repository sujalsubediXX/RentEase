import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import { authService } from "../../services/auth.services";

type KycStatus = "pending" | "under review" | "verified" | "rejected";

interface KYCDetail {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string };
  personalInfo: {
    fullName: string;
    dob: string;
    gender: string;
    nationality: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  documentInfo: {
    docType: string;
    docNumber: string;
    issuedDate: string;
    expiryDate?: string;
    frontImage: string;
    backImage?: string;
  };
  selfieImage: string;
  status: KycStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}


function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-stone-800 rounded-2xl overflow-hidden">
      <div className="bg-stone-900 border-b border-stone-800 px-5 py-3">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-stone-800/60 last:border-0">
      <span className="text-xs text-stone-500">{label}</span>
      <span className="text-sm font-medium text-white text-right">{value || "—"}</span>
    </div>
  );
}

function ImageCard({ label, src }: { label: string; src?: string }) {
  const [zoomed, setZoomed] = useState(false);
  if (!src) return null;

  return (
    <>
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">{label}</p>
        <button
          onClick={() => setZoomed(true)}
          className="block w-full rounded-xl overflow-hidden border border-stone-800 hover:border-amber-500 transition-colors"
        >
          <img src={src} alt={label} className="w-full h-40 object-cover" />
        </button>
      </div>
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <img src={src} alt={label} className="max-h-[90vh] max-w-full rounded-lg shadow-2xl" />
        </div>
      )}
    </>
  );
}

export default function KYCDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [kyc, setKyc] = useState<KYCDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
      const token = authService.getAccessToken();
  useEffect(() => {
 if(token){
   fetchDetail();

 }
  }, [id, user]);
   const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/kyc/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        if (res.status !== 200) {
          setError(data.message || "Failed to load submission");
          return;
        }
        setKyc(data.data);
      } catch {
        setError("Network error while loading submission");
      } finally {
        setLoading(false);
      }
    };
  const handleDecision = async (decision: "verified" | "rejected") => {
    if (decision === "rejected" && !rejectionReason.trim()) {
      setActionError("Please provide a reason for rejection.");
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const res = await axios.patch(`${API_BASE_URL}/api/kyc/admin/${id}/review`, {
        decision, rejectionReason
      }, {
      headers: { Authorization: `Bearer ${token}` },
    });
      const data = res.data;

      if (res.status !== 200) {
        setActionError(data.message || "Something went wrong");
        return;
      }

    setKyc(data.data);
console.log("KYC status value:", JSON.stringify(data.data.status));

      setShowRejectForm(false);
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-stone-950 text-stone-400 flex items-center justify-center text-sm">Loading submission…</div>;
  }

  if (error || !kyc) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error || "Submission not found"}</p>
          <button onClick={() => navigate("/admin/kycreview")} className="text-amber-400 text-sm font-semibold hover:underline">
            ← Back to KYC list
          </button>
        </div>
      </div>
    );
  }

  const isDecided = kyc.status === "verified" || kyc.status === "rejected";
  const needsBackImage = kyc.documentInfo.docType === "Citizenship Certificate";

  return (
    <div className="min-h-screen bg-stone-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button onClick={() => navigate("/admin/kycreview")} className="text-stone-400 text-sm font-semibold hover:text-white mb-6 inline-flex items-center gap-1">
          ← Back to list
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{kyc.personalInfo.fullName}</h1>
            <p className="text-sm text-stone-400 mt-1">{kyc.user?.email} · Submitted {formatDate(kyc.submittedAt)}</p>
          </div>
      

        </div>

        {/* Already-decided banner */}
        {isDecided && (
          <div className={`mb-6 rounded-xl p-4 border ${kyc.status === "verified" ? "bg-emerald-950/30 border-emerald-900" : "bg-red-950/30 border-red-900"}`}>
            <p className={`text-sm font-semibold ${kyc.status === "verified" ? "text-emerald-300" : "text-red-300"}`}>
              {kyc.status === "verified" ? "This submission was approved" : "This submission was rejected"}
              {kyc.reviewedAt && ` on ${formatDate(kyc.reviewedAt)}`}
            </p>
            {kyc.status === "rejected" && kyc.rejectionReason && (
              <p className="text-sm text-red-200/80 mt-2">Reason: {kyc.rejectionReason}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: info */}
          <div className="lg:col-span-2 space-y-5">
            <Section title="Personal Information">
              <Row label="Full Name" value={kyc.personalInfo.fullName} />
              <Row label="Date of Birth" value={formatDate(kyc.personalInfo.dob)} />
              <Row label="Gender" value={kyc.personalInfo.gender} />
              <Row label="Nationality" value={kyc.personalInfo.nationality} />
              <Row label="Phone" value={kyc.personalInfo.phone} />
              <Row label="Email" value={kyc.personalInfo.email} />
              <Row label="Address" value={kyc.personalInfo.address} />
              <Row label="City" value={kyc.personalInfo.city} />
            </Section>

            <Section title="Identity Document">
              <Row label="Document Type" value={kyc.documentInfo.docType} />
              <Row label="Document Number" value={kyc.documentInfo.docNumber} />
              <Row label="Issue Date" value={formatDate(kyc.documentInfo.issuedDate)} />
              <Row label="Expiry Date" value={formatDate(kyc.documentInfo.expiryDate) || "N/A"} />
            </Section>
          </div>

          {/* Right: images */}
          <div className="space-y-5">
            <Section title="Document & Selfie">
              <div className="space-y-4">
                <ImageCard label="Front Side" src={API_BASE_URL + "/" + kyc.documentInfo.frontImage} />
                {needsBackImage && <ImageCard label="Back Side" src={API_BASE_URL + "/" + kyc.documentInfo.backImage} />}
                <ImageCard label="Selfie" src={API_BASE_URL + "/" + kyc.selfieImage} />
              </div>
            </Section>
          </div>
        </div>

        {/* Actions */}
        {!isDecided && (
          <div className="mt-8 border border-stone-800 rounded-2xl p-6 bg-stone-900/40">
            {actionError && (
              <div className="mb-4 bg-red-950/40 border border-red-900 rounded-xl p-3 text-red-300 text-sm">
                {actionError}
              </div>
            )}

            {!showRejectForm ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDecision("verified")}
                  disabled={submitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 font-bold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  {submitting ? "Approving…" : "✓ Approve KYC"}
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={submitting}
                  className="flex-1 bg-red-500/10 border border-red-500 hover:bg-red-500/20 disabled:opacity-50 text-red-400 font-bold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  ✕ Reject KYC
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Reason for rejection <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document image is blurry, please re-upload a clearer photo"
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                />
                <p className="text-xs text-stone-500">This reason will be shown to the user so they know what to fix.</p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleDecision("rejected")}
                    disabled={submitting || !rejectionReason.trim()}
                    className="flex-1 bg-red-500 hover:bg-red-400 disabled:bg-stone-700 disabled:text-stone-400 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors"
                  >
                    {submitting ? "Rejecting…" : "Confirm Rejection"}
                  </button>
                  <button
                    onClick={() => { setShowRejectForm(false); setRejectionReason(""); setActionError(null); }}
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl text-sm font-semibold text-stone-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}