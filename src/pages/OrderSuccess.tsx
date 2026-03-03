import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItem } from '@/db/database';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, Calendar } from 'lucide-react';
import type { Order } from '@/types';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      try {
        const orderData = await getItem('orders', parseInt(orderId));
        setOrder(orderData || null);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <Button asChild className="bg-[#0f3d2e]">
            <Link to="/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-[#0f3d2e] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Order Number</p>
                <p className="text-2xl font-bold">{order.orderNumber}</p>
              </div>
              <Package className="h-12 w-12 text-white/30" />
            </div>
          </div>

          <div className="p-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{order.status}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">{item.variant}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        ${item.price} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-100 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-[#0f3d2e]">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
              <div className="text-gray-600">
                <p>{order.customerInfo.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">{order.customerInfo.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-[#0f3d2e] hover:bg-[#1a5f4a]">
            <Link to="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/orders">
              <Package className="h-4 w-4 mr-2" />
              View My Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
