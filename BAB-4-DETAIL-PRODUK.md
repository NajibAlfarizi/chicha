# BAB 4 - IMPLEMENTASI SISTEM

## 4.3 Implementasi Halaman Detail Produk

### 4.3.1 Deskripsi Umum

Halaman detail produk merupakan halaman yang menampilkan informasi lengkap tentang produk tertentu kepada pelanggan. Halaman ini dirancang untuk memberikan gambaran menyeluruh meliputi gambar produk, deskripsi, harga, ketersediaan stok, sistem rating dan ulasan, serta pemilihan jumlah pembelian. Dengan demikian, halaman detail berfungsi sebagai pusat informasi lengkap yang membantu pelanggan membuat keputusan pembelian yang tepat.

**File Implementasi:** `app/client/produk/[id]/page.tsx`

Untuk mendukung berbagai fungsionalitas pada halaman ini, sistem menyimpan beberapa informasi penting:

```typescript
const [product, setProduct] = useState<Product | null>(null);
const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
const [reviews, setReviews] = useState<Complaint[]>([]);
const [quantity, setQuantity] = useState(1);
const [loading, setLoading] = useState(true);
const [addingToCart, setAddingToCart] = useState(false);
const [showReviewForm, setShowReviewForm] = useState(false);
const [submittingReview, setSubmittingReview] = useState(false);
const [reviewData, setReviewData] = useState({
  rating: 5,
  message: '',
});
```

Variabel `product` menyimpan informasi detail produk yang sedang dilihat, `relatedProducts` menyimpan daftar produk terkait dari kategori yang sama, `reviews` menyimpan daftar ulasan pelanggan untuk produk ini, `quantity` menyimpan jumlah produk yang akan dibeli (nilai awal 1), `loading` sebagai penanda proses pengambilan data, `addingToCart` untuk status proses tambah ke keranjang, `showReviewForm` mengontrol tampilan form ulasan, `submittingReview` untuk status pengiriman ulasan, dan `reviewData` menyimpan nilai rating dan pesan ulasan yang akan dikirim.

### 4.3.2 Pengambilan Data Produk

Proses pengambilan data produk dilakukan secara otomatis ketika halaman dibuka, melalui pemanggilan fungsi berikut:

```typescript
useEffect(() => {
  if (productId) {
    fetchProduct();
    fetchReviews();
  }
}, [productId]);
```

Sistem akan mengambil data produk dan ulasan begitu halaman dimuat. Fungsi `fetchProduct()` bertugas mengambil informasi detail produk, sementara `fetchReviews()` mengambil daftar ulasan produk tersebut.

Berikut implementasi pengambilan data produk:

```typescript
const fetchProduct = async () => {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();
    
    if (data.product) {
      setProduct(data.product);
      
      // Fetch related products from same category
      if (data.product.category_id) {
        fetchRelatedProducts(data.product.category_id, productId);
      }
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  } finally {
    setLoading(false);
  }
};
```

Fungsi `fetchProduct()` menghubungi server untuk mengambil detail produk berdasarkan ID yang tertera pada alamat halaman. Setelah data produk berhasil diambil, sistem secara otomatis akan mengambil produk-produk terkait dari kategori yang sama untuk ditampilkan di bagian bawah halaman.

### 4.3.3 Pengambilan Produk Terkait

Untuk membantu pelanggan menemukan produk lain yang mungkin mereka minati, sistem menampilkan produk terkait dari kategori yang sama:

```typescript
const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
  try {
    const response = await fetch(`/api/products?category_id=${categoryId}`);
    const data = await response.json();
    
    if (data.products) {
      // Filter out current product and limit to 4
      const related = data.products
        .filter((p: Product) => p.id !== currentProductId)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  } catch (error) {
    console.error('Error fetching related products:', error);
  }
};
```

