# 🐛 DEBUGGING GUIDE - Transaction Issues

## 🔍 Issue Summary
**Problems:**
1. ❌ Stock tidak berkurang setelah transaksi
2. ❌ Total pesanan tidak bertambah di halaman akun
3. ❌ Pesanan tidak muncul di riwayat pesanan
4. ❌ Admin tidak melihat transaksi di halaman pesanan
5. ❌ Data transaksi tidak ada di Supabase

**Root Cause:** Order tidak tersimpan ke database setelah payment sukses

---

## 🧪 Step-by-Step Debugging

### **Step 1: Test Checkout Flow**

1. **Open Browser Console (F12)** sebelum checkout
2. **Go to Console tab**
3. **Clear console** (klik icon 🚮 atau Ctrl+L)

### **Step 2: Start Checkout Process**

1. Add product to cart
2. Go to checkout page
3. Fill customer information
4. Select "Midtrans Payment Gateway"
5. Click "Lanjut ke Pembayaran"

### **Step 3: Check Console Logs**

**Expected logs di checkout page:**
```
🛒 Preparing checkout: {user_id: "...", items: [...], ...}
💳 Creating Midtrans payment: {gross_amount: 100000, ...}
💳 Payment result: {token: "...", redirect_url: "..."}
✅ Pending order saved: Yes
📦 Pending order preview: {"user_id":"...","subtotal":100000...
🗑️ Cart cleared
🚀 Redirecting to Midtrans: https://app.sandbox.midtrans.com/...
```

**If you see ERROR here, copy the error message!**

### **Step 4: Complete Midtrans Payment**

Use test card:
```
Card: 4811 1111 1111 1114
CVV: 123
Exp: 01/30
OTP: 112233
```

### **Step 5: Check Success Page Logs**

After payment success, **expected logs:**
```
✅ Payment success page: {midtransOrderId: "ORDER-...", transactionStatus: "settlement"}
🔍 Checking localStorage for pending_order...
✅ Pending order found: {"user_id":"...","subtotal":...
📦 Parsed pending order: {user_id: "...", items: [...]}
📤 Creating order with data: {user_id: "...", midtrans_order_id: "..."}
📨 API Response status: 200
✅ Order created successfully: {id: "...", user_id: "...", ...}
🧹 Cleaned up localStorage
```

**If you see ERROR here, copy the error message!**

---

## 🔍 Common Errors & Solutions

### **Error 1: "No pending order found in localStorage"**

**Cause:** `pending_order` tidak tersimpan atau terhapus

**Check:**
```javascript
// Di console, setelah klik "Lanjut ke Pembayaran" tapi sebelum redirect:
localStorage.getItem('pending_order')
// Should return: string with order data

localStorage.getItem('user')
// Should return: {"id":"...","name":"..."}
```

**Solution:**
- Pastikan tidak ada script/extension yang clear localStorage
- Pastikan browser tidak dalam mode incognito/private
- Check apakah ada error di console sebelum redirect

---

### **Error 2: "Missing user_id in pending order"**

**Cause:** User data tidak ada di localStorage

**Check:**
```javascript
JSON.parse(localStorage.getItem('user'))
// Should return object with: {id: "...", name: "...", email: "..."}
```

**Solution:**
- Logout dan login ulang
- Verify di console: `localStorage.getItem('user')` ada isinya
- Check `/api/auth/me` return user data

---

### **Error 3: API Response status: 400 or 500**

**Cause:** Error di server saat create order

**Check Network Tab:**
1. Open Network tab di DevTools
2. Filter: "orders"
3. Find POST request to `/api/orders`
4. Click request → Response tab
5. Copy error message

**Common errors:**
- "Missing required fields" → Check orderData structure
- "Validation failed" → Check user_id, items, payment_method
- "Insert failed" → Check Supabase RLS policies

---

### **Error 4: Order created but stock not reduced**

