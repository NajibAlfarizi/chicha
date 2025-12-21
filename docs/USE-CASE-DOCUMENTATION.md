# Use Case Diagram Documentation - Chicha Mobile

## Overview
Diagram use case ini menggambarkan seluruh fungsionalitas sistem Chicha Mobile yang mencakup e-commerce produk elektronik dan sistem booking service teknisi.

---

## Actors

### 1. **Customer (Pelanggan)**
Pengguna yang dapat berbelanja produk, membuat booking service, dan berinteraksi dengan sistem.

**Hak Akses:**
- Authentication (login, register, logout, reset password)
- Browse dan search produk
- Shopping cart dan checkout
- Pembayaran melalui Midtrans
- Tracking order dan booking
- Submit complaint dan review
- Chat dengan admin/teknisi
- View notifikasi
- View dan claim target reward

---

### 2. **Admin (Administrator)**
Pengguna dengan hak akses penuh untuk mengelola seluruh sistem.

**Hak Akses:**
- Manage produk (CRUD)
- Manage kategori (CRUD)
- Manage voucher (CRUD)
- Manage user dan teknisi (CRUD)
- Update status order dan booking
- Assign teknisi ke booking
- Reply complaint
- Chat dengan customer
- View dashboard dan analytics
- Manage target/CRM

---

### 3. **Teknisi (Technician)**
Petugas service yang ditugaskan untuk menangani booking service dari customer.

**Hak Akses:**
- Login teknisi
- View assigned services
- Update service progress
- Complete service
- Add progress notes
- Diagnose issue
- Chat dengan customer
- View earnings
- View dashboard

---

### 4. **Midtrans Payment Gateway**
Sistem eksternal untuk processing pembayaran.

**Interaksi:**
- Receive payment notification
- Send payment callback
- Verify payment status

---

### 5. **System**
Proses otomatis yang berjalan di background.

**Fungsi:**
- Send notification otomatis
- Update target progress
- Real-time updates (chat, notification)

---

## Use Case Packages

### 📦 **1. Authentication**

#### UC_Login - Login
**Actor:** Customer, Admin, Teknisi  
**Description:** User melakukan login ke sistem  
**Includes:**
- UC_ValidateCredentials: Validasi username/email dan password
- UC_CreateSession: Membuat session untuk user yang berhasil login

**Flow:**
1. User memasukkan email/username dan password
2. Sistem validasi credentials
3. Jika valid, sistem create session
4. User diarahkan ke dashboard sesuai role

---

#### UC_Register - Register
**Actor:** Customer  
**Description:** User baru mendaftar akun  

**Flow:**
1. User mengisi form (nama, email, phone, password)
2. Sistem validasi data (email unique, password strength)
3. Sistem create user baru dengan role 'user'
4. User otomatis login

---

#### UC_TeknisiLogin - Teknisi Login
**Actor:** Teknisi  
**Description:** Teknisi login melalui portal khusus teknisi  
**Includes:**
- UC_ValidateCredentials
- UC_CreateSession

**Flow:**
1. Teknisi memasukkan username dan password
2. Sistem validasi credentials dari tabel teknisi
3. Create session dengan role teknisi
4. Redirect ke teknisi dashboard

---

#### UC_Logout - Logout
**Actor:** Customer, Admin, Teknisi  
**Description:** User logout dari sistem  

**Flow:**
1. User click logout
2. Sistem destroy session
3. Redirect ke homepage/login

---

#### UC_ResetPassword - Reset Password
**Actor:** Customer  
**Description:** User reset password yang terlupa  

**Flow:**
1. User memasukkan email
2. Sistem kirim reset password link
3. User click link dan set password baru

---

### 📦 **2. Product Management**

#### UC_BrowseProducts - Browse Products
**Actor:** Customer, Admin  
**Description:** Melihat daftar produk yang tersedia  

**Flow:**
1. User akses halaman produk
2. Sistem fetch produk dari database
3. Tampilkan grid produk dengan info (nama, harga, gambar, stock)

---

#### UC_ViewProductDetails - View Product Details
**Actor:** Customer  
**Description:** Melihat detail lengkap produk  

**Flow:**
1. User click produk
2. Sistem fetch detail produk (deskripsi, spesifikasi, review)
3. Tampilkan detail dengan opsi add to cart

---

