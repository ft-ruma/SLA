-- =====================================================================
-- SLA National Register — migration 010
-- 1. Preferred language on every member (en / si / ta).
-- 2. Public coach portal: certificate files, athletes a coach lists,
--    a confidential disclosure note, and who created each coach link.
-- 3. Declarations re-issued as version 2 under the SLA name.
-- 4. Coaches can enter the verification queue, not only athletes.
-- Apply after 009. Internal names (schema slaa, slaa_id) are unchanged.
-- =====================================================================

SET search_path = slaa, public;

-- ---------------------------------------------------------------------
-- 1. Language preference
-- ---------------------------------------------------------------------
ALTER TABLE member ADD COLUMN IF NOT EXISTS language_pref text NOT NULL DEFAULT 'en';
DO $$ BEGIN
  ALTER TABLE member ADD CONSTRAINT member_language_pref_ck CHECK (language_pref IN ('en', 'si', 'ta'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- 2a. Coach profile additions
-- ---------------------------------------------------------------------
ALTER TABLE coach ADD COLUMN IF NOT EXISTS confidential_disclosure text
  CHECK (confidential_disclosure IS NULL OR length(confidential_disclosure) <= 2000);
ALTER TABLE coach ADD COLUMN IF NOT EXISTS registered_via text NOT NULL DEFAULT 'staff'
  CHECK (registered_via IN ('staff', 'public'));

-- ---------------------------------------------------------------------
-- 2b. Certificate files. Uploaded before the form is submitted, tied to
--     the browser's signed pass (upload_key), then attached to the coach.
--     Unattached rows older than a day can be removed by the owner.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_document (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_key    text NOT NULL,
  coach_id      text REFERENCES coach(slaa_id) ON DELETE CASCADE,
  file_name     text NOT NULL CHECK (length(file_name) BETWEEN 1 AND 200),
  content_type  text NOT NULL CHECK (content_type IN ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes    int  NOT NULL CHECK (size_bytes BETWEEN 1 AND 3145728),
  sha256        text NOT NULL,
  data          bytea NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  attached_at   timestamptz,
  CONSTRAINT attached_has_coach CHECK (attached_at IS NULL OR coach_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS coach_document_coach_idx ON coach_document (coach_id);
CREATE INDEX IF NOT EXISTS coach_document_unattached_idx ON coach_document (created_at) WHERE coach_id IS NULL;

-- ---------------------------------------------------------------------
-- 2c. Athletes a coach lists who could not be matched to an SLA ID
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_athlete_request (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coach_id          text NOT NULL REFERENCES coach(slaa_id) ON DELETE CASCADE,
  athlete_name      text NOT NULL CHECK (length(athlete_name) BETWEEN 1 AND 120),
  athlete_slaa_id   text,
  relationship_type text NOT NULL CHECK (relationship_type IN ('CURRENT', 'PAST')),
  is_primary        boolean NOT NULL DEFAULT false,
  start_year        smallint CHECK (start_year BETWEEN 1950 AND 2100),
  end_year          smallint CHECK (end_year BETWEEN 1950 AND 2100),
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'linked', 'rejected')),
  resolved_athlete  text REFERENCES athlete(slaa_id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coach_athlete_years CHECK (end_year IS NULL OR start_year IS NULL OR end_year >= start_year)
);
CREATE INDEX IF NOT EXISTS coach_athlete_request_coach_idx ON coach_athlete_request (coach_id);

-- ---------------------------------------------------------------------
-- 2d. Who listed each athlete-coach link. Links listed by the athlete are
--     confirmed by the athlete; links listed by the coach still need the
--     athlete (or staff) to confirm.
-- ---------------------------------------------------------------------
ALTER TABLE athlete_coach ADD COLUMN IF NOT EXISTS listed_by text NOT NULL DEFAULT 'athlete'
  CHECK (listed_by IN ('athlete', 'coach', 'staff'));
ALTER TABLE athlete_coach ADD COLUMN IF NOT EXISTS is_confirmed_by_athlete boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------
-- 3. Declarations under the SLA name. Version 1 rows stay for existing
--    signatures; new coaches sign version 2.
-- ---------------------------------------------------------------------
INSERT INTO declaration_text (code, version, section, title, text_en, text_si, text_ta,
                              allows_disclosure, required, active)
SELECT code, 2, section, title, replace(text_en, 'SLAA', 'SLA'), text_si, text_ta,
       allows_disclosure, required, true
FROM declaration_text
WHERE version = 1
ON CONFLICT (code, version) DO NOTHING;

UPDATE declaration_text SET active = false WHERE version = 1 AND active;

-- ---------------------------------------------------------------------
-- 4. Verification queue covers every member (athletes and coaches)
-- ---------------------------------------------------------------------
ALTER TABLE member_verification DROP CONSTRAINT IF EXISTS member_verification_slaa_id_fkey;
ALTER TABLE member_verification ADD CONSTRAINT member_verification_slaa_id_fkey
  FOREIGN KEY (slaa_id) REFERENCES member(slaa_id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------
-- 5. App role
-- ---------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON coach_document, coach_athlete_request TO slaa_app;
GRANT USAGE, SELECT ON SEQUENCE coach_athlete_request_id_seq TO slaa_app;
GRANT SELECT, INSERT ON coach_qualification, coach_declaration TO slaa_app;
