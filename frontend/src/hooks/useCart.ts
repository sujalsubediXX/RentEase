// src/hooks/useCart.ts
import { useState, useCallback } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios'

export interface CartItem {
  cartItemId: string;
  item: {
    _id: string;
    name: string;
    images: string[];
    rentalPrice: number;
    stock: number;
    location: string;
    brand: string;
  };
  quantity: number;
  rentalDays: number;
  priceSnapshot: number;
  lineTotal: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  items: CartItem[];
  totalCost: number;
}

// Fetch the full cart
export const getCart = async (): Promise<CartResponse> => {
  const { data } = await axios.get<CartResponse>('/cart');
  return data;
};

// Add an item to the cart
export const addToCart = async (
  itemId: string,
  quantity = 1,
  rentalDays = 1
): Promise<CartResponse> => {
  const { data } = await axios.post<CartResponse>(`${API_BASE_URL}/cart/add`, {
    itemId,
    quantity,
    rentalDays,
  });
  return data;
};

// Update quantity / rental days for a cart line item
export const updateCartItem = async (
  cartItemId: string,
  updates: { quantity?: number; rentalDays?: number }
): Promise<CartResponse> => {
  const { data } = await axios.patch<CartResponse>(
    `${API_BASE_URL}/cart/update/${cartItemId}`,
    updates
  );
  return data;
};

// Remove a single item from the cart
export const removeFromCart = async (cartItemId: string): Promise<CartResponse> => {
  const { data } = await axios.delete<CartResponse>(
    `${API_BASE_URL}/cart/remove/${cartItemId}`
  );
  return data;
};

// Empty the entire cart
export const clearCart = async (): Promise<CartResponse> => {
  const { data } = await axios.delete<CartResponse>(`${API_BASE_URL}/cart/clear `);
  return data;
};
interface UseCartReturn {
  cartItems: CartItem[];
  totalCost: number;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (itemId: string, quantity?: number, rentalDays?: number) => Promise<string>;
  updateItem: (cartItemId: string, updates: { quantity?: number; rentalDays?: number }) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  emptyCart: () => Promise<void>;
  isInCart: (itemId: string) => boolean;
}

export const useCart = (): UseCartReturn => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncState = (items: CartItem[], cost: number) => {
    setCartItems(items);
    setTotalCost(cost);
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCart();
      syncState(res.items, res.totalCost);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  // Returns the success message so the caller can show a toast
  const addItem = useCallback(
    async (itemId: string, quantity = 1, rentalDays = 1): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const res = await addToCart(itemId, quantity, rentalDays);
        syncState(res.items, res.totalCost);
        return res.message || 'Added to cart';
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to add to cart';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateItem = useCallback(
    async (cartItemId: string, updates: { quantity?: number; rentalDays?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await updateCartItem(cartItemId, updates);
        syncState(res.items, res.totalCost);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to update cart');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeItem = useCallback(async (cartItemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await removeFromCart(cartItemId);
      syncState(res.items, res.totalCost);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to remove item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const emptyCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await clearCart();
      syncState([], 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isInCart = useCallback(
    (itemId: string) => cartItems.some((ci) => ci.item._id === itemId),
    [cartItems]
  );

  return {
    cartItems,
    totalCost,
    loading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    emptyCart,
    isInCart,
  };
};