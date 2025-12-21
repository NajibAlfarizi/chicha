# Dokumentasi Diagram Use Case - Chicha Mobile

## Ringkasan
Diagram use case ini menggambarkan seluruh fungsionalitas sistem Chicha Mobile yang mencakup e-commerce produk elektronik dan sistem booking service teknisi.

---

## Aktor

### 1. **Pelanggan (Customer)**
Pengguna yang dapat berbelanja produk, membuat booking service, dan berinteraksi dengan sistem.

**Hak Akses:**
- Autentikasi (login, registrasi, logout, reset password)
- Browse dan cari produk
- Keranjang belanja dan checkout
- Pembayaran melalui Midtrans
- Lacak pesanan dan booking
- Kirim keluhan dan review
- Chat dengan admin/teknisi
- Lihat notifikasi
- Lihat dan klaim target reward

---

### 2. **Admin (Administrator)**
Pengguna dengan hak akses penuh untuk mengelola seluruh sistem.

**Hak Akses:**
- Kelola produk (CRUD)
- Kelola kategori (CRUD)
- Kelola voucher (CRUD)
- Kelola user dan teknisi (CRUD)
- Update status pesanan dan booking
- Assign teknisi ke booking
- Balas keluhan
- Chat dengan pelanggan
- Lihat dashboard dan analytics
- Kelola target/CRM

---

### 3. **Teknisi (Technician)**
Petugas service yang ditugaskan untuk menangani booking service dari pelanggan.

**Hak Akses:**
- Login teknisi
- Lihat service yang ditugaskan
- Update progress service
- Selesaikan service
- Tambah catatan progress
- Diagnosa masalah
- Chat dengan pelanggan
- Lihat pendapatan
- Lihat dashboard

---

### 4. **Payment Gateway Midtrans**
Sistem eksternal untuk memproses pembayaran.

**Interaksi:**
- Terima notifikasi pembayaran
- Kirim callback pembayaran
- Verifikasi status pembayaran

---

### 5. **Sistem**
Proses otomatis yang berjalan di background.

**Fungsi:**
- Kirim notifikasi otomatis
- Update progress target
- Update real-time (chat, notifikasi)

---

## Paket Use Case

### 📦 **1. Autentikasi**

#### UC_Login - Login
**Aktor:** Pelanggan, Admin, Teknisi  
**Deskripsi:** User melakukan login ke sistem  
**Include:**
- UC_ValidateCredentials: Validasi username/email dan password
- UC_CreateSession: Membuat sesi untuk user yang berhasil login

**Alur:**
1. User memasukkan email/username dan password
2. Sistem validasi kredensial
3. Jika valid, sistem buat sesi
4. User diarahkan ke dashboard sesuai role

---

#### UC_Register - Registrasi
**Aktor:** Pelanggan  
**Deskripsi:** User baru mendaftar akun  

**Alur:**
1. User mengisi form (nama, email, nomor HP, password)
2. Sistem validasi data (email unik, kekuatan password)
3. Sistem buat user baru dengan role 'user'
4. User otomatis login

---

#### UC_TeknisiLogin - Login Teknisi
**Aktor:** Teknisi  
**Deskripsi:** Teknisi login melalui portal khusus teknisi  
**Include:**
- UC_ValidateCredentials
- UC_CreateSession

**Alur:**
1. Teknisi memasukkan username dan password
2. Sistem validasi kredensial dari tabel teknisi
3. Buat sesi dengan role teknisi
4. Redirect ke dashboard teknisi

---

#### UC_Logout - Logout
**Aktor:** Pelanggan, Admin, Teknisi  
**Deskripsi:** User logout dari sistem  

**Alur:**
1. User klik logout
2. Sistem hapus sesi
3. Redirect ke homepage/login

---

#### UC_ResetPassword - Reset Password
**Aktor:** Pelanggan  
**Deskripsi:** User reset password yang terlupa  

**Alur:**
1. User memasukkan email
2. Sistem kirim link reset password
3. User klik link dan set password baru

---

### 📦 **2. Manajemen Produk**

#### UC_BrowseProducts - Lihat Daftar Produk
**Aktor:** Pelanggan, Admin  
**Deskripsi:** Melihat daftar produk yang tersedia  