Fungsi `fetchRelatedProducts()` mengambil semua produk dalam kategori yang sama, kemudian menyaring produk yang sedang dilihat agar tidak muncul di daftar produk terkait. Sistem membatasi tampilan maksimal 4 produk terkait untuk menjaga tampilan tetap rapi dan tidak membebani performa halaman.

### 4.3.4 Pengambilan dan Pengelolaan Ulasan

Sistem ulasan memungkinkan pelanggan melihat pengalaman pengguna lain terhadap produk:

```typescript
const fetchReviews = async () => {
  try {
    const response = await fetch(`/api/complaints?product_id=${productId}`);
    const data = await response.json();
    
    if (data.complaints) {
      // Filter only reviews (those with product_id)
      const productReviews = data.complaints.filter((c: Complaint) => c.product_id && c.rating);
      setReviews(productReviews);
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
};
```

Fungsi `fetchReviews()` mengambil data ulasan dari sistem komplain yang telah difilter khusus untuk produk ini. Sistem hanya menampilkan komplain yang memiliki rating dan terkait dengan produk, sehingga memastikan hanya ulasan produk yang ditampilkan.

Untuk menghitung rating rata-rata produk, sistem menggunakan fungsi berikut:

```typescript
const calculateAverageRating = (): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};
```

Fungsi `calculateAverageRating()` menjumlahkan semua rating yang diberikan pelanggan, kemudian membaginya dengan jumlah ulasan untuk mendapatkan nilai rata-rata. Jika belum ada ulasan, sistem akan mengembalikan nilai 0. Hasilnya dibulatkan hingga satu digit desimal untuk kemudahan pembacaan.

### 4.3.5 Fitur Menulis Ulasan

Pelanggan yang sudah login dapat memberikan ulasan terhadap produk:

```typescript
const handleSubmitReview = async () => {
  if (!user?.id) {
    toast.error('Login diperlukan', {
      description: 'Silakan login untuk memberikan ulasan',
    });
    return;
  }

  if (!reviewData.message.trim()) {
    toast.error('Ulasan tidak boleh kosong');
    return;
  }

  setSubmittingReview(true);

  try {
    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        product_id: productId,
        message: reviewData.message,
        rating: reviewData.rating,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('Ulasan berhasil dikirim!');
      setReviewData({ rating: 5, message: '' });
      setShowReviewForm(false);
      fetchReviews(); // Refresh reviews
    } else {
      toast.error('Gagal mengirim ulasan', {
        description: data.error || 'Silakan coba lagi',
      });
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    toast.error('Terjadi kesalahan');
  } finally {
    setSubmittingReview(false);
  }
};
```

Fungsi `handleSubmitReview()` memvalidasi terlebih dahulu apakah pengguna sudah login dan apakah pesan ulasan tidak kosong. Jika validasi berhasil, sistem mengirim data ulasan ke server yang berisi identitas pengguna, ID produk, rating, dan pesan ulasan. Setelah ulasan berhasil dikirim, form ulasan akan disembunyikan dan daftar ulasan akan diperbarui otomatis untuk menampilkan ulasan baru.

### 4.3.6 Pengaturan Jumlah Pembelian

Sistem menyediakan kontrol untuk mengatur jumlah produk yang akan dibeli:

```typescript
const incrementQuantity = () => {
  if (product && quantity < product.stock) {
    setQuantity(quantity + 1);
  }
};

const decrementQuantity = () => {
  if (quantity > 1) {
    setQuantity(quantity - 1);
  }
};
```

Fungsi `incrementQuantity()` menambah jumlah pembelian, namun dibatasi tidak boleh melebihi stok yang tersedia. Sementara `decrementQuantity()` mengurangi jumlah pembelian dengan batas minimal 1 unit. Pembatasan ini memastikan pelanggan tidak dapat memesan melebihi ketersediaan stok atau memesan jumlah yang tidak valid.

### 4.3.7 Implementasi Tambah ke Keranjang

Ketika pelanggan menekan tombol "Tambah ke Keranjang", sistem menjalankan proses berikut:

