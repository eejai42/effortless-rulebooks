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

-- AutoimmuneDiseases
ALTER TABLE autoimmune_diseases DROP CONSTRAINT IF EXISTS fk_autoimmune_diseases_disease_stages;
ALTER TABLE autoimmune_diseases ADD CONSTRAINT fk_autoimmune_diseases_disease_stages
  FOREIGN KEY (disease_stages) REFERENCES disease_stages (disease_stage_id);
ALTER TABLE autoimmune_diseases DROP CONSTRAINT IF EXISTS fk_autoimmune_diseases_treatments;
ALTER TABLE autoimmune_diseases ADD CONSTRAINT fk_autoimmune_diseases_treatments
  FOREIGN KEY (treatments) REFERENCES treatments (treatment_id);
ALTER TABLE autoimmune_diseases DROP CONSTRAINT IF EXISTS fk_autoimmune_diseases_clinical_phenotypes;
ALTER TABLE autoimmune_diseases ADD CONSTRAINT fk_autoimmune_diseases_clinical_phenotypes
  FOREIGN KEY (clinical_phenotypes) REFERENCES clinical_phenotypes (clinical_phenotype_id);
ALTER TABLE autoimmune_diseases DROP CONSTRAINT IF EXISTS fk_autoimmune_diseases_individual_predictions;
ALTER TABLE autoimmune_diseases ADD CONSTRAINT fk_autoimmune_diseases_individual_predictions
  FOREIGN KEY (individual_predictions) REFERENCES individual_predictions (individual_prediction_id);
ALTER TABLE autoimmune_diseases DROP CONSTRAINT IF EXISTS fk_autoimmune_diseases_counterfactual_trajectories;
ALTER TABLE autoimmune_diseases ADD CONSTRAINT fk_autoimmune_diseases_counterfactual_trajectories
  FOREIGN KEY (counterfactual_trajectories) REFERENCES counterfactual_trajectories (counterfactual_trajectory_id);
ALTER TABLE autoimmune_diseases DROP CONSTRAINT IF EXISTS fk_autoimmune_diseases_intervention_targets;
ALTER TABLE autoimmune_diseases ADD CONSTRAINT fk_autoimmune_diseases_intervention_targets
  FOREIGN KEY (intervention_targets) REFERENCES intervention_targets (intervention_target_id);

-- DiseaseStages
ALTER TABLE disease_stages DROP CONSTRAINT IF EXISTS fk_disease_stages_autoimmune_disease;
ALTER TABLE disease_stages ADD CONSTRAINT fk_disease_stages_autoimmune_disease
  FOREIGN KEY (autoimmune_disease) REFERENCES autoimmune_diseases (autoimmune_disease_id);

-- Tissues
ALTER TABLE tissues DROP CONSTRAINT IF EXISTS fk_tissues_tissue_label;
ALTER TABLE tissues ADD CONSTRAINT fk_tissues_tissue_label
  FOREIGN KEY (tissue_label) REFERENCES tissues (tissue_id);
ALTER TABLE tissues DROP CONSTRAINT IF EXISTS fk_tissues_omics_assays;
ALTER TABLE tissues ADD CONSTRAINT fk_tissues_omics_assays
  FOREIGN KEY (omics_assays) REFERENCES omics_assays (omics_assay_id);

-- OmicsModalities
ALTER TABLE omics_modalities DROP CONSTRAINT IF EXISTS fk_omics_modalities_omics_assays;
ALTER TABLE omics_modalities ADD CONSTRAINT fk_omics_modalities_omics_assays
  FOREIGN KEY (omics_assays) REFERENCES omics_assays (omics_assay_id);

-- FederatedDatasets
ALTER TABLE federated_datasets DROP CONSTRAINT IF EXISTS fk_federated_datasets_individuals;
ALTER TABLE federated_datasets ADD CONSTRAINT fk_federated_datasets_individuals
  FOREIGN KEY (individuals) REFERENCES individuals (individual_id);
ALTER TABLE federated_datasets DROP CONSTRAINT IF EXISTS fk_federated_datasets_omics_assays;
ALTER TABLE federated_datasets ADD CONSTRAINT fk_federated_datasets_omics_assays
  FOREIGN KEY (omics_assays) REFERENCES omics_assays (omics_assay_id);
