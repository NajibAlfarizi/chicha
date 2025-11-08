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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TeknisiLayout>
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="bg-linear-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold  mb-2">
                  Selamat Datang, {teknisi?.name}!
                </h2>
                <p className="">
                  Anda memiliki {stats.pending} service baru yang perlu ditangani
                </p>
              </div>
              <Wrench className="h-16 w-16 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Services</p>
                  <p className="text-3xl font-bold ">{stats.total}</p>
                </div>
                <Wrench className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-purple-500">{stats.in_progress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Selesai Hari Ini</p>
                  <p className="text-3xl font-bold text-green-500">{stats.completed_today}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Services */}
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="">Service Terbaru</CardTitle>
            <Link href="/teknisi/service">
              <Button variant="outline" size="sm" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
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
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className=" font-semibold">{booking.device_name}</h3>
                          {getProgressBadge(booking.progress_status)}
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1">{booking.issue}</p>
                      </div>
                      {booking.service_code && (
                        <Badge variant="outline" className="border-amber-500 text-amber-500 font-mono text-xs">
                          {booking.service_code}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {booking.user?.name || 'Customer'}
                      </div>
                      {booking.user?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {booking.user.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.booking_date).toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    <Link href={`/teknisi/service/${booking.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-amber-500 text-amber-500 hover:bg-amber-500/10"
                      >
                        Detail & Update Progress
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TeknisiLayout>
  );
}
