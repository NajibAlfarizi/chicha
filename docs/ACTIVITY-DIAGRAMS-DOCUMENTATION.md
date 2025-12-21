# Dokumentasi Activity Diagram - Chicha Mobile

## Daftar Isi
1. [Login Flow](#1-login-flow)
2. [Registrasi Flow](#2-registrasi-flow)
3. [Shopping Flow](#3-shopping-flow)
4. [Checkout & Payment Flow](#4-checkout--payment-flow)
5. [Create Booking Flow](#5-create-booking-flow)
6. [Teknisi Service Flow](#6-teknisi-service-flow)
7. [Admin Manage Order Flow](#7-admin-manage-order-flow)
8. [Track Order & Booking Flow](#8-track-order--booking-flow)
9. [Chat Flow](#9-chat-flow)
10. [Submit Complaint & Review Flow](#10-submit-complaint--review-flow)
11. [Admin Manage Voucher Flow](#11-admin-manage-voucher-flow)
12. [Target & Reward Flow](#12-target--reward-flow)
13. [Notification Flow](#13-notification-flow)

---

## 1. Login Flow

**File:** `01-login-flow.puml`

**Deskripsi:** Proses autentikasi user (Pelanggan/Admin/Teknisi) ke dalam sistem.

**Aktor:**
- Pelanggan/Admin/Teknisi
- Sistem

**Alur Utama:**
1. User membuka halaman login
2. Memasukkan email/username dan password
3. Sistem validasi format input
4. Sistem mencari user di database
5. Verifikasi password dengan hash
6. Jika berhasil, buat session/token
7. Redirect berdasarkan role:
   - Admin → `/admin/dashboard`
   - Teknisi → `/teknisi/dashboard`
   - User → `/client/produk`

**Decision Points:**
- Format valid?
- User ditemukan?
- Password cocok?
- Role apa?

**Error Handling:**
- Format tidak valid → Tampilkan error validasi
- User tidak ditemukan → Error "User tidak ditemukan"
- Password salah → Error "Password salah"

---

## 2. Registrasi Flow

**File:** `02-register-flow.puml`

**Deskripsi:** Proses pendaftaran akun baru untuk pelanggan.

**Aktor:**
- Pelanggan
- Sistem

**Alur Utama:**
1. User membuka halaman registrasi
2. Mengisi form (nama, email, HP, password)
3. Sistem validasi format
4. Cek email belum terdaftar
5. Hash password
6. Insert user baru dengan role 'user'
7. Otomatis login (buat session)
8. Redirect ke `/client/produk`

**Decision Points:**
- Format valid?
- Email sudah terdaftar?

**Error Handling:**
- Format tidak valid → Tampilkan error validasi
- Email sudah ada → Error "Email sudah digunakan"

---

## 3. Shopping Flow

**File:** `03-shopping-flow.puml`

**Deskripsi:** Proses pelanggan browsing dan menambahkan produk ke keranjang.

**Aktor:**
- Pelanggan
- Sistem

**Alur Utama:**
1. Buka halaman produk
2. Sistem load dan tampilkan grid produk
3. Pelanggan bisa filter/search (opsional)
4. Klik produk untuk detail
5. Pilih jumlah dan "Tambah ke Keranjang"
6. Sistem cek stok
7. Jika cukup, tambahkan ke localStorage
8. Update badge keranjang
9. Loop hingga selesai belanja
10. Klik icon keranjang
11. Review item dan total
12. Klik "Checkout"

**Decision Points:**
- Ingin filter/search?
- Stok cukup?
- Lanjut belanja?
- Ada yang ingin diubah?

**Fitur:**
- Filter by kategori
- Search by keyword
- Update quantity
- Remove item

---

## 4. Checkout & Payment Flow

**File:** `04-checkout-payment-flow.puml`

**Deskripsi:** Proses checkout, pembayaran melalui Midtrans, dan callback.

**Aktor:**
- Pelanggan
- Sistem
- Midtrans Payment Gateway

**Alur Utama:**
1. Isi informasi pelanggan (nama, email, HP, alamat)
2. Opsional: Gunakan voucher
3. Sistem validasi voucher dan hitung diskon
4. Review total pembayaran
5. Pilih metode pembayaran
6. Klik "Bayar Sekarang"
7. Sistem buat pesanan (order)
8. Insert order_items dan kurangi stok
9. Update voucher usage
10. Generate midtrans_order_id
11. Request payment token dari Midtrans
12. Redirect ke Snap Midtrans
13. Pelanggan pilih metode (e-wallet, VA, kartu kredit)
14. Lakukan pembayaran
15. Midtrans kirim notification ke sistem
16. Sistem verify signature dan update payment_status
17. Jika sukses → halaman sukses, jika gagal → halaman error

**Decision Points:**
- Punya voucher?
- Voucher valid?
- Data checkout valid?
- Pembayaran berhasil?

**Integration:**
- Midtrans Snap API
- Payment notification webhook

**Error Handling:**
- Voucher tidak valid
- Pembayaran gagal → Tampilkan retry option

---

## 5. Create Booking Flow

**File:** `05-create-booking-flow.puml`

**Deskripsi:** Proses pelanggan membuat booking service perangkat.

**Aktor:**
- Pelanggan
- Sistem
- Admin
- Teknisi

**Alur Utama:**
1. Buka halaman booking
2. Isi form (perangkat, masalah, tanggal, info pelanggan)
3. Klik "Buat Booking"
4. Sistem generate kode service unik (SRV-YYYYMMDD-XXXX)
5. Loop generate hingga dapat kode unik
6. Insert booking dengan status 'baru'
7. Kirim notifikasi ke admin dan pelanggan
8. Tampilkan kode service untuk tracking
9. Opsional: Admin assign teknisi langsung

**Decision Points:**
- Data valid?
- Kode sudah ada? (loop)
- Admin assign teknisi langsung?

**Fitur Khusus:**
- Kode service untuk tracking tanpa login
- Auto-generate kode unik

---

## 6. Teknisi Service Flow

**File:** `06-teknisi-service-flow.puml`

**Deskripsi:** Proses teknisi mengerjakan service dari awal hingga selesai.

**Aktor:**
- Teknisi
- Sistem
- Pelanggan

**Alur Utama:**
1. Login ke portal teknisi
2. Load service yang ditugaskan
3. Pilih booking dan lihat detail
4. Mulai diagnosa
5. Update progress = 'diagnosed'
6. Tambah catatan diagnosa
7. Jika butuh sparepart → update 'waiting_parts'
8. Update progress = 'in_progress'
9. Kerjakan service dengan update berkala
10. Setiap update kirim notifikasi ke pelanggan
11. Setelah selesai, update 'completed'
12. Set completed_at dan update pendapatan teknisi
13. Kirim notifikasi selesai ke pelanggan

**Decision Points:**
- Butuh sparepart?
- Service selesai?

**Real-time Features:**
- Progress update real-time ke pelanggan
- Pelanggan bisa tracking live

---

## 7. Admin Manage Order Flow

**File:** `07-admin-manage-order-flow.puml`

**Deskripsi:** Proses admin mengelola pesanan dari pending hingga selesai.

**Aktor:**
- Admin
- Sistem
- Pelanggan

**Alur Utama:**
1. Login ke admin panel
2. Buka halaman Pesanan
3. Load semua pesanan dengan filter
4. Pilih pesanan dan lihat detail
5. Jika payment_status = paid:
   - Pending → Klik "Proses" → status = 'dikirim'
   - Dikirim → Klik "Tandai Selesai" → status = 'selesai'
6. Setiap update kirim notifikasi ke pelanggan
7. Jika selesai, update progress target pelanggan
8. Opsional: Tangani keluhan terkait pesanan

**Decision Points:**
- Ingin filter?
- Payment_status?
- Status saat ini?
- Ada keluhan terkait?

**Fitur:**
- Filter by status
- View detail lengkap
- Update status
- Reply keluhan

---

## 8. Track Order & Booking Flow

**File:** `08-track-order-booking-flow.puml`

**Deskripsi:** Proses pelanggan melacak pesanan atau booking service.

**Aktor:**
- Pelanggan
- Sistem

**Alur Utama:**

**A. Track Pesanan:**
1. Input Order ID atau Midtrans Order ID
2. Sistem cari di database
3. Tampilkan timeline (dibuat → bayar → kirim → selesai)
4. Jika pending, tampilkan tombol "Batalkan"
5. Jika batal, input alasan dan kembalikan stok

**B. Track Booking:**
1. Input Kode Service
2. Sistem cari booking
3. Tampilkan detail (teknisi, status, progress)
4. Tampilkan timeline progress
5. Lihat catatan dari teknisi
6. Jika completed, bisa submit review

**Decision Points:**
- Track apa? (Pesanan/Booking)
- Ditemukan?
- Status pending? (untuk cancel)
- Status completed? (untuk review)

**Fitur:**
- Public tracking tanpa login (pakai kode)
- Real-time progress update
- Cancel order jika pending
- Submit review jika selesai

---

## 9. Chat Flow

**File:** `09-chat-flow.puml`

**Deskripsi:** Proses chat real-time antara pelanggan/teknisi/admin.

**Aktor:**
- Pelanggan/Teknisi
- Sistem
- Penerima
- Admin (jika receiver admin)

**Alur Utama:**
1. Buka halaman chat
2. Load riwayat chat
3. Subscribe ke Realtime channel
4. Ketik pesan dan kirim
5. Insert ke tabel chat
6. Broadcast via Supabase Realtime
7. Penerima terima pesan real-time
8. Update unread count
9. Jika penerima buka chat → auto mark as read
10. Jika tidak buka → tetap unread

**Decision Points:**
- Pesan valid?
- Penerima sedang buka chat?

**Real-time Features:**
- Supabase Realtime subscription
- Instant message delivery
- Read status
- Unread count badge

---

## 10. Submit Complaint & Review Flow

**File:** `10-submit-complaint-review-flow.puml`

**Deskripsi:** Proses pelanggan submit keluhan atau review produk.

**Aktor:**
- Pelanggan
- Sistem
- Admin

**Alur Utama:**

**A. Keluhan:**
1. Buka tab "Keluhan Saya"
2. Klik "Tambah Keluhan"
3. Opsional: Pilih pesanan terkait
4. Tulis keluhan
5. Insert dengan status 'belum dibaca'
6. Kirim notifikasi ke admin

**B. Review Produk:**
1. Buka riwayat pesanan (yang selesai)
2. Klik "Review Produk"
3. Pilih produk
4. Input rating (1-5 bintang) dan komentar
5. Insert ke complaints dengan rating
6. Kirim notifikasi ke admin

**Decision Points:**
- Jenis? (Keluhan/Review)
- Input valid?

**Fitur:**
- Rating system (1-5 stars)
- Pelanggan bisa cek balasan admin

---

## 11. Admin Manage Voucher Flow

**File:** `11-admin-manage-voucher-flow.puml`

**Deskripsi:** Proses admin mengelola voucher (CRUD).

**Aktor:**
- Admin
- Sistem

**Alur Utama:**

**A. Buat Voucher:**
1. Klik "Tambah Voucher"
2. Isi form (kode, tipe, nilai, min pembelian, kuota, validity)
3. Sistem cek kode unik
4. Insert dengan is_active = true, used = 0

**B. Update Voucher:**
1. Pilih voucher
2. Edit data
3. Update database

**C. Toggle Status:**
1. Klik toggle aktif/nonaktif
2. Update is_active

**D. Hapus Voucher:**
1. Klik hapus
2. Jika used > 0 → warning (sebaiknya nonaktifkan)
3. Jika tetap hapus → soft delete
4. Jika used = 0 → hard delete

**Decision Points:**
- Aksi? (Buat/Update/Toggle/Hapus)
- Kode sudah ada?
- Voucher pernah digunakan?
- Tetap hapus?

---

## 12. Target & Reward Flow

**File:** `12-target-reward-flow.puml`

**Deskripsi:** Sistem target penjualan dan claim reward otomatis.

**Aktor:**
- Admin
- Sistem
- Pelanggan

**Alur Utama:**
1. Admin buat target untuk user (amount & reward)
2. Insert dengan status 'active', current_amount = 0
3. Kirim notifikasi ke user
4. Pelanggan lihat target di halaman Akun
5. Setiap pesanan selesai → trigger update target
6. current_amount += order.total_amount
7. Jika current_amount >= target_amount:
   - Update status = 'achieved'
   - Kirim notifikasi "Target tercapai"
   - Tampilkan tombol "Klaim Reward"
8. Pelanggan klik klaim
9. Update reward_claimed = true
10. Jika reward = voucher → generate voucher otomatis
11. Jika reward = cashback → proses cashback

**Decision Points:**
- Ada target aktif?
- Target tercapai?
- Reward type?

**Auto Features:**
- Auto-update progress saat order selesai
- Auto-generate voucher saat klaim
- Real-time progress tracking

---

## 13. Notification Flow

**File:** `13-notification-flow.puml`

**Deskripsi:** Sistem notifikasi otomatis untuk berbagai event.

**Aktor:**
- Sistem
- Pelanggan/Admin/Teknisi

**Event Types:**

**A. Order Created:**
- Notifikasi ke pelanggan: "Pesanan #XXX berhasil dibuat"
- Notifikasi ke admin: "Pesanan baru dari [User]"

**B. Payment Success:**
- Notifikasi: "Pembayaran #XXX berhasil"

**C. Booking Created:**
- Ke pelanggan: "Booking [kode] menunggu assign teknisi"
- Ke admin: "Booking baru dari [User]"

**D. Teknisi Assigned:**
- Ke pelanggan: "Teknisi [nama] ditugaskan"
- Ke teknisi: "Service baru ditugaskan"

**E. Service Progress Update:**
- "Service [kode] status: [progress_status]"

**F. Order Status Update:**
- dikirim: "Pesanan sedang dikirim"
- selesai: "Pesanan sudah sampai"

**G. Complaint Reply:**
- "Admin membalas keluhan Anda"

**H. Target Achieved:**
- "Target tercapai! Klaim reward Anda!"

**Alur Umum:**
1. Event terjadi
2. Sistem buat notifikasi sesuai tipe
3. Insert ke tabel notifications
4. Broadcast via Supabase Realtime
5. User terima real-time
6. Update badge unread
7. Tampilkan toast notification
8. Jika klik notifikasi → mark as read → redirect

**Real-time:**
- Supabase Realtime channel per user_id
- Instant notification delivery
- Badge count update

---

## Cara Render Activity Diagram

### Menggunakan PlantUML Online
1. Kunjungi [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copy konten dari file `.puml` yang ingin dirender
3. Paste ke editor
4. Diagram akan otomatis ter-render
5. Download sebagai PNG/SVG

### Menggunakan PlantUML CLI
```bash
# Install PlantUML
npm install -g node-plantuml

# Render satu diagram
puml generate docs/activity-diagrams/01-login-flow.puml -o docs/activity-diagrams/dist/

# Render semua diagram sekaligus
puml generate docs/activity-diagrams/*.puml -o docs/activity-diagrams/dist/
```

### Menggunakan VS Code Extension
1. Install extension "PlantUML" by jebbs
2. Buka file `.puml`
3. Tekan `Alt+D` untuk preview
4. Klik kanan → Export ke PNG/SVG

### Menggunakan Script PowerShell (Otomatis)
```bash
# Render semua activity diagram sekaligus
powershell -ExecutionPolicy Bypass -File scripts\render-activity-diagrams.ps1
```

---

## Statistik

- **Total Activity Diagram:** 13
- **Total Aktor:** 5 (Pelanggan, Admin, Teknisi, Sistem, Midtrans)
- **Coverage:**
  - Authentication: 2 diagram
  - E-commerce: 4 diagram
  - Service Booking: 3 diagram
  - Admin Management: 2 diagram
  - Communication: 2 diagram

---

## Daftar File

| No | File | Judul | Kompleksitas |
|----|------|-------|--------------|
| 1 | `01-login-flow.puml` | Proses Login | Medium |
| 2 | `02-register-flow.puml` | Proses Registrasi | Low |
| 3 | `03-shopping-flow.puml` | Proses Belanja Produk | Medium |
| 4 | `04-checkout-payment-flow.puml` | Checkout & Pembayaran | High |
| 5 | `05-create-booking-flow.puml` | Buat Booking Service | Medium |
| 6 | `06-teknisi-service-flow.puml` | Teknisi Service | High |
| 7 | `07-admin-manage-order-flow.puml` | Admin Kelola Pesanan | Medium |
| 8 | `08-track-order-booking-flow.puml` | Track Pesanan & Booking | High |
| 9 | `09-chat-flow.puml` | Sistem Chat | Medium |
| 10 | `10-submit-complaint-review-flow.puml` | Keluhan & Review | Low |
| 11 | `11-admin-manage-voucher-flow.puml` | Admin Kelola Voucher | Medium |
| 12 | `12-target-reward-flow.puml` | Target & Reward | High |
| 13 | `13-notification-flow.puml` | Sistem Notifikasi | High |

---

## Catatan Penting

1. **Real-time Features:**
   - Chat menggunakan Supabase Realtime
   - Notification menggunakan Supabase Realtime
   - Service progress update real-time

2. **Payment Integration:**
   - Midtrans Snap API untuk pembayaran
   - Webhook notification untuk update status
   - Signature verification untuk keamanan

3. **Security:**
   - Password di-hash sebelum disimpan
   - Session-based authentication
   - RLS (Row Level Security) di Supabase

4. **Auto Features:**
   - Auto-update target progress
   - Auto-generate service code
   - Auto-send notification

5. **Public Access:**
   - Track booking dengan service code (tanpa login)
   - Public API untuk payment notification

---

**Terakhir Diupdate:** 17 Desember 2025  
**Proyek:** Chicha Mobile  
**Versi:** 1.0
