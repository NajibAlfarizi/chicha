# ALUR STATUS PERBAIKAN HP - CHICHA MOBILE (SIMPLIFIED)

## 📱 Deskripsi Umum

Dokumen ini menjelaskan alur lengkap status perbaikan HP dari customer mengantarkan HP hingga selesai diperbaiki atau dibatalkan. Sistem menggunakan **4 status sederhana** yang mudah dipahami oleh semua pihak.

## 🔄 Status Perbaikan (Simplified)

Sistem menggunakan 4 status utama dalam proses perbaikan:

| Status | Warna Badge | Deskripsi | Actor |
|--------|-------------|-----------|-------|
| **Menunggu** | Kuning | HP baru diantar, menunggu pemeriksaan dan keputusan | Toko/Admin |
| **Diproses** | Biru | HP diterima untuk perbaikan dan sedang dikerjakan | Teknisi |
| **Selesai** | Hijau | Perbaikan selesai, HP siap diambil | Teknisi |
| **Dibatalkan** | Merah | Customer batal perbaikan | Toko/Admin |

## 📋 Alur Lengkap Status Perbaikan

### 1️⃣ Customer Mengantarkan HP (MENUNGGU)

**Actor:** Customer → Toko/Admin

1. Customer datang ke toko membawa HP yang rusak
2. Staff toko membuat booking baru dengan data:
   - Nama customer
   - Nomor HP customer
   - Device name (merk dan tipe HP)
   - Keluhan/masalah yang dialami
3. Sistem generate service code otomatis (contoh: SRV-20260304-A1B2)
4. **Status diset: MENUNGGU** 🟡
5. Service code diberikan kepada customer untuk tracking

**Karakteristik Status Menunggu:**
- Booking baru saja dibuat
- HP menunggu pemeriksaan
- Menunggu keputusan diterima atau ditolak
- Customer bisa tracking dengan service code

---

### 2️⃣ Pemeriksaan dan Konfirmasi

**Actor:** Teknisi → Toko/Admin → Customer

1. Teknisi mengambil HP yang berstatus Menunggu
2. Melakukan pemeriksaan:
   - Cek kondisi fisik HP
   - Cek kerusakan hardware/software
   - Identifikasi masalah utama
   - Estimasi waktu pengerjaan
3. Staff toko menghubungi customer untuk konfirmasi

---

### 3️⃣ Keputusan Customer (Terima atau Tolak)

**Actor:** Customer

#### ❌ Opsi A: Customer TIDAK Setuju (DIBATALKAN)

Jika customer memutuskan untuk tidak melanjutkan perbaikan karena:
- Biaya terlalu mahal
- Tidak worth it untuk diperbaiki
- Ingin ganti HP baru
- Kerusakan terlalu parah
- Alasan lainnya

**Langkah:**
1. Admin/Toko update status ke **DIBATALKAN** 🔴
2. HP dikembalikan kepada customer
3. **PROSES SELESAI** - tidak ada perbaikan

---

#### ✅ Opsi B: Customer SETUJU (DIPROSES)

Jika customer setuju untuk melanjutkan perbaikan:

**Langkah:**
1. Teknisi update status ke **DIPROSES** 🔵
2. Teknisi mulai mengerjakan perbaikan HP

**Karakteristik Status Diproses:**
- HP sedang dalam proses perbaikan
- Teknisi sedang mengerjakan
- **Termasuk saat menunggu spare part** (tidak perlu ganti status)
- Customer menunggu proses selesai

---

### 4️⃣ Proses Perbaikan (DIPROSES)

**Actor:** Teknisi

Selama proses perbaikan, teknisi mengerjakan perbaikan HP. Status tetap **DIPROSES** 🔵 meskipun:
- Sedang aktif mengerjakan
- Menunggu spare part datang
- Spare part datang dan lanjut kerja

**Tidak perlu ganti status** saat menunggu spare part. Cukup tambahkan catatan di progress notes.

**Contoh Progress Notes:**
- "Sedang ganti LCD"
- "Menunggu spare part IC power, estimasi 2 hari"
- "Spare part sudah datang, melanjutkan perbaikan"
- "Hampir selesai, tinggal testing"

---

### 5️⃣ Perbaikan Selesai (SELESAI)

**Actor:** Teknisi → Toko/Admin → Customer

1. Teknisi selesai perbaikan
2. Test HP untuk memastikan sudah normal
3. Teknisi update status ke **SELESAI** 🟢
4. Mengisi progress notes: "Perbaikan selesai, HP sudah normal"
5. Staff toko menghubungi customer bahwa HP sudah siap diambil
6. Customer datang ke toko untuk mengambil HP
7. **PROSES SELESAI**

**Karakteristik Status Selesai:**
- Perbaikan 100% selesai
- HP sudah ditest dan berfungsi normal
- Siap diambil customer
- Customer bisa cek status via tracking dengan service code

---

## 🎯 Diagram Alur Status (Simplified)

```
MENUNGGU (🟡)
    ↓
    ↓ [Teknisi periksa HP + Konfirmasi customer]
    ↓
    ├─→ TIDAK SETUJU → DIBATALKAN (🔴) → [Selesai]
    │
    └─→ SETUJU → DIPROSES (🔵)
                      ↓
                      ↓ [Perbaikan + (optional) tunggu spare part]
                      ↓
                  SELESAI (🟢) → [Selesai]
```

## 📊 Ringkasan Transisi Status