#### UC_SearchProducts - Search Products
**Actor:** Customer  
**Description:** Mencari produk berdasarkan keyword  

**Flow:**
1. User ketik keyword di search bar
2. Sistem search produk berdasarkan nama/deskripsi
3. Tampilkan hasil search

---

#### UC_FilterByCategory - Filter by Category
**Actor:** Customer  
**Description:** Filter produk berdasarkan kategori  

**Flow:**
1. User pilih kategori
2. Sistem filter produk dengan category_id
3. Tampilkan hasil filter

---

#### UC_CreateProduct - Create Product
**Actor:** Admin  
**Description:** Admin menambah produk baru  
**Extends:** UC_UploadImage (optional)

**Flow:**
1. Admin mengisi form produk (nama, kategori, harga, stock, deskripsi)
2. Optional: Upload gambar produk
3. Sistem validasi data
4. Sistem insert produk ke database

---

#### UC_UpdateProduct - Update Product
**Actor:** Admin  
**Description:** Admin update data produk  
**Extends:** UC_UploadImage (optional)

**Flow:**
1. Admin pilih produk
2. Edit data produk
3. Optional: Update gambar
4. Sistem update database

---

#### UC_DeleteProduct - Delete Product
**Actor:** Admin  
**Description:** Admin hapus produk  

**Flow:**
1. Admin click delete
2. Sistem konfirmasi
3. Sistem soft delete produk (atau hard delete jika tidak ada order terkait)

---

#### UC_ManageStock - Manage Stock
**Actor:** Admin  
**Description:** Admin update stock produk  

**Flow:**
1. Admin input jumlah stock baru
2. Sistem update stock
3. Jika stock habis, tandai produk out of stock

---

### 📦 **3. Category Management**

#### UC_CreateCategory - Create Category
**Actor:** Admin  
**Description:** Admin membuat kategori baru  

**Flow:**
1. Admin input nama kategori
2. Sistem insert ke database
3. Kategori tersedia untuk produk

---

#### UC_UpdateCategory - Update Category
**Actor:** Admin  
**Description:** Admin update nama kategori  

---

#### UC_DeleteCategory - Delete Category
**Actor:** Admin  
**Description:** Admin hapus kategori  

**Flow:**
1. Admin delete kategori
2. Sistem cek apakah ada produk dengan kategori ini
3. Jika ada, tolak delete atau pindahkan produk ke kategori lain

---

### 📦 **4. Shopping Cart & Order**

#### UC_AddToCart - Add to Cart
**Actor:** Customer  
**Description:** Customer menambah produk ke cart  

**Flow:**
1. Customer click "Add to Cart" di halaman produk
2. Sistem cek stock tersedia
3. Jika tersedia, tambahkan ke cart (localStorage)
4. Update cart badge

---

#### UC_ViewCart - View Cart
**Actor:** Customer  
**Description:** Customer melihat isi cart  

**Flow:**
1. Customer akses halaman cart
2. Sistem load cart dari localStorage
3. Tampilkan list produk dengan quantity dan subtotal

---

#### UC_UpdateCartQuantity - Update Cart Quantity
**Actor:** Customer  
**Description:** Customer ubah jumlah item di cart  

**Flow:**
1. Customer +/- quantity
2. Sistem cek stock
3. Update cart dan recalculate total

---

#### UC_RemoveFromCart - Remove from Cart
**Actor:** Customer  
**Description:** Customer hapus item dari cart  

---

#### UC_Checkout - Checkout
**Actor:** Customer  
**Description:** Customer melakukan checkout  
**Includes:**
- UC_CreateOrder
- UC_CalculateTotal
- UC_ProcessPayment
**Extends:** UC_ApplyVoucher (optional)

**Flow:**
1. Customer akses halaman checkout
2. Input customer info (nama, email, phone, alamat)
3. Optional: Apply voucher
4. Sistem calculate total (subtotal - discount)
5. Pilih metode pembayaran
6. Sistem create order
7. Redirect ke payment gateway
8. Cart dikosongkan

---

#### UC_ApplyVoucher - Apply Voucher
**Actor:** Customer  
**Description:** Customer menggunakan voucher di checkout  
**Includes:**
- UC_ValidateVoucher
- UC_UpdateVoucherUsage

