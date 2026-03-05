-- Migration: Simplifikasi Status Perbaikan Service Booking
-- Tanggal: 4 Maret 2026
-- Deskripsi: Menyederhanakan status progress_status dari 6 status menjadi 4 status yang lebih mudah dipahami

-- STATUS LAMA (kompleks):
-- 'pending' | 'diagnosed' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled'

-- STATUS BARU (sederhana):
-- 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan'

-- MAPPING:
-- 'pending' → 'menunggu' (HP baru diantar, menunggu keputusan)
-- 'diagnosed' → 'diproses' (HP sudah diperiksa dan diterima untuk diperbaiki)
-- 'in_progress' → 'diproses' (Sedang dalam proses perbaikan)
-- 'waiting_parts' → 'diproses' (Menunggu spare part, tetap status diproses)
-- 'completed' → 'selesai' (Perbaikan selesai)
-- 'cancelled' → 'dibatalkan' (Tidak jadi diperbaiki)

BEGIN;

-- 1. Drop constraint lama (jika ada)
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_progress_status_check;

-- 2. Update existing data ke status baru
UPDATE bookings 
SET progress_status = CASE 
  WHEN progress_status = 'pending' THEN 'menunggu'
  WHEN progress_status IN ('diagnosed', 'in_progress', 'waiting_parts') THEN 'diproses'
  WHEN progress_status = 'completed' THEN 'selesai'
  WHEN progress_status = 'cancelled' THEN 'dibatalkan'
  ELSE 'menunggu' -- default fallback
END
WHERE progress_status IN ('pending', 'diagnosed', 'in_progress', 'waiting_parts', 'completed', 'cancelled');

-- 3. Tambah constraint baru dengan nilai status baru
ALTER TABLE bookings
ADD CONSTRAINT bookings_progress_status_check 
CHECK (progress_status IN ('menunggu', 'diproses', 'selesai', 'dibatalkan'));

-- 4. Verifikasi update (optional - uncomment untuk cek)
-- SELECT progress_status, COUNT(*) as jumlah 
-- FROM bookings 
-- GROUP BY progress_status;

COMMIT;

-- NOTES:
-- 1. Jalankan script ini di Supabase SQL Editor
-- 2. Script ini menggunakan transaction untuk keamanan
-- 3. Script akan:
--    a. Drop constraint lama
--    b. Update semua data existing ke status baru
--    c. Tambah constraint baru dengan nilai status baru
-- 4. Status 'diagnosed', 'in_progress', dan 'waiting_parts' digabung menjadi 'diproses'
-- 5. Tidak ada data yang akan hilang
-- 6. Bisa rollback dengan ROLLBACK; jika ada error sebelum COMMIT

-- ROLLBACK SCRIPT (jika diperlukan):
-- Jika ingin kembalikan ke status lama, gunakan:
/*
BEGIN;

-- Drop constraint baru
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_progress_status_check;

-- Restore data ke status lama
UPDATE bookings 
SET progress_status = CASE 
  WHEN progress_status = 'menunggu' THEN 'pending'
  WHEN progress_status = 'diproses' THEN 'in_progress'
  WHEN progress_status = 'selesai' THEN 'completed'
  WHEN progress_status = 'dibatalkan' THEN 'cancelled'
  ELSE 'pending'
END
WHERE progress_status IN ('menunggu', 'diproses', 'selesai', 'dibatalkan');

-- Tambah constraint lama
ALTER TABLE bookings
ADD CONSTRAINT bookings_progress_status_check 
CHECK (progress_status IN ('pending', 'diagnosed', 'in_progress', 'waiting_parts', 'completed', 'cancelled'));

COMMIT;
*/

-- TESTING:
-- Setelah migration, test dengan:
-- 1. Buat booking baru (harus status 'menunggu')
-- 2. Update ke 'diproses' dari halaman teknisi
-- 3. Update ke 'selesai'
-- 4. Cek di halaman client tracking apakah badge warna sesuai
-- 5. Cek notifikasi apakah message sudah update
