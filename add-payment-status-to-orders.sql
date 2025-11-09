-- Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled'));

-- Update existing orders with COD or transfer_bank to have pending status
UPDATE orders 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Add comment to column
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed, cancelled';