**Alur:**
1. User akses halaman produk
2. Sistem ambil produk dari database
3. Tampilkan grid produk dengan info (nama, harga, gambar, stok)

---

#### UC_ViewProductDetails - Lihat Detail Produk
**Aktor:** Pelanggan  
**Deskripsi:** Melihat detail lengkap produk  

**Alur:**
1. User klik produk
2. Sistem ambil detail produk (deskripsi, spesifikasi, review)
3. Tampilkan detail dengan opsi tambah ke keranjang

---

#### UC_SearchProducts - Cari Produk
**Aktor:** Pelanggan  
**Deskripsi:** Mencari produk berdasarkan kata kunci  

**Alur:**
1. User ketik kata kunci di search bar
2. Sistem cari produk berdasarkan nama/deskripsi
3. Tampilkan hasil pencarian

---

#### UC_FilterByCategory - Filter Berdasarkan Kategori
**Aktor:** Pelanggan  
**Deskripsi:** Filter produk berdasarkan kategori  

**Alur:**
1. User pilih kategori
2. Sistem filter produk dengan category_id
3. Tampilkan hasil filter

---

#### UC_CreateProduct - Tambah Produk
**Aktor:** Admin  
**Deskripsi:** Admin menambah produk baru  
**Extend:** UC_UploadImage (opsional)

**Alur:**
1. Admin mengisi form produk (nama, kategori, harga, stok, deskripsi)
2. Opsional: Upload gambar produk
3. Sistem validasi data
4. Sistem masukkan produk ke database

---

#### UC_UpdateProduct - Update Produk
**Aktor:** Admin  
**Deskripsi:** Admin update data produk  
**Extend:** UC_UploadImage (opsional)

**Alur:**
1. Admin pilih produk
2. Edit data produk
3. Opsional: Update gambar
4. Sistem update database

---

#### UC_DeleteProduct - Hapus Produk
**Aktor:** Admin  
**Deskripsi:** Admin hapus produk  

**Alur:**
1. Admin klik hapus
2. Sistem konfirmasi
3. Sistem soft delete produk (atau hard delete jika tidak ada pesanan terkait)

---

#### UC_ManageStock - Kelola Stok
**Aktor:** Admin  
**Deskripsi:** Admin update stok produk  

**Alur:**
1. Admin input jumlah stok baru
2. Sistem update stok
3. Jika stok habis, tandai produk out of stock

---

### 📦 **3. Manajemen Kategori**

#### UC_CreateCategory - Tambah Kategori
**Aktor:** Admin  
**Deskripsi:** Admin membuat kategori baru  

**Alur:**
1. Admin input nama kategori
2. Sistem masukkan ke database
3. Kategori tersedia untuk produk

---

#### UC_UpdateCategory - Update Kategori
**Aktor:** Admin  
**Deskripsi:** Admin update nama kategori  

---

#### UC_DeleteCategory - Hapus Kategori
**Aktor:** Admin  
**Deskripsi:** Admin hapus kategori  

**Alur:**
1. Admin hapus kategori
2. Sistem cek apakah ada produk dengan kategori ini
3. Jika ada, tolak penghapusan atau pindahkan produk ke kategori lain

---

### 📦 **4. Keranjang & Pesanan**

#### UC_AddToCart - Tambah ke Keranjang
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan menambah produk ke keranjang  

**Alur:**
1. Pelanggan klik "Tambah ke Keranjang" di halaman produk
2. Sistem cek stok tersedia
3. Jika tersedia, tambahkan ke keranjang (localStorage)
4. Update badge keranjang

---

#### UC_ViewCart - Lihat Keranjang
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melihat isi keranjang  

**Alur:**
1. Pelanggan akses halaman keranjang
2. Sistem load keranjang dari localStorage
3. Tampilkan list produk dengan jumlah dan subtotal

---

#### UC_UpdateCartQuantity - Update Jumlah Item
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan ubah jumlah item di keranjang  

**Alur:**
1. Pelanggan +/- jumlah
2. Sistem cek stok
3. Update keranjang dan hitung ulang total

---

#### UC_RemoveFromCart - Hapus dari Keranjang
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan hapus item dari keranjang  

