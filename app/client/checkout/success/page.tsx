/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const createOrderFromPendingData = async (midtransOrderId: string) => {
    try {
      console.log('🔍 Checking localStorage for pending_order...');
      
      // Get pending order data from localStorage
      const pendingOrderStr = localStorage.getItem('pending_order');
      
      if (!pendingOrderStr) {
        console.error('❌ No pending order found in localStorage');
        console.log('Available localStorage keys:', Object.keys(localStorage));
        setLoading(false);
        return;
      }

      console.log('✅ Pending order found:', pendingOrderStr.substring(0, 100) + '...');
      
      const pendingOrder = JSON.parse(pendingOrderStr);
      console.log('📦 Parsed pending order:', pendingOrder);
      
      // Validate required fields
      if (!pendingOrder.user_id) {
        console.error('❌ Missing user_id in pending order');
        setLoading(false);
        return;
      }
      
      if (!pendingOrder.items || pendingOrder.items.length === 0) {
        console.error('❌ No items in pending order');
        setLoading(false);
        return;
      }
      
      // Add midtrans order ID to the order data
      const orderData = {
        ...pendingOrder,
        midtrans_order_id: midtransOrderId,
        payment_status: 'paid',
      };

      console.log('📤 Creating order with data:', orderData);

      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      console.log('📨 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Order created successfully:', data.order);
        console.log('✅ Order ID:', data.order?.id);
        console.log('✅ Order user_id:', data.order?.user_id);
        console.log('✅ Order total:', data.order?.total_amount);
        setOrderDetails(data.order);
        
        // Clean up pending order and cart
        localStorage.removeItem('pending_order');
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        
        console.log('🧹 Cleaned up localStorage');
      } else {
        const error = await response.json();
        console.error('❌ Failed to create order - Full response:', error);
        console.error('❌ Response status:', response.status);
        console.error('❌ Error message:', error.error || error.message);
        
        // Show error to user
        toast.error('Gagal membuat pesanan', {
          description: error.error || 'Terjadi kesalahan'
        });
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Success page useEffect triggered');
    
    // Check if there's pending order data
    const pendingOrderStr = localStorage.getItem('pending_order');
    
    console.log('🔍 Checking localStorage...');
    console.log('📦 pending_order exists:', !!pendingOrderStr);
    console.log('📦 All localStorage keys:', Object.keys(localStorage));
    
    if (!pendingOrderStr) {
      console.warn('⚠️ No pending order found in localStorage');
      console.log('⚠️ This usually means order was already processed or user navigated directly');
      setLoading(false);
      return;
    }

    console.log('✅ Payment success page loaded');
    console.log('📦 Found pending_order in localStorage');
    console.log('📦 Raw pending_order (first 200 chars):', pendingOrderStr.substring(0, 200));

    try {
      const pendingOrder = JSON.parse(pendingOrderStr);
      const midtransOrderId = pendingOrder.midtrans_order_id;
      
      console.log('📋 Full pending order data:', pendingOrder);
      console.log('📋 Pending order summary:', {
        has_user_id: !!pendingOrder.user_id,
        user_id_value: pendingOrder.user_id,
        has_items: !!pendingOrder.items?.length,
        items_count: pendingOrder.items?.length,
        items_preview: pendingOrder.items?.map((i: any) => ({ product_id: i.product_id, qty: i.quantity })),
        total_amount: pendingOrder.total_amount,
        payment_method: pendingOrder.payment_method,
        midtrans_order_id: midtransOrderId,
      });

      if (midtransOrderId) {
        console.log('🚀 Calling createOrderFromPendingData with:', midtransOrderId);
        createOrderFromPendingData(midtransOrderId);
      } else {
        console.error('❌ No midtrans_order_id in pending_order');
        console.error('❌ Pending order structure:', Object.keys(pendingOrder));
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error parsing pending_order:', error);
      console.error('❌ Raw data:', pendingOrderStr);
      setLoading(false);
    }
  }, []);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pembayaran Berhasil!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Terima kasih telah berbelanja di Chicha Mobile
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-6 bg-white dark:bg-gray-800 border-green-200 dark:border-green-900">
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat detail pesanan...</p>
                </div>
              ) : orderDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {orderDetails.id}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      Rp {(orderDetails.total_amount || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status Pembayaran</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {orderDetails.payment_status === 'paid' ? 'Lunas' : 'Berhasil'}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Informasi Pesanan</p>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            Pesanan Anda sedang diproses
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Kami akan segera memproses pesanan Anda. Silakan cek halaman riwayat pesanan untuk update status.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Pembayaran Anda telah berhasil diproses
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/client/akun?tab=orders" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Package className="w-4 h-4 mr-2" />
                Lihat Riwayat Pesanan
              </Button>
            </Link>
            <Link href="/client/produk" className="flex-1">
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20">
                Lanjut Belanja
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Butuh bantuan? Hubungi customer service kami</p>
            <p className="mt-1">
              <a href="mailto:support@chicha-mobile.me" className="text-green-600 dark:text-green-400 hover:underline">
                support@chicha-mobile.me
              </a>
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ClientLayout>
    }>
      <SuccessContent />
    </Suspense>
  );
}
