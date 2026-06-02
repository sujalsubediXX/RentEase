import { Star } from "lucide-react";

export const ReviewsPage: React.FC = () => (
  <div className="p-6 space-y-4">
    <h1 className="text-lg font-bold text-white">Reviews & Ratings</h1>
    <div className="space-y-3">
      {[
        { item: "DJI Drone Pro", reviewer: "Aarav Sharma", rating: 5, comment: "Excellent condition, worked perfectly for our wedding shoot!", flagged: false },
        { item: "Camping Tent (6p)", reviewer: "Rohan Kc", rating: 1, comment: "Tent had a broken pole, very disappointed.", flagged: true },
        { item: "Sony A7 III Camera", reviewer: "Bikash Magar", rating: 4, comment: "Great camera, minor scratches on lens but functional.", flagged: false },
        { item: "Electric Scooter", reviewer: "Anita Gurung", rating: 5, comment: "Smooth ride, fully charged on pickup. Highly recommend!", flagged: false },
      ].map((r, i) => (
        <div key={i} className={`bg-stone-900 rounded-2xl p-5 border ${r.flagged ? "border-orange-500/40" : "border-stone-800"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{r.item}</p>
              <p className="text-xs text-stone-500 mt-0.5">by {r.reviewer}</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, si) => (
                <Star key={si} size={13} className={si < r.rating ? "text-amber-400 fill-amber-400" : "text-stone-700"} />
              ))}
              {r.flagged && (
                <span className="ml-2 text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Flagged</span>
              )}
            </div>
          </div>
          <p className="text-sm text-stone-400 mt-3 leading-relaxed">"{r.comment}"</p>
          <div className="flex gap-2 mt-4">
            <button className="text-xs px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors">Approve</button>
            <button className="text-xs px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors">Remove</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