---

#### UC_Checkout - Checkout
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melakukan checkout  
**Include:**
- UC_CreateOrder
- UC_CalculateTotal
- UC_ProcessPayment
**Extend:** UC_ApplyVoucher (opsional)

**Alur:**
1. Pelanggan akses halaman checkout
2. Input info pelanggan (nama, email, HP, alamat)
3. Opsional: Gunakan voucher
4. Sistem hitung total (subtotal - diskon)
5. Pilih metode pembayaran
6. Sistem buat pesanan
7. Redirect ke payment gateway
8. Keranjang dikosongkan

---

#### UC_ApplyVoucher - Gunakan Voucher
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan menggunakan voucher di checkout  
**Include:**
- UC_ValidateVoucher
- UC_UpdateVoucherUsage

**Alur:**
1. Pelanggan input kode voucher
2. Sistem validasi voucher (validitas, kuota, minimal pembelian)
3. Jika valid, hitung diskon
4. Update total dan penggunaan voucher

---

#### UC_CreateOrder - Buat Pesanan
**Aktor:** Sistem (dipicu oleh checkout)  
**Deskripsi:** Sistem membuat pesanan baru  
**Include:**
- UC_ReduceStock
- UC_CreateOrderNotification

**Alur:**
1. Sistem masukkan pesanan ke database
2. Masukkan order_items
3. Kurangi stok produk
4. Generate midtrans_order_id
5. Kirim notifikasi ke pelanggan dan admin

---

#### UC_TrackOrder - Lacak Pesanan
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan lacak status pesanan  

**Alur:**
1. Pelanggan input order_id atau midtrans_order_id
2. Sistem ambil pesanan dengan status
3. Tampilkan timeline pesanan (pending → dikirim → selesai)

---

#### UC_ViewOrderHistory - Lihat Riwayat Pesanan
**Aktor:** Pelanggan, Admin  
**Deskripsi:** Melihat riwayat pesanan  

**Alur:**
1. User akses halaman riwayat pesanan
2. Sistem ambil pesanan dengan filter user_id (pelanggan) atau semua (admin)
3. Tampilkan daftar pesanan

---

#### UC_CancelOrder - Batalkan Pesanan
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan batalkan pesanan  
**Extend:** UC_TrackOrder

**Alur:**
1. Pelanggan klik batal di halaman lacak pesanan
2. Input alasan pembatalan
3. Sistem update status = 'dibatalkan'
4. Kembalikan stok produk
5. Jika sudah bayar, proses refund

---

#### UC_UpdateOrderStatus - Update Status Pesanan
**Aktor:** Admin  
**Deskripsi:** Admin update status pesanan (pending → dikirim → selesai)  

**Alur:**
1. Admin pilih pesanan
2. Update status
3. Sistem kirim notifikasi ke pelanggan
4. Jika selesai, update progress target

---

### 📦 **5. Proses Pembayaran**

#### UC_ProcessPayment - Proses Pembayaran
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melakukan pembayaran  
**Include:**
- UC_GeneratePaymentToken
- UC_InitiateMidtransPayment

**Alur:**
1. Sistem generate token pembayaran dari Midtrans
2. Tampilkan Snap popup atau redirect ke halaman pembayaran
3. Pelanggan pilih metode pembayaran (e-wallet, transfer bank, kartu kredit)
4. Pelanggan bayar
5. Midtrans kirim callback ke sistem

---

#### UC_ReceivePaymentNotification - Terima Notifikasi Pembayaran
**Aktor:** Payment Gateway Midtrans  
**Deskripsi:** Sistem menerima notifikasi pembayaran dari Midtrans  
**Include:**
- UC_VerifyPaymentSignature
- UC_UpdatePaymentStatus

**Alur:**
1. Midtrans kirim POST request ke /api/payment/notification
2. Sistem verifikasi signature key
3. Sistem update payment_status berdasarkan transaction_status
4. Kirim notifikasi ke pelanggan

---

#### UC_HandlePaymentCallback - Handle Callback Pembayaran
**Aktor:** Payment Gateway Midtrans  
**Deskripsi:** Handle redirect callback dari Midtrans setelah pembayaran  
**Include:** UC_UpdatePaymentStatus

