-- =====================================================
-- Migration: Update Notifications Table for Booking Service
-- Description: Add booking_id to notifications table to support booking service notifications
-- Date: March 5, 2026
-- =====================================================

-- Add booking_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;

-- Create index for booking notifications
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON notifications(booking_id);

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✓ booking_id column added to notifications table';
  RAISE NOTICE '✓ Index created for booking_id';
END $$;

-- Display updated table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
