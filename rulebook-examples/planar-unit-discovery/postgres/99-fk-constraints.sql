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

-- Points
ALTER TABLE points DROP CONSTRAINT IF EXISTS fk_points_context;
ALTER TABLE points ADD CONSTRAINT fk_points_context
  FOREIGN KEY (context) REFERENCES contexts (context_id);

-- PointSets
ALTER TABLE point_sets DROP CONSTRAINT IF EXISTS fk_point_sets_members;
ALTER TABLE point_sets ADD CONSTRAINT fk_point_sets_members
  FOREIGN KEY (members) REFERENCES point_set_members (point_set_member_id);
ALTER TABLE point_sets DROP CONSTRAINT IF EXISTS fk_point_sets_pairs;
ALTER TABLE point_sets ADD CONSTRAINT fk_point_sets_pairs
  FOREIGN KEY (pairs) REFERENCES point_pairs (point_pair_id);

-- PointSetMembers
ALTER TABLE point_set_members DROP CONSTRAINT IF EXISTS fk_point_set_members_point_set;
ALTER TABLE point_set_members ADD CONSTRAINT fk_point_set_members_point_set
  FOREIGN KEY (point_set) REFERENCES point_sets (point_set_id);
ALTER TABLE point_set_members DROP CONSTRAINT IF EXISTS fk_point_set_members_point;
ALTER TABLE point_set_members ADD CONSTRAINT fk_point_set_members_point
  FOREIGN KEY (point) REFERENCES points (point_id);

-- PointPairs
ALTER TABLE point_pairs DROP CONSTRAINT IF EXISTS fk_point_pairs_point_set;
ALTER TABLE point_pairs ADD CONSTRAINT fk_point_pairs_point_set
  FOREIGN KEY (point_set) REFERENCES point_sets (point_set_id);
ALTER TABLE point_pairs DROP CONSTRAINT IF EXISTS fk_point_pairs_point_a;
ALTER TABLE point_pairs ADD CONSTRAINT fk_point_pairs_point_a
  FOREIGN KEY (point_a) REFERENCES points (point_id);
ALTER TABLE point_pairs DROP CONSTRAINT IF EXISTS fk_point_pairs_point_b;
ALTER TABLE point_pairs ADD CONSTRAINT fk_point_pairs_point_b
  FOREIGN KEY (point_b) REFERENCES points (point_id);

-- UnitDistanceGraphs
ALTER TABLE unit_distance_graphs DROP CONSTRAINT IF EXISTS fk_unit_distance_graphs_point_set;
ALTER TABLE unit_distance_graphs ADD CONSTRAINT fk_unit_distance_graphs_point_set
  FOREIGN KEY (point_set) REFERENCES point_sets (point_set_id);

-- NumberFields
ALTER TABLE number_fields DROP CONSTRAINT IF EXISTS fk_number_fields_prime_ideals;
ALTER TABLE number_fields ADD CONSTRAINT fk_number_fields_prime_ideals
  FOREIGN KEY (prime_ideals) REFERENCES prime_ideals (prime_ideal_id);

-- PrimeIdeals
ALTER TABLE prime_ideals DROP CONSTRAINT IF EXISTS fk_prime_ideals_number_field;
ALTER TABLE prime_ideals ADD CONSTRAINT fk_prime_ideals_number_field
  FOREIGN KEY (number_field) REFERENCES number_fields (number_field_id);

-- MinkowskiLattices
ALTER TABLE minkowski_lattices DROP CONSTRAINT IF EXISTS fk_minkowski_lattices_number_field;
ALTER TABLE minkowski_lattices ADD CONSTRAINT fk_minkowski_lattices_number_field
  FOREIGN KEY (number_field) REFERENCES number_fields (number_field_id);
ALTER TABLE minkowski_lattices DROP CONSTRAINT IF EXISTS fk_minkowski_lattices_short_vectors;
ALTER TABLE minkowski_lattices ADD CONSTRAINT fk_minkowski_lattices_short_vectors
  FOREIGN KEY (short_vectors) REFERENCES short_vectors (short_vector_id);
ALTER TABLE minkowski_lattices DROP CONSTRAINT IF EXISTS fk_minkowski_lattices_projections;
ALTER TABLE minkowski_lattices ADD CONSTRAINT fk_minkowski_lattices_projections
  FOREIGN KEY (projections) REFERENCES planar_projections (planar_projection_id);

-- ShortVectors
ALTER TABLE short_vectors DROP CONSTRAINT IF EXISTS fk_short_vectors_minkowski_lattice;
ALTER TABLE short_vectors ADD CONSTRAINT fk_short_vectors_minkowski_lattice
  FOREIGN KEY (minkowski_lattice) REFERENCES minkowski_lattices (minkowski_lattice_id);

