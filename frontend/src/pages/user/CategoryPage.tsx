
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, Star,
  Heart, Eye, ShoppingBag, X, ChevronLeft, ChevronRight,
  MapPin, Package
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { ImageSlider } from './ImageSlider'; // Import the ImageSlider component

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

// Skeleton Loader Component (same as before)
const ProductSkeleton: React.FC = () => (
  <div className="group bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-stone-100" />
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-16 bg-stone-200 rounded" />
        <div className="h-3 w-12 bg-stone-200 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-stone-200 rounded mb-2" />
      <div className="h-3 w-24 bg-stone-200 rounded mb-3" />
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="h-5 w-20 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-200 rounded mt-1" />
        </div>
        <div className="h-5 w-16 bg-stone-200 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-stone-200 rounded-xl" />
        <div className="flex-1 h-8 bg-stone-200 rounded-xl" />
      </div>
    </div>
  </div>
);

const ListItemSkeleton: React.FC = () => (
  <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse flex flex-col md:flex-row">
    <div className="w-full md:w-44 h-44 bg-stone-100" />
    <div className="flex-1 p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-16 bg-stone-200 rounded" />
        <div className="h-3 w-12 bg-stone-200 rounded" />
      </div>
      <div className="h-4 w-2/3 bg-stone-200 rounded mb-2" />
      <div className="h-3 w-full bg-stone-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-stone-200 rounded mb-3" />
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div>
          <div className="h-5 w-24 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-200 rounded mt-1" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-stone-200 rounded-xl" />
          <div className="h-8 w-24 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// ============ MAIN COMPONENT ============
const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
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

  // Fetch products from API
  const fetchProducts = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!categoryId) {
      console.log('No categoryId provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/items/getitemsByID/${categoryId}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.items) {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
        setLoading(false);
        setInitialLoading(false);
        return;
      }
      
      console.log(`Received ${response.data.items.length} items, page ${pageNum} of ${response.data.totalPages}`);
      
      if (response.data.items.length === 0 && reset) {
        setProducts([]);
        setHasMore(false);
        setLoading(false);
        setInitialLoading(false);
        return;
      }
      
      const newItems = response.data.items.map((item: any) => {
        let imageUrls = [];
        if (item.images && Array.isArray(item.images)) {
          imageUrls = item.images.map((img: string) => 
            img.startsWith('http') ? img : `http://localhost:3000${img}`
          );
        } else {
          imageUrls = ['https://picsum.photos/id/20/300/300'];
        }
        
        return {
          id: item._id,
          name: item.title || 'Unnamed Product',
          description: item.description || 'No description available',
          rentalPrice: item.price || 0,
          originalPrice: item.originalPrice || (item.price ? item.price * 1.5 : 0),
          images: imageUrls,
          category: item.category || 'Category',
          categoryId: item.categoryId || categoryId,
          brand: item.brand || 'Generic',
          rating: item.rating || 4.0,
          reviewCount: item.reviewCount || 0,
          stock: item.stock !== undefined ? item.stock : 5,
          location: item.location || 'Kathmandu',
        };
      });
      
      if (reset) {
        setProducts(newItems);
        console.log('Reset products with:', newItems.length, 'items');
      } else {
        setProducts(prev => {
          const updated = [...prev, ...newItems];
          console.log('Added more products. Total:', updated.length);
          return updated;
        });
      }
      
      setTotalPages(response.data.totalPages || 1);
      setHasMore(pageNum < (response.data.totalPages || 1));
      
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load products');
      showToastMessage('Failed to load products', 'error');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [categoryId]);

  // Fetch products on component mount and category change
  useEffect(() => {
    if (categoryId) {
      setProducts([]);
      setPage(1);
      setCurrentPage(1);
      setHasMore(true);
      setInitialLoading(true);
      setError(null);
      fetchProducts(1, true);
    }
  }, [categoryId, fetchProducts]);

  // Infinite scroll observer
  const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading && !initialLoading && products.length > 0) {
        const nextPage = page + 1;
        console.log('Loading more products, next page:', nextPage);
        setPage(nextPage);
        fetchProducts(nextPage, false);
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, page, fetchProducts, initialLoading, products.length]);

  // Filter and sort products locally
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered = filtered.filter(p => 
      p.rentalPrice >= priceRange[0] && p.rentalPrice <= priceRange[1]
    );
    
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }
    
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }
    
    return filtered;
  }, [products, searchTerm, priceRange, selectedBrands, minRating]);
    
    filtered = filtered.filter(p => 
      p.rentalPrice >= priceRange[0] && p.rentalPrice <= priceRange[1]
    );
    
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }
    
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }
    
    return filtered;
  }, [products, searchTerm, priceRange, selectedBrands, minRating]);

  const sortedProducts = useMemo(() => {
    const productsToSort = [...filteredProducts];
    switch (sortBy) {
      case 'price_low': 
        return productsToSort.sort((a, b) => a.rentalPrice - b.rentalPrice);
      case 'price_high': 
        return productsToSort.sort((a, b) => b.rentalPrice - a.rentalPrice);
      case 'rating': 
        return productsToSort.sort((a, b) => b.rating - a.rating);
      case 'name_az': 
        return productsToSort.sort((a, b) => a.name.localeCompare(b.name));
      default: 
        return productsToSort;
    }
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedProducts.slice(start, end);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalFilteredPages = Math.ceil(sortedProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, selectedBrands, minRating, sortBy]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, selectedBrands, minRating, sortBy]);

  const availableBrands = useMemo(() => {
    return [...new Set(products.map(p => p.brand))];
  }, [products]);

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
    setPriceRange([0, 50000]);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy('featured');
  };

  const activeFiltersCount = (searchTerm ? 1 : 0) + selectedBrands.length + (minRating > 0 ? 1 : 0);
  const activeFiltersCount = (searchTerm ? 1 : 0) + selectedBrands.length + (minRating > 0 ? 1 : 0);

  // Filter Sidebar (same as before)
  const FilterContent = () => (
    <div className="space-y-6">
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

  // Updated Product Card with ImageSlider
  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const isInWishlist = wishlist.includes(product.id);
    const discount = product.originalPrice
      ? Math.round(((product.originalPrice - product.rentalPrice) / product.originalPrice) * 100)
      : null;

    const isLastItem = index === paginatedProducts.length - 1;
    const shouldAttachRef = isLastItem && hasMore && !loading && viewMode === 'grid';

    const isLastItem = index === paginatedProducts.length - 1;
    const shouldAttachRef = isLastItem && hasMore && !loading && viewMode === 'grid';

    return (
      <div
        ref={shouldAttachRef ? lastProductElementRef : null}
        className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60 transition-all duration-300"
      >
        <div className="relative overflow-hidden">
          <ImageSlider images={product.images}  />
          
          {discount && discount > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-stone-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
      <div
        ref={shouldAttachRef ? lastProductElementRef : null}
        className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60 transition-all duration-300"
      >
        <div className="relative overflow-hidden">
          <ImageSlider images={product.images}  />
          
          {discount && discount > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-stone-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span className="text-stone-600 text-sm font-semibold bg-white/90 px-3 py-1 rounded-full border border-stone-200">
                Out of Stock
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
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

  // Updated List View Card with ImageSlider
  const ProductListItem = ({ product, index }: { product: Product; index: number }) => {
    const isInWishlist = wishlist.includes(product.id);
    const isLastItem = index === paginatedProducts.length - 1;
    const shouldAttachRef = isLastItem && hasMore && !loading && viewMode === 'list';
    const isLastItem = index === paginatedProducts.length - 1;
    const shouldAttachRef = isLastItem && hasMore && !loading && viewMode === 'list';

    return (
      <div
        ref={shouldAttachRef ? lastProductElementRef : null}
        className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-md hover:shadow-stone-200/60 transition-all duration-300 flex flex-col md:flex-row"
      >
      <div
        ref={shouldAttachRef ? lastProductElementRef : null}
        className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-md hover:shadow-stone-200/60 transition-all duration-300 flex flex-col md:flex-row"
      >
        <div className="w-full md:w-44 h-44 shrink-0 overflow-hidden bg-stone-100">
          <ImageSlider images={product.images}  />
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

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-stone-200 rounded mb-4" />
            <div className="h-4 w-96 bg-stone-200 rounded mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-stone-200 rounded mb-4" />
            <div className="h-4 w-96 bg-stone-200 rounded mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-800">
      {/* Toast */}
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border
            ${showToast.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-700'
              : showToast.type === 'error'
                ? 'bg-white border-red-200 text-red-600'
                : 'bg-white border-stone-200 text-stone-600'}`}>
            {showToast.type === 'success' ? '✓' : showToast.type === 'error' ? '✗' : 'ℹ'} {showToast.message}
              : showToast.type === 'error'
                ? 'bg-white border-red-200 text-red-600'
                : 'bg-white border-stone-200 text-stone-600'}`}>
            {showToast.type === 'success' ? '✓' : showToast.type === 'error' ? '✗' : 'ℹ'} {showToast.message}
          </div>
        </div>
      )}

      {/* Quick View Modal */}
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

              <div className="rounded-xl overflow-hidden mb-5 bg-stone-100">
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

      {/* Category Hero - Simple version without category fetch */}
      <div className="bg-white border-b border-stone-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-5">
            <Link to="/" className="hover:text-stone-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/categories" className="hover:text-stone-600 transition-colors">Categories</Link>
            <ChevronRight size={12} />
            <span className="text-stone-600">Products</span>
            <span className="text-stone-600">Products</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl shrink-0">
              📦
              📦
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">Category Products</h1>
              <p className="text-stone-500 text-sm">Browse our collection of products</p>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">Category Products</h1>
              <p className="text-stone-500 text-sm">Browse our collection of products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      {/* Main Layout */}
      <div className="container mx-auto px-4 py-7">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sticky top-4">
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
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
                {minRating > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-amber-400 rounded-full text-xs font-medium">
                    {minRating}+ Stars
                    <button onClick={() => setMinRating(0)} className="hover:text-amber-300"><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
                  <Package size={28} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">Error Loading Products</h3>
                <p className="text-stone-400 text-sm mb-5">{error}</p>
                <button
                  onClick={() => fetchProducts(1, true)}
                  className="px-5 py-2.5 bg-stone-900 text-amber-400 rounded-xl font-semibold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products - Empty State */}
            {!error && !initialLoading && paginatedProducts.length === 0 && !loading && (
            {/* Error State */}
            {error && (
              <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
                  <Package size={28} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">Error Loading Products</h3>
                <p className="text-stone-400 text-sm mb-5">{error}</p>
                <button
                  onClick={() => fetchProducts(1, true)}
                  className="px-5 py-2.5 bg-stone-900 text-amber-400 rounded-xl font-semibold text-sm hover:bg-amber-500 hover:text-stone-950 transition-all shadow-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products - Empty State */}
            {!error && !initialLoading && paginatedProducts.length === 0 && !loading && (
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
            )}

            {/* Products - Grid/List View */}
            {!error && !initialLoading && paginatedProducts.length > 0 && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedProducts.map((product, index) => (
                    <ProductListItem key={product.id} product={product} index={index} />
                  ))}
                </div>
              )
            )}

            {/* Products - Grid/List View */}
            {!error && !initialLoading && paginatedProducts.length > 0 && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedProducts.map((product, index) => (
                    <ProductListItem key={product.id} product={product} index={index} />
                  ))}
                </div>
              )
            )}

            {/* Loading More Indicator */}
            {loading && !initialLoading && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                  {Array(3).fill(0).map((_, i) => <ProductSkeleton key={`loading-${i}`} />)}
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {Array(2).fill(0).map((_, i) => <ListItemSkeleton key={`loading-${i}`} />)}
                </div>
              )
            )}

            {/* Pagination Controls */}
            {!hasMore && totalFilteredPages > 1 && (
            {/* Loading More Indicator */}
            {loading && !initialLoading && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                  {Array(3).fill(0).map((_, i) => <ProductSkeleton key={`loading-${i}`} />)}
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {Array(2).fill(0).map((_, i) => <ListItemSkeleton key={`loading-${i}`} />)}
                </div>
              )
            )}

            {/* Pagination Controls */}
            {!hasMore && totalFilteredPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(Math.min(totalFilteredPages, 5))].map((_, i) => {
                {[...Array(Math.min(totalFilteredPages, 5))].map((_, i) => {
                  let pageNum: number;
                  if (totalFilteredPages <= 5) pageNum = i + 1;
                  if (totalFilteredPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalFilteredPages - 2) pageNum = totalFilteredPages - 4 + i;
                  else if (currentPage >= totalFilteredPages - 2) pageNum = totalFilteredPages - 4 + i;
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
                  onClick={() => setCurrentPage(prev => Math.min(totalFilteredPages, prev + 1))}
                  disabled={currentPage === totalFilteredPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalFilteredPages, prev + 1))}
                  disabled={currentPage === totalFilteredPages}
                  className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* End of products message */}
            {!hasMore && sortedProducts.length > 0 && (
              <div className="text-center mt-8 py-4 text-stone-400 text-sm">
                You've reached the end of the products
              </div>
            )}

            {/* End of products message */}
            {!hasMore && sortedProducts.length > 0 && (
              <div className="text-center mt-8 py-4 text-stone-400 text-sm">
                You've reached the end of the products
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {/* Mobile Filter Drawer */}
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