-- =============================================================================
-- Empresarium Seed Data
-- Countries, Entity Types, Form Fields, and Required Documents
-- =============================================================================

-- =============================================================================
-- COUNTRIES
-- =============================================================================

INSERT INTO countries (id, code, name_en, name_es, name_pt, name_ru, currency, tax_id_name, tax_id_format, is_active, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'BR', 'Brazil', 'Brasil', 'Brasil', 'Бразилия', 'BRL', 'CNPJ', '##.###.###/####-##', true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'CL', 'Chile', 'Chile', 'Chile', 'Чили', 'CLP', 'RUT', '##.###.###-#', true, 2),
  ('a0000000-0000-0000-0000-000000000003', 'CO', 'Colombia', 'Colombia', 'Colômbia', 'Колумбия', 'COP', 'NIT', '#########-#', true, 3),
  ('a0000000-0000-0000-0000-000000000004', 'PE', 'Peru', 'Perú', 'Peru', 'Перу', 'PEN', 'RUC', '###########', true, 4),
  ('a0000000-0000-0000-0000-000000000005', 'AR', 'Argentina', 'Argentina', 'Argentina', 'Аргентина', 'ARS', 'CUIT', '##-########-#', true, 5);

-- =============================================================================
-- ENTITY TYPES
-- =============================================================================

-- Brazil
INSERT INTO entity_types (id, country_id, code, name_en, name_es, name_pt, name_ru, description_en, description_es, description_pt, description_ru, min_founders, max_founders, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'MEI',
    'Individual Microentrepreneur', 'Microemprendedor Individual', 'Microempreendedor Individual', 'Индивидуальный микропредприниматель',
    'Simplified business entity for individual entrepreneurs with limited annual revenue', 'Entidad empresarial simplificada para emprendedores individuales con ingresos anuales limitados', 'Entidade empresarial simplificada para empreendedores individuais com receita anual limitada', 'Упрощённая форма бизнеса для индивидуальных предпринимателей с ограниченным годовым доходом',
    1, 1, 1),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'LTDA',
    'Limited Liability Company', 'Sociedad de Responsabilidad Limitada', 'Sociedade Limitada', 'Общество с ограниченной ответственностью',
    'Most common business entity in Brazil with limited liability for partners', 'La entidad empresarial más común en Brasil con responsabilidad limitada para los socios', 'A entidade empresarial mais comum no Brasil com responsabilidade limitada para os sócios', 'Наиболее распространённая форма бизнеса в Бразилии с ограниченной ответственностью партнёров',
    2, NULL, 2),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'SA',
    'Corporation', 'Sociedad Anónima', 'Sociedade Anônima', 'Акционерное общество',
    'Corporation with shares, suitable for larger companies', 'Corporación con acciones, adecuada para empresas más grandes', 'Sociedade com ações, adequada para empresas maiores', 'Акционерное общество, подходящее для крупных компаний',
    2, 50, 3),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'EIRELI',
    'Individual Limited Liability Company', 'Empresa Individual de Responsabilidad Limitada', 'Empresa Individual de Responsabilidade Limitada', 'Индивидуальное предприятие с ограниченной ответственностью',
    'Single-owner entity with limited liability, requires minimum capital', 'Entidad de un solo propietario con responsabilidad limitada, requiere capital mínimo', 'Entidade de proprietário único com responsabilidade limitada, requer capital mínimo', 'Предприятие с одним владельцем и ограниченной ответственностью, требуется минимальный капитал',
    1, 1, 4);

-- Chile
INSERT INTO entity_types (id, country_id, code, name_en, name_es, name_pt, name_ru, description_en, description_es, description_pt, description_ru, min_founders, max_founders, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'SpA',
    'Stock Company', 'Sociedad por Acciones', 'Sociedade por Ações', 'Акционерная компания',
    'Flexible corporate structure popular for startups and small businesses', 'Estructura corporativa flexible popular para startups y pequeñas empresas', 'Estrutura corporativa flexível popular para startups e pequenas empresas', 'Гибкая корпоративная структура, популярная для стартапов и малого бизнеса',
    1, NULL, 1),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'LTDA',
    'Limited Liability Company', 'Sociedad de Responsabilidad Limitada', 'Sociedade de Responsabilidade Limitada', 'Общество с ограниченной ответственностью',
    'Traditional limited liability company requiring 2 to 50 partners', 'Sociedad de responsabilidad limitada tradicional que requiere de 2 a 50 socios', 'Sociedade de responsabilidade limitada tradicional que requer de 2 a 50 sócios', 'Традиционное общество с ограниченной ответственностью, требующее от 2 до 50 партнёров',
    2, 50, 2),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'SA',
    'Corporation', 'Sociedad Anónima', 'Sociedade Anônima', 'Акционерное общество',
    'Public or private corporation with freely transferable shares', 'Corporación pública o privada con acciones libremente transferibles', 'Sociedade pública ou privada com ações livremente transferíveis', 'Публичное или частное акционерное общество со свободно обращающимися акциями',
    2, NULL, 3);

