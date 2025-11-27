-- Quick check if vouchers table exists and has data
-- Run this in Supabase SQL Editor to verify

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vouchers'
) as vouchers_table_exists;

-- 2. Check if voucher_usage table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'voucher_usage'
) as voucher_usage_table_exists;

-- 3. Check columns in orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('voucher_id', 'voucher_code', 'discount_amount', 'subtotal')
ORDER BY column_name;

-- 4. Count vouchers
SELECT COUNT(*) as total_vouchers FROM vouchers;

-- 5. List all active vouchers
SELECT 
  code,
  name,
  type,
  value,
  min_purchase,
  quota,
  used,
  valid_from,
  valid_until,
  is_active,
  CASE 
    WHEN valid_until < NOW() THEN 'EXPIRED'
    WHEN valid_from > NOW() THEN 'NOT YET VALID'
    WHEN is_active = false THEN 'INACTIVE'
    WHEN used >= quota THEN 'QUOTA FULL'
    ELSE 'AVAILABLE'
  END as status
FROM vouchers
ORDER BY created_at DESC;
