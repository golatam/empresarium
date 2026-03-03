CREATE TABLE country_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  field_key VARCHAR(50) NOT NULL,
  field_type field_type NOT NULL DEFAULT 'text',
  label_en TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_pt TEXT NOT NULL,
  label_ru TEXT NOT NULL,
  placeholder_en TEXT,
  placeholder_es TEXT,
  placeholder_pt TEXT,
  placeholder_ru TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_rules JSONB,
  options JSONB,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_id, field_key)
);

ALTER TABLE country_form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form fields are viewable by everyone" ON country_form_fields FOR SELECT USING (true);
CREATE POLICY "Admins can manage form fields" ON country_form_fields FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