**Flow:**
1. Customer input kode voucher
2. Sistem validate voucher (validity, quota, min purchase)
3. Jika valid, calculate discount
4. Update total dan voucher usage

---

#### UC_CreateOrder - Create Order
**Actor:** System (triggered by checkout)  
**Description:** Sistem membuat order baru  
**Includes:**
- UC_ReduceStock
- UC_CreateOrderNotification

**Flow:**
1. Sistem insert order ke database
2. Insert order_items
3. Reduce stock produk
4. Generate midtrans_order_id
5. Send notification ke customer dan admin

---

#### UC_TrackOrder - Track Order
**Actor:** Customer  
**Description:** Customer track status order  

**Flow:**
1. Customer input order_id atau midtrans_order_id
2. Sistem fetch order dengan status
3. Tampilkan timeline order (pending → dikirim → selesai)

---

#### UC_ViewOrderHistory - View Order History
**Actor:** Customer, Admin  
**Description:** Melihat riwayat order  

**Flow:**
1. User akses halaman order history
2. Sistem fetch orders dengan filter user_id (customer) atau all (admin)
3. Tampilkan list orders

---

#### UC_CancelOrder - Cancel Order
**Actor:** Customer  
**Description:** Customer cancel order  
**Extends:** UC_TrackOrder

**Flow:**
1. Customer click cancel di halaman track order
2. Input cancel reason
3. Sistem update status = 'dibatalkan'
4. Restore stock produk
5. Jika sudah bayar, process refund

---

#### UC_UpdateOrderStatus - Update Order Status
**Actor:** Admin  
**Description:** Admin update status order (pending → dikirim → selesai)  

**Flow:**
1. Admin pilih order
2. Update status
3. Sistem send notification ke customer
4. Jika selesai, update target progress

---

### 📦 **5. Payment Processing**

#### UC_ProcessPayment - Process Payment
**Actor:** Customer  
**Description:** Customer melakukan pembayaran  
**Includes:**
- UC_GeneratePaymentToken
- UC_InitiateMidtransPayment

**Flow:**
1. Sistem generate payment token dari Midtrans
2. Tampilkan Snap popup atau redirect ke payment page
3. Customer pilih metode pembayaran (e-wallet, bank transfer, kartu kredit)
4. Customer bayar
5. Midtrans send callback ke sistem

---

#### UC_ReceivePaymentNotification - Receive Payment Notification
**Actor:** Midtrans Payment Gateway  
**Description:** Sistem menerima notifikasi payment dari Midtrans  
**Includes:**
- UC_VerifyPaymentSignature
- UC_UpdatePaymentStatus

**Flow:**
1. Midtrans send POST request ke /api/payment/notification
2. Sistem verify signature key
3. Sistem update payment_status berdasarkan transaction_status
4. Send notification ke customer

---

#### UC_HandlePaymentCallback - Handle Payment Callback
**Actor:** Midtrans Payment Gateway  
**Description:** Handle redirect callback dari Midtrans setelah payment  
**Includes:** UC_UpdatePaymentStatus

**Flow:**
1. Customer redirect dari Midtrans
2. Sistem parse query params (order_id, status_code)
3. Update payment status
4. Redirect ke success/error page

---

### 📦 **6. Voucher Management**

#### UC_ViewAvailableVouchers - View Available Vouchers
**Actor:** Customer, Admin  
**Description:** Melihat voucher yang aktif  

**Flow:**
1. User akses halaman voucher
2. Sistem fetch vouchers dengan is_active = true dan valid_until >= today
3. Tampilkan voucher dengan info (code, discount, min purchase, quota)

---

#### UC_CreateVoucher - Create Voucher
**Actor:** Admin  
**Description:** Admin membuat voucher baru  

**Flow:**
1. Admin input (code, name, type, value, min_purchase, quota, validity)
2. Sistem validate code unique
3. Insert voucher

---

#### UC_UpdateVoucher - Update Voucher
**Actor:** Admin  
**Description:** Admin update voucher  

---

#### UC_DeleteVoucher - Delete Voucher
**Actor:** Admin  
**Description:** Admin hapus voucher  

**Flow:**
1. Admin delete voucher
2. Sistem cek apakah ada order menggunakan voucher ini
3. Jika sudah digunakan, soft delete atau tandai inactive

---

