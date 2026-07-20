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

-- GateTruthRows
ALTER TABLE gate_truth_rows DROP CONSTRAINT IF EXISTS fk_gate_truth_rows_gate;
ALTER TABLE gate_truth_rows ADD CONSTRAINT fk_gate_truth_rows_gate
  FOREIGN KEY (gate) REFERENCES gate_types (gate_id);

-- Wires
ALTER TABLE wires DROP CONSTRAINT IF EXISTS fk_wires_gate;
ALTER TABLE wires ADD CONSTRAINT fk_wires_gate
  FOREIGN KEY (gate) REFERENCES gate_types (gate_id);
ALTER TABLE wires DROP CONSTRAINT IF EXISTS fk_wires_a_wire;
ALTER TABLE wires ADD CONSTRAINT fk_wires_a_wire
  FOREIGN KEY (a_wire) REFERENCES wires (wire_id);
ALTER TABLE wires DROP CONSTRAINT IF EXISTS fk_wires_b_wire;
ALTER TABLE wires ADD CONSTRAINT fk_wires_b_wire
  FOREIGN KEY (b_wire) REFERENCES wires (wire_id);

-- 4 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
