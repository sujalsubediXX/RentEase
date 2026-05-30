import React from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  productCount: number;
  color: string;
}

const categories: Category[] = [
  {
    id: 'cameras',
    name: 'Cameras & Photography',
    description: 'Professional cameras, lenses, and photography equipment',
    icon: '📷',
    image: 'https://picsum.photos/id/20/400/300',
    productCount: 4,
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'laptops',
    name: 'Laptops & Computers',
    description: 'High-performance laptops for work and gaming',
    icon: '💻',
    image: 'https://picsum.photos/id/0/400/300',
    productCount: 3,
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'dresses',
    name: 'Dresses & Fashion',
    description: 'Designer outfits for every occasion',
    icon: '👗',
    image: 'https://picsum.photos/id/30/400/300',
    productCount: 3,
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    icon: '📱',
    image: 'https://picsum.photos/id/2/400/300',
    productCount: 2,
    color: 'from-yellow-500 to-amber-600',
  },
];

const CategoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white-50" style={{ fontFamily: 'serif' }}>
      {/* Hero Section with Black and Yellow */}
      <div className="bg-white text-black pt-30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'serif' }}>
            Browse Categories
          </h1>
          <p className="text-xl text-yellow-600 italic max-w-2xl mx-auto" style={{ fontFamily: 'serif' }}>
            Find the perfect items to rent from our wide range of categories
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`}></div>
                <div className="absolute bottom-3 left-3 text-5xl">
                  {category.icon}
                </div>
              </div>
              
              {/* Category Info - White Background */}
              <div className="p-5 bg-white">
                <h3 className="text-xl font-bold text-black mb-2 group-hover:text-yellow-600 transition" style={{ fontFamily: 'serif' }}>
                  {category.name}
                </h3>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2" style={{ fontFamily: 'serif' }}>
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black font-medium" style={{ fontFamily: 'serif' }}>
                    {category.productCount} items available
                  </span>
                  <span className="text-yellow-600 group-hover:translate-x-1 transition">
                    Browse → 
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Why Choose Us Section - White Background Cards */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-black mb-12" style={{ fontFamily: 'serif' }}>
            Why Choose RentEase?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: 'serif' }}>Save Money</h3>
              <p className="text-gray-700" style={{ fontFamily: 'serif' }}>Rent items at a fraction of the purchase price</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: 'serif' }}>Eco-Friendly</h3>
              <p className="text-gray-700" style={{ fontFamily: 'serif' }}>Reduce waste by sharing resources</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: 'serif' }}>Verified Quality</h3>
              <p className="text-gray-700" style={{ fontFamily: 'serif' }}>All items are quality checked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;