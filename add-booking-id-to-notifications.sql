-- =====================================================
-- Migration: Add booking_id to notifications table
-- Description: Add booking_id field to notifications for booking-related notifications
-- Date: 2026-04-26
-- =====================================================

-- Add booking_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;

-- Create index for booking_id
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON notifications(booking_id);

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✓ booking_id column added to notifications table';
  RAISE NOTICE '✓ Index created for faster queries';
END $$;
