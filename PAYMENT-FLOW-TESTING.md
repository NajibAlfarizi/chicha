# Payment Flow Testing Checklist (April 8, 2026)

## ✅ FIXES APPLIED

- [x] Webhook handler route created: `/app/api/midtrans/notification/route.ts`
- [x] Removed manual PATCH update from success page (read-only now)
- [x] Enhanced logging in webhook for debugging
- [x] Verified orders table has all required columns:
  - `midtrans_order_id` (TEXT)
  - `payment_status` (TEXT: pending, paid, failed, cancelled)
  - `payment_expired_at` (TIMESTAMP)
  - `status` (TEXT: pending, dikirim, selesai, dibatalkan)

## 🚀 BEFORE TESTING

### Step 1: Verify Environment Variables
```bash
# Check .env.local has these values
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<your_client_key>
MIDTRANS_SERVER_KEY=<your_server_key>
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_key>
```

### Step 2: Start ngrok tunnel (Development Only)
```bash
# In separate terminal
ngrok http 3000

# Output example:
# Forwarding   https://1234-56-789-123.ngrok.io -> http://localhost:3000
```

### Step 3: Set Webhook URL in Midtrans Dashboard
- Login to Midtrans Sandbox / Production Dashboard
- Go to **Settings → Notification → HTTP Notification**
- Set webhook URL to: `https://<your-ngrok-url>/api/midtrans/notification`
- Ensure checkbox is **ENABLED**

### Step 4: Start Next.js app
```bash
npm run dev
# Should output: ▲ Next.js version X.X.X
```

## 🧪 TEST FLOW

### Test Case 1: Successful Payment (Happy Path)

**When:** Customer completes payment
**Expected Flow:**
```
1. Customer goes to /client/checkout
2. Adds items to cart
3. Fills customer info
4. Clicks "Bayar Sekarang"
5. ✅ Order created with status "pending", payment_status "pending"
6. ✅ midtrans_order_id saved to orders table
7. ✅ Midtrans Snap popup opens
8. Customer enters test card: 4011111111111111
   - CVV: 123
   - Expiry: 12/25
9. ✅ Payment completed at Midtrans
10. ✅ ngrok shows: POST /api/midtrans/notification 200
11. ✅ Application log shows:
    - "📬 Midtrans notification received"
    - "✅ Signature verified"
    - "📦 Order found: <order_id>"
    - "✅ Transaction status: settlement"
    - "📝 Updating order: old: pending → new: paid"
    - "✅ Order updated successfully"
12. ✅ User redirected to /client/checkout/success?order_id=<id>
13. ✅ Success page displays order details
14. ✅ Database check shows payment_status = "paid"
15. ✅ Go to /client/akun → Orders tab
    - Order shows "Status: Sudah Dibayar"
    - No "Bayar Sekarang" button visible
```

**Verification SQL:**
```sql
-- Check order payment status
SELECT id, user_id, payment_status, status, midtrans_order_id, created_at
FROM orders
WHERE payment_status = 'paid'
ORDER BY created_at DESC
LIMIT 1;

-- Expected: payment_status = 'paid'
```

### Test Case 2: Failed Payment

**When:** Customer uses invalid card
**Use Card:** 4000000000000422

**Expected Behavior:**
```
1. Payment fails at Midtrans
2. ngrok shows: POST /api/midtrans/notification 200
3. Webhook receives transaction_status: 'deny'
4. Order payment_status updated to: 'failed'
5. Order status updated to: 'dibatalkan'
6. Success page still loads (shows failed message)
7. Customer can retry payment via /client/akun → Orders
```

### Test Case 3: Pending Payment

**When:** Customer leaves payment popup open without completing
**Expected Behavior:**
```
1. Click "Bayar Sekarang"
2. Snap popup opens
3. CLOSE the popup (don't complete payment)
4. User redirected to /client/checkout/pending?order_id=<id>
5. Pending page shows payment expiry time
6. Order status remains: payment_status = 'pending'
7. Customer can resume payment via button
```

## 🔍 DEBUGGING CHECKLIST

