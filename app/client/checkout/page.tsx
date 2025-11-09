'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('midtrans');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    // Check authentication first
    if (!authLoading && !isAuthenticated) {
      toast.error('Login diperlukan', {
        description: 'Silakan login untuk melakukan checkout',
      });
      router.push('/auth/login?redirect=/client/checkout');
      return;
    }

    if (!isAuthenticated) return;

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      if (cart.length === 0) {
        router.push('/client/keranjang');
      }
      setCartItems(cart);
    } else {
      router.push('/client/keranjang');
    }

    // Auto-fill from user profile
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setCustomerInfo({
            name: data.profile.name || '',
            email: data.profile.email || '',
            phone: data.profile.phone || '',
            address: data.profile.address || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [router, isAuthenticated, authLoading]);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    // Validation
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast.error('Data tidak lengkap', {
        description: 'Silakan lengkapi semua informasi pelanggan',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast.error('Tidak terautentikasi', {
          description: 'Silakan login terlebih dahulu',
        });
        router.push('/auth/login');
        return;
      }

      const user = JSON.parse(userStr);

      const orderData = {
        user_id: user.id,
        total_amount: getTotalPrice(),
        payment_method: paymentMethod,
        customer_info: customerInfo,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      console.log('🛒 Preparing checkout:', orderData);

      // Handle payment based on method
      if (paymentMethod === 'midtrans') {
        // For Midtrans: Save order data to localStorage, create payment first
        // Order will be created after successful payment via webhook
        localStorage.setItem('pending_order', JSON.stringify(orderData));
        
        const paymentData = {
          gross_amount: getTotalPrice(),
          customer_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
          item_details: cartItems.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        };

        console.log('💳 Creating Midtrans payment:', paymentData);

        const paymentResponse = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData),
        });

        const paymentResult = await paymentResponse.json();
        console.log('💳 Payment result:', paymentResult);

        if (!paymentResponse.ok) {
          toast.error('Gagal membuat pembayaran', {
            description: paymentResult.error || 'Silakan coba lagi.',
          });
          localStorage.removeItem('pending_order');
          setLoading(false);
          return;
        }

        // Clear cart before redirecting (but keep pending_order for webhook)
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));

        // Redirect to Midtrans payment page
        if (paymentResult.redirect_url) {
          window.location.href = paymentResult.redirect_url;
        } else {
          toast.error('Link pembayaran tidak ditemukan');
          localStorage.removeItem('pending_order');
          setLoading(false);
        }
      } else {
        // Manual payment methods (transfer_bank, cod) - Create order immediately
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error('Checkout gagal', {
            description: data.error || 'Silakan periksa data dan coba lagi.',
          });
          setLoading(false);
          return;
        }

        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        
        toast.success('Pesanan berhasil dibuat!', {
          description: paymentMethod === 'transfer_bank' 
            ? 'Silakan transfer ke rekening yang tertera' 
            : 'Pesanan akan dikirim, bayar saat barang tiba',
        });
        
        setTimeout(() => {
          router.push('/client/akun?tab=orders&success=true');
        }, 1000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Terjadi kesalahan', {
        description: 'Periksa koneksi internet dan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-amber-500" />
              Checkout
            </h1>
            <p className="text-slate-400 mt-2">Lengkapi informasi untuk menyelesaikan pesanan</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="bg-slate-800/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Informasi Pelanggan</CardTitle>
                  {loadingProfile && (
                    <p className="text-xs text-amber-500">Memuat data profil...</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Masukkan nama lengkap"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="email@example.com"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">Nomor HP</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="08xxxxxxxxxx"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-300">Alamat Pengiriman</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder="Masukkan alamat lengkap"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-slate-800/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="midtrans" className="text-white">
                        💳 Midtrans Payment Gateway
                      </SelectItem>
                      <SelectItem value="transfer_bank" className="text-white">Transfer Bank Manual</SelectItem>
                      <SelectItem value="cod" className="text-white">Cash on Delivery (COD)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-4 bg-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-300 text-sm">
                      {paymentMethod === 'midtrans' && (
                        <span>
                          💳 <strong>Midtrans Payment Gateway</strong><br/>
                          Bayar dengan berbagai metode: Credit Card, Debit Card, GoPay, ShopeePay, QRIS, Bank Transfer (BCA, Mandiri, BNI, BRI, Permata), dan lainnya.
                        </span>
                      )}
                      {paymentMethod === 'transfer_bank' && '� Transfer manual ke rekening BCA/Mandiri setelah checkout'}
                      {paymentMethod === 'cod' && '💵 Bayar saat barang diterima'}
                      {paymentMethod === 'credit_card' && '💳 Pembayaran aman dengan kartu kredit/debit'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-amber-500/20 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <ShoppingCart className="h-6 w-6 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {item.product.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-amber-500 text-sm font-semibold">
                            Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-700 pt-4 space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Ongkir</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Biaya Admin</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span className="text-amber-500">
                          Rp {getTotalPrice().toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={loading || !customerInfo.name || !customerInfo.phone}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                  >
                    {loading ? (
                      'Memproses...'
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Bayar Sekarang
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    Dengan melanjutkan, Anda menyetujui syarat dan ketentuan
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
