# BAB 4 - IMPLEMENTASI SISTEM

## 4.6 Implementasi Halaman Booking Service

### 4.6.1 Deskripsi Umum

Halaman booking service memungkinkan pelanggan membuat jadwal perbaikan handphone secara online. Sistem ini dirancang untuk mempermudah pelanggan dalam mengajukan perbaikan tanpa harus datang langsung ke toko, sekaligus memberikan fleksibilitas dalam memilih teknisi atau membiarkan sistem menugaskan teknisi secara otomatis berdasarkan ketersediaan.

### 4.6.2 Auto-Fill Data Pelanggan

Sistem secara otomatis mengisi informasi pelanggan dari profile user yang sedang login dengan potongan kode berikut.

```typescript
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

  fetchProfile();
}, [isAuthenticated, authLoading, router]);
```

Sistem memvalidasi autentikasi terlebih dahulu sebelum mengakses halaman. Jika user belum login, sistem akan redirect ke halaman login dengan parameter `redirect=/client/booking` agar setelah login user langsung kembali ke halaman booking. Setelah autentikasi valid, sistem mengambil data profile user dari API `/api/users/profile` dan otomatis mengisi field nama dan nomor telepon. Ini mengurangi waktu pengisian form dan meminimalkan kesalahan input data pelanggan.

### 4.6.3 Loading Daftar Teknisi Aktif

Sistem memuat daftar teknisi yang aktif untuk memberikan opsi pemilihan teknisi kepada pelanggan dengan potongan kode berikut.

```typescript
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
```

Fungsi `fetchTeknisi()` memanggil API dengan parameter `status=active` untuk memastikan hanya teknisi yang aktif dan tersedia yang ditampilkan. Data teknisi disimpan dalam state `teknisiList` dan ditampilkan dalam dropdown Select component. Jika terjadi error saat fetching, sistem hanya mencatat log error tanpa menghentikan proses karena pemilihan teknisi bersifat opsional.

### 4.6.4 Proses Submit Booking

Sistem memproses pengiriman data booking dengan validasi dan penanganan error yang komprehensif dengan potongan kode berikut.

```typescript
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

    if (response.ok) {
      toast.success('Booking berhasil!', {
        description: 'Kami akan segera menghubungi Anda untuk konfirmasi.',
      });
      router.push('/client/akun?tab=bookings');
    } else {
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
```

Fungsi `handleSubmit()` memvalidasi session user terlebih dahulu, kemudian menyiapkan payload dengan konversi `booking_date` ke format ISO. Field `teknisi_id` hanya disertakan jika pelanggan memilih teknisi secara eksplisit (bukan 'auto'), sehingga jika tidak dipilih, sistem akan menugaskan teknisi secara otomatis di backend. Setelah berhasil, user diarahkan ke halaman akun dengan tab bookings untuk melihat booking yang baru dibuat. Penanganan error memberikan feedback yang jelas kepada user melalui toast notification.

### 4.6.5 Validasi Tanggal Minimal

Sistem mencegah pelanggan memilih tanggal booking di masa lalu dengan potongan kode berikut.

```typescript
// Get minimum date (today)
const today = new Date().toISOString().split('T')[0];

// In the form:
<Input
  id="booking_date"
  type="date"
  value={bookingData.booking_date}
  onChange={(e) => setBookingData({...bookingData, booking_date: e.target.value})}
  min={today}
  required
/>
```

Konstanta `today` mengambil tanggal hari ini dalam format `YYYY-MM-DD` menggunakan metode `toISOString().split('T')[0]`. Nilai ini digunakan sebagai atribut `min` pada input date, sehingga user tidak dapat memilih tanggal sebelum hari ini. Validasi ini dilakukan di sisi client untuk memberikan feedback langsung, dan juga akan divalidasi ulang di backend untuk memastikan data yang valid.

### 4.6.6 Kesimpulan

Implementasi halaman booking service mendemonstrasikan sistem reservasi yang user-friendly dengan auto-fill data pelanggan, validasi real-time, dan fleksibilitas pemilihan teknisi. Integrasi dengan authentication context memastikan hanya user yang terautentikasi yang dapat membuat booking, sekaligus mempermudah pengisian form dengan data profile yang sudah ada.

Sistem memberikan kontrol penuh kepada pelanggan untuk memilih teknisi spesifik atau membiarkan sistem menugaskan secara otomatis berdasarkan ketersediaan. Validasi tanggal mencegah booking untuk tanggal masa lalu, dan penanganan error yang comprehensive memberikan feedback jelas di setiap tahap proses. Setelah booking berhasil, pelanggan langsung diarahkan ke halaman riwayat booking untuk melihat detail dan status pesanan mereka.

---

**Lampiran:**
- **File Terkait:** `app/client/booking/page.tsx`
- **API Endpoints:** 
  - `/api/users/profile` (GET) - Mengambil data profile user
  - `/api/teknisi?status=active` (GET) - Mengambil daftar teknisi aktif
  - `/api/bookings` (POST) - Membuat booking baru
- **Component Dependencies:** ClientLayout, Card, Input, Label, Textarea, Select, Button
- **Library External:** 
  - lucide-react (icons: Wrench, Calendar, CheckCircle)
  - sonner (toast notifications)
  - next/navigation (routing)
- **Auth Context:** useAuth hook untuk autentikasi dan data user
- **Redirect Flow:** `/auth/login?redirect=/client/booking` → `/client/akun?tab=bookings`
- **Form Fields:** device_name, issue, booking_date, customer_name, customer_phone, teknisi_id (optional)
