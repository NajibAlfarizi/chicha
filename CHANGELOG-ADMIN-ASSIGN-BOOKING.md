# Changelog: Admin Assignment Booking Service System
**Tanggal:** 5 Maret 2026

## 📝 Ringkasan Perubahan

Sistem booking service telah diubah sehingga pelanggan tidak lagi dapat memilih teknisi saat melakukan booking. Admin akan menugaskan teknisi ke service yang di-booking oleh pelanggan, dan kedua pihak (teknisi dan pelanggan) akan menerima notifikasi.

---

## 🔄 Perubahan yang Dilakukan

### 1. **Database Schema**
- **File:** `update-notifications-for-bookings.sql`
- **Perubahan:**
  - Menambahkan kolom `booking_id` ke tabel `notifications`
  - Menambahkan foreign key constraint ke tabel `bookings`
  - Menambahkan index untuk performa query

### 2. **Form Booking Service (Client)**
- **File:** `app/client/booking/page.tsx`
- **Perubahan:**
  - ❌ Menghapus state `teknisiList` 
  - ❌ Menghapus field `teknisi_id` dari `bookingData`
  - ❌ Menghapus fungsi `fetchTeknisi()`
  - ❌ Menghapus dropdown "Pilih Teknisi" dari form
  - ✅ Update informasi penting untuk memberi tahu pelanggan bahwa admin akan menugaskan teknisi
  - ✅ Pelanggan hanya mengisi informasi device dan keluhan

**UI Changes:**
```tsx
// SEBELUM:
- Pilihan teknisi (dropdown)
- Info: "Anda dapat memilih teknisi spesifik atau biarkan kosong untuk assignment otomatis"

// SESUDAH:
- Tidak ada pilihan teknisi
- Info: "Admin kami akan menugaskan teknisi terbaik untuk Anda"
- Info: "Anda akan menerima notifikasi saat teknisi ditugaskan"
```

### 3. **API Booking Service**
- **File:** `app/api/bookings/route.ts`
- **Perubahan:**
  - ❌ Menghapus parameter `teknisi_id` dari request body
  - ❌ Menghapus logic untuk assign teknisi saat booking dibuat
  - ✅ Booking dibuat dengan status 'baru' dan `teknisi_id` = NULL
  - ✅ Admin akan assign teknisi nanti

### 4. **API Assign Teknisi (BARU)**
- **File:** `app/api/bookings/[id]/route.ts`
- **Endpoint:** `PATCH /api/bookings/{id}`
- **Method:** PATCH (ditambahkan ke route yang sudah ada)
- **Fungsi:**
  - Assign teknisi ke booking yang sudah ada
  - Mengirim notifikasi ke teknisi yang ditugaskan
  - Mengirim notifikasi ke pelanggan

**Request Body:**
```json
{
  "teknisi_id": "uuid-teknisi"
}
```

**Response:**
```json
{
  "message": "Teknisi assigned successfully",
  "booking": { ... },
  "notifications": {
    "teknisi": true,
    "customer": true
  }
}
```

**Notifikasi yang dikirim:**
1. **Ke Teknisi:**
   - Title: "Service Baru Ditugaskan"
   - Message: "Anda telah ditugaskan untuk service {device_name}. Keluhan: {issue}. Kode Service: {service_code}"

2. **Ke Pelanggan:**
   - Title: "Teknisi Ditugaskan"
   - Message: "Teknisi {teknisi_name} telah ditugaskan untuk service {device_name} Anda. Teknisi akan segera menghubungi Anda."

### 5. **Admin Interface**
- **File:** `app/admin/booking/page.tsx`
- **Perubahan:**
  - ✅ Menambahkan state untuk manage assign teknisi
  - ✅ Menambahkan fungsi `fetchTeknisi()` untuk load daftar teknisi
  - ✅ Menambahkan fungsi `handleAssignTeknisi()` untuk assign teknisi
  - ✅ Menambahkan tombol "Assign" di setiap booking yang belum ada teknisi
  - ✅ Menambahkan dialog untuk pilih teknisi
  - ✅ Menampilkan informasi bahwa notifikasi akan dikirim ke teknisi dan pelanggan

**UI Changes:**
```tsx
// Tombol di tabel booking:
{!booking.teknisi && (
  <Button onClick={() => openAssignDialog(booking.id)}>
    <UserPlus /> Assign
  </Button>
)}

// Dialog assign teknisi dengan:
- Dropdown pilih teknisi
- Info notifikasi
- Tombol Assign
```

---

## 📊 Flow Baru Sistem

### Sebelum:
```
1. Pelanggan booking service
2. Pelanggan memilih teknisi (opsional)
3. Booking dibuat dengan/tanpa teknisi
4. Jika ada teknisi, langsung ditugaskan
```

### Sesudah:
```
1. Pelanggan booking service
2. Pelanggan TIDAK bisa pilih teknisi
3. Booking dibuat tanpa teknisi (teknisi_id = NULL)
4. Admin login ke dashboard
5. Admin melihat daftar booking yang belum ditugaskan
6. Admin klik tombol "Assign" pada booking
7. Admin memilih teknisi dari dropdown
8. System mengirim notifikasi ke:
   - Teknisi yang ditugaskan
   - Pelanggan yang booking
9. Booking diperbarui dengan teknisi_id
```

---

## 🔔 Sistem Notifikasi