| Dari Status | Ke Status | Kondisi | Actor |
|-------------|-----------|---------|-------|
| - | MENUNGGU | Booking baru dibuat | Admin/Toko |
| MENUNGGU | DIBATALKAN | Customer tidak setuju perbaikan | Admin/Toko |
| MENUNGGU | DIPROSES | Customer setuju perbaikan | Teknisi |
| DIPROSES | SELESAI | Perbaikan selesai | Teknisi |

## 🔍 Tracking untuk Customer

Customer bisa tracking status HP mereka kapan saja dengan:
1. Buka halaman `/client/track`
2. Input service code yang diberikan
3. Lihat status saat ini dengan badge berwarna
4. Lihat progress notes dari teknisi
5. Lihat estimasi waktu selesai

Sistem tracking memberikan transparansi penuh kepada customer tentang progress perbaikan HP mereka tanpa harus menghubungi toko.

## ✅ Best Practices

### Untuk Teknisi:
- ✅ Selalu update progress notes dengan jelas
- ✅ Berikan estimasi waktu yang realistis
- ✅ Update status segera setelah ada perubahan
- ✅ Catat semua spare part yang dibutuhkan
- ✅ Test HP sebelum set status Completed

### Untuk Admin/Toko:
- ✅ Catat data customer dengan lengkap saat booking
- ✅ Berikan service code kepada customer
- ✅ Segera hubungi customer setelah status Diagnosed
- ✅ Jelaskan biaya dan waktu dengan detail
- ✅ Hubungi customer saat status Completed

### Untuk Customer:
- ✅ Simpan service code untuk tracking
- ✅ Cek status secara berkala via website
- ✅ Response konfirmasi dengan cepat
- ✅ Ambil HP segera setelah status Completed

## 📝 Contoh Skenario Lengkap

### Skenario 1: Perbaikan Berhasil Tanpa Kendala

1. **10:00** - Customer datang, booking dibuat → **PENDING** 🟡
2. **10:30** - Teknisi cek HP, LCD retak → **DIAGNOSED** 🔵
   - Notes: "LCD pecah, perlu ganti. Biaya Rp 500.000, estimasi 1 hari"
3. **11:00** - Customer dihubungi, setuju perbaikan → **IN PROGRESS** 🟣
4. **14:00** - Teknisi ganti LCD, test normal → **COMPLETED** 🟢
   - Notes: "Perbaikan selesai, LCD sudah diganti, HP normal"
5. **14:30** - Customer dihubungi, ambil HP

## 📝 Contoh Skenario Lengkap

### Skenario 1: Perbaikan Berhasil Tanpa Kendala

1. **10:00** - Customer datang, booking dibuat → **MENUNGGU** 🟡
2. **10:30** - Teknisi cek HP, LCD retak, customer setuju → **DIPROSES** 🔵
   - Notes: "LCD pecah, perlu ganti. Estimasi 4 jam"
3. **14:00** - Teknisi ganti LCD, test normal → **SELESAI** 🟢
   - Notes: "Perbaikan selesai, LCD sudah diganti, HP normal"
4. **14:30** - Customer dihubungi, ambil HP

**Total waktu: 4.5 jam**

---

### Skenario 2: Perbaikan dengan Kendala Spare Part

1. **09:00** - Customer datang, booking dibuat → **MENUNGGU** 🟡
2. **10:00** - Teknisi cek HP, IC power rusak, customer setuju → **DIPROSES** 🔵
   - Notes: "IC power rusak, perlu ganti. Estimasi 3 hari. IC power dalam pemesanan."
3. **2 hari kemudian** - Status tetap **DIPROSES** 🔵
   - Notes: "IC power sudah datang, melanjutkan perbaikan"
4. **3 jam kemudian** - Perbaikan selesai → **SELESAI** 🟢
   - Notes: "IC power sudah diganti, HP charging normal"
5. Customer ambil HP

**Total waktu: 2 hari 3 jam**

**Catatan:** Status tetap DIPROSES meskipun menunggu spare part. Tidak perlu ganti ke status lain.

---

### Skenario 3: Customer Batal Perbaikan

1. **13:00** - Customer datang, booking dibuat → **MENUNGGU** 🟡
2. **13:30** - Teknisi cek HP, motherboard rusak, customer tidak setuju → **DIBATALKAN** 🔴
   - Notes: "Motherboard rusak total, biaya terlalu tinggi. Customer batal perbaikan."
3. **14:15** - HP dikembalikan ke customer

**Total waktu: 1.5 jam - tidak ada perbaikan**

---

## 🎨 Implementasi di Kode

Lihat file terkait:
- **Flowchart:** `docs/flowcharts/repair-status-workflow.puml`
- **Types:** `lib/types.ts` (ProgressStatus type)
- **Tracking Page:** `app/client/track/page.tsx`
- **Teknisi Service:** `app/teknisi/service/[id]/page.tsx`
- **Badge Component:** Status badge dengan warna di tracking page

## 🔗 Referensi

- [BAB-4-TRACKING-SERVIS.md](../../BAB-4-TRACKING-SERVIS.md)
- [TEKNISI-SYSTEM-GUIDE.md](../../TEKNISI-SYSTEM-GUIDE.md)
- [teknisi-flowchart.puml](./teknisi-flowchart.puml)

---

**Dibuat:** 4 Maret 2026  
**Versi:** 1.0  
**Author:** Chicha Mobile Development Team
