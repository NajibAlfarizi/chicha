-- Add cancel_reason and cancelled_at to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Create index for cancelled_at for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at);

-- Add comment
COMMENT ON COLUMN orders.cancel_reason IS 'Reason why the order was cancelled (admin/user input)';
COMMENT ON COLUMN orders.cancelled_at IS 'Timestamp when the order was cancelled';