-- ConstructionFamilies
ALTER TABLE construction_families DROP CONSTRAINT IF EXISTS fk_construction_families_source_number_field;
ALTER TABLE construction_families ADD CONSTRAINT fk_construction_families_source_number_field
  FOREIGN KEY (source_number_field) REFERENCES number_fields (number_field_id);
ALTER TABLE construction_families DROP CONSTRAINT IF EXISTS fk_construction_families_source_minkowski_lattice;
ALTER TABLE construction_families ADD CONSTRAINT fk_construction_families_source_minkowski_lattice
  FOREIGN KEY (source_minkowski_lattice) REFERENCES minkowski_lattices (minkowski_lattice_id);
ALTER TABLE construction_families DROP CONSTRAINT IF EXISTS fk_construction_families_instances;
ALTER TABLE construction_families ADD CONSTRAINT fk_construction_families_instances
  FOREIGN KEY (instances) REFERENCES construction_instances (construction_instance_id);

-- ConstructionInstances
ALTER TABLE construction_instances DROP CONSTRAINT IF EXISTS fk_construction_instances_construction_family;
ALTER TABLE construction_instances ADD CONSTRAINT fk_construction_instances_construction_family
  FOREIGN KEY (construction_family) REFERENCES construction_families (construction_family_id);
ALTER TABLE construction_instances DROP CONSTRAINT IF EXISTS fk_construction_instances_point_set;
ALTER TABLE construction_instances ADD CONSTRAINT fk_construction_instances_point_set
  FOREIGN KEY (point_set) REFERENCES point_sets (point_set_id);

-- GrowthSequences
ALTER TABLE growth_sequences DROP CONSTRAINT IF EXISTS fk_growth_sequences_construction_family;
ALTER TABLE growth_sequences ADD CONSTRAINT fk_growth_sequences_construction_family
  FOREIGN KEY (construction_family) REFERENCES construction_families (construction_family_id);

-- AsymptoticFunctions
ALTER TABLE asymptotic_functions DROP CONSTRAINT IF EXISTS fk_asymptotic_functions_lower_bounds;
ALTER TABLE asymptotic_functions ADD CONSTRAINT fk_asymptotic_functions_lower_bounds
  FOREIGN KEY (lower_bounds) REFERENCES asymptotic_lower_bounds (asymptotic_lower_bound_id);

-- AsymptoticLowerBounds
ALTER TABLE asymptotic_lower_bounds DROP CONSTRAINT IF EXISTS fk_asymptotic_lower_bounds_asymptotic_function;
ALTER TABLE asymptotic_lower_bounds ADD CONSTRAINT fk_asymptotic_lower_bounds_asymptotic_function
  FOREIGN KEY (asymptotic_function) REFERENCES asymptotic_functions (asymptotic_function_id);
ALTER TABLE asymptotic_lower_bounds DROP CONSTRAINT IF EXISTS fk_asymptotic_lower_bounds_growth_sequence;
ALTER TABLE asymptotic_lower_bounds ADD CONSTRAINT fk_asymptotic_lower_bounds_growth_sequence
  FOREIGN KEY (growth_sequence) REFERENCES growth_sequences (growth_sequence_id);

-- Theorems
ALTER TABLE theorems DROP CONSTRAINT IF EXISTS fk_theorems_asymptotic_function;
ALTER TABLE theorems ADD CONSTRAINT fk_theorems_asymptotic_function
  FOREIGN KEY (asymptotic_function) REFERENCES asymptotic_functions (asymptotic_function_id);
ALTER TABLE theorems DROP CONSTRAINT IF EXISTS fk_theorems_anchored_lower_bound;
ALTER TABLE theorems ADD CONSTRAINT fk_theorems_anchored_lower_bound
  FOREIGN KEY (anchored_lower_bound) REFERENCES asymptotic_lower_bounds (asymptotic_lower_bound_id);

-- Metrics
ALTER TABLE metrics DROP CONSTRAINT IF EXISTS fk_metrics_ambient_context;
ALTER TABLE metrics ADD CONSTRAINT fk_metrics_ambient_context
  FOREIGN KEY (ambient_context) REFERENCES contexts (context_id);

-- FieldEmbeddings
ALTER TABLE field_embeddings DROP CONSTRAINT IF EXISTS fk_field_embeddings_number_field;
ALTER TABLE field_embeddings ADD CONSTRAINT fk_field_embeddings_number_field
  FOREIGN KEY (number_field) REFERENCES number_fields (number_field_id);

