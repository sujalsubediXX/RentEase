import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 hero-grid-bg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Section - Black and Yellow */}
      <div className="bg-white text-black pt-40 pb-20">
        <div className="container mx-auto px-4">
          
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              About RentEase
            </h1>
            <p className="text-xl text-yellow-600/80 font-light">
              Bridging the gap between product owners and renters in Nepal
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Our Story Section - Based on PDF Introduction */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-2xl">📖</span>
            </div>
            <h2 className="text-3xl font-bold text-black font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Our Story
            </h2>
            <div className="w-15 h-0.5 bg-yellow-500 mx-auto mt-3"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10">
            <p className="text-gray-700 leading-relaxed mb-4">
              In Nepal, renting products like cameras, laptops, or dresses often means relying on informal 
              networks—social media posts or personal contacts. This creates trust issues, payment disputes, 
              and lacks accountability.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold text-black">RentEase</span> was born to solve this. RentEase is 
              Nepal's first secure peer-to-peer rental platform that combines <span className="font-semibold text-black">KYC verification</span>, 
              <span className="font-semibold text-black"> smart scheduling</span>, and <span className="font-semibold text-black">AI-powered recommendations</span> 
              to create a trusted ecosystem where anyone can rent or lend with confidence.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our platform serves two major categories: <span className="font-semibold text-black">lifestyle products</span> (bags, dresses) 
              and <span className="font-semibold text-black">technological products</span> (laptops, cameras), making quality items accessible 
              to everyone while helping owners earn from underutilized belongings.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center group hover:shadow-md transition">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-black mb-3 font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed">
              To digitize and secure Nepal's rental economy by providing a trustworthy platform 
              that protects both renters and owners through verification, automation, and transparency.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center group hover:shadow-md transition">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition">
              <span className="text-2xl">🌟</span>
            </div>
            <h3 className="text-xl font-bold text-black mb-3 font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Our Vision
            </h3>
            <p className="text-gray-600 leading-relaxed">
              To become Nepal's most trusted rental marketplace, empowering individuals to generate 
              income while building a sustainable, resource-efficient sharing economy.
            </p>
          </div>
        </div>

        {/* What We Aim to Achieve - Objectives */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-black font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              What We Aim to Achieve
            </h2>
            <div className="w-20 h-0.5 bg-yellow-500 mx-auto mt-3"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                "Build a secure web-based rental platform for Nepal",
                "Implement intelligent rental management with KYC",
                "Create trust between renters and product owners",
                "Reduce unnecessary consumer spending",
                "Help owners earn from idle belongings",
                "Provide transparent, automated rental agreements"
              ].map((item, index) => (
                <div key={index} className="flex items-start group">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 group-hover:text-black transition">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What We Offer - Features from PDF */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h2 className="text-3xl font-bold text-black font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              What Makes Us Different
            </h2>
            <div className="w-20 h-0.5 bg-yellow-500 mx-auto mt-3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🆔", title: "KYC Verification", desc: "Identity verification for trust and security" },
              { icon: "🤖", title: "AI Recommendations", desc: "KNN algorithm for personalized suggestions" },
              { icon: "📅", title: "Smart Scheduling", desc: "Interval scheduling for availability" },
              { icon: "📄", title: "Automated Agreements", desc: "Digital rental agreements for accountability" },
              { icon: "💰", title: "Dynamic Pricing", desc: "Smart pricing based on demand" },
              { icon: "🛡️", title: "Admin Oversight", desc: "Centralized dispute resolution" }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition">{feature.icon}</div>
                <h3 className="font-semibold text-black mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Categories - Scope */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h2 className="text-3xl font-bold text-black font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              What You Can Rent
            </h2>
            <div className="w-20 h-0.5 bg-yellow-500 mx-auto mt-3"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "📷", name: "Cameras", count: "4+ listings" },
              { icon: "💻", name: "Laptops", count: "3+ listings" },
              { icon: "👗", name: "Dresses", count: "3+ listings" },
              { icon: "🎒", name: "Bags", count: "Coming soon" }
            ].map((cat, index) => (
              <Link 
                key={index}
                to={`/category/${cat.name.toLowerCase()}`}
                className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition">{cat.icon}</div>
                <h3 className="font-semibold text-black">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* The Team */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-3xl font-bold text-black font-display" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Behind RentEase
            </h2>
            <div className="w-20 h-0.5 bg-yellow-500 mx-auto mt-3"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="flex flex-col md:flex-row justify-center gap-8 mb-6">
              <div>
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">NS</span>
                </div>
                <h3 className="font-semibold text-black">Nischal Shrestha</h3>
              </div>
              <div>
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">SS</span>
                </div>
                <h3 className="font-semibold text-black">Sujal Subedi</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;