#### UC_ToggleVoucherStatus - Toggle Voucher Status
**Actor:** Admin  
**Description:** Admin aktifkan/nonaktifkan voucher  

---

#### UC_ValidateVoucher - Validate Voucher
**Actor:** System (triggered by apply voucher)  
**Description:** Sistem validasi voucher  
**Includes:**
- UC_CheckVoucherValidity
- UC_CheckVoucherQuota

**Flow:**
1. Cek code exists
2. Cek is_active = true
3. Cek valid_from <= today <= valid_until
4. Cek quota > used
5. Cek subtotal >= min_purchase
6. Return valid/invalid dengan discount amount

---

### 📦 **7. Service Booking**

#### UC_CreateBooking - Create Booking
**Actor:** Customer  
**Description:** Customer membuat booking service  
**Includes:**
- UC_GenerateServiceCode
- UC_CreateBookingNotification
**Extends:** UC_AssignTeknisi (optional)

**Flow:**
1. Customer input (device_name, issue, booking_date, customer info)
2. Sistem generate unique service_code
3. Insert booking dengan status 'baru'
4. Optional: Admin assign teknisi
5. Send notification ke customer dan admin

---

#### UC_GenerateServiceCode - Generate Service Code
**Actor:** System  
**Description:** Generate kode tracking unik untuk booking  

**Flow:**
1. Generate random alphanumeric (contoh: SRV-20251217-ABCD)
2. Cek uniqueness
3. Return service_code

---

#### UC_TrackBooking - Track Booking
**Actor:** Customer  
**Description:** Customer track booking berdasarkan service_code  

**Flow:**
1. Customer input service_code
2. Sistem fetch booking dengan user, teknisi data
3. Tampilkan status, progress, estimated completion

---

#### UC_ViewMyBookings - View My Bookings
**Actor:** Customer  
**Description:** Customer melihat riwayat booking  

---

#### UC_AssignTeknisi - Assign Teknisi
**Actor:** Admin  
**Description:** Admin assign teknisi ke booking  
**Extends:** UC_CreateBooking

**Flow:**
1. Admin pilih teknisi dari list teknisi aktif
2. Update booking.teknisi_id
3. Send notification ke teknisi

---

#### UC_UpdateBookingStatus - Update Booking Status
**Actor:** Admin, Teknisi  
**Description:** Update status booking (baru → proses → selesai)  

**Flow:**
1. Admin/Teknisi update status
2. Sistem update booking
3. Send notification ke customer

---

#### UC_UpdateServiceProgress - Update Service Progress
**Actor:** Teknisi  
**Description:** Teknisi update progress service  
**Includes:** UC_AddProgressNotes

**Flow:**
1. Teknisi input progress update (diagnosed, in_progress, waiting_parts, etc)
2. Add progress notes
3. Update estimated_completion
4. Sistem update booking
5. Send notification ke customer

---

#### UC_CompleteService - Complete Service
**Actor:** Teknisi  
**Description:** Teknisi menandai service selesai  

**Flow:**
1. Teknisi click complete
2. Sistem update status = 'selesai', completed_at = now
3. Update teknisi earnings
4. Send notification ke customer untuk review

---

#### UC_DiagnoseIssue - Diagnose Issue
**Actor:** Teknisi  
**Description:** Teknisi diagnosa masalah device  

**Flow:**
1. Teknisi input diagnosa
2. Update progress_status = 'diagnosed'
3. Add notes dengan hasil diagnosa

---

#### UC_ViewAssignedServices - View Assigned Services
**Actor:** Teknisi  
**Description:** Teknisi melihat service yang ditugaskan  

**Flow:**
1. Fetch bookings dengan teknisi_id = current_user
2. Filter by status (baru, proses)

---

### 📦 **8. Complaint & Review**

#### UC_SubmitComplaint - Submit Complaint
**Actor:** Customer  
**Description:** Customer submit keluhan  

**Flow:**
1. Customer pilih order/produk terkait
2. Input message
3. Insert complaint dengan status 'belum dibaca'
4. Send notification ke admin

---

#### UC_SubmitReview - Submit Product Review
**Actor:** Customer  
**Description:** Customer submit review produk  
**Includes:** UC_RateProduct

**Flow:**
1. Customer pilih produk dari order history
2. Input rating (1-5 stars) dan message
3. Insert complaint dengan rating
4. Send notification ke admin

---

