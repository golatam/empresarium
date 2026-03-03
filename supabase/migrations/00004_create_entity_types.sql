CREATE TABLE entity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  description_pt TEXT,
  description_ru TEXT,
  min_founders INT NOT NULL DEFAULT 1,
  max_founders INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_id, code)
);

ALTER TABLE entity_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entity types are viewable by everyone" ON entity_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage entity types" ON entity_types FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
