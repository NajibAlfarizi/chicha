# Chicha Mobile – Black Box Testing Suite

Dokumentasi ini merangkum seluruh skenario pengujian **black box** untuk aplikasi e-commerce dan service center Chicha Mobile. Fokusnya pada validasi fungsi berdasarkan input/output tanpa meninjau implementasi internal.

## 1. Ruang Lingkup & Lingkungan
- **Platform**: Web (Next.js 16, App Router) dengan tiga peran utama: Pelanggan (client), Admin, dan Teknisi.
- **Backend**: Supabase (PostgreSQL + Edge Functions) dengan Midtrans sebagai penyedia pembayaran.
- **Lingkungan uji**: `https://<domain-test>` atau `npm run dev` secara lokal dengan variabel `.env` yang valid (Supabase & Midtrans).
- **Data referensi**:
  - Akun pelanggan contoh: `najibalfarizi5@gmail.com`
  - Akun admin contoh: `admin@chicha.com`
  - Akun teknisi contoh: `teknisi@chicha.com`

## 2. Aturan Umum Pengujian
1. Setiap skenario bersifat black box – fokus pada masukan, aksi, dan keluaran UI/API.
2. Gunakan browser modern (Chrome/Edge) dengan mode desktop & mobile (devtools) untuk memastikan responsif.
3. Reset database atau gunakan sandbox terpisah agar kasus negatif tidak mengganggu data produksi.
4. Catat hasil aktual, bukti (screenshot/log), dan versi aplikasi.

