# Dokumentasi Activity Diagram per Role - Chicha Mobile

## Struktur Folder

```
docs/activity-diagrams/
├── client/          (Activity Diagram untuk Pelanggan)
├── admin/           (Activity Diagram untuk Admin)
├── teknisi/         (Activity Diagram untuk Teknisi)
└── ACTIVITY-DIAGRAMS-BY-ROLE.md
```

---

## 📱 Activity Diagram CLIENT (Pelanggan)

### 1. Login Client
**File:** `client/01-login.puml`

**Proses:**
- Input email & password
- Validasi kredensial
- Cek role = 'user'
- Buat session
- Redirect ke /client/produk

**Error Handling:**
- Format tidak valid
- Email tidak terdaftar
- Password salah
- Role bukan user

---

### 2. Registrasi Client
**File:** `client/02-register.puml`

**Proses:**
- Input nama, email, HP, password
- Validasi format
- Cek email unique
- Hash password dan insert user
- Auto-login
- Redirect ke /client/produk

**Fitur Tambahan:**
- Auto-assign target default (jika ada)
- Welcome message

---

### 3. Shopping (Browse & Add to Cart)
**File:** `client/03-shopping.puml`

**Proses:**
- Browse produk dengan filter/search
- Lihat detail produk
- Input quantity
- Cek stok
- Tambah ke cart (localStorage)
- Update badge keranjang

**Fitur:**
- Search by keyword
- Filter by kategori
- Product detail view

---

### 4. Checkout & Payment
**File:** `client/04-checkout-payment.puml`

**Proses:**
- Review cart items
- Update quantity atau hapus item
- Input info pengiriman
- Opsional: Gunakan voucher
- Validasi voucher (validity, quota, min purchase)
- Calculate total dengan diskon
- Buat order dan order_items
- Kurangi stok produk
- Request Midtrans payment token
- Redirect ke Snap Midtrans
- Pilih metode bayar (e-wallet, VA, kartu kredit)
- Webhook notification dari Midtrans
- Update payment_status
- Redirect ke success/error page

**Integrasi:**
- Midtrans Snap API
- Payment notification webhook

---

### 5. Booking Service
**File:** `client/05-booking-service.puml`

**Proses:**
- Input info booking (perangkat, masalah, tanggal, customer info)
- Generate kode service unik (SRV-YYYYMMDD-XXXX)
- Insert booking dengan status 'baru'
- Kirim notifikasi ke admin dan pelanggan
- Tampilkan kode service untuk tracking

**Fitur Unik:**
- Service code untuk tracking tanpa login
- Loop generate kode hingga unique

---

### 6. Tracking (Order & Booking)
**File:** `client/06-tracking.puml`

**Proses A - Track Order:**
- Input Order ID atau Midtrans Order ID
- Tampilkan timeline status
- Jika pending → opsi cancel order
- Input alasan pembatalan
- Kembalikan stok

**Proses B - Track Booking:**
- Input kode service
- Tampilkan detail booking & teknisi
- Tampilkan timeline progress (pending → diagnosed → in progress → completed)
- Lihat catatan progress dari teknisi
- Jika completed → opsi submit review

**Real-time:**
- Progress update via Supabase Realtime

---

### 7. Account Management
**File:** `client/07-account-management.puml`

**Tabs:**

**A. Profil:**
- View & edit nama, email, HP

**B. Riwayat Pesanan:**
- List orders dengan filter
- Detail order
- Review produk (jika selesai)

**C. Riwayat Booking:**
- List bookings
- Redirect ke tracking

**D. Keluhan:**
- List keluhan
- Tambah keluhan baru
- Lihat balasan admin

**E. Target Saya:**
- View progress target
- Progress bar
- Klaim reward (jika achieved)
- Auto-generate voucher

**F. Notifikasi:**
- List notifikasi (order, booking, payment, target)
- Mark as read
- Redirect ke halaman terkait

---

## 👨‍💼 Activity Diagram ADMIN

