# Midtrans Webhook Configuration Guide

## Overview
Webhook Midtrans notification handler sudah dibuat di endpoint `/api/midtrans/notification`. Endpoint ini akan otomatis dipanggil oleh Midtrans ketika status pembayaran berubah (success, pending, failed, expired, dll).

## Setup Notification URL di Midtrans Dashboard

### 1. Login ke Midtrans Dashboard
- **Sandbox**: https://dashboard.sandbox.midtrans.com/
- **Production**: https://dashboard.midtrans.com/

### 2. Konfigurasi Notification URL
1. Pilih **Settings** → **Configuration**
2. Scroll ke bagian **Notification URL**
3. Masukkan URL webhook Anda:

#### Development (Local):
```
http://localhost:3000/api/midtrans/notification
```

**Note**: Untuk development local, gunakan tools seperti **ngrok** atau **localtunnel** agar Midtrans bisa akses localhost:
```bash
# Install ngrok
npm install -g ngrok

# Expose localhost
ngrok http 3000

# Copy URL yang digenerate (contoh: https://abc123.ngrok.io)
# Lalu gunakan: https://abc123.ngrok.io/api/midtrans/notification
```

#### Production:
```
https://your-domain.com/api/midtrans/notification
```

Contoh:
```
https://chicha-mobile.me/api/midtrans/notification
```

### 3. Enable HTTP Notification
Pastikan **HTTP Notification** dicentang/enabled

### 4. Save Configuration
Klik tombol **Save** atau **Update Settings**

---

## Testing Webhook

### Manual Testing (Postman/cURL)

```bash
curl -X POST http://localhost:3000/api/midtrans/notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "YOUR_ORDER_ID",
    "status_code": "200",
    "gross_amount": "100000.00",
    "signature_key": "SIGNATURE_HASH",
    "transaction_status": "settlement",
    "fraud_status": "accept",
    "payment_type": "credit_card"
  }'
```

### Test via Midtrans Simulator
1. Buat transaksi di aplikasi
2. Buka Midtrans Sandbox Dashboard
3. Pilih **Transactions** → cari transaksi Anda
4. Klik **Action** → pilih status (Success, Pending, Failed, dll)
5. Webhook akan otomatis dipanggil oleh Midtrans

---

## Webhook Flow

```
User completes payment
      ↓
Midtrans processes payment
      ↓
Midtrans calls webhook: POST /api/midtrans/notification
      ↓
Webhook verifies signature
      ↓
Webhook updates order payment_status in database
      ↓
Webhook updates target spending (if paid)
      ↓
Webhook sends notification to customer
      ↓
Returns 200 OK to Midtrans
```

---

## Payment Status Mapping

Webhook otomatis update payment status berdasarkan `transaction_status` dari Midtrans:

| Transaction Status | Payment Status | Order Status | Description |
|--------------------|----------------|--------------|-------------|
| `capture` (fraud_status: accept) | `paid` | `pending` | Credit card payment successful |
| `settlement` | `paid` | `pending` | Payment settled |
| `pending` | `pending` | - | Waiting for payment |
| `deny` | `failed` | `dibatalkan` | Payment denied |
| `cancel` | `failed` | `dibatalkan` | Payment cancelled |
| `expire` | `expired` | `dibatalkan` | Payment expired |

---

## Security

### Signature Verification
Webhook memverifikasi signature hash dari Midtrans untuk mencegah fake notifications:

```typescript
const signatureInput = order_id + status_code + gross_amount + SERVER_KEY;
const calculatedSignature = crypto.createHash('sha512')
  .update(signatureInput)
  .digest('hex');

if (calculatedSignature !== signature_key) {
  return 403 Forbidden;
}
```

### Server Key Protection
Pastikan `MIDTRANS_SERVER_KEY` ada di `.env` dan **JANGAN** di-commit ke repository:

```env
MIDTRANS_SERVER_KEY=your_server_key_here
```

---

## Troubleshooting

### Webhook tidak terpanggil
1. ✅ Check Notification URL sudah benar di Midtrans Dashboard
2. ✅ Check URL accessible dari internet (tidak localhost tanpa ngrok)
3. ✅ Check firewall tidak memblokir incoming requests
4. ✅ Check logs di Midtrans Dashboard → Transactions → Notification Logs

### Signature verification failed
1. ✅ Check `MIDTRANS_SERVER_KEY` di `.env` sama dengan di dashboard
2. ✅ Check tidak ada whitespace di server key
3. ✅ Check menggunakan server key yang benar (sandbox vs production)

### Order tidak terupdate
1. ✅ Check webhook return 200 OK (lihat Midtrans notification logs)
2. ✅ Check database order memiliki kolom `midtrans_order_id`
3. ✅ Check logs di terminal server untuk error messages

### Payment status tidak berubah
1. ✅ Check webhook dipanggil (cek server logs)
2. ✅ Check `midtrans_order_id` di database match dengan yang di Midtrans
3. ✅ Check tidak ada error saat update database (cek server logs)

---

## Monitoring & Logs

### Server Logs (Terminal)
Webhook akan print logs setiap kali dipanggil:
```
📬 Midtrans notification received: { order_id: '...', transaction_status: 'settlement', ... }
✅ Signature verified
📦 Order found: ...
📝 Updating order: ...
✅ Order updated successfully
🎯 Payment successful, updating target spending...
✅ Payment notification sent to customer
```

### Midtrans Dashboard Logs
1. Login ke Midtrans Dashboard
2. Pilih **Transactions**
3. Klik transaksi yang ingin dicek
4. Scroll ke **HTTP Notification**
5. Lihat request/response dan status code

---

## Additional Features

### Automatic Target Update
Ketika payment status berubah ke `paid`, webhook otomatis:
- ✅ Menghitung total spending user dari semua paid orders
- ✅ Update target `current_amount`
- ✅ Update target status ke `achieved` jika sudah tercapai
- ✅ Kirim notification "Target Tercapai" ke user

### Customer Notifications
Webhook otomatis kirim notification ke customer:
- ✅ "Pembayaran Berhasil" - ketika payment status = paid
- ✅ "Target Tercapai" - ketika user mencapai target belanja

---

## File Locations

| Component | File Path |
|-----------|-----------|
| Webhook Handler | `app/api/midtrans/notification/route.ts` |
| Payment Creation | `app/api/payment/create/route.ts` |
| Success Page | `app/client/checkout/success/page.tsx` |
| Middleware (exempt success) | `middleware.ts` |

---

## Next Steps

1. ✅ Setup Notification URL di Midtrans Dashboard
2. ✅ Test dengan ngrok untuk local development
3. ✅ Deploy aplikasi dan update Notification URL dengan production URL
4. ✅ Test end-to-end payment flow
5. ✅ Monitor webhook logs untuk memastikan semua berjalan lancar

---

## Support

Jika ada masalah dengan webhook:
1. Check server logs untuk error messages
2. Check Midtrans dashboard notification logs
3. Verify signature calculation
4. Test dengan Midtrans simulator

**Dokumentasi Midtrans**: https://docs.midtrans.com/en/after-payment/http-notification