-- Colombia
INSERT INTO entity_types (id, country_id, code, name_en, name_es, name_pt, name_ru, description_en, description_es, description_pt, description_ru, min_founders, max_founders, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'SAS',
    'Simplified Stock Company', 'Sociedad por Acciones Simplificada', 'Sociedade por Ações Simplificada', 'Упрощённое акционерное общество',
    'Most popular entity type in Colombia, flexible and easy to set up', 'El tipo de entidad más popular en Colombia, flexible y fácil de constituir', 'O tipo de entidade mais popular na Colômbia, flexível e fácil de constituir', 'Самая популярная форма бизнеса в Колумбии, гибкая и простая в создании',
    1, NULL, 1),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'LTDA',
    'Limited Liability Company', 'Sociedad Limitada', 'Sociedade Limitada', 'Общество с ограниченной ответственностью',
    'Traditional limited liability company with 2 to 25 partners', 'Sociedad limitada tradicional con 2 a 25 socios', 'Sociedade limitada tradicional com 2 a 25 sócios', 'Традиционное общество с ограниченной ответственностью с 2 до 25 партнёрами',
    2, 25, 2),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'SA',
    'Corporation', 'Sociedad Anónima', 'Sociedade Anônima', 'Акционерное общество',
    'Corporation requiring minimum 5 shareholders', 'Corporación que requiere un mínimo de 5 accionistas', 'Sociedade que requer no mínimo 5 acionistas', 'Акционерное общество, требующее минимум 5 акционеров',
    5, NULL, 3);

-- Peru
INSERT INTO entity_types (id, country_id, code, name_en, name_es, name_pt, name_ru, description_en, description_es, description_pt, description_ru, min_founders, max_founders, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004', 'SAC',
    'Closed Corporation', 'Sociedad Anónima Cerrada', 'Sociedade Anônima Fechada', 'Закрытое акционерное общество',
    'Closed corporation with 2 to 20 shareholders, most common in Peru', 'Sociedad anónima cerrada con 2 a 20 accionistas, la más común en Perú', 'Sociedade anônima fechada com 2 a 20 acionistas, a mais comum no Peru', 'Закрытое акционерное общество с 2 до 20 акционерами, наиболее распространённое в Перу',
    2, 20, 1),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000004', 'SRL',
    'Limited Liability Company', 'Sociedad de Responsabilidad Limitada', 'Sociedade de Responsabilidade Limitada', 'Общество с ограниченной ответственностью',
    'Limited liability company with 2 to 20 partners', 'Sociedad de responsabilidad limitada con 2 a 20 socios', 'Sociedade de responsabilidade limitada com 2 a 20 sócios', 'Общество с ограниченной ответственностью с 2 до 20 партнёрами',
    2, 20, 2),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000004', 'SA',
    'Corporation', 'Sociedad Anónima', 'Sociedade Anônima', 'Акционерное общество',
    'Open corporation with unlimited shareholders', 'Sociedad anónima abierta con accionistas ilimitados', 'Sociedade anônima aberta com acionistas ilimitados', 'Открытое акционерное общество с неограниченным числом акционеров',
    2, NULL, 3),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000004', 'EIRL',
    'Individual Limited Liability Company', 'Empresa Individual de Responsabilidad Limitada', 'Empresa Individual de Responsabilidade Limitada', 'Индивидуальное предприятие с ограниченной ответственностью',
    'Single-owner entity with limited liability', 'Entidad de un solo propietario con responsabilidad limitada', 'Entidade de proprietário único com responsabilidade limitada', 'Предприятие с одним владельцем и ограниченной ответственностью',
    1, 1, 4);

