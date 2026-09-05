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

-- TruthValues
ALTER TABLE truth_values DROP CONSTRAINT IF EXISTS fk_truth_values_facts_with_value;
ALTER TABLE truth_values ADD CONSTRAINT fk_truth_values_facts_with_value
  FOREIGN KEY (facts_with_value) REFERENCES membership_facts (membership_fact_id);

-- Connectives
ALTER TABLE connectives DROP CONSTRAINT IF EXISTS fk_connectives_truth_table_rows;
ALTER TABLE connectives ADD CONSTRAINT fk_connectives_truth_table_rows
  FOREIGN KEY (truth_table_rows) REFERENCES truth_table_rows (truth_table_row_id);

-- TruthTableRows
ALTER TABLE truth_table_rows DROP CONSTRAINT IF EXISTS fk_truth_table_rows_connective;
ALTER TABLE truth_table_rows ADD CONSTRAINT fk_truth_table_rows_connective
  FOREIGN KEY (connective) REFERENCES connectives (connective_id);
ALTER TABLE truth_table_rows DROP CONSTRAINT IF EXISTS fk_truth_table_rows_left_input;
ALTER TABLE truth_table_rows ADD CONSTRAINT fk_truth_table_rows_left_input
  FOREIGN KEY (left_input) REFERENCES truth_values (truth_value_id);
ALTER TABLE truth_table_rows DROP CONSTRAINT IF EXISTS fk_truth_table_rows_right_input;
ALTER TABLE truth_table_rows ADD CONSTRAINT fk_truth_table_rows_right_input
  FOREIGN KEY (right_input) REFERENCES truth_values (truth_value_id);
ALTER TABLE truth_table_rows DROP CONSTRAINT IF EXISTS fk_truth_table_rows_output;
ALTER TABLE truth_table_rows ADD CONSTRAINT fk_truth_table_rows_output
  FOREIGN KEY (output) REFERENCES truth_values (truth_value_id);

-- Sets
ALTER TABLE sets DROP CONSTRAINT IF EXISTS fk_sets_memberships;
ALTER TABLE sets ADD CONSTRAINT fk_sets_memberships
  FOREIGN KEY (memberships) REFERENCES membership_facts (membership_fact_id);

-- MembershipFacts
ALTER TABLE membership_facts DROP CONSTRAINT IF EXISTS fk_membership_facts_element;
ALTER TABLE membership_facts ADD CONSTRAINT fk_membership_facts_element
  FOREIGN KEY (element) REFERENCES sets (set_id);
ALTER TABLE membership_facts DROP CONSTRAINT IF EXISTS fk_membership_facts_container;
ALTER TABLE membership_facts ADD CONSTRAINT fk_membership_facts_container
  FOREIGN KEY (container) REFERENCES sets (set_id);
ALTER TABLE membership_facts DROP CONSTRAINT IF EXISTS fk_membership_facts_membership_value;
ALTER TABLE membership_facts ADD CONSTRAINT fk_membership_facts_membership_value
  FOREIGN KEY (membership_value) REFERENCES truth_values (truth_value_id);
ALTER TABLE membership_facts DROP CONSTRAINT IF EXISTS fk_membership_facts_evaluation_steps;
ALTER TABLE membership_facts ADD CONSTRAINT fk_membership_facts_evaluation_steps
  FOREIGN KEY (evaluation_steps) REFERENCES evaluation_steps (evaluation_step_id);

-- EvaluationSteps
ALTER TABLE evaluation_steps DROP CONSTRAINT IF EXISTS fk_evaluation_steps_membership_fact;
ALTER TABLE evaluation_steps ADD CONSTRAINT fk_evaluation_steps_membership_fact
  FOREIGN KEY (membership_fact) REFERENCES membership_facts (membership_fact_id);
ALTER TABLE evaluation_steps DROP CONSTRAINT IF EXISTS fk_evaluation_steps_trial_value;
ALTER TABLE evaluation_steps ADD CONSTRAINT fk_evaluation_steps_trial_value
  FOREIGN KEY (trial_value) REFERENCES truth_values (truth_value_id);
ALTER TABLE evaluation_steps DROP CONSTRAINT IF EXISTS fk_evaluation_steps_resulting_value;
ALTER TABLE evaluation_steps ADD CONSTRAINT fk_evaluation_steps_resulting_value
  FOREIGN KEY (resulting_value) REFERENCES truth_values (truth_value_id);

-- 14 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