```typescript
const handleAddToCart = () => {
  if (!product) return;

  setAddingToCart(true);

  // Get existing cart from localStorage
  const cartStr = localStorage.getItem('cart');
  const cart = cartStr ? JSON.parse(cartStr) : [];

  // Check if product already in cart
  const existingIndex = cart.findIndex((item: { product: { id: string } }) => item.product?.id === product.id);

  if (existingIndex > -1) {
    // Update quantity
    cart[existingIndex].quantity += quantity;
  } else {
    // Add new item with proper structure for CartItem type
    cart.push({
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        category: product.category,
        description: product.description,
        category_id: product.category_id,
      },
      quantity: quantity,
    });
  }

  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Dispatch event for cart update
  window.dispatchEvent(new Event('cartUpdated'));

  setTimeout(() => {
    setAddingToCart(false);
    toast.success('Ditambahkan ke keranjang!', {
      description: `${quantity}x ${product.name}`,
    });
  }, 300);
};
```

Fungsi `handleAddToCart()` membaca data keranjang yang tersimpan di browser, kemudian memeriksa apakah produk yang sama sudah ada di keranjang. Jika produk sudah ada, sistem akan menambahkan jumlah sesuai quantity yang dipilih. Jika belum ada, sistem menambahkan produk tersebut sebagai item baru lengkap dengan semua informasi produk dan jumlah yang dipilih. Setelah perubahan disimpan, sistem memberikan sinyal ke bagian lain halaman untuk memperbarui tampilan jumlah item keranjang secara otomatis.

### 4.3.8 Tampilan Informasi Produk

Halaman menampilkan informasi produk secara lengkap dalam dua kolom: kolom kiri untuk gambar produk, dan kolom kanan untuk detail informasi:

```typescript
<div className="grid md:grid-cols-2 gap-8 mb-12">
  {/* Product Image */}
  <div className="bg-card rounded-lg p-6 border border-amber-500/20 shadow-sm">
    <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
      {product.image_url ? (
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-contain rounded-lg"
        />
      ) : (
        <Package className="h-32 w-32 text-muted-foreground" />
      )}
    </div>
  </div>

  {/* Product Info */}
  <div className="space-y-6">
    {/* Category Badge */}
    {product.category && (
      <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
        {product.category.name}
      </Badge>
    )}

    {/* Product Name */}
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
      <div className="flex items-center gap-2">
        <div className="flex text-amber-500">
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            return (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  starValue <= calculateAverageRating() 
                    ? 'fill-current' 
                    : 'fill-slate-700'
                }`}
              />
            );
          })}
        </div>
        <span className="text-slate-400 text-sm">
          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    </div>

    {/* Price */}
    <div>
      <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">
        Rp {product.price.toLocaleString('id-ID')}
      </p>
    </div>

    {/* Stock Status */}
    <div className="flex items-center gap-2">
      {product.stock > 0 ? (
        <>
          <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
          <span className="text-green-600 dark:text-green-500 font-medium">
            Stok Tersedia: {product.stock} unit
          </span>
        </>
      ) : (
        <>
          <X className="h-5 w-5 text-red-600 dark:text-red-500" />
          <span className="text-red-600 dark:text-red-500 font-medium">Stok Habis</span>
        </>
      )}
    </div>

    {/* Description */}
    {product.description && (
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-2">Deskripsi Produk</h3>
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
      </div>
    )}
  </div>
