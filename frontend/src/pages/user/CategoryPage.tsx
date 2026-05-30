import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// ============ TYPES ============
interface Product {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId: string; // Add this for URL matching
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  location: string;
}

//  MOCK DATA WITH CATEGORY MAPPING ------
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
    categoryId: 'cameras',
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
    categoryId: 'cameras',
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
    categoryId: 'cameras',
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
    categoryId: 'cameras',
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
    categoryId: 'laptops',
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
    categoryId: 'laptops',
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
    categoryId: 'laptops',
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
    categoryId: 'dresses',
    brand: 'Fashionista',
    rating: 4.2,
    reviewCount: 45,
    stock: 6,
    location: 'Lalitpur',
  },
  {
    id: '7',
    name: 'Men\'s Formal Suit',
    description: 'Formal black suit, size L',
    rentalPrice: 1000,
    originalPrice: 8000,
    images: ['https://picsum.photos/id/31/300/300'],
    category: 'Dresses & Fashion',
    categoryId: 'dresses',
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
    categoryId: 'dresses',
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
    category: 'Electronics',
    categoryId: 'electronics',
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
    category: 'Electronics',
    categoryId: 'electronics',
    brand: 'Apple',
    rating: 4.7,
    reviewCount: 312,
    stock: 5,
    location: 'Lalitpur',
  },
];

// ============ CATEGORY CONFIG ============
const categoryConfig: Record<string, { title: string; description: string; icon: string }> = {
  cameras: { title: 'Cameras & Photography', description: 'Rent professional cameras, lenses, and photography equipment for your special moments', icon: '📷' },
  laptops: { title: 'Laptops & Computers', description: 'High-performance laptops and computers for work, study, and gaming', icon: '💻' },
  dresses: { title: 'Dresses & Fashion', description: 'Designer outfits, traditional wear, and fashion accessories for every occasion', icon: '👗' },
  electronics: { title: 'Electronics', description: 'Latest gadgets, drones, tablets, and electronic devices', icon: '📱' },
};