-- MinkowskiEmbeddings
ALTER TABLE minkowski_embeddings DROP CONSTRAINT IF EXISTS fk_minkowski_embeddings_number_field;
ALTER TABLE minkowski_embeddings ADD CONSTRAINT fk_minkowski_embeddings_number_field
  FOREIGN KEY (number_field) REFERENCES number_fields (number_field_id);
ALTER TABLE minkowski_embeddings DROP CONSTRAINT IF EXISTS fk_minkowski_embeddings_target_lattice;
ALTER TABLE minkowski_embeddings ADD CONSTRAINT fk_minkowski_embeddings_target_lattice
  FOREIGN KEY (target_lattice) REFERENCES minkowski_lattices (minkowski_lattice_id);

-- GramMatrices
ALTER TABLE gram_matrices DROP CONSTRAINT IF EXISTS fk_gram_matrices_minkowski_lattice;
ALTER TABLE gram_matrices ADD CONSTRAINT fk_gram_matrices_minkowski_lattice
  FOREIGN KEY (minkowski_lattice) REFERENCES minkowski_lattices (minkowski_lattice_id);

-- PlanarProjections
ALTER TABLE planar_projections DROP CONSTRAINT IF EXISTS fk_planar_projections_source_lattice;
ALTER TABLE planar_projections ADD CONSTRAINT fk_planar_projections_source_lattice
  FOREIGN KEY (source_lattice) REFERENCES minkowski_lattices (minkowski_lattice_id);
ALTER TABLE planar_projections DROP CONSTRAINT IF EXISTS fk_planar_projections_target_context;
ALTER TABLE planar_projections ADD CONSTRAINT fk_planar_projections_target_context
  FOREIGN KEY (target_context) REFERENCES contexts (context_id);
ALTER TABLE planar_projections DROP CONSTRAINT IF EXISTS fk_planar_projections_projected_short_vectors;
ALTER TABLE planar_projections ADD CONSTRAINT fk_planar_projections_projected_short_vectors
  FOREIGN KEY (projected_short_vectors) REFERENCES projected_short_vectors (projected_short_vector_id);

-- ProjectedShortVectors
ALTER TABLE projected_short_vectors DROP CONSTRAINT IF EXISTS fk_projected_short_vectors_short_vector;
ALTER TABLE projected_short_vectors ADD CONSTRAINT fk_projected_short_vectors_short_vector
  FOREIGN KEY (short_vector) REFERENCES short_vectors (short_vector_id);
ALTER TABLE projected_short_vectors DROP CONSTRAINT IF EXISTS fk_projected_short_vectors_planar_projection;
ALTER TABLE projected_short_vectors ADD CONSTRAINT fk_projected_short_vectors_planar_projection
  FOREIGN KEY (planar_projection) REFERENCES planar_projections (planar_projection_id);

-- GolodShafarevichCriteria
ALTER TABLE golod_shafarevich_criteria DROP CONSTRAINT IF EXISTS fk_golod_shafarevich_criteria_number_field;
ALTER TABLE golod_shafarevich_criteria ADD CONSTRAINT fk_golod_shafarevich_criteria_number_field
  FOREIGN KEY (number_field) REFERENCES number_fields (number_field_id);
ALTER TABLE golod_shafarevich_criteria DROP CONSTRAINT IF EXISTS fk_golod_shafarevich_criteria_source_reference;
ALTER TABLE golod_shafarevich_criteria ADD CONSTRAINT fk_golod_shafarevich_criteria_source_reference
  FOREIGN KEY (source_reference) REFERENCES source_references (source_reference_id);

-- SemanticBridges
ALTER TABLE semantic_bridges DROP CONSTRAINT IF EXISTS fk_semantic_bridges_from_domain;
ALTER TABLE semantic_bridges ADD CONSTRAINT fk_semantic_bridges_from_domain
  FOREIGN KEY (from_domain) REFERENCES domains (domain_id);
ALTER TABLE semantic_bridges DROP CONSTRAINT IF EXISTS fk_semantic_bridges_to_domain;
ALTER TABLE semantic_bridges ADD CONSTRAINT fk_semantic_bridges_to_domain
  FOREIGN KEY (to_domain) REFERENCES domains (domain_id);

-- SemanticRoutes
ALTER TABLE semantic_routes DROP CONSTRAINT IF EXISTS fk_semantic_routes_steps;
ALTER TABLE semantic_routes ADD CONSTRAINT fk_semantic_routes_steps
  FOREIGN KEY (steps) REFERENCES semantic_route_steps (semantic_route_step_id);

-- SemanticRouteSteps
ALTER TABLE semantic_route_steps DROP CONSTRAINT IF EXISTS fk_semantic_route_steps_semantic_route;
ALTER TABLE semantic_route_steps ADD CONSTRAINT fk_semantic_route_steps_semantic_route
  FOREIGN KEY (semantic_route) REFERENCES semantic_routes (semantic_route_id);