### Tabel Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID,           -- untuk order notifications
  booking_id UUID,         -- untuk booking notifications (BARU)
  title TEXT,
  message TEXT,
  type TEXT,               -- 'booking_assignment', 'order_status', dll
  is_read BOOLEAN,
  created_at TIMESTAMP
);
```

### Jenis Notifikasi Booking:
- `booking_assignment` - Saat teknisi ditugaskan
- `booking_status` - Saat status booking berubah (existing)

---

## 🧪 Testing Checklist

### Database Migration & Sync
- [ ] Jalankan `update-notifications-for-bookings.sql` di Supabase
- [ ] Verifikasi kolom `booking_id` ada di tabel notifications
- [ ] Verifikasi index dibuat
- [ ] **PENTING:** Jalankan `ensure-teknisi-sync.sql` untuk sync teknisi ke users table
- [ ] Verifikasi semua teknisi memiliki user account dengan role 'teknisi'

### Client (Pelanggan)
- [ ] Form booking tidak menampilkan pilihan teknisi
- [ ] Booking berhasil dibuat tanpa teknisi
- [ ] Informasi "Admin akan menugaskan teknisi" muncul
- [ ] Redirect ke halaman akun setelah booking

### Admin Dashboard
- [ ] Daftar booking muncul dengan benar
- [ ] Tombol "Assign" hanya muncul jika booking belum ada teknisi
- [ ] Dialog assign teknisi muncul dengan daftar teknisi aktif
- [ ] Assign teknisi berhasil
- [ ] Toast notification muncul setelah assign
- [ ] Tabel di-refresh otomatis setelah assign

### Notifikasi
- [ ] Notifikasi terkirim ke teknisi setelah di-assign
- [ ] Notifikasi terkirim ke pelanggan setelah teknisi di-assign
- [ ] Isi notifikasi sesuai (nama teknisi, device, keluhan)
- [ ] Badge notifikasi muncul di NotificationBell (client)
- [ ] Badge notifikasi muncul di NotificationBell (teknisi panel)
- [ ] Teknisi dapat melihat notifikasi di panel mereka
- [ ] Klik notifikasi mengarah ke halaman yang benar

### API Endpoints
- [ ] `POST /api/bookings` - tidak menerima teknisi_id lagi
- [ ] `PATCH /api/bookings/{id}` - assign teknisi berhasil dengan notifikasi
- [ ] Response error handling berfungsi dengan baik

---

## 📱 Screenshot / Preview

### Form Booking (Client)
- Tidak ada dropdown teknisi
- Info box menjelaskan bahwa admin akan assign teknisi

### Admin Dashboard
- Tombol "Assign" di setiap booking tanpa teknisi
- Dialog pilih teknisi dengan info notifikasi

### Notifikasi
- Teknisi menerima: "Service Baru Ditugaskan"
- Pelanggan menerima: "Teknisi {nama} Ditugaskan"

---

## 🔐 Security Considerations

1. **Authorization:**
   - Hanya admin yang bisa assign teknisi
   - Endpoint `/api/bookings/[id]/assign-teknisi` harus di-protect dengan auth middleware

2. **Validation:**
   - Validasi teknisi_id exists di database
   - Validasi booking_id exists di database
   - Validasi teknisi status = 'active'

3. **RLS Policies:**
   - Notifications RLS sudah ada (users can view own notifications)
   - Booking RLS perlu di-review untuk memastikan admin bisa update

---

## 📝 Notes

- Migration SQL harus dijalankan **SEBELUM** deployment
- Pastikan ada teknisi aktif di database sebelum testing
- Admin perlu training untuk proses assign teknisi baru
- Consider menambahkan auto-assignment feature di future (assign otomatis ke teknisi dengan beban kerja paling sedikit)

---

## 🚀 Deployment Steps

1. Backup database
2. Jalankan `update-notifications-for-bookings.sql`
3. **PENTING:** Jalankan `ensure-teknisi-sync.sql` untuk memastikan semua teknisi ada di users table
4. Verifikasi migration berhasil
5. Deploy aplikasi dengan perubahan code
6. Test di production:
   - Pelanggan buat booking baru
   - Admin assign teknisi
   - Cek notifikasi diterima (teknisi DAN pelanggan)
7. Monitor error logs

---

## ⚠️ Important Notes

### Teknisi & Users Table Sync
Notifikasi ke teknisi hanya akan terkirim jika teknisi memiliki user account di tabel `users` dengan role `'teknisi'`. 

**Cara kerja sync:**
- Tabel `teknisi` menyimpan data teknisi (id, name, username, email, dll)
- Tabel `users` menyimpan akun untuk login dan notifikasi
- Setiap teknisi perlu di-sync ke `users` dengan:
  - email: `teknisi.email` atau `teknisi.username@teknisi.local`
  - role: `'teknisi'`

**Jika teknisi tidak ada di users table:**
- Assign teknisi tetap berhasil
- Notifikasi ke pelanggan tetap terkirim
- Notifikasi ke teknisi **tidak** terkirim (warning di log)
- Log akan menampilkan: `⚠️ Teknisi user not found in users table, skipping notification`

**Solusi:**
Jalankan `ensure-teknisi-sync.sql` secara periodik atau setiap kali ada teknisi baru ditambahkan.

---

## 📞 Support

Jika ada masalah dengan sistem booking baru:
1. Cek logs di Supabase
2. Cek error di browser console
3. Verifikasi notifications table structure
4. Pastikan teknisi ada dan aktif

---

**Terakhir diupdate:** 5 Maret 2026
**Status:** ✅ Siap untuk testing
