-- Add customer info fields to bookings table for guest bookings
-- This allows bookings from users who are not logged in

ALTER TABLE bookings 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN customer_email TEXT;

-- Add comment
COMMENT ON COLUMN bookings.customer_name IS 'Customer name for guest bookings (optional if user_id exists)';
COMMENT ON COLUMN bookings.customer_phone IS 'Customer phone for guest bookings (optional if user_id exists)';
COMMENT ON COLUMN bookings.customer_email IS 'Customer email for guest bookings (optional if user_id exists)';