ALTER TABLE semantic_route_steps DROP CONSTRAINT IF EXISTS fk_semantic_route_steps_bridge_used;
ALTER TABLE semantic_route_steps ADD CONSTRAINT fk_semantic_route_steps_bridge_used
  FOREIGN KEY (bridge_used) REFERENCES semantic_bridges (semantic_bridge_id);

-- Lemmas
ALTER TABLE lemmas DROP CONSTRAINT IF EXISTS fk_lemmas_source_reference;
ALTER TABLE lemmas ADD CONSTRAINT fk_lemmas_source_reference
  FOREIGN KEY (source_reference) REFERENCES source_references (source_reference_id);

-- Conjectures
ALTER TABLE conjectures DROP CONSTRAINT IF EXISTS fk_conjectures_target_function;
ALTER TABLE conjectures ADD CONSTRAINT fk_conjectures_target_function
  FOREIGN KEY (target_function) REFERENCES asymptotic_functions (asymptotic_function_id);
ALTER TABLE conjectures DROP CONSTRAINT IF EXISTS fk_conjectures_proposed_by;
ALTER TABLE conjectures ADD CONSTRAINT fk_conjectures_proposed_by
  FOREIGN KEY (proposed_by) REFERENCES source_references (source_reference_id);
ALTER TABLE conjectures DROP CONSTRAINT IF EXISTS fk_conjectures_resolution_citation;
ALTER TABLE conjectures ADD CONSTRAINT fk_conjectures_resolution_citation
  FOREIGN KEY (resolution_citation) REFERENCES source_references (source_reference_id);
ALTER TABLE conjectures DROP CONSTRAINT IF EXISTS fk_conjectures_related_theorem;
ALTER TABLE conjectures ADD CONSTRAINT fk_conjectures_related_theorem
  FOREIGN KEY (related_theorem) REFERENCES theorems (theorem_id);

-- ProofObligations
ALTER TABLE proof_obligations DROP CONSTRAINT IF EXISTS fk_proof_obligations_parent_bound;
ALTER TABLE proof_obligations ADD CONSTRAINT fk_proof_obligations_parent_bound
  FOREIGN KEY (parent_bound) REFERENCES asymptotic_lower_bounds (asymptotic_lower_bound_id);
ALTER TABLE proof_obligations DROP CONSTRAINT IF EXISTS fk_proof_obligations_required_lemma;
ALTER TABLE proof_obligations ADD CONSTRAINT fk_proof_obligations_required_lemma
  FOREIGN KEY (required_lemma) REFERENCES lemmas (lemma_id);

-- CitationLinks
ALTER TABLE citation_links DROP CONSTRAINT IF EXISTS fk_citation_links_citing_source;
ALTER TABLE citation_links ADD CONSTRAINT fk_citation_links_citing_source
  FOREIGN KEY (citing_source) REFERENCES source_references (source_reference_id);
ALTER TABLE citation_links DROP CONSTRAINT IF EXISTS fk_citation_links_cited_source;
ALTER TABLE citation_links ADD CONSTRAINT fk_citation_links_cited_source
  FOREIGN KEY (cited_source) REFERENCES source_references (source_reference_id);

-- TemporalSnapshots
ALTER TABLE temporal_snapshots DROP CONSTRAINT IF EXISTS fk_temporal_snapshots_anchoring_source_reference;
ALTER TABLE temporal_snapshots ADD CONSTRAINT fk_temporal_snapshots_anchoring_source_reference
  FOREIGN KEY (anchoring_source_reference) REFERENCES source_references (source_reference_id);

-- LowerBoundValidityAtSnapshot
ALTER TABLE lower_bound_validity_at_snapshot DROP CONSTRAINT IF EXISTS fk_lower_bound_validity_at_snapshot_asymptotic_lower_bound;
ALTER TABLE lower_bound_validity_at_snapshot ADD CONSTRAINT fk_lower_bound_validity_at_snapshot_asymptotic_lower_bound
  FOREIGN KEY (asymptotic_lower_bound) REFERENCES asymptotic_lower_bounds (asymptotic_lower_bound_id);
ALTER TABLE lower_bound_validity_at_snapshot DROP CONSTRAINT IF EXISTS fk_lower_bound_validity_at_snapshot_temporal_snapshot;
ALTER TABLE lower_bound_validity_at_snapshot ADD CONSTRAINT fk_lower_bound_validity_at_snapshot_temporal_snapshot
  FOREIGN KEY (temporal_snapshot) REFERENCES temporal_snapshots (temporal_snapshot_id);

-- 55 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
