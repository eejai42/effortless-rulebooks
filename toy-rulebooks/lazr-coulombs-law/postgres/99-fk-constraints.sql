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

-- Charges
ALTER TABLE charges DROP CONSTRAINT IF EXISTS fk_charges_system_id;
ALTER TABLE charges ADD CONSTRAINT fk_charges_system_id
  FOREIGN KEY (system_id) REFERENCES systems (system_id);
ALTER TABLE charges DROP CONSTRAINT IF EXISTS fk_charges_particle_id;
ALTER TABLE charges ADD CONSTRAINT fk_charges_particle_id
  FOREIGN KEY (particle_id) REFERENCES particles (particle_id);

-- SystemSummary
ALTER TABLE system_summary DROP CONSTRAINT IF EXISTS fk_system_summary_system_id;
ALTER TABLE system_summary ADD CONSTRAINT fk_system_summary_system_id
  FOREIGN KEY (system_id) REFERENCES systems (system_id);

-- 3 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