## 3. Matrix Pengujian Pelanggan (Client)
| ID | Fitur | Skenario | Langkah Uji | Hasil yang Diharapkan |
|----|-------|----------|-------------|------------------------|
| C-01 | Registrasi | Daftar akun baru dengan data valid | Buka `/auth/register`, isi nama, email unik, sandi kuat, submit | Redirect ke halaman login, pesan sukses, record baru di Supabase `users` |
| C-02 | Registrasi | Validasi input kosong/lemah | Kosongkan salah satu field atau password < 8 karakter | Pesan error spesifik, tidak ada akun dibuat |
| C-03 | Login | Login berhasil | Buka `/auth/login`, isi kredensial valid | Redirect ke dashboard/home, token/session tersimpan, nama pengguna tampil di header |
| C-04 | Login | Login gagal | Masukkan email terdaftar dengan password salah | Pesan "Email atau password salah", tetap di halaman login |
| C-05 | Home Carousel | Auto-rotasi banner | Diamkan halaman home > 10 detik | Carousel berpindah slide otomatis tanpa glitch |
| C-06 | Katalog Produk | Filter kategori | Di `/client/produk`, pilih kategori tertentu | Daftar hanya menampilkan produk kategori tersebut |
| C-07 | Katalog Produk | Pencarian | Ketik kata kunci di pencarian | Produk yang namanya mengandung kata tampil, lainnya disembunyikan |
| C-08 | Detail Produk | Informasi lengkap | Klik salah satu produk | Modal/detail menampilkan nama, harga, stok, deskripsi, tombol beli |
| C-09 | Keranjang | Tambah produk | Dari katalog, klik "Tambah Keranjang" beberapa produk | Badge keranjang bertambah, isi keranjang sesuai produk |
| C-10 | Keranjang | Update jumlah / hapus | Di `/client/keranjang`, ubah qty atau hapus item | Total dan subtotal ter-update, item hilang setelah hapus |
| C-11 | Checkout | Alur tanpa voucher | Dari keranjang klik checkout, isi alamat/pembayaran COD, submit | Order status `pending`, ringkasan tampil, redirect ke halaman sukses |
| C-12 | Checkout | Validasi wajib | Kosongkan alamat atau metode bayar | Form menolak submit dengan pesan error |
| C-13 | Voucher | Validasi sukses | Masukkan kode aktif (min spend terpenuhi) | Diskon dihitung benar, total berkurang, catat usage |
| C-14 | Voucher | Validasi gagal | Masukkan kode kedaluwarsa atau kuota habis | Pesan "Voucher tidak aktif/kuota habis" |
| C-15 | Midtrans Payment | Redirect pembayaran | Pilih metode Midtrans, konfirmasi | Dialihkan ke halaman Midtrans sandbox dengan detail order |
| C-16 | Midtrans Payment Callback | Status paid | Setelah bayar di Midtrans sandbox, pastikan webhook diterima | Order di `/client/akun?tab=orders` berubah ke `paid`, notifikasi masuk |
| C-17 | Riwayat Pesanan | Tampilan list | Buka tab Pesanan di `/client/akun` | Tampil kartu order terbaru, status badge benar |
| C-18 | Detail Pesanan | Modal detail | Klik "Detail" pada salah satu order | Modal memuat item, alamat, status, total, info customer |
| C-19 | Booking Service | Isi form lengkap | Di `/client/booking`, isi device, issue, tanggal, auto teknisi | Booking sukses, notifikasi/ toast berhasil, entry di Supabase |
| C-20 | Booking Service | Validasi tanggal | Pilih tanggal lampau | Form menolak, pesan "Tanggal tidak valid" |
| C-21 | Booking Tracking | Lihat progres | Buka `/client/track`, input kode booking valid | Timeline menampilkan status terbaru |
| C-22 | Booking Tracking | Kode invalid | Masukkan kode acak | Pesan "Booking tidak ditemukan" |
| C-23 | Chat Customer Service | Buka chat dari order | Dari tab pesanan klik "Chat" | Halaman `/client/chat` terbuka dengan room terkait order |
| C-24 | Profil | Update biodata | Ubah nama/telepon di tab Profil, simpan | Toast sukses, data tersimpan (cek reload) |
| C-25 | Profil | Validasi email | Coba ubah email ke format salah | Pesan error, data lama tidak berubah |
| C-26 | Target & Reward | Target tampil | Dengan user yang punya target aktif, buka tab Target | Kartu target menampilkan nilai target, current, progress bar |
| C-27 | Target & Reward | Belum punya target | Gunakan user baru tanpa target | Kartu "Target Belum Tersedia" muncul |
| C-28 | Target Achievement | Setelah total belanja >= target | Simulasikan order paid hingga melewati target | Status berubah ke `achieved`, notifikasi ucapan muncul |
| C-29 | Notifikasi | Bell icon menampilkan daftar | Klik ikon notifikasi di header | Daftar notifikasi terbaru muncul, bisa tandai dibaca |
| C-30 | Logout | Keluar sesi | Klik tombol logout | Session dihapus, redirect ke login, data sensitif hilang |

## 4. Matrix Pengujian Teknisi Portal
| ID | Fitur | Skenario | Langkah Uji | Hasil yang Diharapkan |
|----|-------|----------|-------------|------------------------|
| T-01 | Login Teknisi | Kredensial valid | Buka `/teknisi/login`, isi user teknisi | Redirect ke dashboard |
| T-02 | Login Teknisi | Kredensial salah | Password salah | Pesan error, tetap di halaman login |
| T-03 | Dashboard | Statistik harian | Setelah login, lihat dashboard | Kartu Total Job, Pending, In Progress, Completed terisi benar |
| T-04 | Daftar Booking | Filter status | Di halaman Service, pilih filter progress | List berubah sesuai filter |
| T-05 | Daftar Booking | Pencarian device | Ketik nama device/issue | Hanya booking yang match ditampilkan |
| T-06 | Detail Booking | Buka detail | Klik salah satu booking, periksa modal/detail page | Menampilkan info pelanggan, perangkat, riwayat progress |
| T-07 | Update Progress | Tambah progress baru | Isi deskripsi & status (e.g. diagnosed) | Progress muncul di timeline, status booking diperbarui |
| T-08 | Update Progress | Validasi input | Kosongkan deskripsi | Tombol simpan disable atau pesan error |
| T-09 | Chat dengan Pelanggan | Buka chat terkait booking | Klik tombol chat | Room chat terbuka, pesan dua arah berfungsi |
| T-10 | Logout Teknisi | Klik logout | Kembali ke halaman login, session terhapus |

