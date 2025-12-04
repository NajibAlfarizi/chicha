-- Debug: Kenapa target tidak muncul untuk najibalfarizi5@gmail.com?

-- Step 1: Cek user dengan email yang mirip (typo check)
SELECT id, email, name, role, created_at 
FROM users 
WHERE email LIKE '%najib%' OR email LIKE '%alfarizi%'
ORDER BY created_at DESC;

-- Step 2: Cek semua target yang ada untuk user Najib
SELECT 
  t.id as target_id,
  t.user_id,
  u.email,
  u.name,
  t.target_amount,
  t.current_amount,
  t.reward,
  t.status,
  t.created_at,
  ROUND((t.current_amount::numeric / t.target_amount::numeric) * 100, 2) as progress_percentage
FROM targets t
JOIN users u ON t.user_id = u.id
WHERE u.email LIKE '%najib%' OR u.email LIKE '%alfarizi%'
ORDER BY t.created_at DESC;

-- Step 3: Cek orders untuk email najibalfarizi5@gmail.com
SELECT 
  o.id,
  o.user_id,
  u.email,
  u.name,
  o.total_amount,
  o.status,
  o.payment_status,
  o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.email = 'najibalfarizi5@gmail.com'
ORDER BY o.created_at DESC;

-- Step 4: Total belanja dari paid orders
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  COUNT(o.id) as total_orders,
  COUNT(CASE WHEN o.payment_status = 'paid' THEN 1 END) as paid_orders,
  COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_paid_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.email = 'najibalfarizi5@gmail.com'
GROUP BY u.id, u.email, u.name;

-- Step 5: Cek apakah ada mismatch antara target.user_id dan user yang login
-- (Jika ada target tapi user_id nya beda)
SELECT 
  'User Info' as type,
  u.id as id,
  u.email,
  u.name
FROM users u
WHERE u.email = 'najibalfarizi5@gmail.com'

UNION ALL

SELECT 
  'Target Info' as type,
  t.id,
  u.email,
  t.user_id::text as name_or_userid
FROM targets t
JOIN users u ON t.user_id = u.id
WHERE u.email LIKE '%najib%' OR u.email LIKE '%alfarizi%';
