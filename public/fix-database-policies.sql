-- 🚨 EMERGENCY FIX: Supabase RLS Infinite Recursion Error (Code: 42P17)
-- This script fixes the infinite recursion in Row Level Security policies
-- Run this as superuser in your Supabase SQL editor

-- ====================================================================
-- 🔧 EMERGENCY RLS FIX FOR user_profiles TABLE
-- ====================================================================

-- Step 1: Drop all existing RLS policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON user_profiles;

-- Step 2: Temporarily disable RLS to ensure clean state
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies

-- Allow service role (used by admin API) to do everything
CREATE POLICY "Service role full access" ON user_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users read own profile" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users update own profile" ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow profile creation during signup (insert for new users)
CREATE POLICY "Users create own profile" ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 🔧 VERIFICATION QUERIES (Run these to confirm fix)
-- ====================================================================

-- Check that policies are created correctly
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Test profile access (should work without recursion)
SELECT id, email, approval_status, status
FROM user_profiles
LIMIT 5;

-- ====================================================================
-- 📋 NOTES
-- ====================================================================

-- This fix:
-- 1. Removes any conflicting or recursive RLS policies
-- 2. Creates simple, safe policies that won't cause recursion
-- 3. Ensures service role can always access profiles (for admin operations)
-- 4. Maintains user privacy (users can only see their own data)

-- After running this script:
-- ✅ Profile queries should work normally
-- ✅ Admin panel should function properly
-- ✅ Users should be able to access Analyzer tab after approval
-- ✅ Debug tools should show normal operation

-- If you still have issues after running this script:
-- 1. Check if there are any custom functions that reference user_profiles
-- 2. Verify that the auth.uid() function is working correctly
-- 3. Contact Supabase support for additional assistance

-- ====================================================================
-- 🎯 SCRIPT COMPLETED - RLS POLICIES FIXED!
-- ====================================================================
