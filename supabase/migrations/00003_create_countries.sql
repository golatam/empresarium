CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(2) NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  flag_url TEXT,
  currency VARCHAR(3) NOT NULL,
  tax_id_name TEXT NOT NULL,
  tax_id_format TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Countries are viewable by everyone" ON countries FOR SELECT USING (true);
CREATE POLICY "Admins can manage countries" ON countries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