</div>
```

Bagian gambar menampilkan visualisasi produk dengan rasio persegi yang konsisten. Jika gambar tidak tersedia, sistem menampilkan icon paket sebagai pengganti. Bagian informasi produk menampilkan badge kategori di bagian atas, diikuti nama produk berukuran besar, rating bintang yang dihitung dari rata-rata ulasan disertai jumlah ulasan, harga dalam format Rupiah, status ketersediaan stok dengan indikator warna (hijau untuk tersedia, merah untuk habis), dan deskripsi lengkap produk jika tersedia.

### 4.3.9 Pemilihan Jumlah dan Tombol Keranjang

Jika stok tersedia, sistem menampilkan kontrol pemilihan jumlah dan tombol tambah ke keranjang:

```typescript
{/* Quantity Selector */}
{product.stock > 0 && (
  <div className="border-t pt-6">
    <h3 className="font-semibold mb-3">Jumlah</h3>
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-amber-500/30 rounded-lg">
        <Button
          onClick={decrementQuantity}
          disabled={quantity <= 1}
          variant="ghost"
          size="sm"
          className="text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="px-6 font-semibold">{quantity}</span>
        <Button
          onClick={incrementQuantity}
          disabled={quantity >= product.stock}
          variant="ghost"
          size="sm"
          className="text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-slate-400 text-sm">
        Max: {product.stock} unit
      </span>
    </div>
  </div>
)}

{/* Add to Cart Button */}
<div className="border-t pt-6">
  <Button
    onClick={handleAddToCart}
    disabled={product.stock === 0 || addingToCart}
    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 text-lg"
  >
    <ShoppingCart className="mr-2 h-5 w-5" />
    {addingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
  </Button>
  {product.stock === 0 && (
    <p className="text-red-600 dark:text-red-500 text-sm mt-2 text-center">
      Produk ini sedang tidak tersedia
    </p>
  )}
</div>
```

Kontrol pemilihan jumlah terdiri dari tombol minus dan plus dengan angka di tengah. Tombol minus akan non-aktif jika jumlah sudah mencapai 1, sementara tombol plus akan non-aktif jika jumlah sudah mencapai stok maksimal. Informasi stok maksimal ditampilkan di sebelah kontrol untuk memberikan panduan kepada pelanggan.

Tombol "Tambah ke Keranjang" berukuran penuh dan menonjol dengan warna amber. Tombol ini akan non-aktif jika stok habis atau sedang dalam proses menambahkan. Saat proses berlangsung, teks tombol berubah menjadi "Menambahkan..." untuk memberikan feedback visual.

### 4.3.10 Tampilan Ulasan Produk

Bagian ulasan menampilkan rating keseluruhan, daftar ulasan pelanggan, dan form untuk menulis ulasan:

```typescript
<div className="border-t pt-12 mt-12">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl font-bold">Ulasan Produk</h2>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= calculateAverageRating()
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-slate-600'
              }`}
            />
          ))}
        </div>
        <span className="text-slate-300">
          {calculateAverageRating()} ({reviews.length} ulasan)
        </span>
      </div>
    </div>
    {user && (
      <Button
        onClick={() => setShowReviewForm(!showReviewForm)}
        className="bg-amber-500 hover:bg-amber-600 text-white"
      >
        <Star className="mr-2 h-4 w-4" />
        Tulis Ulasan
      </Button>
    )}
  </div>
</div>
```

Header seksi ulasan menampilkan judul "Ulasan Produk", rating rata-rata dalam bentuk bintang, dan jumlah total ulasan. Jika pengguna sudah login, tombol "Tulis Ulasan" akan ditampilkan di sebelah kanan untuk memungkinkan mereka memberikan feedback.

Setiap ulasan ditampilkan dalam kartu terpisah yang memuat nama pelanggan, rating yang diberikan, isi ulasan, dan tanggal ulasan dibuat. Jika admin telah memberikan balasan terhadap ulasan tersebut, balasan akan ditampilkan di bawah ulasan dengan indikasi visual yang jelas (badge "Admin Chicha Mobile" dan latar belakang berbeda).

### 4.3.11 Tampilan Produk Terkait

Di bagian bawah halaman, sistem menampilkan produk-produk terkait dari kategori yang sama:

