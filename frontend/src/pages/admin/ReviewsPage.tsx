import { Star } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { authService } from "../../services/auth.services";
import { ImageSlider } from "../user/ImageSlider";

const STATIC_BASE_URL = "http://localhost:3000";

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([])
  const token = authService.getAccessToken();

  useEffect(() => {
    fetchReview();
  }, [token])

  const fetchReview = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/rating/allReviews`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setReviews(res.data.reviews)
    } catch (error) {
      console.log("Error fetching all reviews")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-bold text-white">Reviews & Ratings</h1>
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className={"flex items-start justify-evenly gap-4 bg-stone-900 rounded-2xl p-5 border border-orange-500"}>
            <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-stone-800">
              <ImageSlider
                images={
                  r.itemID?.images?.map((img: { imageUrl: string }) => `${STATIC_BASE_URL}${img.imageUrl}`) ?? []
                }
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{r.itemID?.title ?? "Item"}</p>
                  <p className="text-xs text-stone-500 mt-0.5">by {r.userID?.fullName ?? "Unknown"}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={13} className={si < r.rating ? "text-amber-400 fill-amber-400" : "text-stone-700"} />
                  ))}

                </div>
              </div>
              <p className="text-sm text-stone-400 mt-3 leading-relaxed">"{r.message}"</p>
              <div className="flex gap-2 mt-4">
                <button className="text-xs px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors">Approve</button>
                <button className="text-xs px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors">Remove</button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )

}