-- Argentina
INSERT INTO entity_types (id, country_id, code, name_en, name_es, name_pt, name_ru, description_en, description_es, description_pt, description_ru, min_founders, max_founders, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000005', 'SAS',
    'Simplified Stock Company', 'Sociedad por Acciones Simplificada', 'Sociedade por Ações Simplificada', 'Упрощённое акционерное общество',
    'Modern simplified entity, can be registered digitally', 'Entidad simplificada moderna, puede registrarse digitalmente', 'Entidade simplificada moderna, pode ser registrada digitalmente', 'Современная упрощённая форма, может быть зарегистрирована в цифровом виде',
    1, NULL, 1),
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000005', 'SRL',
    'Limited Liability Company', 'Sociedad de Responsabilidad Limitada', 'Sociedade de Responsabilidade Limitada', 'Общество с ограниченной ответственностью',
    'Traditional limited liability company with 2 to 50 partners', 'Sociedad de responsabilidad limitada tradicional con 2 a 50 socios', 'Sociedade de responsabilidade limitada tradicional com 2 a 50 sócios', 'Традиционное общество с ограниченной ответственностью с 2 до 50 партнёрами',
    2, 50, 2),
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000005', 'SA',
    'Corporation', 'Sociedad Anónima', 'Sociedade Anônima', 'Акционерное общество',
    'Corporation with freely transferable shares, suitable for larger businesses', 'Corporación con acciones libremente transferibles, adecuada para empresas más grandes', 'Sociedade com ações livremente transferíveis, adequada para empresas maiores', 'Акционерное общество со свободно обращающимися акциями, подходящее для крупного бизнеса',
    2, NULL, 3);

-- =============================================================================
-- COUNTRY FORM FIELDS
-- =============================================================================

-- Brazil: CNAE code, Social capital
INSERT INTO country_form_fields (country_id, field_key, field_type, label_en, label_es, label_pt, label_ru, placeholder_en, placeholder_es, placeholder_pt, placeholder_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'cnae_code', 'text',
    'CNAE Code', 'Código CNAE', 'Código CNAE', 'Код CNAE',
    'e.g. 6201-5/01', 'ej. 6201-5/01', 'ex. 6201-5/01', 'напр. 6201-5/01',
    true, 1),
  ('a0000000-0000-0000-0000-000000000001', 'social_capital', 'number',
    'Social Capital (BRL)', 'Capital Social (BRL)', 'Capital Social (BRL)', 'Уставный капитал (BRL)',
    'e.g. 10000', 'ej. 10000', 'ex. 10000', 'напр. 10000',
    true, 2);

-- Chile: RUT prefix, Social capital
INSERT INTO country_form_fields (country_id, field_key, field_type, label_en, label_es, label_pt, label_ru, placeholder_en, placeholder_es, placeholder_pt, placeholder_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'rut_prefix', 'text',
    'RUT Prefix', 'Prefijo RUT', 'Prefixo RUT', 'Префикс RUT',
    'e.g. 76', 'ej. 76', 'ex. 76', 'напр. 76',
    false, 1),
  ('a0000000-0000-0000-0000-000000000002', 'social_capital', 'number',
    'Social Capital (CLP)', 'Capital Social (CLP)', 'Capital Social (CLP)', 'Уставный капитал (CLP)',
    'e.g. 1000000', 'ej. 1000000', 'ex. 1000000', 'напр. 1000000',
    true, 2);

-- Colombia: NIT application, CIIU code
INSERT INTO country_form_fields (country_id, field_key, field_type, label_en, label_es, label_pt, label_ru, placeholder_en, placeholder_es, placeholder_pt, placeholder_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'nit_application', 'checkbox',
    'Apply for NIT', 'Solicitar NIT', 'Solicitar NIT', 'Подать заявку на NIT',
    NULL, NULL, NULL, NULL,
    false, 1),
  ('a0000000-0000-0000-0000-000000000003', 'ciiu_code', 'text',
    'CIIU Code', 'Código CIIU', 'Código CIIU', 'Код CIIU',
    'e.g. 6201', 'ej. 6201', 'ex. 6201', 'напр. 6201',
    false, 2);

