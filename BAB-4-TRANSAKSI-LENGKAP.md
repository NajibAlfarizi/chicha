# BAB 4 - IMPLEMENTASI SISTEM (Lanjutan)

## 4.4 Implementasi Halaman Keranjang Belanja

### 4.4.1 Deskripsi Umum

Halaman keranjang belanja merupakan tempat pelanggan meninjau produk-produk yang telah dipilih sebelum melanjutkan ke proses pembayaran. Halaman ini dirancang untuk menampilkan ringkasan produk, memungkinkan pengaturan jumlah pembelian, penghapusan item, dan navigasi ke proses checkout. Dengan demikian, halaman keranjang berfungsi sebagai tahap verifikasi sebelum pelanggan melakukan transaksi pembelian.

**File Implementasi:** `app/client/keranjang/page.tsx`

Untuk mendukung fungsionalitas keranjang, sistem menyimpan informasi berikut:

```typescript
const [cartItems, setCartItems] = useState<CartItem[]>(() => {
  // Initialize cart from localStorage with migration
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const rawData = JSON.parse(savedCart);
        const migratedData = migrateCartData(rawData);
        localStorage.setItem('cart', JSON.stringify(migratedData));
        return migratedData;
      } catch (error) {
        console.error('❌ Error parsing cart data:', error);
        return [];
      }
    }
  }
  return [];
});
```

Variabel `cartItems` menyimpan seluruh produk yang ada di keranjang beserta jumlahnya. Sistem membaca data dari penyimpanan lokal browser saat halaman pertama kali dibuka, sehingga keranjang tetap ada meskipun pelanggan menutup atau me-refresh halaman.

### 4.4.2 Pengelolaan Data Keranjang

Sistem menyediakan beberapa fungsi untuk mengelola isi keranjang:

```typescript
const updateQuantity = (productId: string, newQuantity: number) => {
  if (newQuantity < 1) return;
  
  const updatedCart = cartItems.map(item =>
    item.product.id === productId
      ? { ...item, quantity: Math.min(newQuantity, item.product.stock) }
      : item
  );
  updateCart(updatedCart);
};

const removeItem = (productId: string) => {
  const updatedCart = cartItems.filter(item => item.product.id !== productId);
  updateCart(updatedCart);
};

const clearCart = () => {
  updateCart([]);
};
```

Fungsi `updateQuantity()` mengubah jumlah produk tertentu dengan validasi agar tidak melebihi stok yang tersedia dan tidak kurang dari 1. Fungsi `removeItem()` menghapus produk dari keranjang berdasarkan ID produk. Sedangkan `clearCart()` mengosongkan seluruh isi keranjang sekaligus.

### 4.4.3 Perhitungan Total dan Ringkasan

Sistem menghitung total harga dan jumlah item secara otomatis:

```typescript
const getTotalPrice = () => {
  return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const getTotalItems = () => {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};
```

Fungsi `getTotalPrice()` menjumlahkan harga semua produk dikalikan dengan jumlahnya masing-masing. Fungsi `getTotalItems()` menghitung total jumlah item dalam keranjang dengan menjumlahkan quantity dari setiap produk.

### 4.4.4 Tampilan Daftar Produk dalam Keranjang

Setiap produk dalam keranjang ditampilkan lengkap dengan gambar, informasi produk, dan kontrol jumlah:

```typescript
<div className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border">
  {/* Product Image */}
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center">
    {item.product.image_url ? (
      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded" />
    ) : (
      <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-slate-400" />
    )}
  </div>

  {/* Product Info & Controls */}
  <div className="flex-1 flex flex-col sm:flex-row gap-3">
    <div className="flex-1 min-w-0">
      <h3 className="text-slate-900 dark:text-white font-semibold mb-1 text-sm md:text-base truncate">
        {item.product.name}
      </h3>
      <p className="text-amber-500 font-bold text-base md:text-lg">
        Rp {item.product.price.toLocaleString('id-ID')}
      </p>
      <p className="text-slate-500 text-xs mt-1">Stok: {item.product.stock}</p>
    </div>

    {/* Quantity Controls */}
    <div className="flex sm:flex-col items-center justify-between gap-2">
      <Button size="sm" onClick={() => removeItem(item.product.id)} className="border-red-500 text-red-500">
        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
          <Minus className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
          className="w-12 md:w-16 h-7 md:h-8 text-center"
          min="1"
          max={item.product.stock}
        />
        <Button size="sm" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
          <Plus className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>

      <p className="font-semibold text-sm md:text-base">
        Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
      </p>
    </div>
  </div>
</div>
```

Setiap kartu produk menampilkan gambar produk di sisi kiri, informasi nama dan harga di tengah, serta kontrol jumlah di sisi kanan. Kontrol jumlah terdiri dari tombol minus, input angka, dan tombol plus. Tombol hapus ditampilkan untuk memudahkan penghapusan produk dari keranjang. Harga per item ditampilkan sebagai hasil perkalian harga satuan dengan jumlah yang dipilih.

