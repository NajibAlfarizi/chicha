'use client';

import { useState } from 'react';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CartItem } from '@/lib/types';

// Helper function to migrate old cart format to new format
function migrateCartData(rawData: unknown[]): CartItem[] {
  return rawData
    .map((item: unknown) => {
      // Type guard
      if (typeof item !== 'object' || item === null) {
        return null;
      }
      
      const itemObj = item as Record<string, unknown>;
      
      // Check if it's already in new format (has 'product' property)
      if ('product' in itemObj && itemObj.product) {
        return item as CartItem;
      }
      
      // Convert old flat format to new nested format
      return {
        product: {
          id: (itemObj.id as string) || '',
          name: (itemObj.name as string) || '',
          price: (itemObj.price as number) || 0,
          image_url: (itemObj.image_url as string) || '',
          stock: (itemObj.stock as number) || 0,
          category_id: (itemObj.category_id as string) || '',
          description: (itemObj.description as string) || '',
        },
        quantity: (itemObj.quantity as number) || 1,
      } as CartItem;
    })
    .filter((item): item is CartItem => item !== null);
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize cart from localStorage with migration
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const rawData = JSON.parse(savedCart);
          console.log('🔄 Migrating cart data from localStorage...', rawData);
          const migratedData = migrateCartData(rawData);
          console.log('✅ Cart data migrated successfully:', migratedData);
          // Save migrated data back to localStorage
          localStorage.setItem('cart', JSON.stringify(migratedData));
          return migratedData;
        } catch (error) {
          console.error('❌ Error parsing cart data:', error);
          return [];
        }
      }
    }
    return [];
  });

  const updateCart = (newCart: CartItem[]) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(newQuantity, item.product.stock) }
        : item
    );
    updateCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    updateCart(updatedCart);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
              <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
              Keranjang Belanja
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base">
              {getTotalItems()} item dalam keranjang
            </p>
          </div>

          {cartItems.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-amber-500/20">
              <CardContent className="py-16 md:py-20 text-center">
                <ShoppingCart className="h-16 w-16 md:h-20 md:w-20 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl text-slate-900 dark:text-white mb-2">Keranjang Kosong</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm md:text-base">Belum ada produk di keranjang Anda</p>
                <Link href="/client/produk">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Mulai Belanja
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-amber-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-slate-900 dark:text-white text-lg md:text-xl">
                      Produk ({cartItems.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="border-red-500 text-red-500 hover:bg-red-500/10 text-xs md:text-sm"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                      <span className="hidden md:inline">Kosongkan</span>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    {cartItems.map((item) => {
                      // Safety check for product data
                      if (!item.product) {
                        console.error('Invalid cart item:', item);
                        return null;
                      }

                      return (
                        <div
                          key={item.product.id}
                          className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-transparent"
                        >
                          {/* Product Image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center shrink-0">
                            {item.product.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  // Fallback jika gambar gagal load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = '<svg class="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>';
                                }}
                              />
                            ) : (
                              <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-slate-400 dark:text-slate-500" />
                            )}
                          </div>

                          {/* Product Info & Controls */}
                          <div className="flex-1 flex flex-col sm:flex-row gap-3">
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-slate-900 dark:text-white font-semibold mb-1 text-sm md:text-base truncate">
                                {item.product.name}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mb-2">
                                {item.product.category?.name || 'Tanpa kategori'}
                              </p>
                              <p className="text-amber-500 font-bold text-base md:text-lg">
                                Rp {item.product.price.toLocaleString('id-ID')}
                              </p>
                              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                                Stok: {item.product.stock}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item.product.id)}
                                className="border-red-500 text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 sm:mb-auto"
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>

                              <div className="flex items-center gap-1.5 md:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 h-7 w-7 md:h-8 md:w-8 p-0"
                                >
                                  <Minus className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                  className="w-12 md:w-16 h-7 md:h-8 text-center bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm"
                                  min="1"
                                  max={item.product.stock}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 h-7 w-7 md:h-8 md:w-8 p-0"
                                  disabled={item.quantity >= item.product.stock}
                                >
                                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              </div>

                              <p className="text-slate-900 dark:text-white font-semibold text-sm md:text-base whitespace-nowrap">
                                Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                      </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-amber-500/20 lg:sticky lg:top-24">
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white text-lg md:text-xl">
                      Ringkasan Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 text-sm md:text-base">
                        <span>Subtotal ({getTotalItems()} item)</span>
                        <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 text-sm md:text-base">
                        <span>Biaya Admin</span>
                        <span>Rp 0</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between text-slate-900 dark:text-white font-bold text-base md:text-lg">
                          <span>Total</span>
                          <span className="text-amber-500">
                            Rp {getTotalPrice().toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link href="/client/checkout" className="block">
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold h-10 md:h-11">
                        Lanjut ke Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>

                    <Link href="/client/produk">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 h-10 md:h-11"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Lanjut Belanja
                      </Button>
                    </Link>

                    {/* Info */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-amber-600 dark:text-amber-500 text-xs md:text-sm font-semibold mb-1">
                        💰 Informasi Target CRM
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs">
                        Setiap pembelian akan menambah progress target pembelanjaan Anda untuk mendapatkan reward!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
