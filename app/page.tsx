'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Target, ArrowRight, ShoppingCart, Ticket, TrendingUp, Gift, ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import { Product, Voucher } from '@/lib/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchVouchers();
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const slideCount = vouchers.length + 3; // 3 static slides + voucher slides
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [vouchers.length]);

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

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/vouchers');
      const data = await response.json();
      setVouchers(data.vouchers || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const nextSlide = () => {
    const slideCount = vouchers.length + 3;
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    const slideCount = vouchers.length + 3;
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <ClientLayout>
      {/* Promo Carousel */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          {/* Carousel Container */}
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 1: Target Reward */}
            <div className="min-w-full">
              <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-8 w-8" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Sistem Reward</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      Belanja & Raih Hadiah Menarik!
                    </h3>
                    <p className="text-lg mb-6 text-purple-100">
                      Capai target pembelanjaan Anda dan dapatkan reward eksklusif. Semakin banyak belanja, semakin besar hadiahnya!
                    </p>
                    <Link href="/client/akun?tab=target">
                      <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Lihat Target Saya
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <Gift className="h-48 w-48 text-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2: Service Booking CTA */}
            <div className="min-w-full">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="h-8 w-8" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Service Profesional</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      HP Bermasalah? Kami Siap Bantu!
                    </h3>
                    <p className="text-lg mb-6 text-blue-100">
                      Teknisi berpengalaman dengan tracking progress real-time. Booking sekarang dan dapatkan garansi service!
                    </p>
                    <Link href="/client/booking">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                        <Wrench className="mr-2 h-5 w-5" />
                        Booking Service
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <Wrench className="h-48 w-48 text-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3: Shopping CTA */}
            <div className="min-w-full">
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart className="h-8 w-8" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Sparepart Original</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      Ribuan Produk Berkualitas!
                    </h3>
                    <p className="text-lg mb-6 text-emerald-100">
                      Sparepart original, aksesoris HP terlengkap dengan harga bersahabat. Gratis ongkir untuk pembelian tertentu!
                    </p>
                    <Link href="/client/produk">
                      <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Belanja Sekarang
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <ShoppingCart className="h-48 w-48 text-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Voucher Slides */}
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="min-w-full">
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <Ticket className="h-8 w-8" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Kode Voucher</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-2">
                        {voucher.name}
                      </h3>
                      <div className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-mono font-bold text-2xl mb-4">
                        {voucher.code}
                      </div>
                      <p className="text-lg mb-2 text-blue-100">
                        {voucher.description || (
                          voucher.type === 'percentage' 
                            ? `Diskon ${voucher.value}%${voucher.max_discount ? ` (maks Rp ${voucher.max_discount.toLocaleString('id-ID')})` : ''}` 
                            : `Potongan Rp ${voucher.value.toLocaleString('id-ID')}`
                        )}
                      </p>
                      <p className="text-sm text-blue-200 mb-6">
                        Min. belanja Rp {voucher.min_purchase.toLocaleString('id-ID')} • Kuota: {voucher.quota - voucher.used} tersisa
                      </p>
                      <Link href="/client/produk">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Belanja Sekarang
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:block">
                      <Ticket className="h-48 w-48 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: vouchers.length + 3 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

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
