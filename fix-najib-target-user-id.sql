-- Fix Target User ID untuk Najib Alfarizi
-- Jalankan script ini di Supabase SQL Editor

-- Step 1: Cek user_id yang benar
SELECT id, email, name FROM users WHERE email = 'najibalfarizi25@gmail.com';

-- Step 2: Update target ke user_id yang benar (aca52189-3ddf-4549-a7b0-ba2c76706120)
UPDATE targets 
SET user_id = 'aca52189-3ddf-4549-a7b0-ba2c76706120',
    updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email LIKE '%najib%' OR name LIKE '%Najib%'
)
AND user_id != 'aca52189-3ddf-4549-a7b0-ba2c76706120';

-- Step 3: Verifikasi hasil
SELECT 
  t.id,
  t.user_id,
  u.email,
  u.name,
  t.target_amount,
  t.current_amount,
  t.reward,
  t.status
FROM targets t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'najibalfarizi25@gmail.com';
