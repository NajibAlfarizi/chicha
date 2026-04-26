-- Demo seed data for Chicha Mobile
-- Run after schema migrations are applied.
-- This file seeds public data only and is intended for development/testing.

BEGIN;

-- =====================================================
-- Clean up previously seeded demo rows
-- =====================================================
DELETE FROM public.voucher_usage WHERE id IN (
  '78000000-0000-4000-8000-000000000001',
  '78000000-0000-4000-8000-000000000002',
  '78000000-0000-4000-8000-000000000003'
);

DELETE FROM public.chat_messages WHERE id IN (
  '77000000-0000-4000-8000-000000000001',
  '77000000-0000-4000-8000-000000000002',
  '77000000-0000-4000-8000-000000000003',
  '77000000-0000-4000-8000-000000000004',
  '77000000-0000-4000-8000-000000000005',
  '77000000-0000-4000-8000-000000000006',
  '77000000-0000-4000-8000-000000000007',
  '77000000-0000-4000-8000-000000000008'
);

DELETE FROM public.chat_rooms WHERE id IN (
  '76000000-0000-4000-8000-000000000001',
  '76000000-0000-4000-8000-000000000002',
  '76000000-0000-4000-8000-000000000003',
  '76000000-0000-4000-8000-000000000004'
);

DELETE FROM public.notifications WHERE id IN (
  '75000000-0000-4000-8000-000000000001',
  '75000000-0000-4000-8000-000000000002',
  '75000000-0000-4000-8000-000000000003',
  '75000000-0000-4000-8000-000000000004',
  '75000000-0000-4000-8000-000000000005',
  '75000000-0000-4000-8000-000000000006'
);

DELETE FROM public.service_progress WHERE id IN (
  '73000000-0000-4000-8000-000000000001',
  '73000000-0000-4000-8000-000000000002',
  '73000000-0000-4000-8000-000000000003',
  '73000000-0000-4000-8000-000000000004',
  '73000000-0000-4000-8000-000000000005',
  '73000000-0000-4000-8000-000000000006'
);

DELETE FROM public.complaints WHERE id IN (
  '74000000-0000-4000-8000-000000000001',
  '74000000-0000-4000-8000-000000000002',
  '74000000-0000-4000-8000-000000000003'
);

DELETE FROM public.bookings WHERE id IN (
  '72000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000002',
  '72000000-0000-4000-8000-000000000003',
  '72000000-0000-4000-8000-000000000004'
);

DELETE FROM public.order_items WHERE id IN (
  '71000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000002',
  '71000000-0000-4000-8000-000000000003',
  '71000000-0000-4000-8000-000000000004',
  '71000000-0000-4000-8000-000000000005',
  '71000000-0000-4000-8000-000000000006',
  '71000000-0000-4000-8000-000000000007',
  '71000000-0000-4000-8000-000000000008',
  '71000000-0000-4000-8000-000000000009',
  '71000000-0000-4000-8000-000000000010'
);

DELETE FROM public.orders WHERE id IN (
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000002',
  '70000000-0000-4000-8000-000000000003',
  '70000000-0000-4000-8000-000000000004',
  '70000000-0000-4000-8000-000000000005',
  '70000000-0000-4000-8000-000000000006'
);

DELETE FROM public.targets WHERE id IN (
  '60000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000002',
  '60000000-0000-4000-8000-000000000003'
);

DELETE FROM public.vouchers WHERE id IN (
  '50000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000002',
  '50000000-0000-4000-8000-000000000003',
  '50000000-0000-4000-8000-000000000004',
  '50000000-0000-4000-8000-000000000005'
);

DELETE FROM public.products WHERE id IN (
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '40000000-0000-4000-8000-000000000003',
  '40000000-0000-4000-8000-000000000004',
  '40000000-0000-4000-8000-000000000005',
  '40000000-0000-4000-8000-000000000006',
  '40000000-0000-4000-8000-000000000007',
  '40000000-0000-4000-8000-000000000008'
);

DELETE FROM public.teknisi WHERE id IN (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000003'
);

DELETE FROM public.users WHERE id IN (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005'
);

DELETE FROM public.categories WHERE id IN (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000004',
  '30000000-0000-4000-8000-000000000005',
  '30000000-0000-4000-8000-000000000006'
);

