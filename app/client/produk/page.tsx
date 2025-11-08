'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { toast } from 'sonner';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = '/api/products?';
        if (selectedCategory !== 'all') {
          url += `category=${selectedCategory}&`;
        }
        if (searchQuery) {
          url += `search=${searchQuery}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: Product) => {
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingIndex = cart.findIndex((item: { product: Product }) => item.product.id === product.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
      toast.success('Berhasil!', {
        description: `Jumlah ${product.name} di keranjang ditambah`,
      });
    } else {
      cart.push({ product, quantity: 1 });
      toast.success('Ditambahkan ke keranjang!', {
        description: product.name,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-bold mb-8">Produk Kami</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Input
            type="search"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg transition-all group overflow-hidden">
                <CardContent className="p-2 md:p-4">
                  {/* Product Image */}
                  <div 
                    className="aspect-square relative mb-2 bg-muted/30 rounded-md overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/client/produk/${product.id}`)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
                      </div>
                    )}
                    {/* Hover overlay - hidden on mobile */}
                    <div className="hidden md:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  {product.category && (
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-500 text-[10px] md:text-xs mb-1">
                      {product.category.name}
                    </Badge>
                  )}
                  
                  {/* Product Name */}
                  <h3 
                    className="font-semibold text-xs md:text-sm mb-1 line-clamp-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-500 min-h-10"
                    onClick={() => router.push(`/client/produk/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <p className="text-sm md:text-lg font-bold text-amber-600 dark:text-amber-500 mb-1">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  
                  {/* Stock */}
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-2">
                    Stok: {product.stock}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-1 md:gap-2">
                    <Button 
                      size="sm"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 md:h-9" 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                      <span className="hidden md:inline">{product.stock === 0 ? 'Habis' : 'Tambah'}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 h-8 md:h-9 px-2"
                      onClick={() => router.push(`/client/produk/${product.id}`)}
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