#### UC_ViewMyComplaints - View My Complaints
**Actor:** Customer  
**Description:** Customer melihat riwayat keluhan  

---

#### UC_ViewComplaintDetails - View Complaint Details
**Actor:** Customer, Admin  
**Description:** Melihat detail keluhan  
**Extends:** UC_ReplyToComplaint

---

#### UC_ReplyToComplaint - Reply to Complaint
**Actor:** Admin  
**Description:** Admin reply keluhan customer  
**Extends:** UC_ViewComplaintDetails

**Flow:**
1. Admin input reply
2. Update complaint (reply, status = 'dibalas')
3. Send notification ke customer

---

#### UC_UpdateComplaintStatus - Update Complaint Status
**Actor:** Admin  
**Description:** Admin update status keluhan  

---

### 📦 **9. Chat System**

#### UC_SendMessage - Send Message
**Actor:** Customer, Admin, Teknisi  
**Description:** Mengirim pesan chat  
**Includes:** UC_RealtimeUpdates

**Flow:**
1. User ketik message
2. Insert ke tabel chat
3. Real-time broadcast ke recipient via WebSocket/Supabase Realtime
4. Update unread count

---

#### UC_ReceiveMessage - Receive Message
**Actor:** Customer, Admin, Teknisi  
**Description:** Menerima pesan real-time  
**Includes:** UC_RealtimeUpdates

---

#### UC_ViewChatHistory - View Chat History
**Actor:** Customer, Admin, Teknisi  
**Description:** Melihat riwayat chat  
**Extends:** UC_MarkAsRead

**Flow:**
1. Fetch messages berdasarkan user pair
2. Order by created_at
3. Mark unread messages as read

---

#### UC_ViewActiveChats - View Active Chats
**Actor:** Admin  
**Description:** Admin melihat semua chat aktif  

**Flow:**
1. Fetch distinct chat pairs dengan latest message
2. Show unread count per chat

---

### 📦 **10. Notification System**

#### UC_SendNotification - Send Notification
**Actor:** System  
**Description:** Sistem mengirim notifikasi  

**Flow:**
1. Insert notification ke database
2. Broadcast via real-time channel
3. Increment unread count

---

#### UC_ViewNotifications - View Notifications
**Actor:** Customer  
**Description:** Customer melihat notifikasi  
**Extends:** UC_MarkNotificationAsRead

**Flow:**
1. Fetch notifications dengan user_id
2. Order by created_at DESC
3. Show badge untuk unread count

---

#### UC_MarkNotificationAsRead - Mark Notification as Read
**Actor:** Customer  
**Description:** Mark notifikasi sebagai dibaca  

**Flow:**
1. Update is_read = true
2. Decrement unread count

---

#### UC_CreateOrderNotification - Create Order Notification
**Actor:** System  
**Description:** Auto-create notifikasi saat order dibuat  
**Includes:** UC_SendNotification

**Flow:**
1. Trigger saat order created
2. Create notification "Order #XXX berhasil dibuat"
3. Send ke customer dan admin

---

#### UC_CreateBookingNotification - Create Booking Notification
**Actor:** System  
**Description:** Auto-create notifikasi saat booking dibuat  
**Includes:** UC_SendNotification

---

#### UC_CreatePaymentNotification - Create Payment Notification
**Actor:** System  
**Description:** Auto-create notifikasi saat payment berhasil  
**Includes:** UC_SendNotification

**Flow:**
1. Trigger saat payment_status = 'paid'
2. Create notification "Pembayaran order #XXX berhasil"

---

### 📦 **11. User Management**

#### UC_ViewUsers - View Users
**Actor:** Admin  
**Description:** Admin melihat daftar user  

---

#### UC_ViewUserDetails - View User Details
**Actor:** Admin  
**Description:** Admin melihat detail user  

**Flow:**
1. Fetch user dengan orders, bookings, complaints
2. Show statistics (total spending, order count)

---

#### UC_UpdateUserRole - Update User Role
**Actor:** Admin  
**Description:** Admin ubah role user (user ↔ admin)  

---

#### UC_DeleteUser - Delete User
**Actor:** Admin  
**Description:** Admin hapus user  

**Flow:**
1. Cek apakah user punya order/booking aktif
2. Jika tidak ada, soft delete

---

