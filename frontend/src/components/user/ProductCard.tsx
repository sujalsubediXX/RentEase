// components/ProductCard.tsx
import React from 'react';
import { Heart, Eye, MapPin, Star } from 'lucide-react';
import { ImageSlider } from '../../pages/user/ImageSlider'; // adjust path as needed
// types/product.ts
export interface Product {
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

interface ProductCardProps {
  product: Product;
  index: number;
  isInWishlist: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onRentNow: (product: Product) => void;
  cardRef?: (node: HTMLDivElement | null) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  isInWishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onRentNow,
  cardRef,
}) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.rentalPrice) / product.originalPrice) * 100)
    : null;

  return (
    <div
      ref={cardRef}
      className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60 transition-all duration-300"
    >
      <div className="relative overflow-hidden aspect-square">
        <ImageSlider images={product.images} />

        {discount && discount > 0 && (
          <span className="absolute top-3 left-3 z-20 bg-stone-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
            <span className="text-stone-600 text-sm font-semibold bg-white/90 px-3 py-1 rounded-full border border-stone-200">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            onClick={() => onToggleWishlist(product.id)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all
              ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-stone-400 hover:text-red-500 hover:shadow-lg'}`}
          >
            <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onQuickView(product)}
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
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex-1 px-3 py-2 border border-stone-200 text-stone-500 rounded-xl hover:border-stone-300 hover:text-stone-700 transition-all text-xs font-medium"
          >
            Add to Cart
          </button>
          <button
            disabled={product.stock === 0}
            onClick={() => onRentNow(product)}
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