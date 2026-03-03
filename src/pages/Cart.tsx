import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag,
  Truck,
  Shield,
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    couponCode,
    discount,
  } = useCart();
  
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    const result = await applyCoupon(couponInput);
    setIsApplyingCoupon(false);

    if (result.success) {
      toast.success(result.message);
      setCouponInput('');
    } else {
      toast.error(result.message);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet</p>
          <Button asChild className="bg-[#0f3d2e] hover:bg-[#1a5f4a]">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({itemCount} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedVariant || 'default'}`}
                className="bg-white rounded-xl p-4 sm:p-6 flex gap-4 sm:gap-6"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${item.productId}`}
                  className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold text-gray-900 hover:text-[#0f3d2e] transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.selectedVariant && (
                        <p className="text-sm text-gray-500 mt-1">
                          Variant: {item.selectedVariant}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        SKU: {item.product.sku}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#0f3d2e] sm:text-right">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.selectedVariant
                          )
                        }
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.selectedVariant
                          )
                        }
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        removeFromCart(item.productId, item.selectedVariant);
                        toast.success('Item removed from cart');
                      }}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="pl-10"
                      disabled={!!couponCode}
                    />
                  </div>
                  {couponCode ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Clear coupon logic would go here
                        window.location.reload();
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="bg-[#0f3d2e] hover:bg-[#1a5f4a]"
                    >
                      Apply
                    </Button>
                  )}
                </div>
                {couponCode && (
                  <p className="text-sm text-green-600 mt-2">
                    Coupon <strong>{couponCode}</strong> applied!
                  </p>
                )}
              </div>

              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-[#0f3d2e]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full bg-[#0f3d2e] hover:bg-[#1a5f4a]"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="h-5 w-5 text-[#0f3d2e]" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="h-5 w-5 text-[#0f3d2e]" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
