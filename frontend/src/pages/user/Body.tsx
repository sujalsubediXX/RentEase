import { useState, useEffect, useCallback } from "react";
import { Reveal } from "../../config/MotionFunction.tsx";
import axios from "axios";
import API_BASE_URL from "../../config/api.ts";
const AMBER = "#d4922a";
const AMBER_LIGHT = "#e8ac50";
import { useNavigate } from "react-router-dom"
import { toast } from "sonner";
import { ProductCard } from "../../components/user/ProductCard.tsx";
import { X } from "lucide-react";
import { ImageSlider } from "./ImageSlider.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
interface Category {
  icon: string;
  name: string;
  count: string;
  badge?: string;
  featured?: boolean;
}
interface dbCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  originalrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  location: string;
}


interface Testimonial {
  text: string;
  name: string;
  role: string;
  initial: string;
  featured?: boolean;
}


const categories: Category[] = [
  { icon: "📸", name: "Photography & Film", count: "1,240", badge: "Most Popular", featured: true },
  { icon: "🏕️", name: "Outdoor & Camping", count: "876" },
  { icon: "🔧", name: "Tools & Equipment", count: "2,105" },
  { icon: "🎉", name: "Party & Events", count: "654" },
  { icon: "🚲", name: "Sports & Recreation", count: "988" },
  { icon: "💻", name: "Electronics & Tech", count: "1,432" },
];



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

