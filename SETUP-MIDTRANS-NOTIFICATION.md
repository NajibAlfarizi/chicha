# Setup Midtrans Payment Notification

## 🔔 Kenapa Perlu Notification URL?

Payment notification dari Midtrans sangat penting karena:
- ✅ User bisa tutup browser sebelum redirect ke success page
- ✅ Memastikan payment status selalu ter-update
- ✅ Auto-update status pembayaran dari Midtrans server
- ✅ Rollback stock otomatis jika pembayaran gagal/expired

## 📝 Setup di Midtrans Dashboard

### 1. Login ke Midtrans Dashboard
- **Sandbox**: https://dashboard.sandbox.midtrans.com
- **Production**: https://dashboard.midtrans.com

### 2. Konfigurasi Payment Notification URL

1. **Masuk ke Settings**
   - Klik menu **Settings** di sidebar
   - Pilih **Configuration**

2. **Set Notification URL**
   - Scroll ke section **Payment Notification URL**
   - Masukkan URL: `https://chicha-mobile.me/api/payment/notification`
   - Atau untuk development: `https://your-domain.com/api/payment/notification`

3. **Set Finish Redirect URL (Optional)**
   - Finish URL: `https://chicha-mobile.me/client/checkout/success`
   - Unfinished URL: `https://chicha-mobile.me/client/checkout`
   - Error URL: `https://chicha-mobile.me/client/checkout/error`

4. **Save Configuration**
   - Klik tombol **Save**
   - Tunggu konfirmasi berhasil

## 🔐 Environment Variables

Pastikan `.env.local` sudah ada:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false

NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key
NEXT_PUBLIC_BASE_URL=https://chicha-mobile.me
```

## 🚀 How It Works

### Flow dengan Notification URL:

1. **User Checkout**
   - Order dibuat dengan `payment_status: 'pending'`
   - Stock dikurangi
   - Midtrans Snap popup muncul

2. **User Bayar**
   - User melakukan pembayaran di Snap
   - Midtrans proses pembayaran

3. **Midtrans Send Notification** (Yang Baru!)
   - Midtrans otomatis kirim POST request ke `/api/payment/notification`
   - Server update `payment_status` ke `'paid'` jika sukses
   - TIDAK tergantung user redirect ke success page

4. **User Redirect (Optional)**
   - Jika user masih di browser, redirect ke success page
   - Success page juga update status (double safety)

### Notification Handler (`/api/payment/notification`)

Handler ini:
- ✅ Verifikasi signature key (security)
- ✅ Cari order berdasarkan order_id
- ✅ Update payment_status:
  - `'paid'` untuk settlement/capture
  - `'pending'` untuk pending
  - `'failed'` untuk cancel/deny/expire
- ✅ Rollback stock jika payment failed
- ✅ Cancel order otomatis jika expired

## 📊 Testing Notification

### 1. Test di Local (Ngrok)

Jika develop di localhost, gunakan ngrok:

```bash
# Install ngrok
# Download dari: https://ngrok.com/download

# Run ngrok
ngrok http 3000

# Copy URL yang muncul, contoh: https://abc123.ngrok.io
# Set di Midtrans: https://abc123.ngrok.io/api/payment/notification
```

### 2. Test Manual Notification

Gunakan Postman untuk test:

```bash
POST https://chicha-mobile.me/api/payment/notification
Content-Type: application/json

{
  "order_id": "7761557a-...",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "gross_amount": "250000.00",
  "signature_key": "...",
  "status_code": "200"
}
```

### 3. Check Logs

Monitor terminal untuk log notification:

```bash
📨 Midtrans notification received: { order_id: '...', ... }
✅ Signature verified
💳 Payment status: paid
📦 Order found: 7761557a-...
✅ Order 7761557a-... payment status updated to: paid
```

## ✅ Verifikasi Setup Berhasil

1. **Create Test Order**
   - Checkout dengan Midtrans
   - Gunakan test card: 4811 1111 1111 1114

2. **Check Admin Dashboard**
   - Buka `/admin/pesanan`
   - Order harus muncul dengan status "Belum Bayar"

3. **Complete Payment**
   - Bayar di Snap popup
   - Success atau tutup browser

4. **Refresh Admin Page**
   - Status bayar harus berubah jadi "Lunas" ✅
   - Bahkan jika user tutup browser sebelum redirect!

## 🔧 Troubleshooting

### Payment status tidak update?

1. Check notification URL di Midtrans dashboard
2. Check server logs di terminal
3. Pastikan MIDTRANS_SERVER_KEY benar
4. Test signature verification

### Error "Invalid signature"?

- Pastikan `MIDTRANS_SERVER_KEY` sama dengan di dashboard
- Check environment variable sudah ter-load

### Notification tidak masuk?

- Pastikan URL accessible dari internet (bukan localhost)
- Check firewall/security settings
- Gunakan ngrok untuk development

## 📚 Resources

- [Midtrans Notification Docs](https://docs.midtrans.com/en/after-payment/http-notification)
- [Signature Key Verification](https://docs.midtrans.com/en/after-payment/http-notification#verifying-notification-authenticity)