**Check:**
1. Verify order ada di database:
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
   ```

2. Verify order_items ada:
   ```sql
   SELECT * FROM order_items WHERE order_id = 'YOUR_ORDER_ID';
   ```

3. Check product stock update logic di API

---

## 🛠️ Manual Verification

### **Check Supabase Database:**

1. **Login to Supabase Dashboard**
2. **Go to Table Editor**
3. **Check tables:**

```sql
-- Check latest orders
SELECT 
  id,
  user_id,
  total_amount,
  payment_method,
  payment_status,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Check order items
SELECT 
  oi.id,
  oi.order_id,
  p.name as product_name,
  oi.quantity,
  oi.price
FROM order_items oi
JOIN products p ON p.id = oi.product_id
ORDER BY oi.created_at DESC
LIMIT 10;

-- Check product stock
SELECT id, name, stock FROM products;
```

---

## 🐛 Specific Debug Commands

### **Test 1: Check localStorage**
```javascript
// Run in browser console
console.log('User:', localStorage.getItem('user'));
console.log('Cart:', localStorage.getItem('cart'));
console.log('Pending Order:', localStorage.getItem('pending_order'));
```

### **Test 2: Simulate Order Creation**
```javascript
// Run in browser console after payment
const pendingOrder = JSON.parse(localStorage.getItem('pending_order'));
console.log('Pending Order Data:', pendingOrder);

// Check structure
console.log('Has user_id:', !!pendingOrder?.user_id);
console.log('Has items:', !!pendingOrder?.items && pendingOrder.items.length > 0);
console.log('Has payment_method:', !!pendingOrder?.payment_method);
```

### **Test 3: Manual API Call**
```javascript
// Run in browser console
const pendingOrder = JSON.parse(localStorage.getItem('pending_order'));
const orderData = {
  ...pendingOrder,
  midtrans_order_id: 'TEST-' + Date.now(),
  payment_status: 'paid',
};

fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData),
})
.then(res => res.json())
.then(data => console.log('Result:', data))
.catch(err => console.error('Error:', err));
```

---

## 📋 Testing Checklist

Run through this checklist:

- [ ] User logged in (check localStorage.getItem('user'))
- [ ] Cart has items
- [ ] Checkout page loads correctly
- [ ] Customer info filled
- [ ] Payment method selected
- [ ] Click "Lanjut ke Pembayaran"
- [ ] Console shows "Pending order saved: Yes"
- [ ] Redirect to Midtrans successful
- [ ] Payment completed with test card
- [ ] Redirect to success page
- [ ] Console shows "Order created successfully"
- [ ] Order visible in database
- [ ] Order visible in user account
- [ ] Stock reduced
- [ ] Order visible in admin dashboard

---

## 🚨 If Still Not Working

**Collect this information:**

1. **Console Logs:**
   - Screenshot dari console setelah checkout
   - Screenshot dari console di success page

2. **Network Logs:**
   - Screenshot POST `/api/payment/create` response
   - Screenshot POST `/api/orders` response (if any)

3. **localStorage:**
   ```javascript
   {
     user: localStorage.getItem('user'),
     cart: localStorage.getItem('cart'),
     pending_order: localStorage.getItem('pending_order')
   }
   ```

4. **Database Check:**
   - Total orders di database: `SELECT COUNT(*) FROM orders;`
   - Latest order: `SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;`

5. **Error Messages:**
   - Any error in console (red text)
   - Any error in Network tab

**Send all this information untuk debugging lebih lanjut!**

---

## ✅ Expected Working Flow

```
1. User login
   ↓
2. Add to cart → localStorage.cart
   ↓
3. Go to checkout
   ↓
4. Fill customer info
   ↓
5. Click "Lanjut ke Pembayaran"
   ↓
6. Save to localStorage.pending_order ✅
   ↓
7. Create Midtrans payment
   ↓
8. Redirect to Midtrans
   ↓
9. Complete payment
   ↓
10. Midtrans redirect to /client/checkout/success
   ↓
11. Get pending_order from localStorage ✅
   ↓
12. POST /api/orders ✅
   ↓
13. Order saved to database ✅
   ↓
14. Stock reduced ✅
   ↓
15. Clear localStorage.pending_order ✅
   ↓
16. Show success message ✅
```

---

**Last Updated:** December 1, 2025
