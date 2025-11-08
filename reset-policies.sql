-- ============================================
-- RESET RLS POLICIES - Jalankan ini SEBELUM apply schema baru
-- ============================================

-- Drop all existing policies
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

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_create_user_target ON users;
DROP TRIGGER IF EXISTS trigger_update_target ON orders;
DROP TRIGGER IF EXISTS trigger_sync_role_to_auth ON users;

-- Drop functions
DROP FUNCTION IF EXISTS create_user_target();
DROP FUNCTION IF EXISTS update_target_on_order();
DROP FUNCTION IF EXISTS sync_user_role_to_auth();

-- Sekarang Anda bisa run supabase-schema.sql dengan aman