### If payment_status still doesn't update:

**Check 1: Webhook file exists**
```bash
# File should exist at:
# /app/api/midtrans/notification/route.ts
```

**Check 2: ngrok shows webhook is called**
```
# Terminal output should show:
POST /api/midtrans/notification 200 OK
```

**Check 3: Application logs**
```
# Console should show complete webhook processing:
📬 Midtrans notification received
✅ Signature verified
📦 Order found: <id>
✅ Transaction status: settlement
📝 Updating order: old: pending → new: paid
✅ Order updated successfully
```

**Check 4: Database has the order**
```sql
SELECT * FROM orders WHERE midtrans_order_id = '<order_id_from_checkout>';
-- Should return 1 row with user_id, total_amount, etc.
```

**Check 5: Correct server key**
```bash
# Verify in .env.local:
# MIDTRANS_SERVER_KEY=Mid-server-xxxx (Sandbox) or Mid-server-yyyy (Production)
```

**Check 6: Signature calculation**
```
If logs show: "❌ Invalid signature hash"

Then verify:
1. MIDTRANS_SERVER_KEY is correct (copy-paste from dashboard)
2. Webhook URL in Midtrans dashboard matches ngrok URL
3. order_id + status_code + gross_amount + server_key format
```

**Check 7: Order query failure**
```
If logs show: "❌ Order not found: <order_id>"

Then check:
1. Order was actually created in checkout
2. midtrans_order_id was saved correctly
3. SQL: SELECT * FROM orders WHERE midtrans_order_id = '<id>';
```

## 📊 EXPECTED LOG OUTPUT

### Successful Payment Flow Logs

**Checkout Page (browser console):**
```
👤 User ID: 550e8400-e29b-41d4-a716-446655440000
📋 Customer Info: { name, email, phone, address }
💳 Step 1: Creating order in database first...
✅ Order created: 550e8400-e29b-41d4-a716-446655440001
💳 Step 2: Creating Midtrans payment for order: 550e8400-e29b-41d4-a716-446655440001
💳 Payment result: { token, order_id }
💾 Step 3: Updating order with midtrans_order_id: ...
✅ Order updated with midtrans_order_id: ...
🚀 Opening Midtrans Snap with token: ...
✅ Payment success: { ... }
```

**Success Page (browser console):**
```
📋 URL Parameters: { order_id, transaction_status }
📊 Fetching order details (webhook will handle payment status update)
✅ Order details fetched: { id, payment_status, status }
🧹 Cart cleaned up
```

**Webhook (server console/ngrok):**
```
📬 Midtrans notification received: { order_id, transaction_status, payment_type }
✅ Signature verified
📦 Order found: 550e8400-e29b-41d4-a716-446655440001
🔍 Transaction status: settlement Fraud status: accept
✅ Payment successful - setting to paid
📝 Updating order: { database_id, old: pending, new: paid }
✅ Order updated successfully: { id, payment_status: paid }
```

## 🗂️ KEY FILES MODIFIED

1. **Created:**
   - `/app/api/midtrans/notification/route.ts` - Webhook handler
   - `/MIDTRANS-WEBHOOK-SETUP.md` - Webhook setup guide
   - `/PAYMENT-FLOW-TESTING.md` - This checklist

2. **Modified:**
   - `/app/client/checkout/success/page.tsx` - Removed manual PATCH update
   - Enhanced logging for debugging

## ⏭️ NEXT STEPS

1. ✅ Apply all migration files (already in database)
2. ✅ Configure webhook URL in Midtrans Dashboard
3. ✅ Run test payment scenarios
4. 📋 Document any issues in console logs
5. ✅ Verify database updates match payment status
6. 🚀 Ready for production deployment

## 📞 SUPPORT

If payment still doesn't update after testing:
1. Check ngrok terminal for webhook calls
2. Check application logs for error messages
3. Verify all env variables are correct
4. Check Midtrans dashboard settings
5. Ensure notification URL is reachable (test with curl)

---

**Status: Ready for Testing**
**Last Updated: April 8, 2026**
