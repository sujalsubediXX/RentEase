import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserDropdown from "../../pages/user/UserDropdown";
const AMBER = "#d4922a";
const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact Us", href: "/contact" },
  { label: "About Us", href: "/about" },
];
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import API_BASE_URL from "../../config/api";

export default function Header() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [cartLength, setCartLength] = useState<number>(0);
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const getCartCount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/cart/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartLength(res.data.count);
      } catch (error) {
        console.log("Error fetching cart length", error)
      }
    }
    getCartCount()
  }, [user?.id, isAuthenticated])

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="bg-white text-gray-900 font-sans overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5vw] transition-all duration-300 ${scrolled ? "h-15 bg-white/95 shadow-sm" : "h-17.5 bg-white/85"
          } backdrop-blur-md border-b border-amber-100`}
      >
        <Link to="/" className="font-display text-[26px] font-medium tracking-wide text-gray-900">
          Rent<span style={{ color: AMBER }}>Ease</span>
        </Link>
        <ul className="hidden md:flex gap-9 list-none">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link to={l.href} className="text-gray-500 text-[13.5px] tracking-wide no-underline hover:text-amber-600 transition-colors duration-200">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        {
          isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/cart"
                className="relative p-2 text-stone-600 hover:text-amber-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartLength > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartLength}
                  </span>
                )}

              </Link>
              <UserDropdown />

            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <Link to="/login" className="px-5 py-2 border border-amber-200 text-gray-500 text-[13px] rounded bg-transparent hover:border-amber-500 hover:text-amber-600 transition-all duration-200 cursor-pointer">
                Sign In
              </Link>
              <button className="px-5 py-2 border-none text-[13px] font-semibold rounded cursor-pointer transition-all duration-200 hover:brightness-110" style={{ background: AMBER, color: "#1a1209" }}>
                Get Started
              </button>
            </div>
          )
        }



      </nav>

    </div>
  );
}