#### UC_ViewProfile - View User Profile
**Actor:** Customer  
**Description:** Customer melihat profil sendiri  

---

#### UC_UpdateProfile - Update Profile
**Actor:** Customer  
**Description:** Customer update profil (nama, phone, email)  

---

### 📦 **12. Teknisi Management**

#### UC_CreateTeknisi - Create Teknisi
**Actor:** Admin  
**Description:** Admin membuat akun teknisi baru  

**Flow:**
1. Admin input (nama, username, password, phone, specialization)
2. Hash password
3. Insert ke tabel teknisi

---

#### UC_ViewTeknisiList - View Teknisi List
**Actor:** Admin  
**Description:** Admin melihat daftar teknisi  

---

#### UC_UpdateTeknisi - Update Teknisi
**Actor:** Admin  
**Description:** Admin update data teknisi  

---

#### UC_DeleteTeknisi - Delete Teknisi
**Actor:** Admin  
**Description:** Admin hapus teknisi  

**Flow:**
1. Cek apakah teknisi punya booking aktif
2. Jika tidak, delete

---

#### UC_ToggleTeknisiStatus - Toggle Teknisi Status
**Actor:** Admin  
**Description:** Admin aktifkan/nonaktifkan teknisi  

---

#### UC_ViewTeknisiProfile - View Teknisi Profile
**Actor:** Teknisi  
**Description:** Teknisi melihat profil sendiri  

---

#### UC_ViewTeknisiEarnings - View Teknisi Earnings
**Actor:** Teknisi  
**Description:** Teknisi melihat pendapatan  

**Flow:**
1. Fetch completed bookings dengan teknisi_id
2. Calculate total earnings

---

### 📦 **13. Target & CRM**

#### UC_ViewTargets - View Targets
**Actor:** Admin  
**Description:** Admin melihat semua target user  

**Flow:**
1. Fetch all targets dengan user info
2. Show progress percentage

---

#### UC_CreateTarget - Create Target
**Actor:** Admin  
**Description:** Admin create target untuk user  

**Flow:**
1. Admin pilih user
2. Set target_amount dan reward
3. Insert target dengan status 'active', current_amount = 0

---

#### UC_UpdateTargetProgress - Update Target Progress
**Actor:** System  
**Description:** Auto-update progress saat order selesai  

**Flow:**
1. Trigger saat order status = 'selesai'
2. Fetch active target untuk user
3. current_amount += order.total_amount
4. Jika current_amount >= target_amount, status = 'achieved'
5. Send notification

---

#### UC_MarkTargetAchieved - Mark Target as Achieved
**Actor:** Admin  
**Description:** Admin manually mark target tercapai  

---

#### UC_ViewMyTarget - View My Target
**Actor:** Customer  
**Description:** Customer melihat target pribadi  
**Extends:** UC_ClaimReward

**Flow:**
1. Fetch target dengan user_id
2. Show progress bar
3. Jika achieved dan !reward_claimed, show claim button

---

#### UC_ClaimReward - Claim Reward
**Actor:** Customer  
**Description:** Customer claim reward saat target tercapai  
**Extends:** UC_ViewMyTarget

**Flow:**
1. Cek status = 'achieved' && !reward_claimed
2. Update reward_claimed = true
3. Process reward (voucher, discount, cashback)

---

### 📦 **14. Dashboard & Analytics**

#### UC_ViewAdminDashboard - View Admin Dashboard
**Actor:** Admin  
**Description:** Admin melihat dashboard overview  

**Flow:**
1. Fetch statistics (total orders, revenue, pending bookings, users)
2. Show charts (sales trend, top products, revenue by category)

---

#### UC_ViewTeknisiDashboard - View Teknisi Dashboard
**Actor:** Teknisi  
**Description:** Teknisi melihat dashboard  

**Flow:**
1. Fetch statistics (assigned services, completed, earnings)
2. Show pending/in-progress bookings

---

#### UC_ViewSalesStatistics - View Sales Statistics
**Actor:** Admin  
**Description:** Admin melihat statistik penjualan  

**Flow:**
1. Fetch orders by date range
2. Group by day/week/month
3. Show chart

---

#### UC_ViewRevenueStatistics - View Revenue Statistics
**Actor:** Admin  
**Description:** Admin melihat statistik revenue  

**Flow:**
1. Calculate total_amount - discount_amount
2. Group by period
3. Show revenue trend

