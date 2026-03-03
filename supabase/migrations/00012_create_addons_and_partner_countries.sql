CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  addon_type addon_type NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, addon_type)
);

ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view addons of their orders" ON addons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = addons.order_id
    AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
  )
);
CREATE POLICY "Clients can manage addons of their draft orders" ON addons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = addons.order_id
    AND orders.client_id = auth.uid() AND orders.status = 'draft'
  )
);
CREATE POLICY "Admins can manage all addons" ON addons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Partner countries (many-to-many)
CREATE TABLE partner_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(partner_id, country_id)
);

ALTER TABLE partner_countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own country assignments" ON partner_countries FOR SELECT USING (partner_id = auth.uid());
CREATE POLICY "Admins can manage partner countries" ON partner_countries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
