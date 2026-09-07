-- ============================================================================
-- 99-fk-constraints.sql — FK CONSTRAINTS (off by default)
-- ============================================================================
-- Demos must never fail on FK violations, so init-db.sh SKIPS this file
-- unless EFFORTLESS_ENFORCE_FKS=true is set in the environment.
--
--   EFFORTLESS_ENFORCE_FKS=true bash init-db.sh    # apply constraints
--   bash init-db.sh                                # leave them documented but unenforced
--
-- The rulebook always documents the FK relationships, and 01-drop-and-create-tables.sql
-- always installs the supporting indexes inline. This file just declares the actual
-- enforcement. Idempotent: every constraint is dropped if present, then added.
-- ============================================================================

-- HockettAssessments
ALTER TABLE hockett_assessments DROP CONSTRAINT IF EXISTS fk_hockett_assessments_language_candidate;
ALTER TABLE hockett_assessments ADD CONSTRAINT fk_hockett_assessments_language_candidate
  FOREIGN KEY (language_candidate) REFERENCES language_candidates (language_candidate_id);
ALTER TABLE hockett_assessments DROP CONSTRAINT IF EXISTS fk_hockett_assessments_hockett_feature;
ALTER TABLE hockett_assessments ADD CONSTRAINT fk_hockett_assessments_hockett_feature
  FOREIGN KEY (hockett_feature) REFERENCES hockett_features (hockett_feature_id);

-- 2 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
