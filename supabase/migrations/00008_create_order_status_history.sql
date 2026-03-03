CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history of their orders" ON order_status_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id
    AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
  )
);
CREATE POLICY "Admins can view all status history" ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Status history is insert-only for authorized users" ON order_status_history FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id
    AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