**Alur:**
1. Pelanggan redirect dari Midtrans
2. Sistem parsing query params (order_id, status_code)
3. Update status pembayaran
4. Redirect ke halaman sukses/error

---

### 📦 **6. Manajemen Voucher**

#### UC_ViewAvailableVouchers - Lihat Voucher Tersedia
**Aktor:** Pelanggan, Admin  
**Deskripsi:** Melihat voucher yang aktif  

**Alur:**
1. User akses halaman voucher
2. Sistem ambil voucher dengan is_active = true dan valid_until >= hari ini
3. Tampilkan voucher dengan info (kode, diskon, minimal pembelian, kuota)

---

#### UC_CreateVoucher - Tambah Voucher
**Aktor:** Admin  
**Deskripsi:** Admin membuat voucher baru  

**Alur:**
1. Admin input (kode, nama, tipe, nilai, minimal pembelian, kuota, validitas)
2. Sistem validasi kode unik
3. Masukkan voucher

---

#### UC_UpdateVoucher - Update Voucher
**Aktor:** Admin  
**Deskripsi:** Admin update voucher  

---

#### UC_DeleteVoucher - Hapus Voucher
**Aktor:** Admin  
**Deskripsi:** Admin hapus voucher  

**Alur:**
1. Admin hapus voucher
2. Sistem cek apakah ada pesanan menggunakan voucher ini
3. Jika sudah digunakan, soft delete atau tandai inactive

---

#### UC_ToggleVoucherStatus - Toggle Status Voucher
**Aktor:** Admin  
**Deskripsi:** Admin aktifkan/nonaktifkan voucher  

---

#### UC_ValidateVoucher - Validasi Voucher
**Aktor:** Sistem (dipicu oleh gunakan voucher)  
**Deskripsi:** Sistem validasi voucher  
**Include:**
- UC_CheckVoucherValidity
- UC_CheckVoucherQuota

**Alur:**
1. Cek kode ada
2. Cek is_active = true
3. Cek valid_from <= hari ini <= valid_until
4. Cek kuota > digunakan
5. Cek subtotal >= minimal pembelian
6. Return valid/invalid dengan jumlah diskon

---

### 📦 **7. Booking Service**

#### UC_CreateBooking - Buat Booking
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan membuat booking service  
**Include:**
- UC_GenerateServiceCode
- UC_CreateBookingNotification
**Extend:** UC_AssignTeknisi (opsional)

**Alur:**
1. Pelanggan input (nama perangkat, masalah, tanggal booking, info pelanggan)
2. Sistem generate kode service unik
3. Masukkan booking dengan status 'baru'
4. Opsional: Admin assign teknisi
5. Kirim notifikasi ke pelanggan dan admin

---

#### UC_GenerateServiceCode - Generate Kode Service
**Aktor:** Sistem  
**Deskripsi:** Generate kode tracking unik untuk booking  

**Alur:**
1. Generate random alphanumeric (contoh: SRV-20251217-ABCD)
2. Cek keunikan
3. Return kode service

---

#### UC_TrackBooking - Lacak Booking
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan lacak booking berdasarkan kode service  

**Alur:**
1. Pelanggan input kode service
2. Sistem ambil booking dengan data user dan teknisi
3. Tampilkan status, progress, estimasi selesai

---

#### UC_ViewMyBookings - Lihat Booking Saya
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melihat riwayat booking  

---

#### UC_AssignTeknisi - Assign Teknisi
**Aktor:** Admin  
**Deskripsi:** Admin assign teknisi ke booking  
**Extend:** UC_CreateBooking

**Alur:**
1. Admin pilih teknisi dari daftar teknisi aktif
2. Update booking.teknisi_id
3. Kirim notifikasi ke teknisi

---

#### UC_UpdateBookingStatus - Update Status Booking
**Aktor:** Admin, Teknisi  
**Deskripsi:** Update status booking (baru → proses → selesai)  

**Alur:**
1. Admin/Teknisi update status
2. Sistem update booking
3. Kirim notifikasi ke pelanggan

---

#### UC_UpdateServiceProgress - Update Progress Service
**Aktor:** Teknisi  
**Deskripsi:** Teknisi update progress service  
**Include:** UC_AddProgressNotes

