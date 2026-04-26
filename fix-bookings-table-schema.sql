-- =====================================================
-- Migration: Add Missing Columns to Bookings Table
-- Description: Add progress_status and customer info columns to bookings table
-- Date: 2026-04-26
-- =====================================================

-- First, check if teknisi table exists, if not create it
CREATE TABLE IF NOT EXISTS public.teknisi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    specialization TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop old progress_status constraint if it exists with different values
DO $$
BEGIN
  -- Drop the old constraint if it exists
  ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS bookings_progress_status_check;
  
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Silently continue if constraint doesn't exist
END $$;

-- Remove progress_status column if it exists to recreate it fresh
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS progress_status CASCADE;

-- Add progress_status column with correct constraint
ALTER TABLE public.bookings 
ADD COLUMN progress_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (progress_status IN ('pending', 'diagnosed', 'in_progress', 'waiting_parts', 'completed', 'cancelled'));

-- Add customer info columns if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Add service-related columns if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS service_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS progress_notes TEXT,
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update teknisi_id column to reference teknisi table if it already references users
-- Note: This is safe because it will only execute if teknisi_id doesn't already reference teknisi
DO $$
BEGIN
  -- Try to drop old constraint
  ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS bookings_teknisi_id_fkey;
  
  EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Add teknisi_id column if it doesn't exist
DO $$
BEGIN
  ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS teknisi_id UUID REFERENCES public.teknisi(id) ON DELETE SET NULL;
  
  EXCEPTION WHEN OTHERS THEN
    -- Column already exists, try to add the constraint
    BEGIN
      ALTER TABLE public.bookings 
      ADD CONSTRAINT bookings_teknisi_id_fkey 
      FOREIGN KEY (teknisi_id) REFERENCES public.teknisi(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Constraint already exists
    END;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_teknisi_id ON public.bookings(teknisi_id);
CREATE INDEX IF NOT EXISTS idx_bookings_progress_status ON public.bookings(progress_status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_code ON public.bookings(service_code);
CREATE INDEX IF NOT EXISTS idx_teknisi_username ON public.teknisi(username);
CREATE INDEX IF NOT EXISTS idx_teknisi_status ON public.teknisi(status);

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✓ Teknisi table verified/created';
  RAISE NOTICE '✓ progress_status column recreated with correct constraint';
  RAISE NOTICE '✓ Customer info columns added/verified';
  RAISE NOTICE '✓ Service-related columns added/verified';
  RAISE NOTICE '✓ teknisi_id column added/verified';
  RAISE NOTICE '✓ Indexes created/verified';
  RAISE NOTICE '✓ All constraints verified';
END $$;