### 1. Login Admin
**File:** `admin/01-login.puml`

**Proses:**
- Input email & password
- Cek role = 'admin'
- Redirect ke /admin/dashboard
- Tampilkan metrics & charts

---

### 2. Manage Products
**File:** `admin/02-manage-products.puml`

**CRUD Operations:**

**Create:**
- Isi form produk
- Upload gambar (opsional)
- Insert ke database

**Update:**
- Edit data produk
- Ganti gambar (opsional)
- Update stock

**Delete:**
- Cek apakah pernah dibeli
- Jika ya → tidak bisa hapus
- Jika tidak → delete

---

### 3. Manage Orders
**File:** `admin/03-manage-orders.puml`

**Proses:**
- View list orders dengan filter
- Detail order dengan customer info & items
- Update status berdasarkan payment:
  - Jika paid:
    - pending → dikirim (input resi opsional)
    - dikirim → selesai
  - Jika pending → tunggu pembayaran
- Setiap update kirim notifikasi ke pelanggan
- Jika selesai → trigger update target pelanggan

---

### 4. Manage Bookings
**File:** `admin/04-manage-bookings.puml`

**Proses:**
- View list bookings dengan filter
- Detail booking

**Assign Teknisi:**
- Pilih teknisi aktif
- Update booking.teknisi_id
- Update status = 'proses'
- Kirim notifikasi ke teknisi & pelanggan

**Reassign:**
- Ganti teknisi
- Kirim notifikasi

**Manual Update:**
- Update status manual
- Tambah catatan

---

### 5. Manage Vouchers
**File:** `admin/05-manage-vouchers.puml`

**CRUD Operations:**

**Create:**
- Input kode (unique), nama, tipe, nilai, min purchase, kuota, validity
- Validasi kode unique
- Insert dengan is_active = true, used = 0

**Update:**
- Edit data voucher (kode tidak bisa diubah)
- Extend validity atau tambah kuota

**Toggle Status:**
- Aktif/nonaktif voucher
- Cek kadaluarsa

**Delete:**
- Cek voucher.used
- Jika used > 0 → warning (recommend nonaktifkan)
- Opsional: tetap hapus atau nonaktifkan

---

### 6. Manage Target & CRM
**File:** `admin/06-manage-target.puml`

**Proses:**
- View list targets dengan progress
- Create target untuk user:
  - Pilih user
  - Set target_amount dan reward
  - Kirim notifikasi ke user
- Update progress manual (jika perlu)
- Monitor progress real-time
- Tandai tercapai manual

**Auto Feature:**
- Progress auto-update saat order selesai

---

### 7. Manage Users & Teknisi
**File:** `admin/07-manage-users-teknisi.puml`

**Manage Users:**
- View list users dengan statistik
- Detail user (orders, bookings, complaints, targets)
- Update role (user ↔ admin)
- Hapus user (cek transaksi aktif)

**Manage Teknisi:**
- View list teknisi dengan service count
- Create teknisi (input kredensial)
- Edit data teknisi
- Toggle status (aktif/inactive)
- Delete teknisi (cek booking history)

---

## 🔧 Activity Diagram TEKNISI

### 1. Login Teknisi
**File:** `teknisi/01-login.puml`

**Proses:**
- Input username & password (beda dengan client)
- Query tabel teknisi (bukan users)
- Cek status = 'active'
- Redirect ke /teknisi/dashboard
- Tampilkan metrics (service count, earnings, rating)

---

### 2. Service Workflow (End-to-End)
**File:** `teknisi/02-service-workflow.puml`

**Fase 1 - Diagnosa:**
- View service ditugaskan
- Pilih booking
- Update status = 'diagnosed'
- Input catatan diagnosa
- Kirim notifikasi ke pelanggan

**Decision Point - Butuh Sparepart?**
- Ya → Update status = 'waiting_parts'
- Input catatan sparepart
- Tunggu datang → lanjut
- Tidak → Langsung ke 'in_progress'

