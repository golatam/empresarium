CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations of their orders" ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = conversations.order_id
    AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
  )
);
CREATE POLICY "Admins can view all conversations" ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
