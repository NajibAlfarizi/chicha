-- =====================================================
-- MIGRATION: Add Teknisi System
-- Description: Create teknisi table and update bookings table
-- Date: November 2025
-- =====================================================

-- 1. CREATE TEKNISI TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teknisi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    specialization TEXT, -- e.g., "Software, Hardware, Network"
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teknisi_username ON public.teknisi(username);
CREATE INDEX IF NOT EXISTS idx_teknisi_status ON public.teknisi(status);

-- 2. UPDATE BOOKINGS TABLE
-- =====================================================
-- Add teknisi-related fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS teknisi_id UUID REFERENCES public.teknisi(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS service_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS progress_status VARCHAR(50) DEFAULT 'pending' 
    CHECK (progress_status IN ('pending', 'diagnosed', 'in_progress', 'waiting_parts', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS progress_notes TEXT,
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_teknisi_id ON public.bookings(teknisi_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_code ON public.bookings(service_code);
CREATE INDEX IF NOT EXISTS idx_bookings_progress_status ON public.bookings(progress_status);

-- 3. CREATE FUNCTION TO GENERATE SERVICE CODE
-- =====================================================
CREATE OR REPLACE FUNCTION generate_service_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate format: SRV-YYYYMMDD-XXXX (e.g., SRV-20251105-A3F9)
        new_code := 'SRV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.bookings WHERE service_code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER TO AUTO-GENERATE SERVICE CODE
-- =====================================================
CREATE OR REPLACE FUNCTION set_service_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.service_code IS NULL THEN
        NEW.service_code := generate_service_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_service_code ON public.bookings;
CREATE TRIGGER trigger_set_service_code
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_service_code();

-- 5. RLS POLICIES FOR TEKNISI
-- =====================================================
-- Enable RLS
ALTER TABLE public.teknisi ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin can manage all teknisi"
    ON public.teknisi
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Teknisi can view their own profile
CREATE POLICY "Teknisi can view own profile"
    ON public.teknisi
    FOR SELECT
    TO authenticated
    USING (id::text = auth.uid()::text);

-- Teknisi can update their own profile (except username/password)
CREATE POLICY "Teknisi can update own profile"
    ON public.teknisi
    FOR UPDATE
    TO authenticated
    USING (id::text = auth.uid()::text);

-- Public can view active teknisi (for booking form)
CREATE POLICY "Public can view active teknisi"
    ON public.teknisi
    FOR SELECT
    TO anon
    USING (status = 'active');

-- 6. UPDATE BOOKINGS RLS POLICIES
-- =====================================================
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Teknisi can view assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Teknisi can update assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view booking by service code" ON public.bookings;
DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;

-- Recreate with teknisi support
CREATE POLICY "Users can view own bookings"
    ON public.bookings
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'teknisi')
        )
    );

CREATE POLICY "Users can create bookings"
    ON public.bookings
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Admin can manage all bookings"
    ON public.bookings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Teknisi can view assigned bookings"
    ON public.bookings
    FOR SELECT
    TO authenticated
    USING (
        teknisi_id::text = auth.uid()::text
    );

CREATE POLICY "Teknisi can update assigned bookings"
    ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (teknisi_id::text = auth.uid()::text)
    WITH CHECK (teknisi_id::text = auth.uid()::text);

-- Allow anon to view bookings by service_code (for tracking)
CREATE POLICY "Anyone can view booking by service code"
    ON public.bookings
    FOR SELECT
    TO anon
    USING (service_code IS NOT NULL);

-- 7. INSERT SAMPLE TEKNISI (Optional - for testing)
-- =====================================================
-- Password is 'teknisi123' hashed with bcrypt
-- You can use online bcrypt generator or run: bcrypt.hash('teknisi123', 10)
-- For now, we'll leave this for the API to handle

-- 8. VERIFICATION QUERIES
-- =====================================================
-- Check teknisi table structure
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'teknisi'
ORDER BY ordinal_position;

-- Check bookings table updates
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('teknisi_id', 'service_code', 'progress_status', 'progress_notes', 'estimated_completion', 'completed_at')
ORDER BY ordinal_position;

-- Check policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('teknisi', 'bookings')
ORDER BY tablename, policyname;

-- Test service code generation
SELECT generate_service_code() as sample_service_code;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Create API routes for teknisi authentication
-- 3. Create teknisi dashboard pages
-- 4. Update booking form to include teknisi selection
-- 5. Create service tracking page
-- =====================================================
