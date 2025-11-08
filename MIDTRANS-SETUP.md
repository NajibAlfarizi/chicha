# Midtrans Payment Gateway Integration

## 🚀 Setup Guide

### 1. Get Midtrans Credentials

1. **Daftar/Login** ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Pilih **Environment: Sandbox** untuk testing
3. Copy credentials:
   - **Server Key**: Settings → Access Keys → Server Key
   - **Client Key**: Settings → Access Keys → Client Key

### 2. Update Environment Variables

Edit file `.env.local`:

```bash
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY_HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY_HERE
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY_HERE
```

**Important**: 
- Untuk testing, gunakan `MIDTRANS_IS_PRODUCTION=false`
- Untuk production, ganti ke `MIDTRANS_IS_PRODUCTION=true` dan gunakan production keys

### 3. Setup Midtrans Notification URL

1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Go to **Settings → Configuration**
3. Set **Notification URL**:
   ```
   https://your-domain.com/api/payment/notification
   ```
4. Untuk local testing, gunakan **ngrok** atau **localtunnel**:
   ```bash
   npx localtunnel --port 3000 --subdomain your-subdomain
   ```
   Kemudian set notification URL ke: `https://your-subdomain.loca.lt/api/payment/notification`

### 4. Restart Development Server

```bash
npm run dev
```

## 🧪 Testing Payment

### Test Credit Cards (Sandbox)

| Card Number | CVV | Exp Date | 3D Secure | Status |
|-------------|-----|----------|-----------|--------|
| 4811 1111 1111 1114 | 123 | 01/25 | 112233 | Success |
| 4911 1111 1111 1113 | 123 | 01/25 | 112233 | Challenge by FDS |
| 5211 1111 1111 1117 | 123 | 01/25 | 112233 | Denied by FDS |

### Test Bank Transfer

- **BCA**: VA Number akan otomatis di-generate
- **Mandiri**: Bill Key akan otomatis di-generate
- **BNI/BRI/Permata**: VA Number akan otomatis di-generate

## 📝 Payment Flow

1. **User Checkout**
   - User isi data customer dan pilih metode pembayaran
   - Klik "Bayar Sekarang"

2. **Create Order**
   - System create order di database dengan status `pending`
   - Generate Order ID

3. **Create Midtrans Transaction**
   - Call API `/api/payment/create`
   - Midtrans return payment token dan redirect URL

4. **User Payment**
   - User diarahkan ke Midtrans payment page
   - User memilih payment method dan selesaikan pembayaran

5. **Midtrans Notification**
   - Midtrans send notification ke `/api/payment/notification`
   - System update order status:
     - `settlement` → `paid`
     - `pending` → `pending`
     - `cancel/deny/expire` → `failed`

6. **User Redirect**
   - Success → `/client/akun?tab=orders&payment=success`
   - Error → `/client/checkout?payment=error`
   - Pending → `/client/akun?tab=orders&payment=pending`

## 🔧 API Endpoints

### POST /api/payment/create
Create Midtrans payment transaction

**Request Body:**
```json
{
  "order_id": "uuid-order-id",
  "gross_amount": 100000,
  "customer_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789"
  },
  "item_details": [
    {
      "id": "product-1",
      "name": "Product Name",
      "price": 50000,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "token": "midtrans-snap-token",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
}
```

### POST /api/payment/notification
Webhook untuk menerima notifikasi dari Midtrans

**Request Body:** (Otomatis dari Midtrans)
```json
{
  "order_id": "uuid-order-id",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "gross_amount": "100000.00",
  ...
}
```

## 🔒 Security Notes

- **Jangan commit credentials** ke Git
- **Gunakan HTTPS** di production
- **Validate notification** dengan Midtrans SDK
- **Set IP Whitelist** di Midtrans Dashboard (optional)

## 📚 Resources

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Snap Integration](https://docs.midtrans.com/en/snap/overview)
- [Notification Handler](https://docs.midtrans.com/en/after-payment/http-notification)
- [Testing Payment](https://docs.midtrans.com/en/technical-reference/sandbox-test)

## 🐛 Troubleshooting

### Payment tidak redirect
- Cek apakah `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` sudah di set
- Cek browser console untuk error
- Pastikan Midtrans Snap script ter-load

### Notification tidak diterima
- Pastikan Notification URL sudah di-set di Midtrans Dashboard
- Untuk local testing, gunakan ngrok/localtunnel
- Cek logs di `/api/payment/notification`

### Order status tidak update
- Cek Midtrans Dashboard → Transactions untuk status
- Cek terminal logs untuk notification errors
- Verify notification dengan Midtrans SDK

## Production Checklist

- [ ] Ganti Midtrans credentials ke Production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Update Snap script URL ke production
- [ ] Set production Notification URL
- [ ] Test dengan production payment methods
- [ ] Setup monitoring untuk failed transactions