// ============ MAIN COMPONENT ============
const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showToast, setShowToast] = useState<{ message: string; type: string } | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const itemsPerPage = 8;

  // Get category info - with fallback
  const categoryInfo = categoryId ? categoryConfig[categoryId] : null;
  
  // If category doesn't exist, show error or redirect
  useEffect(() => {
    if (categoryId && !categoryConfig[categoryId]) {
      // Invalid category, show message
      console.log('Invalid category:', categoryId);
    }
  }, [categoryId]);

  // Filter products based on category, search, price, brands, rating
  const filteredProducts = useMemo(() => {
    // First filter by categoryId
    let products = mockProducts.filter(p => p.categoryId === categoryId);
    
    console.log('Category ID:', categoryId);
    console.log('Filtered products count:', products.length);
    console.log('Available products:', mockProducts.map(p => ({ name: p.name, categoryId: p.categoryId })));
    
    // Search filter
    if (searchTerm) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Price filter
    products = products.filter(p => 
      p.rentalPrice >= priceRange[0] && p.rentalPrice <= priceRange[1]
    );
    
    // Brand filter
    if (selectedBrands.length > 0) {
      products = products.filter(p => selectedBrands.includes(p.brand));
    }
    
    // Rating filter
    if (minRating > 0) {
      products = products.filter(p => p.rating >= minRating);
    }
    
    return products;
  }, [categoryId, searchTerm, priceRange, selectedBrands, minRating]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    
    switch (sortBy) {
      case 'price_low':
        return products.sort((a, b) => a.rentalPrice - b.rentalPrice);
      case 'price_high':
        return products.sort((a, b) => b.rentalPrice - a.rentalPrice);
      case 'rating':
        return products.sort((a, b) => b.rating - a.rating);
      case 'name_az':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return products;
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, selectedBrands, minRating, sortBy]);

  // Get unique brands for filter
  const availableBrands = useMemo(() => {
    const products = mockProducts.filter(p => p.categoryId === categoryId);
    return [...new Set(products.map(p => p.brand))];
  }, [categoryId]);

  // Cart functions
  const addToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
    showToastMessage('Added to cart!', 'success');
  };

  // Wishlist functions
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
    setTimeout(() => setShowToast(null), 2000);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 5000]);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy('featured');
  };

  // Get active filters count
  const activeFiltersCount = (searchTerm ? 1 : 0) + (selectedBrands.length) + (minRating > 0 ? 1 : 0);

  // If no valid category, show all products or error message
  if (!categoryId || !categoryInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go Home
            </Link>
            <Link to="/how-it-works" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => {
    const isInWishlist = wishlist.includes(product.id);
    
    return (
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.originalPrice && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Save {Math.round(((product.originalPrice - product.rentalPrice) / product.originalPrice) * 100)}%
            </span>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
          >
            <svg className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{product.brand}</span>
            <div className="flex items-center">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
              <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-blue-600">₹{product.rentalPrice}</span>
              <span className="text-sm text-gray-500">/day</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setQuickViewProduct(product)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Quick View
            </button>
            <button
              onClick={() => addToCart(product.id)}
              disabled={product.stock === 0}
              className={`flex-1 px-3 py-2 rounded-lg transition text-sm ${product.stock > 0 ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // List View Card
  const ProductListItem = ({ product }: { product: Product }) => {
    const isInWishlist = wishlist.includes(product.id);
    
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-48 h-48 overflow-hidden rounded-lg">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{product.brand}</span>
            <div className="flex items-center">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-gray-500 mb-3">{product.description}</p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-2xl font-bold text-blue-600">₹{product.rentalPrice}</span>
              <span className="text-gray-500">/day</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleWishlist(product.id)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                {isInWishlist ? '❤️ Wishlisted' : '🤍 Wishlist'}
              </button>
              <button onClick={() => addToCart(product.id)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Rent Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-white ${showToast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}>
            {showToast.message}
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{quickViewProduct.name}</h2>
                <button onClick={() => setQuickViewProduct(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
              <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="w-full h-64 object-cover rounded-lg mb-4" />
              <p className="text-gray-600 mb-4">{quickViewProduct.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><span className="text-gray-500">Brand:</span> {quickViewProduct.brand}</div>
                <div><span className="text-gray-500">Rating:</span> {quickViewProduct.rating} ★</div>
                <div><span className="text-gray-500">Location:</span> {quickViewProduct.location}</div>
                <div><span className="text-gray-500">Availability:</span> {quickViewProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}</div>
              </div>
              <button onClick={() => addToCart(quickViewProduct.id)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Rent Now - ₹{quickViewProduct.rentalPrice}/day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {/* Hero Section - Black and Yellow */}
<div className="bg-white text-black-500 pt-25">
  <div className="container mx-auto px-4">
    <div className="flex items-center gap-3">
      <span className="text-4xl">{categoryInfo.icon}</span>
      <div className="py-3">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'serif' }}>{categoryInfo.title}</h1>
        <p className="text-yellow-600" style={{ fontFamily: 'serif' }}>{categoryInfo.description}</p>
      </div>
    </div>
  </div>
</div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="text-sm text-red-500 hover:text-red-600">
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per day (₹)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-1/2 px-2 py-1 border rounded-lg"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-1/2 px-2 py-1 border rounded-lg"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brands</label>
                  <div className="space-y-2">
                    {availableBrands.map(brand => (
                      <label key={brand} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4★ & above</option>
                  <option value={3}>3★ & above</option>
                  <option value={2}>2★ & above</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  ☰
                </button>
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden px-3 py-1 border rounded-lg text-sm"
                >
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500">Showing {paginatedProducts.length} of {sortedProducts.length} products</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name_az">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchTerm && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-blue-800">✕</button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center">
                    {brand}
                    <button onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))} className="ml-2 hover:text-blue-800">✕</button>
                  </span>
                ))}
                {minRating > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center">
                    {minRating}+ Stars
                    <button onClick={() => setMinRating(0)} className="ml-2 hover:text-blue-800">✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid/List */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                <button onClick={clearAllFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProducts.map(product => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 border rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 text-2xl">✕</button>
              </div>
              
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search..." 
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    value={priceRange[0]} 
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} 
                    className="w-1/2 px-2 py-1 border rounded-lg" 
                    placeholder="Min" 
                  />
                  <input 
                    type="number" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} 
                    className="w-1/2 px-2 py-1 border rounded-lg" 
                    placeholder="Max" 
                  />
                </div>
              </div>
              
              {availableBrands.length > 0 && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brands</label>
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center mb-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)} 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBrands([...selectedBrands, brand]);
                          else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                        }} 
                        className="mr-2" 
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => { 
                  setShowMobileFilters(false); 
                }} 
                className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
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