CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  partner_id UUID REFERENCES profiles(id),
  country_id UUID NOT NULL REFERENCES countries(id),
  entity_type_id UUID NOT NULL REFERENCES entity_types(id),
  status order_status NOT NULL DEFAULT 'draft',
  company_name TEXT NOT NULL,
  company_activity TEXT,
  company_address TEXT,
  form_data JSONB NOT NULL DEFAULT '{}',
  has_nominee_director BOOLEAN NOT NULL DEFAULT false,
  has_nominee_shareholder BOOLEAN NOT NULL DEFAULT false,
  has_accounting BOOLEAN NOT NULL DEFAULT false,
  has_bookkeeping BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_partner ON orders(partner_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_country ON orders(country_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own orders
CREATE POLICY "Clients can view own orders" ON orders FOR SELECT USING (client_id = auth.uid());
-- Clients can insert their own orders
CREATE POLICY "Clients can create orders" ON orders FOR INSERT WITH CHECK (client_id = auth.uid());
-- Clients can update their own draft orders
CREATE POLICY "Clients can update own drafts" ON orders FOR UPDATE USING (
  client_id = auth.uid() AND status = 'draft'
);
-- Partners can view assigned orders
CREATE POLICY "Partners can view assigned orders" ON orders FOR SELECT USING (partner_id = auth.uid());
-- Partners can update assigned orders
CREATE POLICY "Partners can update assigned orders" ON orders FOR UPDATE USING (partner_id = auth.uid());
-- Admins can do everything
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
