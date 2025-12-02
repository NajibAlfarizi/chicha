/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, CreditCard, CheckCircle, Ticket } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
  
  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    id: string;
    code: string;
    name: string;
    discount: number;
  } | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check authentication
    if (!isAuthenticated || !user) {
      console.error('❌ Not authenticated or user not loaded');
      toast.error('Login diperlukan', {
        description: 'Silakan login untuk melakukan checkout',
      });
      router.push('/auth/login?redirect=/client/checkout');
      return;
    }

    console.log('✅ User authenticated:', user.id);

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

    // Fetch available vouchers
    fetchAvailableVouchers();

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
  }, [router, isAuthenticated, authLoading, user]);

  const fetchAvailableVouchers = async () => {
    try {
      // Get user_id from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.warn('⚠️ No user found, cannot fetch personalized vouchers');
        return;
      }
      
      const localUser = JSON.parse(userStr);
      const userId = localUser.id;

      console.log('🎫 Fetching vouchers for user:', userId);
      const response = await fetch(`/api/vouchers?user_id=${userId}`);
      const data = await response.json();
      console.log('🎫 API Response:', data);
      console.log('🎫 Available vouchers (unused by user):', data.vouchers?.length || 0);
      setAvailableVouchers(data.vouchers || []);
      
      if (!data.vouchers || data.vouchers.length === 0) {
        console.warn('⚠️ No vouchers available. Possible reasons:');
        console.warn('1. All vouchers already used by this user');
        console.warn('2. No active vouchers in database');
        console.warn('3. Voucher dates not valid (check valid_from and valid_until)');
      }
    } catch (error) {
      console.error('❌ Error fetching vouchers:', error);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getDiscount = () => {
    return appliedVoucher?.discount || 0;
  };

  const getTotalPrice = () => {
    return getSubtotal() - getDiscount();
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Masukkan kode voucher');
      return;
    }

    setVoucherLoading(true);

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: voucherCode.trim(),
          subtotal: getSubtotal(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedVoucher({
          id: data.voucher.id,
          code: data.voucher.code,
          name: data.voucher.name,
          discount: data.discount,
        });
        toast.success(data.message || 'Voucher berhasil diterapkan!');
      } else {
        toast.error(data.error || 'Kode voucher tidak valid');
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      toast.error('Gagal menerapkan voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    toast.success('Voucher dihapus');
  };

  const handleQuickApplyVoucher = async (code: string) => {
    setVoucherCode(code);
    setVoucherLoading(true);

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          subtotal: getSubtotal(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedVoucher({
          id: data.voucher.id,
          code: data.voucher.code,
          name: data.voucher.name,
          discount: data.discount,
        });
        toast.success(data.message || 'Voucher berhasil diterapkan!');
      } else {
        toast.error(data.error || 'Kode voucher tidak valid');
        setVoucherCode('');
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      toast.error('Gagal menerapkan voucher');
      setVoucherCode('');
    } finally {
      setVoucherLoading(false);
    }
  };

  const openSnapPayment = (token: string, orderId: string) => {
    const snap = (window as any).snap;
    
    snap.pay(token, {
      onSuccess: function(result: any) {
        console.log('✅ Payment success:', result);
        // Redirect to success page - payment status will be updated there
        router.push(`/client/checkout/success?order_id=${orderId}`);
      },
      onPending: function(result: any) {
        console.log('⏳ Payment pending:', result);
        toast.warning('Pembayaran tertunda', {
          description: 'Pembayaran Anda masih dalam proses. Silakan cek status di halaman pesanan.',
        });
        router.push(`/client/akun?tab=orders`);
      },
      onError: function(result: any) {
        console.error('❌ Payment error:', result);
        toast.error('Pembayaran gagal', {
          description: 'Silakan coba lagi',
        });
        setLoading(false);
      },
      onClose: function() {
        console.log('❌ Payment popup closed');
        toast.warning('Pembayaran dibatalkan', {
          description: 'Anda menutup halaman pembayaran. Pesanan masih tersimpan.',
        });
        // Redirect to orders page instead of staying on checkout
        router.push(`/client/akun?tab=orders`);
      }
    });
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

      // Validate user is authenticated
      if (!user?.id) {
        console.error('❌ User ID not found');
        toast.error('Session expired', {
          description: 'Silakan login kembali',
        });
        router.push('/auth/login?redirect=/client/checkout');
        setLoading(false);
        return;
      }

      console.log('👤 User ID:', user.id);
      console.log('📋 Customer Info:', customerInfo);
      console.log('🎫 Applied Voucher:', appliedVoucher);

      const orderData = {
        user_id: user.id,
        subtotal: getSubtotal(),
        discount_amount: getDiscount(),
        total_amount: getTotalPrice(),
        payment_method: paymentMethod,
        customer_info: customerInfo,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        voucher_id: appliedVoucher?.id || null,
        voucher_code: appliedVoucher?.code || null,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      console.log('🛒 Preparing checkout with complete data:', {
        user_id: orderData.user_id,
        customer_name: orderData.customer_info?.name,
        voucher_code: orderData.voucher_code,
        items_count: orderData.items.length,
        total_amount: orderData.total_amount,
      });

      // Handle payment based on method
      if (paymentMethod === 'midtrans') {
        console.log('💳 Step 1: Creating order in database first...');
        
        // Create order first with pending payment status
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderData,
            payment_status: 'pending',
          }),
        });

        if (!orderResponse.ok) {
          const orderError = await orderResponse.json();
          console.error('❌ Failed to create order:', orderError);
          toast.error('Gagal membuat pesanan', {
            description: orderError.error || 'Silakan coba lagi.',
          });
          setLoading(false);
          return;
        }

        const { order } = await orderResponse.json();
        console.log('✅ Order created:', order.id);
        console.log('✅ Order user_id:', order.user_id);
        console.log('✅ Order total:', order.total_amount);

        // Prepare item details for Midtrans
        const itemDetails = cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        }));

        // Add voucher discount as negative item if voucher applied
        if (appliedVoucher && getDiscount() > 0) {
          itemDetails.push({
            id: 'VOUCHER-DISCOUNT',
            name: `Diskon Voucher ${appliedVoucher.code}`,
            price: -getDiscount(),
            quantity: 1,
          });
        }

        const paymentData = {
          gross_amount: getTotalPrice(),
          order_id: order.id, // Use database order ID
          customer_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
          item_details: itemDetails,
        };

        console.log('💳 Step 2: Creating Midtrans payment for order:', order.id);

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
          setLoading(false);
          return;
        }

        // Update order with midtrans_order_id
        console.log('💾 Step 3: Updating order with midtrans_order_id...');
        await fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            midtrans_order_id: paymentResult.order_id,
          }),
        });

        console.log('✅ Order updated with midtrans_order_id:', paymentResult.order_id);

        // Verify pending_order is saved
        const savedPendingOrder = localStorage.getItem('pending_order');
        console.log('✅ Pending order saved:', savedPendingOrder ? 'Yes' : 'No');
        if (savedPendingOrder) {
          const parsed = JSON.parse(savedPendingOrder);
          console.log('📦 Pending order data:', {
            user_id: parsed.user_id,
            total_amount: parsed.total_amount,
            items_count: parsed.items?.length,
            midtrans_order_id: parsed.midtrans_order_id,
          });
        }

        // Clear cart before redirecting (but keep pending_order for success page)
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        console.log('🗑️ Cart cleared');

        // Open Midtrans Snap payment popup
        if (paymentResult.token) {
          console.log('🚀 Opening Midtrans Snap with token:', paymentResult.token);
          
          // Load Snap.js if not already loaded
          if (!(window as any).snap) {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
            script.onload = () => {
              openSnapPayment(paymentResult.token, order.id);
            };
            document.body.appendChild(script);
          } else {
            openSnapPayment(paymentResult.token, order.id);
          }
        } else {
          console.error('❌ No token in payment result');
          toast.error('Link pembayaran tidak ditemukan');
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
              <Card className="bg-slate-900/90 border-slate-700">
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

              {/* Voucher Section */}
              <Card className="bg-slate-900/90 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-amber-500" />
                    Voucher Diskon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedVoucher ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-bold text-green-400">{appliedVoucher.code}</span>
                          </div>
                          <p className="text-sm text-slate-300">{appliedVoucher.name}</p>
                          <p className="text-lg font-bold text-green-400 mt-2">
                            - Rp {appliedVoucher.discount.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveVoucher}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Dropdown Voucher Selector */}
                      <div className="space-y-2">
                        <Label className="text-slate-300">Pilih Voucher</Label>
                        <Select
                          value=""
                          onValueChange={(voucherCode) => {
                            if (voucherCode) {
                              handleQuickApplyVoucher(voucherCode);
                            }
                          }}
                          disabled={voucherLoading}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Pilih voucher yang tersedia" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {availableVouchers.length === 0 ? (
                              <SelectItem value="none" disabled className="text-slate-400">
                                Tidak ada voucher tersedia
                              </SelectItem>
                            ) : (
                              availableVouchers.map((voucher) => {
                                const isEligible = getSubtotal() >= voucher.min_purchase;
                                const quotaLeft = voucher.quota - voucher.used;
                                const isAvailable = isEligible && quotaLeft > 0;
                                
                                return (
                                  <SelectItem
                                    key={voucher.id}
                                    value={voucher.code}
                                    disabled={!isAvailable}
                                    className={`${
                                      isAvailable
                                        ? 'text-white hover:bg-slate-700'
                                        : 'text-slate-500 opacity-50'
                                    }`}
                                  >
                                    <div className="flex flex-col py-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-amber-400">
                                          {voucher.code}
                                        </span>
                                        {quotaLeft <= 10 && quotaLeft > 0 && (
                                          <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                            Sisa {quotaLeft}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-sm text-slate-300">{voucher.name}</span>
                                      <span className="text-xs text-slate-400">
                                        {voucher.type === 'percentage' ? (
                                          <>Diskon {voucher.value}%</>
                                        ) : (
                                          <>Potongan Rp {voucher.value.toLocaleString('id-ID')}</>
                                        )}
                                        {' • Min. Rp '}{voucher.min_purchase.toLocaleString('id-ID')}
                                      </span>
                                      {!isEligible && (
                                        <span className="text-xs text-red-400 mt-0.5">
                                          ⚠️ Belanja kurang dari minimal
                                        </span>
                                      )}
                                      {quotaLeft === 0 && (
                                        <span className="text-xs text-red-400 mt-0.5">
                                          ❌ Kuota habis
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Manual Input Voucher */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-slate-900 px-2 text-slate-400">Atau masukkan kode</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="Masukkan kode voucher"
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                          disabled={voucherLoading}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && voucherCode.trim()) {
                              handleApplyVoucher();
                            }
                          }}
                        />
                        <Button
                          onClick={handleApplyVoucher}
                          disabled={voucherLoading || !voucherCode.trim()}
                          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                        >
                          {voucherLoading ? 'Validasi...' : 'Gunakan'}
                        </Button>
                      </div>

                      <p className="text-xs text-slate-400 flex items-start gap-1">
                        <span>💡</span>
                        <span>Pilih voucher dari dropdown atau masukkan kode manual. Hanya 1 voucher per transaksi.</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-slate-900/90 border-slate-700">
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
              <Card className="bg-slate-900/90 border-slate-700 sticky top-24">
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
                      <span>Rp {getSubtotal().toLocaleString('id-ID')}</span>
                    </div>
                    {appliedVoucher && (
                      <div className="flex justify-between text-green-500">
                        <span className="flex items-center gap-1">
                          <Ticket className="h-4 w-4" />
                          Diskon Voucher
                        </span>
                        <span>- Rp {getDiscount().toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>Ongkir</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total Bayar</span>
                        <span className="text-amber-500">
                          Rp {getTotalPrice().toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {appliedVoucher && paymentMethod === 'midtrans' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-xs text-green-400 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Voucher {appliedVoucher.code} akan otomatis diterapkan.</strong>
                          <br />
                          Anda akan membayar Rp {getTotalPrice().toLocaleString('id-ID')} (sudah termasuk diskon Rp {getDiscount().toLocaleString('id-ID')})
                        </span>
                      </p>
                    </div>
                  )}

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
                        {paymentMethod === 'midtrans' ? 'Lanjut ke Pembayaran' : 'Bayar Sekarang'}
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
