-- Enums for Empresarium
CREATE TYPE user_role AS ENUM ('client', 'partner', 'admin');
CREATE TYPE order_status AS ENUM ('draft', 'submitted', 'under_review', 'documents_requested', 'documents_received', 'in_progress', 'government_filing', 'completed', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'file', 'system');
CREATE TYPE addon_type AS ENUM ('nominee_director', 'nominee_shareholder', 'accounting', 'bookkeeping');
CREATE TYPE field_type AS ENUM ('text', 'email', 'phone', 'select', 'number', 'date', 'file', 'textarea', 'checkbox');
