# BAB 4 - IMPLEMENTASI SISTEM

## 4.4 Implementasi Halaman Keranjang Belanja

### 4.4.1 Deskripsi Umum

Halaman keranjang belanja merupakan tempat pelanggan meninjau produk-produk yang telah dipilih sebelum melanjutkan ke proses pembayaran. Halaman ini dirancang untuk menampilkan ringkasan produk, memungkinkan pengaturan jumlah pembelian, penghapusan item, dan navigasi ke proses checkout. Dengan demikian, halaman keranjang berfungsi sebagai tahap verifikasi sebelum pelanggan melakukan transaksi pembelian.

### 4.4.2 Pengelolaan Data Keranjang

Sistem menyediakan beberapa fungsi untuk mengelola isi keranjang dengan potongan kode berikut.

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

Setiap kali terjadi perubahan pada keranjang, sistem menyimpan data terbaru ke penyimpanan lokal browser dan memberikan sinyal ke komponen lain untuk memperbarui tampilan.

```typescript
const updateCart = (newCart: CartItem[]) => {
  setCartItems(newCart);
  localStorage.setItem('cart', JSON.stringify(newCart));
  window.dispatchEvent(new Event('cartUpdated'));
};
```

Fungsi `updateCart()` bertanggung jawab menyinkronkan data keranjang ke state komponen, penyimpanan lokal, dan memberikan notifikasi kepada komponen lain (seperti badge jumlah item di header) bahwa keranjang sudah diperbarui.

### 4.4.3 Perhitungan Total Harga

Sistem menghitung total harga dan jumlah item secara otomatis dengan potongan kode berikut.

```typescript
const getTotalPrice = () => {
  return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const getTotalItems = () => {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};
```

Fungsi `getTotalPrice()` menjumlahkan harga semua produk dikalikan dengan jumlahnya masing-masing. Fungsi `getTotalItems()` menghitung total jumlah item dalam keranjang dengan menjumlahkan quantity dari setiap produk. Kedua fungsi ini dijalankan secara otomatis setiap kali terjadi perubahan pada keranjang.

### 4.4.4 Panel Ringkasan Pesanan

Panel ringkasan menampilkan subtotal berdasarkan jumlah item, biaya admin (Rp 0), dan total akhir yang harus dibayar. Dua tombol utama disediakan: tombol "Lanjut ke Checkout" untuk melanjutkan proses pembelian, dan tombol "Lanjut Belanja" untuk kembali ke katalog produk. Panel memiliki posisi sticky pada layar desktop sehingga selalu terlihat saat scroll halaman.

### 4.4.5 Kesimpulan

Implementasi halaman keranjang belanja mendemonstrasikan sistem manajemen keranjang yang robust dengan persistensi data menggunakan localStorage browser. Sistem menyediakan kontrol lengkap untuk mengatur jumlah produk dengan validasi stok, menghapus item individual, atau mengosongkan seluruh keranjang.

Perhitungan total yang otomatis dan real-time memberikan transparansi kepada pelanggan tentang total belanja mereka. Desain responsif memastikan pengalaman optimal di berbagai perangkat. Sistem event-driven dengan custom event `cartUpdated` memungkinkan sinkronisasi real-time antar komponen, sehingga badge jumlah item di header selalu menampilkan data terkini.

---

**Lampiran:**
- **File Terkait:** `app/client/keranjang/page.tsx`
- **Component Dependencies:** ClientLayout, Card, Button, Input
- **Library External:** 
  - next/link (navigation)
  - lucide-react (icons: ShoppingCart, Trash2, Plus, Minus, ArrowRight)
  - sonner (toast notifications)
- **Storage:** localStorage browser untuk persistensi data keranjang
- **Event System:** Custom event 'cartUpdated' untuk sinkronisasi real-time
