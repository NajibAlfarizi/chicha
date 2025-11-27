# 🚀 PANDUAN SETUP MIDTRANS PAYMENT - Step by Step

## 📋 Overview
Panduan lengkap setup Midtrans Payment Gateway untuk Chicha Mobile dari nol sampai testing berhasil.

---

## ✅ STEP 1: Registrasi Midtrans Account

### 1.1 Buat Akun Midtrans
1. Buka https://dashboard.midtrans.com/register
2. Pilih "Sign Up" jika belum punya akun
3. Isi form registrasi:
   - Email
   - Password
   - Nama Bisnis: **Chicha Mobile**
   - Jenis Bisnis: **E-commerce**
   - Phone number
4. Verify email
5. Login ke Dashboard

### 1.2 Lengkapi Profile Merchant
1. Dashboard → **Settings** → **General Settings**
2. Isi informasi merchant:
   - Merchant Name: **Chicha Mobile**
   - URL: **https://chicha-mobile.me** (atau domain production Anda)
   - Category: **Electronics/Gadgets**
3. Klik **Save**

---

## ✅ STEP 2: Get API Credentials (SANDBOX)

### 2.1 Copy Sandbox Credentials
1. Di Midtrans Dashboard, pastikan mode **SANDBOX** aktif (toggle di kanan atas)
2. Go to **Settings** → **Access Keys**
3. Copy credentials berikut:

```
Server Key (Sandbox): SB-Mid-server-xxxxxxxxxxxx
Client Key (Sandbox): SB-Mid-client-xxxxxxxxxxxx
```

### 2.2 Update Environment Variables
Edit file **`.env.local`** di root project:

```bash
# Midtrans Configuration (SANDBOX)
MIDTRANS_SERVER_KEY=SB-Mid-server-tCnjf6iH24ROzsRc4RJf2Ziu
MIDTRANS_CLIENT_KEY=SB-Mid-client-Az8F2oTrOqQn7i2B
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-Az8F2oTrOqQn7i2B

# App URL (production)
NEXT_PUBLIC_APP_URL=https://chicha-mobile.me
```

**⚠️ IMPORTANT:**
- Jangan commit `.env.local` ke Git (sudah ada di `.gitignore`)
- Ganti `xxxxxxxxxxxx` dengan credentials Anda
- `MIDTRANS_IS_PRODUCTION=false` untuk sandbox

---

## ✅ STEP 3: Configure Notification URL

### 3.1 Setup untuk Local Testing (RECOMMENDED)

**Option A: Menggunakan Localtunnel (Gratis & Mudah)**

1. **Install localtunnel globally:**
   ```bash
   npm install -g localtunnel
   ```

2. **Jalankan Next.js development server:**
   ```bash
   npm run dev
   ```

3. **Di terminal baru, jalankan localtunnel:**
   ```bash
   lt --port 3000 --subdomain chicha-mobile-test
   ```

4. **Copy URL yang muncul:**
   ```
   your url is: https://chicha-mobile-test.loca.lt
   ```

5. **Set Notification URL di Midtrans:**
   - Go to **Settings** → **Configuration**
   - Set **Payment Notification URL**:
     ```
     https://chicha-mobile-test.loca.lt/api/payment/notification
     ```
   - Set **Finish Redirect URL**:
     ```
     https://chicha-mobile-test.loca.lt/client/checkout/success
     ```
   - Set **Error Redirect URL**:
     ```
     https://chicha-mobile-test.loca.lt/client/checkout/error
     ```
   - Set **Unfinish Redirect URL**:
     ```
     https://chicha-mobile-test.loca.lt/client/checkout/error
     ```
   - Klik **Save**

**Option B: Menggunakan Ngrok (Alternative)**

1. **Install ngrok:**
   - Download dari https://ngrok.com/download
   - Extract dan tambahkan ke PATH

2. **Jalankan ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy URL forwarding:**
   ```
   Forwarding: https://xxxx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:3000
   ```

4. **Set Notification URL** sama seperti Option A, tapi ganti dengan ngrok URL

### 3.2 Setup untuk Production

**Untuk Production (setelah deploy ke Vercel/hosting):**

1. **Set Notification URL:**
   ```
   https://chicha-mobile.me/api/payment/notification
   ```

2. **Set Redirect URLs:**
   - Finish: `https://chicha-mobile.me/client/checkout/success`
   - Error: `https://chicha-mobile.me/client/checkout/error`
   - Unfinish: `https://chicha-mobile.me/client/checkout/error`

---

## ✅ STEP 4: Verify Setup

### 4.1 Check Environment Variables
Jalankan di terminal:

```bash
node -e "console.log(process.env.MIDTRANS_SERVER_KEY ? '✅ Server Key OK' : '❌ Server Key Missing')"
node -e "console.log(process.env.MIDTRANS_CLIENT_KEY ? '✅ Client Key OK' : '❌ Client Key Missing')"
```

### 4.2 Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 4.3 Check Console Logs
Buka https://chicha-mobile.me dan check browser console, harusnya tidak ada error terkait Midtrans.

---

## ✅ STEP 5: Testing Payment Flow

### 5.1 Test dengan Credit Card (Sandbox)

1. **Buka website:** https://chicha-mobile.me
2. **Login/Register** sebagai customer
3. **Add product to cart**
4. **Go to Checkout** → Isi informasi customer
5. **Pilih payment method:** Midtrans Payment Gateway
6. **Klik "Lanjut ke Pembayaran"**
7. **Di Midtrans Snap page, pilih Credit Card:**

   **Test Card untuk SUCCESS:**
   ```
   Card Number: 4811 1111 1111 1114
   CVV: 123
   Exp Date: 01/30
   OTP/3D Secure: 112233
   ```

8. **Verify redirect ke Success page** dengan order details

### 5.2 Test Payment Methods Lain

**Bank Transfer BCA:**
```
1. Pilih "Bank Transfer" → BCA
2. Midtrans akan generate VA Number
3. Di Sandbox, otomatis bisa "Bayar" (ada button untuk simulate payment)
```

**GoPay:**
```
1. Pilih "GoPay"
2. Midtrans akan generate QR code
3. Di Sandbox, klik "Simulate Payment" untuk sukses
```

**ShopeePay:**
```
1. Pilih "ShopeePay"
2. Midtrans redirect ke ShopeePay page
3. Di Sandbox, klik "Bayar" untuk sukses
```

### 5.3 Test Error Scenarios

**Test DECLINED Payment:**
```
Card Number: 5211 1111 1111 1117
CVV: 123
Exp Date: 01/30

Expected: Payment declined → Redirect ke error page
```

**Test CANCELLED Payment:**
```
1. Pilih payment method apapun
2. Klik "Cancel" atau close payment page
3. Expected: Redirect ke error page
```

---

## ✅ STEP 6: Verify in Midtrans Dashboard

### 6.1 Check Transaction
1. Login ke Midtrans Dashboard
2. Go to **Transactions**
3. Cari order dengan Order ID yang baru dibuat
4. Verify:
   - ✅ Status: **settlement** (jika success)
   - ✅ Amount: Match dengan total order
   - ✅ Payment Method: Sesuai yang dipilih

### 6.2 Check Transaction Details
Klik transaction untuk lihat details:
- Customer info
- Item details
- Payment timeline
- Notification history

---

## 🧪 TESTING CHECKLIST

### Checkout Flow:
- [ ] User bisa add products to cart
- [ ] User bisa isi customer information
- [ ] User bisa pilih Midtrans payment
- [ ] Redirect ke Midtrans Snap page berhasil
- [ ] Midtrans Snap page menampilkan payment methods

### Payment Success:
- [ ] Payment dengan Credit Card berhasil
- [ ] Redirect ke Success page berhasil
- [ ] Order tersimpan di database dengan status correct
- [ ] Stock produk berkurang
- [ ] User menerima order details
- [ ] Transaction muncul di Midtrans Dashboard

### Payment Error:
- [ ] Payment declined redirect ke Error page
- [ ] Payment cancelled redirect ke Error page
- [ ] Error page menampilkan error message
- [ ] Order TIDAK tersimpan jika payment gagal
- [ ] Stock TIDAK berkurang jika payment gagal

### Voucher Integration:
- [ ] Apply voucher di checkout berhasil
- [ ] Discount ditampilkan di order summary
- [ ] Midtrans menerima amount AFTER discount
- [ ] Midtrans menampilkan discount sebagai item terpisah
- [ ] Voucher usage tracked setelah payment success

### Notification Webhook:
- [ ] Notification URL accessible dari luar (localtunnel/ngrok)
- [ ] Webhook received di `/api/payment/notification`
- [ ] Order status updated sesuai notification
- [ ] Console logs menampilkan notification details

---

## 🐛 TROUBLESHOOTING

### Problem: "Midtrans is not defined"
**Solution:**
```tsx
// Add Midtrans Snap script di app/layout.tsx atau page
<Script 
  src="https://app.sandbox.midtrans.com/snap/snap.js" 
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
/>
```

