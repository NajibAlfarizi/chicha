# ⚠️ Database Migration Required

**File:** `fix-bookings-table-schema.sql`

## Masalah
Booking service gagal dengan error:
```
Supabase insert error: violates check constraint "bookings_progress_status_check"
```

## Penyebab
Database `bookings` table belum memiliki column `progress_status` yang diperlukan oleh aplikasi. Aplikasi mencoba insert dengan `progress_status: 'pending'` tapi column belum ada di database.

## Solusi

### Step 1: Jalankan Migration di Supabase

1. **Login ke Supabase Dashboard:** https://app.supabase.com
2. **Pilih project Anda**
3. **Ke menu "SQL Editor"**
4. **Klik "New Query"**
5. **Copy-paste kode dari `fix-bookings-table-schema.sql`**
6. **Klik "Run"**

### Step 2: Verifikasi

Setelah running, Anda akan melihat output di notification:
```
✓ Teknisi table verified/created
✓ progress_status column added/verified
✓ Customer info columns added/verified
✓ Service-related columns added/verified
✓ Indexes created/verified
```

### Step 3: Test Booking

Setelah migration berhasil, coba:
1. Login sebagai customer
2. Go to `/client/booking`
3. Isi form booking
4. Klik submit

Seharusnya booking berhasil dibuat tanpa error! ✅

## Yang Ditambahkan

Migration ini menambahkan:

```sql
-- Column baru yang diperlukan
progress_status VARCHAR(50) DEFAULT 'pending'  -- Status perbaikan
customer_name TEXT                              -- Nama customer
customer_phone TEXT                             -- Phone customer
customer_email TEXT                             -- Email customer
service_code VARCHAR(50) UNIQUE                 -- Service tracking code
progress_notes TEXT                             -- Catatan dari teknisi
estimated_completion TIMESTAMP                  -- Estimasi selesai
completed_at TIMESTAMP                          -- Waktu selesai

-- Reference ke teknisi table
teknisi_id UUID REFERENCES teknisi(id)         -- Reference teknisi yang ditugaskan

-- Teknisi table juga dibuat jika belum ada
```

## Troubleshooting

### Jika masih error:
1. Check di Supabase → "Tables" → "bookings"
2. Pastikan ada column:
   - ✅ `progress_status`
   - ✅ `customer_name`
   - ✅ `customer_phone`
   - ✅ `customer_email`
   - ✅ `teknisi_id`

3. Jika masih belum ada, jalankan migration lagi

### Jika error constraint:
- Buka Supabase → "Tables" → "bookings" → "Policies"
- Pastikan tidak ada RLS policy yang blocking insert
- Jika perlu, temp disable RLS untuk testing

## Next Steps Setelah Migration

Setelah migration berhasil, sistem sudah siap:
- ✅ Customer bisa booking tanpa pilih teknisi
- ✅ Admin dapat notifikasi booking baru
- ✅ Admin bisa assign teknisi ke booking
- ✅ Teknisi dapat notifikasi assignment
- ✅ Customer dapat notifikasi teknisi assignment
