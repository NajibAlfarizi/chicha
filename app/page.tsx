'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Target, ArrowRight, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=6');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">
            Sparepart & Service HP<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-600">
              Terpercaya & Berkualitas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Dapatkan sparepart original dan layanan service handphone professional dengan sistem reward pembelanjaan
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/client/produk">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                Belanja Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/client/booking">
              <Button size="lg" variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10">
                Booking Service
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg transition-all">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-amber-500 mb-4" />
              <CardTitle>E-Commerce</CardTitle>
              <CardDescription>
                Sparepart dan aksesoris HP original dengan harga terbaik
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg transition-all">
            <CardHeader>
              <Target className="h-12 w-12 text-amber-500 mb-4" />
              <CardTitle>Sistem Reward</CardTitle>
              <CardDescription>
                Capai target pembelanjaan dan dapatkan reward menarik
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg transition-all">
            <CardHeader>
              <Wrench className="h-12 w-12 text-amber-500 mb-4" />
              <CardTitle>Service HP</CardTitle>
              <CardDescription>
                Booking service dengan tracking progress realtime
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold">Produk Terbaru</h3>
          <Link href="/client/produk">
            <Button variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10">
              Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading products...</div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg transition-all overflow-hidden">
                <div className="aspect-square bg-muted/30 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart className="h-20 w-20 text-muted-foreground" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    {product.category?.name || 'Uncategorized'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Stok: {product.stock}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/client/produk/${product.id}`} className="w-full">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      Lihat Detail
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </ClientLayout>
  );
}