-- Peru: SUNARP zone, Capital amount
INSERT INTO country_form_fields (country_id, field_key, field_type, label_en, label_es, label_pt, label_ru, placeholder_en, placeholder_es, placeholder_pt, placeholder_ru, is_required, options, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000004', 'sunarp_zone', 'select',
    'SUNARP Zone', 'Zona SUNARP', 'Zona SUNARP', 'Зона SUNARP',
    'Select a zone', 'Seleccione una zona', 'Selecione uma zona', 'Выберите зону',
    false,
    '[{"value": "lima", "label_en": "Lima", "label_es": "Lima", "label_pt": "Lima", "label_ru": "Лима"}, {"value": "arequipa", "label_en": "Arequipa", "label_es": "Arequipa", "label_pt": "Arequipa", "label_ru": "Арекипа"}, {"value": "cusco", "label_en": "Cusco", "label_es": "Cusco", "label_pt": "Cusco", "label_ru": "Куско"}, {"value": "trujillo", "label_en": "Trujillo", "label_es": "Trujillo", "label_pt": "Trujillo", "label_ru": "Трухильо"}]'::jsonb,
    1),
  ('a0000000-0000-0000-0000-000000000004', 'capital_amount', 'number',
    'Capital Amount (PEN)', 'Monto de Capital (PEN)', 'Valor do Capital (PEN)', 'Сумма капитала (PEN)',
    'e.g. 1000', 'ej. 1000', 'ex. 1000', 'напр. 1000',
    false, NULL,
    2);

-- Argentina: CUIT type, IGJ jurisdiction
INSERT INTO country_form_fields (country_id, field_key, field_type, label_en, label_es, label_pt, label_ru, placeholder_en, placeholder_es, placeholder_pt, placeholder_ru, is_required, options, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'cuit_type', 'select',
    'CUIT Type', 'Tipo de CUIT', 'Tipo de CUIT', 'Тип CUIT',
    'Select type', 'Seleccione tipo', 'Selecione tipo', 'Выберите тип',
    false,
    '[{"value": "physical_person", "label_en": "Physical Person", "label_es": "Persona Física", "label_pt": "Pessoa Física", "label_ru": "Физическое лицо"}, {"value": "legal_entity", "label_en": "Legal Entity", "label_es": "Persona Jurídica", "label_pt": "Pessoa Jurídica", "label_ru": "Юридическое лицо"}]'::jsonb,
    1),
  ('a0000000-0000-0000-0000-000000000005', 'igj_jurisdiction', 'text',
    'IGJ Jurisdiction', 'Jurisdicción IGJ', 'Jurisdição IGJ', 'Юрисдикция IGJ',
    'e.g. CABA', 'ej. CABA', 'ex. CABA', 'напр. CABA',
    false, NULL,
    2);

-- =============================================================================
-- REQUIRED DOCUMENTS
-- =============================================================================

-- Brazil: CPF, Proof of Address, Identity Document
INSERT INTO required_documents (country_id, document_type, label_en, label_es, label_pt, label_ru, description_en, description_es, description_pt, description_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'cpf',
    'CPF (Individual Taxpayer Registration)', 'CPF (Registro de Contribuyente Individual)', 'CPF (Cadastro de Pessoa Física)', 'CPF (Регистрация индивидуального налогоплательщика)',
    'Brazilian individual taxpayer identification number', 'Número de identificación del contribuyente individual brasileño', 'Número de identificação do contribuinte individual brasileiro', 'Бразильский идентификационный номер индивидуального налогоплательщика',
    true, 1),
  ('a0000000-0000-0000-0000-000000000001', 'proof_of_address',
    'Proof of Address', 'Comprobante de Domicilio', 'Comprovante de Endereço', 'Подтверждение адреса',
    'Utility bill or bank statement from the last 3 months', 'Factura de servicios o extracto bancario de los últimos 3 meses', 'Conta de serviços ou extrato bancário dos últimos 3 meses', 'Счёт за коммунальные услуги или банковская выписка за последние 3 месяца',
    true, 2),
  ('a0000000-0000-0000-0000-000000000001', 'identity_document',
    'Identity Document', 'Documento de Identidad', 'Documento de Identidade', 'Документ, удостоверяющий личность',
    'RG, CNH, or passport', 'RG, CNH o pasaporte', 'RG, CNH ou passaporte', 'RG, CNH или паспорт',
    true, 3);

-- Chile: RUT, Proof of Address
INSERT INTO required_documents (country_id, document_type, label_en, label_es, label_pt, label_ru, description_en, description_es, description_pt, description_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'rut',
    'RUT (Tax Identification)', 'RUT (Rol Único Tributario)', 'RUT (Rol Único Tributário)', 'RUT (Налоговая идентификация)',
    'Chilean tax identification number', 'Número de identificación tributaria chileno', 'Número de identificação tributária chileno', 'Чилийский идентификационный налоговый номер',
    true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'proof_of_address',
    'Proof of Address', 'Comprobante de Domicilio', 'Comprovante de Endereço', 'Подтверждение адреса',
    'Utility bill or bank statement from the last 3 months', 'Factura de servicios o extracto bancario de los últimos 3 meses', 'Conta de serviços ou extrato bancário dos últimos 3 meses', 'Счёт за коммунальные услуги или банковская выписка за последние 3 месяца',
    true, 2);

