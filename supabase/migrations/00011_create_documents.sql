CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_from_client BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_order ON documents(order_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents of their orders" ON documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = documents.order_id
    AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
  )
);
CREATE POLICY "Users can upload documents to their orders" ON documents FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = documents.order_id
    AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
  )
);
CREATE POLICY "Admins can manage all documents" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Required documents template table
CREATE TABLE required_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_pt TEXT NOT NULL,
  label_ru TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  description_pt TEXT,
  description_ru TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_id, document_type)
);

ALTER TABLE required_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Required documents are viewable by everyone" ON required_documents FOR SELECT USING (true);
CREATE POLICY "Admins can manage required documents" ON required_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
