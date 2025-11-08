'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TeknisiLayout from '@/components/TeknisiLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';
import { toast } from 'sonner';
import {
  Wrench,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Booking } from '@/lib/types';
import Link from 'next/link';

export default function TeknisiServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, loading: authLoading } = useTeknisiAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [updateData, setUpdateData] = useState({
    progress_status: '',
    progress_notes: '',
    estimated_completion: '',
  });

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setBooking(data.booking);
        setUpdateData({
          progress_status: data.booking.progress_status || 'pending',
          progress_notes: data.booking.progress_notes || '',
          estimated_completion: data.booking.estimated_completion
            ? new Date(data.booking.estimated_completion).toISOString().split('T')[0]
            : '',
        });
      } else {
        toast.error('Booking tidak ditemukan');
        router.push('/teknisi/service');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/teknisi/login');
      return;
    }

    if (isAuthenticated && params.id) {
      fetchBooking();
    }
  }, [isAuthenticated, authLoading, params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      setSaving(true);

      interface UpdatePayload {
        progress_status: string;
        progress_notes: string;
        estimated_completion?: string;
      }

      const payload: UpdatePayload = {
        progress_status: updateData.progress_status,
        progress_notes: updateData.progress_notes,
      };

      if (updateData.estimated_completion) {
        payload.estimated_completion = new Date(updateData.estimated_completion).toISOString();
      }

      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Progress berhasil diperbarui!');
        fetchBooking(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memperbarui progress');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setSaving(false);
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

  if (authLoading || !isAuthenticated || loading) {
    return (
      <TeknisiLayout>
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </TeknisiLayout>
    );
  }

  if (!booking) {
    return (
      <TeknisiLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400">Booking tidak ditemukan</p>
        </div>
      </TeknisiLayout>
    );
  }

  return (
    <TeknisiLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/teknisi/service">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-600 text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Detail Service
              </h1>
            </div>
            <p className="text-slate-400 ml-14">Update progress dan kelola service</p>
          </div>
          {booking.service_code && (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-500 font-mono"
            >
              {booking.service_code}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Service Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device & Issue */}
            <Card className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-500" />
                  Informasi Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-400 text-xs">Device</Label>
                  <p className="text-white text-lg font-semibold">{booking.device_name}</p>
                </div>
                <div>
                  <Label className="text-slate-400 text-xs">Keluhan/Masalah</Label>
                  <p className="text-white">{booking.issue}</p>
                </div>
                {booking.notes && (
                  <div>
                    <Label className="text-slate-400 text-xs">Catatan Tambahan</Label>
                    <p className="text-slate-300 text-sm">{booking.notes}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {getProgressBadge(booking.progress_status)}
                </div>
              </CardContent>
            </Card>

            {/* Update Progress Form */}
            <Card className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Update Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="progress_status" className="text-slate-300">
                    Status Progress
                  </Label>
                  <Select
                    value={updateData.progress_status}
                    onValueChange={(value) =>
                      setUpdateData({ ...updateData, progress_status: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="diagnosed">Diagnosed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress_notes" className="text-slate-300">
                    Progress Notes
                  </Label>
                  <Textarea
                    id="progress_notes"
                    value={updateData.progress_notes}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, progress_notes: e.target.value })
                    }
                    className="bg-slate-900/50 border-slate-700 text-white min-h-[120px]"
                    placeholder="Jelaskan progress terbaru atau temuan saat pengerjaan..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_completion" className="text-slate-300">
                    Estimasi Selesai
                  </Label>
                  <Input
                    id="estimated_completion"
                    type="date"
                    value={updateData.estimated_completion}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, estimated_completion: e.target.value })
                    }
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-slate-900 border-r-transparent"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Progress
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Customer Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-500" />
                  Informasi Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-400 text-xs">Nama</Label>
                  <p className="text-white font-semibold">{booking.user?.name || '-'}</p>
                </div>
                {booking.user?.phone && (
                  <div>
                    <Label className="text-slate-400 text-xs">Telepon</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-500" />
                      <a
                        href={`tel:${booking.user.phone}`}
                        className="text-white hover:text-amber-500"
                      >
                        {booking.user.phone}
                      </a>
                    </div>
                  </div>
                )}
                {booking.user?.email && (
                  <div>
                    <Label className="text-slate-400 text-xs">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-500" />
                      <a
                        href={`mailto:${booking.user.email}`}
                        className="text-white hover:text-amber-500 text-sm"
                      >
                        {booking.user.email}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline Info */}
            <Card className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-slate-400 text-xs">Tanggal Booking</Label>
                  <p className="text-white text-sm">
                    {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {booking.estimated_completion && (
                  <div>
                    <Label className="text-slate-400 text-xs">Estimasi Selesai</Label>
                    <p className="text-amber-500 text-sm font-semibold">
                      {new Date(booking.estimated_completion).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {booking.completed_at && (
                  <div>
                    <Label className="text-slate-400 text-xs">Selesai Pada</Label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-green-500 text-sm font-semibold">
                        {new Date(booking.completed_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TeknisiLayout>
  );
}
