-- =====================================================================
-- SLA National Register — migration 011
-- 1. One role-neutral SLA ID for every new member: SL26-000452-8
--    (year, 6-digit serial, Luhn check digit over the 8 digits).
--    Existing A/C/O IDs stay valid and are never renumbered.
-- 2. Shorter coach declarations (version 3).
-- 3. Optional coach profile photo, stored like certificates.
-- 4. Club registry (CLB-CMB-0042, CLB-FOR-0001 for the forces).
-- 5. Athlete affiliation: school/university and club/armed force.
-- Apply after 010. Safe to re-run.
-- =====================================================================

SET search_path = slaa, public;

-- ---------------------------------------------------------------------
-- 1. Unified SLA ID
-- ---------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS member_serial_seq START 1 MAXVALUE 999999;

-- Serials continue after the highest one already issued, so no serial is
-- ever shared by two members (A26-000003 and SL26-000003 would look alike).
DO $$
DECLARE
  used bigint;
BEGIN
  SELECT coalesce(max(substring(slaa_id FROM '-([0-9]{6})-')::bigint), 0) INTO used FROM member;
  IF used >= (SELECT last_value FROM member_serial_seq) THEN
    PERFORM setval('member_serial_seq', used);
  END IF;
END $$;

-- kind is kept so older callers still work; every new ID uses the SL prefix.
CREATE OR REPLACE FUNCTION new_slaa_id(kind char DEFAULT NULL)
RETURNS text LANGUAGE plpgsql
  SET search_path = slaa, public AS $$
DECLARE
  body text;
BEGIN
  body := 'SL' || to_char(now(), 'YY') || '-' || lpad(nextval('member_serial_seq')::text, 6, '0');
  RETURN body || '-' || slaa_check_digit(body);
END $$;

ALTER TABLE member ALTER COLUMN slaa_id SET DEFAULT new_slaa_id('A');

-- ---------------------------------------------------------------------
-- 2. Coach declarations, version 3: three short statements.
--    Earlier versions stay for the coaches who signed them.
-- ---------------------------------------------------------------------
INSERT INTO declaration_text (code, version, section, title, text_en, allows_disclosure, required, active) VALUES
('TRUE_AND_CONSENT', 3, 'legal', 'True information',
 'The information I have given is true. SLA may check it and keep it in the national register under the Personal Data Protection Act No. 9 of 2022.',
 false, true, true),
('CLEAN_RECORD', 3, 'safeguarding', 'Clean record',
 'I have no conviction for offences against children or for violence, and no current anti-doping ban. If this is not true, choose "I need to disclose".',
 true, true, true),
('COACH_CODE', 3, 'integrity', 'Coach code',
 'I will keep athletes safe, support clean sport and follow the SLA coach code.',
 false, true, true)
ON CONFLICT (code, version) DO NOTHING;

UPDATE declaration_text SET active = false WHERE version < 3 AND active;

