# Push Notification Testing Guide

**Purpose:** Verify push notifications work correctly for all roles  
**Estimated Time:** 15-20 minutes  
**Requirements:** Open 3 browser windows (Customer, Admin, Teknisi)

---

## 🎯 **Pre-Test Setup**

### **1. Open Developer Tools (F12)**
In EACH browser window, open:
- **DevTools → Console** to see real-time logs
- **DevTools → Network** to check API calls
- Watch for logs starting with 🔔 and 📡

### **2. Have Test Accounts Ready**
```
Customer: any customer account
Admin: any admin account  
Teknisi: any teknisi account
```

---

## ✅ **Test 1: Customer Books Service → Admin Receives Notification**

### **Customer (Window 1):**
1. Navigate to `/client/booking`
2. **Console log:** Should see `📡 Setting up notification system for user: [id]`
3. Fill booking form and submit
4. **Console log:** Should see `Booking created successfully`

### **Admin (Window 2):**
1. Already at `/admin/dashboard` (notification bell visible)
2. **Console log:** Look for subscription message
3. Watch notification bell icon in top-right
4. **Expected:** Bell icon should show red badge with "+1" unread count
5. **Console log:** Should see `Real-time notification change received`
6. Click on notification bell
7. **Expected:** "Booking Service Baru" appears with customer name and device
8. Click on notification
9. **Expected:** Redirects to `/admin/booking` page

---

## ✅ **Test 2: Admin Assigns Teknisi → Teknisi & Customer Receive Notification**

### **Admin (Window 2):**
1. At `/admin/booking`
2. Click "Detail" on the booking created in Test 1
3. Modal opens → find "Pilih Teknisi" dropdown
4. Select a teknisi
5. Click "Tugaskan" button
6. **Console log:** Should see `Teknisi assigned successfully`
7. Wait for toast: "Teknisi berhasil ditugaskan"

### **Teknisi (Window 3):**
1. Navigate to `/teknisi/service` page
2. **Console log:** Should see notification subscription
3. Watch notification bell
4. **Expected:** Badge shows "+1" unread
5. Click bell → should see "Booking Service Ditugaskan" notification
6. Click notification
7. **Expected:** Redirects to `/teknisi/service` (or detail page)

### **Customer (Window 1):**
1. At `/client/akun?tab=bookings`
2. Watch notification bell
3. **Expected:** Badge appears with "+1"
4. Click bell → should see "Teknisi Ditugaskan" notification
5. Click notification
6. **Expected:** Stays on bookings tab (or shows booking detail)

---

## ✅ **Test 3: Admin Changes Order Status → Customer Receives Notification**

### **Admin (Window 2):**
1. Go to `/admin/pesanan` (Order Management)
2. Click "Detail" on any order
3. Change status: **Pending → Dikirim**
4. **Console log:** Should show status validation
5. Wait for success toast

### **Customer (Window 1):**
1. **Console log:** Should see `Real-time notification change received`
2. Watch notification bell
3. **Expected:** Badge shows new unread count
4. Click bell
5. **Expected:** See "Pesanan Sedang Dikirim" notification
6. Click notification
7. **Expected:** Navigate to `/client/akun?tab=orders`

---

## ✅ **Test 4: Real-time Updates Without Refresh**

### **Setup:**
All windows already open with bells visible

### **Steps:**
1. **Customer:** Create new booking
2. **Admin:** Keep window open, DON'T refresh
3. **Expected:** Notification bell badge appears automatically in ~1-2 seconds
4. **Console log:** Should see `Real-time subscription SUBSCRIBED`

### **Verify Real-time Working:**
- No page refresh needed
- Badge updates immediately
- Notification appears without clicking refresh
- Console shows subscription status changes

---

## ✅ **Test 5: Mark as Read**

### **Admin (Window 2):**
1. Click notification bell
2. Hover over a notification
3. Look for any "mark as read" indicator
4. Click notification to mark as read
5. **Expected:** Dot indicator disappears (if present)
6. Badge count decrements by 1

### **All Windows:**
Same behavior - clicking notification marks it as read

---

