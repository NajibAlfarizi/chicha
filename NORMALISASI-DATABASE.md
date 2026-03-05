# NORMALISASI DATABASE

## Penjelasan Normalisasi Database

Normalisasi database adalah proses pengorganisasian data dalam database untuk mengurangi redundansi dan meningkatkan integritas data. Proses ini melibatkan pembagian tabel besar menjadi tabel-tabel yang lebih kecil dan mendefinisikan relasi antar tabel tersebut.

Dalam dokumentasi ini, akan ditunjukkan proses normalisasi dari bentuk tidak normal (Unnormalized Form) hingga bentuk normal ketiga (3NF) menggunakan contoh data transaksi pemesanan produk handphone pada sistem Chicha Mobile.

---

## Bentuk Tidak Normal (Unnormalized Form - UNF)

Pada bentuk tidak normal, semua data disimpan dalam satu tabel besar dengan banyak redundansi dan repeating groups (kelompok data yang berulang). Dalam contoh ini, informasi customer, order, dan item yang dipesan semuanya ada dalam satu tabel.

**Tabel: DATA_TRANSAKSI**

| order_id | order_date | customer_name | customer_email | customer_phone | customer_address | product_names | product_prices | product_quantities | product_subtotals | voucher_code | discount_amount | total_price | payment_status | payment_method |
|----------|------------|---------------|----------------|----------------|------------------|---------------|----------------|-------------------|-------------------|--------------|-----------------|-------------|----------------|----------------|
| ORD001 | 2026-02-15 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | iPhone 15 Pro, Case iPhone, Tempered Glass | 15000000, 150000, 50000 | 1, 2, 1 | 15000000, 300000, 50000 | DISC10 | 1535000 | 13815000 | paid | midtrans |
| ORD002 | 2026-02-16 | Siti Nurhaliza | siti@email.com | 082345678901 | Jl. Sudirman No. 25, Bandung | Samsung Galaxy S24, Charger Samsung | 12000000, 250000 | 1, 1 | 12000000, 250000 | NULL | 0 | 12250000 | pending | midtrans |
| ORD003 | 2026-02-17 | Budi Santoso | budi@email.com | 083456789012 | Jl. Gatot Subroto No. 5, Surabaya | Xiaomi 14 Pro, Power Bank | 9000000, 300000 | 1, 1 | 9000000, 300000 | NEWUSER | 465000 | 8835000 | paid | midtrans |
| ORD004 | 2026-02-18 | Dewi Lestari | dewi@email.com | 084567890123 | Jl. Ahmad Yani No. 15, Semarang | OPPO Find X7, Earphone, Screen Protector | 8500000, 200000, 80000 | 1, 1, 2 | 8500000, 200000, 160000 | NULL | 0 | 8860000 | failed | midtrans |
| ORD005 | 2026-02-19 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | Vivo X100 Pro, Case Vivo | 11000000, 120000 | 1, 1 | 11000000, 120000 | DISC10 | 1112000 | 10008000 | paid | midtrans |

**Masalah pada bentuk UNF:**
1. **Repeating Groups**: Data produk (product_names, product_prices, dll) dalam satu cell dengan pemisah koma
2. **Redundansi Data**: Informasi customer (Ahmad Rizki) muncul 2 kali dengan data yang sama
3. **Update Anomaly**: Jika customer mengubah alamat, harus update di semua transaksi
4. **Insert Anomaly**: Tidak bisa menyimpan data customer tanpa transaksi
5. **Delete Anomaly**: Jika transaksi dihapus, data customer ikut hilang
6. **Non-Atomic Values**: Satu kolom berisi multiple values (tidak atomic)

---

## Bentuk Normal Pertama (First Normal Form - 1NF)

Untuk mencapai 1NF, kita harus menghilangkan repeating groups dan memastikan setiap cell hanya berisi nilai atomic (tidak ada multiple values dalam satu cell). Caranya adalah dengan membuat row terpisah untuk setiap item produk dalam order.

**Tabel: DATA_TRANSAKSI_1NF**

