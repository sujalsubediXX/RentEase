// components/ProductListItem.tsx
import React from 'react';
import { Heart, ShoppingBag, MapPin, Star } from 'lucide-react';
import { ImageSlider } from '../../pages/user/ImageSlider';
// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  stock: number;
  location: string;
}

interface ProductListItemProps {
  product: Product;
  index: number;
  isInWishlist: boolean;
  onToggleWishlist: (productId: string) => void;
  onRentNow: (product: Product) => void;
  listRef?: (node: HTMLDivElement | null) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  isInWishlist,
  onToggleWishlist,
  onRentNow,
  listRef,
}) => {
  return (
    <div
      ref={listRef}
      className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-md hover:shadow-stone-200/60 transition-all duration-300 flex flex-col md:flex-row"
    >
      <div className="w-full md:w-44 h-44 shrink-0 overflow-hidden bg-stone-100 relative">
        <ImageSlider images={product.images} />
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">{product.category}</span>
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
              <span className="text-xl font-bold text-stone-900">Rs. {product.price}</span>
              <span className="text-sm text-stone-400">/day</span>
            </div>
           
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleWishlist(product.id)}
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
              onClick={() => onRentNow(product)}
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