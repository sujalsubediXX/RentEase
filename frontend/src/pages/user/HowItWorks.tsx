import { Reveal } from "../../config/MotionFunction.tsx";

interface Step {
  emoji: string;
  title: string;
  desc: string;
}
const steps: Step[] = [
  { emoji: "🔍", title: "Search", desc: "Browse thousands of items by category, location, or keyword. Filter by price, availability, and rating." },
  { emoji: "📅", title: "Book", desc: "Choose your rental dates and submit a booking request. Most owners respond within the hour." },
  { emoji: "📦", title: "Pickup", desc: "Meet the owner or receive delivery. Every item is verified and insured for your peace of mind." },
  { emoji: "↩️", title: "Return", desc: "Return the item in the same condition and leave a review. It's that simple!" },
];


export default function HowItWorks() {
    return (
       <section  className="py-40 px-[5vw] bg-amber-50">
        <div className="max-w-300 mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-3">
              <span className="block w-6 h-px bg-amber-400" />Simple Process<span className="block w-6 h-px bg-amber-400" />
            </div>
            <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(36px,4.5vw,58px)" }}>
              How RentEase <em style={{ fontStyle: "italic", color: "#d4922a" }}>Works</em>
            </h2>
            <p className="text-gray-500 text-[15px] mt-3">Start renting in minutes — it's that easy.</p>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 relative">
            <div className="absolute top-10 left-[12%] right-[12%] h-px bg-amber-200 hidden md:block pointer-events-none" />
            {steps.map((s, i) => (
              <Reveal key={i} delay={(i % 3) * 0.1}   className="text-center group">
                <div className="w-20 h-20 rounded-full mx-auto mb-7 border border-amber-200 bg-white flex items-center justify-center text-[30px] relative z-10 shadow-sm group-hover:border-amber-400 group-hover:shadow-md transition-all duration-300">
                  {s.emoji}
                </div>
                <h3 className="font-display text-[22px] font-normal text-gray-800 mb-2.5">{s.title}</h3>
                <p className="text-[14px] text-gray-400 leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
}