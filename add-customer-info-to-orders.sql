-- =====================================================
-- Migration: Add customer_info to orders table
-- Description: Add JSONB column to store customer information
-- Date: 2025-11-05
-- =====================================================

-- Add customer_info column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_info JSONB;

-- Create index for faster queries on customer_info
CREATE INDEX IF NOT EXISTS idx_orders_customer_info ON orders USING gin(customer_info);

-- Add comment to explain the column
COMMENT ON COLUMN orders.customer_info IS 'Customer information stored as JSON: {name, email, phone, address}';

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✓ customer_info column added to orders table';
  RAISE NOTICE '✓ GIN index created for customer_info';
END $$;

-- Display updated table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