### Problem: Redirect tidak berfungsi
**Solution:**
1. Check `.env.local` → `NEXT_PUBLIC_APP_URL` sudah benar
2. Check Midtrans Dashboard → Configuration → Redirect URLs sudah di-set
3. Check browser console untuk error

### Problem: Notification tidak diterima
**Solution:**
1. Pastikan localtunnel/ngrok running
2. Check Midtrans Dashboard → Configuration → Notification URL sudah benar
3. Test notification URL dengan curl:
   ```bash
   curl -X POST https://chicha-mobile.me/api/payment/notification \
     -H "Content-Type: application/json" \
     -d '{"order_id":"test","transaction_status":"settlement"}'
   ```

### Problem: Order tidak tersimpan
**Solution:**
1. Check browser localStorage → apakah ada `pending_order`?
2. Check console logs di Success page
3. Check API response di Network tab
4. Verify database connection

### Problem: Stock tidak berkurang
**Solution:**
1. Check `/api/orders` route → stock update logic
2. Check console logs untuk errors
3. Verify Supabase permissions

---

## 🔐 SECURITY CHECKLIST

- [ ] `.env.local` ada di `.gitignore`
- [ ] Credentials tidak di-commit ke Git
- [ ] Menggunakan HTTPS di production
- [ ] Server Key hanya di server-side (tidak exposed ke client)
- [ ] Notification webhook validate signature (Midtrans SDK)
- [ ] Rate limiting untuk API endpoints (optional)

---

## 🚀 PRODUCTION DEPLOYMENT

### Before Going Live:

1. **Get Production Credentials:**
   - Login Midtrans Dashboard
   - Switch to **PRODUCTION** mode
   - Copy Production Server Key & Client Key
   - Submit for approval (bisa butuh verifikasi dokumen)

2. **Update Environment Variables:**
   ```bash
   MIDTRANS_SERVER_KEY=Mid-server-PRODUCTION_KEY
   MIDTRANS_CLIENT_KEY=Mid-client-PRODUCTION_KEY
   MIDTRANS_IS_PRODUCTION=true
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-PRODUCTION_KEY
   NEXT_PUBLIC_APP_URL=https://chicha-mobile.me
   ```

3. **Update Midtrans Configuration:**
   - Switch to Production mode
   - Set Production Notification URL: `https://chicha-mobile.me/api/payment/notification`
   - Set Production Redirect URLs

4. **Update Snap Script:**
   ```tsx
   // Change from sandbox to production
   <Script src="https://app.midtrans.com/snap/snap.js" />
   ```

5. **Test with REAL Payment:**
   - Use real credit card (small amount first!)
   - Verify transaction di Production Dashboard
   - Verify order created correctly

6. **Monitor Transactions:**
   - Setup alerts untuk failed transactions
   - Monitor webhook delivery
   - Check logs regularly

---

## 📊 MONITORING & ANALYTICS

### Metrics to Track:
- **Payment Success Rate:** (successful / total) × 100%
- **Average Payment Time:** Time from checkout to settlement
- **Popular Payment Methods:** Which methods used most
- **Failed Payment Reasons:** Why payments fail
- **Webhook Delivery Rate:** How many webhooks received

### Tools:
- Midtrans Dashboard → Analytics
- Supabase Dashboard → Database insights
- Vercel Analytics (if deployed on Vercel)
- Google Analytics (optional)

---

## 📞 SUPPORT & RESOURCES

### Midtrans Support:
- **Email:** support@midtrans.com
- **WhatsApp Business:** +62 21 2927 8888
- **Docs:** https://docs.midtrans.com/
- **Status Page:** https://status.midtrans.com/

### Chicha Mobile Docs:
- `MIDTRANS-SETUP.md` - Basic setup guide
- `VOUCHER-MIDTRANS-INTEGRATION.md` - Voucher integration details
- `BUG-FIXES-NOVEMBER-2025.md` - Known issues and fixes

---

## ✅ QUICK START SUMMARY

```bash
# 1. Update .env.local with Midtrans credentials
# 2. Install dependencies (if needed)
npm install

# 3. Start development server
npm run dev

# 4. In new terminal, start localtunnel
lt --port 3000 --subdomain chicha-mobile-test

# 5. Set Notification URL in Midtrans Dashboard
# https://chicha-mobile-test.loca.lt/api/payment/notification

# 6. Test payment flow
# - Add to cart
# - Checkout with Midtrans
# - Use test card: 4811 1111 1111 1114
# - Verify success page
```

**That's it! 🎉**

---

**Last Updated:** November 27, 2025
**Version:** 1.0
**Status:** ✅ Ready for Testing
