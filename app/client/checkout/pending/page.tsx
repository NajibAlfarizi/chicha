'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ShoppingBag, CreditCard, Clock } from 'lucide-react';
import { Order } from '@/lib/types';

export default function PendingPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const isPaymentExpired = (order: Order) => {
    if (!order.payment_expired_at) {
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 24;
    }
    
    const expiredAt = new Date(order.payment_expired_at);
    return new Date() > expiredAt;
  };

  const getRemainingTime = (order: Order) => {
    if (!order.payment_expired_at) {
      const createdAt = new Date(order.created_at);
      const expiredAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      return expiredAt.getTime() - new Date().getTime();
    }
    
    const expiredAt = new Date(order.payment_expired_at);
    return expiredAt.getTime() - new Date().getTime();
  };

  const formatRemainingTime = (milliseconds: number) => {
    if (milliseconds <= 0) return 'Expired';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  useEffect(() => {
    if (!orderId) {
      router.push('/client/akun?tab=orders');
      return;
    }

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        router.push('/client/akun?tab=orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinuePayment = async () => {
    if (!order?.midtrans_order_id) return;

    setProcessingPayment(true);
    
    try {
      // Get payment token
      const response = await fetch('/api/midtrans/get-payment-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.midtrans_order_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to get payment token');
      }

      const data = await response.json();

      // Load Snap.js if not already loaded
      const existingScript = document.querySelector('script[src*="snap.js"]');
      
      const openPayment = () => {
        const snap = (window as any).snap;
        snap.pay(data.token, {
          onSuccess: function() {
            router.push(`/client/checkout/success?order_id=${order.id}`);
          },
          onPending: function() {
            router.push(`/client/akun?tab=orders`);
          },
          onError: function() {
            setProcessingPayment(false);
          },
          onClose: function() {
            setProcessingPayment(false);
          }
        });
      };

      if (existingScript) {
        openPayment();
      } else {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        script.onload = openPayment;
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error('Error continuing payment:', error);
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!order) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">Pesanan yang Anda cari tidak tersedia</p>
          <Button onClick={() => router.push('/client/akun?tab=orders')} className="bg-amber-500 hover:bg-amber-600">
            Lihat Semua Pesanan
          </Button>
        </div>
      </ClientLayout>
    );
  }

  const expired = isPaymentExpired(order);
  const remainingTime = !expired ? getRemainingTime(order) : 0;

  // If expired, show expired message
  if (expired) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-red-500/30 shadow-lg">
            <CardHeader className="text-center bg-red-500/10 border-b border-red-500/20">
              <div className="mx-auto mb-4">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              </div>
              <CardTitle className="text-2xl font-bold">Pembayaran Kadaluarsa</CardTitle>
              <p className="text-muted-foreground mt-2">
                Batas waktu pembayaran telah habis
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">ID Pesanan</p>
                      <p className="font-semibold">{order.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-red-500">
                      Rp {order.total_amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>
                      Pesanan ini telah melewati batas waktu pembayaran (24 jam) dan akan dibatalkan secara otomatis.
                      Silakan buat pesanan baru jika masih ingin melakukan pembelian.
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/client/produk')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-base"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Belanja Lagi
                </Button>

                <Button
                  onClick={() => router.push('/client/akun?tab=orders')}
                  variant="outline"
                  className="w-full border-slate-700 h-12"
                >
                  Lihat Pesanan Saya
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-amber-500/30 shadow-lg">
          <CardHeader className="text-center bg-amber-500/10 border-b border-amber-500/20">
            <div className="mx-auto mb-4">
              <Clock className="h-16 w-16 text-amber-500 mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">Pembayaran Belum Diselesaikan</CardTitle>
            <p className="text-muted-foreground mt-2">
              Pesanan Anda telah dibuat tetapi pembayaran belum diselesaikan
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Order Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">ID Pesanan</p>
                    <p className="font-semibold">{order.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                  <p className="text-xl font-bold text-amber-500">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>
                    Pesanan Anda masih tersimpan. Silakan selesaikan pembayaran untuk memproses pesanan.
                    {order.payment_status === 'pending' && ' Status pembayaran masih pending.'}
                  </span>
                </p>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 ml-7">
                  ⏰ Sisa waktu pembayaran: {formatRemainingTime(remainingTime)}
                </p>
              </div>

              {/* Order Items Summary */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Item Pesanan:</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-muted/20 rounded">
                        <span>{item.product_name || item.name} x{item.quantity}</span>
                        <span className="font-medium">
                          Rp {((item.price || 0) * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleContinuePayment}
                disabled={processingPayment || !order.midtrans_order_id}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-base"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {processingPayment ? 'Memproses...' : 'Lanjutkan Pembayaran'}
              </Button>

              <Button
                onClick={() => router.push('/client/akun?tab=orders')}
                variant="outline"
                className="w-full border-slate-700 h-12"
              >
                Lihat Pesanan Saya
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Anda juga bisa melanjutkan pembayaran nanti dari halaman pesanan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
