# 🎫 PANDUAN SETUP VOUCHER SYSTEM

## Masalah: Dropdown Voucher Kosong

Jika dropdown voucher tidak menampilkan pilihan, artinya:
1. ❌ Tabel `vouchers` belum dibuat
2. ❌ Belum ada data voucher di database
3. ❌ Voucher sudah expired atau belum valid

---

## ✅ SOLUSI: Langkah Setup (WAJIB)

### **Step 1: Buka Supabase SQL Editor**
1. Login ke Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: **chicha-mobile** (caiaydaycuhtxewzxasz.supabase.co)
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**

---

### **Step 2: Run Migration - Create Tables**
Copy & paste file: **`create-vouchers-table.sql`**

```sql
-- Jalankan seluruh isi file create-vouchers-table.sql
-- File ini akan membuat:
-- ✅ Table vouchers
-- ✅ Table voucher_usage  
-- ✅ Add columns ke table orders
-- ✅ Indexes untuk performa
-- ✅ RLS Policies
```

Klik tombol **RUN** atau tekan `Ctrl + Enter`

**Expected Output:**
```
✅ CREATE TABLE vouchers
✅ CREATE TABLE voucher_usage
✅ ALTER TABLE orders
✅ CREATE INDEX
✅ CREATE POLICY
```

---

### **Step 3: Insert Sample Data**
Copy & paste file: **`insert-sample-vouchers.sql`**

```sql
-- Jalankan seluruh isi file insert-sample-vouchers.sql
-- File ini akan insert 5 voucher sample:
-- 1. WELCOME10 - Diskon 10%
-- 2. HEMAT25K - Potongan Rp 25.000
-- 3. BELANJA15 - Diskon 15%
-- 4. SPESIAL50K - Potongan Rp 50.000
-- 5. MEMBER20 - Diskon 20%
```

Klik tombol **RUN**

**Expected Output:**
```
✅ INSERT 5 rows
✅ SELECT shows 5 vouchers
```

---

### **Step 4: Verify Data**
Copy & paste file: **`check-vouchers-status.sql`**

```sql
-- Check status vouchers
SELECT 
  code,
  name,
  type,
  value,
  min_purchase,
  quota,
  used,
  quota - used as available,
  valid_until,
  is_active,
  CASE 
    WHEN valid_until < NOW() THEN '❌ EXPIRED'
    WHEN valid_from > NOW() THEN '⏳ NOT YET VALID'
    WHEN is_active = false THEN '🔒 INACTIVE'
    WHEN used >= quota THEN '📦 QUOTA FULL'
    ELSE '✅ AVAILABLE'
  END as status
FROM vouchers
ORDER BY min_purchase;
```

**Expected Result:**
Harus ada 5 vouchers dengan status **✅ AVAILABLE**

---

## 🔍 Debug di Browser

### **Step 5: Check Console Logs**

1. Buka halaman checkout: https://chicha-mobile.me/client/checkout
2. Tekan `F12` untuk buka Developer Tools
3. Buka tab **Console**
4. Refresh halaman

**Lihat logs:**
```
🎫 Fetching vouchers from API...
🎫 API Response: {vouchers: Array(5)}
🎫 Vouchers count: 5
```

**Jika muncul warning:**
```
⚠️ No vouchers available. Please check:
1. Run create-vouchers-table.sql in Supabase
2. Run insert-sample-vouchers.sql in Supabase
3. Check voucher valid_from and valid_until dates
```

**Action:** Ulangi Step 1-3 di atas!

---

## 🧪 Test Manual di Supabase

Jika masih error, test manual API:

### **Test GET Vouchers:**
```sql
-- Di SQL Editor, jalankan:
SELECT * FROM vouchers WHERE is_active = true AND valid_until >= NOW();
```

Jika hasilnya **empty**, berarti:
- Voucher sudah expired (valid_until < NOW())
- Voucher belum valid (valid_from > NOW())
- Voucher tidak aktif (is_active = false)

### **Fix Vouchers Date:**
```sql
-- Update tanggal agar voucher aktif 30 hari ke depan
UPDATE vouchers 
SET 
  valid_from = NOW(),
  valid_until = NOW() + INTERVAL '30 days',
  is_active = true
WHERE is_active = true;
```

---

## 📋 Checklist Troubleshooting

- [ ] **Tabel `vouchers` sudah dibuat?**
  ```sql
  SELECT * FROM information_schema.tables WHERE table_name = 'vouchers';
  ```

- [ ] **Ada data voucher?**
  ```sql
  SELECT COUNT(*) FROM vouchers;
  ```

- [ ] **Voucher aktif dan belum expired?**
  ```sql
  SELECT * FROM vouchers 
  WHERE is_active = true 
  AND valid_from <= NOW() 
  AND valid_until >= NOW();
  ```

- [ ] **RLS Policy sudah benar?**
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'vouchers';
  ```

- [ ] **API berjalan?**
  - Buka browser: https://chicha-mobile.me/api/vouchers
  - Harusnya return JSON: `{vouchers: [...]}`

---

## 🎯 Expected Result

Setelah semua step di atas:

1. **Di Supabase:** Ada 5 vouchers dengan status AVAILABLE
2. **Di Console Browser:** Log menunjukkan 5 vouchers fetched
3. **Di Checkout Page:** Dropdown menampilkan 5 voucher options
4. **User bisa:** Pilih voucher dari dropdown atau input manual

---

## 🆘 Masih Bermasalah?

Screenshot dan share:
1. ❓ Result dari `check-vouchers-status.sql`
2. ❓ Console logs di browser (F12)
3. ❓ Error message (jika ada)

---

**File yang perlu dijalankan:**
1. ✅ `create-vouchers-table.sql` - Create tables & policies
2. ✅ `insert-sample-vouchers.sql` - Insert 5 sample vouchers
3. ✅ `check-vouchers-status.sql` - Verify data

**Setelah selesai, refresh halaman checkout dan voucher akan muncul!** 🎉