| order_id | order_date | customer_name | customer_email | customer_phone | customer_address | product_name | product_price | product_quantity | product_subtotal | voucher_code | discount_amount | total_price | payment_status | payment_method |
|----------|------------|---------------|----------------|----------------|------------------|--------------|---------------|------------------|------------------|--------------|-----------------|-------------|----------------|----------------|
| ORD001 | 2026-02-15 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | iPhone 15 Pro | 15000000 | 1 | 15000000 | DISC10 | 1535000 | 13815000 | paid | midtrans |
| ORD001 | 2026-02-15 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | Case iPhone | 150000 | 2 | 300000 | DISC10 | 1535000 | 13815000 | paid | midtrans |
| ORD001 | 2026-02-15 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | Tempered Glass | 50000 | 1 | 50000 | DISC10 | 1535000 | 13815000 | paid | midtrans |
| ORD002 | 2026-02-16 | Siti Nurhaliza | siti@email.com | 082345678901 | Jl. Sudirman No. 25, Bandung | Samsung Galaxy S24 | 12000000 | 1 | 12000000 | NULL | 0 | 12250000 | pending | midtrans |
| ORD002 | 2026-02-16 | Siti Nurhaliza | siti@email.com | 082345678901 | Jl. Sudirman No. 25, Bandung | Charger Samsung | 250000 | 1 | 250000 | NULL | 0 | 12250000 | pending | midtrans |
| ORD003 | 2026-02-17 | Budi Santoso | budi@email.com | 083456789012 | Jl. Gatot Subroto No. 5, Surabaya | Xiaomi 14 Pro | 9000000 | 1 | 9000000 | NEWUSER | 465000 | 8835000 | paid | midtrans |
| ORD003 | 2026-02-17 | Budi Santoso | budi@email.com | 083456789012 | Jl. Gatot Subroto No. 5, Surabaya | Power Bank | 300000 | 1 | 300000 | NEWUSER | 465000 | 8835000 | paid | midtrans |
| ORD004 | 2026-02-18 | Dewi Lestari | dewi@email.com | 084567890123 | Jl. Ahmad Yani No. 15, Semarang | OPPO Find X7 | 8500000 | 1 | 8500000 | NULL | 0 | 8860000 | failed | midtrans |
| ORD004 | 2026-02-18 | Dewi Lestari | dewi@email.com | 084567890123 | Jl. Ahmad Yani No. 15, Semarang | Earphone | 200000 | 1 | 200000 | NULL | 0 | 8860000 | failed | midtrans |
| ORD004 | 2026-02-18 | Dewi Lestari | dewi@email.com | 084567890123 | Jl. Ahmad Yani No. 15, Semarang | Screen Protector | 80000 | 2 | 160000 | NULL | 0 | 8860000 | failed | midtrans |
| ORD005 | 2026-02-19 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | Vivo X100 Pro | 11000000 | 1 | 11000000 | DISC10 | 1112000 | 10008000 | paid | midtrans |
| ORD005 | 2026-02-19 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | Case Vivo | 120000 | 1 | 120000 | DISC10 | 1112000 | 10008000 | paid | midtrans |

**Primary Key**: (order_id, product_name)

**Karakteristik 1NF:**
- ✅ Setiap cell berisi nilai atomic (hanya satu nilai)
- ✅ Tidak ada repeating groups
- ✅ Setiap row unik dengan composite key (order_id + product_name)

**Masalah yang masih ada:**
- ❌ Redundansi data customer dan order masih tinggi
- ❌ Partial dependency: Ada atribut yang hanya bergantung pada sebagian primary key
- ❌ Informasi customer diulang di setiap baris item
- ❌ Informasi order (total_price, discount, dll) diulang untuk setiap item

---

## Bentuk Normal Kedua (Second Normal Form - 2NF)

Untuk mencapai 2NF, tabel harus sudah dalam 1NF dan menghilangkan partial dependency (ketergantungan parsial). Partial dependency terjadi ketika ada atribut non-key yang bergantung hanya pada sebagian dari composite primary key, bukan keseluruhan key.

Kita akan memisahkan menjadi 3 tabel:
1. **ORDERS**: Informasi header order
2. **ORDER_ITEMS**: Detail item dalam setiap order
3. Informasi customer masih ada di tabel ORDERS (akan dipindah di 3NF)

