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
        {/* Header */}
        <Card className="shadow-md border-amber-200/50 dark:border-amber-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Wrench className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                    Manajemen Service
                  </h1>
                  <p className="text-muted-foreground mt-1">Kelola, filter, dan pantau semua service secara detail</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 px-5 py-3 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Service</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Filter Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-left p-4 rounded-xl transition-all duration-300 border-2 ${
              statusFilter === 'all'
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-600 shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/30 hover:border-amber-400 hover:shadow-md'
            }`}
          >
            <p className={`text-xs mb-1 ${statusFilter === 'all' ? 'text-white/80' : 'text-muted-foreground'}`}>Semua Service</p>
            <p className={`text-2xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`}>{stats.total}</p>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`text-left p-4 rounded-xl transition-all duration-300 border-2 ${
              statusFilter === 'pending'
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-yellow-600 shadow-lg shadow-yellow-500/30 scale-105'
                : 'bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-900/30 hover:border-yellow-400 hover:shadow-md'
            }`}
          >
            <p className={`text-xs mb-1 ${statusFilter === 'pending' ? 'text-white/80' : 'text-muted-foreground'}`}>Pending</p>
            <p className={`text-2xl font-bold ${statusFilter === 'pending' ? 'text-white' : 'text-yellow-600 dark:text-yellow-400'}`}>{stats.pending}</p>
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`text-left p-4 rounded-xl transition-all duration-300 border-2 ${
              ['diagnosed', 'in_progress', 'waiting_parts'].includes(statusFilter)
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/30 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <p className={`text-xs mb-1 ${['diagnosed', 'in_progress', 'waiting_parts'].includes(statusFilter) ? 'text-white/80' : 'text-muted-foreground'}`}>Dalam Proses</p>
            <p className={`text-2xl font-bold ${['diagnosed', 'in_progress', 'waiting_parts'].includes(statusFilter) ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>{stats.in_progress}</p>
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`text-left p-4 rounded-xl transition-all duration-300 border-2 ${
              statusFilter === 'completed'
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600 shadow-lg shadow-green-500/30 scale-105'
                : 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/30 hover:border-green-400 hover:shadow-md'
            }`}
          >
            <p className={`text-xs mb-1 ${statusFilter === 'completed' ? 'text-white/80' : 'text-muted-foreground'}`}>Selesai</p>
            <p className={`text-2xl font-bold ${statusFilter === 'completed' ? 'text-white' : 'text-green-600 dark:text-green-400'}`}>{stats.completed}</p>
          </button>
        </div>

        {/* Advanced Search & Filters */}
        <Card className="shadow-lg border-amber-200/50 dark:border-amber-900/30 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Cari & Filter Service</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Pencarian
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
                  <Input
                    placeholder="Cari device, kode service, masalah, atau nama pelanggan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 border-2 border-amber-200/50 dark:border-amber-900/30 focus:border-amber-500 dark:focus:border-amber-500 h-12 bg-amber-50/30 dark:bg-amber-950/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status Detail
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[220px] border-2 border-amber-200/50 dark:border-amber-900/30 h-12 bg-amber-50/30 dark:bg-amber-950/20">
                    <Filter className="mr-2 h-4 w-4 text-amber-500" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">✓ Semua Status</SelectItem>
                    <SelectItem value="pending">⏱ Pending</SelectItem>
                    <SelectItem value="diagnosed">🔍 Diagnosed</SelectItem>
                    <SelectItem value="in_progress">⚙️ In Progress</SelectItem>
                    <SelectItem value="waiting_parts">📦 Waiting Parts</SelectItem>
                    <SelectItem value="completed">✅ Completed</SelectItem>
                    <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service List */}
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
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
                    className="group bg-gradient-to-r from-slate-50 to-amber-50/50 dark:from-slate-900/50 dark:to-amber-950/20 rounded-xl p-5 hover:shadow-xl transition-all duration-300 border border-amber-200/50 dark:border-amber-900/30 hover:border-amber-400/50 dark:hover:border-amber-600/50"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg">{booking.device_name}</h3>
                          {getProgressBadge(booking.progress_status)}
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{booking.issue}</p>
                      </div>
                      {booking.service_code && (
                        <Badge
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-mono text-xs ml-2 shadow-lg"
                        >
                          {booking.service_code}
                        </Badge>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="bg-amber-500/5 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 mb-2">Informasi Pelanggan</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{booking.customer_name || booking.user?.name || 'N/A'}</span>
                        </div>
                        {(booking.customer_phone || booking.user?.phone) && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">{booking.customer_phone || booking.user?.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-500" />
                          <span>{new Date(booking.booking_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}</span>
                        </div>
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
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all"
                      >
                        Detail & Update Progress
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
