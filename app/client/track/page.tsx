'use client';

import { useState } from 'react';
import ClientLayout from '@/components/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { Booking } from '@/lib/types';

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Booking | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code) {
      toast.error('Masukkan kode service');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const res = await fetch(`/api/bookings/track?service_code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Booking tidak ditemukan');
        setResult(null);
        return;
      }

      setResult(data.booking);
    } catch (err) {
      console.error('Track error:', err);
      toast.error('Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500">Pending</Badge>;
      case 'diagnosed':
        return <Badge className="bg-blue-500/20 text-blue-500">Diagnosed</Badge>;
      case 'in_progress':
        return <Badge className="bg-purple-500/20 text-purple-500">In Progress</Badge>;
      case 'waiting_parts':
        return <Badge className="bg-orange-500/20 text-orange-500">Waiting Parts</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-500">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-500">Track Service</h1>
            <p className="text-muted-foreground">Masukkan kode service Anda untuk melihat status perbaikan</p>
          </div>

          <Card className="border-amber-500/20 shadow-sm">
            <CardHeader>
              <CardTitle>Cari dengan Kode Service</CardTitle>
              <CardDescription>Contoh: SRV-20251105-A3F9</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <Label htmlFor="service_code">Kode Service</Label>
                  <Input
                    id="service_code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Masukkan kode service"
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => handleTrack()} className="bg-amber-500 hover:bg-amber-600 text-white">{loading ? 'Mencari...' : 'Lacak'}</Button>
                  <Button variant="outline" onClick={() => { setCode(''); setResult(null); }}>Reset</Button>
                </div>

                {result ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{result.device_name}</h3>
                        <p className="text-sm">{result.issue}</p>
                      </div>
                      <div className="text-right">
                        <div className="mb-1">{statusBadge(result.progress_status)}</div>
                        <div className="text-xs text-muted-foreground">{result.service_code}</div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg border">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                        <div>
                          <div className="font-semibold">{result.user?.name || '-'}</div>
                          <div className="text-muted-foreground text-xs">{result.user?.phone || result.user?.email || ''}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <div className="mb-1"><strong>Estimasi selesai:</strong> {result.estimated_completion ? new Date(result.estimated_completion).toLocaleDateString('id-ID') : '-'}</div>
                        <div className="mb-1"><strong>Progress notes:</strong> {result.progress_notes || '-'}</div>
                        <div className="mb-1"><strong>Tanggal booking:</strong> {new Date(result.booking_date).toLocaleDateString('id-ID')}</div>
                        {result.teknisi && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                            <div>
                              <div className="font-semibold">{result.teknisi.name}</div>
                              <div className="text-muted-foreground text-xs">{result.teknisi.phone || ''} {result.teknisi.specialization ? `• ${result.teknisi.specialization}` : ''}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    <div>Masukkan kode service untuk mulai tracking.</div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
