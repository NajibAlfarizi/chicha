# Bug Fixes - Januari 2026

## Perbaikan yang Dilakukan

### 1. ✅ Halaman Admin User Tidak Menampilkan Daftar User

**Masalah:**
- Halaman `/admin/user` tidak menampilkan daftar user
- API tidak bisa mengakses data users karena Row Level Security (RLS) policies

**Solusi:**
- Mengubah `/api/users/route.ts` untuk menggunakan `supabaseAdmin` (service role key) yang bypass RLS
- Menambahkan error logging yang lebih detail

**File yang diubah:**
- `app/api/users/route.ts`

### 2. ✅ Notifikasi Tidak Realtime

**Masalah:**
- Notifikasi hanya update setiap 30 detik (polling)
- User harus refresh atau tunggu lama untuk melihat notifikasi baru

**Solusi:**
- Implementasi Supabase Realtime Subscription
- Notifikasi sekarang langsung muncul saat ada data baru di database
- Menghapus polling interval untuk mengurangi beban server

**File yang diubah:**
- `lib/useNotifications.ts`

### 3. ✅ Environment Variable Configuration

**File baru:**
- `.env.example` - Template untuk environment variables

## Cara Setup

### 1. Setup Environment Variables

Buat file `.env.local` di root project dengan isi:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_IS_PRODUCTION=false
```

**Cara mendapatkan Supabase Service Role Key:**
1. Buka dashboard Supabase project Anda
2. Pergi ke **Settings** → **API**
3. Copy **service_role** key (⚠️ Jangan share key ini ke public!)
4. Paste ke `.env.local` sebagai `SUPABASE_SERVICE_ROLE_KEY`

### 2. Restart Development Server

Setelah menambahkan environment variable:

```bash
# Stop server (Ctrl+C)
# Kemudian start ulang
npm run dev
```

## Testing

### Test Daftar User Admin:
1. Login sebagai admin
2. Buka halaman **User** di menu admin
3. Seharusnya muncul daftar semua user dengan role badge (Admin/Teknisi/User)
4. Bisa filter berdasarkan role
5. Bisa lihat detail user
6. Bisa ubah role user

### Test Notifikasi Realtime:
1. Login sebagai user/client
2. Buka 2 browser/window berbeda:
   - Window 1: Login sebagai admin
   - Window 2: Login sebagai client
3. Di window admin, update status pesanan client
4. Di window client, notifikasi harus langsung muncul **tanpa refresh**
5. Badge notifikasi (angka merah) harus update otomatis

## Technical Details

### Supabase Realtime Subscription

```typescript
// Setup channel untuk listen perubahan di table notifications
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    () => {
      fetchNotifications(); // Refresh data saat ada perubahan
    }
  )
  .subscribe();
```

### RLS Bypass dengan Service Role

```typescript
// supabaseAdmin menggunakan service_role key
// yang bypass semua RLS policies
const { data, error } = await supabaseAdmin
  .from('users')
  .select('*');
```

## Catatan Keamanan

⚠️ **PENTING:**
- `SUPABASE_SERVICE_ROLE_KEY` adalah **server-side only**
- **JANGAN** expose key ini di client-side code
- **JANGAN** commit `.env.local` ke Git
- Gunakan hanya di API routes (server-side)

## Troubleshooting

### Jika masih tidak muncul daftar user:
1. Check console browser untuk error
2. Pastikan `.env.local` sudah benar
3. Restart development server
4. Check Supabase dashboard apakah ada RLS policies yang block

### Jika notifikasi tidak realtime:
1. Check console browser untuk error subscription
2. Pastikan Supabase Realtime sudah enabled di dashboard
3. Check di Supabase Dashboard → Database → Replication
4. Pastikan table `notifications` sudah di-enable untuk realtime

## Tanggal Update
- **4 Januari 2026** - Initial bug fixes
