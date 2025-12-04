-- Fix Target User ID
-- Update target records to match current user

-- Step 1: Cek user yang ada dengan email najibalfarizi25@gmail.com
SELECT id, email, name FROM users WHERE email = 'najibalfarizi25@gmail.com';

-- Step 2: Cek target yang ada
SELECT * FROM targets WHERE user_id IN (
  SELECT id FROM users WHERE email = 'najibalfarizi25@gmail.com'
);

-- Step 3: Update user_id di targets untuk match dengan user yang aktif
-- GANTI 'USER_ID_BARU' dengan id dari Step 1
-- GANTI 'USER_ID_LAMA' dengan user_id yang ada di targets (dari admin)

-- UPDATE targets 
-- SET user_id = 'aca52189-3ddf-4549-a7b0-ba2c76706120'
-- WHERE user_id = 'USER_ID_LAMA' 
-- AND user_id IN (
--   SELECT id FROM users WHERE email LIKE '%najib%' OR email LIKE '%alfarizi%'
-- );

-- Alternative: Update berdasarkan email match
UPDATE targets 
SET user_id = (
  SELECT id FROM users 
  WHERE email = 'najibalfarizi25@gmail.com' 
  LIMIT 1
)
WHERE id IN (
  SELECT t.id FROM targets t
  INNER JOIN users u ON t.user_id = u.id
  WHERE u.email = 'najibalfarizi25@gmail.com'
  OR u.name ILIKE '%najib%alfarizi%'
);