## 5. Matrix Pengujian Admin Portal
| ID | Fitur | Skenario | Langkah Uji | Hasil yang Diharapkan |
|----|-------|----------|-------------|------------------------|
| A-01 | Login Admin | Sukses & gagal | Test kombinasi kredensial | Sukses → dashboard, gagal → pesan error |
| A-02 | Dashboard | Statistik global | Pastikan kartu total sales, customer, pending orders, bookings memuat angka dari API `/api/dashboard/stats` |
| A-03 | Dashboard | Shortcut navigasi | Klik tombol "Lihat Pesanan/Booking/Target/Voucher" | Dialihkan ke halaman modul terkait |
| A-04 | Manajemen Produk | List produk | `/admin/produk` menampilkan tabel produk, pagination | Data sesuai Supabase |
| A-05 | Manajemen Produk | Tambah produk | Klik "Tambah", isi semua field, unggah gambar | Produk baru muncul di list & katalog client |
| A-06 | Manajemen Produk | Validasi form | Kosongkan harga/stock negatif | Pesan error, tidak tersimpan |
| A-07 | Manajemen Kategori | CRUD kategori | Tambah/edit/hapus kategori | Dampaknya terlihat di halaman client filter |
| A-08 | Manajemen Pesanan | Ubah status | Di `/admin/pesanan`, ubah order ke `selesai`/`dibatalkan` | Status berubah, stok rollback jika dibatalkan, notifikasi terkirim |
| A-09 | Manajemen Pesanan | Lihat detail | Klik detail order | Menampilkan item, user, timeline pembayaran |
| A-10 | Manajemen Booking | Assign teknisi | Di `/admin/booking`, pilih teknisi untuk booking | Field teknisi terisi, teknisi menerima job |
| A-11 | Manajemen Booking | Tambah catatan progres | Tambahkan progress via admin | Timeline teknisi & client ikut ter-update |
| A-12 | Manajemen Teknisi | CRUD teknisi | Tambah akun teknisi baru, set spesialisasi | Teknisi baru bisa login portal teknisi |
| A-13 | Manajemen User | View/edit | Update role, status | Perubahan tersimpan, pengaruh ke akses |
| A-14 | Target Management | Set target user | Di `/admin/target`, atur target untuk user tertentu | Tab target user menampilkan data baru |
| A-15 | Voucher Management | Buat voucher | Isi kuota, periode, tipe diskon | Voucher bisa digunakan saat checkout |
| A-16 | Voucher Management | Nonaktifkan voucher | Toggle `is_active` false | Client mendapat pesan "Voucher tidak aktif" |
| A-17 | Complaints / Keluhan | Tindak keluhan | Tandai keluhan sebagai resolved | Status berubah, user diberi notifikasi |
| A-18 | Notifications | Kirim broadcast | Gunakan modul notifikasi manual (jika ada) | Semua user menerima notifikasi |
| A-19 | Logout Admin | Keluar | Session bersih dan kembali ke login |

