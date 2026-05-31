import React, { useState } from "react";
import { Link } from "react-router-dom";
import MockMap from "../../components/common/mockmap";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setIsLoading(false);
    setFormData({ name: "", email: "", subject: "", message: "" });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div
      className="min-h-screen bg-gray-50 hero-grid-bg"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Hero Section - Black and Yellow */}
      <div className="bg-white text-black pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="text-5xl md:text-6xl font-bold mb-4 font-display"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Get in Touch
            </h1>
            <p className="text-xl text-yellow-600 font-light">
              We'd love to hear from you. Send us a message and we'll respond as
              soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: "📍",
                title: "Visit Us",
                details: ["National College", "Kathmandu, Nepal"],
                action: null,
              },
              {
                icon: "📧",
                title: "Email Us",
                details: ["support@rentease.com.np", "info@rentease.com.np"],
                action: "mailto:support@rentease.com.np",
              },
              {
                icon: "📞",
                title: "Call Us",
                details: ["+977 9841234567", "+977 9812345678"],
                action: "tel:+9779841234567",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition group"
              >
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3
                  className="text-xl font-bold text-black mb-3 font-display"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {item.title}
                </h3>
                {item.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 text-sm">
                    {item.action ? (
                      <a
                        href={item.action}
                        className="hover:text-yellow-600 transition"
                      >
                        {detail}
                      </a>
                    ) : (
                      detail
                    )}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="mb-6">
                <h2
                  className="text-2xl font-bold text-black mb-2 font-display"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Send us a Message
                </h2>
                <div className="w-16 h-0.5 bg-yellow-500"></div>
              </div>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">
                    ✓ Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Your Name <span className="text-yellow-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email Address <span className="text-yellow-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Subject <span className="text-yellow-600">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="rental">Rental Question</option>
                    <option value="listing">Listing Your Product</option>
                    <option value="payment">Payment Issue</option>
                    <option value="dispute">Dispute Resolution</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Message <span className="text-yellow-600">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-yellow-500 py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>

            {/* FAQ / Support Section */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">❓</span>
                  </div>
                  <h2
                    className="text-2xl font-bold text-black mb-2 font-display"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    Frequently Asked Questions
                  </h2>
                  <div className="w-16 h-0.5 bg-yellow-500"></div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: "How do I rent a product?",
                      a: "Browse products, select your dates, and submit a rental request. The owner will approve it.",
                    },
                    {
                      q: "Is KYC verification mandatory?",
                      a: "Yes, all users must complete KYC verification to ensure platform safety and trust.",
                    },
                    {
                      q: "How are payments handled?",
                      a: "Payments are processed securely through our platform. Owners receive payment after rental completion.",
                    },
                    {
                      q: "What if the product is damaged?",
                      a: "Our dispute resolution team will investigate and help resolve any issues fairly.",
                    },
                  ].map((faq, index) => (
                    <details key={index} className="group">
                      <summary className="cursor-pointer list-none flex items-center justify-between py-3 border-b border-gray-100 hover:text-yellow-600 transition">
                        <span className="font-medium text-gray-800 group-hover:text-black">
                          {faq.q}
                        </span>
                        <span className="text-yellow-500 group-open:rotate-180 transition">
                          ▼
                        </span>
                      </summary>
                      <p className="text-gray-600 text-sm pt-2 pb-3 pl-2">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Can't find what you're looking for? <br />
                    <Link
                      to="/how-it-works"
                      className="text-yellow-600 hover:underline"
                    >
                      Read our How It Works guide →
                    </Link>
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">⏰</span>
                  </div>
                  <h3 className="text-lg font-bold text-black">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-2 text-gray-600 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Monday - Friday:</span>
                    <span className="font-medium text-black">
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Saturday:</span>
                    <span className="font-medium text-black">
                      10:00 AM - 4:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Sunday:</span>
                    <span className="font-medium text-gray-400">Closed</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Support response time: 24-48 hours
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">📱</span>
                  </div>
                  <h3 className="text-lg font-bold text-black">Follow Us</h3>
                </div>
                <div className="flex justify-around">
                  {[
                    { icon: "📘", name: "Facebook", link: "#" },
                    { icon: "📷", name: "Instagram", link: "#" },
                    { icon: "🐦", name: "Twitter", link: "#" },
                    { icon: "💼", name: "LinkedIn", link: "#" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      className="text-center group"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1 group-hover:bg-yellow-100 transition">
                        <span className="text-xl">{social.icon}</span>
                      </div>
                      <span className="text-xs text-gray-500 group-hover:text-yellow-600">
                        {social.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-black text-yellow-500 px-6 py-4">
              <h3 className="font-semibold font-display">Find Us Here</h3>
            </div>
            <div className="h-80 w-full">
              <MockMap
                location="Kathmandu, Nepal"
                address="National College, Kathmandu, Nepal"
              />
            </div>
            <div className="p-4 text-center border-t border-gray-100">
              <p className="text-gray-500 text-sm">
                📍 National College, Kathmandu, Nepal
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (Interactive map coming soon)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
