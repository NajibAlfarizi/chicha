# Pre-Deployment Checklist

## ✅ Changes Completed

### 1. **Payment Flow Fixes**
- ✅ Webhook endpoint created: `/api/midtrans/notification/route.ts`
- ✅ Auto-update payment status via Midtrans notification
- ✅ Success page accessible without auth (middleware updated)
- ✅ Payment status no longer manually updated in client
- ✅ Snap token saved to database for pending payments

### 2. **Database Migration**
- ✅ SQL file created: `add-snap-token-to-orders.sql`
- ⚠️ **ACTION REQUIRED**: Run this SQL in Supabase before deployment

### 3. **Notification System**
- ✅ All notification helpers implemented
- ✅ Notifications for orders (customer + admin)
- ✅ Notifications for bookings (customer + admin)
- ✅ Notifications for teknisi assignments
- ✅ Notifications for booking status changes

### 4. **Booking System**
- ✅ Customer cannot select teknisi (removed from form)
- ✅ Admin can assign teknisi via dialog
- ✅ Teknisi receives notification when assigned
- ✅ Customer receives notification when teknisi assigned

---

## 🔧 Pre-Deployment Actions

### 1. **Run Database Migration**
Execute in Supabase SQL Editor:
```sql
-- Add snap_token column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS snap_token TEXT;

-- Add comment
COMMENT ON COLUMN orders.snap_token IS 'Midtrans Snap payment token for continuing pending payments';
```

### 2. **Check Environment Variables**
Pastikan `.env.local` berisi:
```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false (atau true untuk production)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. **Test Build Locally** (Optional tapi Recommended)
```bash
npm run build
```

Jika build berhasil tanpa error, aman untuk deploy.

---

## 📋 Post-Deployment Actions

### 1. **Setup Midtrans Webhook** (CRITICAL!)
Setelah deploy, segera setup di Midtrans Dashboard:

1. Login ke Midtrans Dashboard
   - Sandbox: https://dashboard.sandbox.midtrans.com/
   - Production: https://dashboard.midtrans.com/

2. Navigasi: **Settings** → **Configuration**

3. Set **Notification URL**:
   ```
   https://your-production-domain.com/api/midtrans/notification
   ```
   
   Contoh:
   ```
   https://chicha-mobile.me/api/midtrans/notification
   ```

4. Enable **HTTP Notification**

5. **Save** configuration

⚠️ **SANGAT PENTING**: Tanpa webhook ini, payment status tidak akan otomatis terupdate!

### 2. **Test End-to-End Payment Flow**
1. ✅ Create order with Midtrans
2. ✅ Complete payment (gunakan test card di sandbox)
3. ✅ Check: Redirect ke success page (no login redirect)
4. ✅ Check: Payment status updated to "paid" in database
5. ✅ Check: Admin dashboard shows "paid" status
6. ✅ Check: Notification received by customer

### 3. **Test Pending Payment Flow**
1. ✅ Create order with Midtrans
2. ✅ Close payment popup (don't pay)
3. ✅ Go to Akun → Pesanan
4. ✅ Click "Lanjutkan Pembayaran"
5. ✅ Complete payment
6. ✅ Check: Payment status updated

### 4. **Test Booking Assignment Flow**
1. ✅ Customer creates booking (no teknisi selection)
2. ✅ Admin assigns teknisi via dialog
3. ✅ Check: Teknisi receives notification
4. ✅ Check: Customer receives notification
5. ✅ Check: Teknisi sees booking in their panel

---

## 🚨 Known Issues (Non-Critical)

### Tailwind CSS Warnings
- Error messages about `bg-gradient-to-*` class names
- These are just suggestions, not breaking errors
- Can be fixed later without affecting functionality

---

## 🔍 Monitoring After Deploy

### Watch for:
1. **Server logs** untuk webhook calls dari Midtrans
2. **Payment status updates** di database
3. **Notification delivery** ke users
4. **No 500 errors** di production

### Expected Logs (Successful Webhook):
```
📬 Midtrans notification received: { order_id: '...', transaction_status: 'settlement' }
✅ Signature verified
📦 Order found: ...
✅ Order updated successfully
✅ Payment notification sent to customer
```

---

## 📞 Troubleshooting Guide

### Payment status tidak update
1. ✅ Check webhook URL di Midtrans Dashboard
2. ✅ Check webhook logs di Midtrans (Transactions → Notification Logs)
3. ✅ Check server logs untuk error messages
4. ✅ Verify `MIDTRANS_SERVER_KEY` di environment variables

### Webhook returns 404
1. ✅ Check URL format: `https://domain.com/api/midtrans/notification`
2. ✅ Check deployment berhasil dan endpoint accessible
3. ✅ Test manual: `curl -X POST https://domain.com/api/midtrans/notification`

### Signature verification failed
1. ✅ Check `MIDTRANS_SERVER_KEY` match dengan dashboard
2. ✅ Check tidak ada whitespace di server key
3. ✅ Check menggunakan correct server key (sandbox vs production)

---

## ✅ Deployment Safety Check

**AMAN UNTUK DEPLOY jika:**
- ✅ SQL migration sudah dijalankan di Supabase
- ✅ Environment variables sudah lengkap
- ✅ `npm run build` berhasil (no fatal errors)

**WAJIB DILAKUKAN SETELAH DEPLOY:**
- ⚠️ Setup webhook URL di Midtrans Dashboard
- ⚠️ Test payment flow end-to-end
- ⚠️ Monitor server logs untuk webhook calls

---

## 📚 Documentation Files

- `MIDTRANS-WEBHOOK-SETUP.md` - Detailed webhook setup guide
- `add-snap-token-to-orders.sql` - Database migration
- `BUG-FIXES-JANUARY-2026.md` - Changelog (if exists)

---

## 🎯 Summary

**Status:** ✅ **READY TO DEPLOY**

**Critical Post-Deploy Action:** Setup Midtrans Webhook URL

**Estimated Downtime:** None (zero-downtime deployment)

**Rollback Plan:** If issues occur, revert to previous deployment and check webhook configuration

---

**Good luck with the deployment! 🚀**
