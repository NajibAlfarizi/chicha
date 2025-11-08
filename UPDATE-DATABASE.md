# 🔄 UPDATE DATABASE - Users Table

## Pembaruan yang Diperlukan

Aplikasi sekarang menggunakan fitur **Profile Management** yang memerlukan kolom tambahan di tabel `users`:

### Kolom Baru:
1. **`address`** (TEXT) - Untuk menyimpan alamat pengiriman/delivery
2. **`updated_at`** (TIMESTAMP) - Untuk tracking kapan profile terakhir diupdate

---

## 📋 Cara Update Database

### **Opsi 1: Jalankan SQL Migration (Recommended)**

1. Buka **Supabase Dashboard** → pilih project Anda
2. Klik **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Copy-paste script dari file **`update-users-table.sql`**
5. Klik **Run** atau tekan `Ctrl + Enter`
6. Verifikasi output: Harus muncul "Column successfully added"

```sql
-- Script ada di: update-users-table.sql
-- Otomatis akan:
-- ✅ Tambah kolom address
-- ✅ Tambah kolom updated_at
-- ✅ Buat trigger auto-update timestamp
-- ✅ Verifikasi struktur table
```

---

### **Opsi 2: Drop & Recreate (Jika masih development)**

⚠️ **WARNING**: Ini akan **MENGHAPUS SEMUA DATA** di database!

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Jalankan:
```sql
-- Drop semua table
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

3. Copy-paste **SELURUH ISI** file `supabase-schema.sql` (yang sudah diupdate)
4. Klik **Run**
5. Database akan dibuat ulang dengan struktur baru

---

## ✅ Verifikasi Update Berhasil

Setelah jalankan migration, verifikasi dengan query ini:

```sql
-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected Output:**
```
column_name    | data_type | is_nullable | column_default
---------------|-----------|-------------|----------------
id             | uuid      | NO          | uuid_generate_v4()
name           | text      | NO          | NULL
email          | text      | NO          | NULL
role           | text      | NO          | 'user'
phone          | text      | YES         | NULL
address        | text      | YES         | NULL  ← NEW!
created_at     | timestamp | YES         | now()
updated_at     | timestamp | YES         | now()  ← NEW!
```

---

## 🧪 Test Setelah Update

1. **Test Edit Profile:**
   ```
   - Buka http://localhost:3000/client/akun
   - Klik "Edit Profil"
   - Isi semua field termasuk address
   - Klik "Simpan"
   - Refresh → Data harus tersimpan
   ```

2. **Test Checkout Auto-fill:**
   ```
   - Add produk ke cart
   - Klik checkout
   - Form address harus terisi otomatis! ✨
   ```

3. **Test Booking Auto-fill:**
   ```
   - Buka booking page
   - Customer name & phone harus terisi otomatis! ✨
   ```

---

## 📝 Notes

- Kolom `address` dan `updated_at` bersifat **NULLABLE** (boleh kosong)
- User lama yang sudah terdaftar akan punya `address = NULL`
- User bisa update address lewat halaman profile
- Trigger `update_users_updated_at` otomatis set `updated_at` setiap kali ada UPDATE

---

## 🚨 Troubleshooting

### Error: "column does not exist"
**Solusi**: Jalankan script `update-users-table.sql` di Supabase SQL Editor

### Error: "permission denied"
**Solusi**: Pastikan Anda login sebagai owner project di Supabase

### Data hilang setelah migration
**Solusi**: Jika pakai Opsi 2 (DROP), data akan hilang. Gunakan Opsi 1 untuk preserve data.

### RLS Policy error setelah update
**Solusi**: Policies sudah di-handle di script. Jika masih error, jalankan:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Re-apply policies jika perlu
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text 
    OR (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );
```

---

## ✨ Summary

**Files yang berubah:**
- ✅ `supabase-schema.sql` - Updated dengan kolom baru
- ✅ `update-users-table.sql` - Migration script (NEW)
- ✅ `app/api/users/profile/route.ts` - API untuk update profile
- ✅ `app/client/akun/page.tsx` - UI edit profile
- ✅ `app/client/checkout/page.tsx` - Auto-fill address
- ✅ `app/client/booking/page.tsx` - Auto-fill customer info

**Jalankan migration sekali saja, lalu test aplikasi!** 🚀
