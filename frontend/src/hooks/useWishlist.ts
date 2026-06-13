// src/hooks/useWishlist.ts
import { useState, useCallback } from 'react';
// src/services/wishlistService.ts
import axios from 'axios';
import API_BASE_URL from '../config/api';
export interface WishlistItem {
  _id: string;
  name: string;
  images: string[];
  rentalPrice: number;
  stock: number;
  location: string;
  brand: string;
  rating: number;
  reviewCount: number;
}

export interface WishlistResponse {
  success: boolean;
  message?: string;
  items: WishlistItem[];   // full populated objects
  itemIds: string[];       // just IDs — use for fast isInWishlist checks
}

export interface ToggleResponse {
  success: boolean;
  action: 'added' | 'removed';
  itemIds: string[];
}

// Fetch full wishlist
export const getWishlist = async (): Promise<WishlistResponse> => {
  const { data } = await axios.get<WishlistResponse>(`${API_BASE_URL}/wishlist`);
  return data;
};

// Toggle an item in/out of wishlist — returns updated ID list + action taken
export const toggleWishlistItem = async (itemId: string): Promise<ToggleResponse> => {
  const { data } = await axios.post<ToggleResponse>(`${API_BASE_URL}/wishlist/toggle`, {
    itemId,
  });
  return data;
};

// Explicit remove (e.g. from the wishlist page "Remove" button)
export const removeFromWishlist = async (itemId: string): Promise<WishlistResponse> => {
  const { data } = await axios.delete<WishlistResponse>(
    `${API_BASE_URL}/wishlist/remove/${itemId}`
  );
  return data;
};

interface UseWishlistReturn {
  wishlistItems: WishlistItem[];
  wishlistIds: string[];          // lightweight set of IDs for isInWishlist checks
  loading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  toggle: (itemId: string) => Promise<{ action: 'added' | 'removed'; message: string }>;
  remove: (itemId: string) => Promise<void>;
  isInWishlist: (itemId: string) => boolean;
}

export const useWishlist = (): UseWishlistReturn => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWishlist();
      setWishlistItems(res.items);
      setWishlistIds(res.itemIds);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggle = useCallback(async (itemId: string) => {
    setError(null);
    try {
      const res = await toggleWishlistItem(itemId);
      setWishlistIds(res.itemIds);
      // Also update the full items list optimistically for the wishlist page
      if (res.action === 'removed') {
        setWishlistItems((prev) => prev.filter((i) => i._id !== itemId));
      }
      return {
        action: res.action,
        message: res.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist',
      };
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update wishlist';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const remove = useCallback(async (itemId: string) => {
    setError(null);
    try {
      const res = await removeFromWishlist(itemId);
      setWishlistIds(res.itemIds);
      setWishlistItems((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to remove from wishlist';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const isInWishlist = useCallback(
    (itemId: string) => wishlistIds.includes(itemId),
    [wishlistIds]
  );

  return {
    wishlistItems,
    wishlistIds,
    loading,
    error,
    fetchWishlist,
    toggle,
    remove,
    isInWishlist,
  };
};