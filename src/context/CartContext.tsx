import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, Product, CartContextType } from '@/types';
import { getOneByIndex } from '@/db/database';

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'alfalah_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setCouponCode(parsed.couponCode || null);
        setDiscount(parsed.discount || 0);
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, couponCode, discount })
    );
  }, [items, couponCode, discount]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToCart = useCallback(
    (product: Product, quantity = 1, variant?: string) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) =>
            item.productId === product.id &&
            item.selectedVariant === variant
        );

        if (existingItem) {
          return prevItems.map((item) =>
            item.productId === product.id && item.selectedVariant === variant
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [
          ...prevItems,
          {
            productId: product.id!,
            product,
            quantity,
            selectedVariant: variant,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: number, variantId?: string) => {
      setItems((prevItems) =>
        prevItems.filter(
          (item) =>
            !(item.productId === productId && item.selectedVariant === variantId)
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, variantId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId && item.selectedVariant === variantId
            ? { ...item, quantity }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setDiscount(0);
  }, []);

  const applyCoupon = useCallback(
    async (code: string): Promise<{ success: boolean; discount: number; message: string }> => {
      try {
        const coupon = await getOneByIndex('coupons', 'by-code', code.toUpperCase());

        if (!coupon) {
          return { success: false, discount: 0, message: 'Invalid coupon code' };
        }

        if (!coupon.active) {
          return { success: false, discount: 0, message: 'This coupon is no longer active' };
        }

        const now = new Date();
        if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
          return { success: false, discount: 0, message: 'This coupon has expired' };
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return { success: false, discount: 0, message: 'This coupon has reached its usage limit' };
        }

        if (coupon.minOrder && subtotal < coupon.minOrder) {
          return {
            success: false,
            discount: 0,
            message: `Minimum order of $${coupon.minOrder} required`,
          };
        }

        let calculatedDiscount = 0;
        if (coupon.type === 'percentage') {
          calculatedDiscount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
            calculatedDiscount = coupon.maxDiscount;
          }
        } else {
          calculatedDiscount = coupon.value;
        }

        setCouponCode(code.toUpperCase());
        setDiscount(calculatedDiscount);

        return {
          success: true,
          discount: calculatedDiscount,
          message: `Coupon applied! You saved $${calculatedDiscount.toFixed(2)}`,
        };
      } catch (error) {
        console.error('Coupon error:', error);
        return { success: false, discount: 0, message: 'Error applying coupon' };
      }
    },
    [subtotal]
  );

  const value: CartContextType = {
    items,
    itemCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    couponCode,
    discount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
