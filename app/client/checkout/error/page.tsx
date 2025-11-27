'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  
  // Get error details from URL params
  const orderId = searchParams.get('order_id');
  const transactionStatus = searchParams.get('transaction_status');
  const statusMessage = searchParams.get('status_message');
  
  console.log('❌ Payment error:', { orderId, transactionStatus, statusMessage });
  
  const errorMessage = statusMessage 
    || (transactionStatus ? `Pembayaran ${transactionStatus}` : 'Terjadi kesalahan dalam proses pembayaran');

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pembayaran Gagal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Maaf, terjadi kesalahan dalam proses pembayaran
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="mb-6 bg-white dark:bg-gray-800 border-red-200 dark:border-red-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        Detail Error
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {errorMessage || 'Pembayaran tidak dapat diproses'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Kemungkinan Penyebab:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Saldo tidak mencukupi atau limit kartu kredit terlampaui</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Koneksi internet terputus saat proses pembayaran</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Pembayaran dibatalkan oleh pengguna</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>OTP atau verifikasi keamanan gagal</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Apa yang harus dilakukan?
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✓</span>
                      <span>Periksa kembali saldo atau limit kartu Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✓</span>
                      <span>Pastikan koneksi internet stabil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✓</span>
                      <span>Coba gunakan metode pembayaran yang berbeda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">✓</span>
                      <span>Hubungi bank Anda jika masalah berlanjut</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/client/keranjang" className="flex-1">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </Link>
            <Link href="/client/produk" className="flex-1">
              <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali Belanja
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Butuh bantuan? Hubungi customer service kami</p>
            <p className="mt-1">
              <a href="mailto:support@chicha-mobile.me" className="text-amber-600 dark:text-amber-400 hover:underline">
                support@chicha-mobile.me
              </a>
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

export default function CheckoutErrorPage() {
  return (
    <Suspense fallback={
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </ClientLayout>
    }>
      <ErrorContent />
    </Suspense>
  );
}
