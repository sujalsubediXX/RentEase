import axios from "axios";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../config/api";
import { ImageSlider } from "./ImageSlider";
interface ItemImage {
  _id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface WishlistItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: ItemImage[];
  availability: "available" | "unavailable" | "rented";
  quantity: number;
  condition: "new" | "like new" | "used";
  location: string;
  // Category
  categoryId?: string;
  categoryName?: string;
}

const USER_ID = "6a2d05276369192a17ffac52";

function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  // ── Fetch wishlist on mount ────────────────────────────────────────────────
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/wishlist/${USER_ID}`);
        setWishlist(res.data?.items || []);
        console.log(res.data)
      } catch (err) {
        console.error(err);
        setError("Could not load your wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // ── Remove single item ─────────────────────────────────────────────────────
  const remove = async (itemId: string) => {
    if (removingId) return;
    setRemovingId(itemId);

    const snapshot = [...wishlist];
    setWishlist((prev) => prev.filter((i) => i._id !== itemId)); // Optimistic

    try {
      await axios.delete(`${API_BASE_URL}/wishlist/${USER_ID}/${itemId}`);
    } catch (err) {
      console.error(err);
      setWishlist(snapshot); // Rollback
    } finally {
      setRemovingId(null);
    }
  };

  // ── Clear all items ────────────────────────────────────────────────────────
  const clearAll = async () => {
    if (!wishlist.length || clearingAll) return;
    setClearingAll(true);

    const snapshot = [...wishlist];
    setWishlist([]); // Optimistic

    try {
      await Promise.all(
        snapshot.map((item) =>
          axios.delete(`${API_BASE_URL}/wishlist/${USER_ID}/${item._id}`)
        )
      );
    } catch (err) {
      console.error(err);
      setWishlist(snapshot); // Rollback
    } finally {
      setClearingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-40 bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-stone-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="h-40 bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-20 bg-stone-100 rounded animate-pulse" />
                <div className="h-5 w-full bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-12 bg-stone-100 rounded animate-pulse" />
                <div className="flex justify-between mt-3">
                  <div className="h-6 w-24 bg-stone-100 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-stone-100 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 mt-12 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-stone-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-amber-500 text-stone-900 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-amber-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">My Wishlist</h1>
          <p className="text-stone-500 mt-1 text-sm">{wishlist.length} items saved</p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={clearAll}
            disabled={clearingAll}
            className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium disabled:opacity-50"
          >
            {clearingAll ? "Clearing..." : "Clear All"}
          </button>
        )}
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
            <div
              key={item._id}
              className={`bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all group ${removingId === item._id ? "opacity-50 scale-95" : ""
                }`}
            >
              {/* Image area */}
              <div className="relative bg-linear-to-br from-amber-50 to-stone-100 h-40 flex items-center justify-center overflow-hidden">
                {/* {getImage(item)} */}
                <ImageSlider images={(item.images).map((img) => `http://localhost:3000${img.imageUrl}`)} />

                {/* Remove button */}
                <button
                  onClick={() => remove(item._id)}
                  disabled={removingId === item._id}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-400 hover:text-red-600 hover:scale-110 transition-all disabled:opacity-50"
                >
                  ❤️
                </button>

                {/* Unavailable overlay */}
                {!item.availability && (
                  <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center rounded-t-2xl">
                    <span className="bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>


              <div className="p-4">

                <h3 className="font-bold text-stone-900 mt-2 text-sm">{item.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs text-stone-600 font-medium">
                    {/* {item.rating?.toFixed(1) ?? "New"} */}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-lg font-bold text-stone-900">
                      Rs. {item.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-400">/day</span>
                  </div>

                  <button
                    disabled={!item.availability}
                    className="bg-amber-500 disabled:bg-stone-200 disabled:text-stone-400 text-stone-900 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    {item.availability ? "Rent Now" : "Notify Me"}
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