-- Create Target untuk Najib Alfarizi (najibalfarizi25@gmail.com)
-- Target akan otomatis diupdate saat ada order dengan status paid

-- Step 1: Cek total belanja dari paid orders
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  COALESCE(SUM(o.total_amount), 0) as total_spent,
  COUNT(o.id) as total_paid_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
WHERE u.email = 'najibalfarizi25@gmail.com'
GROUP BY u.id, u.email, u.name;

-- Step 2: Insert target dengan current_amount sesuai total belanja
INSERT INTO targets (
  user_id,
  target_amount,
  current_amount,
  reward,
  status,
  reward_claimed,
  created_at,
  updated_at
)
SELECT 
  u.id,
  10000000, -- Target 10 juta
  COALESCE(SUM(o.total_amount), 0), -- Current amount dari paid orders
  'Voucher diskon 20% atau hadiah spesial', -- Reward
  CASE 
    WHEN COALESCE(SUM(o.total_amount), 0) >= 10000000 THEN 'achieved'
    ELSE 'active'
  END, -- Status
  false, -- Reward belum diklaim
  NOW(),
  NOW()
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
WHERE u.email = 'najibalfarizi25@gmail.com'
GROUP BY u.id
ON CONFLICT (user_id) DO UPDATE SET
  current_amount = EXCLUDED.current_amount,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Step 3: Verifikasi hasil
SELECT 
  t.id,
  t.user_id,
  u.email,
  u.name,
  t.target_amount,
  t.current_amount,
  t.reward,
  t.status,
  t.reward_claimed,
  ROUND((t.current_amount::numeric / t.target_amount::numeric) * 100, 2) as progress_percentage
FROM targets t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'najibalfarizi25@gmail.com';
