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

-- scales
ALTER TABLE scales DROP CONSTRAINT IF EXISTS fk_scales_system;
ALTER TABLE scales ADD CONSTRAINT fk_scales_system
  FOREIGN KEY ("system") REFERENCES systems (system_id);
ALTER TABLE scales DROP CONSTRAINT IF EXISTS fk_scales_measurement_model;
ALTER TABLE scales ADD CONSTRAINT fk_scales_measurement_model
  FOREIGN KEY (measurement_model) REFERENCES measurement_models (measurement_model_id);

-- system_stats
ALTER TABLE system_stats DROP CONSTRAINT IF EXISTS fk_system_stats_system;
ALTER TABLE system_stats ADD CONSTRAINT fk_system_stats_system
  FOREIGN KEY ("system") REFERENCES systems (system_id);

-- measurement_models
ALTER TABLE measurement_models DROP CONSTRAINT IF EXISTS fk_measurement_models_system;
ALTER TABLE measurement_models ADD CONSTRAINT fk_measurement_models_system
  FOREIGN KEY ("system") REFERENCES systems (system_id);

-- observed_scales
ALTER TABLE observed_scales DROP CONSTRAINT IF EXISTS fk_observed_scales_system;
ALTER TABLE observed_scales ADD CONSTRAINT fk_observed_scales_system
  FOREIGN KEY ("system") REFERENCES systems (system_id);
ALTER TABLE observed_scales DROP CONSTRAINT IF EXISTS fk_observed_scales_measurement_model;
ALTER TABLE observed_scales ADD CONSTRAINT fk_observed_scales_measurement_model
  FOREIGN KEY (measurement_model) REFERENCES measurement_models (measurement_model_id);

-- inference_runs
ALTER TABLE inference_runs DROP CONSTRAINT IF EXISTS fk_inference_runs_system;
ALTER TABLE inference_runs ADD CONSTRAINT fk_inference_runs_system
  FOREIGN KEY ("system") REFERENCES systems (system_id);
ALTER TABLE inference_runs DROP CONSTRAINT IF EXISTS fk_inference_runs_measurement_model;
ALTER TABLE inference_runs ADD CONSTRAINT fk_inference_runs_measurement_model
  FOREIGN KEY (measurement_model) REFERENCES measurement_models (measurement_model_id);

-- scale_regimes
ALTER TABLE scale_regimes DROP CONSTRAINT IF EXISTS fk_scale_regimes_system;
ALTER TABLE scale_regimes ADD CONSTRAINT fk_scale_regimes_system
  FOREIGN KEY ("system") REFERENCES systems (system_id);

-- 9 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