### 4.4.5 Panel Ringkasan Pesanan

Di sisi kanan halaman, terdapat panel yang menampilkan ringkasan total pesanan:

```typescript
<Card className="lg:sticky lg:top-24">
  <CardHeader>
    <CardTitle>Ringkasan Pesanan</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Subtotal ({getTotalItems()} item)</span>
        <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
      </div>
      <div className="flex justify-between">
        <span>Biaya Admin</span>
        <span>Rp 0</span>
      </div>
      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-amber-500">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>

    <Link href="/client/checkout">
      <Button className="w-full bg-amber-500 hover:bg-amber-600">
        Lanjut ke Checkout
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>

    <Link href="/client/produk">
      <Button variant="outline" className="w-full">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Lanjut Belanja
      </Button>
    </Link>
  </CardContent>
</Card>
```

Panel ringkasan menampilkan subtotal berdasarkan jumlah item, biaya admin (saat ini Rp 0), dan total akhir yang harus dibayar. Dua tombol utama disediakan: tombol "Lanjut ke Checkout" untuk melanjutkan proses pembelian, dan tombol "Lanjut Belanja" untuk kembali ke katalog produk.

### 4.4.6 Kondisi Keranjang Kosong

Ketika tidak ada produk dalam keranjang, sistem menampilkan pesan informatif:

```typescript
{cartItems.length === 0 ? (
  <Card>
    <CardContent className="py-16 md:py-20 text-center">
      <ShoppingCart className="h-16 w-16 md:h-20 md:w-20 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg md:text-xl mb-2">Keranjang Kosong</h3>
      <p className="text-slate-600 mb-6">Belum ada produk di keranjang Anda</p>
      <Link href="/client/produk">
        <Button className="bg-amber-500 hover:bg-amber-600">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Mulai Belanja
        </Button>
      </Link>
    </CardContent>
  </Card>
) : (
  // Tampilan daftar produk
)}
```

Tampilan keranjang kosong menampilkan icon keranjang besar, pesan "Keranjang Kosong", dan tombol untuk mulai berbelanja yang mengarahkan langsung ke halaman katalog produk.

---

## 4.5 Implementasi Halaman Tracking Servis

### 4.5.1 Deskripsi Umum

Halaman tracking servis memungkinkan pelanggan melacak status perbaikan perangkat mereka menggunakan kode servis yang diberikan saat booking. Halaman ini dirancang untuk memberikan transparansi dan informasi real-time tentang progress perbaikan. Dengan demikian, pelanggan dapat mengetahui kapan perangkat mereka selesai diperbaiki tanpa harus menghubungi pihak toko.

**File Implementasi:** `app/client/track/page.tsx`

Sistem menyimpan informasi pencarian dan hasil tracking:

```typescript
const [code, setCode] = useState('');
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<Booking | null>(null);
```

Variabel `code` menyimpan kode servis yang diinput pelanggan, `loading` sebagai indikator proses pencarian, dan `result` menyimpan data booking yang ditemukan.

### 4.5.2 Proses Pencarian dengan Kode Servis

Fungsi pencarian menghubungi server untuk mencari data booking berdasarkan kode:

