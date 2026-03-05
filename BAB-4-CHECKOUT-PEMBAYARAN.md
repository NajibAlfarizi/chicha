# BAB 4 - IMPLEMENTASI SISTEM

## 4.6 Implementasi Halaman Checkout dan Pembayaran

### 4.6.1 Deskripsi Umum

Halaman checkout merupakan tahap akhir proses pembelian dimana pelanggan memasukkan informasi pengiriman, memilih metode pembayaran, dan menerapkan voucher diskon jika tersedia. Halaman ini dirancang untuk mengintegrasikan payment gateway Midtrans yang mendukung berbagai metode pembayaran seperti kartu kredit, e-wallet, transfer bank, dan QRIS.

### 4.6.2 Auto-fill Informasi Pelanggan

Ketika halaman dibuka, sistem secara otomatis memuat data keranjang dari localStorage dan mengisi form customer info dengan data akun yang sedang login dengan potongan kode berikut.

```typescript
const loadCheckoutData = async () => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    setCartItems(JSON.parse(savedCart));
  }

  if (user) {
    setCustomerInfo(prev => ({
      ...prev,
      name: user.name || '',
      phone: user.phone || user.email || '',
    }));
  }
};
```

Fungsi `loadCheckoutData()` membaca data keranjang dari penyimpanan lokal browser dan mengisi form dengan informasi akun. Pendekatan auto-fill ini mengurangi usaha pelanggan dalam mengisi form berulang kali.

### 4.6.3 Sistem Validasi Voucher

Sistem menyediakan dua cara untuk menerapkan voucher: memilih dari dropdown atau memasukkan kode secara manual. Validasi voucher dilakukan dengan mengirim request ke server dengan potongan kode berikut.

```typescript
const applyVoucher = async () => {
  const voucherCode = manualVoucherCode || vouchers.find(v => v.id === selectedVoucherId)?.code;
  
  try {
    const res = await fetch('/api/vouchers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        voucher_code: voucherCode,
        subtotal: getSubtotal(),
        user_id: user?.id 
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setAppliedVoucher(data.voucher);
      toast.success(`Voucher ${data.voucher.code} berhasil diterapkan!`);
    } else {
      toast.error(data.error || 'Voucher tidak valid');
    }
  } catch (err) {
    toast.error('Gagal menerapkan voucher');
  }
};
```

Fungsi `applyVoucher()` mengirim kode voucher ke server untuk validasi. Server memeriksa kode voucher valid, belum expired, kuota tersedia, dan subtotal memenuhi minimum purchase. Jika valid, voucher diterapkan dan sistem menampilkan notifikasi berhasil.

### 4.6.4 Metode Pembayaran

Sistem menampilkan berbagai metode pembayaran yang disediakan Midtrans: Kartu Kredit/Debit, GoPay, Transfer Bank, dan QRIS. Setiap metode ditampilkan sebagai card yang dapat diklik dengan feedback visual berupa border amber untuk metode yang dipilih.

### 4.6.5 Perhitungan Total dengan Diskon

Sistem menghitung berbagai komponen harga secara otomatis dengan potongan kode berikut.

```typescript
const getSubtotal = () => {
  return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
};

const getDiscount = () => {
  if (!appliedVoucher) return 0;
  
  const subtotal = getSubtotal();
  if (appliedVoucher.discount_type === 'percentage') {
    const discount = (subtotal * appliedVoucher.discount_value) / 100;
    return appliedVoucher.max_discount > 0 
      ? Math.min(discount, appliedVoucher.max_discount)
      : discount;
  }
  return appliedVoucher.discount_value;
};

const getGrandTotal = () => {
  return getSubtotal() - getDiscount();
};
```

Fungsi `getSubtotal()` menjumlahkan harga semua produk dikalikan quantity-nya. Fungsi `getDiscount()` menghitung nilai diskon berdasarkan tipe voucher (percentage atau fixed amount). Fungsi `getGrandTotal()` mengurangi subtotal dengan diskon untuk mendapatkan total akhir yang harus dibayar.

### 4.6.6 Integrasi Midtrans Payment Gateway

Proses checkout mengintegrasikan Midtrans Snap untuk pembayaran. Sistem membuat order di database terlebih dahulu, kemudian meminta payment token dari Midtrans untuk membuka popup pembayaran dengan potongan kode berikut.

