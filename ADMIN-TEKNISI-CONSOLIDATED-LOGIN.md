# Admin + Teknisi Consolidated Login Implementation

## Summary of Changes

Admin and teknisi now share a single login page with auto-detection of login type based on input format:
- **Email input** → Admin login via Supabase auth
- **Username input** → Teknisi login via bcrypt on teknisi table

### Key Features

✅ **No Database Migration Required** - Uses existing Supabase auth for admin and existing teknisi table for technician staff

✅ **Unified Login Page** - Both admin and teknisi login at `/teknisi/login`

✅ **Auto-Detection** - System automatically detects whether input is email (admin) or username (teknisi)

✅ **Role-Based Redirect** - After login, redirects based on role:
  - Admin → `/admin/dashboard`
  - Teknisi → `/teknisi/dashboard`

### Implementation Details

#### 1. Authentication API (`app/api/teknisi/login/route.ts`)
**Changes:**
- ✅ Auto-detects input format (email vs username)
- ✅ If email: authenticates via Supabase auth, verifies user has `role='admin'`
- ✅ If username: authenticates via teknisi table with bcrypt password verification
- ✅ Returns consistent response format: `{ user: {..., role: 'teknisi'|'admin'}, message: '...' }`

#### 2. Login Page (`app/teknisi/login/page.tsx`)
**Changes:**
- ✅ Updated UI heading to "Login Admin / Teknisi"
- ✅ Added helper text: "Email untuk Admin • Username untuk Teknisi"
- ✅ Changed input label to "Email atau Username"
- ✅ Updated placeholder to show both formats: "admin@email.com atau username.teknisi"
- ✅ Updated error message to handle both cases
- ✅ Implements role-based redirect after successful login

#### 3. Teknisi Auth Context (`lib/teknisi-auth-context.tsx`)
**Changes:**
- ✅ Updated to handle response from unified login API
- ✅ Stores user data (both admin and teknisi) in localStorage['teknisi']

#### 4. Admin Layout Protection (`components/AdminLayout.tsx`)
**Changes:**
- ✅ Checks session from localStorage['teknisi']
- ✅ Verifies role === 'admin'
- ✅ Protects admin routes from unauthorized access
- ✅ Redirects to login if not authenticated or not admin

### Authentication Flow

```
1. User enters email or username on /teknisi/login
   ↓
2. POST to /api/teknisi/login with {username, password}
   ↓
3. API auto-detects format:
   a) If email: 
      - Sign in via Supabase auth
      - Verify user has role='admin'
      - Return user data with role='admin'
   
   b) If username:
      - Query teknisi table
      - Verify bcrypt password
      - Return user data with role='teknisi'
   ↓
4. TeknisiAuthContext stores in localStorage['teknisi']
   ↓
5. Login page checks role and redirects:
   - role='admin' → /admin/dashboard
   - role='teknisi' → /teknisi/dashboard
```

### How It Works

**For Admin Login:**
- Admin enters their Supabase email (e.g., `admin@example.com`)
- API detects `@` symbol, treats as email
- Authenticates via Supabase built-in auth
- Verifies admin has `role='admin'` in users table
- Redirects to admin dashboard

**For Teknisi Login:**
- Teknisi enters their username (e.g., `teknisi_001`)
- API detects no `@` symbol, treats as username
- Queries teknisi table by username
- Verifies bcrypt password hash
- Redirects to teknisi dashboard

### Files Modified

1. `/app/api/teknisi/login/route.ts` - Added email/username auto-detection
2. `/app/teknisi/login/page.tsx` - Updated UI labels and placeholders
3. `/lib/teknisi-auth-context.tsx` - Already compatible with unified API
4. `/components/AdminLayout.tsx` - Auth check already in place

### Files NOT Changed (No Migration Needed)

- ✅ No changes to database schema
- ✅ No new columns added to users table
- ✅ Uses existing Supabase auth for admin
- ✅ Uses existing bcrypt in teknisi table for teknisi

### Setup Instructions

**Zero setup needed!** The system works with existing data:

1. Admin users must:
   - Have `role='admin'` in the users table ✅ (already exists)
   - Use their Supabase email to login
   - Use their Supabase password to login

2. Teknisi users must:
   - Have username and password_hash in teknisi table ✅ (already exists)
   - Use their username to login
   - Use their password to login

### Testing Checklist

- [ ] Can login as admin with email (existing Supabase account)
- [ ] Admin redirects to `/admin/dashboard` after login
- [ ] Can login as teknisi with username
- [ ] Teknisi redirects to `/teknisi/dashboard` after login
- [ ] Admin logout clears session and redirects to login
- [ ] Teknisi logout works correctly
- [ ] Customer login can access `/teknisi/login` button
- [ ] AdminLayout properly protects admin routes
- [ ] Non-admin users cannot access admin pages

### Advantages of This Approach

✅ **No Migration** - Zero database changes needed
✅ **Backward Compatible** - Existing admin and teknisi accounts work as-is
✅ **Simple** - Auto-detection based on email format
✅ **Secure** - Uses Supabase auth for admin, bcrypt for teknisi
✅ **Single Page** - Both login types on same page
✅ **Clear UX** - Helper text explains both login types

### What Was NOT Done

- ❌ No database migration needed
- ❌ No admin table creation needed
- ❌ No password_hash column added to users
- ❌ No separate admin login page
- ❌ No AdminAuthProvider wrapper

