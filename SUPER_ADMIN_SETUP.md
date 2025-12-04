# Super Admin Setup

## Create the Initial Super Admin User

### Option 1: Using the HTML Helper Page (Recommended)

1. Open `create-super-admin.html` in your browser
2. Click "Create Super Admin" button
3. The user will be created with the following credentials:
   - **Email:** info@brainworx.co.za
   - **Password:** Bra14604
   - **Code:** SUPERADMIN

4. **Delete the `create-super-admin.html` file after use**

### Option 2: Manual Creation via Supabase Dashboard

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Fill in:
   - Email: `info@brainworx.co.za`
   - Password: `Bra14604`
4. After user is created, copy the User ID
5. Go to Table Editor → `franchise_owners` table
6. Insert a new row:
   ```
   id: [paste the user ID from step 4]
   email: info@brainworx.co.za
   name: Super Admin
   unique_link_code: SUPERADMIN
   is_super_admin: true
   ```

## Login as Super Admin

1. Go to your BrainWorx website
2. Click the "Login" button in the navigation
3. Enter:
   - Email: `info@brainworx.co.za`
   - Password: `Bra14604`
4. You'll be redirected to the Super Admin Dashboard

## Super Admin Features

Once logged in as Super Admin, you can:

- **Overview:** View system-wide statistics and recent activity
- **All Sales:** See all sales across all franchise holders
- **Full Assessments:** Access all 344-question NIP assessments
- **Self Assessments:** View all self-assessment responses
- **All Invoices:** Manage invoices from all franchise holders
- **Manage Users:** Add new franchise holders and super admins

## Adding New Users

1. Login as Super Admin
2. Navigate to "Manage Users" tab
3. Click "Add New User"
4. Fill in the form:
   - Full Name
   - Email Address
   - Password (min 8 characters)
   - Unique Link Code (will be uppercased automatically)
   - Check "Super Admin" if this user should have admin privileges
5. Click "Create User"

The new user can immediately log in with their credentials and will see their appropriate dashboard (Franchise Dashboard or Super Admin Dashboard) based on their role.

## User Types

### Super Admin (SU)
- Can view all system data
- Can create new users
- Can access all invoices and reports
- Has full system oversight

### Franchise Holder (FH)
- Can only view their own data
- Can see their customers and responses
- Can manage invoices for their franchise
- Limited to their franchise code's data