**Tabel 1: ORDERS**

| order_id | order_date | customer_name | customer_email | customer_phone | customer_address | voucher_code | discount_amount | total_price | payment_status | payment_method |
|----------|------------|---------------|----------------|----------------|------------------|--------------|-----------------|-------------|----------------|----------------|
| ORD001 | 2026-02-15 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | DISC10 | 1535000 | 13815000 | paid | midtrans |
| ORD002 | 2026-02-16 | Siti Nurhaliza | siti@email.com | 082345678901 | Jl. Sudirman No. 25, Bandung | NULL | 0 | 12250000 | pending | midtrans |
| ORD003 | 2026-02-17 | Budi Santoso | budi@email.com | 083456789012 | Jl. Gatot Subroto No. 5, Surabaya | NEWUSER | 465000 | 8835000 | paid | midtrans |
| ORD004 | 2026-02-18 | Dewi Lestari | dewi@email.com | 084567890123 | Jl. Ahmad Yani No. 15, Semarang | NULL | 0 | 8860000 | failed | midtrans |
| ORD005 | 2026-02-19 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta | DISC10 | 1112000 | 10008000 | paid | midtrans |

**Primary Key**: order_id

**Tabel 2: ORDER_ITEMS**

| order_item_id | order_id | product_name | product_price | quantity | subtotal |
|---------------|----------|--------------|---------------|----------|----------|
| ITEM001 | ORD001 | iPhone 15 Pro | 15000000 | 1 | 15000000 |
| ITEM002 | ORD001 | Case iPhone | 150000 | 2 | 300000 |
| ITEM003 | ORD001 | Tempered Glass | 50000 | 1 | 50000 |
| ITEM004 | ORD002 | Samsung Galaxy S24 | 12000000 | 1 | 12000000 |
| ITEM005 | ORD002 | Charger Samsung | 250000 | 1 | 250000 |
| ITEM006 | ORD003 | Xiaomi 14 Pro | 9000000 | 1 | 9000000 |
| ITEM007 | ORD003 | Power Bank | 300000 | 1 | 300000 |
| ITEM008 | ORD004 | OPPO Find X7 | 8500000 | 1 | 8500000 |
| ITEM009 | ORD004 | Earphone | 200000 | 1 | 200000 |
| ITEM010 | ORD004 | Screen Protector | 80000 | 2 | 160000 |
| ITEM011 | ORD005 | Vivo X100 Pro | 11000000 | 1 | 11000000 |
| ITEM012 | ORD005 | Case Vivo | 120000 | 1 | 120000 |

**Primary Key**: order_item_id  
**Foreign Key**: order_id → ORDERS(order_id)

**Karakteristik 2NF:**
- ✅ Memenuhi syarat 1NF
- ✅ Tidak ada partial dependency
- ✅ Setiap atribut non-key bergantung penuh pada primary key
- ✅ Data order tidak lagi diulang untuk setiap item

**Masalah yang masih ada:**
- ❌ Transitive dependency: Informasi customer bergantung pada order_id, bukan langsung independent
- ❌ Data customer (Ahmad Rizki) masih muncul dalam 2 order berbeda
- ❌ Jika customer update email/phone/address, harus update di semua order

---

## Bentuk Normal Ketiga (Third Normal Form - 3NF)

Untuk mencapai 3NF, tabel harus sudah dalam 2NF dan menghilangkan transitive dependency (ketergantungan transitif). Transitive dependency terjadi ketika atribut non-key bergantung pada atribut non-key lainnya.

Kita akan memisahkan menjadi 5 tabel:
1. **CUSTOMERS**: Data pelanggan
2. **PRODUCTS**: Data produk
3. **VOUCHERS**: Data voucher diskon
4. **ORDERS**: Header order dengan referensi ke customer dan voucher
5. **ORDER_ITEMS**: Detail item dengan referensi ke order dan product

**Tabel 1: CUSTOMERS**

