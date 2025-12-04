'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeknisiLayout from '@/components/TeknisiLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import { Booking } from '@/lib/types';
import Link from 'next/link';

export default function TeknisiDashboardPage() {
  const router = useRouter();
  const { teknisi, isAuthenticated, loading: authLoading } = useTeknisiAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed_today: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/teknisi/login');
      return;
    }

    if (isAuthenticated && teknisi) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, teknisi]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?teknisi_id=${teknisi?.id}`);
      const data = await response.json();
      
      const myBookings = data.bookings || [];
      setBookings(myBookings);

      // Calculate stats
      const today = new Date().toDateString();
      setStats({
        total: myBookings.length,
        pending: myBookings.filter((b: Booking) => b.progress_status === 'pending').length,
        in_progress: myBookings.filter((b: Booking) => 
          ['diagnosed', 'in_progress', 'waiting_parts'].includes(b.progress_status || '')
        ).length,
        completed_today: myBookings.filter((b: Booking) => 
          b.progress_status === 'completed' && 
          b.completed_at && 
          new Date(b.completed_at).toDateString() === today
        ).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressBadge = (status?: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      diagnosed: 'bg-blue-500/20 text-blue-500',
      in_progress: 'bg-purple-500/20 text-purple-500',
      waiting_parts: 'bg-orange-500/20 text-orange-500',
      completed: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
    };
    return <Badge className={colors[status || 'pending']}>{status || 'pending'}</Badge>;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <TeknisiLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </TeknisiLayout>
    );
  }

  return (
    <TeknisiLayout>
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="border-amber-200/50 dark:border-amber-900/30 shadow-lg bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-400 mb-2">
                  Selamat Datang, {teknisi?.name}!
                </h2>
                <p className="text-muted-foreground">
                  Anda memiliki <span className="font-bold text-amber-600 dark:text-amber-500">{stats.pending}</span> service baru yang perlu ditangani
                </p>
              </div>
              <Wrench className="h-16 w-16 text-amber-500/30 dark:text-amber-500/20" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Services</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Wrench className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{stats.in_progress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Selesai Hari Ini</p>
                  <p className="text-3xl font-bold">{stats.completed_today}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Activity Overview */}
        <Card className="shadow-lg border-amber-200/50 dark:border-amber-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Aktivitas Terbaru</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Ringkasan service terbaru Anda</p>
            </div>
            <Link href="/teknisi/service">
              <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada service yang ditugaskan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.slice(0, 5).map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/teknisi/service/${booking.id}`}
                    className="block group hover:bg-amber-50/50 dark:hover:bg-amber-950/20 rounded-lg p-3 border border-transparent hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        booking.progress_status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        ['diagnosed', 'in_progress', 'waiting_parts'].includes(booking.progress_status || '') ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        <Wrench className={`h-5 w-5 ${
                          booking.progress_status === 'completed' ? 'text-green-600 dark:text-green-400' :
                          ['diagnosed', 'in_progress', 'waiting_parts'].includes(booking.progress_status || '') ? 'text-purple-600 dark:text-purple-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{booking.device_name}</h3>
                          {getProgressBadge(booking.progress_status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{booking.customer_name || booking.user?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(booking.booking_date).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.service_code && (
                          <Badge variant="outline" className="font-mono text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                            {booking.service_code}
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TeknisiLayout>
  );
}