**Alur:**
1. Teknisi input update progress (didiagnosa, dalam proses, menunggu sparepart, dll)
2. Tambah catatan progress
3. Update estimasi selesai
4. Sistem update booking
5. Kirim notifikasi ke pelanggan

---

#### UC_CompleteService - Selesaikan Service
**Aktor:** Teknisi  
**Deskripsi:** Teknisi menandai service selesai  

**Alur:**
1. Teknisi klik selesai
2. Sistem update status = 'selesai', completed_at = sekarang
3. Update pendapatan teknisi
4. Kirim notifikasi ke pelanggan untuk review

---

#### UC_DiagnoseIssue - Diagnosa Masalah
**Aktor:** Teknisi  
**Deskripsi:** Teknisi diagnosa masalah perangkat  

**Alur:**
1. Teknisi input diagnosa
2. Update progress_status = 'diagnosed'
3. Tambah catatan dengan hasil diagnosa

---

#### UC_ViewAssignedServices - Lihat Service Ditugaskan
**Aktor:** Teknisi  
**Deskripsi:** Teknisi melihat service yang ditugaskan  

**Alur:**
1. Ambil booking dengan teknisi_id = user saat ini
2. Filter berdasarkan status (baru, proses)

---

### 📦 **8. Keluhan & Review**

#### UC_SubmitComplaint - Kirim Keluhan
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan kirim keluhan  

**Alur:**
1. Pelanggan pilih pesanan/produk terkait
2. Input pesan
3. Masukkan keluhan dengan status 'belum dibaca'
4. Kirim notifikasi ke admin

---

#### UC_SubmitReview - Kirim Review Produk
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan kirim review produk  
**Include:** UC_RateProduct

**Alur:**
1. Pelanggan pilih produk dari riwayat pesanan
2. Input rating (1-5 bintang) dan pesan
3. Masukkan keluhan dengan rating
4. Kirim notifikasi ke admin

---

#### UC_ViewMyComplaints - Lihat Keluhan Saya
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melihat riwayat keluhan  

---

#### UC_ViewComplaintDetails - Lihat Detail Keluhan
**Aktor:** Pelanggan, Admin  
**Deskripsi:** Melihat detail keluhan  
**Extend:** UC_ReplyToComplaint

---

#### UC_ReplyToComplaint - Balas Keluhan
**Aktor:** Admin  
**Deskripsi:** Admin balas keluhan pelanggan  
**Extend:** UC_ViewComplaintDetails

**Alur:**
1. Admin input balasan
2. Update keluhan (balasan, status = 'dibalas')
3. Kirim notifikasi ke pelanggan

---

#### UC_UpdateComplaintStatus - Update Status Keluhan
**Aktor:** Admin  
**Deskripsi:** Admin update status keluhan  

---

### 📦 **9. Sistem Chat**

#### UC_SendMessage - Kirim Pesan
**Aktor:** Pelanggan, Admin, Teknisi  
**Deskripsi:** Mengirim pesan chat  
**Include:** UC_RealtimeUpdates

**Alur:**
1. User ketik pesan
2. Masukkan ke tabel chat
3. Broadcast real-time ke penerima via WebSocket/Supabase Realtime
4. Update jumlah pesan belum dibaca

---

#### UC_ReceiveMessage - Terima Pesan
**Aktor:** Pelanggan, Admin, Teknisi  
**Deskripsi:** Menerima pesan real-time  
**Include:** UC_RealtimeUpdates

---

#### UC_ViewChatHistory - Lihat Riwayat Chat
**Aktor:** Pelanggan, Admin, Teknisi  
**Deskripsi:** Melihat riwayat chat  
**Extend:** UC_MarkAsRead

**Alur:**
1. Ambil pesan berdasarkan pasangan user
2. Urutkan berdasarkan created_at
3. Tandai pesan belum dibaca sebagai sudah dibaca

---

#### UC_ViewActiveChats - Lihat Chat Aktif
**Aktor:** Admin  
**Deskripsi:** Admin melihat semua chat aktif  

**Alur:**
1. Ambil pasangan chat berbeda dengan pesan terbaru
2. Tampilkan jumlah pesan belum dibaca per chat

