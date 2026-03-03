import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItem, getByIndex, createItem, deleteItem } from '@/db/database';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ChevronLeft,
  Check,
} from 'lucide-react';
import type { Product, Review, WishlistItem } from '@/types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        const productData = await getItem('products', parseInt(id));
        if (!productData || !productData.active) {
          navigate('/products');
          return;
        }
        
        setProduct(productData);
        
        // Load reviews
        const productReviews = await getByIndex('reviews', 'by-product', productData.id);
        setReviews(productReviews.filter((r) => r.approved).slice(0, 5));
        
        // Load related products
        const allProducts = await getByIndex('products', 'by-category', productData.categoryId);
        setRelatedProducts(
          allProducts
            .filter((p) => p.id !== productData.id && p.active)
            .slice(0, 4)
        );

        // Check wishlist
        if (isAuthenticated && user?.id) {
          const wishlistItems = await getByIndex('wishlist', 'by-user', user.id);
          const existingItem = wishlistItems.find((w) => w.productId === productData.id);
          setIsInWishlist(!!existingItem);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, isAuthenticated, user, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity, selectedVariant || undefined);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist');
      navigate('/login');
      return;
    }

    if (!product || !user?.id) return;

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const wishlistItems = await getByIndex('wishlist', 'by-user', user.id);
        const item = wishlistItems.find((w) => w.productId === product.id);
        if (item?.id) {
          await deleteItem('wishlist', item.id);
        }
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        await createItem('wishlist', {
          userId: user.id,
          productId: product.id,
        } as Omit<WishlistItem, 'id' | 'createdAt'>);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Something went wrong');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product?.rating || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Button onClick={() => navigate('/products')} className="bg-[#0f3d2e]">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0f3d2e] mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-[#0f3d2e]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.featured && (
                  <Badge className="bg-[#0f3d2e]">Featured</Badge>
                )}
                {product.comparePrice && (
                  <Badge className="bg-red-500">Sale</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#0f3d2e]">${product.price}</span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${product.comparePrice}
                  </span>
                  <Badge className="bg-red-500">
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedVariant === variant.id
                          ? 'border-[#0f3d2e] bg-[#0f3d2e]/5 text-[#0f3d2e]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-500">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-[#0f3d2e] hover:bg-[#1a5f4a]"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlistToggle}
                className={isInWishlist ? 'border-red-500 text-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              {[
                { icon: Truck, text: 'Free Shipping' },
                { icon: Shield, text: 'Secure Payment' },
                { icon: RotateCcw, text: 'Easy Returns' },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <feature.icon className="h-6 w-6 mx-auto mb-2 text-[#0f3d2e]" />
                  <p className="text-xs text-gray-600">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f3d2e] data-[state=active]:bg-transparent py-4"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f3d2e] data-[state=active]:bg-transparent py-4"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f3d2e] data-[state=active]:bg-transparent py-4"
            >
              Shipping Info
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">SKU</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Stock</span>
                    <span className="font-medium">{product.stock} units</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">Fashion</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-xl p-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-[#0f3d2e] rounded-full flex items-center justify-center text-white font-semibold">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{review.userName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <div className="bg-white rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <ul className="space-y-3">
                    {[
                      'Free shipping on orders over $100',
                      'Standard delivery: 3-5 business days',
                      'Express delivery: 1-2 business days',
                      'International shipping available',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Return Policy</h3>
                  <ul className="space-y-3">
                    {[
                      '30-day return policy',
                      'Items must be unworn with tags',
                      'Free returns on defective items',
                      'Exchange available for size issues',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#0f3d2e] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#0f3d2e] mt-1">${product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
