-- migrations/schema.sql
-- Utiliser psql -f migrations/schema.sql ou via migration tool
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- trigram pour recherche partielle
CREATE EXTENSION IF NOT EXISTS btree_gist; -- pour certains indexes si nécessaire

CREATE TYPE website_role AS ENUM ('owner', 'admin', 'user');
-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  phone TEXT,
  profile JSONB,
  role website_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  login_metadata JSONB DEFAULT '{
        "login_attempts": 0,
        "lock_count": 0,
        "lock_until": null
    }'::JSONB
);

INSERT INTO users (email, password, last_name, first_name, phone, profile, role)
VALUES
('john.doe@example.com', 'hash$2b$10$Jp5ZsE2example12345678', 'Doe', 'John', '+33601020304',
 null, 'user'),

('jane.smith@example.com', 'hash$2b$10$Jp5ZsE2example87654321', 'Smith', 'Jane', '+33698765432',
 null, 'user'),

('admin@example.com', 'hash$2b$10$Adm1nP@sswordExample', 'Super', 'Admin', NULL,
 null, 'admin'),

('maria.rossi@example.com', 'hash$2b$10$TestPassMaria1234', 'Rossi', 'Maria', '+393481112233',
 null, 'admin'),

('test.user@example.com', 'hash$2b$10$DemoHashExample987654', 'User', 'Test', NULL,
 null, 'user');


CREATE TABLE tmp_session (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE const_session (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  finguerprint TEXT
);

CREATE TABLE document (
  id text PRIMARY KEY,
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE selected_document (
  id_document text NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  id_offers UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  PRIMARY KEY (id_document, id_offers)
); -- a lier avec application et non offer



CREATE INDEX idx_users_email ON users(email);

-- COMPANIES
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT UNIQUE,
  website TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_companies_name_trgm ON companies USING gin (name gin_trgm_ops);

-- COMPANY MEMBERS / ROLES (owner, admin, recruiter, viewer)
CREATE TYPE company_role AS ENUM ('owner','admin','recruiter','viewer');

CREATE TABLE company_members (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role company_role NOT NULL,
  join_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (company_id, user_id)
);

CREATE INDEX idx_company_members_company ON company_members(company_id);


CREATE TYPE offer_type AS ENUM ('cdi','cdd','alternance','mi-temps','freelance','stage','benevolat');
-- OFFERS (job posts)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- creator
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  tags TEXT[], -- e.g. ['informatique','dev','numerique']
  type offer_type NOT NULL,
  external_url TEXT, -- if set, redirect applicants there (external apply)
  collect_applications boolean DEFAULT true, -- si on souhaite collecter les candidatures via la plateforme
  recruiter_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Full text & trigram indexes for fast search
CREATE INDEX idx_offers_title_trgm ON offers USING gin (title gin_trgm_ops);
CREATE INDEX idx_offers_tags_gin ON offers USING gin (tags);
CREATE INDEX idx_offers_location_trgm ON offers USING gin (location gin_trgm_ops);
CREATE INDEX idx_offers_created_at ON offers (created_at);

-- APPLICATIONS
CREATE TABLE applications (
  offers_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  users_id UUID REFERENCES users(id) ON DELETE CASCADE,
  candidate_email TEXT,
  candidate_phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (offers_id, users_id)
);

CREATE INDEX idx_applications_offer ON applications(offer_id);
CREATE INDEX idx_applications_user ON applications(user_id);

-- VIEW: offer statistics (total applicants)
-- CREATE VIEW offer_stats AS
-- SELECT o.id AS offer_id,
--        o.title,
--        o.company_id,
--        COUNT(a.id) AS applicants_count
-- FROM offers o
-- LEFT JOIN applications a ON a.offer_id = o.id
-- GROUP BY o.id, o.title, o.company_id;

-- Triggers to update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER companies_update_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER offers_update_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();



---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION reset_user_login_metadata_after_session()
RETURNS trigger AS $$
BEGIN
    UPDATE users
    SET login_metadata = DEFAULT
    WHERE id = NEW.id_user;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_reset_login_metadata_tmp_session
AFTER INSERT ON tmp_session
FOR EACH ROW
EXECUTE FUNCTION reset_user_login_metadata_after_session();


CREATE TRIGGER trg_reset_login_metadata_const_session
AFTER INSERT ON const_session
FOR EACH ROW
EXECUTE FUNCTION reset_user_login_metadata_after_session();



CREATE OR REPLACE VIEW v_offers_with_company AS
SELECT
    o.id AS offers_id,
    o.company_id,
    c.name AS company_name,
    c.description AS company_description,
    c.website AS company_website,
    c.meta AS company_meta,
	c.logo AS company_logo,
    o.created_when,
    o.title,
    o.description AS offers_description,
    o.location,
    o.tags,
    o.type,
    o.salary,
    o.external_url,
    o.collect_application,
    o.recruiter_email,
    o.created_when AS offers_created_when,
    o.updated_when AS offers_updated_when
FROM offers o
JOIN company c ON c.id = o.company_id;