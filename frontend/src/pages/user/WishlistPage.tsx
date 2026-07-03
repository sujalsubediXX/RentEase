import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { ProductCard, type Product } from "../../components/user/ProductCard";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast/headless";
interface ItemImage {
  _id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface WishlistItem {
  _id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  images: ItemImage[];
  availability: "available" | "unavailable" | "rented";
  quantity: number;
}



// Map the API wishlist shape → ProductCard's Product shape
const mapWishlistItemToProduct = (item: WishlistItem): Product => ({
  id: item._id,
  name: item.title,
  description: item.description,
  rentalPrice: item.price,
  images: item.images.map(img => `http://localhost:3000${img.imageUrl}`),
  category: "",
  categoryId: "",
  brand: "",
  rating: 0,
  reviewCount: 0,
  stock: item.availability === "available" ? item.quantity : 0,
  location: "Kathmandu",
});

function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [clearingAll, setClearingAll] = useState(false);
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/wishlist/${user?.id}`);
      setWishlist(res.data?.items || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Called by ProductCard's heart button — always removes (it's already in wishlist)
  const handleToggleWishlist = async (productId: string) => {
    if (removingIds.has(productId)) return;

    setRemovingIds(prev => new Set(prev).add(productId));
    const snapshot = [...wishlist];
    setWishlist(prev => prev.filter(item => item._id !== productId));

    try {
      await axios.delete(`${API_BASE_URL}/wishlist/remove/${user?.id}/${productId}`);
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error(err);
      setWishlist(snapshot);
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const clearAll = async () => {
    if (!wishlist.length || clearingAll) return;
    setClearingAll(true);
    const snapshot = [...wishlist];
    setWishlist([]);
    try {
      await Promise.all(
        snapshot.map(item =>
          axios.delete(`${API_BASE_URL}/wishlist/remove/${user?.id}/${item._id}`)
        )
      );
    } catch (err) {
      console.error(err);
      setWishlist(snapshot);
    } finally {
      setClearingAll(false);
    }
  };

  const handleAddToCart = async (product: Product) => {

    try {
      if (user?.kycStatus !== "verified") {
        toast.error("Please complete KYC verification to add items to cart.");
        return;
      }
      ;

      await axios.post(`${API_BASE_URL}/cart/add/${user?.id}`, {
        itemId: product.id,
        quantity: 1,
        rentalDays: 1,

      });

      toast.success("Added to cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleRentNow = (product: Product) => {
    if (user?.kycStatus !== "verified") {
      toast.error("Please complete KYC verification to rent items.");
      return;
    }
    navigate("/checkout", {
      state: {
        type: "single",
        items: [{ item: product, quantity: 1 }],
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-10">
        <div className="h-36 rounded-3xl bg-stone-100 animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200">
              <div className="aspect-square bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 bg-stone-100 rounded animate-pulse w-2/3" />
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 h-8 bg-stone-100 rounded-xl animate-pulse" />
                  <div className="flex-1 h-8 bg-stone-100 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <h2 className="text-red-500 text-xl font-bold">{error}</h2>
        <button
          onClick={fetchWishlist}
          className="mt-4 px-6 py-2.5 bg-stone-900 text-amber-400 rounded-xl font-semibold hover:bg-amber-500 hover:text-stone-950 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 mt-18">

      {/* Header */}
      <div className="bg-stone-900 rounded-3xl p-8 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">
              My Wishlist <span className="text-amber-400">❤️</span>
            </h1>
            <p className="mt-2 text-stone-400">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={clearAll}
              disabled={clearingAll}
              className="border border-white/20 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 transition-all disabled:opacity-50"
            >
              {clearingAll ? "Clearing..." : "Clear All"}
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-stone-200">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-5 text-3xl">
            💔
          </div>
          <h2 className="text-xl font-semibold text-stone-700 mb-2">Your wishlist is empty</h2>
          <p className="text-stone-400 text-sm mb-6">Save items you love and rent them later.</p>
          <button
            onClick={() => navigate("/categories")}
            className="px-6 py-2.5 bg-stone-900 text-amber-400 rounded-xl font-semibold hover:bg-amber-500 hover:text-stone-950 transition-all shadow-sm"
          >
            Browse Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map(item => (
            <ProductCard
              key={item._id}
              product={mapWishlistItemToProduct(item)}
              index={0}
              isInWishlist={true}        // always true — this is the wishlist page
              onToggleWishlist={handleToggleWishlist}
              onQuickView={() => { }}     // no quick view on wishlist page
              onAddToCart={handleAddToCart}
              onRentNow={handleRentNow}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;