-- =====================================================
-- Categories
-- =====================================================
INSERT INTO public.categories (id, name, created_at)
VALUES
  ('30000000-0000-4000-8000-000000000001', 'Sparepart LCD', NOW() - INTERVAL '20 days'),
  ('30000000-0000-4000-8000-000000000002', 'Baterai', NOW() - INTERVAL '20 days'),
  ('30000000-0000-4000-8000-000000000003', 'Charger & Kabel', NOW() - INTERVAL '20 days'),
  ('30000000-0000-4000-8000-000000000004', 'Aksesoris', NOW() - INTERVAL '20 days'),
  ('30000000-0000-4000-8000-000000000005', 'Audio', NOW() - INTERVAL '20 days'),
  ('30000000-0000-4000-8000-000000000006', 'Service Jasa', NOW() - INTERVAL '20 days')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Users (account data for admin/customer screens)
-- =====================================================
INSERT INTO public.users (id, name, email, role, phone, address, created_at, updated_at)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'Admin Chicha', 'admin@chicha.com', 'admin', '081200000001', 'Head Office Chicha Mobile', NOW() - INTERVAL '60 days', NOW() - INTERVAL '2 days'),
  ('10000000-0000-4000-8000-000000000002', 'Dika Pratama', 'dika.pratama@example.com', 'user', '081200000002', 'Jl. Merdeka No. 12, Bandung', NOW() - INTERVAL '40 days', NOW() - INTERVAL '1 day'),
  ('10000000-0000-4000-8000-000000000003', 'Nabila Safitri', 'nabila.safitri@example.com', 'user', '081200000003', 'Jl. Melati No. 8, Jakarta', NOW() - INTERVAL '35 days', NOW() - INTERVAL '1 day'),
  ('10000000-0000-4000-8000-000000000004', 'Sari Anggraini', 'sari.anggraini@example.com', 'user', '081200000004', 'Jl. Kenanga No. 21, Surabaya', NOW() - INTERVAL '32 days', NOW() - INTERVAL '1 day'),
  ('10000000-0000-4000-8000-000000000005', 'Andi Saputra', 'andi.saputra@example.com', 'user', '081200000005', 'Jl. Pahlawan No. 44, Yogyakarta', NOW() - INTERVAL '28 days', NOW() - INTERVAL '1 day')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- Teknisi table used by current service flow
