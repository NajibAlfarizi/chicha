# Midtrans Webhook Setup Guide

## Masalah yang Diperbaiki (April 8, 2026)
- Payment success page muncul ✅
- Webhook route `/api/midtrans/notification` sekarang ada ✅
- Success page NO LONGER mencoba manual PATCH update ✅
- Payment status seharusnya update via webhook notification ✅

## Flow Pembayaran (Updated)

```
1. Customer checkout → Order created (status: pending, payment_status: pending)
2. Order updated with midtrans_order_id
3. Midtrans Snap popup opened
4. Customer completes payment
5. Midtrans calls webhook /api/midtrans/notification [NEW]
6. Webhook verifies signature and updates payment_status to 'paid'
7. Success page loads and fetches order (displays updated status)
```

## Setup di Midtrans Dashboard

### Development (dengan ngrok)

1. **Jalankan ngrok tunnel** untuk localhost:3000
   ```bash
   ngrok http 3000
   ```
   Catat forwarding URL: `https://xxxx-xx-xxx-123.ngrok.io`

2. **Update env variables di `.env.local`**
   ```
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
   MIDTRANS_SERVER_KEY=your_server_key
   ```

3. **Di Midtrans Dashboard → Settings → Notification/Webhook URL**
   
   Set HTTP POST notification ke:
   ```
   https://xxxx-xx-xxx-123.ngrok.io/api/midtrans/notification
   ```
   
   Atau jika sudah deployed:
   ```
   https://your-live-domain.com/api/midtrans/notification
   ```

4. **Set Notification untuk:**
   - [x] **Midtrans MAP API** → Nama: `HTTP POST notification`, Method: `POST`
   - [x] **Snap** → Notification URL (dua tempat)

### Production

```
https://chicha-mobile-production.vercel.app/api/midtrans/notification
```

## Flow Testing

### Test Scenario 1: Successful Payment
```
1. Go to /client/checkout
2. Add items dan apply voucher
3. Click Bayar Sekarang
4. Use test card: 4011111111111111 (exp: 12/25, CVV: 123)
5. Check ngrok terminal untuk:
   - POST request ke /api/midtrans/notification
   - Response: "success": true
6. Check database: orders.payment_status should be 'paid'
7. Go to /client/akun → tab Orders → verify status is "Sudah Dibayar"
```

### Test Scenario 2: Failed Payment
```
1. Use invalid card: 4000000000000422
2. Payment should fail
3. Webhook called with transaction_status: 'deny'
4. Order status updated to 'dibatalkan'
```

### Debugging Webhook Issues

1. **Check ngrok terminal** untuk melihat request detail
2. **Check application logs** untuk webhook processing:
   ```
   📬 Midtrans notification received
   ✅ Signature verified
   📦 Order found
   📝 Updating order
   ✅ Order updated successfully
   ```

3. **Jika signature invalid:**
   - Verifikasi MIDTRANS_SERVER_KEY di env
   - Check order_id, status_code, gross_amount dari Midtrans

4. **Jika order not found:**
   - Verifikasi midtrans_order_id tersimpan di database
   - Check apakah order sudah dibuat di step checkout

## Key Code Locations

- **Webhook Handler**: `/app/api/midtrans/notification/route.ts`
- **Checkout Flow**: `/app/client/checkout/page.tsx`
- **Success Page**: `/app/client/checkout/success/page.tsx` (READ ONLY - no manual updates)
- **Payment Status Determination**: `/app/api/midtrans/notification/route.ts` lines 59-67

## Signature Verification

```
Hash = SHA512(order_id + status_code + gross_amount + server_key)
```

Contoh:
```
order_id = "550e8400-e29b-41d4-a716-446655440000"
status_code = "200"
gross_amount = "100000"
server_key = "Mid-server-xxxxx"

Input = "550e8400-e29b-41d4-a716-44665544000020010000Mid-server-xxxxx"
Hash = SHA512(Input) = [hexadecimal value]
```

Webhook harus provide signature_key yang match dengan hash ini.

## Troubleshooting

### Issue: Order created tapi payment_status tidak update
- ✅ Webhook file sudah ada: `/app/api/midtrans/notification/route.ts`
- ⚠️ Verifikasi notification URL di Midtrans dashboard sudah benar
- ⚠️ Cek ngrok alias atau domain routing kalau ngrok URL berubah
- ⚠️ Pastikan MIDTRANS_SERVER_KEY benar di .env.local

### Issue: Signature verification failed
- Verifikasi raw request body signature matches
- Jangan encode order_id sebagai JSON string - pakai value langsung
- Gross amount harus number format, tidak ada currency symbol

### Issue: Order not found di webhook
- Verifikasi order sudah created dengan status 'pending'
- Verifikasi midtrans_order_id sudah tersimpan di orders table
- SQL query: `SELECT id, midtrans_order_id FROM orders WHERE midtrans_order_id = 'xxx';`

## Database Schema Updates

Orders table harus memiliki kolom:
- `midtrans_order_id` (TEXT) - diupdate saat checkout
- `payment_status` (TEXT) - diupdate oleh webhook
- `payment_expired_at` (TIMESTAMP) - set saat order creation

Verifikasi dengan:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
```