ALTER TABLE federated_datasets DROP CONSTRAINT IF EXISTS fk_federated_datasets_cohort_replications;
ALTER TABLE federated_datasets ADD CONSTRAINT fk_federated_datasets_cohort_replications
  FOREIGN KEY (cohort_replications) REFERENCES cohort_replications (cohort_replication_id);

-- VariantTypes
ALTER TABLE variant_types DROP CONSTRAINT IF EXISTS fk_variant_types_genomic_variants;
ALTER TABLE variant_types ADD CONSTRAINT fk_variant_types_genomic_variants
  FOREIGN KEY (genomic_variants) REFERENCES genomic_variants (genomic_variant_id);

-- Individuals
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_federated_dataset;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_federated_dataset
  FOREIGN KEY (federated_dataset) REFERENCES federated_datasets (federated_dataset_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_genomic_variants;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_genomic_variants
  FOREIGN KEY (genomic_variants) REFERENCES genomic_variants (genomic_variant_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_omics_assays;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_omics_assays
  FOREIGN KEY (omics_assays) REFERENCES omics_assays (omics_assay_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_environmental_exposures;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_environmental_exposures
  FOREIGN KEY (environmental_exposures) REFERENCES environmental_exposures (environmental_exposure_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_treatments;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_treatments
  FOREIGN KEY (treatments) REFERENCES treatments (treatment_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_clinical_phenotypes;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_clinical_phenotypes
  FOREIGN KEY (clinical_phenotypes) REFERENCES clinical_phenotypes (clinical_phenotype_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_causal_mechanisms;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_causal_mechanisms
  FOREIGN KEY (causal_mechanisms) REFERENCES causal_mechanisms (causal_mechanism_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_epistatic_interactions;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_epistatic_interactions
  FOREIGN KEY (epistatic_interactions) REFERENCES epistatic_interactions (epistatic_interaction_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_counterfactual_trajectories;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_counterfactual_trajectories
  FOREIGN KEY (counterfactual_trajectories) REFERENCES counterfactual_trajectories (counterfactual_trajectory_id);
ALTER TABLE individuals DROP CONSTRAINT IF EXISTS fk_individuals_individual_predictions;
ALTER TABLE individuals ADD CONSTRAINT fk_individuals_individual_predictions
  FOREIGN KEY (individual_predictions) REFERENCES individual_predictions (individual_prediction_id);

-- GenomicVariants
ALTER TABLE genomic_variants DROP CONSTRAINT IF EXISTS fk_genomic_variants_individual;
ALTER TABLE genomic_variants ADD CONSTRAINT fk_genomic_variants_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE genomic_variants DROP CONSTRAINT IF EXISTS fk_genomic_variants_variant_type;
ALTER TABLE genomic_variants ADD CONSTRAINT fk_genomic_variants_variant_type
  FOREIGN KEY (variant_type) REFERENCES variant_types (variant_type_id);

-- OmicsAssays
ALTER TABLE omics_assays DROP CONSTRAINT IF EXISTS fk_omics_assays_assay_label;
ALTER TABLE omics_assays ADD CONSTRAINT fk_omics_assays_assay_label
  FOREIGN KEY (assay_label) REFERENCES omics_assays (omics_assay_id);
ALTER TABLE omics_assays DROP CONSTRAINT IF EXISTS fk_omics_assays_individual;
ALTER TABLE omics_assays ADD CONSTRAINT fk_omics_assays_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE omics_assays DROP CONSTRAINT IF EXISTS fk_omics_assays_omics_modality;
ALTER TABLE omics_assays ADD CONSTRAINT fk_omics_assays_omics_modality
  FOREIGN KEY (omics_modality) REFERENCES omics_modalities (omics_modality_id);
ALTER TABLE omics_assays DROP CONSTRAINT IF EXISTS fk_omics_assays_tissue;
ALTER TABLE omics_assays ADD CONSTRAINT fk_omics_assays_tissue
  FOREIGN KEY (tissue) REFERENCES tissues (tissue_id);
ALTER TABLE omics_assays DROP CONSTRAINT IF EXISTS fk_omics_assays_evidence_items;
ALTER TABLE omics_assays ADD CONSTRAINT fk_omics_assays_evidence_items
  FOREIGN KEY (evidence_items) REFERENCES evidence_items (evidence_item_id);

-- EvidenceItems
ALTER TABLE evidence_items DROP CONSTRAINT IF EXISTS fk_evidence_items_evidence_label;
ALTER TABLE evidence_items ADD CONSTRAINT fk_evidence_items_evidence_label
  FOREIGN KEY (evidence_label) REFERENCES evidence_items (evidence_item_id);
ALTER TABLE evidence_items DROP CONSTRAINT IF EXISTS fk_evidence_items_causal_mechanism;
ALTER TABLE evidence_items ADD CONSTRAINT fk_evidence_items_causal_mechanism
  FOREIGN KEY (causal_mechanism) REFERENCES causal_mechanisms (causal_mechanism_id);
ALTER TABLE evidence_items DROP CONSTRAINT IF EXISTS fk_evidence_items_omics_assay;
ALTER TABLE evidence_items ADD CONSTRAINT fk_evidence_items_omics_assay
  FOREIGN KEY (omics_assay) REFERENCES omics_assays (omics_assay_id);

-- CohortReplications
ALTER TABLE cohort_replications DROP CONSTRAINT IF EXISTS fk_cohort_replications_replication_label;
ALTER TABLE cohort_replications ADD CONSTRAINT fk_cohort_replications_replication_label
  FOREIGN KEY (replication_label) REFERENCES cohort_replications (cohort_replication_id);
ALTER TABLE cohort_replications DROP CONSTRAINT IF EXISTS fk_cohort_replications_causal_mechanism;
ALTER TABLE cohort_replications ADD CONSTRAINT fk_cohort_replications_causal_mechanism
  FOREIGN KEY (causal_mechanism) REFERENCES causal_mechanisms (causal_mechanism_id);
ALTER TABLE cohort_replications DROP CONSTRAINT IF EXISTS fk_cohort_replications_federated_dataset;
ALTER TABLE cohort_replications ADD CONSTRAINT fk_cohort_replications_federated_dataset
  FOREIGN KEY (federated_dataset) REFERENCES federated_datasets (federated_dataset_id);

-- NegativeControlTests
ALTER TABLE negative_control_tests DROP CONSTRAINT IF EXISTS fk_negative_control_tests_control_label;
ALTER TABLE negative_control_tests ADD CONSTRAINT fk_negative_control_tests_control_label
  FOREIGN KEY (control_label) REFERENCES negative_control_tests (negative_control_test_id);
ALTER TABLE negative_control_tests DROP CONSTRAINT IF EXISTS fk_negative_control_tests_causal_mechanism;
ALTER TABLE negative_control_tests ADD CONSTRAINT fk_negative_control_tests_causal_mechanism
  FOREIGN KEY (causal_mechanism) REFERENCES causal_mechanisms (causal_mechanism_id);

-- EnvironmentalExposures
ALTER TABLE environmental_exposures DROP CONSTRAINT IF EXISTS fk_environmental_exposures_individual;
ALTER TABLE environmental_exposures ADD CONSTRAINT fk_environmental_exposures_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);

-- Treatments
ALTER TABLE treatments DROP CONSTRAINT IF EXISTS fk_treatments_individual;
ALTER TABLE treatments ADD CONSTRAINT fk_treatments_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE treatments DROP CONSTRAINT IF EXISTS fk_treatments_autoimmune_disease;
ALTER TABLE treatments ADD CONSTRAINT fk_treatments_autoimmune_disease
  FOREIGN KEY (autoimmune_disease) REFERENCES autoimmune_diseases (autoimmune_disease_id);
ALTER TABLE treatments DROP CONSTRAINT IF EXISTS fk_treatments_targets_mechanism;
ALTER TABLE treatments ADD CONSTRAINT fk_treatments_targets_mechanism
  FOREIGN KEY (targets_mechanism) REFERENCES causal_mechanisms (causal_mechanism_id);

-- ClinicalPhenotypes
ALTER TABLE clinical_phenotypes DROP CONSTRAINT IF EXISTS fk_clinical_phenotypes_individual;
ALTER TABLE clinical_phenotypes ADD CONSTRAINT fk_clinical_phenotypes_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE clinical_phenotypes DROP CONSTRAINT IF EXISTS fk_clinical_phenotypes_autoimmune_disease;
ALTER TABLE clinical_phenotypes ADD CONSTRAINT fk_clinical_phenotypes_autoimmune_disease
  FOREIGN KEY (autoimmune_disease) REFERENCES autoimmune_diseases (autoimmune_disease_id);
ALTER TABLE clinical_phenotypes DROP CONSTRAINT IF EXISTS fk_clinical_phenotypes_disease_stage;
ALTER TABLE clinical_phenotypes ADD CONSTRAINT fk_clinical_phenotypes_disease_stage
  FOREIGN KEY (disease_stage) REFERENCES disease_stages (disease_stage_id);
ALTER TABLE clinical_phenotypes DROP CONSTRAINT IF EXISTS fk_clinical_phenotypes_tissue;
ALTER TABLE clinical_phenotypes ADD CONSTRAINT fk_clinical_phenotypes_tissue
  FOREIGN KEY (tissue) REFERENCES tissues (tissue_id);

-- CausalMechanisms
ALTER TABLE causal_mechanisms DROP CONSTRAINT IF EXISTS fk_causal_mechanisms_individual;
ALTER TABLE causal_mechanisms ADD CONSTRAINT fk_causal_mechanisms_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE causal_mechanisms DROP CONSTRAINT IF EXISTS fk_causal_mechanisms_genomic_variant;
ALTER TABLE causal_mechanisms ADD CONSTRAINT fk_causal_mechanisms_genomic_variant
  FOREIGN KEY (genomic_variant) REFERENCES genomic_variants (genomic_variant_id);
ALTER TABLE causal_mechanisms DROP CONSTRAINT IF EXISTS fk_causal_mechanisms_mechanism_type;
ALTER TABLE causal_mechanisms ADD CONSTRAINT fk_causal_mechanisms_mechanism_type
  FOREIGN KEY (mechanism_type) REFERENCES variant_types (variant_type_id);
ALTER TABLE causal_mechanisms DROP CONSTRAINT IF EXISTS fk_causal_mechanisms_intervention_targets;
ALTER TABLE causal_mechanisms ADD CONSTRAINT fk_causal_mechanisms_intervention_targets
  FOREIGN KEY (intervention_targets) REFERENCES intervention_targets (intervention_target_id);
ALTER TABLE causal_mechanisms DROP CONSTRAINT IF EXISTS fk_causal_mechanisms_evidence_items;
ALTER TABLE causal_mechanisms ADD CONSTRAINT fk_causal_mechanisms_evidence_items
  FOREIGN KEY (evidence_items) REFERENCES evidence_items (evidence_item_id);
ALTER TABLE causal_mechanisms DROP CONSTRAINT IF EXISTS fk_causal_mechanisms_cohort_replications;
ALTER TABLE causal_mechanisms ADD CONSTRAINT fk_causal_mechanisms_cohort_replications
  FOREIGN KEY (cohort_replications) REFERENCES cohort_replications (cohort_replication_id);
ALTER TABLE causal_mechanisms DROP CONSTRAINT IF EXISTS fk_causal_mechanisms_negative_control_tests;
ALTER TABLE causal_mechanisms ADD CONSTRAINT fk_causal_mechanisms_negative_control_tests
  FOREIGN KEY (negative_control_tests) REFERENCES negative_control_tests (negative_control_test_id);

-- EpistaticInteractions
ALTER TABLE epistatic_interactions DROP CONSTRAINT IF EXISTS fk_epistatic_interactions_individual;
ALTER TABLE epistatic_interactions ADD CONSTRAINT fk_epistatic_interactions_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE epistatic_interactions DROP CONSTRAINT IF EXISTS fk_epistatic_interactions_primary_variant;
ALTER TABLE epistatic_interactions ADD CONSTRAINT fk_epistatic_interactions_primary_variant
  FOREIGN KEY (primary_variant) REFERENCES genomic_variants (genomic_variant_id);
ALTER TABLE epistatic_interactions DROP CONSTRAINT IF EXISTS fk_epistatic_interactions_secondary_variant;
ALTER TABLE epistatic_interactions ADD CONSTRAINT fk_epistatic_interactions_secondary_variant
  FOREIGN KEY (secondary_variant) REFERENCES genomic_variants (genomic_variant_id);

-- CounterfactualTrajectories
ALTER TABLE counterfactual_trajectories DROP CONSTRAINT IF EXISTS fk_counterfactual_trajectories_individual;
ALTER TABLE counterfactual_trajectories ADD CONSTRAINT fk_counterfactual_trajectories_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE counterfactual_trajectories DROP CONSTRAINT IF EXISTS fk_counterfactual_trajectories_autoimmune_disease;
ALTER TABLE counterfactual_trajectories ADD CONSTRAINT fk_counterfactual_trajectories_autoimmune_disease
  FOREIGN KEY (autoimmune_disease) REFERENCES autoimmune_diseases (autoimmune_disease_id);

-- IndividualPredictions
ALTER TABLE individual_predictions DROP CONSTRAINT IF EXISTS fk_individual_predictions_prediction_label;
ALTER TABLE individual_predictions ADD CONSTRAINT fk_individual_predictions_prediction_label
  FOREIGN KEY (prediction_label) REFERENCES individual_predictions (individual_prediction_id);
ALTER TABLE individual_predictions DROP CONSTRAINT IF EXISTS fk_individual_predictions_individual;
ALTER TABLE individual_predictions ADD CONSTRAINT fk_individual_predictions_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE individual_predictions DROP CONSTRAINT IF EXISTS fk_individual_predictions_autoimmune_disease;
ALTER TABLE individual_predictions ADD CONSTRAINT fk_individual_predictions_autoimmune_disease
  FOREIGN KEY (autoimmune_disease) REFERENCES autoimmune_diseases (autoimmune_disease_id);
ALTER TABLE individual_predictions DROP CONSTRAINT IF EXISTS fk_individual_predictions_calibration_bins;
ALTER TABLE individual_predictions ADD CONSTRAINT fk_individual_predictions_calibration_bins
  FOREIGN KEY (calibration_bins) REFERENCES calibration_bins (calibration_bin_id);

-- CalibrationBins
ALTER TABLE calibration_bins DROP CONSTRAINT IF EXISTS fk_calibration_bins_bin_label;
ALTER TABLE calibration_bins ADD CONSTRAINT fk_calibration_bins_bin_label
  FOREIGN KEY (bin_label) REFERENCES calibration_bins (calibration_bin_id);
ALTER TABLE calibration_bins DROP CONSTRAINT IF EXISTS fk_calibration_bins_individual_prediction;
ALTER TABLE calibration_bins ADD CONSTRAINT fk_calibration_bins_individual_prediction
  FOREIGN KEY (individual_prediction) REFERENCES individual_predictions (individual_prediction_id);

-- InterventionTargets
ALTER TABLE intervention_targets DROP CONSTRAINT IF EXISTS fk_intervention_targets_causal_mechanism;
ALTER TABLE intervention_targets ADD CONSTRAINT fk_intervention_targets_causal_mechanism
  FOREIGN KEY (causal_mechanism) REFERENCES causal_mechanisms (causal_mechanism_id);
ALTER TABLE intervention_targets DROP CONSTRAINT IF EXISTS fk_intervention_targets_autoimmune_disease;
ALTER TABLE intervention_targets ADD CONSTRAINT fk_intervention_targets_autoimmune_disease
  FOREIGN KEY (autoimmune_disease) REFERENCES autoimmune_diseases (autoimmune_disease_id);

-- Features
ALTER TABLE features DROP CONSTRAINT IF EXISTS fk_features_assigned_loop;
ALTER TABLE features ADD CONSTRAINT fk_features_assigned_loop
  FOREIGN KEY (assigned_loop) REFERENCES effortless_loops (effortless_loop_id);

-- StateMachines
ALTER TABLE state_machines DROP CONSTRAINT IF EXISTS fk_state_machines_machine_states;
ALTER TABLE state_machines ADD CONSTRAINT fk_state_machines_machine_states
  FOREIGN KEY (machine_states) REFERENCES machine_states (machine_state_id);
ALTER TABLE state_machines DROP CONSTRAINT IF EXISTS fk_state_machines_state_transition_rules;
ALTER TABLE state_machines ADD CONSTRAINT fk_state_machines_state_transition_rules
  FOREIGN KEY (state_transition_rules) REFERENCES state_transition_rules (state_transition_rule_id);
ALTER TABLE state_machines DROP CONSTRAINT IF EXISTS fk_state_machines_state_transitions;
ALTER TABLE state_machines ADD CONSTRAINT fk_state_machines_state_transitions
  FOREIGN KEY (state_transitions) REFERENCES state_transitions (state_transition_id);

-- MachineStates
ALTER TABLE machine_states DROP CONSTRAINT IF EXISTS fk_machine_states_state_machine;
ALTER TABLE machine_states ADD CONSTRAINT fk_machine_states_state_machine
  FOREIGN KEY (state_machine) REFERENCES state_machines (state_machine_id);
ALTER TABLE machine_states DROP CONSTRAINT IF EXISTS fk_machine_states_from_transition_rules;
ALTER TABLE machine_states ADD CONSTRAINT fk_machine_states_from_transition_rules
  FOREIGN KEY (from_transition_rules) REFERENCES state_transition_rules (state_transition_rule_id);
ALTER TABLE machine_states DROP CONSTRAINT IF EXISTS fk_machine_states_to_transition_rules;
ALTER TABLE machine_states ADD CONSTRAINT fk_machine_states_to_transition_rules
  FOREIGN KEY (to_transition_rules) REFERENCES state_transition_rules (state_transition_rule_id);

-- StateTransitionRules
ALTER TABLE state_transition_rules DROP CONSTRAINT IF EXISTS fk_state_transition_rules_state_machine;
ALTER TABLE state_transition_rules ADD CONSTRAINT fk_state_transition_rules_state_machine
  FOREIGN KEY (state_machine) REFERENCES state_machines (state_machine_id);
ALTER TABLE state_transition_rules DROP CONSTRAINT IF EXISTS fk_state_transition_rules_from_state;
ALTER TABLE state_transition_rules ADD CONSTRAINT fk_state_transition_rules_from_state
  FOREIGN KEY (from_state) REFERENCES machine_states (machine_state_id);
ALTER TABLE state_transition_rules DROP CONSTRAINT IF EXISTS fk_state_transition_rules_to_state;
ALTER TABLE state_transition_rules ADD CONSTRAINT fk_state_transition_rules_to_state
  FOREIGN KEY (to_state) REFERENCES machine_states (machine_state_id);

-- StateTransitions
ALTER TABLE state_transitions DROP CONSTRAINT IF EXISTS fk_state_transitions_state_machine;
ALTER TABLE state_transitions ADD CONSTRAINT fk_state_transitions_state_machine
  FOREIGN KEY (state_machine) REFERENCES state_machines (state_machine_id);

-- SubjectStateInstances
ALTER TABLE subject_state_instances DROP CONSTRAINT IF EXISTS fk_subject_state_instances_state_machine;
ALTER TABLE subject_state_instances ADD CONSTRAINT fk_subject_state_instances_state_machine
  FOREIGN KEY (state_machine) REFERENCES state_machines (state_machine_id);
ALTER TABLE subject_state_instances DROP CONSTRAINT IF EXISTS fk_subject_state_instances_prior_instance;
ALTER TABLE subject_state_instances ADD CONSTRAINT fk_subject_state_instances_prior_instance
  FOREIGN KEY (prior_instance) REFERENCES subject_state_instances (subject_state_instance_id);
ALTER TABLE subject_state_instances DROP CONSTRAINT IF EXISTS fk_subject_state_instances_entered_via_transition;
ALTER TABLE subject_state_instances ADD CONSTRAINT fk_subject_state_instances_entered_via_transition
  FOREIGN KEY (entered_via_transition) REFERENCES state_transitions (state_transition_id);

-- SerologyObservations
ALTER TABLE serology_observations DROP CONSTRAINT IF EXISTS fk_serology_observations_individual;
ALTER TABLE serology_observations ADD CONSTRAINT fk_serology_observations_individual
  FOREIGN KEY (individual) REFERENCES individuals (individual_id);
ALTER TABLE serology_observations DROP CONSTRAINT IF EXISTS fk_serology_observations_prior_observation;
ALTER TABLE serology_observations ADD CONSTRAINT fk_serology_observations_prior_observation
  FOREIGN KEY (prior_observation) REFERENCES serology_observations (serology_observation_id);

-- 83 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
