import { useState, useEffect} from "react";
const AMBER = "#d4922a";
const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/" },
  { label: "Browse", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "List an Item", href: "/" },
  { label: "About", href: "/" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState<boolean>(false);


  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="bg-white text-gray-900 font-sans overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
     
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5vw] transition-all duration-300 ${
          scrolled ? "h-15 bg-white/95 shadow-sm" : "h-17.5 bg-white/85"
        } backdrop-blur-md border-b border-amber-100`}
      >
        <div className="font-display text-[26px] font-medium tracking-wide text-gray-900">
          Rent<span style={{ color: AMBER }}>Ease</span>
        </div>
        <ul className="hidden md:flex gap-9 list-none">
          {navLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="text-gray-500 text-[13.5px] tracking-wide no-underline hover:text-amber-600 transition-colors duration-200">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-3 items-center">
          <button className="px-5 py-2 border border-amber-200 text-gray-500 text-[13px] rounded bg-transparent hover:border-amber-500 hover:text-amber-600 transition-all duration-200 cursor-pointer">
            Sign In
          </button>
          <button className="px-5 py-2 border-none text-[13px] font-semibold rounded cursor-pointer transition-all duration-200 hover:brightness-110" style={{ background: AMBER, color: "#1a1209" }}>
            Get Started
          </button>
        </div>
      </nav>

    </div>
  );
}