```typescript
const handleTrack = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!code) {
    toast.error('Masukkan kode service');
    return;
  }

  try {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/bookings/track?service_code=${encodeURIComponent(code)}`);
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || 'Booking tidak ditemukan');
      setResult(null);
      return;
    }

    setResult(data.booking);
  } catch (err) {
    console.error('Track error:', err);
    toast.error('Terjadi kesalahan, coba lagi');
  } finally {
    setLoading(false);
  }
};
```

Fungsi `handleTrack()` memvalidasi bahwa kode tidak kosong, kemudian mengirim permintaan ke server dengan kode yang diinput. Jika booking ditemukan, data akan disimpan dan ditampilkan. Jika tidak ditemukan atau terjadi error, sistem menampilkan pesan error yang sesuai.

### 4.5.3 Form Input Kode Servis

Halaman menyediakan form sederhana untuk memasukkan kode servis:

```typescript
<Card className="border-amber-500/20 shadow-sm">
  <CardHeader>
    <CardTitle>Cari dengan Kode Service</CardTitle>
    <CardDescription>Contoh: SRV-20251105-A3F9</CardDescription>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleTrack} className="space-y-4">
      <div>
        <Label htmlFor="service_code">Kode Service</Label>
        <Input
          id="service_code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Masukkan kode service"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => handleTrack()} className="bg-amber-500 hover:bg-amber-600">
          {loading ? 'Mencari...' : 'Lacak'}
        </Button>
        <Button variant="outline" onClick={() => { setCode(''); setResult(null); }}>
          Reset
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
```

Form menampilkan contoh format kode servis untuk membantu pelanggan. Input kode dapat langsung dikirim dengan menekan tombol "Lacak" atau tombol Enter. Tombol "Reset" disediakan untuk membersihkan input dan hasil pencarian sebelumnya.

### 4.5.4 Tampilan Status Perbaikan

Ketika booking ditemukan, sistem menampilkan informasi lengkap status perbaikan:

```typescript
{result ? (
  <div className="mt-4 space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{result.device_name}</h3>
        <p className="text-sm">{result.issue}</p>
      </div>
      <div className="text-right">
        <div className="mb-1">{statusBadge(result.progress_status)}</div>
        <div className="text-xs text-muted-foreground">{result.service_code}</div>
      </div>
    </div>

    <div className="bg-muted/30 p-3 rounded-lg border">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-amber-600" />
        <div>
          <div className="font-semibold">{result.user?.name || '-'}</div>
          <div className="text-muted-foreground text-xs">{result.user?.phone || result.user?.email || ''}</div>
        </div>
      </div>

      <div className="mt-3 text-sm">
        <div><strong>Estimasi selesai:</strong> {result.estimated_completion ? new Date(result.estimated_completion).toLocaleDateString('id-ID') : '-'}</div>
        <div><strong>Progress notes:</strong> {result.progress_notes || '-'}</div>
        <div><strong>Tanggal booking:</strong> {new Date(result.booking_date).toLocaleDateString('id-ID')}</div>
        {result.teknisi && (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-amber-600" />
            <div>
              <div className="font-semibold">{result.teknisi.name}</div>
              <div className="text-xs">{result.teknisi.phone || ''} {result.teknisi.specialization ? `• ${result.teknisi.specialization}` : ''}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
) : (
  <div className="mt-4 text-muted-foreground flex items-center gap-2">
    <AlertCircle className="h-5 w-5 text-amber-600" />
    <div>Masukkan kode service untuk mulai tracking.</div>
  </div>
)}
```

Hasil pencarian menampilkan nama perangkat, keluhan, status progress (dengan badge berwarna), kode servis, informasi pelanggan, estimasi waktu selesai, catatan progress, tanggal booking, dan informasi teknisi yang menangani. Jika belum ada pencarian, ditampilkan pesan panduan untuk memasukkan kode servis.

### 4.5.5 Badge Status dengan Warna

Sistem menggunakan badge berwarna untuk menunjukkan status perbaikan secara visual:

```typescript
const statusBadge = (status?: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-500/20 text-yellow-500">Pending</Badge>;
    case 'diagnosed':
      return <Badge className="bg-blue-500/20 text-blue-500">Diagnosed</Badge>;
    case 'in_progress':
      return <Badge className="bg-purple-500/20 text-purple-500">In Progress</Badge>;
    case 'waiting_parts':
      return <Badge className="bg-orange-500/20 text-orange-500">Waiting Parts</Badge>;
    case 'completed':
      return <Badge className="bg-green-500/20 text-green-500">Completed</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500/20 text-red-500">Cancelled</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};
```

Setiap status memiliki warna yang berbeda: kuning untuk pending (menunggu), biru untuk diagnosed (sudah didiagnosa), ungu untuk in progress (sedang dikerjakan), orange untuk waiting parts (menunggu spare part), hijau untuk completed (selesai), dan merah untuk cancelled (dibatalkan). Pembedaan warna membantu pelanggan memahami status dengan cepat tanpa harus membaca teks.

---

## 4.6 Implementasi Halaman Checkout dan Pembayaran

### 4.6.1 Deskripsi Umum

Halaman checkout merupakan tahap akhir sebelum pembayaran di mana pelanggan mengisi informasi pengiriman, memilih metode pembayaran, dan menerapkan voucher diskon jika ada. Halaman ini dirancang sebagai proses yang smooth dan aman untuk menyelesaikan transaksi pembelian. Dengan demikian, pelanggan dapat melakukan pembayaran dengan nyaman melalui berbagai metode yang disediakan.

**File Implementasi:** `app/client/checkout/page.tsx`

Sistem menyimpan berbagai informasi yang dibutuhkan untuk proses checkout:

```typescript
const [cartItems, setCartItems] = useState<CartItem[]>([]);
const [loading, setLoading] = useState(false);
const [paymentMethod, setPaymentMethod] = useState('midtrans');
const [customerInfo, setCustomerInfo] = useState({
  name: '',
  email: '',
  phone: '',
  address: '',
});

// Voucher state
const [voucherCode, setVoucherCode] = useState('');
const [voucherLoading, setVoucherLoading] = useState(false);
const [appliedVoucher, setAppliedVoucher] = useState<{
  id: string;
  code: string;
  name: string;
  discount: number;
} | null>(null);
const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
```

Variabel `cartItems` menyimpan produk dari keranjang, `customerInfo` menyimpan data pelanggan yang akan diisi, `paymentMethod` menyimpan metode pembayaran yang dipilih (default: Midtrans), dan variabel-variabel voucher menyimpan informasi tentang voucher yang tersedia dan yang sudah diterapkan.

### 4.6.2 Pengisian Otomatis Data Pelanggan

Saat halaman dibuka, sistem mengambil data profil pelanggan untuk mengisi form secara otomatis:

```typescript
useEffect(() => {
  if (!isAuthenticated || !user) {
    toast.error('Login diperlukan');
    router.push('/auth/login?redirect=/client/checkout');
    return;
  }

  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    const cart = JSON.parse(savedCart);
    if (cart.length === 0) {
      router.push('/client/keranjang');
    }
    setCartItems(cart);
  } else {
    router.push('/client/keranjang');
  }

  // Fetch available vouchers
  fetchAvailableVouchers();

  // Auto-fill from user profile
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setCustomerInfo({
          name: data.profile.name || '',
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  fetchProfile();
}, [router, isAuthenticated, user]);
```

Sistem memvalidasi bahwa pengguna sudah login dan keranjang tidak kosong. Data profil pelanggan diambil dari server dan otomatis mengisi form informasi pelanggan. Daftar voucher yang tersedia juga diambil untuk ditampilkan di dropdown pemilihan voucher.

### 4.6.3 Sistem Voucher Diskon

#### 4.6.3.1 Pengambilan Daftar Voucher Tersedia

Sistem mengambil voucher yang belum digunakan oleh pelanggan:

```typescript
const fetchAvailableVouchers = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const localUser = JSON.parse(userStr);
    const userId = localUser.id;

    const response = await fetch(`/api/vouchers?user_id=${userId}`);
    const data = await response.json();
    setAvailableVouchers(data.vouchers || []);
  } catch (error) {
    console.error('❌ Error fetching vouchers:', error);
  }
};
```

Fungsi `fetchAvailableVouchers()` mengambil daftar voucher yang aktif dan belum pernah digunakan oleh pelanggan tersebut. Voucher ditampilkan dalam dropdown untuk memudahkan pemilihan.

#### 4.6.3.2 Validasi dan Penerapan Voucher

Pelanggan dapat menerapkan voucher dengan dua cara: memilih dari dropdown atau memasukkan kode manual:

```typescript
const handleApplyVoucher = async () => {
  if (!voucherCode.trim()) {
    toast.error('Masukkan kode voucher');
    return;
  }

  setVoucherLoading(true);

  try {
    const response = await fetch('/api/vouchers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: voucherCode.trim(),
        subtotal: getSubtotal(),
      }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      setAppliedVoucher({
        id: data.voucher.id,
        code: data.voucher.code,
        name: data.voucher.name,
        discount: data.discount,
      });
      toast.success(data.message || 'Voucher berhasil diterapkan!');
    } else {
      toast.error(data.error || 'Kode voucher tidak valid');
    }
  } catch (error) {
    console.error('Error applying voucher:', error);
    toast.error('Gagal menerapkan voucher');
  } finally {
    setVoucherLoading(false);
  }
};
```

Fungsi `handleApplyVoucher()` mengirim kode voucher dan subtotal ke server untuk divalidasi. Server memeriksa apakah voucher valid, masih aktif, belum digunakan pengguna tersebut, dan memenuhi syarat minimal pembelian. Jika valid, diskon dihitung dan diterapkan ke total pembayaran.

#### 4.6.3.3 Tampilan Dropdown Voucher

Voucher tersedia ditampilkan dalam dropdown dengan informasi lengkap:

```typescript
<Select
  value=""
  onValueChange={(voucherCode) => {
    if (voucherCode) {
      handleQuickApplyVoucher(voucherCode);
    }
  }}
  disabled={voucherLoading}
>
  <SelectTrigger>
    <SelectValue placeholder="Pilih voucher yang tersedia" />
  </SelectTrigger>
  <SelectContent>
    {availableVouchers.length === 0 ? (
      <SelectItem value="none" disabled>Tidak ada voucher tersedia</SelectItem>
    ) : (
      availableVouchers.map((voucher) => {
        const isEligible = getSubtotal() >= voucher.min_purchase;
        const quotaLeft = voucher.quota - voucher.used;
        const isAvailable = isEligible && quotaLeft > 0;
        
        return (
          <SelectItem key={voucher.id} value={voucher.code} disabled={!isAvailable}>
            <div className="flex flex-col py-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-600">{voucher.code}</span>
                {quotaLeft <= 10 && quotaLeft > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                    Sisa {quotaLeft}
                  </span>
                )}
              </div>
              <span className="text-sm">{voucher.name}</span>
              <span className="text-xs">
                {voucher.type === 'percentage' ? (
                  <>Diskon {voucher.value}%</>
                ) : (
                  <>Potongan Rp {voucher.value.toLocaleString('id-ID')}</>
                )}
                {' • Min. Rp '}{voucher.min_purchase.toLocaleString('id-ID')}
              </span>
              {!isEligible && (
                <span className="text-xs text-red-600">⚠️ Belanja kurang dari minimal</span>
              )}
              {quotaLeft === 0 && (
                <span className="text-xs text-red-600">❌ Kuota habis</span>
              )}
            </div>
          </SelectItem>
        );
      })
    )}
  </SelectContent>
