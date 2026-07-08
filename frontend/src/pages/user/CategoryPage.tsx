import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import { ImageSlider } from './ImageSlider';
import axios from 'axios';
import { ProductCard } from '../../components/user/ProductCard';
import { ProductListItem } from '../../components/user/ProductListItem';
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { authService } from '../../services/auth.services';
import type { Product } from '../../types/index';

interface CategoryInfo {
  _id: string;
  name: string;
  description: string;
  image?: string;
}

// ============ TYPES ============

// Skeleton Loader Component
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

const extractItems = (responseData: any): { items: any[]; totalPages: number } => {
  if (Array.isArray(responseData)) {
    return { items: responseData, totalPages: 1 };
  }
  if (responseData?.success && Array.isArray(responseData?.data)) {
    return { items: responseData.data, totalPages: responseData.totalPages || 1 };
  }
  if (Array.isArray(responseData?.items)) {
    return { items: responseData.items, totalPages: responseData.totalPages || 1 };
  }
  if (Array.isArray(responseData?.data)) {
    return { items: responseData.data, totalPages: responseData.totalPages || 1 };
  }
  return { items: [], totalPages: 1 };
};

const mapItemToProduct = (item: any, categoryId: string): Product => {
  const buildImageUrl = (img: string): string => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${API_BASE_URL}${img}`;
    return `${API_BASE_URL}/uploads/items/${img}`;
  };

  const imageUrls: string[] =
    item.images && Array.isArray(item.images) && item.images.length > 0
      ? item.images.map(buildImageUrl).filter(Boolean)
      : ['https://picsum.photos/id/20/300/300'];




  return {
    id: item._id,
    name: item.name || item.title || 'Unnamed Product',
    description: item.description || 'No description available',
    price: item.price,
    images: imageUrls,
    category: item.category || 'Products',
    categoryId: item.categoryId || categoryId,
    availability: item.availability,

    avgRating: item.avgRating ?? 4.0,
    reviewCount: item.reviewCount ?? 0,
    stock: item.stock ?? item.quantity ?? 5,
    location: item.location || 'Kathmandu',
    createdAt: item.createdAt
  };
};

interface FilterContentProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;

  minRating: number;
  setMinRating: (v: number) => void;
  activeFiltersCount: number;
  clearAllFilters: () => void;
}

const FilterContent: React.FC<FilterContentProps> = ({
  searchTerm, setSearchTerm,
  priceRange, setPriceRange,

  minRating, setMinRating,
  activeFiltersCount, clearAllFilters,
}) => (
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

// ============ MAIN COMPONENT ============
const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user, isAuthenticated } = useAuth();
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<Set<string>>(new Set());

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const itemsPerPage = 8;


  const token = authService.getAccessToken();



  // Fetch wishlist on mount
  const fetchWishlist = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/wishlist/wishitem`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      const ids: string[] = (data.items ?? [])
        .map((item: any) =>
          typeof item === 'string' ? item : (item._id ?? item.id ?? '')
        )
        .filter(Boolean);

      setWishlist(ids);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    if (!token) {
      return;
    }

    fetchWishlist();
  }, [fetchWishlist, isAuthenticated, user?.id]);

  // Fetch this category's own name/description so the hero says something
  // real instead of a generic "Category Products" label. Failing silently
  // here just falls back to the generic copy — it never blocks the page.
  useEffect(() => {
    if (!categoryId) return;
    const fetchCategoryInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/category/getcategory`);
        const match = (Array.isArray(res.data) ? res.data : res.data?.data || [])
          .find((c: CategoryInfo) => c._id === categoryId);
        if (match) setCategoryInfo(match);
      } catch (err) {
        console.error('Failed to fetch category info:', err);
      }
    };
    fetchCategoryInfo();
  }, [categoryId]);

  // Fetch products from API
  const fetchProducts = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!categoryId) {
      setInitialLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/api/items/getitemsbycategory/${categoryId}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server responded ${res.status}: ${text}`);
      }

      const responseData = await res.json();
      const { items: itemsArray, totalPages: pages } = extractItems(responseData);

      if (itemsArray.length === 0 && reset) {
        setProducts([]);
        setHasMore(false);
        return;
      }

      const newItems = itemsArray.map((item: any) =>
        mapItemToProduct(item, categoryId)
      );

      if (reset) {
        setProducts(newItems);
      } else {
        setProducts(prev => [...prev, ...newItems]);
      }

      setTotalPages(pages);
      setHasMore(pageNum < pages);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      const message = err?.message || 'Failed to load products';
      setError(message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [categoryId]);

  // Fetch on mount / category change
  useEffect(() => {
    if (categoryId) {
      setProducts([]);
      setPage(1);
      setCurrentPage(1);
      setHasMore(true);
      setInitialLoading(true);
      setError(null);
      fetchProducts(1, true);
    } else {
      setInitialLoading(false);
    }
  }, [categoryId, fetchProducts]);

  const addToCart = async (product: Product) => {
    try {
      if (!isAuthenticated || !user?.id) {
        toast.error("Please login first");
        return;
      }
      if (user?.kycStatus !== "verified") {
        toast.error("Please complete KYC verification to add items to cart.");
        return;
      }

      const payload = {
        itemId: product.id,
        quantity: 1,
        rentalDays: 1,
        // startDate: today.toISOString().split("T")[0],
        // endDate: end.toISOString().split("T")[0],
      };

      const res = await fetch(`${API_BASE_URL}/api/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }

      toast.success("Added to cart");
    } catch (err) {
      console.log(err);
      toast.error("Failed to add to cart");
    }
  };

  const toggleWishlist = async (productId: string) => {

    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    // Prevent double-clicks while request is in flight
    if (wishlistLoading.has(productId)) return;

    const isInWishlist = wishlist.includes(productId);

    // Optimistic UI update
    setWishlist(prev =>
      isInWishlist ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    setWishlistLoading(prev => new Set(prev).add(productId));

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`${API_BASE_URL}/api/wishlist/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.error('Removed from wishlist');
      } else {
        // Add to wishlist
        await axios.post(`${API_BASE_URL}/api/wishlist/add/`, { itemId: productId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Added to wishlist');
      }
    } catch (error) {
      // Revert optimistic update on failure
      setWishlist(prev =>
        isInWishlist ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Infinite scroll observer
  const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading && !initialLoading && products.length > 0) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, false);
      }
    }, { threshold: 0.1 });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, page, fetchProducts, initialLoading, products.length]);

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)

      );
    }

    filtered = filtered.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );



    if (minRating > 0) {
      filtered = filtered.filter(p => p.avgRating >= minRating);
    }

    return filtered;
  }, [products, searchTerm, priceRange, minRating]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case 'price_low': return arr.sort((a, b) => a.price - b.price);
      case 'price_high': return arr.sort((a, b) => b.price - a.price);
      case 'rating': return arr.sort((a, b) => b.avgRating - a.avgRating);
      case 'name_az': return arr.sort((a, b) => a.name.localeCompare(b.name));
      default: return arr;
    }
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalFilteredPages = Math.ceil(sortedProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, minRating, sortBy]);


  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 50000]);

    setMinRating(0);
    setSortBy('featured');
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) + (minRating > 0 ? 1 : 0);

  // Handler for "Rent Now" from product cards
  const handleRentNow = (product: Product) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please login first");
      return;
    }
    if (user?.kycStatus !== "verified") {
      toast.error("Please complete KYC verification to rent items.");
      return;
    }
    navigate("/checkout", {
      state: {
        type: "single",
        items: [{ item: product, quantity: 1 }],
      },
    });
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

  return (
    <div className="min-h-screen bg-white text-stone-800 mt-12">

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
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{quickViewProduct.location}</span>
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
                <ImageSlider images={quickViewProduct.images} />
              </div>

              <p className="text-stone-500 mb-5 text-sm leading-relaxed">{quickViewProduct.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Price', value: `Rs ${quickViewProduct.price}` },
                  { label: 'Rating', value: `${quickViewProduct.avgRating} ★` },
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
                onClick={() => navigate('/checkout', { state: { product: quickViewProduct } })}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all
                  ${quickViewProduct.stock > 0
                    ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm hover:shadow-md'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
              >
                Rent Now — Rs. {quickViewProduct.price.toLocaleString()}/day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Hero — now shows the real category name/description when
          available, with a small punched-hole accent on the icon tile to
          keep the tag motif consistent with Home and the Categories page */}
      <div className="bg-white border-b border-stone-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-5">
            <Link to="/" className="hover:text-stone-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/categories" className="hover:text-stone-600 transition-colors">Categories</Link>
            <ChevronRight size={12} />
            <span className="text-stone-600">{categoryInfo?.name || 'Products'}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              <span aria-hidden="true" className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full border-2 border-stone-700" />
              {categoryInfo?.image ? (
                <img
                  src={`${API_BASE_URL}/uploads/categories/${categoryInfo.image}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                '📦'
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">
                {categoryInfo?.name || 'Category Products'}
              </h1>
              {/* <p className="text-stone-500 text-sm max-w-xl">
                {categoryInfo?.description || 'Browse our collection of products'}
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-4 py-7">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sticky top-4">
              <FilterContent
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                priceRange={priceRange}
                setPriceRange={setPriceRange}

                minRating={minRating}
                setMinRating={setMinRating}
                activeFiltersCount={activeFiltersCount}
                clearAllFilters={clearAllFilters}
              />
            </div>
          </aside>

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
                  Filters {activeFiltersCount > 0 && (
                    <span className="bg-stone-900 text-amber-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <span className="text-xs text-stone-400 hidden sm:block font-mono">
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

            {/* Empty State */}
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

            {/* Products - Using extracted components */}
            {!error && !initialLoading && paginatedProducts.length > 0 && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product, index) => {
                    const shouldAttachRef = index === paginatedProducts.length - 1 && hasMore && !loading;
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        isInWishlist={wishlist.includes(product.id)}
                        onToggleWishlist={toggleWishlist}
                        onQuickView={setQuickViewProduct}
                        onAddToCart={addToCart}
                        onRentNow={handleRentNow}
                        cardRef={shouldAttachRef ? lastProductElementRef : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedProducts.map((product, index) => {
                    const shouldAttachRef = index === paginatedProducts.length - 1 && hasMore && !loading;
                    return (
                      <ProductListItem
                        key={product.id}
                        product={product}
                        index={index}
                        isInWishlist={wishlist.includes(product.id)}
                        onToggleWishlist={toggleWishlist}
                        onRentNow={handleRentNow}
                        listRef={shouldAttachRef ? lastProductElementRef : undefined}
                      />
                    );
                  })}
                </div>
              )
            )}

            {/* Loading more */}
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

            {/* Pagination */}
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
                  let pageNum: number;
                  if (totalFilteredPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
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
                  className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {!hasMore && sortedProducts.length > 0 && (
              <div className="text-center mt-8 py-4 text-stone-400 text-sm">
                You've reached the end of the products
              </div>
            )}
          </div>
        </div>
      </div>

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
              <FilterContent
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                activeFiltersCount={activeFiltersCount}
                clearAllFilters={clearAllFilters}
              />
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