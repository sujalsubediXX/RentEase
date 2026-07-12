// components/ProductCard.tsx
import React from 'react';
import { Heart, Eye, MapPin, Star } from 'lucide-react';
import { ImageSlider } from '../../pages/user/ImageSlider'; // adjust path as needed
import type { Product } from '../../types/index';

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

  isInWishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onRentNow,
  cardRef,
}) => {
  return (
    <div
      ref={cardRef}
      className="group relative bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-300"
    >
  
      <span
        aria-hidden="true"
        className="absolute top-3 left-3 z-20 w-2.5 h-2.5 rounded-full border-2 border-white/80 group-hover:border-amber-300 transition-colors pointer-events-none"
      />

      <div className="relative overflow-hidden aspect-square">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <ImageSlider images={product.images} />
        </div>

        <span className= {`${product.availability == "available"?"bg-amber-400  text-black ":"bg-stone-900 text-amber-400"} absolute top-3 left-8 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full text-xl`}>
          {product.availability}
        </span>

  
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            onClick={() => onToggleWishlist(product.id)}
            aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={isInWishlist}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
              ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-stone-400 hover:text-red-500 hover:shadow-lg'}`}
          >
            <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onQuickView(product)}
            aria-label={`Quick view ${product.name}`}
            className="w-8 h-8 rounded-xl bg-white text-stone-400 hover:text-stone-700 hover:shadow-lg flex items-center justify-center shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex justify-center items-center ">
                   <MapPin size={16} className=" pr-1" />{"  "}
            {product.location}</span>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-stone-700 font-medium">{product.avgRating.toFixed(1)}</span>
            <span className="text-xs text-stone-400">({product.reviewCount})</span>
          </div>
        </div>

        <h3 className="font-semibold text-stone-800 mb-1 line-clamp-1 text-sm">{product.name}</h3>

        <div className="flex items-center gap-1 mb-3">
 
          <span className="text-[11px] ">{product.category}</span>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-lg font-bold text-stone-900">Rs. {product.price}</span>
              <span className="text-xs text-stone-400">/day</span>
            </div>

          </div>

        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex-1 px-3 py-2 border border-stone-200 text-stone-500 rounded-xl hover:border-stone-300 hover:text-stone-700 transition-all text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
          <button
            disabled={product.stock === 0}
            onClick={() => onRentNow(product)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
              ${product.stock > 0
                ? 'bg-stone-900 text-amber-400 hover:bg-amber-500 hover:text-stone-950 shadow-sm hover:shadow-md'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
          >
            {
              product.availability=="available"?"Rent Now":"Book Item"
            }
            
          </button>
        </div>
      </div>
    </div>
  );
};