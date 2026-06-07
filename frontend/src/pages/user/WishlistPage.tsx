
import { useState } from "react";
interface WishlistItem {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  rating: number;
  image: string;
  available: boolean;
}
const mockWishlist: WishlistItem[] = [
  { id: 1, name: "Sony A7III Camera", category: "Electronics", pricePerDay: 850, rating: 4.9, image: "📷", available: true },
  { id: 2, name: "DJI Drone Mini 3", category: "Electronics", pricePerDay: 1200, rating: 4.7, image: "🚁", available: false },
  { id: 3, name: "4-Person Camping Tent", category: "Outdoors", pricePerDay: 400, rating: 4.8, image: "⛺", available: true },
  { id: 4, name: "Electric Drill Set", category: "Tools", pricePerDay: 250, rating: 4.6, image: "🔧", available: true },
  { id: 5, name: "Projector 4K", category: "Electronics", pricePerDay: 750, rating: 4.5, image: "📽️", available: true },
];
function WishlistPage() {
  const [wishlist, setWishlist] = useState(mockWishlist);

  const remove = (id: number) => setWishlist((w) => w.filter((i) => i.id !== id));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">My Wishlist</h1>
          <p className="text-stone-500 mt-1 text-sm">{wishlist.length} items saved</p>
        </div>
        <button className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium">
          Clear All
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm mt-1">Browse items and tap the heart to save them</p>
          <button className="mt-6 bg-amber-500 text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm">
            Browse Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all group">
              {/* Image area */}
              <div className="relative bg-linear-to-br from-amber-50 to-stone-100 h-40 flex items-center justify-center text-6xl">
                {item.image}
                <button
                  onClick={() => remove(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-400 hover:text-red-600 hover:scale-110 transition-all"
                >
                  ❤️
                </button>
                {!item.available && (
                  <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center rounded-t-2xl">
                    <span className="bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{item.category}</span>
                <h3 className="font-bold text-stone-900 mt-2 text-sm">{item.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs text-stone-600 font-medium">{item.rating}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-lg font-bold text-stone-900">Rs. {item.pricePerDay}</span>
                    <span className="text-xs text-stone-400">/day</span>
                  </div>
                  <button
                    disabled={!item.available}
                    className="bg-amber-500 disabled:bg-stone-200 disabled:text-stone-400 text-stone-900 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    {item.available ? "Rent Now" : "Notify Me"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;

