CREATE TABLE founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  date_of_birth DATE,
  document_type TEXT,
  document_number TEXT,
  tax_id TEXT,
  ownership_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_director BOOLEAN NOT NULL DEFAULT false,
  extra_data JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_founders_order ON founders(order_id);

ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Same access as parent order
CREATE POLICY "Users can view founders of their orders" ON founders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = founders.order_id
    AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
  )
);
CREATE POLICY "Clients can manage founders of their draft orders" ON founders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = founders.order_id
    AND orders.client_id = auth.uid() AND orders.status = 'draft'
  )
);
CREATE POLICY "Admins can manage all founders" ON founders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
