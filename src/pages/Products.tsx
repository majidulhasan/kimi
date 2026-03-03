import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAllItems } from '@/db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, SlidersHorizontal, Grid3X3, List, Star, X } from 'lucide-react';
import type { Product, Category } from '@/types';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('category') ? parseInt(searchParams.get('category')!) : null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allProducts, allCategories] = await Promise.all([
          getAllItems('products'),
          getAllItems('categories'),
        ]);
        
        setProducts(allProducts.filter((p) => p.active));
        setCategories(allCategories.filter((c) => c.active));
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId.toString());
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    priceRange[0] > 0 || priceRange[1] < 1000,
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-500 text-sm mt-1">
                {filteredProducts.length} products found
              </p>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-[#0f3d2e] hover:bg-[#1a5f4a]">
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedCategory === null}
                      onCheckedChange={() => handleCategoryChange(null)}
                    />
                    <span className="text-gray-700">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedCategory === category.id}
                        onCheckedChange={() => handleCategoryChange(category.id!)}
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4">Price Range</h3>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={1000}
                  step={10}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          <div className="lg:hidden flex items-center justify-between gap-4 mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-[#0f3d2e] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={selectedCategory === null}
                          onCheckedChange={() => handleCategoryChange(null)}
                        />
                        <span className="text-gray-700">All Categories</span>
                      </label>
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={selectedCategory === category.id}
                            onCheckedChange={() => handleCategoryChange(category.id!)}
                          />
                          <span className="text-gray-700">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Price Range</h3>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={1000}
                      step={10}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button onClick={clearFilters} variant="outline" className="w-full">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#0f3d2e]' : ''}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#0f3d2e]' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-[#0f3d2e]/10 text-[#0f3d2e] px-3 py-1 rounded-full text-sm">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 bg-[#0f3d2e]/10 text-[#0f3d2e] px-3 py-1 rounded-full text-sm">
                    {categories.find((c) => c.id === selectedCategory)?.name}
                    <button onClick={() => handleCategoryChange(null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  viewMode,
}: {
  product: Product;
  viewMode: 'grid' | 'list';
}) {
  if (viewMode === 'list') {
    return (
      <Link to={`/products/${product.id}`} className="group">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex">
          <div className="w-48 h-48 flex-shrink-0 overflow-hidden bg-gray-100">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-[#0f3d2e] transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {product.description}
              </p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{product.reviewCount || 0} reviews</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xl font-bold text-[#0f3d2e]">${product.price}</span>
              {product.comparePrice && (
                <span className="text-gray-400 line-through">${product.comparePrice}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

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
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#0f3d2e] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#0f3d2e]">${product.price}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">${product.comparePrice}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
