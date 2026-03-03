import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllItems } from '@/db/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import type { Order } from '@/types';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  pendingReviews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    pendingReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [orders, products, users, reviews] = await Promise.all([
          getAllItems('orders'),
          getAllItems('products'),
          getAllItems('users'),
          getAllItems('reviews'),
        ]);

        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;
        const pendingReviews = reviews.filter((r) => !r.approved).length;
        const customers = users.filter((u) => u.role === 'customer');

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          totalCustomers: customers.length,
          pendingOrders,
          pendingReviews,
        });

        // Get recent orders
        setRecentOrders(
          orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
        );
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8%',
      trendUp: true,
      color: 'bg-blue-500',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: '+5%',
      trendUp: true,
      color: 'bg-purple-500',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      trend: '+15%',
      trendUp: true,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trendUp ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-sm text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pendingOrders > 0 || stats.pendingReviews > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.pendingOrders > 0 && (
            <Link
              to="/admin/orders"
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4 hover:bg-yellow-100 transition-colors"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  {stats.pendingOrders} Pending Order{stats.pendingOrders > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-yellow-700">Click to review and process</p>
              </div>
              <ArrowRight className="h-5 w-5 text-yellow-600" />
            </Link>
          )}
          
          {stats.pendingReviews > 0 && (
            <Link
              to="/admin/reviews"
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4 hover:bg-blue-100 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">
                  {stats.pendingReviews} Review{stats.pendingReviews > 1 ? 's' : ''} to Approve
                </p>
                <p className="text-sm text-blue-700">Click to moderate reviews</p>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </Link>
          )}
        </div>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link
            to="/admin/orders"
            className="text-sm text-[#0f3d2e] hover:text-[#1a5f4a] font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4">
                        <span className="font-medium">{order.orderNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{order.customerInfo.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
