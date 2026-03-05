-- =====================================================
-- IMPORTANT: Sync Teknisi to Users Table
-- Description: Ensure all teknisi have corresponding user accounts
-- Date: March 5, 2026
-- =====================================================

-- This script must be run to enable notifications for teknisi
-- It syncs teknisi data to users table with role 'teknisi'

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
DO $$
DECLARE
  teknisi_count INTEGER;
  users_teknisi_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO teknisi_count FROM teknisi;
  SELECT COUNT(*) INTO users_teknisi_count FROM users WHERE role = 'teknisi';
  
  RAISE NOTICE '✅ Total teknisi di table teknisi: %', teknisi_count;
  RAISE NOTICE '✅ Total user dengan role teknisi: %', users_teknisi_count;
  
  IF teknisi_count > users_teknisi_count THEN
    RAISE WARNING '⚠️  Ada % teknisi yang belum di-sync ke users table', (teknisi_count - users_teknisi_count);
  ELSIF teknisi_count = users_teknisi_count THEN
    RAISE NOTICE '✅ Semua teknisi sudah di-sync ke users table';
  END IF;
END $$;

-- Display synced data
SELECT 
  t.id as teknisi_id,
  t.name,
  t.username,
  t.email,
  u.id as user_id,
  u.email as user_email
FROM teknisi t
LEFT JOIN users u ON u.email = COALESCE(t.email, t.username || '@teknisi.local') AND u.role = 'teknisi'
ORDER BY t.created_at DESC;
