"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface SelectedOption {
  id: string;
  optionName: string;
  optionValue: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string; // Unique identifier for the item combination in the cart
  productId: string;
  productTitle: string;
  productImage: string;
  category: string;
  sellerShopName: string;
  variantId: string;
  topSize: string | null;
  bottomSize: string | null;
  basePrice: number; // price of the variant
  selectedOptions: SelectedOption[];
  quantity: number;
  unitPrice: number; // basePrice + sum of option priceAdjustments
  deliveryTimeline: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountPercent: number;
  discountAmount: number;
  minOrderValue: number;
  isPrepaidOnly: boolean;
  isActive: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "unitPrice">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  getDiscountAmount: (paymentType: string) => number;
  getTotalAmount: (paymentType: string) => number;
  isMounted: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data: session, status } = useSession();

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("boutique_cart");
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse stored cart items:", e);
      }
    }

    const storedCoupon = localStorage.getItem("boutique_coupon");
    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
      } catch (e) {
        console.error("Failed to parse stored coupon:", e);
      }
    }

    setIsMounted(true);
  }, []);

  // Sync local cart to db on login, or load db cart if local is empty
  useEffect(() => {
    if (isMounted && status === "authenticated") {
      const loadOrSyncCart = async () => {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            
            // Read latest guest cart directly from localStorage to avoid stale closures
            const storedCart = localStorage.getItem("boutique_cart");
            let localItems = [];
            if (storedCart) {
              try {
                localItems = JSON.parse(storedCart);
              } catch (e) {
                // ignore
              }
            }

            if (data.items && data.items.length > 0) {
              setItems(data.items);
            } else if (localItems.length > 0) {
              setItems(localItems);
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: localItems }),
              });
            }
          }
        } catch (e) {
          console.error("Error loading/syncing cart on auth status change:", e);
        }
      };
      loadOrSyncCart();
    }
  }, [status, isMounted]);

  // Save cart to localStorage whenever it changes, and sync to DB if authenticated
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("boutique_cart", JSON.stringify(items));

      if (status === "authenticated") {
        const syncCart = async () => {
          try {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items }),
            });
          } catch (e) {
            console.error("Failed to sync cart changes to db:", e);
          }
        };
        syncCart();
      }
    }
  }, [items, status, isMounted]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      if (appliedCoupon) {
        localStorage.setItem("boutique_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("boutique_coupon");
      }
    }
  }, [appliedCoupon, isMounted]);

  const addItem = React.useCallback((newItem: Omit<CartItem, "id" | "unitPrice">) => {
    // Generate unitPrice
    const optionsAdjustment = newItem.selectedOptions.reduce(
      (acc, opt) => acc + opt.priceAdjustment,
      0
    );
    const unitPrice = newItem.basePrice + optionsAdjustment;

    // Create a unique cart item ID based on variantId + sorted option IDs
    const sortedOptionIds = newItem.selectedOptions
      .map((opt) => opt.id)
      .sort()
      .join("-");
    const cartItemId = `${newItem.variantId}_${newItem.topSize || "none"}_${
      newItem.bottomSize || "none"
    }_${sortedOptionIds}`;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === cartItemId
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }

      return [...prevItems, { ...newItem, id: cartItemId, unitPrice }];
    });
    
    // Automatically open the cart drawer
    setIsCartOpen(true);
  }, [setIsCartOpen]);

  const removeItem = React.useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = React.useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = React.useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const refreshCart = React.useCallback(async () => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          if (data.items) {
            setItems(data.items);
          }
        }
      } catch (e) {
        console.error("Failed to refresh cart from server:", e);
      }
    }
  }, [status]);


  // Helper values
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const applyCoupon = React.useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    if (cartSubtotal <= 0) {
      return { success: false, message: "Your cart is empty." };
    }

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok || !data.coupon) {
        return { success: false, message: data.error || "Invalid coupon code." };
      }

      const coupon: Coupon = data.coupon;

      if (!coupon.isActive) {
        return { success: false, message: "This coupon is no longer active." };
      }

      if (cartSubtotal < coupon.minOrderValue) {
        return {
          success: false,
          message: `Minimum order value of Rs. ${coupon.minOrderValue} required for this coupon.`,
        };
      }

      setAppliedCoupon(coupon);
      return { success: true, message: "Coupon applied successfully!" };
    } catch (error) {
      console.error("Error applying coupon:", error);
      return { success: false, message: "Server error. Please try again." };
    }
  }, [cartSubtotal]);

  const removeCoupon = React.useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const getDiscountAmount = React.useCallback((paymentType: string): number => {
    if (!appliedCoupon) return 0;
    
    // Prepaid only check
    if (appliedCoupon.isPrepaidOnly && paymentType !== "PREPAID") {
      return 0;
    }

    // Min value validation
    if (cartSubtotal < appliedCoupon.minOrderValue) {
      return 0;
    }

    let discount = 0;
    if (appliedCoupon.discountPercent > 0) {
      discount = (cartSubtotal * appliedCoupon.discountPercent) / 100;
    } else if (appliedCoupon.discountAmount > 0) {
      discount = appliedCoupon.discountAmount;
    }

    // Discount cannot exceed subtotal
    return Math.min(discount, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const getTotalAmount = React.useCallback((paymentType: string): number => {
    const discount = getDiscountAmount(paymentType);
    return Math.max(0, cartSubtotal - discount);
  }, [getDiscountAmount, cartSubtotal]);

  const contextValue = React.useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getTotalAmount,
    isMounted,
    isCartOpen,
    setIsCartOpen,
    refreshCart,
  }), [
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getTotalAmount,
    isMounted,
    isCartOpen,
    setIsCartOpen,
    refreshCart,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
