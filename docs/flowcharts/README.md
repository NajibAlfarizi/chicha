# Flowchart Sistem Chicha Mobile

Dokumentasi lengkap flowchart untuk semua role dan integrasi sistem.

## 📁 File Flowchart

### 1. **Client Flowchart** 
**File:** `client-flowchart.puml`

**Mencakup:**
- 🔐 Authentication (Login/Register)
- 🛍️ E-Commerce (Browse, Cart, Checkout)
- 💳 Payment Integration (Midtrans, COD)
- 🎟️ Voucher System
- 📱 Service Booking
- 📍 Track Service Progress
- 💬 Chat (Order & Booking)
- 🔔 Notifications
- 👤 Account Management (Profile, Orders, Bookings, Target)
- ⚙️ Auto Background Process

---

### 2. **Admin Flowchart**
**File:** `admin-flowchart.puml`

**Mencakup:**
- 📊 Dashboard & Statistics
- 📦 Manajemen Produk (CRUD with confirmation dialog)
- 📁 Manajemen Kategori (CRUD with confirmation dialog)
- 🛒 Manajemen Pesanan
  - View all orders
  - Auto-scan expired orders
  - Manual cleanup expired
  - Update order status
  - Cancel order with reason
- 🔧 Manajemen Booking Service
  - Assign teknisi
  - Update booking status
- 👨‍🔧 Manajemen Teknisi (CRUD with confirmation dialog)
- 🎫 Manajemen Voucher (CRUD with confirmation dialog)
- 🎯 Manajemen Target
- 💬 Chat Management

---

### 3. **Teknisi Flowchart**
**File:** `teknisi-flowchart.puml`

**Mencakup:**
- 🏠 Dashboard Teknisi
- 📋 My Bookings (List assigned bookings)
- 🔄 Update Service Progress
  - Progress status (pending, diagnosed, waiting_parts, in_progress, completed, cancelled)
  - Progress notes
  - Estimated completion date
- 💬 Chat dengan Customer
- 👤 Profile Management
- 🔔 Notifications
- 📈 Work Statistics
- 📜 Service History

---

### 4. **System Integration Flowchart**
**File:** `system-integration-flowchart.puml`

**Mencakup Integrasi Lengkap:**
- 🔐 Authentication Flow (Multi-role)
- 🛍️ E-Commerce Flow (Client ↔ Admin)
- 💳 Payment Gateway Integration (Midtrans)
- ⏰ Auto-Cancel Expired Orders
- 🔧 Service Booking Flow (Client → Admin → Teknisi)
- 💬 Chat System Flow (Real-time)
- 🎫 Voucher & Target System
- 🔔 Notification System (Event-driven)
- 🧹 Auto-Cleanup System

---

### 5. **Repair Status Workflow** ⭐ NEW
**File:** `repair-status-workflow.puml`

**Mencakup Alur Lengkap Status Perbaikan:**
- 📱 Customer mengantarkan HP ke toko
- 🔍 Teknisi melakukan pemeriksaan/diagnosa
- ✅ Konfirmasi customer (lanjut atau batal)
- 🔧 Proses perbaikan dengan status detail:
  - 🟡 **Pending** - Menunggu pemeriksaan
  - 🔵 **Diagnosed** - Sudah diperiksa, menunggu konfirmasi
  - 🟣 **In Progress** - Sedang diperbaiki
  - 🟠 **Waiting Parts** - Menunggu spare part
  - 🟢 **Completed** - Selesai diperbaiki
  - 🔴 **Cancelled** - Customer batal perbaikan
- 📞 Komunikasi dengan customer di setiap tahap
- 📊 Timeline progress perbaikan

**Dokumentasi Lengkap:** [REPAIR-STATUS-WORKFLOW-GUIDE.md](../../REPAIR-STATUS-WORKFLOW-GUIDE.md)

---

### 6. **Status Transition Diagram** ⭐ NEW
**File:** `status-transition-diagram.puml`

**State Diagram untuk Transisi Status:**
- 🔄 Visual diagram transisi antar status
- 🎯 Kondisi untuk setiap transisi
- 👥 Actor yang bertanggung jawab
- 📝 Notes untuk setiap status
- 🔀 Alur bolak-balik (In Progress ↔ Waiting Parts)

**Diagram ini lebih simple dan fokus pada transisi status saja, cocok untuk:**
- Quick reference transisi status
- Training teknisi baru
- Dokumentasi sistem

---

## 🎨 Cara Melihat Flowchart

### Option 1: VS Code Extension (Recommended)
1. Install extension: **PlantUML** oleh jebbs
2. Install Java (required untuk render)
3. Buka file `.puml`
4. Tekan `Alt + D` untuk preview

### Option 2: Online Viewer
1. Buka [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copy paste isi file `.puml`
3. Klik Generate
4. View/download diagram

### Option 3: PlantUML Server
```bash
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty
```
Akses via: `http://localhost:8080`

### Option 4: CLI (Local)
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG
puml generate client-flowchart.puml -o output/
```

---

## 📊 Diagram Types

Semua flowchart menggunakan **Activity Diagram** dari PlantUML dengan:
- ✅ Swimlanes untuk role separation
- ✅ Partitions untuk grouping features
- ✅ Decision points (if/else)
- ✅ Fork/join untuk parallel actions
- ✅ Notes untuk detail explanation
- ✅ Color coding by role

---

## 🎨 Color Scheme

| Role | Background Color | Description |
|------|------------------|-------------|
| **Client** | PaleGreen | Activities pelanggan |
| **Admin** | LightBlue | Activities administrator |
| **Teknisi** | LightSalmon | Activities teknisi |
| **System** | LightCyan | Automated processes |

---

## 📖 Dokumentasi Terkait

- `docs/ACTIVITY-DIAGRAMS-BY-ROLE.md` - Activity diagrams lengkap per role
- `docs/USE-CASE-DOCUMENTATION.md` - Use case documentation
- `docs/DOKUMENTASI-SISTEM-LENGKAP.md` - Complete system documentation

---

## 🔄 Update History

| Date | Version | Description |
|------|---------|-------------|
| 2026-02-26 | 1.0 | Initial flowchart creation untuk semua role |

---

## 📝 Notes

### Key Features Highlighted:
1. **Auto-Cancel Expired Orders** - Sistem otomatis membatalkan pesanan yang melewati batas waktu pembayaran
2. **Confirmation Dialogs** - AlertDialog untuk konfirmasi delete actions (produk, kategori, teknisi, voucher)
3. **Real-time Progress Updates** - Teknisi dapat update progress service real-time
4. **Target & Reward System** - CRM features dengan auto-generate voucher
5. **Multi-role Chat System** - Order chat (Client-Admin) dan Booking chat (Client-Teknisi)
6. **Payment Integration** - Midtrans dengan multiple payment methods
7. **Notification System** - Event-driven notifications untuk semua role

### Technical Details:
- Database: Supabase (PostgreSQL)
- Auth: Session-based with role checking
- Payment: Midtrans Snap integration
- Real-time: Supabase real-time subscriptions
- File Structure: Next.js 14 App Router

---

## 🚀 Usage in Development

Gunakan flowchart ini untuk:
- ✅ Memahami user journey setiap role
- ✅ Reference saat develop fitur baru
- ✅ Testing preparation (test scenarios)
- ✅ Documentation untuk stakeholders
- ✅ Onboarding team members baru

---

Dibuat dengan ❤️ untuk Chicha Mobile E-Commerce & Service System
