// User Types
export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: Address;
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Product Types
export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  categoryId: number;
  stock: number;
  sku: string;
  variants?: ProductVariant[];
  rating?: number;
  reviewCount?: number;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

// Category Types
export interface Category {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  productId: number;
  variantId?: string;
  quantity: number;
  product: Product;
  selectedVariant?: string;
}

// Order Types
export interface Order {
  id?: number;
  orderNumber: string;
  userId: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod';
  shippingAddress: Address;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  couponCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Review Types
export interface Review {
  id?: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon Types
export interface Coupon {
  id?: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Banner Types
export interface Banner {
  id?: number;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: 'hero' | 'featured' | 'promo';
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Wishlist Types
export interface WishlistItem {
  id?: number;
  userId: number;
  productId: number;
  createdAt: Date;
}

// Filter Types
export interface ProductFilter {
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

// Cart Context Types
export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: number, variantId?: string) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; discount: number; message: string }>;
  couponCode: string | null;
  discount: number;
}