-- =====================================================
INSERT INTO public.teknisi (id, name, username, password_hash, phone, email, specialization, status, created_at, updated_at)
VALUES
  ('20000000-0000-4000-8000-000000000001', 'Budi Santoso', 'budi.teknisi', '$2b$10$/0Q70TjElmimxUoObhNsW.37JIcvNt5o.mo8MY0eVi2VgsBUVRk2i', '081234567890', 'budi@chicha.com', 'Hardware, LCD, Charging Port', 'active', NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day'),
  ('20000000-0000-4000-8000-000000000002', 'Andi Wijaya', 'andi.teknisi', '$2b$10$b63ronpW2EtwwmXFWZO4fupkHkpFFlqaNtHVNiphQhp0JRYGHQrJ.', '081234567891', 'andi@chicha.com', 'Software, Flashing, Software Update', 'active', NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day'),
  ('20000000-0000-4000-8000-000000000003', 'Citra Lestari', 'citra.teknisi', '$2b$10$zrwfNYq5ZjqoZbsmzarLCOPEb.qBOotlkqNGFymMciqckkiCkd03y', '081234567892', 'citra@chicha.com', 'Battery, Audio, Accessories', 'active', NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day')
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  specialization = EXCLUDED.specialization,
  status = EXCLUDED.status,
  updated_at = NOW();

-- =====================================================
-- Products
-- =====================================================
INSERT INTO public.products (id, name, category_id, price, stock, image_url, description, created_at)
VALUES
  ('40000000-0000-4000-8000-000000000001', 'LCD iPhone 13 Pro', '30000000-0000-4000-8000-000000000001', 980000, 12, '/images/products/lcd-iphone-13-pro.jpg', 'Sparepart LCD original quality untuk iPhone 13 Pro.', NOW() - INTERVAL '18 days'),
  ('40000000-0000-4000-8000-000000000002', 'Baterai Samsung A52', '30000000-0000-4000-8000-000000000002', 520000, 18, '/images/products/baterai-samsung-a52.jpg', 'Baterai replacement kapasitas stabil untuk Samsung A52.', NOW() - INTERVAL '18 days'),
  ('40000000-0000-4000-8000-000000000003', 'Fast Charger 25W', '30000000-0000-4000-8000-000000000003', 185000, 30, '/images/products/fast-charger-25w.jpg', 'Charger cepat 25W dengan proteksi arus.', NOW() - INTERVAL '18 days'),
  ('40000000-0000-4000-8000-000000000004', 'Tempered Glass Premium', '30000000-0000-4000-8000-000000000004', 85000, 45, '/images/products/tempered-glass-premium.jpg', 'Pelindung layar premium anti gores.', NOW() - INTERVAL '18 days'),
  ('40000000-0000-4000-8000-000000000005', 'Earphone Type-C', '30000000-0000-4000-8000-000000000005', 190000, 24, '/images/products/earphone-type-c.jpg', 'Earphone wired dengan jack Type-C.', NOW() - INTERVAL '18 days'),
  ('40000000-0000-4000-8000-000000000006', 'Service Ganti IC Charging', '30000000-0000-4000-8000-000000000006', 650000, 999, '/images/products/service-ic-charging.jpg', 'Layanan perbaikan IC charging untuk berbagai tipe smartphone.', NOW() - INTERVAL '18 days'),
  ('40000000-0000-4000-8000-000000000007', 'Back Cover TPU', '30000000-0000-4000-8000-000000000004', 120000, 38, '/images/products/back-cover-tpu.jpg', 'Casing TPU fleksibel dengan proteksi harian.', NOW() - INTERVAL '18 days'),
  ('40000000-0000-4000-8000-000000000008', 'Kabel Data USB-C', '30000000-0000-4000-8000-000000000003', 45000, 60, '/images/products/kabel-data-usbc.jpg', 'Kabel data USB-C untuk transfer dan charging.', NOW() - INTERVAL '18 days');

-- =====================================================
-- Vouchers
-- =====================================================
INSERT INTO public.vouchers (id, code, name, description, type, value, min_purchase, max_discount, quota, used, valid_from, valid_until, is_active, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000001', 'WELCOME10', 'Diskon 10% untuk Pelanggan Baru', 'Diskon 10% untuk pembelian pertama.', 'percentage', 10, 50000, 50000, 100, 1, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('50000000-0000-4000-8000-000000000002', 'HEMAT25K', 'Potongan Langsung Rp 25.000', 'Hemat Rp 25.000 untuk belanja minimal Rp 100.000.', 'fixed', 25000, 100000, NULL, 75, 1, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('50000000-0000-4000-8000-000000000003', 'BELANJA15', 'Diskon 15% Maksimal Rp 100.000', 'Diskon hingga Rp 100.000 untuk pembelian menengah.', 'percentage', 15, 200000, 100000, 30, 0, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('50000000-0000-4000-8000-000000000004', 'SPESIAL50K', 'Potongan Spesial Rp 50.000', 'Potongan untuk transaksi di atas batas tertentu.', 'fixed', 50000, 250000, NULL, 20, 0, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('50000000-0000-4000-8000-000000000005', 'MEMBER20', 'Diskon Member 20%', 'Diskon member dengan batas maksimum.', 'percentage', 20, 300000, 150000, 15, 1, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_purchase = EXCLUDED.min_purchase,
  max_discount = EXCLUDED.max_discount,
  quota = EXCLUDED.quota,
  used = EXCLUDED.used,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =====================================================
-- Orders
-- =====================================================
INSERT INTO public.orders (
  id,
  user_id,
  total_amount,
  subtotal,
  discount_amount,
  payment_method,
  payment_status,
  status,
  customer_info,
  voucher_id,
  voucher_code,
  midtrans_order_id,
  cancel_reason,
  cancelled_at,
  created_at,
  updated_at
)
VALUES
  (
    '70000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    1200000,
    1250000,
    50000,
    'midtrans',
    'paid',
    'pending',
    '{"name":"Dika Pratama","email":"dika.pratama@example.com","phone":"081200000002","address":"Jl. Merdeka No. 12, Bandung"}'::jsonb,
    '50000000-0000-4000-8000-000000000001',
    'WELCOME10',
    'MID-20260408-001',
    NULL,
    NULL,
    '2026-04-08 09:00:00+07',
    '2026-04-08 09:20:00+07'
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
    705000,
    730000,
    25000,
    'midtrans',
    'paid',
    'dikirim',
    '{"name":"Nabila Safitri","email":"nabila.safitri@example.com","phone":"081200000003","address":"Jl. Melati No. 8, Jakarta"}'::jsonb,
    '50000000-0000-4000-8000-000000000002',
    'HEMAT25K',
    'MID-20260408-002',
    NULL,
    NULL,
    '2026-04-08 10:00:00+07',
    '2026-04-08 10:12:00+07'
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004',
    275000,
    275000,
    0,
    'midtrans',
    'pending',
    'pending',
    '{"name":"Sari Anggraini","email":"sari.anggraini@example.com","phone":"081200000004","address":"Jl. Kenanga No. 21, Surabaya"}'::jsonb,
    NULL,
    NULL,
    'MID-20260408-003',
    NULL,
    NULL,
    '2026-04-08 11:00:00+07',
    '2026-04-08 11:00:00+07'
  ),
  (
    '70000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    770000,
    770000,
    0,
    'midtrans',
    'failed',
    'dibatalkan',
    '{"name":"Dika Pratama","email":"dika.pratama@example.com","phone":"081200000002","address":"Jl. Merdeka No. 12, Bandung"}'::jsonb,
    NULL,
    NULL,
    'MID-20260311-004',
    'Pembayaran gagal oleh bank',
    '2026-03-11 13:30:00+07',
    '2026-03-11 13:00:00+07',
    '2026-03-11 13:30:00+07'
  ),
  (
    '70000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000005',
    730000,
    880000,
    150000,
    'midtrans',
    'paid',
    'selesai',
    '{"name":"Andi Saputra","email":"andi.saputra@example.com","phone":"081200000005","address":"Jl. Pahlawan No. 44, Yogyakarta"}'::jsonb,
    '50000000-0000-4000-8000-000000000005',
    'MEMBER20',
    'MID-20260408-005',
    NULL,
    NULL,
    '2026-04-08 12:00:00+07',
    '2026-04-08 12:45:00+07'
  ),
  (
    '70000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000005',
    1500000,
    1500000,
    0,
    'bank_transfer',
    'paid',
    'pending',
    '{"name":"Andi Saputra","email":"andi.saputra@example.com","phone":"081200000005","address":"Jl. Pahlawan No. 44, Yogyakarta"}'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-08 13:30:00+07',
    '2026-04-08 13:40:00+07'
  );

-- =====================================================
-- Order items
-- =====================================================
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, created_at)
VALUES
  ('71000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 1, 980000, '2026-04-08 09:01:00+07'),
  ('71000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000003', 1, 185000, '2026-04-08 09:01:00+07'),
  ('71000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000004', 1, 85000, '2026-04-08 09:01:00+07'),
  ('71000000-0000-4000-8000-000000000004', '70000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 1, 520000, '2026-04-08 10:01:00+07'),
  ('71000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000008', 2, 45000, '2026-04-08 10:01:00+07'),
  ('71000000-0000-4000-8000-000000000006', '70000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000007', 1, 120000, '2026-04-08 10:01:00+07'),
  ('71000000-0000-4000-8000-000000000007', '70000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000005', 1, 190000, '2026-04-08 11:01:00+07'),
  ('71000000-0000-4000-8000-000000000008', '70000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000004', 1, 85000, '2026-04-08 11:01:00+07'),
  ('71000000-0000-4000-8000-000000000009', '70000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000006', 1, 650000, '2026-03-11 13:01:00+07'),
  ('71000000-0000-4000-8000-000000000010', '70000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000007', 1, 120000, '2026-03-11 13:01:00+07');

-- Mark order rows as recently touched for transaction sorting.
UPDATE public.orders
SET updated_at = created_at
WHERE updated_at IS NULL;

-- =====================================================
-- Voucher usage
-- =====================================================
INSERT INTO public.voucher_usage (id, voucher_id, user_id, order_id, discount_amount, used_at)
VALUES
  ('78000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', 50000, '2026-04-08 09:20:00+07'),
  ('78000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000002', 25000, '2026-04-08 10:12:00+07'),
  ('78000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000005', 150000, '2026-04-08 12:45:00+07');

-- =====================================================
-- Targets
-- =====================================================
INSERT INTO public.targets (id, user_id, target_amount, current_amount, status, reward, reward_claimed, created_at, updated_at)
VALUES
  ('60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 2000000, 1200000, 'active', 'Voucher belanja Rp 100.000', FALSE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
  ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 500000, 705000, 'achieved', 'Gratis aksesoris pilihan', TRUE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
  ('60000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005', 3000000, 730000, 'active', 'Diskon service 15%', FALSE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day')
ON CONFLICT (user_id) DO UPDATE SET
  target_amount = EXCLUDED.target_amount,
  current_amount = EXCLUDED.current_amount,
  status = EXCLUDED.status,
  reward = EXCLUDED.reward,
  reward_claimed = EXCLUDED.reward_claimed,
  updated_at = NOW();

-- =====================================================
-- Bookings
-- =====================================================
INSERT INTO public.bookings (id, user_id, teknisi_id, device_name, issue, booking_date, status, created_at)
VALUES
  ('72000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'iPhone 13 Pro', 'Layar retak dan Face ID kadang gagal', '2026-04-09 10:00:00+07', 'proses', '2026-04-08 08:30:00+07'),
  ('72000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'Samsung A52', 'Baterai cepat habis', '2026-04-10 14:00:00+07', 'proses', '2026-04-08 09:30:00+07'),
  ('72000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'Xiaomi Note 10', 'Tidak mau mengisi daya', '2026-04-05 15:00:00+07', 'selesai', '2026-04-03 10:30:00+07'),
  ('72000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', 'OPPO Reno 8', 'Speaker pecah', '2026-04-12 11:00:00+07', 'proses', '2026-04-08 11:30:00+07');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'service_code'
  ) THEN
    UPDATE public.bookings
    SET
      service_code = 'SRV-20260408-A001',
      progress_status = 'in_progress',
      progress_notes = 'Unit diterima dan sedang dicek modul LCD.',
      estimated_completion = '2026-04-10 10:00:00+07'
    WHERE id = '72000000-0000-4000-8000-000000000001';

    UPDATE public.bookings
    SET
      service_code = 'SRV-20260408-A002',
      progress_status = 'diagnosed',
      progress_notes = 'Unit sudah didiagnosa dan menunggu tindak lanjut teknisi.',
      estimated_completion = '2026-04-11 14:00:00+07'
    WHERE id = '72000000-0000-4000-8000-000000000002';

    UPDATE public.bookings
    SET
      service_code = 'SRV-20260408-A003',
      progress_status = 'completed',
      progress_notes = 'Port charging dibersihkan dan fleksibel diganti.',
      completed_at = '2026-04-05 18:00:00+07',
      estimated_completion = '2026-04-05 18:00:00+07'
    WHERE id = '72000000-0000-4000-8000-000000000003';

    UPDATE public.bookings
    SET
      service_code = 'SRV-20260408-A004',
      progress_status = 'waiting_parts',
      progress_notes = 'Speaker sedang dianalisis dan menunggu part replacement.',
      estimated_completion = '2026-04-13 11:00:00+07'
    WHERE id = '72000000-0000-4000-8000-000000000004';
  END IF;
END $$;

-- =====================================================
-- Service progress history
-- =====================================================
INSERT INTO public.service_progress (id, booking_id, description, progress_status, updated_at)
VALUES
  ('73000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', 'Booking diterima dan dijadwalkan.', 'diagnosed', '2026-04-08 08:30:00+07'),
  ('73000000-0000-4000-8000-000000000002', '72000000-0000-4000-8000-000000000001', 'Teknisi sudah membongkar unit dan mulai diagnosis.', 'diagnosed', '2026-04-08 09:15:00+07'),
  ('73000000-0000-4000-8000-000000000003', '72000000-0000-4000-8000-000000000001', 'Penggantian LCD sedang berlangsung.', 'in_progress', '2026-04-08 10:30:00+07'),
  ('73000000-0000-4000-8000-000000000004', '72000000-0000-4000-8000-000000000002', 'Booking baru dibuat dan menunggu tindak lanjut teknisi.', 'diagnosed', '2026-04-08 09:30:00+07'),
  ('73000000-0000-4000-8000-000000000005', '72000000-0000-4000-8000-000000000003', 'Port charging dibersihkan dan dites ulang.', 'completed', '2026-04-05 18:00:00+07'),
  ('73000000-0000-4000-8000-000000000006', '72000000-0000-4000-8000-000000000004', 'Speaker diidentifikasi dan menunggu part replacement.', 'waiting_parts', '2026-04-08 11:30:00+07');

-- =====================================================
-- Complaints / Reviews
-- =====================================================
INSERT INTO public.complaints (id, user_id, order_id, message, reply, status, created_at)
VALUES
  ('74000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', 'Mohon cek kembali garansi LCD karena garis hijau muncul lagi.', 'Kami akan cek ulang unit Anda hari ini.', 'dibalas', '2026-04-08 13:00:00+07'),
  ('74000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000002', 'Pesanan datang agak terlambat, tapi kondisi produk baik.', NULL, 'belum dibaca', '2026-04-08 13:10:00+07'),
  ('74000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', '70000000-0000-4000-8000-000000000003', 'Mohon info estimasi selesai untuk service charging.', 'Estimasi selesai besok sore.', 'dibalas', '2026-04-08 13:20:00+07');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'product_id'
  ) THEN
    UPDATE public.complaints
    SET product_id = '40000000-0000-4000-8000-000000000001', rating = 4
    WHERE id = '74000000-0000-4000-8000-000000000001';

    UPDATE public.complaints
    SET product_id = '40000000-0000-4000-8000-000000000003', rating = 5
    WHERE id = '74000000-0000-4000-8000-000000000002';

    UPDATE public.complaints
    SET product_id = '40000000-0000-4000-8000-000000000006', rating = 4
    WHERE id = '74000000-0000-4000-8000-000000000003';
  END IF;
END $$;

-- =====================================================
-- Notifications
-- =====================================================
INSERT INTO public.notifications (id, user_id, order_id, title, message, type, is_read, created_at)
VALUES
  ('75000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', 'Pembayaran Berhasil', 'Pembayaran pesanan Anda sudah dikonfirmasi dan sedang diproses.', 'order_status', TRUE, '2026-04-08 09:20:00+07'),
  ('75000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000002', 'Pesanan Dikirim', 'Pesanan Anda sudah dalam perjalanan ke alamat tujuan.', 'order_status', FALSE, '2026-04-08 10:30:00+07'),
  ('75000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000005', 'Pesanan Selesai', 'Pesanan Anda telah selesai dan siap dinikmati.', 'order_status', FALSE, '2026-04-08 12:50:00+07'),
  ('75000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', NULL, 'Target Tercapai', 'Selamat, target belanja Anda sudah tercapai.', 'target', TRUE, '2026-04-08 12:55:00+07'),
  ('75000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', NULL, 'Booking Dijadwalkan', 'Teknisi Anda sudah ditentukan untuk booking service.', 'booking', FALSE, '2026-04-08 09:35:00+07'),
  ('75000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000004', NULL, 'Voucher Tersedia', 'Ada voucher aktif yang bisa dipakai untuk pembelian berikutnya.', 'promo', FALSE, '2026-04-08 13:00:00+07');

-- =====================================================
-- Chat rooms
-- =====================================================
INSERT INTO public.chat_rooms (id, name, type, customer_id, admin_id, teknisi_id, booking_id, order_id, last_message_at, created_at, updated_at)
VALUES
  ('76000000-0000-4000-8000-000000000001', 'Support Dika', 'support', '10000000-0000-4000-8000-000000000002', (SELECT id FROM public.users WHERE email = 'admin@chicha.com' LIMIT 1), NULL, NULL, NULL, '2026-04-08 09:25:00+07', '2026-04-08 09:10:00+07', '2026-04-08 09:25:00+07'),
  ('76000000-0000-4000-8000-000000000002', 'Order #1 Discussion', 'order', '10000000-0000-4000-8000-000000000002', (SELECT id FROM public.users WHERE email = 'admin@chicha.com' LIMIT 1), NULL, NULL, '70000000-0000-4000-8000-000000000001', '2026-04-08 09:28:00+07', '2026-04-08 09:20:00+07', '2026-04-08 09:28:00+07'),
  ('76000000-0000-4000-8000-000000000003', 'Booking iPhone 13 Pro', 'booking', '10000000-0000-4000-8000-000000000002', NULL, '20000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', NULL, '2026-04-08 10:40:00+07', '2026-04-08 08:35:00+07', '2026-04-08 10:40:00+07'),
  ('76000000-0000-4000-8000-000000000004', 'Direct Support Nabila', 'direct', '10000000-0000-4000-8000-000000000003', NULL, '20000000-0000-4000-8000-000000000003', NULL, NULL, '2026-04-08 13:05:00+07', '2026-04-08 12:55:00+07', '2026-04-08 13:05:00+07');

-- =====================================================
-- Chat messages
-- =====================================================
INSERT INTO public.chat_messages (id, room_id, sender_type, sender_id, sender_name, message, message_type, attachment_url, is_read, read_at, created_at, updated_at)
VALUES
  ('77000000-0000-4000-8000-000000000001', '76000000-0000-4000-8000-000000000001', 'customer', '10000000-0000-4000-8000-000000000002', 'Dika Pratama', 'Halo admin, saya ingin cek status order saya.', 'text', NULL, TRUE, '2026-04-08 09:16:00+07', '2026-04-08 09:12:00+07', '2026-04-08 09:12:00+07'),
  ('77000000-0000-4000-8000-000000000002', '76000000-0000-4000-8000-000000000001', 'admin', (SELECT id FROM public.users WHERE email = 'admin@chicha.com' LIMIT 1), 'Admin Chicha', 'Halo, order Anda sedang diproses dan akan segera dikirim.', 'text', NULL, TRUE, '2026-04-08 09:25:00+07', '2026-04-08 09:18:00+07', '2026-04-08 09:18:00+07'),
  ('77000000-0000-4000-8000-000000000003', '76000000-0000-4000-8000-000000000002', 'customer', '10000000-0000-4000-8000-000000000002', 'Dika Pratama', 'Saya sudah bayar, mohon konfirmasi ya.', 'text', NULL, TRUE, '2026-04-08 09:26:00+07', '2026-04-08 09:21:00+07', '2026-04-08 09:21:00+07'),
  ('77000000-0000-4000-8000-000000000004', '76000000-0000-4000-8000-000000000002', 'admin', (SELECT id FROM public.users WHERE email = 'admin@chicha.com' LIMIT 1), 'Admin Chicha', 'Pembayaran sudah masuk, pesanan akan diproses hari ini.', 'text', NULL, TRUE, '2026-04-08 09:28:00+07', '2026-04-08 09:24:00+07', '2026-04-08 09:24:00+07'),
  ('77000000-0000-4000-8000-000000000005', '76000000-0000-4000-8000-000000000003', 'customer', '10000000-0000-4000-8000-000000000002', 'Dika Pratama', 'Bagaimana kondisi LCD saya?', 'text', NULL, FALSE, NULL, '2026-04-08 10:10:00+07', '2026-04-08 10:10:00+07'),
  ('77000000-0000-4000-8000-000000000006', '76000000-0000-4000-8000-000000000003', 'teknisi', '20000000-0000-4000-8000-000000000001', 'Budi Santoso', 'Unit sedang saya cek, estimasi selesai sore ini.', 'text', NULL, FALSE, NULL, '2026-04-08 10:40:00+07', '2026-04-08 10:40:00+07'),
  ('77000000-0000-4000-8000-000000000007', '76000000-0000-4000-8000-000000000004', 'customer', '10000000-0000-4000-8000-000000000003', 'Nabila Safitri', 'Saya ingin tanya estimasi service baterai.', 'text', NULL, FALSE, NULL, '2026-04-08 13:00:00+07', '2026-04-08 13:00:00+07'),
  ('77000000-0000-4000-8000-000000000008', '76000000-0000-4000-8000-000000000004', 'teknisi', '20000000-0000-4000-8000-000000000003', 'Citra Lestari', 'Estimasi selesai 1-2 hari kerja setelah part tersedia.', 'text', NULL, FALSE, NULL, '2026-04-08 13:05:00+07', '2026-04-08 13:05:00+07');

-- =====================================================
-- Final sync for updated_at on orders and related tables
-- =====================================================
UPDATE public.orders
SET updated_at = COALESCE(updated_at, created_at, NOW());

UPDATE public.targets
SET updated_at = COALESCE(updated_at, created_at, NOW());

UPDATE public.vouchers
SET updated_at = COALESCE(updated_at, created_at, NOW());

UPDATE public.teknisi
SET updated_at = COALESCE(updated_at, created_at, NOW());

UPDATE public.users
SET updated_at = COALESCE(updated_at, created_at, NOW());

COMMIT;