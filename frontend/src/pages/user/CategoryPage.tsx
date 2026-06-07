import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, Star,
  Heart, Eye, ShoppingBag, X, ChevronLeft, ChevronRight,
  MapPin, Package, Home
} from 'lucide-react';

// ============ TYPES ============
interface Product {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  location: string;
}

const mockProducts: Product[] = [
  // Cameras
  {
    id: '1',
    name: 'Canon EOS 200D II Camera',
    description: '24.1MP DSLR Camera with 18-55mm lens',
    rentalPrice: 1500,
    originalPrice: 2500,
    images: ['https://picsum.photos/id/20/300/300'],
    category: 'Cameras & Photography',
    categoryId: 'camera',
    brand: 'Canon',
    rating: 4.5,
    reviewCount: 128,
    stock: 3,
    location: 'Kathmandu',
  },
  {
    id: '2',
    name: 'Nikon D5600 Camera',
    description: '24.2MP DSLR with Wi-Fi and Bluetooth',
    rentalPrice: 1200,
    originalPrice: 2200,
    images: ['https://picsum.photos/id/21/300/300'],
    category: 'Cameras & Photography',
    categoryId: 'camera',
    brand: 'Nikon',
    rating: 4.3,
    reviewCount: 95,
    stock: 2,
    location: 'Lalitpur',
  },
  {
    id: '5',
    name: 'Sony A7 III Camera',
    description: 'Full-frame mirrorless camera',
    rentalPrice: 2200,
    originalPrice: 3800,
    images: ['https://picsum.photos/id/22/300/300'],
    category: 'Cameras & Photography',
    categoryId: 'camera',
    brand: 'Sony',
    rating: 4.7,
    reviewCount: 203,
    stock: 4,
    location: 'Kathmandu',
  },
  {
    id: '9',
    name: 'GoPro HERO11 Black',
    description: 'Waterproof action camera',
    rentalPrice: 900,
    originalPrice: 2800,
    images: ['https://picsum.photos/id/26/300/300'],
    category: 'Cameras & Photography',
    categoryId: 'camera',
    brand: 'GoPro',
    rating: 4.6,
    reviewCount: 234,
    stock: 8,
    location: 'Kathmandu',
  },
  // Laptops
  {
    id: '3',
    name: 'MacBook Pro 14"',
    description: 'M2 Pro chip, 16GB RAM, 512GB SSD',
    rentalPrice: 2500,
    originalPrice: 4000,
    images: ['https://picsum.photos/id/0/300/300'],
    category: 'Laptops & Computers',
    categoryId: 'technology',
    brand: 'Apple',
    rating: 4.8,
    reviewCount: 256,
    stock: 5,
    location: 'Kathmandu',
  },
  {
    id: '4',
    name: 'Dell XPS 15',
    description: 'Intel i7, 32GB RAM, 1TB SSD',
    rentalPrice: 2000,
    originalPrice: 3500,
    images: ['https://picsum.photos/id/1/300/300'],
    category: 'Laptops & Computers',
    categoryId: 'technology',
    brand: 'Dell',
    rating: 4.4,
    reviewCount: 89,
    stock: 0,
    location: 'Bhaktapur',
  },
  {
    id: '12',
    name: 'ASUS ROG Gaming Laptop',
    description: 'RTX 4060, 16GB RAM, 1TB SSD',
    rentalPrice: 2200,
    originalPrice: 6500,
    images: ['https://picsum.photos/id/3/300/300'],
    category: 'Laptops & Computers',
    categoryId: 'technology',
    brand: 'ASUS',
    rating: 4.5,
    reviewCount: 189,
    stock: 3,
    location: 'Kathmandu',
  },
  // Dresses/Fashion
  {
    id: '6',
    name: 'Designer Evening Dress',
    description: 'Elegant red evening gown, size M',
    rentalPrice: 800,
    originalPrice: 5000,
    images: ['https://picsum.photos/id/30/300/300'],
    category: 'Dresses & Fashion',
    categoryId: 'dress',
    brand: 'Fashionista',
    rating: 4.2,
    reviewCount: 45,
    stock: 6,
    location: 'Lalitpur',
  },
  {
    id: '7',
    name: "Men's Formal Suit",
    description: 'Formal black suit, size L',
    rentalPrice: 1000,
    originalPrice: 8000,
    images: ['https://picsum.photos/id/31/300/300'],
    category: 'Dresses & Fashion',
    categoryId: 'dress',
    brand: 'FormalWear',
    rating: 4.6,
    reviewCount: 78,
    stock: 4,
    location: 'Kathmandu',
  },
  {
    id: '11',
    name: 'Wedding Lehenga',
    description: 'Traditional red bridal lehenga',
    rentalPrice: 3000,
    originalPrice: 25000,
    images: ['https://picsum.photos/id/32/300/300'],
    category: 'Dresses & Fashion',
    categoryId: 'dress',
    brand: 'TraditionalWear',
    rating: 4.8,
    reviewCount: 156,
    stock: 2,
    location: 'Kathmandu',
  },
  // Electronics
  {
    id: '8',
    name: 'DJI Mavic Air 2 Drone',
    description: '4K drone with 34 min flight time',
    rentalPrice: 1800,
    originalPrice: 4500,
    images: ['https://picsum.photos/id/25/300/300'],
    category: 'Technology',
    categoryId: 'technology',
    brand: 'DJI',
    rating: 4.9,
    reviewCount: 167,
    stock: 2,
    location: 'Pokhara',
  },
  {
    id: '10',
    name: 'iPad Pro 12.9"',
    description: 'M2 chip, Wi-Fi + Cellular',
    rentalPrice: 1800,
    originalPrice: 5500,
    images: ['https://picsum.photos/id/2/300/300'],
    category: 'Technology',
    categoryId: 'technology',
    brand: 'Apple',
    rating: 4.7,
    reviewCount: 312,
    stock: 5,
    location: 'Lalitpur',
  },
];