---

#### UC_ViewServiceStatistics - View Service Statistics
**Actor:** Admin, Teknisi  
**Description:** Melihat statistik booking/service  

**Flow:**
1. Count bookings by status
2. Show completion rate
3. Average service time

---

#### UC_ViewTopProducts - View Top Products
**Actor:** Admin  
**Description:** Admin melihat produk terlaris  

**Flow:**
1. Fetch products dengan most order_items
2. Order by quantity DESC
3. Show top 10

---

#### UC_ViewRecentOrders - View Recent Orders
**Actor:** Admin  
**Description:** Admin melihat order terbaru  

---

## Relationships Summary

### Include Relationships (Mandatory)

| Parent Use Case | Includes | Reason |
|----------------|----------|---------|
| Login | ValidateCredentials, CreateSession | Login harus validasi dan create session |
| Checkout | CreateOrder, CalculateTotal, ProcessPayment | Checkout harus create order dan payment |
| ApplyVoucher | ValidateVoucher, UpdateVoucherUsage | Apply voucher harus validasi dan update usage |
| ValidateVoucher | CheckVoucherValidity, CheckVoucherQuota | Validasi voucher harus cek validity dan quota |
| ProcessPayment | GeneratePaymentToken, InitiateMidtransPayment | Payment harus generate token dan initiate Midtrans |
| ReceivePaymentNotification | VerifyPaymentSignature, UpdatePaymentStatus | Payment notification harus verify dan update status |
| CreateOrder | ReduceStock, CreateOrderNotification | Order harus reduce stock dan send notifikasi |
| CreateBooking | GenerateServiceCode, CreateBookingNotification | Booking harus generate code dan send notifikasi |
| UpdateServiceProgress | AddProgressNotes | Update progress harus add notes |
| SendMessage | RealtimeUpdates | Chat harus real-time |
| SubmitReview | RateProduct | Review harus include rating |

### Extend Relationships (Optional)

| Base Use Case | Extended by | Condition |
|--------------|-------------|-----------|
| Checkout | ApplyVoucher | Jika customer punya voucher |
| TrackOrder | CancelOrder | Jika order masih pending |
| ViewBookingStatus | UpdateBookingStatus | Jika user adalah admin/teknisi |
| CreateBooking | AssignTeknisi | Jika admin assign langsung |
| ViewComplaintDetails | ReplyToComplaint | Jika user adalah admin |
| ViewNotifications | MarkNotificationAsRead | Jika user klik notifikasi |
| ViewChatHistory | MarkAsRead | Jika ada unread messages |
| ViewMyTarget | ClaimReward | Jika target achieved |
| CreateProduct | UploadImage | Jika admin upload gambar |
| UpdateProduct | UploadImage | Jika admin update gambar |

---

## How to Render Use Case Diagram

### Using PlantUML Online
1. Go to [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copy content dari `docs/use-case-diagram.puml`
3. Paste ke editor
4. Diagram akan otomatis render
5. Download sebagai PNG/SVG

### Using PlantUML CLI
```bash
# Install PlantUML
npm install -g node-plantuml

# Render diagram
puml generate docs/use-case-diagram.puml -o docs/use-case-diagram.png
```

### Using VS Code Extension
1. Install extension "PlantUML" by jebbs
2. Open `docs/use-case-diagram.puml`
3. Press `Alt+D` to preview
4. Right-click → Export to PNG/SVG

---

## Total Statistics

- **Total Actors:** 5 (Customer, Admin, Teknisi, Midtrans, System)
- **Total Use Cases:** 120+
- **Total Packages:** 14
- **Include Relationships:** 20+
- **Extend Relationships:** 10+

---

## Notes

1. **RLS (Row Level Security)**: Beberapa use case memerlukan RLS policy di Supabase untuk security
2. **Real-time**: Chat dan notification menggunakan Supabase Realtime
3. **Midtrans Integration**: Payment menggunakan Midtrans Snap API
4. **Notification**: Sistem notification otomatis trigger saat ada event (order, booking, payment)
5. **Target/CRM**: Sistem auto-update progress target saat order selesai
6. **Service Code**: Kode unik untuk tracking booking tanpa login

---

**Last Updated:** December 17, 2025  
**Project:** Chicha Mobile  
**Version:** 1.0