---

### 📦 **10. Sistem Notifikasi**

#### UC_SendNotification - Kirim Notifikasi
**Aktor:** Sistem  
**Deskripsi:** Sistem mengirim notifikasi  

**Alur:**
1. Masukkan notifikasi ke database
2. Broadcast via channel real-time
3. Tambah jumlah belum dibaca

---

#### UC_ViewNotifications - Lihat Notifikasi
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melihat notifikasi  
**Extend:** UC_MarkNotificationAsRead

**Alur:**
1. Ambil notifikasi dengan user_id
2. Urutkan berdasarkan created_at DESC
3. Tampilkan badge untuk jumlah belum dibaca

---

#### UC_MarkNotificationAsRead - Tandai Notifikasi Dibaca
**Aktor:** Pelanggan  
**Deskripsi:** Tandai notifikasi sebagai sudah dibaca  

**Alur:**
1. Update is_read = true
2. Kurangi jumlah belum dibaca

---

#### UC_CreateOrderNotification - Buat Notifikasi Pesanan
**Aktor:** Sistem  
**Deskripsi:** Auto-create notifikasi saat pesanan dibuat  
**Include:** UC_SendNotification

**Alur:**
1. Dipicu saat pesanan dibuat
2. Buat notifikasi "Pesanan #XXX berhasil dibuat"
3. Kirim ke pelanggan dan admin

---

#### UC_CreateBookingNotification - Buat Notifikasi Booking
**Aktor:** Sistem  
**Deskripsi:** Auto-create notifikasi saat booking dibuat  
**Include:** UC_SendNotification

---

#### UC_CreatePaymentNotification - Buat Notifikasi Pembayaran
**Aktor:** Sistem  
**Deskripsi:** Auto-create notifikasi saat pembayaran berhasil  
**Include:** UC_SendNotification

**Alur:**
1. Dipicu saat payment_status = 'paid'
2. Buat notifikasi "Pembayaran pesanan #XXX berhasil"

---

### 📦 **11. Manajemen User**

#### UC_ViewUsers - Lihat Daftar User
**Aktor:** Admin  
**Deskripsi:** Admin melihat daftar user  

---

#### UC_ViewUserDetails - Lihat Detail User
**Aktor:** Admin  
**Deskripsi:** Admin melihat detail user  

**Alur:**
1. Ambil user dengan pesanan, booking, keluhan
2. Tampilkan statistik (total belanja, jumlah pesanan)

---

#### UC_UpdateUserRole - Update Role User
**Aktor:** Admin  
**Deskripsi:** Admin ubah role user (user ↔ admin)  

---

#### UC_DeleteUser - Hapus User
**Aktor:** Admin  
**Deskripsi:** Admin hapus user  

**Alur:**
1. Cek apakah user punya pesanan/booking aktif
2. Jika tidak ada, soft delete

---

#### UC_ViewProfile - Lihat Profil
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melihat profil sendiri  

---

#### UC_UpdateProfile - Update Profil
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan update profil (nama, HP, email)  

---

### 📦 **12. Manajemen Teknisi**

#### UC_CreateTeknisi - Tambah Teknisi
**Aktor:** Admin  
**Deskripsi:** Admin membuat akun teknisi baru  

**Alur:**
1. Admin input (nama, username, password, HP, spesialisasi)
2. Hash password
3. Masukkan ke tabel teknisi

---

#### UC_ViewTeknisiList - Lihat Daftar Teknisi
**Aktor:** Admin  
**Deskripsi:** Admin melihat daftar teknisi  

---

#### UC_UpdateTeknisi - Update Teknisi
**Aktor:** Admin  
**Deskripsi:** Admin update data teknisi  

---

#### UC_DeleteTeknisi - Hapus Teknisi
**Aktor:** Admin  
**Deskripsi:** Admin hapus teknisi  

**Alur:**
1. Cek apakah teknisi punya booking aktif
2. Jika tidak, hapus

---

#### UC_ToggleTeknisiStatus - Toggle Status Teknisi
**Aktor:** Admin  
**Deskripsi:** Admin aktifkan/nonaktifkan teknisi  

---

