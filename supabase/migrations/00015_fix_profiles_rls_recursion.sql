-- Fix infinite recursion in RLS policies across all tables.
--
-- Root cause: admin policies on every table used a direct subquery
-- (SELECT 1 FROM profiles WHERE role = 'admin'), which triggered profiles RLS.
-- The "Partners can view assigned clients" policy on profiles queries orders,
-- whose admin policy in turn queries profiles — creating cross-table recursion:
--   profiles → orders → profiles → orders → ∞
--
-- Solution: replace all direct subqueries with is_admin(auth.uid()),
-- a SECURITY DEFINER function owned by postgres (bypasses RLS).

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin(auth.uid()));

-- orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (is_admin(auth.uid()));

-- addons
DROP POLICY IF EXISTS "Admins can manage all addons" ON addons;
CREATE POLICY "Admins can manage all addons" ON addons FOR ALL USING (is_admin(auth.uid()));

-- conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
CREATE POLICY "Admins can view all conversations" ON conversations FOR SELECT USING (is_admin(auth.uid()));

-- countries
DROP POLICY IF EXISTS "Admins can manage countries" ON countries;
CREATE POLICY "Admins can manage countries" ON countries FOR ALL USING (is_admin(auth.uid()));

-- country_form_fields
DROP POLICY IF EXISTS "Admins can manage form fields" ON country_form_fields;
CREATE POLICY "Admins can manage form fields" ON country_form_fields FOR ALL USING (is_admin(auth.uid()));

-- documents
DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
CREATE POLICY "Admins can manage all documents" ON documents FOR ALL USING (is_admin(auth.uid()));

-- entity_types
DROP POLICY IF EXISTS "Admins can manage entity types" ON entity_types;
CREATE POLICY "Admins can manage entity types" ON entity_types FOR ALL USING (is_admin(auth.uid()));

-- founders
DROP POLICY IF EXISTS "Admins can manage all founders" ON founders;
CREATE POLICY "Admins can manage all founders" ON founders FOR ALL USING (is_admin(auth.uid()));

-- messages
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
CREATE POLICY "Admins can view all messages" ON messages FOR SELECT USING (is_admin(auth.uid()));

-- order_status_history
DROP POLICY IF EXISTS "Admins can view all status history" ON order_status_history;
CREATE POLICY "Admins can view all status history" ON order_status_history FOR SELECT USING (is_admin(auth.uid()));

-- partner_countries
DROP POLICY IF EXISTS "Admins can manage partner countries" ON partner_countries;
CREATE POLICY "Admins can manage partner countries" ON partner_countries FOR ALL USING (is_admin(auth.uid()));

-- required_documents
DROP POLICY IF EXISTS "Admins can manage required documents" ON required_documents;
CREATE POLICY "Admins can manage required documents" ON required_documents FOR ALL USING (is_admin(auth.uid()));
