-- Add snap_token column to orders table
-- This stores the Midtrans Snap payment token for pending orders
-- so users can continue payment later

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS snap_token TEXT;

-- Add comment
COMMENT ON COLUMN orders.snap_token IS 'Midtrans Snap payment token for continuing pending payments';
