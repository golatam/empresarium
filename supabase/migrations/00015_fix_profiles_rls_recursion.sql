-- Fix infinite recursion in profiles RLS policies.
-- The admin policies were doing SELECT FROM profiles inside a profiles policy,
-- causing PostgreSQL to detect infinite recursion.
-- Solution: use the existing is_admin(user_id) SECURITY DEFINER function
-- which bypasses RLS inside itself, breaking the recursion.

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin(auth.uid()));
