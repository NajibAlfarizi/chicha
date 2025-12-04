# Booking Customer Info Fix

## Masalah
Informasi pelanggan tidak tampil di halaman admin booking baik untuk user yang login maupun guest. Modal detail booking juga tidak menampilkan informasi pelanggan dengan benar.

## Penyebab
1. Tabel `bookings` tidak memiliki field untuk menyimpan customer info (nama, phone, email)
2. Form booking client mengirim customer_name dan customer_phone tapi API tidak menyimpannya
3. Admin page hanya mengandalkan relasi `user` yang null untuk guest bookings

## Solusi

### 1. Database Migration
File: `add-customer-info-to-bookings.sql`

Menambahkan 3 field baru ke tabel `bookings`:
- `customer_name` TEXT - Nama pelanggan (opsional jika user_id ada)
- `customer_phone` TEXT - No. HP pelanggan (opsional jika user_id ada)
- `customer_email` TEXT - Email pelanggan (opsional jika user_id ada)

**Cara menjalankan:**
```sql
-- Jalankan di Supabase SQL Editor atau terminal psql
psql -h <host> -U <user> -d <database> -f add-customer-info-to-bookings.sql
```

### 2. Perubahan Kode

#### a. Client Booking Form (`app/client/booking/page.tsx`)
- ✅ Menambahkan `customer_name` dan `customer_phone` ke payload API
- ✅ Update interface `BookingPayload` untuk include customer info

#### b. API Bookings (`app/api/bookings/route.ts`)
- ✅ Terima parameter `customer_name`, `customer_phone`, `customer_email`
- ✅ Simpan customer info ke database saat create booking
- ✅ Update interface `insertData` untuk include customer info fields

#### c. Admin Booking Page (`app/admin/booking/page.tsx`)
- ✅ Tampilkan customer info dengan fallback logic:
  - Prioritas 1: `booking.customer_name` (jika ada)
  - Prioritas 2: `booking.user?.name` (dari relasi)
  - Fallback: `'N/A'`
- ✅ Update table dan modal detail dengan data yang benar

#### d. TypeScript Types (`lib/types.ts`)
- ✅ Tambahkan field `customer_name?`, `customer_phone?`, `customer_email?` ke interface `Booking`

## Testing

### Test Case 1: User yang Login
1. Login sebagai user
2. Buat booking baru dengan mengisi form
3. ✅ Sistem auto-fill nama dan phone dari profile
4. ✅ Data tersimpan ke database dengan user_id DAN customer info
5. ✅ Admin dapat melihat nama dan phone di table dan modal

### Test Case 2: Guest User (Future)
1. Akses halaman booking tanpa login
2. Isi manual nama, phone, dan device info
3. ✅ Data tersimpan dengan customer info, user_id bisa NULL
4. ✅ Admin dapat melihat nama dan phone yang diisi manual

### Test Case 3: Booking Lama (Before Migration)
1. Booking yang sudah ada sebelum migration
2. ✅ Tidak punya customer_name/phone fields (NULL)
3. ✅ Admin page fallback ke `booking.user?.name` dari relasi
4. ✅ Tidak ada error, tampil data dari relasi users

## Manfaat
- ✅ Informasi pelanggan selalu tampil di admin dashboard
- ✅ Support untuk guest bookings di masa depan (tanpa login)
- ✅ Data lebih lengkap dan tidak bergantung 100% pada relasi
- ✅ Admin bisa lihat kontak pelanggan langsung di list dan detail

## Catatan Penting
- Field customer info **opsional** - jika user_id ada, sistem tetap bisa ambil dari relasi users
- Untuk backward compatibility, admin page punya fallback logic ke relasi `user`
- Migration bisa dijalankan kapan saja, tidak break existing data
