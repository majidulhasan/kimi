import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createItem } from '@/db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  CreditCard,
  Truck,
  MapPin,
  User,
  Check,
  Shield,
} from 'lucide-react';
import type { Order, Address } from '@/types';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, discount, couponCode, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'USA',
    notes: '',
  });

  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal - discount + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ALF-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Please sign in to place an order');
      navigate('/login');
      return;
    }

    // Validate form
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress: Address = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0],
          variant: item.selectedVariant,
        })),
        subtotal,
        discount,
        shipping,
        total,
        status: 'pending',
        paymentMethod: 'cod',
        shippingAddress,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        couponCode: couponCode || undefined,
        notes: formData.notes || undefined,
      };

      const orderId = await createItem('orders', orderData);
      
      // Clear cart
      clearCart();
      
      toast.success('Order placed successfully!');
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0f3d2e]/10 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-[#0f3d2e]" />
                  </div>
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0f3d2e]/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#0f3d2e]" />
                  </div>
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apt 4B"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="USA"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0f3d2e]/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-[#0f3d2e]" />
                  </div>
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                </div>

                <RadioGroup defaultValue="cod" className="space-y-3">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-[#0f3d2e]" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This is an offline PWA. Payment processing is simulated. 
                    In a real application, you would integrate with a payment gateway.
                  </p>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl p-6">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special instructions for delivery..."
                  rows={3}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3d2e] focus:border-transparent"
                />
              </div>

              {/* Submit Button - Mobile */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#0f3d2e] hover:bg-[#1a5f4a]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order - ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.selectedVariant}`} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="text-xs text-gray-500">{item.selectedVariant}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        ${item.product.price} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
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
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className="text-[#0f3d2e]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <Button
                type="submit"
                size="lg"
                className="w-full mt-6 bg-[#0f3d2e] hover:bg-[#1a5f4a] hidden lg:flex"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <Check className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
