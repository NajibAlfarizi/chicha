# BAB 4 - IMPLEMENTASI SISTEM

## 4.2 Implementasi Halaman Katalog Produk

### 4.2.1 Deskripsi Umum

Halaman katalog produk merupakan etalase digital yang memungkinkan pelanggan menelusuri, mencari, dan memilih produk yang tersedia. Halaman ini dirancang dengan fitur pencarian teks, filter berdasarkan kategori, serta kemampuan menambahkan produk langsung ke keranjang belanja. Dengan demikian, halaman katalog berfungsi sebagai jantung sistem penjualan yang menghubungkan pelanggan dengan produk yang ditawarkan.

**File Implementasi:** `app/client/produk/page.tsx`

Untuk mendukung berbagai fungsionalitas tersebut, sistem menyimpan beberapa informasi penting yang dibutuhkan halaman ini:

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string>('all');
const [searchQuery, setSearchQuery] = useState<string>('');
const [loading, setLoading] = useState(true);
```

Variabel `products` menyimpan daftar produk yang akan ditampilkan, `categories` menyimpan daftar kategori untuk keperluan filter, `selectedCategory` menyimpan kategori yang sedang dipilih pengguna (nilai awal 'all' untuk menampilkan semua kategori), `searchQuery` menyimpan kata kunci pencarian yang diketik pengguna, dan `loading` berfungsi sebagai penanda apakah sistem sedang mengambil data atau sudah selesai.

### 4.2.2 Pengambilan Data Kategori

Proses pengambilan data kategori dilakukan secara otomatis ketika halaman pertama kali dibuka, melalui pemanggilan fungsi berikut:

```typescript
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  fetchCategories();
}, []);
```

Fungsi `fetchCategories()` bertugas menghubungi server dan mengambil seluruh daftar kategori produk yang tersedia. Proses ini dirancang agar berjalan di latar belakang tanpa menghambat aktivitas pengguna di halaman. Karena daftar kategori umumnya tidak berubah-ubah, pengambilan data hanya dilakukan satu kali saat halaman pertama dibuka, sehingga tidak terjadi permintaan berulang yang dapat memperlambat aplikasi.

### 4.2.3 Pengambilan Data Produk dengan Filter Dinamis

Berbeda dengan kategori, pengambilan data produk dirancang lebih dinamis karena harus menyesuaikan dengan pilihan filter dan kata kunci pencarian yang dipilih pengguna:

```typescript
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/api/products?';
      if (selectedCategory !== 'all') {
        url += `category=${selectedCategory}&`;
      }
      if (searchQuery) {
        url += `search=${searchQuery}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [selectedCategory, searchQuery]);
```

Fungsi `fetchProducts()` akan dipanggil ulang setiap kali pengguna mengubah kategori atau mengetik kata kunci pencarian. Alamat tujuan permintaan data dibangun secara otomatis menyesuaikan filter yang aktif. Jika pengguna memilih kategori tertentu atau mengetik kata kunci, informasi tersebut akan dikirimkan ke server untuk mendapatkan daftar produk yang sesuai. Sistem juga memastikan indikator loading akan hilang setelah proses selesai, baik berhasil maupun gagal, sehingga pengguna tidak kebingungan.

### 4.2.4 Implementasi Fitur Keranjang Belanja

Ketika pelanggan menekan tombol "Tambah ke Keranjang", sistem akan menjalankan fungsi berikut:

```typescript
const addToCart = (product: Product) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  const existingIndex = cart.findIndex(
    (item: { product: Product }) => item.product.id === product.id
  );
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
    toast.success('Berhasil!', {
      description: `Jumlah ${product.name} di keranjang ditambah`,
    });
  } else {
    cart.push({ product, quantity: 1 });
    toast.success('Ditambahkan ke keranjang!', {
      description: product.name,
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};
```

Fungsi `addToCart()` bertugas mengelola proses penambahan produk ke keranjang. Pertama, sistem membaca data keranjang yang tersimpan di browser pengguna. Kemudian sistem memeriksa apakah produk yang akan ditambahkan sudah ada di keranjang sebelumnya. Jika produk ditemukan, jumlahnya akan ditambah satu. Sebaliknya, jika produk belum pernah ditambahkan, sistem akan memasukkannya sebagai item baru dengan jumlah awal satu. Setelah perubahan dilakukan, data keranjang yang sudah diperbarui disimpan kembali, dan sistem memberikan sinyal kepada bagian lain halaman (seperti icon keranjang di header) untuk memperbarui tampilan jumlah item secara otomatis.

### 4.2.5 Tampilan Daftar Produk

Produk ditampilkan dalam bentuk grid yang menyesuaikan ukuran layar: 2 kolom untuk ponsel hingga 4 kolom untuk layar desktop. Berikut struktur tampilan setiap kartu produk:

```typescript
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                gap-3 md:gap-6">
  {products.map((product) => (
    <Card key={product.id} 
          className="border-amber-500/20 hover:border-amber-500/50 
                     hover:shadow-lg transition-all group overflow-hidden">
      <CardContent className="p-2 md:p-4">
        {/* Gambar Produk */}
        <div className="aspect-square relative mb-2 bg-muted/30 
                        rounded-md overflow-hidden cursor-pointer"
             onClick={() => router.push(`/client/produk/${product.id}`)}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
                 className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Badge Kategori */}
        {product.category && (
          <Badge className="bg-amber-500/20 text-amber-600 text-xs mb-1">
            {product.category.name}
          </Badge>
        )}
        
        {/* Nama Produk */}
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 
                       cursor-pointer hover:text-amber-600"
            onClick={() => router.push(`/client/produk/${product.id}`)}>
          {product.name}
        </h3>
        
        {/* Harga */}
        <p className="text-lg font-bold text-amber-600 mb-1">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        
        {/* Stok */}
        <p className="text-xs text-muted-foreground mb-2">
          Stok: {product.stock}
        </p>

        {/* Tombol Aksi */}
        <div className="flex gap-2">
          <Button size="sm"
                  className="flex-1 bg-amber-500 hover:bg-amber-600" 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            {product.stock === 0 ? 'Habis' : 'Tambah'}
          </Button>
          <Button size="sm" variant="outline"
                  className="border-amber-500 hover:bg-amber-500/10"
                  onClick={() => router.push(`/client/produk/${product.id}`)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

Setiap kartu produk dirancang untuk menampilkan informasi lengkap yang dibutuhkan pelanggan. Bagian atas kartu menampilkan gambar produk; jika gambar tidak tersedia, sistem akan menampilkan icon paket sebagai pengganti. Badge kategori ditampilkan di bawah gambar sebagai label identifikasi. Nama produk ditampilkan dengan pembatasan maksimal dua baris untuk menjaga kerapian tampilan. Harga produk diformat sesuai standar mata uang Rupiah lengkap dengan pemisah ribuan agar mudah dibaca. Informasi stok ditampilkan untuk memberitahu ketersediaan produk.

Setiap kartu dilengkapi dua tombol: tombol pertama untuk menambahkan produk ke keranjang, yang akan otomatis menonaktifkan diri jika stok habis; tombol kedua untuk melihat detail lengkap produk.

### 4.2.6 Fitur Pencarian dan Filter Kategori

Untuk memudahkan pelanggan menemukan produk yang diinginkan, halaman ini menyediakan dua mekanisme pencarian:

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <Input type="search" placeholder="Cari produk..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)} />
  
  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
    <SelectTrigger>
      <SelectValue placeholder="Semua Kategori" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Semua Kategori</SelectItem>
      {categories.map((cat) => (
        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

Mekanisme pertama adalah kolom pencarian teks, di mana setiap kali pengguna mengetik, sistem langsung memperbarui kata kunci pencarian yang akan digunakan untuk mencari produk. Mekanisme kedua adalah filter kategori berbentuk dropdown yang menampilkan seluruh kategori yang tersedia di sistem secara otomatis. 

Kedua mekanisme ini dapat digunakan bersamaan, sehingga pelanggan bisa mencari produk dengan kata kunci tertentu sekaligus membatasi hasil pencarian pada kategori spesifik. Misalnya, mencari "kabel" hanya dalam kategori "Aksesori" untuk hasil yang lebih tepat sasaran.

### 4.2.7 Penanganan Loading dan Kondisi Kosong

Sistem dirancang untuk menampilkan informasi yang sesuai dengan kondisi data saat itu:

```typescript
{loading ? (
  <div className="text-center py-12">
    <div className="inline-block h-8 w-8 animate-spin rounded-full 
                    border-4 border-solid border-amber-500 
                    border-r-transparent">
    </div>
  </div>
) : products.length === 0 ? (
  <div className="text-center py-12">
    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
    <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
  </div>
) : (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {/* Render kartu produk */}
  </div>
)}
```

Ketika sistem sedang mengambil data dari server, halaman menampilkan animasi berputar di tengah layar sebagai indikator proses yang sedang berlangsung. Jika pencarian atau filter tidak menghasilkan produk apapun, sistem menampilkan icon paket besar disertai pesan "Tidak ada produk ditemukan" untuk memberitahu pengguna bahwa tidak ada hasil yang sesuai. Ketika data berhasil diambil dan terdapat produk yang sesuai, sistem menampilkan daftar produk dalam bentuk grid seperti yang telah dijelaskan sebelumnya.

Pendekatan ini memastikan pengguna selalu mendapat feedback yang jelas tentang status sistem, terutama berguna ketika koneksi internet lambat atau hasil pencarian tidak menghasilkan produk.

## 4.3 Kesimpulan Implementasi Katalog Produk

Implementasi halaman katalog produk mendemonstrasikan penerapan pengembangan sistem e-commerce modern yang mengutamakan pengalaman pengguna. Halaman ini menyediakan fitur lengkap mulai dari pencarian teks, filter kategori, hingga penambahan produk ke keranjang secara langsung. Proses pengambilan data dirancang agar responsif dan tidak mengganggu aktivitas pengguna. Penyimpanan data keranjang dilakukan di browser pengguna untuk memastikan data tetap tersimpan meskipun halaman di-refresh. 

Tampilan halaman disesuaikan secara otomatis dengan ukuran layar perangkat, memastikan pengalaman optimal baik di ponsel maupun desktop. Sistem juga memberikan feedback yang jelas di setiap kondisi—saat loading, saat tidak ada hasil, maupun saat data berhasil ditampilkan—sehingga meningkatkan kepercayaan dan kepuasan pengguna dalam menggunakan sistem.

---

**Lampiran:**
- **File Terkait:** `app/client/produk/page.tsx`
- **API Endpoint:** `/api/products`, `/api/categories`
- **Component Dependencies:** ClientLayout, Card, Button, Input, Select, Badge
- **Library External:** next/navigation, lucide-react, sonner (toast)