**Fase 2 - Pengerjaan:**
- Loop kerjakan service
- Update progress berkala
- Tambah catatan progress
- Kirim notifikasi real-time ke pelanggan

**Fase 3 - Selesai:**
- Update status = 'completed'
- Input catatan akhir (hasil, garansi, biaya)
- Update earnings teknisi
- Kirim notifikasi ke pelanggan & admin

**Real-time:**
- Setiap update langsung ke pelanggan via Supabase Realtime

---

### 3. View Earnings & Profile
**File:** `teknisi/03-view-earnings-profile.puml`

**Dashboard Metrics:**
- Total service selesai
- Service aktif
- Total pendapatan
- Rating rata-rata

**Detail Pendapatan:**
- Group by bulan
- List per service dengan komisi
- Filter periode

**Riwayat Service:**
- All bookings teknisi
- Filter by status dan tanggal
- Detail service dengan review customer

**Profil:**
- View & edit info (nama, email, HP, spesialisasi)
- Ganti password

---

### 4. Chat dengan Pelanggan
**File:** `teknisi/04-chat.puml`

**Proses:**
- View list chat aktif dengan unread count
- Pilih chat dengan customer
- Load riwayat pesan
- Subscribe Realtime channel
- Send/receive message real-time
- Auto mark as read jika buka chat
- Notification sound untuk pesan baru

**Fitur:**
- Info customer di sidebar
- Link ke service terkait
- Read status

---

## Perbandingan Fitur per Role

| Fitur | Client | Admin | Teknisi |
|-------|--------|-------|---------|
| **Login** | Email/Password | Email/Password | Username/Password |
| **Tabel Auth** | users (role='user') | users (role='admin') | teknisi |
| **Dashboard** | Produk page | Metrics & charts | Service aktif |
| **Shopping** | ✅ Browse, cart, checkout | ❌ | ❌ |
| **Payment** | ✅ Midtrans | ❌ | ❌ |
| **Booking** | ✅ Create | ✅ Assign teknisi | ✅ Handle service |
| **Tracking** | ✅ Order & booking | ❌ | ❌ |
| **Manage Products** | ❌ | ✅ CRUD | ❌ |
| **Manage Vouchers** | ✅ Use | ✅ CRUD | ❌ |
| **Service Workflow** | ❌ | ❌ | ✅ Full workflow |
| **Target** | ✅ View & claim | ✅ Create & monitor | ❌ |
| **Chat** | ✅ Dengan admin/teknisi | ✅ Dengan semua | ✅ Dengan customer |
| **Keluhan** | ✅ Submit | ✅ Reply | ✅ Receive review |
| **Notifikasi** | ✅ All events | ✅ All events | ✅ Service events |

---

## Cara Render per Role

### Render semua diagram Client:
```bash
puml generate docs/activity-diagrams/client/*.puml -o docs/activity-diagrams/client/dist/
```

### Render semua diagram Admin:
```bash
puml generate docs/activity-diagrams/admin/*.puml -o docs/activity-diagrams/admin/dist/
```

### Render semua diagram Teknisi:
```bash
puml generate docs/activity-diagrams/teknisi/*.puml -o docs/activity-diagrams/teknisi/dist/
```

### Render SEMUA sekaligus:
```bash
puml generate docs/activity-diagrams/**/*.puml -o docs/activity-diagrams/dist/
```

---

## Statistik

**Total Activity Diagram:** 18 diagram
- **Client:** 7 diagram
- **Admin:** 7 diagram
- **Teknisi:** 4 diagram

**Coverage:**
- ✅ Complete authentication flow per role
- ✅ E-commerce full cycle (client)
- ✅ Service booking full cycle (client → admin → teknisi)
- ✅ Admin CRUD operations (products, vouchers, users, teknisi)
- ✅ Teknisi service workflow end-to-end
- ✅ Real-time chat & notification
- ✅ Target & reward system

---

**Terakhir Diupdate:** 17 Desember 2025  
**Proyek:** Chicha Mobile  
**Versi:** 2.0 (Organized by Role)