-- ---------------------------------------------------------------------
-- 3. Coach profile photo (JPG or PNG). One per coach.
-- ---------------------------------------------------------------------
ALTER TABLE coach_document ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'certificate';
DO $$ BEGIN
  ALTER TABLE coach_document ADD CONSTRAINT coach_document_kind_ck CHECK (
    kind IN ('certificate', 'photo') AND (kind <> 'photo' OR content_type IN ('image/jpeg', 'image/png')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS coach_document_one_photo_uq
  ON coach_document (coach_id) WHERE kind = 'photo' AND coach_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 4. Club registry
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION district_code(d text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE d
    WHEN 'Colombo' THEN 'CMB' WHEN 'Gampaha' THEN 'GAM' WHEN 'Kalutara' THEN 'KLT'
    WHEN 'Kandy' THEN 'KDY' WHEN 'Matale' THEN 'MTL' WHEN 'Nuwara Eliya' THEN 'NUW'
    WHEN 'Galle' THEN 'GAL' WHEN 'Matara' THEN 'MTR' WHEN 'Hambantota' THEN 'HBT'
    WHEN 'Jaffna' THEN 'JAF' WHEN 'Kilinochchi' THEN 'KIL' WHEN 'Mannar' THEN 'MNR'
    WHEN 'Vavuniya' THEN 'VAV' WHEN 'Mullaitivu' THEN 'MLT' WHEN 'Batticaloa' THEN 'BAT'
    WHEN 'Ampara' THEN 'AMP' WHEN 'Trincomalee' THEN 'TRC' WHEN 'Kurunegala' THEN 'KUR'
    WHEN 'Puttalam' THEN 'PTM' WHEN 'Anuradhapura' THEN 'ANU' WHEN 'Polonnaruwa' THEN 'POL'
    WHEN 'Badulla' THEN 'BDL' WHEN 'Monaragala' THEN 'MON' WHEN 'Ratnapura' THEN 'RAT'
    WHEN 'Kegalle' THEN 'KEG'
  END;
$$;

CREATE SEQUENCE IF NOT EXISTS club_seq START 1 MAXVALUE 9999;

-- Armed forces and police are not registered as clubs: athletes choose them
-- from a fixed list. Every club ID carries its district code.
DROP FUNCTION IF EXISTS new_club_id(text, text);
CREATE OR REPLACE FUNCTION new_club_id(p_district text)
RETURNS text LANGUAGE sql
  SET search_path = slaa, public AS $$
  SELECT 'CLB-' || district_code(p_district) || '-' || lpad(nextval('club_seq')::text, 4, '0');
$$;

CREATE TABLE IF NOT EXISTS club (
  club_id            text PRIMARY KEY,
  name               text NOT NULL CHECK (length(name) BETWEEN 3 AND 150),
  category           text NOT NULL,
  affiliation_number text,
  district           text NOT NULL REFERENCES district(name),
  president_name     text NOT NULL,
  president_nic      char(12),
  president_phone    text NOT NULL,
  secretary_name     text NOT NULL,
  secretary_nic      char(12) NOT NULL,
  secretary_phone    text NOT NULL,
  email              text NOT NULL,
  status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended')),
  language_pref      text NOT NULL DEFAULT 'en' CHECK (language_pref IN ('en', 'si', 'ta')),
  verified_by        text,
  verified_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
-- also brings a database that ran an earlier draft of this file up to date
ALTER TABLE club DROP CONSTRAINT IF EXISTS club_force_branch;
ALTER TABLE club DROP COLUMN IF EXISTS force_branch;
ALTER TABLE club DROP CONSTRAINT IF EXISTS club_category_check;
ALTER TABLE club ADD CONSTRAINT club_category_check
  CHECK (category IN ('UNIVERSITY', 'SCHOOL', 'CIVIL_CLUB', 'INSTITUTIONAL'));
CREATE UNIQUE INDEX IF NOT EXISTS club_name_uq ON club (lower(name)) WHERE status <> 'suspended';
CREATE UNIQUE INDEX IF NOT EXISTS club_affiliation_uq ON club (upper(affiliation_number))
  WHERE affiliation_number IS NOT NULL;

-- ---------------------------------------------------------------------
-- 5. Athlete affiliation. A university student can also compete for the
--    Army, a club or the police; both are kept.
-- ---------------------------------------------------------------------
ALTER TABLE athlete
  ADD COLUMN IF NOT EXISTS academic_status text NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS academic_institution text,
  ADD COLUMN IF NOT EXISTS represents_club_or_force boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS club_category text,
  ADD COLUMN IF NOT EXISTS club_id text REFERENCES club(club_id),
  ADD COLUMN IF NOT EXISTS unlisted_club_name text,
  ADD COLUMN IF NOT EXISTS forces_membership_type text,
  ADD COLUMN IF NOT EXISTS forces_service_id text;

DO $$ BEGIN
  ALTER TABLE athlete ADD CONSTRAINT athlete_affiliation_ck CHECK (
    academic_status IN ('SCHOOL', 'UNIVERSITY', 'NONE')
    AND (academic_status = 'NONE' OR length(trim(coalesce(academic_institution, ''))) > 0)
    AND (club_category IS NULL OR club_category IN ('ARMY', 'NAVY', 'AIR_FORCE', 'POLICE', 'CIVIL_CLUB', 'OTHER'))
    AND (represents_club_or_force = (club_category IS NOT NULL))
    AND (club_category IS DISTINCT FROM 'CIVIL_CLUB' OR club_id IS NOT NULL)
    AND (club_category IS DISTINCT FROM 'OTHER' OR length(trim(coalesce(unlisted_club_name, ''))) > 0)
    AND (forces_membership_type IS NULL OR forces_membership_type IN ('REGULAR_SERVICE', 'CONTRACT_SPORTS'))
    AND (coalesce(club_category IN ('ARMY', 'NAVY', 'AIR_FORCE', 'POLICE'), false) = (forces_membership_type IS NOT NULL)));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS athlete_club_idx ON athlete (club_id) WHERE club_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS athlete_unlisted_club_idx ON athlete (lower(unlisted_club_name))
  WHERE unlisted_club_name IS NOT NULL;

-- ---------------------------------------------------------------------
-- 6. App role
-- ---------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON club TO slaa_app;
GRANT USAGE, SELECT ON SEQUENCE member_serial_seq, club_seq TO slaa_app;
