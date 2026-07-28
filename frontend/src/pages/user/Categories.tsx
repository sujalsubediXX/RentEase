import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import API_BASE_URL from "../../config/api";

const AMBER_LIGHT = "#e8ac50";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

const whyChoose = [
  { icon: "💰", title: "Save Money", copy: "Rent items at a fraction of the purchase price." },
  { icon: "🌱", title: "Eco-Friendly", copy: "Reduce waste and clutter by sharing resources instead of buying." },
  { icon: "✅", title: "Verified Quality", copy: "Every owner is KYC-checked and every listing is reviewed." },
];

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/category/getcategory`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* HERO — same eyebrow / serif-display / amber-italic pattern as the homepage */}
      <section className="pt-36 pb-20 px-[5vw] text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(212,146,42,0.07) 0%, transparent 70%)" }}
        />
        <div className="flex items-center justify-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-4">
          <span className="block w-6 h-px bg-amber-400" />
          All Categories
          <span className="block w-6 h-px bg-amber-400" />
        </div>
        <h1
          className="font-display font-light text-gray-900 leading-none tracking-tight mb-5"
          style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
        >
          Browse by <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>Category</em>
        </h1>
        <p className="text-gray-500 text-[16px] max-w-140 mx-auto leading-relaxed">
          Find the perfect gear to rent, from a single camera lens to a full set of party furniture.
        </p>
      </section>

      <div className="max-w-300 mx-auto px-[5vw] pb-24">
        {/* CATEGORY GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-[15px]">No categories have been added yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/categories/${category._id}`}
                className="group relative block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* punched tag hole — same signature detail used on the homepage category cards */}
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-3 z-10 w-3 h-3 rounded-full border-2 border-white/70 group-hover:border-amber-300 transition-colors"
                />

                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={`${API_BASE_URL}/uploads/categories/${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                </div>

                <div className="p-5">
                  <h3 className="font-display text-[20px] font-normal text-gray-800 mb-1.5 group-hover:text-amber-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                    <span className="text-[12px] text-gray-400 font-mono">
                      {category.productCount} items available
                    </span>
                    <span className="text-amber-500 text-[13px] font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Browse →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* WHY CHOOSE US — restyled as ticket-stub cards, echoing the testimonial cards on the homepage */}
        <div className="mt-28">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2.5 text-[11px] text-amber-500 tracking-[0.15em] uppercase font-medium mb-3">
              <span className="block w-6 h-px bg-amber-400" />Why Rent With Us<span className="block w-6 h-px bg-amber-400" />
            </div>
            <h2 className="font-display font-light text-gray-900 leading-tight" style={{ fontSize: "clamp(30px,4vw,44px)" }}>
              Why Choose <em style={{ fontStyle: "italic", color: AMBER_LIGHT }}>RentEase</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whyChoose.map((item) => (
              <div
                key={item.title}
                className="relative text-center p-7 bg-white rounded-xl border border-gray-200 hover:border-amber-200 hover:shadow-md transition-all duration-300"
              >
                <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-gray-200" />
                <span aria-hidden="true" className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-gray-200" />
                <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-display text-[18px] font-normal text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;