-- Colombia: Cedula, RUT Certificate, Chamber of Commerce
INSERT INTO required_documents (country_id, document_type, label_en, label_es, label_pt, label_ru, description_en, description_es, description_pt, description_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'cedula',
    'Cedula (National ID)', 'Cédula de Ciudadanía', 'Cédula de Cidadania', 'Удостоверение личности (Cédula)',
    'Colombian national identification card', 'Documento de identificación nacional colombiano', 'Documento de identificação nacional colombiano', 'Колумбийское национальное удостоверение личности',
    true, 1),
  ('a0000000-0000-0000-0000-000000000003', 'rut_certificate',
    'RUT Certificate', 'Certificado RUT', 'Certificado RUT', 'Сертификат RUT',
    'Tax registration certificate issued by DIAN', 'Certificado de registro tributario emitido por la DIAN', 'Certificado de registro tributário emitido pela DIAN', 'Сертификат налоговой регистрации, выданный DIAN',
    true, 2),
  ('a0000000-0000-0000-0000-000000000003', 'chamber_of_commerce',
    'Chamber of Commerce Certificate', 'Certificado de Cámara de Comercio', 'Certificado da Câmara de Comércio', 'Сертификат Торговой палаты',
    'Certificate of existence and legal representation', 'Certificado de existencia y representación legal', 'Certificado de existência e representação legal', 'Сертификат о существовании и юридическом представительстве',
    true, 3);

-- Peru: DNI, SUNAT RUC, Proof of Address
INSERT INTO required_documents (country_id, document_type, label_en, label_es, label_pt, label_ru, description_en, description_es, description_pt, description_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000004', 'dni',
    'DNI (National Identity Document)', 'DNI (Documento Nacional de Identidad)', 'DNI (Documento Nacional de Identidade)', 'DNI (Национальное удостоверение личности)',
    'Peruvian national identity document', 'Documento nacional de identidad peruano', 'Documento nacional de identidade peruano', 'Перуанское национальное удостоверение личности',
    true, 1),
  ('a0000000-0000-0000-0000-000000000004', 'sunat_ruc',
    'SUNAT RUC', 'RUC de SUNAT', 'RUC da SUNAT', 'RUC SUNAT',
    'Tax identification number issued by SUNAT', 'Número de identificación tributaria emitido por SUNAT', 'Número de identificação tributária emitido pela SUNAT', 'Идентификационный налоговый номер, выданный SUNAT',
    true, 2),
  ('a0000000-0000-0000-0000-000000000004', 'proof_of_address',
    'Proof of Address', 'Comprobante de Domicilio', 'Comprovante de Endereço', 'Подтверждение адреса',
    'Utility bill or bank statement from the last 3 months', 'Factura de servicios o extracto bancario de los últimos 3 meses', 'Conta de serviços ou extrato bancário dos últimos 3 meses', 'Счёт за коммунальные услуги или банковская выписка за последние 3 месяца',
    true, 3);

-- Argentina: DNI/Passport, Proof of Address, AFIP Registration
INSERT INTO required_documents (country_id, document_type, label_en, label_es, label_pt, label_ru, description_en, description_es, description_pt, description_ru, is_required, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'dni_passport',
    'DNI or Passport', 'DNI o Pasaporte', 'DNI ou Passaporte', 'DNI или паспорт',
    'Argentine national identity document or valid passport', 'Documento nacional de identidad argentino o pasaporte válido', 'Documento nacional de identidade argentino ou passaporte válido', 'Аргентинское национальное удостоверение личности или действующий паспорт',
    true, 1),
  ('a0000000-0000-0000-0000-000000000005', 'proof_of_address',
    'Proof of Address', 'Comprobante de Domicilio', 'Comprovante de Endereço', 'Подтверждение адреса',
    'Utility bill or bank statement from the last 3 months', 'Factura de servicios o extracto bancario de los últimos 3 meses', 'Conta de serviços ou extrato bancário dos últimos 3 meses', 'Счёт за коммунальные услуги или банковская выписка за последние 3 месяца',
    true, 2),
  ('a0000000-0000-0000-0000-000000000005', 'afip_registration',
    'AFIP Registration', 'Registro AFIP', 'Registro AFIP', 'Регистрация в AFIP',
    'Tax authority registration certificate', 'Certificado de registro de la autoridad tributaria', 'Certificado de registro da autoridade tributária', 'Сертификат регистрации в налоговом органе',
    true, 3);
