'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { Teknisi } from '@/lib/types';

export default function BookingPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([]);
  const [bookingData, setBookingData] = useState({
    device_name: '',
    issue: '',
    booking_date: '',
    customer_name: '',
    customer_phone: '',
    teknisi_id: '',
  });

  useEffect(() => {
    // Check authentication first
    if (!authLoading && !isAuthenticated) {
      toast.error('Login diperlukan', {
        description: 'Silakan login untuk booking service',
      });
      router.push('/auth/login?redirect=/client/booking');
      return;
    }

    if (!isAuthenticated) return;

    // Auto-fill from user profile
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setBookingData(prev => ({
            ...prev,
            customer_name: data.profile.name || '',
            customer_phone: data.profile.phone || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    // Fetch active teknisi list
    const fetchTeknisi = async () => {
      try {
        const response = await fetch('/api/teknisi?status=active');
        if (response.ok) {
          const data = await response.json();
          console.log('Teknisi list fetched:', data.teknisi);
          setTeknisiList(data.teknisi || []);
        } else {
          console.error('Failed to fetch teknisi:', response.status);
        }
      } catch (error) {
        console.error('Error fetching teknisi:', error);
      }
    };

    fetchProfile();
    fetchTeknisi();
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user ID from auth context
      if (!user?.id) {
        toast.error('Session tidak valid', {
          description: 'Silakan login ulang.',
        });
        router.push('/auth/login');
        return;
      }

      interface BookingPayload {
        user_id: string;
        device_name: string;
        issue: string;
        booking_date: string;
        customer_name: string;
        customer_phone: string;
        teknisi_id?: string;
      }

      const payload: BookingPayload = {
        user_id: user.id,
        device_name: bookingData.device_name,
        issue: bookingData.issue,
        booking_date: new Date(bookingData.booking_date).toISOString(),
        customer_name: bookingData.customer_name,
        customer_phone: bookingData.customer_phone,
      };

      // Include teknisi_id only if explicitly selected (not empty or 'auto')
      if (bookingData.teknisi_id && bookingData.teknisi_id !== '' && bookingData.teknisi_id !== 'auto') {
        payload.teknisi_id = bookingData.teknisi_id;
      }

      console.log('Sending booking payload:', payload);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        toast.success('Booking berhasil!', {
          description: 'Kami akan segera menghubungi Anda untuk konfirmasi.',
        });
        router.push('/client/akun?tab=bookings');
      } else {
        console.error('Booking error:', data);
        toast.error('Booking gagal', {
          description: data.error || 'Silakan coba lagi atau hubungi customer service.',
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Terjadi kesalahan', {
        description: 'Periksa koneksi internet Anda dan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
              <Wrench className="h-6 w-6 md:h-8 md:w-8 text-amber-600 dark:text-amber-500" />
              Booking Service
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">Perbaikan handphone cepat dan profesional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card className="border-amber-500/20 hover:shadow-lg transition-all text-center">
              <CardContent className="p-4 md:pt-6">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Wrench className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="font-semibold mb-1 text-sm md:text-base">Teknisi Berpengalaman</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Tim teknisi handal dan profesional</p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 hover:shadow-lg transition-all text-center">
              <CardContent className="p-4 md:pt-6">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="font-semibold mb-1 text-sm md:text-base">Tracking Realtime</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Pantau progress perbaikan secara langsung</p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 hover:shadow-lg transition-all text-center">
              <CardContent className="p-4 md:pt-6">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="font-semibold mb-1 text-sm md:text-base">Garansi Service</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Garansi untuk setiap perbaikan</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <Card className="border-amber-500/20 shadow-sm">
            <CardHeader>
              <CardTitle>Form Booking Service</CardTitle>
              <CardDescription>
                Lengkapi formulir di bawah ini untuk membuat booking service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Informasi Pelanggan
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">
                      Nama Lengkap <span className="text-red-600 dark:text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_name"
                      value={bookingData.customer_name}
                      onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">
                      Nomor HP/WhatsApp <span className="text-red-600 dark:text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_phone"
                      value={bookingData.customer_phone}
                      onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Informasi Device
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="device_name">
                      Nama/Tipe Handphone <span className="text-red-600 dark:text-red-500">*</span>
                    </Label>
                    <Input
                      id="device_name"
                      value={bookingData.device_name}
                      onChange={(e) => setBookingData({...bookingData, device_name: e.target.value})}
                      placeholder="Contoh: iPhone 13 Pro Max / Samsung Galaxy S23"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue">
                      Keluhan/Kerusakan <span className="text-red-600 dark:text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="issue"
                      value={bookingData.issue}
                      onChange={(e) => setBookingData({...bookingData, issue: e.target.value})}
                      placeholder="Jelaskan detail kerusakan atau masalah pada handphone Anda..."
                      rows={5}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Jelaskan sedetail mungkin agar teknisi kami dapat mempersiapkan dengan baik
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking_date">
                      Tanggal Service <span className="text-red-600 dark:text-red-500">*</span>
                    </Label>
                    <Input
                      id="booking_date"
                      type="date"
                      value={bookingData.booking_date}
                      onChange={(e) => setBookingData({...bookingData, booking_date: e.target.value})}
                      min={today}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teknisi_id">
                      Pilih Teknisi <span className="text-muted-foreground">(Opsional)</span>
                    </Label>
                    <Select
                      value={bookingData.teknisi_id || 'auto'}
                      onValueChange={(value) => setBookingData({...bookingData, teknisi_id: value === 'auto' ? '' : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih teknisi (opsional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Tidak ada preferensi (Otomatis)</SelectItem>
                        {teknisiList.map((teknisi) => (
                          <SelectItem key={teknisi.id} value={teknisi.id}>
                            {teknisi.name} {teknisi.specialization ? `- ${teknisi.specialization}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Anda dapat memilih teknisi spesifik atau biarkan kosong untuk assignment otomatis
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 md:p-4">
                  <h4 className="text-amber-600 dark:text-amber-500 font-semibold mb-2 text-sm md:text-base">ℹ️ Informasi Penting</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Tim kami akan menghubungi Anda untuk konfirmasi jadwal</li>
                    <li>• Anda akan mendapat update progress perbaikan secara realtime</li>
                    <li>• Estimasi waktu perbaikan: 1-3 hari kerja (tergantung kerusakan)</li>
                    <li>• Garansi service diberikan untuk setiap perbaikan</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    {loading ? (
                      'Memproses...'
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Buat Booking
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