## 📊 **Expected Console Logs**

### **Initial Setup (each role):**
```
🔔 NotificationBell render: { userId: "xxx", userRole: "customer"|"admin"|"teknisi", notificationsCount: 0, unreadCount: 0 }
📡 Setting up notification system for user: xxx
📥 Fetching notifications for user: xxx
✅ Notifications fetched: { total: N, unread: M, types: {...} }
📡 Real-time subscription SUBSCRIBED
```

### **New Notification Created:**
```
📨 Creating notification: { user_id: "xxx", title: "...", type: "booking_new|booking_assigned|order" }
✅ Notification created: xxxxx
```

### **Real-time Notification Received:**
```
🔔 Real-time notification change received: { event: 'INSERT|UPDATE', table: 'notifications', new: 'xxxxx' }
🔄 Fetching notifications for user: xxx
✅ Notifications fetched: { total: N, unread: M+1, types: {...} }
```

---

## 🔴 **If Tests Fail**

### **Issue: No badge appears**

**Checks:**
1. Console shows `userId` is defined?
   - ❌ Check user logged in
   - ❌ Check localStorage ('user' for customer, 'teknisi' for others)

2. API call successful?
   ```
   Network tab → /api/notifications?user_id=xxx
   Should return status 200 with notifications array
   ```

3. Real-time subscription active?
   ```
   Console should show: "📡 Real-time subscription SUBSCRIBED"
   Network tab → check for WebSocket connection
   ```

### **Issue: Notifications created but not visible**

**Checks:**
1. Check database:
   ```sql
   SELECT * FROM notifications 
   WHERE user_id = '...' 
   ORDER BY created_at DESC;
   ```

2. Verify RLS policy allows SELECT:
   ```
   Supabase → Table notifications → Policies tab
   Should have: "Users can view own notifications"
   ```

3. Check API response format:
   ```
   Should return: { notifications: [...] }
   ```

### **Issue: Real-time not working**

**Checks:**
1. Supabase Realtime enabled?
   - Supabase → Project Settings → Realtime
   - Verify notifications table has realtime enabled

2. Network connection?
   - Check WebSocket in Network tab (should be active)
   - No errors in console

3. Subscription filter?
   - Console logs should show filter: `user_id=eq.xxx`

### **Issue: Wrong notification type shown**

**Checks:**
1. Database notification type matches enum:
   - Valid types: `'order' | 'booking' | 'booking_new' | 'booking_assigned' | 'target' | 'general' | 'complaint_reply'`

2. NotificationBell handles the type?
   - Check component code for type checks

---

## 🎓 **Advanced Debugging**

### **Browser Console Commands:**

**Check current user:**
```javascript
console.log(
  JSON.parse(localStorage.getItem('user') || localStorage.getItem('teknisi'))
)
```

**Manually fetch notifications:**
```javascript
fetch('/api/notifications?user_id=YOUR_USER_ID')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Check notification subscription:**
```javascript
// Already logged in console as "📡 Subscription status: SUBSCRIBED"
// Look for this in console
```

---

## ✨ **Success Criteria**

All tests pass when:
- ✅ Badges appear in real-time without page refresh
- ✅ Correct notifications appear for each action
- ✅ All roles receive appropriate notifications
- ✅ Clicking notification navigates correctly
- ✅ Console shows subscription active
- ✅ No error messages about RLS or permissions

---

## 📝 **Test Results Template**

```
Test Results - [Date]
- Customer receives booking notifications: [ ] Pass [ ] Fail
- Admin receives booking notifications: [ ] Pass [ ] Fail
- Teknisi receives assignment notifications: [ ] Pass [ ] Fail
- Order status notifications work: [ ] Pass [ ] Fail
- Real-time updates without refresh: [ ] Pass [ ] Fail
- Mark as read functionality: [ ] Pass [ ] Fail
- Navigation from notifications works: [ ] Pass [ ] Fail
- No console errors: [ ] Pass [ ] Fail
- WebSocket connection active: [ ] Pass [ ] Fail
```

---

**Last Updated:** 2026-04-27  
**Status:** Ready for Testing ✅
