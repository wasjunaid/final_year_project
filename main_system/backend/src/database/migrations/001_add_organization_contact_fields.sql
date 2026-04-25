-- Adds shared organization contact fields for hospitals and insurance companies.
-- This migration is idempotent and safe to rerun.

ALTER TABLE IF EXISTS hospital
    ADD COLUMN IF NOT EXISTS focal_person_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS focal_person_email VARCHAR(320),
    ADD COLUMN IF NOT EXISTS focal_person_phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS address VARCHAR(500);

ALTER TABLE IF EXISTS insurance_company
    ADD COLUMN IF NOT EXISTS focal_person_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS focal_person_email VARCHAR(320),
    ADD COLUMN IF NOT EXISTS focal_person_phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS address VARCHAR(500),
    ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);