</Select>
```

Setiap voucher ditampilkan dengan kode, nama, jenis diskon (persentase atau nominal), minimal pembelian, dan kuota sisa. Voucher yang tidak memenuhi syarat minimal pembelian atau kuota habis akan ditampilkan dengan status non-aktif dan pesan peringatan yang sesuai.

### 4.6.4 Perhitungan Total dengan Diskon

Sistem menghitung subtotal, diskon, dan total akhir secara otomatis:

```typescript
const getSubtotal = () => {
  return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const getDiscount = () => {
  return appliedVoucher?.discount || 0;
};

const getTotalPrice = () => {
  return getSubtotal() - getDiscount();
};
```

Fungsi `getSubtotal()` menghitung total harga sebelum diskon. Fungsi `getDiscount()` mengambil nilai diskon dari voucher yang diterapkan (0 jika tidak ada voucher). Fungsi `getTotalPrice()` menghitung total akhir dengan mengurangkan diskon dari subtotal.

### 4.6.5 Proses Checkout dengan Midtrans

Ketika pelanggan memilih Midtrans sebagai metode pembayaran, sistem menjalankan proses berikut:

```typescript
const handleCheckout = async () => {
  // Validation
  if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
    toast.error('Data tidak lengkap');
    return;
  }

  setLoading(true);
  
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const orderData = {
      user_id: user.id,
      subtotal: getSubtotal(),
      discount_amount: getDiscount(),
      total_amount: getTotalPrice(),
      payment_method: paymentMethod,
      customer_info: customerInfo,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      voucher_id: appliedVoucher?.id || null,
      voucher_code: appliedVoucher?.code || null,
      items: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    if (paymentMethod === 'midtrans') {
      // Create order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          status: 'menunggu pembayaran',
          payment_status: 'pending',
        }),
      });

      const { order } = await orderResponse.json();

      // Prepare item details for Midtrans
      const itemDetails = cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      // Add voucher discount as negative item if voucher applied
      if (appliedVoucher && getDiscount() > 0) {
        itemDetails.push({
          id: 'VOUCHER-DISCOUNT',
          name: `Diskon Voucher ${appliedVoucher.code}`,
          price: -getDiscount(),
          quantity: 1,
        });
      }

      const paymentData = {
        gross_amount: getTotalPrice(),
        order_id: order.id,
        customer_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        item_details: itemDetails,
      };

      // Create Midtrans payment
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      // Clear cart before opening payment
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

      // Open Midtrans Snap payment popup
      if (paymentResult.token) {
        if (!(window as any).snap) {
          const script = document.createElement('script');
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
          script.onload = () => {
            openSnapPayment(paymentResult.token, order.id);
          };
          document.body.appendChild(script);
        } else {
          openSnapPayment(paymentResult.token, order.id);
        }
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Terjadi kesalahan');
  } finally {
    setLoading(false);
  }
};
```

Proses checkout Midtrans terdiri dari beberapa langkah: validasi data pelanggan, pembuatan order di database dengan status "menunggu pembayaran", persiapan detail item untuk Midtrans (termasuk voucher sebagai item diskon negatif jika ada), pembuatan token pembayaran Midtrans, pengosongan keranjang, dan pembukaan popup Snap Midtrans untuk pembayaran. Sistem ini memastikan order tersimpan di database sebelum pembayaran dilakukan.

### 4.6.6 Handler Snap Midtrans

Popup pembayaran Midtrans menangani berbagai skenario hasil pembayaran:

```typescript
const openSnapPayment = (token: string, orderId: string) => {
  const snap = (window as any).snap;
  
  snap.pay(token, {
    onSuccess: function(result: any) {
      console.log('✅ Payment success:', result);
      router.push(`/client/checkout/success?order_id=${orderId}`);
    },
    onPending: function(result: any) {
      console.log('⏳ Payment pending:', result);
      toast.warning('Pembayaran tertunda');
      router.push(`/client/akun?tab=orders`);
    },
    onError: function(result: any) {
      console.error('❌ Payment error:', result);
      toast.error('Pembayaran gagal');
      setLoading(false);
    },
    onClose: function() {
      console.log('❌ Payment popup closed');
      toast.warning('Pembayaran belum diselesaikan');
      router.push(`/client/checkout/pending?order_id=${orderId}`);
    }
  });
};
```

Handler Snap memiliki empat callback: `onSuccess` dipanggil ketika pembayaran berhasil dan mengarahkan ke halaman success, `onPending` untuk pembayaran yang masih diproses, `onError` untuk pembayaran yang gagal, dan `onClose` ketika pelanggan menutup popup tanpa menyelesaikan pembayaran. Setiap skenario memberikan feedback yang jelas kepada pengguna.

### 4.6.7 Form Informasi Pelanggan

Halaman checkout menyediakan form untuk mengisi atau mengubah informasi pengiriman:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Informasi Pelanggan</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Nama Lengkap</Label>
      <Input
        id="name"
        value={customerInfo.name}
        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
        placeholder="Masukkan nama lengkap"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={customerInfo.email}
        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
        placeholder="email@example.com"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="phone">Nomor HP</Label>
      <Input
        id="phone"
        value={customerInfo.phone}
        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
        placeholder="08xxxxxxxxxx"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="address">Alamat Pengiriman</Label>
      <Input
        id="address"
        value={customerInfo.address}
        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
        placeholder="Masukkan alamat lengkap"
      />
    </div>
  </CardContent>
</Card>
```