```typescript
const handleCheckout = async () => {
  if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
    toast.error('Silakan lengkapi semua informasi pelanggan');
    return;
  }

  try {
    // Create order with pending status
    const paymentExpiredAt = new Date();
    paymentExpiredAt.setHours(paymentExpiredAt.getHours() + 24);
    
    const orderResponse = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        subtotal: getSubtotal(),
        discount_amount: getDiscount(),
        total_amount: getTotalPrice(),
        customer_info: customerInfo,
        voucher_code: appliedVoucher?.code,
        items: cartItems,
        status: 'menunggu pembayaran',
        payment_status: 'pending',
        payment_expired_at: paymentExpiredAt.toISOString(),
      }),
    });

    const { order } = await orderResponse.json();

    // Get payment token from Midtrans
    const itemDetails = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    if (appliedVoucher && getDiscount() > 0) {
      itemDetails.push({
        id: 'VOUCHER-DISCOUNT',
        name: `Diskon Voucher ${appliedVoucher.code}`,
        price: -getDiscount(),
        quantity: 1,
      });
    }

    const paymentResponse = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gross_amount: getTotalPrice(),
        order_id: order.id,
        customer_details: customerInfo,
        item_details: itemDetails,
      }),
    });

    const paymentResult = await paymentResponse.json();

    // Clear cart and open payment popup
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));

    if (!(window as any).snap) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      script.onload = () => openSnapPayment(paymentResult.token, order.id);
      document.body.appendChild(script);
    } else {
      openSnapPayment(paymentResult.token, order.id);
    }
  } catch (error) {
    toast.error('Terjadi kesalahan');
  }
};
```

Fungsi `handleCheckout()` membuat order di database dengan status "menunggu pembayaran" dan waktu kadaluarsa 24 jam. Kemudian sistem menyiapkan detail item untuk Midtrans, menambahkan voucher diskon sebagai item negatif jika ada. Setelah mendapat payment token, keranjang dikosongkan dan script Midtrans Snap dimuat secara lazy loading. Popup pembayaran dibuka dengan callback handler untuk menangani status success, pending, error, dan close.

```typescript
const openSnapPayment = (token: string, orderId: string) => {
  const snap = (window as any).snap;
  snap.pay(token, {
    onSuccess: (result: any) => router.push(`/client/checkout/success?order_id=${orderId}`),
    onPending: (result: any) => router.push(`/client/akun?tab=orders`),
    onError: (result: any) => toast.error('Pembayaran gagal'),
    onClose: () => router.push(`/client/checkout/pending?order_id=${orderId}`)
  });
};
```

Fungsi `openSnapPayment()` membuka popup pembayaran Midtrans. Callback `onSuccess` redirect ke halaman success, `onPending` ke halaman pesanan, `onError` tampilkan error, dan `onClose` ke halaman pending payment.

### 4.6.7 Kesimpulan

Implementasi halaman checkout mendemonstrasikan integrasi lengkap dengan payment gateway Midtrans. Auto-fill informasi pelanggan mengurangi friction dalam proses checkout. Sistem voucher fleksibel dengan validasi server-side memastikan hanya voucher valid yang dapat diterapkan. Perhitungan harga transparan dengan breakdown detail memberikan kepercayaan kepada pelanggan.

Integrasi Midtrans menggunakan pendekatan lazy loading untuk Snap.js dan callback handler yang lengkap untuk menangani semua status pembayaran. Order dibuat terlebih dahulu dengan status pending untuk tracking yang akurat. Voucher diskon ditambahkan sebagai item negatif ke Midtrans untuk perhitungan yang benar.

---

**Lampiran:**
- **File Terkait:** `app/client/checkout/page.tsx`
- **API Endpoints:** 
  - GET `/api/vouchers?active=true` - Daftar voucher aktif
  - POST `/api/vouchers/validate` - Validasi voucher
  - POST `/api/orders` - Buat order dengan status pending
  - POST `/api/payment/create` - Generate Midtrans payment token
- **Component Dependencies:** ClientLayout, Card, Input, Button, Select, Textarea, Label
- **Library External:** 
  - Midtrans Snap.js (payment gateway popup)
  - lucide-react (icons: User, Tag, CreditCard, Smartphone, Building2, QrCode, CheckCircle, X)
  - sonner (toast notifications)
- **Environment Variables:**
  - NEXT_PUBLIC_MIDTRANS_CLIENT_KEY - Client key untuk autentikasi Midtrans
- **Payment Methods:** Credit Card, GoPay, Bank Transfer, QRIS
- **Midtrans Snap URL:** https://app.sandbox.midtrans.com/snap/snap.js (Sandbox)
- **Voucher Types:** percentage (dengan max_discount), fixed amount
- **Midtrans Callbacks:** onSuccess, onPending, onError, onClose
