-- Add midtrans_order_id column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_midtrans_order_id ON orders(midtrans_order_id);

-- Add comment
COMMENT ON COLUMN orders.midtrans_order_id IS 'Midtrans order ID for payment tracking';
