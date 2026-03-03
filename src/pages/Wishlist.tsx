import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getByIndex, deleteItem } from '@/db/database';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import type { Product, WishlistItem } from '@/types';

interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user?.id) return;

      try {
        const items = await getByIndex('wishlist', 'by-user', user.id);
        // Get product details for each wishlist item
        const itemsWithProducts: WishlistItemWithProduct[] = [];
        
        for (const item of items) {
          const products = await getByIndex('products', 'by-category', 0);
          const product = products.find((p) => p.id === item.productId);
          if (product && product.active) {
            itemsWithProducts.push({ ...item, product });
          }
        }
        
        setWishlistItems(itemsWithProducts);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  const handleRemove = async (itemId: number) => {
    try {
      await deleteItem('wishlist', itemId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
          <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
          <Button asChild className="bg-[#0f3d2e] hover:bg-[#1a5f4a]">
            <Link to="/products">Explore Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <Link to={`/products/${item.product.id}`}>
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                
                {/* Remove Button */}
                <button
                  onClick={() => item.id && handleRemove(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/products/${item.product.id}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#0f3d2e] transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <span className="text-lg font-bold text-[#0f3d2e]">
                    ${item.product.price}
                  </span>
                  {item.product.comparePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ${item.product.comparePrice}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#0f3d2e] hover:bg-[#1a5f4a]"
                  onClick={() => handleAddToCart(item.product)}
                  disabled={item.product.stock === 0}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
