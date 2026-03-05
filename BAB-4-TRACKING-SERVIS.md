# BAB 4 - IMPLEMENTASI SISTEM

## 4.5 Implementasi Halaman Tracking Servis

### 4.5.1 Deskripsi Umum

Halaman tracking servis memungkinkan pelanggan melacak status perbaikan perangkat mereka menggunakan kode servis yang diberikan saat booking. Halaman ini dirancang untuk memberikan transparansi dan informasi real-time tentang progress perbaikan, sehingga pelanggan dapat mengetahui kapan perangkat mereka selesai diperbaiki tanpa harus menghubungi pihak toko.

### 4.5.2 Proses Pencarian dengan Kode Servis

Sistem mencari data booking berdasarkan kode servis yang diinput pelanggan dengan potongan kode berikut.

```typescript
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
```

Fungsi `handleTrack()` memvalidasi kode tidak kosong, kemudian mengirim permintaan ke server dengan kode yang diinput. Penggunaan `encodeURIComponent()` memastikan kode yang mengandung karakter khusus tetap dapat dikirim dengan aman. Sebelum melakukan pencarian, state `result` direset untuk menghindari menampilkan hasil pencarian sebelumnya. Jika booking ditemukan, data disimpan dan ditampilkan. Jika tidak ditemukan atau terjadi error, sistem menampilkan pesan error melalui toast notification.

### 4.5.3 Badge Status dengan Warna

Sistem menggunakan badge berwarna untuk menunjukkan status perbaikan secara visual dengan potongan kode berikut.

```typescript
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
```

Fungsi `statusBadge()` menampilkan status dengan warna yang berbeda: Pending (Kuning) untuk booking baru, Diagnosed (Biru) untuk sudah didiagnosa, In Progress (Ungu) untuk sedang perbaikan, Waiting Parts (Orange) untuk menunggu spare part, Completed (Hijau) untuk selesai, dan Cancelled (Merah) untuk dibatalkan. Pembedaan warna membantu pelanggan memahami status dengan cepat tanpa harus membaca teks detail.

### 4.5.4 Tampilan Hasil Tracking

Ketika booking ditemukan, sistem menampilkan informasi lengkap meliputi nama perangkat, keluhan, status progress dengan badge berwarna, kode servis, informasi pelanggan, estimasi waktu selesai, catatan progress, tanggal booking, dan informasi teknisi yang menangani jika sudah ditugaskan. Format tanggal menggunakan locale Indonesia (`toLocaleDateString('id-ID')`) untuk kemudahan pembacaan.

### 4.5.5 Kesimpulan

Implementasi halaman tracking servis mendemonstrasikan sistem transparansi layanan perbaikan yang memberikan informasi real-time kepada pelanggan. Dengan hanya menggunakan kode servis, pelanggan dapat mengakses informasi lengkap tentang status perbaikan perangkat mereka kapan saja.

Sistem badge berwarna memberikan feedback visual yang cepat dan intuitif tentang status perbaikan. Penanganan error yang graceful dan feedback jelas melalui toast notification memastikan pengalaman yang smooth meskipun terjadi masalah koneksi atau kode salah. Fitur tracking ini mengurangi beban komunikasi customer service karena pelanggan dapat mengecek status sendiri kapan saja.

---

**Lampiran:**
- **File Terkait:** `app/client/track/page.tsx`
- **API Endpoint:** `/api/bookings/track?service_code={code}`
- **Component Dependencies:** ClientLayout, Card, Input, Button, Label, Badge
- **Library External:** 
  - lucide-react (icons: User, CheckCircle, AlertCircle)
  - sonner (toast notifications)
- **Status Types:** pending, diagnosed, in_progress, waiting_parts, completed, cancelled
- **Data Format:** Locale Indonesia (id-ID) untuk format tanggal
