-- Sinkronisasi data teknisi yang sudah ada ke table users
-- Script ini akan menambahkan teknisi yang belum ada di table users

-- Insert teknisi ke users table (jika belum ada)
INSERT INTO users (name, email, role, phone, address)
SELECT 
  t.name,
  COALESCE(t.email, t.username || '@teknisi.local') as email,
  'teknisi' as role,
  t.phone,
  t.specialization as address
FROM teknisi t
WHERE NOT EXISTS (
  SELECT 1 FROM users u 
  WHERE u.email = COALESCE(t.email, t.username || '@teknisi.local')
  AND u.role = 'teknisi'
);

-- Verifikasi hasil
SELECT 'Total teknisi di table teknisi:' as description, COUNT(*) as count FROM teknisi
UNION ALL
SELECT 'Total user dengan role teknisi:' as description, COUNT(*) as count FROM users WHERE role = 'teknisi';
