# 🔍 Debugging Booking Issues - Checklist

## Issues Reported:
1. ❌ Customer booking tidak muncul di profil customer (tab bookings)
2. ❌ Admin tidak menerima notifikasi booking baru  
3. ❌ Admin tidak melihat daftar services di halaman admin/booking

## Penyebab Potensial & Solusi:

### 1. **Booking Data Tidak Terlihat**

#### Check Points:

**A. Verify Booking Berhasil Dibuat:**
- Buka browser console (F12)
- Go to `/client/booking`
- Booking service
- Lihat di console output:
```
Insert data to be sent: {...}
Booking created successfully: {...}
```

**B. Check Database Directly:**
1. Login ke Supabase Dashboard
2. Buka "SQL Editor"
3. Run query:
```sql
SELECT id, user_id, customer_name, device_name, progress_status, created_at 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;
```
Should see booking yang baru dibuat!

**C. Check RLS Policies:**
1. Go to "Tables" → "bookings"
2. Click "Policies" tab
3. Make sure tidak ada policy yang block SELECT/INSERT

---

### 2. **Notifikasi Tidak Masuk Admin**

#### Check Points:

**A. Verify Admin Users Exist:**
```sql
SELECT id, name, email, role FROM users WHERE role = 'admin';
```
If empty → Ada masalah setup admin!

**B. Check Notifications Table:**
```sql
SELECT id, user_id, title, message, type, booking_id, is_read, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```
Pastikan ada notification dengan type = 'booking_new'

**C. Check Notifications RLS:**
1. Go to "Tables" → "notifications"  
2. Click "Policies" tab
3. Make sure policies allow INSERT dari service role

---

### 3. **Admin Page Tidak Lihat Bookings**

#### Check Points:

**A. Test API Directly:**

Buka browser console, run:
```javascript
fetch('/api/bookings')
  .then(r => r.json())
  .then(d => console.log('Bookings:', d))
```

Should return:
```json
{ "bookings": [ {...}, {...} ] }
```

**B. Check Admin Page Console:**
- Login as admin
- Go to `/admin/booking`
- Buka console (F12)
- Lihat output dari fetchBookings

---

## 🛠️ Solusi yang Sudah Dilakukan:

### ✅ API Changes:
1. **GET `/api/bookings`** sekarang pakai `supabaseAdmin` (bypass RLS)
2. Added comprehensive logging untuk debug:
   - Melihat berapa bookings yang fetched
   - Melihat filter yang digunakan
   - Melihat error details

3. **POST `/api/bookings`** sekarang log:
   - Admin users ditemukan berapa
   - Notifications berhasil dibuat atau error

---

## ✅ Next Steps untuk User:

### Step 1: Refresh aplikasi & coba booking lagi
```
1. Kill dev server (Ctrl+C)
2. npm run dev
3. Login as customer
4. Book service
5. Cek console output
```

### Step 2: Buka Supabase & verify data
```
1. SQL Editor
2. Run query untuk check bookings
3. Run query untuk check notifications
```

### Step 3: Check admin page
```
1. Login as admin
2. Go to /admin/booking
3. Lihat apakah bookings muncul
4. Cek browser console untuk errors
```

### Step 4: Share hasil
If masih error, share:
- Console output saat booking dibuat
- Hasil dari SQL query
- Error message dari admin page console

---

## 🆘 Common Issues & Solutions:

### Issue: "bookings" table doesn't exist
**Solution:** Run migration `fix-bookings-table-schema.sql` di Supabase

### Issue: RLS policy blocking access
**Solution:** Temporarily disable RLS for testing:
```sql
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

### Issue: No admin users found
**Solution:** Create admin user via Supabase:
```sql
INSERT INTO users (id, email, name, phone, role, created_at)
VALUES ('admin-uuid-here', 'admin@example.com', 'Admin', '0812345', 'admin', NOW());
```

### Issue: Notification type invalid
**Solution:** Ensure notifications table has correct CHECK constraint:
```sql
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS valid_notification_type;
```

---

## 📊 Final Verification Query

Run ini di Supabase SQL Editor untuk check semua:
```sql
-- Check bookings created
SELECT COUNT(*) as total_bookings FROM bookings;

-- Check bookings with progress_status
SELECT progress_status, COUNT(*) 
FROM bookings 
GROUP BY progress_status;

-- Check notifications created
SELECT COUNT(*) as total_notifications FROM notifications;

-- Check notification types
SELECT type, COUNT(*) 
FROM notifications 
GROUP BY type;

-- Check if booking_id is populated in notifications
SELECT COUNT(*) as notifications_with_booking_id 
FROM notifications 
WHERE booking_id IS NOT NULL;
```

---

## 📞 If Still Having Issues:

Provide:
1. ✅ Output dari console saat booking
2. ✅ Output dari SQL queries di atas
3. ✅ Screenshot admin/booking page  
4. ✅ Exact error message dari browser console (F12)