| customer_id | customer_name | email | phone | address |
|-------------|---------------|-------|-------|---------|
| CUST001 | Ahmad Rizki | ahmad@email.com | 081234567890 | Jl. Merdeka No. 10, Jakarta |
| CUST002 | Siti Nurhaliza | siti@email.com | 082345678901 | Jl. Sudirman No. 25, Bandung |
| CUST003 | Budi Santoso | budi@email.com | 083456789012 | Jl. Gatot Subroto No. 5, Surabaya |
| CUST004 | Dewi Lestari | dewi@email.com | 084567890123 | Jl. Ahmad Yani No. 15, Semarang |
| CUST005 | Eko Prasetyo | eko@email.com | 085678901234 | Jl. Diponegoro No. 30, Yogyakarta |

**Primary Key**: customer_id

**Tabel 2: PRODUCTS**

| product_id | product_name | category | price | stock |
|------------|--------------|----------|-------|-------|
| PROD001 | iPhone 15 Pro | Smartphone | 15000000 | 25 |
| PROD002 | Samsung Galaxy S24 | Smartphone | 12000000 | 30 |
| PROD003 | Xiaomi 14 Pro | Smartphone | 9000000 | 40 |
| PROD004 | OPPO Find X7 | Smartphone | 8500000 | 35 |
| PROD005 | Vivo X100 Pro | Smartphone | 11000000 | 20 |
| PROD006 | Case iPhone | Accessories | 150000 | 100 |
| PROD007 | Case Vivo | Accessories | 120000 | 80 |
| PROD008 | Charger Samsung | Accessories | 250000 | 60 |
| PROD009 | Tempered Glass | Accessories | 50000 | 150 |
| PROD010 | Screen Protector | Accessories | 80000 | 120 |
| PROD011 | Power Bank | Accessories | 300000 | 50 |
| PROD012 | Earphone | Accessories | 200000 | 70 |

**Primary Key**: product_id

**Tabel 3: VOUCHERS**

| voucher_id | voucher_code | discount_type | discount_value | min_purchase | max_discount | valid_from | valid_until | status |
|------------|--------------|---------------|----------------|--------------|--------------|------------|-------------|--------|
| VOUC001 | DISC10 | percentage | 10 | 500000 | 2000000 | 2026-02-01 | 2026-03-31 | active |
| VOUC002 | NEWUSER | percentage | 5 | 100000 | 500000 | 2026-02-01 | 2026-12-31 | active |
| VOUC003 | FLASH50 | fixed | 50000 | 200000 | 50000 | 2026-02-15 | 2026-02-29 | active |
| VOUC004 | LOYAL20 | percentage | 20 | 1000000 | 3000000 | 2026-01-01 | 2026-12-31 | active |
| VOUC005 | FREEONGKIR | fixed | 25000 | 0 | 25000 | 2026-02-01 | 2026-02-28 | active |

**Primary Key**: voucher_id

**Tabel 4: ORDERS**

| order_id | customer_id | order_date | voucher_id | discount_amount | total_price | payment_status | payment_method | payment_expired_at |
|----------|-------------|------------|------------|-----------------|-------------|----------------|----------------|--------------------|
| ORD001 | CUST001 | 2026-02-15 08:30:00 | VOUC001 | 1535000 | 13815000 | paid | midtrans | 2026-02-16 08:30:00 |
| ORD002 | CUST002 | 2026-02-16 10:15:00 | NULL | 0 | 12250000 | pending | midtrans | 2026-02-17 10:15:00 |
| ORD003 | CUST003 | 2026-02-17 14:20:00 | VOUC002 | 465000 | 8835000 | paid | midtrans | 2026-02-18 14:20:00 |
| ORD004 | CUST004 | 2026-02-18 16:45:00 | NULL | 0 | 8860000 | failed | midtrans | 2026-02-19 16:45:00 |
| ORD005 | CUST001 | 2026-02-19 09:00:00 | VOUC001 | 1112000 | 10008000 | paid | midtrans | 2026-02-20 09:00:00 |

**Primary Key**: order_id  
**Foreign Keys**: 
- customer_id → CUSTOMERS(customer_id)
- voucher_id → VOUCHERS(voucher_id)

**Tabel 5: ORDER_ITEMS**

