-- Deferred from 00002: depends on orders table (created in 00006)
CREATE POLICY "Partners can view assigned clients" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.partner_id = auth.uid()
    AND o.client_id = profiles.id
  )
);
