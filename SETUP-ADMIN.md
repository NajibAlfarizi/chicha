# Setup Admin Account - Chicha Mobile

## Masalah yang Diperbaiki
Error "infinite recursion detected in policy for relation users" telah diperbaiki dengan:
1. Mengganti RLS policy dari query `users` table ke `auth.jwt()` metadata
2. Menambahkan trigger otomatis untuk sync role ke JWT metadata
3. Menambahkan role ke `user_metadata` saat registrasi

## Cara Membuat Akun Admin

### **Metode 1: Register + Update Role (RECOMMENDED)**

#### Step 1: Deploy Schema Terbaru ke Supabase
1. Buka **Supabase Dashboard** → Project Anda
2. Pergi ke **SQL Editor**
3. Copy seluruh isi file `supabase-schema.sql`
4. Paste ke SQL Editor
5. Klik **Run** untuk execute

⚠️ **PENTING**: Jika tabel sudah ada, Anda perlu:
- Drop policy lama terlebih dahulu, atau
- Drop & recreate schema (data akan hilang), atau
- Jalankan hanya bagian FUNCTIONS & TRIGGERS yang baru

#### Step 2: Register Akun Baru
1. Jalankan aplikasi: `npm run dev`
2. Buka browser: `http://localhost:3000/auth/register`
3. Isi form:
   - **Nama Lengkap**: `Admin Chicha`
   - **Email**: `admin@chicha.com`
   - **Nomor Telepon**: `081234567890`
   - **Password**: `admin123` (atau password yang Anda inginkan)
4. Klik **"Daftar"**
5. Tunggu sampai muncul pesan sukses

#### Step 3: Update Role ke Admin
1. Buka **Supabase Dashboard** → **Table Editor**
2. Pilih tabel **`users`**
3. Cari row dengan email `admin@chicha.com`
4. Klik row tersebut untuk edit
5. Ubah kolom **`role`** dari `user` menjadi `admin`
6. Klik **Save**

#### Step 4: Refresh JWT Token
**Opsi A - Re-login:**
1. Logout dari aplikasi (jika sudah login)
2. Login kembali di `http://localhost:3000/auth/login`
3. Email: `admin@chicha.com`
4. Password: `admin123`
5. Akan otomatis redirect ke `/admin/dashboard` ✅

**Opsi B - Force Refresh (via SQL):**
```sql
-- Jalankan di SQL Editor Supabase
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@chicha.com';
```

---

### **Metode 2: Manual via SQL (ALTERNATIF)**

#### Step 1: Buat User di Supabase Auth
1. Buka **Supabase Dashboard** → **Authentication** → **Users**
2. Klik **"Add User"** atau **"Invite User"**
3. Isi:
   - **Email**: `admin@chicha.com`
   - **Password**: `admin123`
   - **Auto Confirm User**: ✅ (centang/toggle ON)
   - **User Metadata**: Tambahkan JSON:
     ```json
     {
       "role": "admin",
       "name": "Admin Chicha",
       "phone": "081234567890"
     }
     ```
4. Klik **"Create User"**

#### Step 2: Insert ke Tabel Users
1. Copy **User ID** dari user yang baru dibuat
2. Buka **SQL Editor**
3. Jalankan query:

```sql
INSERT INTO users (id, name, email, phone, role, created_at)
VALUES (
  'PASTE_USER_ID_HERE',  -- Ganti dengan User ID dari auth.users
  'Admin Chicha',
  'admin@chicha.com',
  '081234567890',
  'admin',
  NOW()
);
```

#### Step 3: Login
- Buka `http://localhost:3000/auth/login`
- Email: `admin@chicha.com`
- Password: `admin123`
- Akan redirect ke `/admin/dashboard` ✅

---

## Troubleshooting

### Error: "infinite recursion detected"
✅ **Sudah diperbaiki** dengan schema baru yang menggunakan `auth.jwt()` bukan query `users` table.

### Admin tidak bisa akses dashboard
**Cek 1: Role di tabel users**
```sql
SELECT id, email, role FROM users WHERE email = 'admin@chicha.com';
-- Harusnya role = 'admin'
```

**Cek 2: Role di JWT metadata**
```sql
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'admin@chicha.com';
-- Harusnya ada key "role": "admin"
```

**Fix: Sync role ke JWT**
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@chicha.com';
```

Setelah itu **WAJIB re-login** untuk refresh JWT token.

### Policy masih error setelah update schema
**Solusi: Drop semua policy lama terlebih dahulu**
```sql
-- Drop all policies dari semua tabel
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;
```

Kemudian jalankan ulang `supabase-schema.sql` (bagian RLS policies).

---

## Verifikasi Setup

### Test 1: Login sebagai Admin
```
URL: http://localhost:3000/auth/login
Email: admin@chicha.com
Password: admin123
Expected: Redirect ke /admin/dashboard
```

### Test 2: Akses Admin Dashboard
```
URL: http://localhost:3000/admin/dashboard
Expected: Tampil dashboard dengan stats & charts
```

### Test 3: CRUD Operations
- ✅ Tambah produk
- ✅ Tambah kategori
- ✅ Update status pesanan
- ✅ Assign teknisi ke booking
- ✅ Update role user

Jika semua test berhasil, setup admin sudah benar! 🎉

---

## Catatan Penting

1. **JWT Token**: Role disimpan di `auth.jwt()` → `user_metadata` → `role`
2. **Trigger Otomatis**: Setiap update role di tabel `users` otomatis sync ke `auth.users.raw_user_meta_data`
3. **Re-login Required**: Setelah update role, user harus logout dan login ulang untuk refresh JWT
4. **RLS Policies**: Menggunakan `auth.jwt() -> 'user_metadata' ->> 'role'` untuk cek permission
5. **Security**: SECURITY DEFINER pada trigger untuk bypass RLS saat update metadata

---

## Default Admin Credentials

```
Email: admin@chicha.com
Password: admin123
Role: admin
```

⚠️ **Ganti password** setelah first login untuk keamanan!