export default function Body() {
  const { user ,isAuthenticated} = useAuth();
  const [query, setQuery] = useState<string>("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [category, setCategory] = useState<dbCategory[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [wishlistLoading, setWishlistLoading] = useState<Set<string>>(new Set());
  const navigate = useNavigate();


  const fetchWishlist = useCallback(async (userId: string) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/wishlist/${userId}`
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
    if (!user?.id) return;
    fetchWishlist(user.id);
  }, [user, fetchWishlist]);


  useEffect(() => {
    if (!user?.id) return;
    fetchWishlist(user.id);
  }, [user, fetchWishlist]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/items/getitems`);

        setItems(
          res.data.data.map((item: any) => ({
            id: item._id,
            name: item.title,
            description: item.description,
            rentalPrice: item.price,
            originalPrice: item.price,
            images: Array.isArray(item.images)
              ? item.images.map((img: string) => `http://localhost:3000${img}`)
              : [],
            categoryId: item.categoryId,
            brand: item.brand || "Generic",
            rating: 5,
            reviewCount: 0,
            stock: item.quantity || 0,
            location: item.location,
          }))
        );
      } catch (err) {
        console.log(err);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/category/getcategory`);
        setCategory(res.data);
      } catch (err) {
        console.log(err);
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
        `${API_BASE_URL}/cart/add/${user.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          `${API_BASE_URL}/wishlist/remove/${user.id}/${productId}`
        );
        toast.error("Removed from wishlist");
      } else {
        await axios.post(
          `${API_BASE_URL}/wishlist/add/${user.id}`,
          { itemId: productId }
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


  return (
    <div>

      {/* HERO */}
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
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{quickViewProduct.brand}</span>
                    <h2 className="text-xl font-bold text-stone-800 mt-0.5">{quickViewProduct.name}</h2>
                  </div>
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 flex items-center justify-center transition-all"
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
                    { label: 'Brand', value: quickViewProduct.brand },
                    { label: 'Rating', value: `${quickViewProduct.rating} ★` },
                    { label: 'Location', value: quickViewProduct.location },
                    { label: 'Stock', value: quickViewProduct.stock > 0 ? `${quickViewProduct.stock} available` : 'Out of stock' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
                      <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-stone-700">{value}</p>
                    </div>
                  ))}
                </div>

                <button
                  disabled={quickViewProduct.stock === 0}
                  onClick={() => navigate('/checkout', { state: { product: quickViewProduct } })}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all
                          ${quickViewProduct.stock > 0
                      ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm hover:shadow-md'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                >
                  Rent Now — Rs. {quickViewProduct.rentalPrice.toLocaleString()}/day
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

        <p className="anim-2 max-w-130 text-[16px] text-gray-500 leading-relaxed mx-auto mb-12">
          From power tools to party supplies, cameras to camping gear — find exactly what you need without the commitment of buying.
        </p>

        <div className="anim-3 w-full max-w-170">
          <div className="flex items-center bg-white border border-amber-200 rounded-lg overflow-hidden shadow-sm focus-within:border-amber-400 focus-within:shadow-[0_0_0_3px_rgba(212,146,42,0.12)] transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to rent?"
              className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-gray-800 text-[15px] placeholder-gray-400"
            />
            <div className="w-px h-6 bg-amber-100" />

            <select
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
            <button className="m-1.5 px-6 py-2.5 border-none rounded-md font-semibold text-[14px] cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110" style={{ background: AMBER, color: "#1a1209" }}>
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
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-24 px-[5vw] bg-gray-50">
        <div className="max-w-300 mx-auto">
          <Reveal delay={(1 % 3) * 0.1} className="mb-14">
            <div className="flex items-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-3">
              <span className="block w-6 h-px bg-amber-400" />What We Offer
            </div>
            <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(36px,4.5vw,58px)" }}>
              Browse by <p style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Category</p>
            </h2>
            <p className="text-gray-500 text-[15px] mt-3 max-w-125">
              Everything from everyday essentials to specialty gear — discover your next rental.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <Reveal key={i} delay={(i % 3) * 0.1} className={c.featured ? "md:col-span-2" : ""}>
                <div className={`relative rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-end p-5 group bg-white shadow-sm hover:shadow-md ${c.featured ? "min-h-45" : "aspect-3/2"}`}>
                  <div className="absolute inset-0 flex items-center justify-center text-[120px] opacity-[0.03] pointer-events-none select-none">{c.icon}</div>
                  <span className="text-[36px] mb-2.5 block group-hover:scale-110 transition-transform duration-300">{c.icon}</span>
                  <div className="font-display text-[22px] font-normal text-gray-800">{c.name}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{c.count} items available</div>
                  {c.badge && (
                    <span className="absolute top-3.5 right-3.5 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">
                      {c.badge}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ITEMS */}
      <section id="featured" className="py-24 px-[5vw] bg-white">
        <div className="max-w-300 mx-auto">
          <Reveal className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-3">
                <span className="block w-6 h-px bg-amber-400" />Top Picks
              </div>
              <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(36px,4.5vw,58px)" }}>
                Featured <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Rentals</em>
              </h2>
            </div>
            <a href="#" className="text-amber-500 text-[14px] no-underline pb-0.5 border-b border-amber-300 whitespace-nowrap hover:text-amber-600 transition-colors">
              View all →
            </a>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {items.map((product, index) => {
              // const shouldAttachRef = index === paginatedProducts.length - 1 && hasMore && !loading;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isInWishlist={wishlist.includes(product.id)}
                  onToggleWishlist={toggleWishlist}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={addToCart}
                  onRentNow={handleRentNow}
                // cardRef={shouldAttachRef ? lastProductElementRef : undefined}
                />
              );
            })

            }
          </div>


        </div>
      </section>


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
                <div className={`rounded-xl p-7 border transition-all duration-300 hover:border-amber-200 hover:shadow-md ${t.featured ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
                  <div className="text-amber-400 text-[13px] tracking-[2px] mb-3">★★★★★</div>
                  <div className="font-display text-[80px] leading-[0.5] mb-4 opacity-20" style={{ color: AMBER }}>"</div>
                  <p className="text-[15px] text-gray-500 leading-[1.7] mb-6 italic">{t.text}</p>
                  <div className="flex items-center gap-3">
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
                List your gear for free and earn passive income. Over 24,000 items already earning money for their owners.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button className="px-8 py-3.5 border-none rounded-lg text-[15px] font-semibold cursor-pointer whitespace-nowrap hover:brightness-110 transition-all duration-200" style={{ background: AMBER, color: "#1a1209" }}>
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