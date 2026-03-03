import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { User, Product, Category, Order, Review, Coupon, Banner, WishlistItem } from '@/types';

const DB_NAME = 'AlFalahBoutiqueDB';
const DB_VERSION = 1;

interface AlFalahDB extends DBSchema {
  users: {
    key: number;
    value: User;
    indexes: { 'by-email': string };
  };
  products: {
    key: number;
    value: Product;
    indexes: { 'by-category': number; 'by-featured': number };
  };
  categories: {
    key: number;
    value: Category;
    indexes: { 'by-slug': string };
  };
  orders: {
    key: number;
    value: Order;
    indexes: { 'by-user': number; 'by-status': string };
  };
  reviews: {
    key: number;
    value: Review;
    indexes: { 'by-product': number; 'by-approved': number };
  };
  coupons: {
    key: number;
    value: Coupon;
    indexes: { 'by-code': string };
  };
  banners: {
    key: number;
    value: Banner;
    indexes: { 'by-position': string };
  };
  wishlist: {
    key: number;
    value: WishlistItem;
    indexes: { 'by-user': number; 'by-product': number };
  };
}

let db: IDBPDatabase<AlFalahDB> | null = null;

export async function initDatabase(): Promise<IDBPDatabase<AlFalahDB>> {
  if (db) return db;

  db = await openDB<AlFalahDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Users store
      if (!database.objectStoreNames.contains('users')) {
        const userStore = database.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      // Products store
      if (!database.objectStoreNames.contains('products')) {
        const productStore = database.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        productStore.createIndex('by-category', 'categoryId', { unique: false });
        productStore.createIndex('by-featured', 'featured', { unique: false });
      }

      // Categories store
      if (!database.objectStoreNames.contains('categories')) {
        const categoryStore = database.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        categoryStore.createIndex('by-slug', 'slug', { unique: true });
      }

      // Orders store
      if (!database.objectStoreNames.contains('orders')) {
        const orderStore = database.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        orderStore.createIndex('by-user', 'userId', { unique: false });
        orderStore.createIndex('by-status', 'status', { unique: false });
      }

      // Reviews store
      if (!database.objectStoreNames.contains('reviews')) {
        const reviewStore = database.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
        reviewStore.createIndex('by-product', 'productId', { unique: false });
        reviewStore.createIndex('by-approved', 'approved', { unique: false });
      }

      // Coupons store
      if (!database.objectStoreNames.contains('coupons')) {
        const couponStore = database.createObjectStore('coupons', { keyPath: 'id', autoIncrement: true });
        couponStore.createIndex('by-code', 'code', { unique: true });
      }

      // Banners store
      if (!database.objectStoreNames.contains('banners')) {
        const bannerStore = database.createObjectStore('banners', { keyPath: 'id', autoIncrement: true });
        bannerStore.createIndex('by-position', 'position', { unique: false });
      }

      // Wishlist store
      if (!database.objectStoreNames.contains('wishlist')) {
        const wishlistStore = database.createObjectStore('wishlist', { keyPath: 'id', autoIncrement: true });
        wishlistStore.createIndex('by-user', 'userId', { unique: false });
        wishlistStore.createIndex('by-product', 'productId', { unique: false });
      }
    },
  });

  return db;
}

export async function getDB(): Promise<IDBPDatabase<AlFalahDB>> {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Store names type
type StoreName = 'users' | 'products' | 'categories' | 'orders' | 'reviews' | 'coupons' | 'banners' | 'wishlist';

// Generic CRUD Operations
export async function createItem(
  storeName: StoreName,
  item: Record<string, unknown>
): Promise<number> {
  const database = await getDB();
  const now = new Date();
  const itemWithTimestamps = {
    ...item,
    createdAt: now,
    updatedAt: now,
  };
  
  return database.add(storeName, itemWithTimestamps as never);
}

export async function getItem<T>(
  storeName: StoreName,
  id: number
): Promise<T | undefined> {
  const database = await getDB();
  return database.get(storeName, id) as Promise<T | undefined>;
}

export async function getAllItems<T>(
  storeName: StoreName
): Promise<T[]> {
  const database = await getDB();
  return database.getAll(storeName) as Promise<T[]>;
}

export async function updateItem(
  storeName: StoreName,
  id: number,
  updates: Record<string, unknown>
): Promise<number> {
  const database = await getDB();
  const existing = await database.get(storeName, id);
  if (!existing) throw new Error('Item not found');
  
  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  
  return database.put(storeName, updated as never);
}

export async function deleteItem(
  storeName: StoreName,
  id: number
): Promise<void> {
  const database = await getDB();
  return database.delete(storeName, id);
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const database = await getDB();
  return database.clear(storeName);
}

// Query operations with indexes
export async function getByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: unknown
): Promise<T[]> {
  const database = await getDB();
  const tx = database.transaction(storeName, 'readonly');
  const store = tx.store;
  const index = store.index(indexName);
  return index.getAll(value) as Promise<T[]>;
}

