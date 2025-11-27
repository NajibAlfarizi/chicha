# 🎫 VOUCHER + MIDTRANS INTEGRATION

## Overview
Sistem voucher terintegrasi penuh dengan Midtrans Payment Gateway. Ketika user menggunakan voucher, **harga final setelah diskon** yang dikirim ke Midtrans, bukan subtotal asli.

---

## 📊 Flow Checkout dengan Voucher

### **1. User Applies Voucher**
```
User → Pilih/Input Voucher → Validate → Apply
Result: appliedVoucher state ter-set dengan discount amount
```

### **2. Ringkasan Pesanan**
```
Subtotal:        Rp 300.000  (harga asli produk)
Diskon Voucher:  - Rp 50.000  (dari voucher)
Ongkir:          Rp 0
─────────────────────────────
Total Bayar:     Rp 250.000  ← Ini yang dikirim ke Midtrans
```

### **3. Midtrans Payment Data**
```javascript
{
  gross_amount: 250000,  // Total AFTER discount
  item_details: [
    {
      id: "PROD-123",
      name: "Product A",
      price: 150000,
      quantity: 1
    },
    {
      id: "PROD-456", 
      name: "Product B",
      price: 150000,
      quantity: 1
    },
    {
      id: "VOUCHER-DISCOUNT",
      name: "Diskon Voucher HEMAT50K",
      price: -50000,  // Negative value = discount
      quantity: 1
    }
  ]
}
```

**Note:** 
- `gross_amount` = Total final yang harus dibayar user
- Item discount ditampilkan sebagai item terpisah dengan **price negative**
- Midtrans akan menampilkan breakdown lengkap di payment page

---

## 🔧 Technical Implementation

### **Client Side (checkout/page.tsx)**

```typescript
// Calculate totals
const getSubtotal = () => {
  return cartItems.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );
};

const getDiscount = () => {
  return appliedVoucher?.discount || 0;
};

const getTotalPrice = () => {
  return getSubtotal() - getDiscount();
};

// Prepare Midtrans payment with voucher
const itemDetails = cartItems.map(item => ({
  id: item.product.id,
  name: item.product.name,
  price: item.product.price,
  quantity: item.quantity,
}));

// Add voucher as negative item
if (appliedVoucher && getDiscount() > 0) {
  itemDetails.push({
    id: 'VOUCHER-DISCOUNT',
    name: `Diskon Voucher ${appliedVoucher.code}`,
    price: -getDiscount(),
    quantity: 1,
  });
}

const paymentData = {
  gross_amount: getTotalPrice(),  // Final price
  customer_details: {...},
  item_details: itemDetails,
};
```

### **Server Side (api/payment/create/route.ts)**

```typescript
const parameter = {
  transaction_details: {
    order_id: order_id,
    gross_amount: gross_amount,  // From client (already discounted)
  },
  item_details: item_details,  // Including VOUCHER-DISCOUNT item
  // ... other params
};

// Log voucher if applied
const voucherItem = item_details.find(
  item => item.id === 'VOUCHER-DISCOUNT'
);
if (voucherItem) {
  console.log('🎫 Voucher discount:', Math.abs(voucherItem.price));
}

const transaction = await snap.createTransaction(parameter);
```

---

## 💡 User Experience

### **Visual Indicators:**

1. **Voucher Applied Section** (Green box)
   ```
   ✅ HEMAT50K
   Potongan Langsung Rp 25.000
   - Rp 50.000
   [Hapus]
   ```

2. **Payment Summary**
   ```
   Subtotal:       Rp 300.000
   🎫 Diskon Voucher: - Rp 50.000  ← Green text
   Ongkir:         Rp 0
   ─────────────────────────────
   Total Bayar:    Rp 250.000  ← Bold amber
   ```

3. **Info Note (for Midtrans)**
   ```
   ✅ Voucher HEMAT50K akan otomatis diterapkan.
   Anda akan membayar Rp 250.000 
   (sudah termasuk diskon Rp 50.000)
   ```

4. **Button Text**
   - Non-Midtrans: "Bayar Sekarang"
   - Midtrans: "Lanjut ke Pembayaran"

---

## 📋 Midtrans Payment Page Display

User akan melihat di Midtrans:

```
════════════════════════════════
  RINCIAN PEMBAYARAN
────────────────────────────────
Product A              Rp 150.000
Product B              Rp 150.000
Diskon Voucher HEMAT50K  -Rp 50.000
════════════════════════════════
TOTAL                  Rp 250.000
════════════════════════════════
```

---

## 🔄 Order Creation Flow

### **1. Midtrans Payment:**
```
Checkout → Midtrans Payment (Rp 250.000) 
  → Success → Create Order with voucher data
  → Track voucher_usage
  → Increment voucher.used counter
```

### **2. COD/Transfer:**
```
Checkout → Create Order immediately with voucher data
  → Track voucher_usage
  → Increment voucher.used counter
```

### **Order Data Structure:**
```javascript
{
  user_id: "...",
  subtotal: 300000,          // Original price
  discount_amount: 50000,     // Voucher discount
  total_amount: 250000,       // Final price
  voucher_id: "uuid-...",
  voucher_code: "HEMAT50K",
  payment_method: "midtrans",
  items: [...]
}
```

---

## ✅ Validation Checks

### **Before Payment:**
1. ✅ Voucher valid (not expired)
2. ✅ Quota available (used < quota)
3. ✅ Min purchase met (subtotal >= min_purchase)
4. ✅ User hasn't used voucher before
5. ✅ Voucher is active

### **After Payment Success:**
1. ✅ Create order with voucher data
2. ✅ Insert voucher_usage record
3. ✅ Increment voucher.used counter
4. ✅ Clear cart and pending_order

---

## 🧪 Testing Checklist

- [ ] Apply voucher → See discount in summary
- [ ] See green info note for Midtrans
- [ ] Total matches: subtotal - discount = final
- [ ] Midtrans shows discount as separate line
- [ ] Payment amount = final total (discounted)
- [ ] After success: order created with voucher data
- [ ] voucher.used incremented
- [ ] voucher_usage record created
- [ ] User cannot use same voucher again

---

## 🐛 Debug Console Logs

```
🎫 Fetching vouchers from API...
🎫 Vouchers count: 5
🛒 Preparing checkout: {subtotal: 300000, discount: 50000, total: 250000}
💳 Creating Midtrans payment: {gross_amount: 250000, item_details: [...]}
🎫 Voucher discount applied: {discount_amount: 50000, final_amount: 250000}
💳 Payment result: {token: "...", redirect_url: "..."}
```

---

## 🎯 Expected Results

1. **User sees accurate pricing** with voucher discount
2. **Midtrans receives correct final amount** (after discount)
3. **Payment breakdown is transparent** (shows discount line)
4. **Order records correct voucher data** for tracking
5. **Voucher quota managed properly** (prevent overuse)

---

## 📝 Notes

- **Negative price** di Midtrans adalah cara standard untuk discount/refund
- **gross_amount** harus match dengan sum of all item_details
- **Voucher discount** ditampilkan sebagai item terpisah untuk transparency
- **Single voucher** per transaction (tidak bisa stack voucher)
- **Voucher validation** di backend untuk security

---

**Status:** ✅ Fully Implemented & Integrated
**Last Updated:** November 13, 2025
