'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Package, 
  CheckCircle2, 
  Clock,
  User,
  Calendar,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Booking, ServiceProgress } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

function ProgressContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('booking_id');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [progressList, setProgressList] = useState<ServiceProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // Fetch booking details
        const bookingRes = await fetch(`/api/bookings/${bookingId}`);
        const bookingData = await bookingRes.json();
        
        if (bookingData.booking) {
          setBooking(bookingData.booking);
        }

        // Fetch progress list
        const progressRes = await fetch(`/api/progress?booking_id=${bookingId}`);
        const progressData = await progressRes.json();
        
        if (progressData.progress) {
          setProgressList(progressData.progress);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    const subscribeToProgress = () => {
      const channel = supabase
        .channel('progress_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'service_progress',
            filter: `booking_id=eq.${bookingId}`,
          },
          (payload) => {
            console.log('New progress update:', payload);
            setProgressList((prev) => [...prev, payload.new as ServiceProgress]);
            setRealtimeConnected(true);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `id=eq.${bookingId}`,
          },
          (payload) => {
            console.log('Booking updated:', payload);
            setBooking(payload.new as Booking);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to realtime updates');
            setRealtimeConnected(true);
          }
        });

      return channel;
    };

    if (bookingId) {
      fetchBookingData();
      subscribeToProgress();
    }

    return () => {
      supabase.channel('progress_updates').unsubscribe();
    };
  }, [bookingId]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      baru: 'bg-blue-500/20 text-blue-500',
      proses: 'bg-yellow-500/20 text-yellow-500',
      selesai: 'bg-green-500/20 text-green-500',
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  const getProgressIcon = (index: number) => {
    const isLast = index === progressList.length - 1;
    return isLast ? (
      <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
        <Wrench className="h-5 w-5 text-slate-900" />
      </div>
    ) : (
      <div className="h-10 w-10 rounded-full bg-slate-700 border-2 border-amber-500 flex items-center justify-center">
        <CheckCircle2 className="h-5 w-5 text-amber-500" />
      </div>
    );
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!booking) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Booking Tidak Ditemukan</h2>
          <p className="text-slate-400 mb-6">Booking yang Anda cari tidak tersedia</p>
          <Button onClick={() => window.history.back()} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
            Kembali
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wrench className="h-8 w-8 text-amber-500" />
                Progress Service
              </h1>
              <p className="text-slate-400 mt-2">Track real-time progress perbaikan perangkat Anda</p>
            </div>
            {realtimeConnected && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                ● Live Updates
              </Badge>
            )}
          </div>

          {/* Booking Info Card */}
          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Informasi Booking</span>
                {getStatusBadge(booking.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Perangkat</p>
                  <p className="text-white font-semibold">{booking.device_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Keluhan</p>
                  <p className="text-white font-semibold">{booking.issue}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Teknisi</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-500" />
                    <span className="text-white">
                      {booking.teknisi ? booking.teknisi.name : 'Belum ditentukan'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Tanggal Booking</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span className="text-white">
                      {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-slate-400 text-sm mb-1">Catatan</p>
                  <p className="text-white">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-6 w-6 text-amber-500" />
                Timeline Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressList.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Belum ada update progress</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Progress akan muncul di sini ketika teknisi melakukan update
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {progressList.map((progress, index) => (
                    <div key={progress.id} className="flex gap-4">
                      {/* Timeline Icon */}
                      <div className="flex flex-col items-center">
                        {getProgressIcon(index)}
                        {index !== progressList.length - 1 && (
                          <div className="w-0.5 h-full bg-amber-500/30 mt-2"></div>
                        )}
                      </div>

                      {/* Progress Content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-semibold">{progress.description}</h4>
                            <span className="text-slate-400 text-sm">
                              {new Date(progress.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm">
                            {new Date(progress.created_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardContent className="py-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-slate-400 text-sm">Booking ID</p>
                  <p className="text-white font-semibold text-xs mt-1">
                    {booking.id.slice(0, 8)}...
                  </p>
                </div>
                <div>
                  <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                    <Wrench className="h-6 w-6 text-yellow-500" />
                  </div>
                  <p className="text-slate-400 text-sm">Total Updates</p>
                  <p className="text-white font-semibold">{progressList.length}</p>
                </div>
                <div>
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <p className="text-white font-semibold capitalize">{booking.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/30">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">Butuh Bantuan?</h4>
                  <p className="text-slate-300 text-sm">
                    Hubungi customer service kami untuk informasi lebih lanjut tentang progress service Anda
                  </p>
                </div>
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                  Hubungi CS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ClientLayout>
    }>
      <ProgressContent />
    </Suspense>
  );
}