| order_item_id | order_id | product_id | quantity | price_at_purchase | subtotal |
|---------------|----------|------------|----------|-------------------|----------|
| ITEM001 | ORD001 | PROD001 | 1 | 15000000 | 15000000 |
| ITEM002 | ORD001 | PROD006 | 2 | 150000 | 300000 |
| ITEM003 | ORD001 | PROD009 | 1 | 50000 | 50000 |
| ITEM004 | ORD002 | PROD002 | 1 | 12000000 | 12000000 |
| ITEM005 | ORD002 | PROD008 | 1 | 250000 | 250000 |
| ITEM006 | ORD003 | PROD003 | 1 | 9000000 | 9000000 |
| ITEM007 | ORD003 | PROD011 | 1 | 300000 | 300000 |
| ITEM008 | ORD004 | PROD004 | 1 | 8500000 | 8500000 |
| ITEM009 | ORD004 | PROD012 | 1 | 200000 | 200000 |
| ITEM010 | ORD004 | PROD010 | 2 | 80000 | 160000 |
| ITEM011 | ORD005 | PROD005 | 1 | 11000000 | 11000000 |
| ITEM012 | ORD005 | PROD007 | 1 | 120000 | 120000 |

**Primary Key**: order_item_id  
**Foreign Keys**:
- order_id → ORDERS(order_id)
- product_id → PRODUCTS(product_id)

**Karakteristik 3NF:**
- ✅ Memenuhi syarat 2NF
- ✅ Tidak ada transitive dependency
- ✅ Setiap atribut non-key hanya bergantung pada primary key
- ✅ Data customer terpisah dan tidak redundant
- ✅ Data produk terpisah dengan informasi lengkap
- ✅ Data voucher terpisah dengan aturan diskon
- ✅ Tidak ada redundansi data yang tidak perlu
- ✅ Mudah untuk update, insert, dan delete tanpa anomali

**Keuntungan 3NF:**
1. **Eliminasi Redundansi**: Data customer hanya disimpan sekali
2. **Data Integrity**: Update data customer otomatis berlaku untuk semua order
3. **Fleksibilitas**: Bisa menambah customer tanpa harus membuat order
4. **Efisiensi Storage**: Tidak ada duplikasi data yang tidak perlu
5. **Kemudahan Maintenance**: Perubahan struktur lebih mudah dilakukan
6. **Historical Data**: `price_at_purchase` menyimpan harga saat pembelian (bisa berbeda dengan harga current di tabel PRODUCTS)

---

## Diagram Entity Relationship (ERD)

```
CUSTOMERS (1) ----< (M) ORDERS (M) >---- (1) VOUCHERS
                            |
                            | (1)
                            |
                            V
                           (M)
                      ORDER_ITEMS
                           (M)
                            |
                            | (1)
                            V
                        PRODUCTS
```

**Relasi:**
- 1 Customer bisa memiliki banyak Orders (One-to-Many)
- 1 Order bisa menggunakan 1 Voucher atau tidak sama sekali (Many-to-One, Optional)
- 1 Order memiliki banyak Order Items (One-to-Many)
- 1 Product bisa ada di banyak Order Items (One-to-Many)

---

## Kesimpulan

Melalui proses normalisasi dari bentuk tidak normal hingga 3NF, kita telah:

1. **Menghilangkan Repeating Groups** (UNF → 1NF)
   - Memisahkan data produk yang disimpan dalam satu cell menjadi row terpisah

2. **Menghilangkan Partial Dependency** (1NF → 2NF)
   - Memisahkan informasi order dan order items ke tabel berbeda
   - Setiap atribut bergantung penuh pada primary key

3. **Menghilangkan Transitive Dependency** (2NF → 3NF)
   - Memisahkan data customer, product, dan voucher ke tabel terpisah
   - Menghilangkan ketergantungan transitif antar atribut non-key

**Hasil akhir**: Database yang efisien, konsisten, dan mudah di-maintain dengan 5 tabel yang saling berelasi:
- CUSTOMERS (5 rows)
- PRODUCTS (12 rows)
- VOUCHERS (5 rows)
- ORDERS (5 rows)
- ORDER_ITEMS (12 rows)

Database dalam bentuk 3NF meminimalkan redundansi data, mencegah anomali update/insert/delete, dan memudahkan maintenance serta skalabilitas sistem di masa depan.
