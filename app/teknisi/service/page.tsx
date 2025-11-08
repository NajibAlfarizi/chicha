'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeknisiLayout from '@/components/TeknisiLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';
import { Search, Wrench, User, Phone, Calendar, ArrowRight, Filter } from 'lucide-react';
import { Booking } from '@/lib/types';
import Link from 'next/link';

export default function TeknisiServicePage() {
  const router = useRouter();
  const { teknisi, isAuthenticated, loading: authLoading } = useTeknisiAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/teknisi/login');
      return;
    }

    if (isAuthenticated && teknisi) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, teknisi]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?teknisi_id=${teknisi?.id}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressBadge = (status?: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-500', label: 'Pending' },
      diagnosed: { color: 'bg-blue-500/20 text-blue-500', label: 'Diagnosed' },
      in_progress: { color: 'bg-purple-500/20 text-purple-500', label: 'In Progress' },
      waiting_parts: { color: 'bg-orange-500/20 text-orange-500', label: 'Waiting Parts' },
      completed: { color: 'bg-green-500/20 text-green-500', label: 'Completed' },
      cancelled: { color: 'bg-red-500/20 text-red-500', label: 'Cancelled' },
    };
    const { color, label } = config[status || 'pending'] || config.pending;
    return <Badge className={color}>{label}</Badge>;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.issue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.progress_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.progress_status === 'pending').length,
    in_progress: bookings.filter((b) =>
      ['diagnosed', 'in_progress', 'waiting_parts'].includes(b.progress_status || '')
    ).length,
    completed: bookings.filter((b) => b.progress_status === 'completed').length,
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold  flex items-center gap-3 mb-2">
            <Wrench className="h-8 w-8 text-amber-500" />
            Daftar Service
          </h1>
          <p className="text-muted-foreground">Kelola semua service yang ditugaskan kepada Anda</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border-amber-500/20">
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs mb-1">Total</p>
              <p className="text-2xl font-bold ">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-yellow-500/20">
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-purple-500/20">
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs mb-1">In Progress</p>
              <p className="text-2xl font-bold text-purple-500">{stats.in_progress}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-green-500/20">
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Cari device, kode service, atau masalah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10  "
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]  ">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="diagnosed">Diagnosed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service List */}
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader>
            <CardTitle className="">
              Service ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Tidak ada service yang sesuai dengan filter'
                    : 'Belum ada service yang ditugaskan'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors border"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className=" font-semibold">{booking.device_name}</h3>
                          {getProgressBadge(booking.progress_status)}
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{booking.issue}</p>
                      </div>
                      {booking.service_code && (
                        <Badge
                          variant="outline"
                          className="border-amber-500 text-amber-500 font-mono text-xs ml-2"
                        >
                          {booking.service_code}
                        </Badge>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3 pb-3 border-b ">
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
                        {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Progress Notes */}
                    {booking.progress_notes && (
                      <div className="mb-3 shadow-sm p-3 rounded text-xs">
                        <p className="text-muted-foreground mb-1">Progress Notes:</p>
                        <p className=" line-clamp-2">{booking.progress_notes}</p>
                      </div>
                    )}

                    {/* Actions */}
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