```typescript
{relatedProducts.length > 0 && (
  <div className="border-t pt-12 mt-12">
    <h2 className="text-2xl font-bold mb-6">Produk Terkait</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {relatedProducts.map((relatedProduct) => (
        <Card
          key={relatedProduct.id}
          className="border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => router.push(`/client/produk/${relatedProduct.id}`)}
        >
          <CardContent className="p-4">
            <div className="aspect-square bg-muted/30 rounded-lg mb-3 flex items-center justify-center">
              {relatedProduct.image_url ? (
                <img
                  src={relatedProduct.image_url}
                  alt={relatedProduct.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Package className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {relatedProduct.name}
            </h3>
            <p className="text-amber-600 dark:text-amber-500 font-bold text-lg">
              Rp {relatedProduct.price.toLocaleString('id-ID')}
            </p>
            {relatedProduct.stock > 0 ? (
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-500 text-xs mt-2">
                Stok: {relatedProduct.stock}
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-600 dark:text-red-500 text-xs mt-2">
                Habis
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
```

Produk terkait ditampilkan dalam grid 2 kolom di ponsel hingga 4 kolom di desktop. Setiap kartu produk dapat diklik untuk membuka halaman detail produk tersebut. Kartu menampilkan gambar produk, nama produk dengan pembatasan dua baris, harga, dan badge status stok dengan warna yang sesuai (hijau untuk tersedia, merah untuk habis). Tampilan ini membantu pelanggan menemukan produk alternatif atau produk pelengkap yang mungkin mereka butuhkan.

### 4.3.12 Penanganan Loading dan Error

Sistem menangani dua kondisi khusus: saat data sedang dimuat dan saat produk tidak ditemukan:

```typescript
if (loading) {
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
        <p className="text-slate-400 mt-4">Loading...</p>
      </div>
    </ClientLayout>
  );
}

if (!product) {
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-slate-400 mb-6">Produk yang Anda cari tidak tersedia</p>
        <Button onClick={() => router.push('/client/produk')} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
          Kembali ke Produk
        </Button>
      </div>
    </ClientLayout>
  );
}
```

Ketika data sedang diambil dari server, halaman menampilkan animasi loading berputar dengan teks "Loading..." untuk memberitahu pengguna bahwa proses sedang berlangsung. Jika produk dengan ID yang diminta tidak ditemukan di sistem, halaman menampilkan icon paket besar, pesan "Produk Tidak Ditemukan", penjelasan singkat, dan tombol untuk kembali ke halaman katalog produk. Pendekatan ini memastikan pengguna tidak menemui halaman kosong dan memiliki opsi untuk melanjutkan aktivitas mereka.

## 4.4 Kesimpulan Implementasi Detail Produk

Implementasi halaman detail produk mendemonstrasikan sistem informasi produk yang komprehensif dan interaktif. Halaman ini menyajikan informasi lengkap mulai dari spesifikasi produk, gambar, harga, hingga ulasan dari pelanggan lain yang membantu dalam pengambilan keputusan pembelian. Fitur pemilihan jumlah dengan validasi stok memastikan pelanggan tidak memesan melebihi ketersediaan. 

Sistem ulasan terintegrasi memberikan transparansi dan membangun kepercayaan pelanggan melalui pengalaman pengguna lain. Adanya balasan admin menunjukkan komitmen pelayanan yang responsif. Fitur produk terkait membantu meningkatkan kemungkinan penjualan silang dengan menampilkan produk sejenis yang relevan. 

Penanganan berbagai kondisi seperti loading, produk tidak ditemukan, dan stok habis memberikan pengalaman pengguna yang lancar dan informatif di setiap situasi. Semua fitur dirancang untuk memberikan pengalaman berbelanja yang seamless dan meningkatkan kepercayaan serta kepuasan pelanggan.

---

**Lampiran:**
- **File Terkait:** `app/client/produk/[id]/page.tsx`
- **API Endpoint:** `/api/products/:id`, `/api/products?category_id=`, `/api/complaints`
- **Component Dependencies:** ClientLayout, Card, Button, Badge, Textarea, Label
- **Library External:** next/navigation, lucide-react, sonner (toast)