#### UC_ViewTeknisiProfile - Lihat Profil Teknisi
**Aktor:** Teknisi  
**Deskripsi:** Teknisi melihat profil sendiri  

---

#### UC_ViewTeknisiEarnings - Lihat Pendapatan Teknisi
**Aktor:** Teknisi  
**Deskripsi:** Teknisi melihat pendapatan  

**Alur:**
1. Ambil booking selesai dengan teknisi_id
2. Hitung total pendapatan

---

### 📦 **13. Target & CRM**

#### UC_ViewTargets - Lihat Target
**Aktor:** Admin  
**Deskripsi:** Admin melihat semua target user  

**Alur:**
1. Ambil semua target dengan info user
2. Tampilkan persentase progress

---

#### UC_CreateTarget - Buat Target
**Aktor:** Admin  
**Deskripsi:** Admin buat target untuk user  

**Alur:**
1. Admin pilih user
2. Set target_amount dan reward
3. Masukkan target dengan status 'active', current_amount = 0

---

#### UC_UpdateTargetProgress - Update Progress Target
**Aktor:** Sistem  
**Deskripsi:** Auto-update progress saat pesanan selesai  

**Alur:**
1. Dipicu saat status pesanan = 'selesai'
2. Ambil target aktif untuk user
3. current_amount += order.total_amount
4. Jika current_amount >= target_amount, status = 'achieved'
5. Kirim notifikasi

---

#### UC_MarkTargetAchieved - Tandai Target Tercapai
**Aktor:** Admin  
**Deskripsi:** Admin manual tandai target tercapai  

---

#### UC_ViewMyTarget - Lihat Target Saya
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan melihat target pribadi  
**Extend:** UC_ClaimReward

**Alur:**
1. Ambil target dengan user_id
2. Tampilkan progress bar
3. Jika tercapai dan !reward_claimed, tampilkan tombol klaim

---

#### UC_ClaimReward - Klaim Reward
**Aktor:** Pelanggan  
**Deskripsi:** Pelanggan klaim reward saat target tercapai  
**Extend:** UC_ViewMyTarget

**Alur:**
1. Cek status = 'achieved' && !reward_claimed
2. Update reward_claimed = true
3. Proses reward (voucher, diskon, cashback)

---

### 📦 **14. Dashboard & Analytics**

#### UC_ViewAdminDashboard - Lihat Dashboard Admin
**Aktor:** Admin  
**Deskripsi:** Admin melihat dashboard ringkasan  

**Alur:**
1. Ambil statistik (total pesanan, revenue, booking pending, user)
2. Tampilkan grafik (trend penjualan, produk terlaris, revenue per kategori)

---

#### UC_ViewTeknisiDashboard - Lihat Dashboard Teknisi
**Aktor:** Teknisi  
**Deskripsi:** Teknisi melihat dashboard  

**Alur:**
1. Ambil statistik (service ditugaskan, selesai, pendapatan)
2. Tampilkan booking pending/dalam proses

---

#### UC_ViewSalesStatistics - Lihat Statistik Penjualan
**Aktor:** Admin  
**Deskripsi:** Admin melihat statistik penjualan  

**Alur:**
1. Ambil pesanan berdasarkan rentang tanggal
2. Kelompokkan per hari/minggu/bulan
3. Tampilkan grafik

---

#### UC_ViewRevenueStatistics - Lihat Statistik Revenue
**Aktor:** Admin  
**Deskripsi:** Admin melihat statistik revenue  

**Alur:**
1. Hitung total_amount - discount_amount
2. Kelompokkan per periode
3. Tampilkan trend revenue

---

#### UC_ViewServiceStatistics - Lihat Statistik Service
**Aktor:** Admin, Teknisi  
**Deskripsi:** Melihat statistik booking/service  

**Alur:**
1. Hitung booking berdasarkan status
2. Tampilkan completion rate
3. Rata-rata waktu service

---

#### UC_ViewTopProducts - Lihat Produk Terlaris
**Aktor:** Admin  
**Deskripsi:** Admin melihat produk terlaris  

**Alur:**
1. Ambil produk dengan order_items terbanyak
2. Urutkan berdasarkan quantity DESC
3. Tampilkan top 10

---

