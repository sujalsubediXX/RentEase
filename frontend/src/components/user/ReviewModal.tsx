import { Star } from "lucide-react";
import  { useState } from "react";
import axios from "axios";
import  { toast } from "sonner";
import API_BASE_URL from "../../config/api";
import { authService } from "../../services/auth.services";

type ReviewModalProps = {
  booking: {
    // itemId: { _id: string };
     _id: string ;
    itemName: string;
  };
  onClose: () => void;
  onSubmitted: () => void;
};

export const ReviewModal = ({ booking, onClose, onSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
const token = authService.getAccessToken();
  const handleSubmit = async () => {
    if (rating === 0) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/rating/reviews`, { rentalId: booking._id, rating, message },{
        headers:{
          "Authorization" :`Bearer ${token}`
        }
      });
      toast.success('Review submitted');
      onSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to submit review');
      console.log(err.response)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-stone-50 rounded-2xl p-6 w-full max-w-md border border-stone-200 shadow-xl">
        <h3 className="font-serif text-xl text-stone-800">
          How was <span className="italic text-amber-700">{booking.itemName}</span>?
        </h3>

        <div className="flex gap-1 my-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star
                size={28}
                className={n <= rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}
              />
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell others about your experience..."
          className="w-full rounded-lg border border-stone-300 p-3 text-sm min-h-25"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-stone-500">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}