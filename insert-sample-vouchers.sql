-- Insert sample vouchers for testing
-- Make sure to run create-vouchers-table.sql first!

-- Voucher 1: Diskon Percentage 10%
INSERT INTO vouchers (code, name, description, type, value, min_purchase, max_discount, quota, valid_from, valid_until, is_active)
VALUES (
  'WELCOME10',
  'Diskon 10% untuk Pelanggan Baru',
  'Dapatkan diskon 10% untuk pembelian pertama Anda',
  'percentage',
  10.00,
  50000.00,
  50000.00,
  100,
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE
);

-- Voucher 2: Diskon Fixed 25K
INSERT INTO vouchers (code, name, description, type, value, min_purchase, max_discount, quota, valid_from, valid_until, is_active)
VALUES (
  'HEMAT25K',
  'Potongan Langsung Rp 25.000',
  'Hemat Rp 25.000 untuk belanja minimal Rp 100.000',
  'fixed',
  25000.00,
  100000.00,
  NULL,
  50,
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE
);

-- Voucher 3: Diskon Percentage 15%
INSERT INTO vouchers (code, name, description, type, value, min_purchase, max_discount, quota, valid_from, valid_until, is_active)
VALUES (
  'BELANJA15',
  'Diskon 15% Maksimal Rp 100.000',
  'Diskon hingga Rp 100.000 untuk belanja minimal Rp 200.000',
  'percentage',
  15.00,
  200000.00,
  100000.00,
  30,
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE
);

-- Voucher 4: Diskon Fixed 50K
INSERT INTO vouchers (code, name, description, type, value, min_purchase, max_discount, quota, valid_from, valid_until, is_active)
VALUES (
  'SPESIAL50K',
  'Potongan Spesial Rp 50.000',
  'Dapatkan potongan Rp 50.000 untuk pembelian minimal Rp 250.000',
  'fixed',
  50000.00,
  250000.00,
  NULL,
  20,
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE
);

-- Voucher 5: Diskon Percentage 20%
INSERT INTO vouchers (code, name, description, type, value, min_purchase, max_discount, quota, valid_from, valid_until, is_active)
VALUES (
  'MEMBER20',
  'Diskon Member 20%',
  'Diskon spesial 20% maksimal Rp 150.000',
  'percentage',
  20.00,
  300000.00,
  150000.00,
  15,
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE
);

-- Check inserted vouchers
SELECT 
  code,
  name,
  type,
  value,
  min_purchase,
  max_discount,
  quota,
  used,
  quota - used as quota_left,
  valid_until,
  is_active
FROM vouchers
ORDER BY min_purchase;