## 6. Pengujian Integrasi & Sistem
| ID | Area | Skenario | Langkah Uji | Hasil |
|----|------|----------|-------------|-------|
| S-01 | Midtrans Callback | Order `paid` → target update | Jalankan pembayaran sandbox, trigger webhook | API `/api/orders/[id]` menerima patch, target `current_amount` bertambah |
| S-02 | Voucher Usage | Kuota tracking | Gunakan voucher hingga kuota habis | Record baru di `voucher_usage`, ketika kuota habis tes berikutnya gagal |
| S-03 | Notification Bell | Real-time | Buat order/booking yang memicu notifikasi | Ikon bell menampilkan badge & isi terbaru |
| S-04 | Target Auto-create | User pertama kali mencapai pembelian | Pastikan user tanpa target melakukan order paid | Target dibuat otomatis dengan default 10 juta |
| S-05 | RLS / Authorization | Akses antar role | Coba akses `/admin/*` tanpa login admin | Middleware/guard mengalihkan ke login |
| S-06 | Chat Service | Koneksi realtime | Kirim pesan dari client ke admin/teknisi | Pesan tampil di kedua sisi tanpa reload |
| S-07 | Booking Progress Sync | Update via teknisi/admin | Tambahkan progress dari teknisi, cek di client & admin | Timeline sinkron |
| S-08 | Email/Webhook Failure | Simulasi kegagalan Midtrans | Batalkan proses di Midtrans sebelum bayar | Order tetap `pending`, user diberi info |
| S-09 | Mobile Responsiveness | Resize viewport | Uji halaman utama, checkout, akun, admin list di width < 768px | Tata letak adaptif, tidak ada overflow |
| S-10 | Session Expiry | Token kadaluarsa | Hapus token dari storage & refresh halaman akun | Pengguna diarahkan ke login |

## 7. Format Pelaporan Hasil
Gunakan tabel berikut untuk mencatat hasil aktual setiap siklus uji :

| ID Test | Tanggal | Tester | Status (Pass/Fail/Blocked) | Bukti | Catatan |
|--------|---------|--------|----------------------------|-------|---------|
| C-01 | | | | | |
| C-02 | | | | | |
| C-03 | | | | | |
| C-04 | | | | | |
| C-05 | | | | | |
| C-06 | | | | | |
| C-07 | | | | | |
| C-08 | | | | | |
| C-09 | | | | | |
| C-10 | | | | | |
| C-11 | | | | | |
| C-12 | | | | | |
| C-13 | | | | | |
| C-14 | | | | | |
| C-15 | | | | | |
| C-16 | | | | | |
| C-17 | | | | | |
| C-18 | | | | | |
| C-19 | | | | | |
| C-20 | | | | | |
| C-21 | | | | | |
| C-22 | | | | | |
| C-23 | | | | | |
| C-24 | | | | | |
| C-25 | | | | | |
| C-26 | | | | | |
| C-27 | | | | | |
| C-28 | | | | | |
| C-29 | | | | | |
| C-30 | | | | | |
| T-01 | | | | | |
| T-02 | | | | | |
| T-03 | | | | | |
| T-04 | | | | | |
| T-05 | | | | | |
| T-06 | | | | | |
| T-07 | | | | | |
| T-08 | | | | | |
| T-09 | | | | | |
| T-10 | | | | | |
| A-01 | | | | | |
| A-02 | | | | | |
| A-03 | | | | | |
| A-04 | | | | | |
| A-05 | | | | | |
| A-06 | | | | | |
| A-07 | | | | | |
| A-08 | | | | | |
| A-09 | | | | | |
| A-10 | | | | | |
| A-11 | | | | | |
| A-12 | | | | | |
| A-13 | | | | | |
| A-14 | | | | | |
| A-15 | | | | | |
| A-16 | | | | | |
| A-17 | | | | | |
| A-18 | | | | | |
| A-19 | | | | | |
| S-01 | | | | | |
| S-02 | | | | | |
| S-03 | | | | | |
| S-04 | | | | | |
| S-05 | | | | | |
| S-06 | | | | | |
| S-07 | | | | | |
| S-08 | | | | | |
| S-09 | | | | | |
| S-10 | | | | | |

---
Dokumentasi ini harus diperbarui ketika fitur baru ditambahkan atau alur bisnis berubah. Jalankan regresi black box minimal sebelum rilis mayor atau perubahan pada modul pembayaran, booking, dan target reward.
