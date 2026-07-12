import { useState } from "react";
import type { ComplaintCategory } from "../../types/complaint";
import { complaintService } from "../../services/complaint.service";

interface ComplaintModalProps {
  rentalId: string;
  itemTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: "damage", label: "Item Damaged" },
  { value: "late_return", label: "Late Return" },
  { value: "missing_parts", label: "Missing Parts/Accessories" },
  { value: "uncleaned", label: "Returned Uncleaned" },
  { value: "other", label: "Other" },
];

export default function ComplaintModal({
  rentalId,
  itemTitle,
  onClose,
  onSuccess,
}: ComplaintModalProps) {
  const [category, setCategory] = useState<ComplaintCategory>("damage");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setImages(files);
    setError("");
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Please describe the issue");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await complaintService.fileComplaint(rentalId, category, description, images);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 border border-stone-300 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* punched hole accent */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-stone-950/60 rounded-full" />

        <h2 className="font-serif text-xl text-stone-900 mb-1">Report Item Condition</h2>
        <p className="text-sm text-stone-600 mb-4 border-b border-dashed border-stone-300 pb-3">
          {itemTitle}
        </p>

        <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
          className="w-full mb-3 rounded border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-stone-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Describe the condition issue in detail..."
          className="w-full mb-3 rounded border border-stone-300 bg-white px-3 py-2 text-sm"
        />

        <label className="block text-sm font-medium text-stone-700 mb-1">
          Evidence Photos (optional, max 5)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="w-full mb-3 text-sm"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded border border-stone-300 text-stone-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "File Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
}