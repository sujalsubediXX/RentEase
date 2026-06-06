import { useState, useEffect} from "react";
import { Reveal } from "../../config/MotionFunction.tsx";
import axios from "axios";
import API_BASE_URL from "../../config/api";
const AMBER = "#d4922a";
const AMBER_LIGHT = "#e8ac50";


interface Category {
  icon: string;
  name: string;
  count: string;
  badge?: string;
  featured?: boolean;
}

interface RentalItem {
  icon: string;
  cat: string;
  name: string;
  rating: string;
  reviews: number;
  loc: string;
  price: string;
  bg: string;
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

// const items: RentalItem[] = [
//   { icon: "📷", cat: "Photography", name: "Sony A7 IV Full Frame Camera", rating: "4.9", reviews: 128, loc: "Kathmandu", price: "₨850", bg: "#f5f0e8" },
//   { icon: "⛺", cat: "Camping", name: "4-Person Dome Tent — Ultralight", rating: "4.8", reviews: 74, loc: "Pokhara", price: "₨400", bg: "#ede8e0" },
//   { icon: "🎸", cat: "Music", name: "Fender Stratocaster Guitar + Amp", rating: "5.0", reviews: 43, loc: "Lalitpur", price: "₨650", bg: "#ede8e0" },
//   { icon: "🛶", cat: "Outdoor Sports", name: "Inflatable Kayak — 2 Person", rating: "4.7", reviews: 56, loc: "Chitwan", price: "₨700", bg: "#e8edf0" },
//   { icon: "🎥", cat: "Electronics", name: "4K Projector — 3000 Lumens", rating: "4.8", reviews: 91, loc: "Bhaktapur", price: "₨500", bg: "#ede8f0" },
//   { icon: "🚲", cat: "Recreation", name: 'Trek Mountain Bike — 29"', rating: "4.9", reviews: 112, loc: "Kathmandu", price: "₨300", bg: "#e8f0ea" },
// ];

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
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  const [query, setQuery] = useState<string>("");
  
  const [items, setItems] = useState<RentalItem[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/items`).then((res) => setItems(res.data));
  } , []);

  const toggleFav = (i: number): void =>
    setFavs((f) => ({ ...f, [i]: !f[i] }));

  return (
    <div>
      
     
    

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center px-[5vw] pt-28 pb-20 relative overflow-hidden text-center bg-white">
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
            <div className="bg-transparent border-none outline-none px-5 py-4 text-gray-500 text-[14px] cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
              All Categories ▾
            </div>
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
          <Reveal  delay={(1 % 3) * 0.1} className="mb-14">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <Reveal key={i} delay={(i % 3) * 0.1}>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-300 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="w-full aspect-4/3 flex items-center justify-center text-[64px] relative" style={{ background: item.bg }}>
                    {item.icon}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.3))" }} />
                    <span className="absolute top-3 left-3 bg-green-50 border border-green-200 text-green-600 text-[11px] px-2.5 py-1 rounded-full">
                      Available Now
                    </span>
                    <button
                      onClick={() => toggleFav(i)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-[16px] border border-gray-200 hover:border-amber-300 transition-all duration-200"
                      style={{ color: favs[i] ? AMBER : "#aaa" }}
                    >
                      {favs[i] ? "♥" : "♡"}
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] tracking-widest uppercase font-medium mb-1.5" style={{ color: AMBER }}>
                      {item.cat}
                    </div>
                    <div className="font-display text-[20px] text-gray-800 mb-2">{item.name}</div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1 text-[13px] text-gray-500">
                        <span style={{ color: AMBER }}>★</span> {item.rating} ({item.reviews} reviews)
                      </div>
                      <div className="text-[12px] text-gray-400">📍 {item.loc}</div>
                    </div>
                    <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
                      <div className="font-display">
                        <span className="text-[26px] font-normal" style={{ color: AMBER_LIGHT }}>{item.price}</span>
                        <span className="text-[13px] text-gray-400">/day</span>
                      </div>
                      <button className="px-4 py-2 bg-transparent border border-gray-200 text-gray-500 text-[13px] rounded-md cursor-pointer hover:bg-amber-500 hover:border-amber-500 hover:text-white hover:font-semibold transition-all duration-200">
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
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