// ============ CATEGORY CONFIG ============
const categoryConfig: Record<string, { title: string; description: string; icon: string }> = {
  camera: { title: 'Cameras & Photography', description: 'Rent professional cameras, lenses, and photography equipment for your special moments', icon: '📷' },
  technology: { title: 'Laptops & Computers', description: 'High-performance laptops and computers for work, study, and gaming', icon: '💻' },
  dress: { title: 'Dresses & Fashion', description: 'Designer outfits, traditional wear, and fashion accessories for every occasion', icon: '👗' },
  bag: { title: 'Bags & Luggage', description: 'Stylish bags and luggage for all your travel needs', icon: '👜' },
  'camping gear': { title: 'Camping Gear', description: 'Essential gear for your outdoor adventures', icon: '🏕' },
};

// ============ MAIN COMPONENT ============
const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showToast, setShowToast] = useState<{ message: string; type: string } | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const itemsPerPage = 8;

  const categoryInfo = categoryId ? categoryConfig[categoryId] : null;

  const filteredProducts = useMemo(() => {
    let products = mockProducts.filter(p => p.categoryId === categoryId);
    if (searchTerm) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    products = products.filter(p => p.rentalPrice >= priceRange[0] && p.rentalPrice <= priceRange[1]);
    if (selectedBrands.length > 0) products = products.filter(p => selectedBrands.includes(p.brand));
    if (minRating > 0) products = products.filter(p => p.rating >= minRating);
    return products;
  }, [categoryId, searchTerm, priceRange, selectedBrands, minRating]);

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortBy) {
      case 'price_low': return products.sort((a, b) => a.rentalPrice - b.rentalPrice);
      case 'price_high': return products.sort((a, b) => b.rentalPrice - a.rentalPrice);
      case 'rating': return products.sort((a, b) => b.rating - a.rating);
      case 'name_az': return products.sort((a, b) => a.name.localeCompare(b.name));
      default: return products;
    }
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm, priceRange, selectedBrands, minRating, sortBy]);

  const availableBrands = useMemo(() => {
    const products = mockProducts.filter(p => p.categoryId === categoryId);
    return [...new Set(products.map(p => p.brand))];
  }, [categoryId]);

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(prev => prev.filter(id => id !== productId));
      showToastMessage('Removed from wishlist', 'info');
    } else {
      setWishlist(prev => [...prev, productId]);
      showToastMessage('Added to wishlist', 'success');
    }
  };

  const showToastMessage = (message: string, type: string) => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 2500);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 5000]);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy('featured');
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) + selectedBrands.length + (minRating > 0 ? 1 : 0);

  // ── 404 state ──
  if (!categoryId || !categoryInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-stone-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Category Not Found</h1>
          <p className="text-stone-500 mb-8">The category you're looking for doesn't exist.</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all"
            >
              <Home size={15} /> Go Home
            </Link>
            <Link
              to="/categories"
              className="flex items-center gap-2 px-5 py-2.5 border border-stone-300 text-stone-600 rounded-xl text-sm hover:border-stone-400 hover:text-stone-800 transition-all"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Filter Sidebar (shared between desktop + mobile drawer) ──
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-stone-800 uppercase tracking-wider">Filters</span>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            <X size={12} /> Clear ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Search</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400
                       focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
          Price per day (Rs.)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={priceRange[0]}
            onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="w-1/2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700
                       focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            placeholder="Min"
          />
          <input
            type="number"
            value={priceRange[1]}
            onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-1/2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700
                       focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Brands</label>
          <div className="space-y-2">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0
                    ${selectedBrands.includes(brand)
                      ? 'bg-stone-900 border-stone-900'
                      : 'border-stone-300 group-hover:border-stone-400'}`}
                  onClick={() => {
                    setSelectedBrands(prev =>
                      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                    );
                  }}
                >
                  {selectedBrands.includes(brand) && (
                    <svg className="w-2.5 h-2.5 text-amber-400" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? 'text-stone-800 font-medium' : 'text-stone-500 group-hover:text-stone-700'}`}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Min Rating */}
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Min Rating</label>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map(r => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                ${minRating === r
                  ? 'bg-stone-900 text-amber-400 shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'}`}
            >
              {r === 0 ? 'All' : `${r}★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Product Card ──
  const ProductCard = ({ product }: { product: Product }) => {
    const isInWishlist = wishlist.includes(product.id);
    const discount = product.originalPrice
      ? Math.round(((product.originalPrice - product.rentalPrice) / product.originalPrice) * 100)
      : null;

    return (
      <div className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60 transition-all duration-300">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-stone-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Discount badge */}
          {discount && (
            <span className="absolute top-3 left-3 bg-stone-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-stone-600 text-sm font-semibold bg-white/90 px-3 py-1 rounded-full border border-stone-200">
                Out of Stock
              </span>
            </div>
          )}
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all
                ${isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-stone-400 hover:text-red-500 hover:shadow-lg'}`}
            >
              <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setQuickViewProduct(product)}
              className="w-8 h-8 rounded-xl bg-white text-stone-400 hover:text-stone-700 hover:shadow-lg flex items-center justify-center shadow-md transition-all"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">{product.brand}</span>
            <div className="flex items-center gap-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-stone-700 font-medium">{product.rating}</span>
              <span className="text-xs text-stone-400">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-semibold text-stone-800 mb-1 line-clamp-1 text-sm">{product.name}</h3>

          <div className="flex items-center gap-1 mb-3">
            <MapPin size={11} className="text-stone-400 shrink-0" />
            <span className="text-[11px] text-stone-400">{product.location}</span>
          </div>

          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-stone-900">Rs. {product.rentalPrice.toLocaleString()}</span>
                <span className="text-xs text-stone-400">/day</span>
              </div>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
              ${product.stock > 3
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : product.stock > 0
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-red-50 text-red-500 border border-red-200'}`}>
              {product.stock > 3 ? 'Available' : product.stock > 0 ? `${product.stock} left` : 'Unavailable'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setQuickViewProduct(product)}
              className="flex-1 px-3 py-2 border border-stone-200 text-stone-500 rounded-xl hover:border-stone-300 hover:text-stone-700 transition-all text-xs font-medium"
            >
              Quick View
            </button>
            <button
              disabled={product.stock === 0}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all
                ${product.stock > 0
                  ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm hover:shadow-md'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── List View Card ──
  const ProductListItem = ({ product }: { product: Product }) => {
    const isInWishlist = wishlist.includes(product.id);

    return (
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-md hover:shadow-stone-200/60 transition-all duration-300 flex flex-col md:flex-row">
        <div className="w-full md:w-44 h-44 shrink-0 overflow-hidden bg-stone-100">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">{product.brand}</span>
              <div className="flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs text-stone-700">{product.rating}</span>
                <span className="text-xs text-stone-400">({product.reviewCount})</span>
              </div>
            </div>
            <h3 className="text-base font-semibold text-stone-800 mb-1">{product.name}</h3>
            <p className="text-sm text-stone-500 mb-2 line-clamp-2">{product.description}</p>
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-stone-400" />
              <span className="text-xs text-stone-400">{product.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-900">Rs. {product.rentalPrice.toLocaleString()}</span>
                <span className="text-sm text-stone-400">/day</span>
              </div>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all
                  ${isInWishlist
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'}`}
              >
                <Heart size={13} fill={isInWishlist ? 'currentColor' : 'none'} />
                {isInWishlist ? 'Wishlisted' : 'Wishlist'}
              </button>
              <button
                disabled={product.stock === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all
                  ${product.stock > 0
                    ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm hover:shadow-md'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
              >
                <ShoppingBag size={13} />
                Rent Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-stone-800">
      {/* ── Toast ── */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border
            ${showToast.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-700'
              : 'bg-white border-stone-200 text-stone-600'}`}>
            {showToast.type === 'success' ? '✓' : 'ℹ'} {showToast.message}
          </div>
        </div>
      )}

      {/* ── Quick View Modal ── */}
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
                <img
                  src={quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
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

      {/* ── Category Hero ── */}
      <div className="bg-white border-b border-stone-100">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-5">
            <Link to="/" className="hover:text-stone-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/categories" className="hover:text-stone-600 transition-colors">Categories</Link>
            <ChevronRight size={12} />
            <span className="text-stone-600">{categoryInfo.title}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl shrink-0">
              {categoryInfo.icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">{categoryInfo.title}</h1>
              <p className="text-stone-500 text-sm">{categoryInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="container mx-auto px-4 py-7">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Desktop Filter Sidebar ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sticky top-4">
              <FilterContent />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* View mode toggles */}
                <div className="flex bg-stone-100 rounded-xl p-1 gap-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-stone-900 text-amber-400 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <Grid3X3 size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-stone-900 text-amber-400 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <List size={15} />
                  </button>
                </div>

                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:border-stone-300 transition-all"
                >
                  <SlidersHorizontal size={13} />
                  Filters {activeFiltersCount > 0 && <span className="bg-stone-900 text-amber-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{activeFiltersCount}</span>}
                </button>

                <span className="text-xs text-stone-400 hidden sm:block">
                  {sortedProducts.length} item{sortedProducts.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Sort by</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name_az">Name: A–Z</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {searchTerm && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-amber-400 rounded-full text-xs font-medium">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-amber-300 transition-colors"><X size={11} /></button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-amber-400 rounded-full text-xs font-medium">
                    {brand}
                    <button onClick={() => setSelectedBrands(prev => prev.filter(b => b !== brand))} className="hover:text-amber-300"><X size={11} /></button>
                  </span>
                ))}
                {minRating > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-amber-400 rounded-full text-xs font-medium">
                    {minRating}+ Stars
                    <button onClick={() => setMinRating(0)} className="hover:text-amber-300"><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-5">
                  <Package size={28} className="text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">No products found</h3>
                <p className="text-stone-400 text-sm mb-5">Try adjusting your filters or search term</p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-stone-900 text-amber-400 rounded-xl font-semibold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedProducts.map(product => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                        ${currentPage === pageNum
                          ? 'bg-stone-900 text-amber-400 shadow-md shadow-stone-900/10'
                          : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-stone-200 overflow-auto shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-stone-800">Filters</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-6 py-2.5 bg-stone-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;