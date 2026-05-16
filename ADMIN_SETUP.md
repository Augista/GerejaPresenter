# Admin Account Setup Guide

## Overview

The ProPresenter app includes an admin role that has special access to view and manage all data in the system. Regular users can only see their own presentations and songs.

## Admin Account Details

**Email:** `admin@propresenter.local`  
**Password:** `AdminProPresenter123!`

**Important:** Change this password immediately after first login for security.

## How to Create the Admin Account

### Option 1: Using the Setup Function (Recommended)

1. Open your browser console or use an API client
2. Call the `createAdminAccount()` function from `lib/auth/admin-setup.ts`

```typescript
import { createAdminAccount } from '@/lib/auth/admin-setup';

// In your code or console:
const result = await createAdminAccount();
console.log(result);
```

### Option 2: Manual Database Setup

If the automatic setup doesn't work, you can manually create the admin account:

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** and run this query:

```sql
-- Create admin user in auth
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@propresenter.local',
  crypt('AdminProPresenter123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role":"admin"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create admin user record in users table
INSERT INTO public.users (id, email, role, created_at, updated_at)
SELECT 
  id,
  'admin@propresenter.local',
  'admin',
  now(),
  now()
FROM auth.users
WHERE email = 'admin@propresenter.local'
ON CONFLICT DO NOTHING;
```

## Admin Features

### Admin Dashboard (`/admin`)

After logging in as admin, navigate to `/admin` to access the admin panel.

**Current Features:**
- View all users in the system
- View all presentations
- View all songs
- User management (coming soon)

**Future Features:**
- Create/edit/delete users
- View detailed analytics
- Bulk operations
- System settings

### Permissions

**Admin Users Can:**
- ✅ Create/edit/delete own presentations and songs
- ✅ View all presentations and songs (read-only for now)
- ✅ View all users
- ✅ Access admin panel
- ✅ Manage system settings

**Regular Users Can:**
- ✅ Create/edit/delete own presentations and songs
- ❌ View other users' presentations
- ❌ Access admin panel

## Database Role System

The system uses a `role` column in the `users` table with two possible values:

- `user` - Regular user (default)
- `admin` - Administrator with elevated privileges

### Checking User Role

In your code:

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user } = useAuth();
  
  const isAdmin = user?.user_metadata?.role === 'admin' ||
                  user?.email === 'admin@propresenter.local';
  
  if (isAdmin) {
    // Show admin-only UI
  }
}
```

## Row-Level Security (RLS)

The database uses Supabase RLS policies to enforce permissions:

### Users Table
- Users can only see their own row
- Admins can see all rows

### Presentations Table
- Users can only see presentations where `user_id = auth.uid()`
- Admins can see all presentations

### Songs Table
- Users can only see songs where `user_id = auth.uid()`
- Admins can see all songs

### Media Table
- Users can only see media where `user_id = auth.uid()`
- Admins can see all media

## Security Best Practices

1. **Change Default Password:**
   - Log in with the default password
   - Go to Settings → Change Password
   - Use a strong, unique password

2. **Limit Admin Access:**
   - Only create admin accounts for trusted users
   - Review admin activity logs regularly

3. **Backup Admin Credentials:**
   - Store admin password securely
   - Use password manager (1Password, LastPass, etc.)
   - Never share admin credentials

4. **Monitor Database Access:**
   - Check Supabase logs for suspicious activity
   - Review RLS policies regularly
   - Keep Supabase updated

## Troubleshooting

### Admin Account Not Working

1. **Check if account exists:**
   ```typescript
   import { checkAdminExists } from '@/lib/auth/admin-setup';
   
   const { exists, admin } = await checkAdminExists();
   console.log('Admin exists:', exists, admin);
   ```

2. **Try creating again:**
   - Delete the existing admin account from Supabase
   - Run `createAdminAccount()` again

3. **Verify RLS policies:**
   - Go to Supabase dashboard
   - Check SQL Editor → View policies on `users` table

### Can't Access Admin Page

1. Check that your account has `role: 'admin'` in the database
2. Verify RLS policies are correctly configured
3. Try logging out and logging back in
4. Clear browser cache and cookies

## Next Steps

1. ✅ Create admin account (using guide above)
2. ✅ Login with admin credentials
3. ✅ Change admin password
4. ✅ Test admin dashboard at `/admin`
5. ✅ Invite other admins (create accounts and set role to 'admin')
6. ✅ Monitor system usage

---

For more help, see:
- Architecture documentation: `ARCHITECTURE_REFACTORED.md`
- Database schema: `SUPABASE_SETUP.md`
- Dashboard usage: `QUICKSTART.md`
