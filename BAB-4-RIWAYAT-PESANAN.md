# BAB 4 - IMPLEMENTASI SISTEM

## 4.7 Implementasi Riwayat Pesanan

### 4.7.1 Deskripsi Umum

Halaman riwayat pesanan menampilkan semua transaksi pembelian produk yang pernah dilakukan pelanggan dengan informasi lengkap seperti status pembayaran, detail produk, total harga, dan countdown timer untuk pembayaran yang pending. Sistem dirancang untuk memberikan transparansi penuh kepada pelanggan tentang status setiap pesanan, dengan prioritas menampilkan pesanan yang memerlukan pembayaran di bagian atas.

### 4.7.2 Loading dan Sorting Pesanan

Sistem memuat daftar pesanan dari API dan mengurutkan berdasarkan prioritas dengan potongan kode berikut.

```typescript
useEffect(() => {
  if (!isAuthenticated || authLoading || !user) return;

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersRes = await fetch(`/api/orders?user_id=${user.id}`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const sortedOrders = (ordersData.orders || []).sort((a: Order, b: Order) => {
          const aPending = a.payment_status === 'pending';
          const bPending = b.payment_status === 'pending';
          
          if (aPending && !bPending) return -1;
          if (!aPending && bPending) return 1;
          
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, [isAuthenticated, authLoading, user]);
```

Fungsi ini mengambil data pesanan dari API `/api/orders` dengan parameter `user_id`. Setelah data diterima, sistem melakukan sorting dengan prioritas: pesanan dengan status pending ditampilkan di atas, kemudian diurutkan berdasarkan tanggal created_at dari yang terbaru. Sorting ini memastikan pelanggan langsung melihat pesanan yang memerlukan pembayaran segera tanpa harus scroll ke bawah.

### 4.7.3 Update Profile User

Sistem memungkinkan pelanggan mengedit dan menyimpan perubahan profile dengan potongan kode berikut.

```typescript
const handleSaveProfile = async () => {
  try {
    setSaving(true);

    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      setProfile(data.profile);
      setEditMode(false);
      
      localStorage.setItem('user', JSON.stringify(data.profile));
      
      toast.success('Profil berhasil diperbarui!', {
        description: 'Data profil Anda telah disimpan',
      });
    } else {
      const error = await response.json();
      toasDeteksi dan
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

Fungsi `isPaymentExpired()` mengecek apakah waktu pembayaran sudah habis dengan fallback 24 jam jika `payment_expired_at` tidak ada. Fungsi `getRemainingPaymentTime()` menghitung sisa waktu dalam milliseconds. Fungsi `formatRemainingTime()` mengkonversi ke format yang mudah dibaca (jam dan menit). Countdown timer diupdate setiap detik dengan useEffect dan setTimeout untuk memberikan informasi real-time.

### 4.7.5 Integrasi Chat

Sistem menyediakan fitur chat langsung dari detail pesanan atau booking dengan potongan kode berikut.

```typescript
const handleChatOrder = async (order: Order) => {
  if (!user) return;

  try {
    toast.loading('Membuka chat...', { id: 'chat-loading' });
    
    const room = await createRoom({
      type: 'order',
      customer_id: user.id,
      order_id: order.id,
      name: `Order #${order.id.slice(0, 8)}`,
    });

    toast.dismiss('chat-loading');
    
    if (room) {
      router.push(`/client/chat?room=${room.id}`);
    } else {
      toast.error('Gagal membuka chat');
    }
  } catch (error) {
    toast.dismiss('chat-loading');
    toast.error('Gagal membuka chat');
    console.error('Chat error:', error);
  }
};

const handleChatBooking = async (booking: Booking) => {
  if (!user) return;

  try {
    toast.loading('Membuka chat...', { id: 'chat-loading' });
    
    const room = await createRoom({
      type: 'booking',
      customer_id: user.id,
      teknisi_id: booking.teknisi_id,
      bo4 Kesimpulan

Implementasi riwayat pesanan mendemonstrasikan sistem tracking transaksi yang transparan dan user-friendly. Sorting otomatis dengan prioritas pesanan pending memastikan pelanggan langsung melihat pesanan yang memerlukan pembayaran di bagian atas daftar. Countdown timer real-time memberikan urgency visual yang jelas tentang batas waktu pembayaran, mencegah pesanan otomatis dibatalkan karena melewati batas waktu.

Deteksi payment expiry dengan fallback 24 jam memastikan sistem tetap bekerja meskipun data `payment_expired_at` tidak tersedia. Visual feedback melalui badge status berwarna (pending, paid, failed, expired) memudahkan pelanggan memahami status pesanan dengan cepat. Sistem ini meningkatkan kepuasan pelanggan dengan memberikan informasi lengkap dan transparan tentang setiap transaksi pembelian produkorders?user_id={id}` - Mendapatkan riwayat pesanan berdasarkan user ID
- **Component Dependencies:** ClientLayout, Card, Button, Badge, Dialog
- **Library External:** 
  - lucide-react (icons: ShoppingBag, Eye, CreditCard, CheckCircle, AlertCircle)
  - sonner (toast notifications)
- **Custom Hooks:** 
  - useAuth - Authentication context untuk validasi user
- **Status Types:** pending, paid, failed, expired
- **Payment Expiry:** 24 jam dari created_at atau payment_expired_at
- **Sorting Priority:** Pending first → Descending by creat