Form informasi pelanggan diisi otomatis dari profil yang tersimpan, namun pelanggan dapat mengubahnya sesuai kebutuhan pengiriman. Semua field wajib diisi sebelum dapat melanjutkan ke pembayaran.

### 4.6.8 Pemilihan Metode Pembayaran

Sistem menyediakan dropdown untuk memilih metode pembayaran:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Metode Pembayaran</CardTitle>
  </CardHeader>
  <CardContent>
    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="midtrans">💳 Midtrans Payment Gateway</SelectItem>
        <SelectItem value="cod">💵 Cash on Delivery (COD)</SelectItem>
      </SelectContent>
    </Select>

    <div className="mt-4 bg-blue-50 rounded-lg p-4 border">
      <p className="text-sm">
        {paymentMethod === 'midtrans' && (
          <span>
            💳 <strong>Midtrans Payment Gateway</strong><br/>
            Bayar dengan berbagai metode: Credit Card, Debit Card, GoPay, ShopeePay, QRIS, Bank Transfer (BCA, Mandiri, BNI, BRI, Permata), dan lainnya.
          </span>
        )}
        {paymentMethod === 'cod' && '💵 Bayar saat barang diterima'}
      </p>
    </div>
  </CardContent>
</Card>
```

Pelanggan dapat memilih antara Midtrans Payment Gateway atau COD (Cash on Delivery). Informasi detail tentang metode yang dipilih ditampilkan di bawah dropdown untuk memberikan klarifikasi kepada pelanggan.

### 4.6.9 Panel Ringkasan di Checkout

Panel ringkasan menampilkan semua item, subtotal, diskon voucher, dan total akhir:

```typescript
<Card className="sticky top-24">
  <CardHeader>
    <CardTitle>Ringkasan Pesanan</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Items List */}
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {cartItems.map((item) => (
        <div key={item.product.id} className="flex gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
            {item.product.image_url ? (
              <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded" />
            ) : (
              <ShoppingCart className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{item.product.name}</p>
            <p className="text-xs">{item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}</p>
            <p className="text-sm font-semibold text-amber-600">
              Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>Rp {getSubtotal().toLocaleString('id-ID')}</span>
      </div>
      {appliedVoucher && (
        <div className="flex justify-between text-green-600">
          <span className="flex items-center gap-1">
            <Ticket className="h-4 w-4" />
            Diskon Voucher
          </span>
          <span>- Rp {getDiscount().toLocaleString('id-ID')}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Ongkir</span>
        <span>Rp 0</span>
      </div>
      <div className="border-t pt-2">
        <div className="flex justify-between font-bold text-lg">
          <span>Total Bayar</span>
          <span className="text-amber-600">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>

    <Button
      onClick={handleCheckout}
      disabled={loading || !customerInfo.name || !customerInfo.phone}
      className="w-full bg-amber-500 hover:bg-amber-600"
    >
      {loading ? 'Memproses...' : (paymentMethod === 'midtrans' ? 'Lanjut ke Pembayaran' : 'Bayar Sekarang')}
    </Button>
  </CardContent>
</Card>
```

Panel sticky di sisi kanan menampilkan ringkasan lengkap pesanan dengan scroll jika item banyak. Subtotal, diskon voucher (dengan warna hijau jika ada), ongkir, dan total akhir ditampilkan dengan jelas. Tombol checkout berubah teks dan statusnya tergantung metode pembayaran yang dipilih.

---

## 4.7 Implementasi Halaman Riwayat Pesanan

### 4.7.1 Deskripsi Umum

Halaman riwayat pesanan menampilkan seluruh transaksi pembelian yang pernah dilakukan pelanggan. Halaman ini dirancang untuk memberikan akses mudah ke status pesanan, detail pembayaran, dan kemampuan untuk melanjutkan pembayaran yang tertunda. Dengan demikian, pelanggan dapat memantau seluruh aktivitas pembelian mereka dalam satu tempat.

**File Implementasi:** `app/client/akun/page.tsx` (Tab Orders)

Sistem menyimpan data profil dan riwayat pesanan:

```typescript
const [profile, setProfile] = useState<UserProfile | null>(null);
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [showOrderDetail, setShowOrderDetail] = useState(false);
```

Variabel `profile` menyimpan informasi profil pelanggan, `orders` menyimpan daftar semua pesanan, `loading` sebagai indikator proses pengambilan data, `selectedOrder` menyimpan pesanan yang sedang dilihat detailnya, dan `showOrderDetail` mengontrol tampilan dialog detail pesanan.

### 4.7.2 Pengambilan Data Pesanan

Data pesanan diambil saat halaman dibuka dengan pengurutan khusus:

```typescript
useEffect(() => {
  if (!isAuthenticated || !user) return;

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersRes = await fetch(`/api/orders?user_id=${user.id}`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        // Sort orders: pending payment first, then by created_at desc
        const sortedOrders = (ordersData.orders || []).sort((a: Order, b: Order) => {
          const aPending = a.payment_status === 'pending' || 
            (a.status === 'menunggu pembayaran' && a.payment_method === 'midtrans');
          const bPending = b.payment_status === 'pending' || 
            (b.status === 'menunggu pembayaran' && b.payment_method === 'midtrans');
          
          // Pending payments first
          if (aPending && !bPending) return -1;
          if (!aPending && bPending) return 1;
          
          // Then sort by date
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, [isAuthenticated, user]);
```

Sistem mengambil semua pesanan berdasarkan ID pengguna, kemudian mengurutkannya dengan prioritas: pesanan dengan pembayaran pending ditampilkan paling atas, diikuti pesanan lainnya diurutkan dari yang terbaru. Pengurutan ini membantu pelanggan langsung melihat pesanan yang membutuhkan tindakan lanjutan.

### 4.7.3 Deteksi Pembayaran Kadaluarsa

Sistem mengecek apakah waktu pembayaran sudah habis:

```typescript
const isPaymentExpired = (order: Order) => {
  if (!order.payment_expired_at) {
    // Fallback: if no payment_expired_at, check if more than 24 hours
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }
  
  const expiredAt = new Date(order.payment_expired_at);
  return new Date() > expiredAt;
};

const getRemainingPaymentTime = (order: Order) => {
  if (!order.payment_expired_at) {
    const createdAt = new Date(order.created_at);
    const expiredAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const remaining = expiredAt.getTime() - new Date().getTime();
    return remaining;
  }
  
  const expiredAt = new Date(order.payment_expired_at);
  const remaining = expiredAt.getTime() - new Date().getTime();
  return remaining;
};

const formatRemainingTime = (milliseconds: number) => {
  if (milliseconds <= 0) return 'Expired';
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
};
```

Fungsi `isPaymentExpired()` mengecek apakah waktu pembayaran sudah melewati batas waktu (default 24 jam). Fungsi `getRemainingPaymentTime()` menghitung sisa waktu dalam milidetik. Fungsi `formatRemainingTime()` mengubah milidetik menjadi format yang mudah dibaca (jam dan menit).

### 4.7.4 Tampilan Daftar Pesanan

Setiap pesanan ditampilkan dalam kartu dengan informasi lengkap:

```typescript
{orders.map((order) => {
  const isPendingPayment = order.payment_status === 'pending' || 
    (order.status === 'menunggu pembayaran' && order.payment_method === 'midtrans');
  const expired = isPendingPayment && isPaymentExpired(order);
  const remainingTime = isPendingPayment && !expired ? getRemainingPaymentTime(order) : 0;
  
  return (
    <div 
      key={order.id} 
      className={`rounded-lg p-4 border ${
        isPendingPayment && !expired
          ? 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/30' 
          : expired
          ? 'bg-red-500/5 border-red-500/30'
          : 'bg-muted/30 border'
      }`}
    >
      {isPendingPayment && !expired && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Pembayaran Belum Diselesaikan</span>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Sisa waktu: {formatRemainingTime(remainingTime)}
          </p>
        </div>
      )}
      {expired && (
        <div className="mb-3 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-semibold">Pembayaran Kadaluarsa</span>
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Order ID: {order.id.slice(0, 8)}...</p>
          <p className="font-semibold mt-1">Rp {order.total_amount.toLocaleString('id-ID')}</p>
        </div>
        <div className="text-right">
          <div className="mb-1">{getOrderStatusBadge(order.status)}</div>
          <p className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
})}
```

Kartu pesanan menggunakan warna yang berbeda tergantung status: amber dengan ring untuk pembayaran pending aktif, merah untuk kadaluarsa, dan standard untuk pesanan normal. Peringatan ditampilkan dengan icon dan countdown waktu tersisa untuk pembayaran pending. Order ID (disingkat), total harga, status badge, dan tanggal pemesanan ditampilkan dengan jelas.

### 4.7.5 Badge Status Pesanan

Badge berwarna menunjukkan status pesanan secara visual:

```typescript
const getOrderStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    'menunggu pembayaran': 'bg-amber-500/20 text-amber-600 font-semibold',
    pending: 'bg-yellow-500/20 text-yellow-500',
    dikirim: 'bg-blue-500/20 text-blue-500',
    selesai: 'bg-green-500/20 text-green-500',
    dibatalkan: 'bg-red-500/20 text-red-500',
  };
  
  const labels: Record<string, string> = {
    'menunggu pembayaran': 'Menunggu Pembayaran',
    pending: 'Pending',
    dikirim: 'Dikirim',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  };
  
  return <Badge className={colors[status]}>{labels[status] || status}</Badge>;
};
```

Setiap status memiliki warna yang berbeda untuk memudahkan identifikasi visual: amber untuk menunggu pembayaran, kuning untuk pending, biru untuk dikirim, hijau untuk selesai, dan merah untuk dibatalkan.

### 4.7.6 Tab Sistem untuk Navigasi

Halaman akun menggunakan tab untuk navigasi antar seksi:

```typescript
<Tabs defaultValue={defaultTab} className="space-y-6">
  <TabsList className="w-full grid grid-cols-2 md:flex md:w-auto gap-1">
    <TabsTrigger value="profile">
      <User className="h-4 w-4 mr-2" />
      Profil
    </TabsTrigger>
    <TabsTrigger value="orders">
      <ShoppingBag className="h-4 w-4 mr-2" />
      Pesanan
    </TabsTrigger>
    <TabsTrigger value="bookings">
      <Wrench className="h-4 w-4 mr-2" />
      Booking
    </TabsTrigger>
    <TabsTrigger value="target">
      <Target className="h-4 w-4 mr-2" />
      Target
    </TabsTrigger>
  </TabsList>

  <TabsContent value="orders">
    {/* Orders content */}
  </TabsContent>
</Tabs>
```

Tab memungkinkan pelanggan beralih antara Profil, Pesanan, Booking Servis, dan Target CRM tanpa perlu navigasi ke halaman berbeda. Tab yang aktif ditandai dengan warna amber yang mencolok.

### 4.7.7 Kondisi Tidak Ada Pesanan

Ketika pelanggan belum pernah melakukan pesanan, ditampilkan pesan informatif:

```typescript
{orders.length === 0 ? (
  <div className="text-center py-12">
    <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
    <p className="text-muted-foreground">Belum ada pesanan</p>
  </div>
) : (
  // Daftar pesanan
)}
```

Tampilan kosong menampilkan icon shopping bag besar dan pesan "Belum ada pesanan" untuk memberikan feedback yang jelas kepada pengguna baru.

## 4.8 Kesimpulan Implementasi Transaksi Lengkap

Implementasi sistem transaksi lengkap mendemonstrasikan alur pembelian yang seamless dari awal hingga akhir. Dimulai dari keranjang belanja yang memungkinkan pelanggan meninjau dan mengatur produk, dilanjutkan dengan checkout yang mengintegrasikan sistem voucher diskon dan berbagai metode pembayaran.

Integrasi dengan Midtrans Payment Gateway memberikan fleksibilitas pembayaran dengan berbagai channel modern seperti e-wallet, virtual account, dan credit card. Sistem voucher memungkinkan pelanggan mendapatkan diskon dengan validasi yang ketat terhadap syarat minimal pembelian dan kuota penggunaan.

Halaman tracking servis memberikan transparansi status perbaikan kepada pelanggan dengan informasi real-time menggunakan kode servis. Hal ini mengurangi kebutuhan komunikasi manual dan meningkatkan kepuasan pelanggan.

Riwayat pesanan yang terorganisir dengan prioritas pembayaran pending memudahkan pelanggan melacak status pembelian mereka. Fitur countdown waktu pembayaran dan deteksi kadaluarsa membantu mengingatkan pelanggan untuk segera menyelesaikan pembayaran.

Seluruh fitur dirancang dengan feedback visual yang jelas melalui penggunaan warna, badge, dan pesan notifikasi yang informatif. Sistem juga menangani berbagai kondisi error dan edge case untuk memastikan pengalaman pengguna yang lancar di setiap skenario.

---

**Lampiran:**
- **File Terkait:** 
  - `app/client/keranjang/page.tsx` (Keranjang)
  - `app/client/track/page.tsx` (Tracking)
  - `app/client/checkout/page.tsx` (Checkout)
  - `app/client/akun/page.tsx` (Riwayat Pesanan)
- **API Endpoint:** 
  - `/api/orders` (Create, Read orders)
  - `/api/vouchers` (Get available vouchers)
  - `/api/vouchers/validate` (Validate voucher)
  - `/api/payment/create` (Midtrans payment)
  - `/api/bookings/track` (Track service)
- **Component Dependencies:** ClientLayout, Card, Button, Input, Select, Label, Badge, Tabs
- **Library External:** 
  - next/navigation (routing)
  - lucide-react (icons)
  - sonner (toast notifications)
  - Midtrans Snap.js (payment gateway)
- **Third-Party Integration:** Midtrans Payment Gateway (Sandbox/Production)
