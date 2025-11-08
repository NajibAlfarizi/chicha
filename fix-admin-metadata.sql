-- ============================================
-- FIX ADMIN USER METADATA
-- Jalankan ini di Supabase SQL Editor untuk sync role ke JWT
-- ============================================

-- Update auth.users metadata untuk admin
-- GANTI 'admin@chicha.com' dengan email admin Anda
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@chicha.com';

-- Verifikasi - cek apakah role sudah masuk ke metadata
SELECT email, raw_user_meta_data
FROM auth.users
WHERE email = 'admin@chicha.com';
