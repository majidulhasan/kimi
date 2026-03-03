import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllItems } from '@/db/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, ShoppingBag, Truck, Shield, Clock } from 'lucide-react';
import type { Product, Category, Banner } from '@/types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, cats, banners] = await Promise.all([
          getAllItems('products'),
          getAllItems('categories'),
          getAllItems('banners'),
        ]);

        setFeaturedProducts(products.filter((p) => p.featured && p.active).slice(0, 8));
        setCategories(cats.filter((c) => c.active));
        setHeroBanners(banners.filter((b) => b.position === 'hero' && b.active).sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0f3d2e] to-[#1a5f4a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                New Collection 2025
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Discover Elegance in Modest Fashion
              </h1>
              <p className="text-lg text-white/80 max-w-lg">
                Explore our curated collection of abayas, hijabs, and accessories 
                designed for the modern Muslim woman.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="bg-white text-[#0f3d2e] hover:bg-gray-100">
                  <Link to="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                  <Link to="/products?category=1">View Abayas</Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div>
                  <p className="text-3xl font-bold">10K+</p>
                  <p className="text-white/70 text-sm">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-white/70 text-sm">Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">4.9</p>
                  <p className="text-white/70 text-sm">Rating</p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1617142108709-195b7bb0795b?w=600&h=800&fit=crop"
                  alt="Featured Collection"
                  className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[3/4]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-5 business days' },
              { icon: Star, title: 'Quality Guarantee', desc: 'Premium materials' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0f3d2e]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-[#0f3d2e]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{feature.title}</p>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our carefully curated categories to find exactly what you&apos;re looking for
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-square bg-gray-100">
                  <img
                    src={category.image || `https://source.unsplash.com/400x400/?fashion,${category.slug}`}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                    <p className="text-white/70 text-sm">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked items just for you</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real reviews from our valued customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Amina K.',
                location: 'New York, USA',
                rating: 5,
                text: 'The quality of the abayas is exceptional. Fast shipping and beautiful packaging. Will definitely order again!',
                avatar: 'AK',
              },
              {
                name: 'Fatima H.',
                location: 'London, UK',
                rating: 5,
                text: 'I love the modest dress collection. The fabrics are so comfortable and the designs are elegant. Highly recommended!',
                avatar: 'FH',
              },
              {
                name: 'Sarah M.',
                location: 'Toronto, Canada',
                rating: 5,
                text: 'Best hijab store ever! The chiffon hijabs are so soft and the colors are exactly as shown. Amazing customer service.',
                avatar: 'SM',
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0f3d2e] rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-[#0f3d2e]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Newsletter</h2>
            <p className="text-white/80 mb-8">
              Subscribe to get exclusive offers, new arrivals, and styling tips delivered to your inbox
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-[#0f3d2e] hover:bg-gray-100 px-8">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.comparePrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Sale
            </div>
          )}
          {product.featured && (
            <div className="absolute top-3 right-3 bg-[#0f3d2e] text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#0f3d2e] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{product.reviewCount || 0} reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#0f3d2e]">${product.price}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.comparePrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
