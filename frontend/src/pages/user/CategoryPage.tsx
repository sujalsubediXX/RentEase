// src/pages/user/CategoryPage.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, Star,
  Heart, Eye, ShoppingBag, X, ChevronLeft, ChevronRight,
  MapPin, Package, Loader2,
} from 'lucide-react';
import axios from 'axios'
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { ImageSlider } from './ImageSlider';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Skeletons ────────────────────────────────────────────────────────────────

const ProductSkeleton: React.FC = () => (
  <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-stone-100" />
    <div className="p-4 space-y-2">
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-stone-200 rounded" />
        <div className="h-3 w-12 bg-stone-200 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-stone-200 rounded" />
      <div className="h-3 w-24 bg-stone-200 rounded" />
      <div className="flex justify-between pt-1">
        <div className="h-5 w-20 bg-stone-200 rounded" />
        <div className="h-5 w-16 bg-stone-200 rounded" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="flex-1 h-8 bg-stone-200 rounded-xl" />
        <div className="flex-1 h-8 bg-stone-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ─── Data helpers ─────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const extractItems = (data: any): { items: any[]; totalPages: number } => {
  if (Array.isArray(data)) return { items: data, totalPages: 1 };
  if (data?.success && Array.isArray(data?.data)) return { items: data.data, totalPages: data.totalPages || 1 };
  if (Array.isArray(data?.items)) return { items: data.items, totalPages: data.totalPages || 1 };
  if (Array.isArray(data?.data)) return { items: data.data, totalPages: data.totalPages || 1 };
  return { items: [], totalPages: 1 };
};

const buildImageUrl = (img: string): string => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `${API_BASE}${img}`;
  return `${API_BASE}/uploads/items/${img}`;
};

const mapItem = (item: any, categoryId: string): Product => {
  const imageUrls =
    item.images?.length > 0
      ? item.images.map(buildImageUrl).filter(Boolean)
      : ['https://picsum.photos/id/20/300/300'];

  const rentalPrice = item.rentalPrice ?? item.price ?? 0;
  return {
    id: item._id,
    name: item.name || item.title || 'Unnamed Product',
    description: item.description || 'No description available',
    rentalPrice,
    originalPrice: item.originalPrice ?? (rentalPrice ? Math.round(rentalPrice * 1.5) : undefined),
    images: imageUrls,
    category: item.category || 'Products',
    categoryId: item.categoryId || categoryId,
    brand: item.brand || item.condition || 'General',
    rating: item.rating ?? 4.0,
    reviewCount: item.reviewCount ?? 0,
    stock: item.stock ?? item.quantity ?? 5,
    location: item.location || 'Kathmandu',
  };
};

// ─── Filter sidebar ───────────────────────────────────────────────────────────

interface FilterContentProps {
  searchTerm: string; setSearchTerm: (v: string) => void;
  priceRange: [number, number]; setPriceRange: (v: [number, number]) => void;
  availableBrands: string[];
  selectedBrands: string[]; setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  minRating: number; setMinRating: (v: number) => void;
  activeFiltersCount: number; clearAllFilters: () => void;
}

