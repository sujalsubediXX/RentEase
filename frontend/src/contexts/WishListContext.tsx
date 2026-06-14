import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (itemId: string) => boolean;
  toggleWishlist: (itemId: string) => Promise<void>;
  pendingIds: Set<string>;
  loading: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────────
const WishlistContext = createContext<WishlistContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch wishlist");

        const data = await res.json();
        // data.items is an array of item IDs: ["6a27ec49...", "6a24e931..."]
        setWishlistIds(data.items || []);
      } catch (err) {
        console.error("Wishlist fetch error:", err);
        // Silently fail — user can still browse
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const isWishlisted = useCallback(
    (itemId: string) => wishlistIds.includes(itemId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (itemId: string) => {
      // Block if already pending for this item
      if (pendingIds.has(itemId)) return;

      const wasWishlisted = wishlistIds.includes(itemId);

      // 1. Optimistic update
      setWishlistIds((prev) =>
        wasWishlisted
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
      setPendingIds((prev) => new Set(prev).add(itemId));

      try {
        if (wasWishlisted) {
          // Remove
          const res = await fetch(`/api/wishlist/${itemId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!res.ok) throw new Error("Failed to remove from wishlist");
          toast.success("Removed from wishlist");
        } else {
          // Add
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ itemId }),
          });
          if (!res.ok) throw new Error("Failed to add to wishlist");
          toast.success("Added to wishlist");
        }
      } catch (err) {
        // 2. Rollback on failure
        setWishlistIds((prev) =>
          wasWishlisted
            ? [...prev, itemId]
            : prev.filter((id) => id !== itemId)
        );
        toast.error("Something went wrong. Please try again.");
        console.error("Wishlist toggle error:", err);
      } finally {
        // 3. Always clear pending
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [wishlistIds, pendingIds]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, isWishlisted, toggleWishlist, pendingIds, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};