#### UC_ViewRecentOrders - Lihat Pesanan Terbaru
**Aktor:** Admin  
**Deskripsi:** Admin melihat pesanan terbaru  

---

## Ringkasan Relasi

### Relasi Include (Wajib)

| Use Case Induk | Include | Alasan |
|----------------|---------|---------|
| Login | ValidateCredentials, CreateSession | Login harus validasi dan buat sesi |
| Checkout | CreateOrder, CalculateTotal, ProcessPayment | Checkout harus buat pesanan dan pembayaran |
| ApplyVoucher | ValidateVoucher, UpdateVoucherUsage | Gunakan voucher harus validasi dan update penggunaan |
| ValidateVoucher | CheckVoucherValidity, CheckVoucherQuota | Validasi voucher harus cek validitas dan kuota |
| ProcessPayment | GeneratePaymentToken, InitiateMidtransPayment | Pembayaran harus generate token dan inisiasi Midtrans |
| ReceivePaymentNotification | VerifyPaymentSignature, UpdatePaymentStatus | Notifikasi pembayaran harus verifikasi dan update status |
| CreateOrder | ReduceStock, CreateOrderNotification | Pesanan harus kurangi stok dan kirim notifikasi |
| CreateBooking | GenerateServiceCode, CreateBookingNotification | Booking harus generate kode dan kirim notifikasi |
| UpdateServiceProgress | AddProgressNotes | Update progress harus tambah catatan |
| SendMessage | RealtimeUpdates | Chat harus real-time |
| SubmitReview | RateProduct | Review harus include rating |

### Relasi Extend (Opsional)

| Use Case Dasar | Diperluas oleh | Kondisi |
|----------------|----------------|---------|
| Checkout | ApplyVoucher | Jika pelanggan punya voucher |
| TrackOrder | CancelOrder | Jika pesanan masih pending |
| ViewBookingStatus | UpdateBookingStatus | Jika user adalah admin/teknisi |
| CreateBooking | AssignTeknisi | Jika admin assign langsung |
| ViewComplaintDetails | ReplyToComplaint | Jika user adalah admin |
| ViewNotifications | MarkNotificationAsRead | Jika user klik notifikasi |
| ViewChatHistory | MarkAsRead | Jika ada pesan belum dibaca |
| ViewMyTarget | ClaimReward | Jika target tercapai |
| CreateProduct | UploadImage | Jika admin upload gambar |
| UpdateProduct | UploadImage | Jika admin update gambar |

---

## Cara Render Diagram Use Case

### Menggunakan PlantUML Online
1. Kunjungi [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copy konten dari `docs/use-case-diagram-id.puml`
3. Paste ke editor
4. Diagram akan otomatis ter-render
5. Download sebagai PNG/SVG

### Menggunakan PlantUML CLI
```bash
# Install PlantUML
npm install -g node-plantuml

# Render diagram
puml generate docs/use-case-diagram-id.puml -o docs/use-case-diagram-id.png
```

### Menggunakan VS Code Extension
1. Install extension "PlantUML" by jebbs
2. Buka `docs/use-case-diagram-id.puml`
3. Tekan `Alt+D` untuk preview
4. Klik kanan → Export ke PNG/SVG

---

## Statistik Total

- **Total Aktor:** 5 (Pelanggan, Admin, Teknisi, Midtrans, Sistem)
- **Total Use Case:** 120+
- **Total Paket:** 14
- **Relasi Include:** 20+
- **Relasi Extend:** 10+

---

## Catatan

1. **RLS (Row Level Security)**: Beberapa use case memerlukan RLS policy di Supabase untuk keamanan
2. **Real-time**: Chat dan notifikasi menggunakan Supabase Realtime
3. **Integrasi Midtrans**: Pembayaran menggunakan Midtrans Snap API
4. **Notifikasi**: Sistem notifikasi otomatis dipicu saat ada event (pesanan, booking, pembayaran)
5. **Target/CRM**: Sistem auto-update progress target saat pesanan selesai
6. **Kode Service**: Kode unik untuk tracking booking tanpa login

---

**Terakhir Diupdate:** 17 Desember 2025  
**Proyek:** Chicha Mobile  
**Versi:** 1.0
