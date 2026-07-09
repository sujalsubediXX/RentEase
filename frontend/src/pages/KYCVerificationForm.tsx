import { useState, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config/api';
import axios from "axios";
import { authService } from "../services/auth.services";

type Step = 1 | 2 | 3 | 4;
type Errors = Record<string, string>;

interface PersonalInfo {
  fullName: string;
  dob: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

interface DocumentInfo {
  docType: string;
  docNumber: string;
  issuedDate: string;
  expiryDate: string;
  frontFile: File | null;
  backFile: File | null;
}

interface SelfieInfo {
  selfieFile: File | null;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const PHONE_REGEX = /^(\+977-?)?9\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s.]+$/;
const DOC_TYPES_REQUIRING_BACK = ["Citizenship Certificate"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DOC_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const SELFIE_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

function calculateAge(dobStr: string): number {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function validateFile(file: File | null, allowedTypes: string[], label: string): string | null {
  if (!file) return `${label} is required`;
  if (!allowedTypes.includes(file.type)) {
    return `${label} must be ${allowedTypes.includes("application/pdf") ? "JPG, PNG or PDF" : "JPG or PNG"}`;
  }
  if (file.size > MAX_FILE_SIZE) return `${label} must be under 5MB`;
  return null;
}

function validatePersonal(data: PersonalInfo): Errors {
  const errors: Errors = {};
  const name = data.fullName.trim();
  if (!name || name.length < 3) errors.fullName = "Full name must be at least 3 characters";
  else if (!NAME_REGEX.test(name)) errors.fullName = "Full name can only contain letters and spaces";

  if (!data.dob) errors.dob = "Date of birth is required";
  else {
    const dobDate = new Date(data.dob);
    if (isNaN(dobDate.getTime())) errors.dob = "Enter a valid date";
    else if (dobDate > new Date()) errors.dob = "Date of birth cannot be in the future";
    else if (calculateAge(data.dob) < 18) errors.dob = "You must be at least 18 years old";
  }

  if (!data.gender) errors.gender = "Gender is required";
  if (!data.nationality) errors.nationality = "Nationality is required";

  const phone = data.phone.trim().replace(/\s/g, "");
  if (!phone) errors.phone = "Phone number is required";
  else if (!PHONE_REGEX.test(phone)) errors.phone = "Enter a valid number, e.g. +977-98XXXXXXXX";

  const email = data.email.trim();
  if (!email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address";

  if (!data.address.trim() || data.address.trim().length < 5) errors.address = "Address is required (min 5 characters)";
  if (!data.city) errors.city = "City/District is required";

  return errors;
}

function validateDocument(data: DocumentInfo): Errors {
  const errors: Errors = {};
  if (!data.docType) errors.docType = "Document type is required";

  const docNumber = data.docNumber.trim();
  if (!docNumber || docNumber.length < 4) errors.docNumber = "Enter a valid document number";

  if (!data.issuedDate) errors.issuedDate = "Issue date is required";
  else if (new Date(data.issuedDate) > new Date()) errors.issuedDate = "Issue date cannot be in the future";

  if (data.expiryDate) {
    const expiry = new Date(data.expiryDate);
    if (data.issuedDate && expiry <= new Date(data.issuedDate)) {
      errors.expiryDate = "Expiry date must be after issue date";
    } else if (expiry < new Date()) {
      errors.expiryDate = "This document has expired";
    }
  }

  const frontErr = validateFile(data.frontFile, DOC_FILE_TYPES, "Front image");
  if (frontErr) errors.frontFile = frontErr;

  if (data.docType && DOC_TYPES_REQUIRING_BACK.includes(data.docType)) {
    const backErr = validateFile(data.backFile, DOC_FILE_TYPES, "Back image");
    if (backErr) errors.backFile = backErr;
  }

  return errors;
}

function validateSelfie(data: SelfieInfo): Errors {
  const errors: Errors = {};
  const err = validateFile(data.selfieFile, SELFIE_FILE_TYPES, "Selfie photo");
  if (err) errors.selfieFile = err;
  return errors;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FileDropZone({
  label,
  hint,
  file,
  onChange,
  accept = "image/*",
  error,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File) => void;
  accept?: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onChange(f);
    },
    [onChange]
  );

  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden
          ${dragging ? "border-amber-400 bg-amber-50" : file ? "border-amber-400 bg-amber-50/50" : error ? "border-red-300 bg-red-50/50" : "border-stone-200 hover:border-amber-300 hover:bg-stone-50"}
        `}
        style={{ minHeight: 140 }}
      >
        {preview ? (
          <div className="flex flex-col items-center justify-center p-3 h-full">
            <img src={preview} alt="preview" className="max-h-28 rounded-lg object-cover shadow" />
            <p className="text-xs text-stone-400 mt-2 truncate max-w-45">{file?.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${error ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"}`}>
              📁
            </div>
            <p className="text-sm font-medium text-stone-700">Drop or click to upload</p>
            <p className="text-xs text-stone-400 mt-1">{hint}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

function StepBadge({ step, current, label }: { step: number; current: number; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
        ${done ? "bg-amber-500 text-stone-900" : active ? "bg-stone-900 text-amber-400 ring-2 ring-amber-400 ring-offset-2" : "bg-stone-100 text-stone-400"}
      `}>
        {done ? "✓" : step}
      </div>
      <span className={`text-xs font-medium hidden sm:block ${active ? "text-stone-900" : done ? "text-amber-600" : "text-stone-400"}`}>
        {label}
      </span>
    </div>
  );
}

function InputField({
  label, value, onChange, type = "text", placeholder = "", required = false, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400
          focus:outline-none focus:ring-2 transition-all
          ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"}
        `}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectField({
  label, value, onChange, options, required = false, error,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-stone-900
          focus:outline-none focus:ring-2 transition-all bg-white appearance-none
          ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"}
        `}
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────
function Step1({ data, onChange, errors }: { data: PersonalInfo; onChange: (d: Partial<PersonalInfo>) => void; errors: Errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Personal Information</h2>
        <p className="text-sm text-stone-500 mt-1">Please enter your details exactly as they appear on your ID document.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField label="Full Legal Name" value={data.fullName} onChange={(v) => onChange({ fullName: v })} placeholder="As per citizenship / ID" required error={errors.fullName} />
        </div>
        <InputField label="Date of Birth" value={data.dob} onChange={(v) => onChange({ dob: v })} type="date" required error={errors.dob} />
        <SelectField
          label="Gender" value={data.gender} onChange={(v) => onChange({ gender: v })}
          options={["Male", "Female", "Other", "Prefer not to say"]} required error={errors.gender}
        />
        <SelectField
          label="Nationality" value={data.nationality} onChange={(v) => onChange({ nationality: v })}
          options={["Nepali", "Indian", "Other"]} required error={errors.nationality}
        />
        <InputField label="Phone Number" value={data.phone} onChange={(v) => onChange({ phone: v })} type="tel" placeholder="+977-98XXXXXXXX" required error={errors.phone} />
        <div className="sm:col-span-2">
          <InputField label="Email Address" value={data.email} onChange={(v) => onChange({ email: v })} type="email" placeholder="you@email.com" required error={errors.email} />
        </div>
        <div className="sm:col-span-2">
          <InputField label="Current Address" value={data.address} onChange={(v) => onChange({ address: v })} placeholder="Street, Ward No." required error={errors.address} />
        </div>
        <SelectField
          label="City / District" value={data.city} onChange={(v) => onChange({ city: v })}
          options={["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar", "Butwal", "Dharan", "Other"]} required error={errors.city}
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <span className="text-amber-500 text-lg shrink-0">🔒</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          Your personal information is encrypted and stored securely. It will only be used for identity verification and will never be shared with third parties without your consent.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Document Upload ──────────────────────────────────────────────────
function Step2({ data, onChange, errors }: { data: DocumentInfo; onChange: (d: Partial<DocumentInfo>) => void; errors: Errors }) {
  const docTypes = ["Citizenship Certificate", "Passport", "National ID Card", "Driving License"];
  const needsBack = DOC_TYPES_REQUIRING_BACK.includes(data.docType);

  const handleDocTypeChange = (v: string) => {
    // Clear back file if switching away from a doc type that needs it
    if (!DOC_TYPES_REQUIRING_BACK.includes(v) && data.backFile) {
      onChange({ docType: v, backFile: null });
    } else {
      onChange({ docType: v });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Identity Document</h2>
        <p className="text-sm text-stone-500 mt-1">Upload a valid government-issued photo ID. Make sure it's clear and all corners are visible.</p>
      </div>

      <SelectField
        label="Document Type" value={data.docType} onChange={handleDocTypeChange}
        options={docTypes} required error={errors.docType}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Document Number" value={data.docNumber} onChange={(v) => onChange({ docNumber: v })} placeholder="e.g. 123-456-789" required error={errors.docNumber} />
        <div />
        <InputField label="Issue Date" value={data.issuedDate} onChange={(v) => onChange({ issuedDate: v })} type="date" required error={errors.issuedDate} />
        <InputField label="Expiry Date" value={data.expiryDate} onChange={(v) => onChange({ expiryDate: v })} type="date" error={errors.expiryDate} />
      </div>

      <div className={`grid grid-cols-1 ${needsBack ? "sm:grid-cols-2" : ""} gap-4`}>
        <div className={needsBack ? "" : "sm:max-w-xs"}>
          <FileDropZone
            label="Front Side"
            hint="JPG, PNG or PDF · Max 5MB"
            file={data.frontFile}
            onChange={(f) => onChange({ frontFile: f })}
            error={errors.frontFile}
          />
        </div>
        {needsBack && (
          <FileDropZone
            label="Back Side"
            hint="JPG, PNG or PDF · Max 5MB"
            file={data.backFile}
            onChange={(f) => onChange({ backFile: f })}
            error={errors.backFile}
          />
        )}
      </div>
      {!needsBack && data.docType && (
        <p className="text-xs text-stone-400 -mt-2">
          Only the front side is required for {data.docType}.
        </p>
      )}

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-700 mb-2">📋 Document Requirements</p>
        <ul className="text-xs text-stone-500 space-y-1">
          {[
            "Document must be valid and not expired",
            "All four corners must be clearly visible",
            "No glare, shadows, or blur",
            "File size must be under 5MB",
          ].map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span> {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Step 3: Selfie Verification ─────────────────────────────────────────────
function Step3({ data, onChange, errors }: { data: SelfieInfo; onChange: (d: Partial<SelfieInfo>) => void; errors: Errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Selfie Verification</h2>
        <p className="text-sm text-stone-500 mt-1">Take or upload a clear photo of yourself. This confirms you are the owner of the submitted document.</p>
      </div>

      {/* Instructions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "☀️", label: "Good Lighting", desc: "Face well-lit, no shadows" },
          { icon: "👁️", label: "Eyes Visible", desc: "No sunglasses or hat" },
          { icon: "📐", label: "Centered", desc: "Face fills the frame" },
        ].map((tip) => (
          <div key={tip.label} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{tip.icon}</div>
            <p className="text-xs font-semibold text-stone-800">{tip.label}</p>
            <p className="text-xs text-stone-500 mt-0.5">{tip.desc}</p>
          </div>
        ))}
      </div>

      {/* Selfie Upload */}
      <div className="max-w-xs mx-auto">
        <FileDropZone
          label="Your Selfie Photo"
          hint="Clear photo of your face · JPG or PNG"
          file={data.selfieFile}
          onChange={(f) => onChange({ selfieFile: f })}
          accept="image/*"
          error={errors.selfieFile}
        />
      </div>

      {/* Liveness hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <span className="text-blue-400 text-lg shrink-0">ℹ️</span>
        <div>
          <p className="text-xs font-semibold text-blue-800">Live photo tips</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Look directly at the camera with a neutral expression. Avoid filters or heavy editing. The photo should clearly show your face and match your ID document.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Review & Submit ──────────────────────────────────────────────────
function Step4({
  personal, document: doc, selfie, consent, onConsentChange,
}: {
  personal: PersonalInfo; document: DocumentInfo; selfie: SelfieInfo;
  consent: boolean; onConsentChange: (v: boolean) => void;
}) {
  const selfieSrc = selfie.selfieFile ? URL.createObjectURL(selfie.selfieFile) : null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border border-stone-200 rounded-2xl overflow-hidden">
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-3">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-stone-50 last:border-0">
      <span className="text-xs text-stone-500">{label}</span>
      <span className="text-xs font-semibold text-stone-900 max-w-[55%] text-right truncate">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Review & Submit</h2>
        <p className="text-sm text-stone-500 mt-1">Review your information carefully before submitting. Incorrect details may delay verification.</p>
      </div>

      {/* Selfie Preview */}
      {selfieSrc && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <img src={selfieSrc} alt="selfie" className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow" />
          <div>
            <p className="font-semibold text-stone-900 text-sm">{personal.fullName || "—"}</p>
            <p className="text-xs text-stone-500">{personal.email}</p>
            <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">
              Pending Verification
            </span>
          </div>
        </div>
      )}

      <Section title="Personal Information">
        <Row label="Full Name" value={personal.fullName} />
        <Row label="Date of Birth" value={personal.dob} />
        <Row label="Gender" value={personal.gender} />
        <Row label="Nationality" value={personal.nationality} />
        <Row label="Phone" value={personal.phone} />
        <Row label="Email" value={personal.email} />
        <Row label="Address" value={personal.address} />
        <Row label="City" value={personal.city} />
      </Section>

      <Section title="Identity Document">
        <Row label="Document Type" value={doc.docType} />
        <Row label="Document Number" value={doc.docNumber} />
        <Row label="Issue Date" value={doc.issuedDate} />
        <Row label="Expiry Date" value={doc.expiryDate || "N/A"} />
        <Row label="Front Image" value={doc.frontFile ? doc.frontFile.name : "Not uploaded"} />
        {DOC_TYPES_REQUIRING_BACK.includes(doc.docType) && (
          <Row label="Back Image" value={doc.backFile ? doc.backFile.name : "Not uploaded"} />
        )}
      </Section>

      {/* Consent */}
      <div className="bg-stone-900 rounded-2xl p-5 text-white text-xs leading-relaxed space-y-3">
        <p className="font-semibold text-amber-400">Declaration & Consent</p>
        <p className="text-stone-400">
          By submitting this form, I declare that all information provided is true, accurate, and complete. I consent to RentEase processing my personal data for identity verification purposes as described in the Privacy Policy.
        </p>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 accent-amber-500 w-4 h-4 shrink-0"
          />
          <span className="text-stone-300 group-hover:text-white transition-colors">
            I agree to the <span className="text-amber-400 underline">Terms of Service</span> and <span className="text-amber-400 underline">Privacy Policy</span>, and confirm that the information above is accurate.
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="text-center py-10 space-y-5">
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mx-auto animate-bounce">
        🎉
      </div>
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Submission Received!</h2>
        <p className="text-stone-500 text-sm mt-2 max-w-xs mx-auto">
          Your KYC documents have been submitted. Verification typically takes 1–2 business days.
        </p>
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        {[
          { icon: "📧", label: "Email Confirmation", desc: "Sent to your registered email" },
          { icon: "⏱️", label: "Review Period", desc: "1–2 business days" },
          { icon: "🔔", label: "Notification", desc: "We'll notify you on approval" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-4 text-left">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-stone-800">{item.label}</p>
              <p className="text-xs text-stone-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto text-left">
        <p className="text-xs font-semibold text-amber-800 mb-1">What's next?</p>
        <p className="text-xs text-amber-700">
          Once verified, you'll be able to rent any item on RentEase. You'll receive an email and app notification with the result.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="bg-stone-900 text-amber-400 font-semibold px-6 py-2.5 rounded-xl hover:bg-stone-800 transition-colors text-sm"
      >
        Back to Home
      </button>
    </div>
  );
}

// ─── Main KYC Form ────────────────────────────────────────────────────────────
export default function KYCVerificationForm() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = authService.getAccessToken();
  if (user?.kycStatus === "verified" || user?.kycStatus === "under_review") {
    navigate("/profile");
  }

  const [personal, setPersonal] = useState<PersonalInfo>({
    fullName: "", dob: "", gender: "", nationality: "",
    address: "", city: "", phone: "", email: "",
  });
  const [docInfo, setDocInfo] = useState<DocumentInfo>({
    docType: "", docNumber: "", issuedDate: "", expiryDate: "",
    frontFile: null, backFile: null,
  });
  const [selfie, setSelfie] = useState<SelfieInfo>({ selfieFile: null });

  const [errors1, setErrors1] = useState<Errors>({});
  const [errors2, setErrors2] = useState<Errors>({});
  const [errors3, setErrors3] = useState<Errors>({});

  const steps = [
    { n: 1, label: "Personal Info" },
    { n: 2, label: "Document" },
    { n: 3, label: "Selfie" },
    { n: 4, label: "Review" },
  ];

  const runStepValidation = (s: Step): boolean => {
    if (s === 1) {
      const errs = validatePersonal(personal);
      setErrors1(errs);
      return Object.keys(errs).length === 0;
    }
    if (s === 2) {
      const errs = validateDocument(docInfo);
      setErrors2(errs);
      return Object.keys(errs).length === 0;
    }
    if (s === 3) {
      const errs = validateSelfie(selfie);
      setErrors3(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const handleContinue = () => {
    if (runStepValidation(step)) {
      setStep((s) => ((s + 1) as Step));
    }
  };

  const handleSubmit = async () => {
    const step1Valid = runStepValidation(1);
    const step2Valid = runStepValidation(2);
    const step3Valid = runStepValidation(3);

    if (!step1Valid) { setStep(1); return; }
    if (!step2Valid) { setStep(2); return; }
    if (!step3Valid) { setStep(3); return; }
    if (!consent) { setSubmitError("Please agree to the Terms of Service and Privacy Policy to continue."); return; }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      Object.entries(personal).forEach(([k, v]) => formData.append(k, v));
      formData.append("docType", docInfo.docType);
      formData.append("docNumber", docInfo.docNumber);
      formData.append("issuedDate", docInfo.issuedDate);
      if (docInfo.expiryDate) formData.append("expiryDate", docInfo.expiryDate);
      if (docInfo.frontFile) formData.append("frontImage", docInfo.frontFile);
      if (docInfo.backFile) formData.append("backImage", docInfo.backFile);
      if (selfie.selfieFile) formData.append("selfieImage", selfie.selfieFile);
      console.log(user?.id)
      const res = await axios.post(`${API_BASE_URL}/api/kyc/submit/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = res.data;
      if (res.status !== 200 || data.status !== "success") {
        setSubmitError(data.message || "Something went wrong while submitting your KYC. Please try again.");
        return;
      }
      setTimeout(() => {
        navigate("/profile")
      }, 4000)

      setSubmitted(true);
    } catch (err) {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center px-4 py-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        body, * { font-family: 'DM Sans', sans-serif; }
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-serif text-2xl font-bold mb-1">
            <span className="text-stone-900">Rent</span>
            <span className="text-amber-500">Ease</span>
          </div>
          <h1 className="text-lg font-bold text-stone-900">KYC Verification</h1>
          <p className="text-sm text-stone-500">Complete verification to unlock renting on RentEase</p>
        </div>

        {/* Stepper */}
        {!submitted && (
          <div className="flex items-center mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <StepBadge step={s.n} current={step} label={s.label} />
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded transition-colors duration-300 ${step > s.n ? "bg-amber-400" : "bg-stone-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            {submitted ? (

              <SuccessScreen />




            ) : (
              <>
                {step === 1 && (
                  <Step1
                    data={personal}
                    onChange={(d) => setPersonal((p) => ({ ...p, ...d }))}
                    errors={errors1}
                  />
                )}
                {step === 2 && (
                  <Step2
                    data={docInfo}
                    onChange={(d) => setDocInfo((p) => ({ ...p, ...d }))}
                    errors={errors2}
                  />
                )}
                {step === 3 && (
                  <Step3
                    data={selfie}
                    onChange={(d) => setSelfie((p) => ({ ...p, ...d }))}
                    errors={errors3}
                  />
                )}
                {step === 4 && (
                  <Step4
                    personal={personal}
                    document={docInfo}
                    selfie={selfie}
                    consent={consent}
                    onConsentChange={setConsent}
                  />
                )}
                {submitError && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                    <span className="text-red-500 text-sm shrink-0">⚠️</span>
                    <p className="text-xs text-red-600">{submitError}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Nav */}
          {!submitted && (
            <div className="border-t border-stone-100 px-6 sm:px-8 py-4 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
                disabled={step === 1 || submitting}
                className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>

              <div className="flex items-center gap-1.5">
                {steps.map((s) => (
                  <div
                    key={s.n}
                    className={`rounded-full transition-all duration-300 ${step === s.n ? "w-5 h-2 bg-amber-500" : step > s.n ? "w-2 h-2 bg-amber-300" : "w-2 h-2 bg-stone-200"}`}
                  />
                ))}
              </div>

              {step < 4 ? (
                <button
                  onClick={handleContinue}
                  className="flex items-center gap-2 bg-amber-500 text-stone-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-400 transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !consent}
                  className="flex items-center gap-2 bg-stone-900 disabled:bg-stone-300 text-amber-400 disabled:text-stone-500 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-stone-800 transition-colors disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Submit KYC 🚀"}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          🔒 256-bit encryption · Your data is safe with us
        </p>
      </div>
    </div>
  );
}