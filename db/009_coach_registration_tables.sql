-- =====================================================================
-- 009_coach_registration_tables.sql
-- Integrates Coach Registration subsystem tables (qualifications,
-- declarations, and texts) into the unified SLAA schema.
-- =====================================================================

SET search_path = slaa, public;

-- ---------------------------------------------------------------------
-- 1. Coach Qualifications (World Athletics / CECS / National)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_qualification (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coach_id            text NOT NULL REFERENCES coach(slaa_id) ON DELETE CASCADE,
  level               text NOT NULL CHECK (level IN (
                        'CECS_L1_YOUTH',
                        'CECS_L2_EVENT',
                        'CECS_L3_ELITE',
                        'SLAA_NATIONAL',
                        'UNIVERSITY_SPORT_SCI',
                        'OTHER')),
  level_other_text    text,
  event_group         text,
  issuing_body        text NOT NULL,
  certificate_serial  text,
  year_awarded        smallint NOT NULL CHECK (year_awarded BETWEEN 1970 AND 2100),
  document_path       text,
  verification_status text NOT NULL DEFAULT 'unverified'
                      CHECK (verification_status IN ('unverified','verified','rejected')),
  verified_by         text,
  verified_at         timestamptz,
  rejection_reason    text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT other_needs_text CHECK (level <> 'OTHER' OR level_other_text IS NOT NULL),
  CONSTRAINT rejected_needs_reason CHECK (verification_status <> 'rejected' OR rejection_reason IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS coach_qualification_serial_uq
  ON coach_qualification (issuing_body, certificate_serial)
  WHERE certificate_serial IS NOT NULL;

-- ---------------------------------------------------------------------
-- 2. Coach Declarations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS declaration_text (
  code              text NOT NULL,
  version           int  NOT NULL,
  section           text NOT NULL CHECK (section IN
                      ('certification','safeguarding','integrity','athletes','legal')),
  title             text NOT NULL,
  text_en           text NOT NULL,
  text_si           text,
  text_ta           text,
  allows_disclosure boolean NOT NULL DEFAULT false,
  required          boolean NOT NULL DEFAULT true,
  active            boolean NOT NULL DEFAULT true,
  PRIMARY KEY (code, version)
);

CREATE TABLE IF NOT EXISTS coach_declaration (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coach_id           text NOT NULL REFERENCES coach(slaa_id) ON DELETE CASCADE,
  code               text NOT NULL,
  version            int  NOT NULL,
  answer             text NOT NULL CHECK (answer IN ('confirm','disclose')),
  disclosure_details text,
  signed_name        text NOT NULL,
  accepted_at        timestamptz NOT NULL DEFAULT now(),
  ip_address         inet,
  user_agent         text,
  review_status      text NOT NULL DEFAULT 'not_needed'
                     CHECK (review_status IN ('not_needed','pending','cleared','upheld')),
  reviewed_by        text,
  reviewed_at        timestamptz,
  FOREIGN KEY (code, version) REFERENCES declaration_text(code, version),
  CONSTRAINT disclose_needs_details CHECK (answer = 'confirm' OR length(trim(disclosure_details)) > 0),
  CONSTRAINT disclose_needs_review CHECK (answer = 'confirm' OR review_status <> 'not_needed')
);

CREATE INDEX IF NOT EXISTS coach_declaration_coach_idx ON coach_declaration (coach_id, code);

-- ---------------------------------------------------------------------
-- 3. Seed Declarations
-- ---------------------------------------------------------------------
INSERT INTO declaration_text (code, version, section, title, text_en, allows_disclosure) VALUES
('NO_CONVICTIONS', 1, 'safeguarding', 'Criminal record',
 'I confirm that I have no criminal convictions, and no pending investigations or charges, relating to sexual offences, exploitation, child abuse or neglect, or violence. If this is not true for me, I will choose "I need to disclose" and give details.', true),
('POLICE_CLEARANCE', 1, 'safeguarding', 'Police clearance',
 'I agree to provide a current Police Clearance Certificate when SLAA requests it, and to tell SLAA within 14 days if I am charged with or convicted of any offence.', false),
('SAFEGUARDING_CODE', 1, 'safeguarding', 'Safeguarding code of conduct',
 'I agree to follow the SLAA safeguarding code of conduct: keep appropriate physical and communication boundaries with athletes, never be alone in private with a minor where avoidable, keep a parent or guardian included in messages to athletes under 18, ensure a safe training environment, and report any concern about abuse to the SLAA safeguarding officer.', false),
('NO_DOPING_SANCTION', 1, 'integrity', 'Anti-doping record',
 'I confirm that I am not currently serving a sanction or provisional suspension under the World Anti-Doping Code, from the Sri Lanka Anti-Doping Agency (SLADA), the Athletics Integrity Unit (AIU) or any sport body. If this is not true for me, I will choose "I need to disclose" and give details.', true),
('CLEAN_SPORT', 1, 'integrity', 'Commitment to clean sport',
 'I will not administer, supply, traffic, encourage or help hide the use of any prohibited substance or method, and I will support my athletes to meet their anti-doping obligations.', false),
('NO_MANIPULATION', 1, 'integrity', 'Competition manipulation',
 'I will not take part in fixing or manipulating any competition, betting on athletics events involving my athletes, or sharing inside information for betting.', false),
('ATHLETE_ROSTER', 1, 'athletes', 'Athletes I coach',
 'I confirm that every athlete I list as current is actively training under my supervision, and that the coaching periods I give for past athletes are accurate.', false),
('TRANSFER_RULES', 1, 'athletes', 'Athlete transfers',
 'I confirm that, to my knowledge, athletes who moved to or from me did so in line with SLAA transfer rules and without an unresolved dispute.', false),
('TRUE_INFORMATION', 1, 'legal', 'Truth of information',
 'I confirm that all information in this application is true, complete and accurate. I understand that false information or credentials will lead to disciplinary action and revocation of my registration or accreditation.', false),
('DATA_CONSENT', 1, 'legal', 'Use of my data',
 'I consent to SLAA storing and processing my personal and professional details in the national athletics database, and sharing them with World Athletics where needed for accreditation, in line with the Personal Data Protection Act No. 9 of 2022.', false),
('VERIFY_CONSENT', 1, 'legal', 'Verification checks',
 'I allow SLAA to check my credentials with the bodies that issued them, my past clubs and schools, World Athletics, SLADA and the AIU.', false)
ON CONFLICT (code, version) DO NOTHING;

-- ---------------------------------------------------------------------
-- 4. Role Permissions
-- ---------------------------------------------------------------------
DO $$ BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON coach_qualification, declaration_text, coach_declaration TO slaa_app;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