export async function getOneByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: unknown
): Promise<T | undefined> {
  const database = await getDB();
  const tx = database.transaction(storeName, 'readonly');
  const store = tx.store;
  const index = store.index(indexName);
  return index.get(value) as Promise<T | undefined>;
}

// Seed initial data
export async function seedInitialData(): Promise<void> {
  // Check if admin exists
  const existingAdmin = await getOneByIndex<User>('users', 'by-email', 'admin@alfalah.com');
  if (!existingAdmin) {
    // Create admin user
    await createItem('users', {
      name: 'Admin User',
      email: 'admin@alfalah.com',
      password: '123456',
      role: 'admin',
    });
  }

  // Check if categories exist
  const existingCategories = await getAllItems<Category>('categories');
  if (existingCategories.length === 0) {
    // Seed categories
    const categories = [
      { name: 'Abayas', slug: 'abayas', description: 'Elegant traditional abayas', active: true },
      { name: 'Hijabs', slug: 'hijabs', description: 'Beautiful hijab collection', active: true },
      { name: 'Dresses', slug: 'dresses', description: 'Modest fashion dresses', active: true },
      { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories', active: true },
      { name: 'Prayer Items', slug: 'prayer-items', description: 'Prayer mats and accessories', active: true },
    ];
    
    for (const category of categories) {
      await createItem('categories', category);
    }
  }

  // Check if products exist
  const existingProducts = await getAllItems<Product>('products');
  if (existingProducts.length === 0) {
    // Seed sample products
    const products = [
      {
        name: 'Classic Black Abaya',
        description: 'Elegant classic black abaya with subtle embroidery. Perfect for daily wear and special occasions. Made from high-quality crepe fabric.',
        price: 299,
        comparePrice: 399,
        images: ['https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=600&h=800&fit=crop'],
        categoryId: 1,
        stock: 50,
        sku: 'ABY-001',
        featured: true,
        active: true,
        rating: 4.8,
        reviewCount: 24,
      },
      {
        name: 'Navy Blue Embroidered Abaya',
        description: 'Stunning navy blue abaya with intricate gold embroidery. A perfect blend of tradition and modern elegance.',
        price: 459,
        comparePrice: 599,
        images: ['https://images.unsplash.com/photo-1617142108709-195b7bb0795b?w=600&h=800&fit=crop'],
        categoryId: 1,
        stock: 30,
        sku: 'ABY-002',
        featured: true,
        active: true,
        rating: 4.9,
        reviewCount: 18,
      },
      {
        name: 'Premium Chiffon Hijab',
        description: 'Soft and breathable chiffon hijab in various colors. Lightweight and comfortable for all-day wear.',
        price: 49,
        images: ['https://images.unsplash.com/photo-1589982300999-4996c47e9eb9?w=600&h=800&fit=crop'],
        categoryId: 2,
        stock: 100,
        sku: 'HJB-001',
        featured: true,
        active: true,
        rating: 4.7,
        reviewCount: 56,
      },
      {
        name: 'Silk Satin Hijab',
        description: 'Luxurious silk satin hijab with a beautiful sheen. Perfect for special occasions and formal events.',
        price: 89,
        comparePrice: 129,
        images: ['https://images.unsplash.com/photo-1618487716814-7e6e00c5e9b5?w=600&h=800&fit=crop'],
        categoryId: 2,
        stock: 40,
        sku: 'HJB-002',
        featured: false,
        active: true,
        rating: 4.9,
        reviewCount: 32,
      },
      {
        name: 'Modest Maxi Dress',
        description: 'Beautiful modest maxi dress with long sleeves. Flowing silhouette perfect for any occasion.',
        price: 189,
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop'],
        categoryId: 3,
        stock: 25,
        sku: 'DRS-001',
        featured: true,
        active: true,
        rating: 4.6,
        reviewCount: 15,
      },
      {
        name: 'Floral Print Dress',
        description: 'Elegant floral print dress with modest cut. Perfect for spring and summer occasions.',
        price: 229,
        comparePrice: 299,
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop'],
        categoryId: 3,
        stock: 20,
        sku: 'DRS-002',
        featured: false,
        active: true,
        rating: 4.5,
        reviewCount: 12,
      },
      {
        name: 'Pearl Earrings Set',
        description: 'Elegant pearl earrings set with matching studs. Perfect complement to any outfit.',
        price: 79,
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop'],
        categoryId: 4,
        stock: 60,
        sku: 'ACC-001',
        featured: false,
        active: true,
        rating: 4.8,
        reviewCount: 42,
      },
      {
        name: 'Decorative Hijab Pins',
        description: 'Beautiful decorative pins for securing your hijab. Set of 6 assorted designs.',
        price: 35,
        images: ['https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600&h=600&fit=crop'],
        categoryId: 4,
        stock: 80,
        sku: 'ACC-002',
        featured: false,
        active: true,
        rating: 4.4,
        reviewCount: 28,
      },
      {
        name: 'Premium Prayer Mat',
        description: 'Soft and comfortable prayer mat with beautiful Islamic geometric patterns. Easy to carry for travel.',
        price: 129,
        comparePrice: 169,
        images: ['https://images.unsplash.com/photo-1542319465-7a87c5f95757?w=600&h=600&fit=crop'],
        categoryId: 5,
        stock: 35,
        sku: 'PRY-001',
        featured: true,
        active: true,
        rating: 4.9,
        reviewCount: 67,
      },
      {
        name: 'Tasbih Beads',
        description: 'Beautiful 99-bead tasbih made from premium materials. Perfect for dhikr and meditation.',
        price: 45,
        images: ['https://images.unsplash.com/photo-1604605801370-3396f9bd9df0?w=600&h=600&fit=crop'],
        categoryId: 5,
        stock: 50,
        sku: 'PRY-002',
        featured: false,
        active: true,
        rating: 4.7,
        reviewCount: 38,
      },
    ];
    
    for (const product of products) {
      await createItem('products', product);
    }
  }

  // Seed banners
  const existingBanners = await getAllItems<Banner>('banners');
  if (existingBanners.length === 0) {
    const banners = [
      {
        title: 'Eid Collection 2025',
        subtitle: 'Discover our exclusive Eid collection with up to 30% off',
        image: 'https://images.unsplash.com/photo-1617142108709-195b7bb0795b?w=1200&h=600&fit=crop',
        position: 'hero',
        active: true,
        order: 1,
      },
      {
        title: 'New Arrivals',
        subtitle: 'Check out our latest modest fashion',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=400&fit=crop',
        position: 'featured',
        active: true,
        order: 1,
      },
      {
        title: 'Premium Hijabs',
        subtitle: 'Soft, comfortable, and elegant',
        image: 'https://images.unsplash.com/photo-1589982300999-4996c47e9eb9?w=600&h=400&fit=crop',
        position: 'featured',
        active: true,
        order: 2,
      },
    ];
    
    for (const banner of banners) {
      await createItem('banners', banner);
    }
  }

  // Seed coupons
  const existingCoupons = await getAllItems<Coupon>('coupons');
  if (existingCoupons.length === 0) {
    const coupons = [
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrder: 100,
        maxDiscount: 50,
        usageLimit: 100,
        usageCount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        active: true,
      },
      {
        code: 'EID2025',
        type: 'percentage',
        value: 20,
        minOrder: 200,
        maxDiscount: 100,
        usageLimit: 50,
        usageCount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        active: true,
      },
      {
        code: 'FLAT50',
        type: 'fixed',
        value: 50,
        minOrder: 300,
        usageLimit: 30,
        usageCount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        active: true,
      },
    ];
    
    for (const coupon of coupons) {
      await createItem('coupons', coupon);
    }
  }
}
