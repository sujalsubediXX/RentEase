import { useState, useEffect, useCallback, useMemo } from "react";
import { Reveal } from "../../config/MotionFunction.tsx";
import axios from "axios";
import API_BASE_URL from "../../config/api.ts";
const AMBER = "#d4922a";
const AMBER_LIGHT = "#e8ac50";
import { useNavigate } from "react-router-dom"
import { toast } from "sonner";
import { ProductCard } from "../../components/user/ProductCard.tsx";
import { X, ShieldCheck, Clock3, MapPin } from "lucide-react";
import { ImageSlider } from "./ImageSlider.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { authService } from "../../services/auth.services.ts";
import type { Product } from "../../types/index.ts";
interface dbCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
  productCount?: number;
}




interface Testimonial {
  text: string;
  name: string;
  role: string;
  initial: string;
  featured?: boolean;
}

// language already established in ProductCard.
function TicketNotch({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50 border border-gray-200 ${side === "left" ? "-left-2" : "-right-2"
        }`}
    />
  );
}

const testimonials: Testimonial[] = [
  {
    text: "Rented a Sony camera for a week-long trek. The whole process was seamless — the owner was super helpful, gear was in perfect condition, and the price was a fraction of buying it.",
    name: "Sita Rai", role: "Travel Photographer, Pokhara", initial: "S", featured: true,
  },
  {
    text: "RentEase saved our company thousands. We needed specialized tools for a one-time project — renting made way more sense than buying. Will use again!",
    name: "Anil Shrestha", role: "Contractor, Kathmandu", initial: "A",
  },
  {
    text: "Party planning was a breeze. Found tables, chairs, a sound system, and fairy lights all in one place. Everything arrived on time and looked great!",
    name: "Priya Thapa", role: "Event Planner, Lalitpur", initial: "P",
  },
];


const popularTags: string[] = ["Camera", "Tent", "Drill", "Projector", "Bike", "Kayak"];

const trustPoints = [
  { icon: ShieldCheck, label: "Verified owners", detail: "KYC-checked before they list" },
  { icon: MapPin, label: "Kathmandu Valley only", detail: "Pickup nearby, not nationwide guesswork" },
  { icon: Clock3, label: "Book by the day", detail: "Rent for one day or several weeks" },
];

// ---- Reusable row for every horizontal product section on the page ----
interface ProductRowProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  products: Product[];
  loading: boolean;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  onQuickView: (p: Product) => void;
  addToCart: (p: Product) => void;
  handleRentNow: (p: Product) => void;
  emptyMessage?: string;
  viewAllHref?: string;
  bg?: "white" | "gray";
}

function ProductRow({
  eyebrow,
  title,
  subtitle,
  products,
  loading,
  wishlist,
  toggleWishlist,
  onQuickView,
  addToCart,
  handleRentNow,
  emptyMessage = "Nothing to show here yet — check back soon.",
  viewAllHref,
  bg = "white",
}: ProductRowProps) {
  // Don't render empty, non-loading rows at all — keeps the homepage from
  // being cluttered with dead sections when a filter has no matches.
  if (!loading && products.length === 0) return null;

  return (
    <section className={`py-24 px-[5vw] ${bg === "gray" ? "bg-gray-50" : "bg-white"}`}>
      <div className="max-w-300 mx-auto">
        <Reveal className="flex items-end justify-between mb-14">
          <div>
            <div className="flex items-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-3">
              <span className="block w-6 h-px bg-amber-400" />{eyebrow}
            </div>
            <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(36px,4.5vw,58px)" }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-500 text-[15px] mt-3 max-w-125">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <a href={viewAllHref} className="text-amber-500 text-[14px] no-underline pb-0.5 border-b border-amber-300 whitespace-nowrap hover:text-amber-600 transition-colors">
              View all →
            </a>
          )}
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-[15px]">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isInWishlist={wishlist.includes(product.id)}
                onToggleWishlist={toggleWishlist}
                onQuickView={onQuickView}
                onAddToCart={addToCart}
                onRentNow={handleRentNow}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Body() {
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState<string>("");

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [itemsLoading, setItemsLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<dbCategory[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const categoryMap = useMemo(
    () => Object.fromEntries(category.map((c) => [c._id, c.name])),
    [category]
  );

  const [wishlistLoading, setWishlistLoading] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const token = authService.getAccessToken();

  const [mostRentedItems, setMostRentedItems] = useState<Product[]>([]);
  const [mostRentedLoading, setMostRentedLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMostRented = async () => {
      setMostRentedLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/items/fetch-most-rented-items`);
        setMostRentedItems(
          res.data.data.map((item: any) => ({
            id: item._id,
            name: item.title,
            description: item.description,
            price: item.price,
            images: Array.isArray(item.images)
              ? item.images.map((img: string) => `${API_BASE_URL}${img}`)
              : [],
            category: categoryMap[item.categoryId] || "",
            categoryId: item.categoryId,
            avgRating: item.avgRating ?? 0,
            reviewCount: item.reviewCount ?? 0,
            rentalUnits: item.rentalUnits ?? 0,
            stock: item.quantity || 0,
            location: item.location,
            createdAt: item.createdAt,
          }))
        );
      } catch (err) {
        console.log(err);
      } finally {
        setMostRentedLoading(false);
      }
    };
    fetchMostRented();
  }, [categoryMap]);

  useEffect(() => {
    if (!user?.id) return;
    fetchWishlist();
  }, [user, isAuthenticated, token]);

  const fetchWishlist = useCallback(async () => {

    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/wishlist/wishitem`, {
        headers: { Authorization: `Bearer ${token}` },
      }
      );

      const ids: string[] = (res.data.items ?? [])
        .map((item: any) =>
          typeof item === "string" ? item : item._id ?? item.id
        )
        .filter(Boolean);

      setWishlist(ids);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }, []);



  const handleRentNow = (product: Product) => {

    if (!isAuthenticated || !user?.id) {
      toast.error("Please login first");
      return;
    }
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



  useEffect(() => {
    const fetchItems = async () => {
      setItemsLoading(true);
      try {
        let res = null;
        if (isAuthenticated && token) {
          res = await axios.get(
            `${API_BASE_URL}/api/items/fetch-user-recommended-items`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          res = await axios.get(
            `${API_BASE_URL}/api/items/fetch-featured-items`
          );
        }

        setItems(
          res.data.data.map((item: any) => ({
            id: item._id,
            name: item.title,
            description: item.description,
            price: item.price,
            images: Array.isArray(item.images)
              ? item.images.map((img: string) => `${API_BASE_URL}${img}`)
              : [],
            category: categoryMap[item.categoryId] || "",
            categoryId: item.categoryId,
            avgRating: item.avgRating ?? 0,
            reviewCount: item.reviewCount ?? 0,
            rentalUnits: item.rentalUnits ?? 0,
            stock: item.quantity || 0,
            location: item.location,
            createdAt: item.createdAt,
          }))
        );
      } catch (err) {
        console.log(err);
      } finally {
        setItemsLoading(false);
      }
    };

    fetchItems();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchCategory = async () => {
      setCategoryLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/category/getcategory`);
        setCategory(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategory();
  }, []);

  const addToCart = async (product: any) => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }
    if (user?.kycStatus !== "verified") {
      toast.error("Please complete KYC verification to add items to cart.");
      return;
    }

    try {
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + 1);

      const payload = {
        itemId: product.id,
        quantity: 1,
        rentalDays: 1,
        startDate: today.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };

      const res = await fetch(
        `${API_BASE_URL}/api/cart/add`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };


  const toggleWishlist = async (productId: string) => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    if (wishlistLoading.has(productId)) return;

    const isInWishlist = wishlist.includes(productId);

    setWishlist((prev) =>
      isInWishlist
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    setWishlistLoading((prev) => new Set(prev).add(productId));

    try {
      if (isInWishlist) {
        await axios.delete(
          `${API_BASE_URL}/api/wishlist/remove/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.error("Removed from wishlist");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/wishlist/add`,
          { itemId: productId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Added to wishlist");
      }
    } catch (err) {
      // rollback
      setWishlist((prev) =>
        isInWishlist
          ? [...prev, productId]
          : prev.filter((id) => id !== productId)
      );
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };



  const popularNearYou = useMemo(() => {
    const userAddress = user?.address?.toLowerCase();
    if (!userAddress) return items.slice(0, 8);
    const nearby = items.filter((i) => i.location?.toLowerCase() === userAddress);
    return (nearby.length > 0 ? nearby : items).slice(0, 8);
  }, [items, user]);

  const recentlyAdded = useMemo(
    () =>
      [...items]
        .sort((a, b) =>
          a.createdAt && b.createdAt
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : 0
        )
        .slice(0, 8),
    [items]
  );

  const budgetRentals = useMemo(
    () => items.filter((i) => i.price < 500).slice(0, 8),
    [items]
  );

  const premiumPicks = useMemo(
    () => [...items].sort((a, b) => b.price - a.price).slice(0, 8),
    [items]
  );

  const weekendEssentials = useMemo(() => {
    const keywords = ["camp", "tent", "party", "outdoor", "bike", "kayak"];
    const matches = items.filter((i) =>
      keywords.some((k) => i.category?.toLowerCase().includes(k) || i.name?.toLowerCase().includes(k))
    );
    return (matches.length > 0 ? matches : items).slice(0, 8);
  }, [items]);

  const seasonalPicks = useMemo(
    () => [...items].reverse().slice(0, 8),
    [items]
  );


  return (
    <div>

      {/* HERO BANNER */}
      <section className="min-h-screen flex flex-col items-center justify-center px-[5vw] pt-28 pb-20 relative overflow-hidden text-center bg-white">


        {/* Quick View Modal */}
        {quickViewProduct && (
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setQuickViewProduct(null)}
          >
            <div
              className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{quickViewProduct.location}</span>
                    <h2 className="text-xl font-bold text-stone-800 mt-0.5">{quickViewProduct.name}</h2>
                  </div>
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    aria-label="Close quick view"
                    className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden mb-5 bg-stone-100 aspect-video">
                  <ImageSlider images={quickViewProduct.images} />
                </div>

                <p className="text-stone-500 mb-5 text-sm leading-relaxed">{quickViewProduct.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Price', value: `Rs ${quickViewProduct.price}` },
                    { label: 'Rating', value: `${quickViewProduct.avgRating} ★` },
                    { label: 'Location', value: quickViewProduct.location },
                    {
                      label: 'Stock',
                      value: quickViewProduct.stock > 0 ? `${quickViewProduct.stock} available` : 'Out of stock',
                      dot: quickViewProduct.stock > 0 ? "bg-emerald-500" : "bg-stone-300",
                    },
                  ].map(({ label, value, dot }) => (
                    <div key={label} className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
                      <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-0.5 text-start">{label}</p>
                      <p className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                        {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  disabled={quickViewProduct.stock === 0}
                  onClick={() => navigate('/checkout', { state: { product: quickViewProduct } })}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all font-mono tracking-tight
                          ${quickViewProduct.stock > 0
                      ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm hover:shadow-md'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                >
                  Rent Now — Rs. {quickViewProduct.price.toLocaleString()}/day
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 hero-grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(212,146,42,0.07) 0%, transparent 70%)" }} />



        <h1 className="anim-1 font-display text-gray-900 font-light leading-none tracking-tight mb-6" style={{ fontSize: "clamp(54px, 8vw, 112px)" }}>
          Rent <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Anything</em>
          <br />You Need, Today
        </h1>

        <p className="anim-2 max-w-130 text-[16px] text-gray-500 leading-relaxed mx-auto mb-10">
          From power tools to party supplies, cameras to camping gear — find exactly what you need without the commitment of buying.
        </p>

        <div className="anim-3 w-full max-w-170">
          <div className="flex items-center bg-white border border-amber-200 rounded-lg overflow-hidden shadow-sm focus-within:border-amber-400 focus-within:shadow-[0_0_0_3px_rgba(212,146,42,0.12)] transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to rent?"
              aria-label="Search for an item to rent"
              className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-gray-800 text-[15px] placeholder-gray-400"
            />
            <div className="w-px h-6 bg-amber-100" />

            <select
              aria-label="Filter by category"
              className="bg-transparent border-none outline-none px-5 py-4 text-gray-500 text-[14px] cursor-pointer whitespace-nowrap"
              onChange={(e) => {
                const value = e.target.value;

                if (value === "all") {
                  navigate("/");
                } else {
                  navigate(`/categories/${value.toLowerCase()}`);
                }
              }}
            >
              <option value="all">All Categories</option>

              {category.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              className="m-1.5 px-6 py-2.5 border-none rounded-md font-semibold text-[14px] cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
              style={{ background: AMBER, color: "#1a1209" }}
            >
              Search
            </button>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap justify-center items-center">
            <span className="text-[12px] text-gray-400">Popular:</span>
            {popularTags.map((t) => (
              <a key={t} href="#" className="text-[12px] text-gray-500 no-underline px-3 py-1 border border-gray-200 rounded-full hover:text-amber-600 hover:border-amber-300 transition-all duration-200">
                {t}
              </a>
            ))}
          </div>

          {/* Trust strip — a receipt-style dashed divider tying back to the
              rental-tag visual language, carrying real reassurance copy
              instead of decorative filler. */}
          <div className="mt-12 pt-8 border-t border-dashed border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {trustPoints.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Icon size={16} style={{ color: AMBER }} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{label}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING CATEGORIES */}
      <section id="categories" className="py-24 px-[5vw] bg-gray-50">
        <div className="max-w-300 mx-auto">
          <Reveal delay={(1 % 3) * 0.1} className="mb-14">
            <div className="flex items-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-3">
              <span className="block w-6 h-px bg-amber-400" />What We Offer
            </div>
            <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(36px,4.5vw,58px)" }}>
              Trending <span style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Categories</span>
            </h2>
            <p className="text-gray-500 text-[15px] mt-3 max-w-125">
              Everything from everyday essentials to specialty gear — discover your next rental.
            </p>
          </Reveal>

          {categoryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 aspect-3/2 bg-white overflow-hidden animate-pulse">
                  <div className="w-full h-full bg-gray-100" />
                </div>
              ))}
            </div>
          ) : category.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-white">
              <p className="text-gray-500 text-[15px]">No categories available yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {category.map((c, i) => (
                <Reveal key={c._id} delay={(i % 3) * 0.1} className={i === 0 ? "md:col-span-2" : ""}>
                  <button
                    type="button"
                    onClick={() => navigate(`/categories/${c._id}`)}
                    aria-label={`Browse ${c.name}`}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-amber-300 hover:-translate-y-1 hover:rotate-[0.5deg] transition-all duration-300 flex flex-col justify-end p-5 group bg-white shadow-sm hover:shadow-md w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${i === 0 ? "min-h-45" : "aspect-3/2"}`}
                  >
                    {/* punched tag hole, top-left, like a real hanging price tag */}
                    <span
                      aria-hidden="true"
                      className="absolute top-3 left-3 z-20 w-3 h-3 rounded-full border-2 border-white/80 group-hover:border-amber-300 transition-colors"
                    />
                    {c.image ? (
                      <>
                        <img
                          src={`${API_BASE_URL}/uploads/categories/${c.image}`}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gray-50" />
                    )}
                    <div className="relative z-10">
                      <div className={`font-display text-[22px] font-normal ${c.image ? "text-white" : "text-gray-800"}`}>
                        {c.name}
                      </div>
                      <div className={`text-[12px] mt-0.5 font-mono ${c.image ? "text-white/80" : "text-gray-400"}`}>
                        {typeof c.productCount === "number" ? `${c.productCount} items available` : "Explore items"}
                      </div>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RECOMMENDED FOR YOU (personalized when logged in, featured otherwise) */}
      <ProductRow
        eyebrow="Top Picks"
        title={<>{isAuthenticated ? "Recommended " : "Featured "}<em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>{isAuthenticated ? "For You" : "Rentals"}</em></>}
        products={items}
        loading={itemsLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        viewAllHref="#"
        emptyMessage="No listings yet — be the first to list an item in your area."
        bg="white"
      />

      {/* MOST RENTED */}
      <ProductRow
        eyebrow="Fan Favorites"
        title={<>Most <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Rented</em></>}
        products={mostRentedItems}
        loading={mostRentedLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        bg="gray"
      />

      {/* POPULAR NEAR YOU */}
      <ProductRow
        eyebrow="Nearby"
        title={<>Popular <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Near You</em></>}
        products={popularNearYou}
        loading={itemsLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        bg="white"
      />

      {/* RECENTLY ADDED */}
      <ProductRow
        eyebrow="Just Listed"
        title={<>Recently <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Added</em></>}
        products={recentlyAdded}
        loading={itemsLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        bg="gray"
      />

      {/* BUDGET RENTALS */}
      <ProductRow
        eyebrow="Easy on the Wallet"
        title={<>Budget <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Rentals</em></>}
        subtitle="Quality gear under Rs. 500/day."
        products={budgetRentals}
        loading={itemsLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        emptyMessage="No budget listings under Rs. 500/day right now."
        bg="white"
      />

      {/* PREMIUM PICKS */}
      <ProductRow
        eyebrow="Top Shelf"
        title={<>Premium <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Picks</em></>}
        products={premiumPicks}
        loading={itemsLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        bg="gray"
      />

      {/* WEEKEND ESSENTIALS */}
      <ProductRow
        eyebrow="Plan Your Weekend"
        title={<>Weekend <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Essentials</em></>}
        products={weekendEssentials}
        loading={itemsLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        bg="white"
      />

      {/* SEASONAL PICKS */}
      <ProductRow
        eyebrow="Right Now"
        title={<>Seasonal <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Picks</em></>}
        products={seasonalPicks}
        loading={itemsLoading}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
        addToCart={addToCart}
        handleRentNow={handleRentNow}
        bg="gray"
      />


      {/* TESTIMONIALS */}
      <section className="py-24 px-[5vw] bg-white">
        <div className="max-w-300 mx-auto">
          <Reveal className="mb-14">
            <div className="flex items-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-3">
              <span className="block w-6 h-px bg-amber-400" />What Renters Say
            </div>
            <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(36px,4.5vw,58px)" }}>
              Loved by <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Thousands</em>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className={`relative rounded-xl p-7 border transition-all duration-300 hover:border-amber-200 hover:shadow-md ${t.featured ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}
                >
                  {/* movie-ticket style punch notches, echoing the tag motif from categories */}
                  <TicketNotch side="left" />
                  <TicketNotch side="right" />
                  <div className="text-amber-400 text-[13px] tracking-[2px] mb-3">★★★★★</div>
                  <div className="font-display text-[80px] leading-[0.5] mb-4 opacity-20" style={{ color: AMBER }}>"</div>
                  <p className="text-[15px] text-gray-500 leading-[1.7] mb-6 italic">{t.text}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-dashed border-gray-200">
                    <div className="w-10.5 h-10.5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-display text-[18px]" style={{ color: AMBER }}>
                      {t.initial}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-gray-800">{t.name}</div>
                      <div className="text-[12px] text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-[5vw] bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-300 mx-auto">
          <Reveal className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <div className="text-[11px] tracking-[0.12em] uppercase mb-3 font-medium" style={{ color: AMBER }}>Start Today</div>
              <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(34px,4vw,52px)" }}>
                Have an item?<br />
                <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Earn while it sits.</em>
              </h2>
              <p className="text-[15px] text-gray-500 mt-3 max-w-110">
                List your gear for free and earn passive income from renters right here in the Valley.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                className="px-8 py-3.5 border-none rounded-lg text-[15px] font-semibold cursor-pointer whitespace-nowrap hover:brightness-110 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                style={{ background: AMBER, color: "#1a1209" }}
              >
                List Your Item
              </button>
              <button className="px-8 py-3.5 bg-transparent border border-gray-300 rounded-lg text-gray-500 text-[15px] cursor-pointer whitespace-nowrap hover:border-amber-400 hover:text-amber-600 transition-all duration-200">
                Learn More
              </button>
            </div>
          </Reveal>
        </div>
      </section>


    </div>
  );
}