const FilterContent: React.FC<FilterContentProps> = ({
  searchTerm, setSearchTerm, priceRange, setPriceRange,
  availableBrands, selectedBrands, setSelectedBrands,
  minRating, setMinRating, activeFiltersCount, clearAllFilters,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-stone-800 uppercase tracking-wider">Filters</span>
      {activeFiltersCount > 0 && (
        <button onClick={clearAllFilters} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
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
          type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400
                     focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
        />
      </div>
    </div>

    {/* Price */}
    <div>
      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Price per day (Rs.)</label>
      <div className="flex gap-2">
        {(['Min', 'Max'] as const).map((label, i) => (
          <input key={label} type="number" placeholder={label}
            value={priceRange[i]}
            onChange={e => {
              const v = Number(e.target.value);
              setPriceRange(i === 0 ? [v, priceRange[1]] : [priceRange[0], v]);
            }}
            className="w-1/2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700
                       focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        ))}
      </div>
    </div>

    {/* Brands */}
    {availableBrands.length > 0 && (
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Brands</label>
        <div className="space-y-2">
          {availableBrands.map(brand => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setSelectedBrands(prev =>
                prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
              )}>
              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0
                ${selectedBrands.includes(brand) ? 'bg-stone-900 border-stone-900' : 'border-stone-300 group-hover:border-stone-400'}`}>
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

    {/* Rating */}
    <div>
      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Min Rating</label>
      <div className="flex gap-2">
        {[0, 3, 4, 4.5].map(r => (
          <button key={r} onClick={() => setMinRating(r)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${minRating === r ? 'bg-stone-900 text-amber-400 shadow-sm' : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-300'}`}>
            {r === 0 ? 'All' : `${r}★`}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastState { message: string; type: 'success' | 'error' | 'info' }

// ─── Main Component ───────────────────────────────────────────────────────────

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  // Real cart + wishlist via hooks
  const cart = useCart();
  const wishlist = useWishlist();

  // Track per-item loading so buttons show spinners independently
  const [cartLoading, setCartLoading] = useState<Record<string, boolean>>({});
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({});

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const apiPageRef = useRef(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const itemsPerPage = 8;

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Fetch products via axios
  const fetchProducts = useCallback(async (pageNum: number, reset = false) => {
    if (!categoryId) { setInitialLoading(false); return; }
    try {
      reset ? setInitialLoading(true) : setFetchLoading(true);
      const { data: responseData } = await axios.get(
        `/items/getitemsbycategory/${categoryId}`,
        { params: { page: pageNum, limit: 20 } }
      );
      const { items: rawItems, totalPages } = extractItems(responseData);
      const mapped = rawItems.map((i: any) => mapItem(i, categoryId));
      setProducts(prev => reset ? mapped : [...prev, ...mapped]);
      setHasMore(pageNum < totalPages);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load products', 'error');
    } finally {
      setInitialLoading(false);
      setFetchLoading(false);
    }
  }, [categoryId, showToast]);

  // Init
  useEffect(() => {
    if (!categoryId) { setInitialLoading(false); return; }
    setProducts([]);
    apiPageRef.current = 1;
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(1, true);
    wishlist.fetchWishlist();
    cart.fetchCart();
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup observer on unmount
  useEffect(() => () => { observerRef.current?.disconnect(); }, []);

  // Infinite scroll sentinel
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (fetchLoading) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !fetchLoading) {
        const next = apiPageRef.current + 1;
        apiPageRef.current = next;
        fetchProducts(next, false);
      }
    }, { threshold: 0.1 });
    if (node) observerRef.current.observe(node);
  }, [fetchLoading, hasMore, fetchProducts]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddToCart = async (product: Product) => {
    if (product.stock === 0) return;
    setCartLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      const message = await cart.addItem(product.id, 1, 1);
      showToast(message, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setCartLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleRentNow = async (product: Product) => {
    if (product.stock === 0) return;
    setCartLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      await cart.addItem(product.id, 1, 1);
      navigate('/checkout', { state: { product } });
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setCartLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    setWishlistLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const { message } = await wishlist.toggle(productId);
      showToast(message, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // ── Filter / sort / paginate ──────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    let f = [...products];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    f = f.filter(p => p.rentalPrice >= priceRange[0] && p.rentalPrice <= priceRange[1]);
    if (selectedBrands.length > 0) f = f.filter(p => selectedBrands.includes(p.brand));
    if (minRating > 0) f = f.filter(p => p.rating >= minRating);
    return f;
  }, [products, searchTerm, priceRange, selectedBrands, minRating]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case 'price_low': return arr.sort((a, b) => a.rentalPrice - b.rentalPrice);
      case 'price_high': return arr.sort((a, b) => b.rentalPrice - a.rentalPrice);
      case 'rating': return arr.sort((a, b) => b.rating - a.rating);
      case 'name_az': return arr.sort((a, b) => a.name.localeCompare(b.name));
      default: return arr;
    }
  }, [filteredProducts, sortBy]);

  const totalFilteredPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, priceRange, selectedBrands, minRating, sortBy]);

  const availableBrands = useMemo(() => [...new Set(products.map(p => p.brand))], [products]);

  const clearAllFilters = () => {
    setSearchTerm(''); setPriceRange([0, 50000]);
    setSelectedBrands([]); setMinRating(0); setSortBy('featured');
  };

  const activeFiltersCount = (searchTerm ? 1 : 0) + selectedBrands.length + (minRating > 0 ? 1 : 0);

  // ── Sub-components ────────────────────────────────────────────────────────

  const ActionButtons = ({ product, compact = false }: { product: Product; compact?: boolean }) => {
    const inWishlist = wishlist.isInWishlist(product.id);
    const inCart = cart.isInCart(product.id);
    const wLoading = wishlistLoading[product.id];
    const cLoading = cartLoading[product.id];
    const outOfStock = product.stock === 0;

    return (
      <div className={`flex gap-2 ${compact ? '' : 'w-full'}`}>
        {/* Wishlist toggle */}
        <button
          onClick={() => handleToggleWishlist(product.id)}
          disabled={wLoading}
          className={`${compact ? 'w-8 h-8 rounded-xl shadow-md' : 'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium'}
            flex items-center justify-center transition-all
            ${inWishlist ? 'bg-red-500 text-white border-red-500' : 'bg-white text-stone-400 border-stone-200 hover:text-red-500 hover:border-red-200 hover:shadow-md'}`}
        >
          {wLoading
            ? <Loader2 size={compact ? 13 : 13} className="animate-spin" />
            : <Heart size={compact ? 14 : 13} fill={inWishlist ? 'currentColor' : 'none'} />}
          {!compact && <span>{inWishlist ? 'Wishlisted' : 'Wishlist'}</span>}
        </button>

        {/* Add to cart */}
        <button
          onClick={() => handleAddToCart(product)}
          disabled={outOfStock || cLoading}
          className={`${compact ? 'w-8 h-8 rounded-xl shadow-md' : 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold'}
            flex items-center justify-center transition-all
            ${outOfStock
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : inCart
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm hover:shadow-md'}`}
        >
          {cLoading
            ? <Loader2 size={13} className="animate-spin" />
            : <ShoppingBag size={compact ? 14 : 13} />}
          {!compact && <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>}
        </button>
      </div>
    );
  };

  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const discount = product.originalPrice
      ? Math.round(((product.originalPrice - product.rentalPrice) / product.originalPrice) * 100)
      : null;
    const isLast = index === paginatedProducts.length - 1 && hasMore && !fetchLoading && viewMode === 'grid';

    return (
      <div ref={isLast ? sentinelRef : null}
        className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60 transition-all duration-300">
        <div className="relative overflow-hidden aspect-square">
          <ImageSlider images={product.images} />
          {discount && discount > 0 && (
            <span className="absolute top-3 left-3 z-20 bg-stone-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
              <span className="text-stone-600 text-sm font-semibold bg-white/90 px-3 py-1 rounded-full border border-stone-200">Out of Stock</span>
            </div>
          )}
          {/* Compact icon buttons overlaid on image */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            <ActionButtons product={product} compact />
            <button onClick={() => setQuickViewProduct(product)}
              className="w-8 h-8 rounded-xl bg-white text-stone-400 hover:text-stone-700 hover:shadow-lg flex items-center justify-center shadow-md transition-all">
              <Eye size={14} />
            </button>
          </div>
        </div>

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
                <span className="text-xs text-stone-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
              ${product.stock > 3 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : product.stock > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-red-50 text-red-500 border border-red-200'}`}>
              {product.stock > 3 ? 'Available' : product.stock > 0 ? `${product.stock} left` : 'Unavailable'}
            </span>
          </div>
          {/* Full-width Rent Now at the bottom */}
          <button
            disabled={product.stock === 0 || cartLoading[product.id]}
            onClick={() => handleRentNow(product)}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5
              ${product.stock > 0
                ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
          >
            {cartLoading[product.id] ? <Loader2 size={13} className="animate-spin" /> : null}
            Rent Now
          </button>
        </div>
      </div>
    );
  };

  const ProductListItem = ({ product, index }: { product: Product; index: number }) => {
    const isLast = index === paginatedProducts.length - 1 && hasMore && !fetchLoading && viewMode === 'list';
    return (
      <div ref={isLast ? sentinelRef : null}
        className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row">
        <div className="w-full md:w-44 h-44 shrink-0 overflow-hidden bg-stone-100 relative">
          <ImageSlider images={product.images} />
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
            <div className="flex gap-2 flex-wrap">
              <ActionButtons product={product} />
              <button
                disabled={product.stock === 0 || cartLoading[product.id]}
                onClick={() => handleRentNow(product)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all
                  ${product.stock > 0
                    ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
              >
                {cartLoading[product.id] ? <Loader2 size={13} className="animate-spin" /> : <ShoppingBag size={13} />}
                Rent Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Initial skeleton ──────────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-stone-200 rounded mb-4 animate-pulse" />
          <div className="h-4 w-72 bg-stone-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white text-stone-800 mt-12">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border
            ${toast.type === 'success' ? 'bg-white border-emerald-200 text-emerald-700'
              : toast.type === 'error' ? 'bg-white border-red-200 text-red-600'
                : 'bg-white border-stone-200 text-stone-600'}`}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'} {toast.message}
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{quickViewProduct.brand}</span>
                  <h2 className="text-xl font-bold text-stone-800 mt-0.5">{quickViewProduct.name}</h2>
                </div>
                <button onClick={() => setQuickViewProduct(null)}
                  className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden mb-5 bg-stone-100 aspect-video">
                <ImageSlider images={quickViewProduct.images} />
              </div>
              <p className="text-stone-500 mb-5 text-sm leading-relaxed">{quickViewProduct.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
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
              {/* Cart + Wishlist actions inside quick view */}
              <div className="flex gap-3">
                <ActionButtons product={quickViewProduct} />
                <button
                  disabled={quickViewProduct.stock === 0 || cartLoading[quickViewProduct.id]}
                  onClick={() => handleRentNow(quickViewProduct)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                    ${quickViewProduct.stock > 0
                      ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}>
                  {cartLoading[quickViewProduct.id] ? <Loader2 size={14} className="animate-spin" /> : null}
                  Rent Now — Rs. {quickViewProduct.rentalPrice.toLocaleString()}/day
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowMobileFilters(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-auto p-5 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-stone-800">Filters</span>
              <button onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <FilterContent
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              priceRange={priceRange} setPriceRange={setPriceRange}
              availableBrands={availableBrands}
              selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands}
              minRating={minRating} setMinRating={setMinRating}
              activeFiltersCount={activeFiltersCount} clearAllFilters={clearAllFilters}
            />
            <button onClick={() => setShowMobileFilters(false)}
              className="mt-5 w-full py-2.5 bg-stone-900 text-amber-400 font-bold rounded-xl text-sm">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-white border-b border-stone-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-5">
            <Link to="/" className="hover:text-stone-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/categories" className="hover:text-stone-600 transition-colors">Categories</Link>
            <ChevronRight size={12} />
            <span className="text-stone-600">Products</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl shrink-0">📦</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">Category Products</h1>
              <p className="text-stone-500 text-sm">Browse and rent from our curated collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="container mx-auto px-4 py-7">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sticky top-4">
              <FilterContent
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                priceRange={priceRange} setPriceRange={setPriceRange}
                availableBrands={availableBrands}
                selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands}
                minRating={minRating} setMinRating={setMinRating}
                activeFiltersCount={activeFiltersCount} clearAllFilters={clearAllFilters}
              />
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-100">
                  <SlidersHorizontal size={14} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
                <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                  {sortedProducts.length} result{sortedProducts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-4 ml-auto sm:ml-0">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none">
                  <option value="featured">Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name_az">Name: A–Z</option>
                </select>
                <div className="flex items-center gap-1 border border-stone-200 bg-stone-50 rounded-xl p-0.5">
                  {(['grid', 'list'] as const).map(mode => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                      {mode === 'grid' ? <Grid3X3 size={14} /> : <List size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty state */}
            {sortedProducts.length === 0 && !initialLoading ? (
              <div className="text-center py-16 bg-stone-50 border border-stone-200 rounded-2xl">
                <Package className="mx-auto text-stone-300 mb-3" size={40} />
                <h3 className="text-base font-bold text-stone-700 mb-1">No matches found</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto mb-4">Try adjusting your filters or search terms.</p>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="text-xs px-4 py-2 bg-stone-900 text-amber-400 font-bold rounded-xl hover:bg-stone-800">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProducts.map((p, i) => <ProductListItem key={p.id} product={p} index={i} />)}
              </div>
            )}

            {/* Infinite scroll loading indicator */}
            {fetchLoading && (
              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-stone-400 font-medium">
                <Loader2 size={14} className="animate-spin" /> Loading more...
              </div>
            )}

            {/* Pagination */}
            {totalFilteredPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-stone-50 transition-all">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-stone-600 px-2">
                  Page {currentPage} of {totalFilteredPages}
                </span>
                <button disabled={currentPage === totalFilteredPages} onClick={() => setCurrentPage(p => Math.min(totalFilteredPages, p + 1))}
                  className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-stone-50 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;