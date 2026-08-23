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

-- FramingInvariants
ALTER TABLE framing_invariants DROP CONSTRAINT IF EXISTS fk_framing_invariants_violated_axiom_id;
ALTER TABLE framing_invariants ADD CONSTRAINT fk_framing_invariants_violated_axiom_id
  FOREIGN KEY (violated_axiom_id) REFERENCES ontology_axioms (axiom_id);

-- PlatformFeatures
ALTER TABLE platform_features DROP CONSTRAINT IF EXISTS fk_platform_features_related_axiom_id;
ALTER TABLE platform_features ADD CONSTRAINT fk_platform_features_related_axiom_id
  FOREIGN KEY (related_axiom_id) REFERENCES ontology_axioms (axiom_id);

-- ExecutionSubstrates
ALTER TABLE execution_substrates DROP CONSTRAINT IF EXISTS fk_execution_substrates_project;
ALTER TABLE execution_substrates ADD CONSTRAINT fk_execution_substrates_project
  FOREIGN KEY (project) REFERENCES project_metadata (project_id);

-- SsotmeProxy
ALTER TABLE ssotme_proxy DROP CONSTRAINT IF EXISTS fk_ssotme_proxy_substrate_id;
ALTER TABLE ssotme_proxy ADD CONSTRAINT fk_ssotme_proxy_substrate_id
  FOREIGN KEY (substrate_id) REFERENCES execution_substrates (substrate_id);

-- RulebookDomains
ALTER TABLE rulebook_domains DROP CONSTRAINT IF EXISTS fk_rulebook_domains_parent_domain_id;
ALTER TABLE rulebook_domains ADD CONSTRAINT fk_rulebook_domains_parent_domain_id
  FOREIGN KEY (parent_domain_id) REFERENCES rulebook_domains (domain_id);
ALTER TABLE rulebook_domains DROP CONSTRAINT IF EXISTS fk_rulebook_domains_project;
ALTER TABLE rulebook_domains ADD CONSTRAINT fk_rulebook_domains_project
  FOREIGN KEY (project) REFERENCES project_metadata (project_id);

-- AppUsers
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS fk_app_users_role_id;
ALTER TABLE app_users ADD CONSTRAINT fk_app_users_role_id
  FOREIGN KEY (role_id) REFERENCES user_roles (role_id);

-- AppPermissions
ALTER TABLE app_permissions DROP CONSTRAINT IF EXISTS fk_app_permissions_role_id;
ALTER TABLE app_permissions ADD CONSTRAINT fk_app_permissions_role_id
  FOREIGN KEY (role_id) REFERENCES user_roles (role_id);

-- AppNavigation
ALTER TABLE app_navigation DROP CONSTRAINT IF EXISTS fk_app_navigation_parent_nav_id;
ALTER TABLE app_navigation ADD CONSTRAINT fk_app_navigation_parent_nav_id
  FOREIGN KEY (parent_nav_id) REFERENCES app_navigation (nav_id);
ALTER TABLE app_navigation DROP CONSTRAINT IF EXISTS fk_app_navigation_screen_id;
ALTER TABLE app_navigation ADD CONSTRAINT fk_app_navigation_screen_id
  FOREIGN KEY (screen_id) REFERENCES app_screens (screen_id);
ALTER TABLE app_navigation DROP CONSTRAINT IF EXISTS fk_app_navigation_min_role_id;
ALTER TABLE app_navigation ADD CONSTRAINT fk_app_navigation_min_role_id
  FOREIGN KEY (min_role_id) REFERENCES user_roles (role_id);

-- AppScreens
ALTER TABLE app_screens DROP CONSTRAINT IF EXISTS fk_app_screens_min_role_id;
ALTER TABLE app_screens ADD CONSTRAINT fk_app_screens_min_role_id
  FOREIGN KEY (min_role_id) REFERENCES user_roles (role_id);

-- AddToolCatalog
ALTER TABLE add_tool_catalog DROP CONSTRAINT IF EXISTS fk_add_tool_catalog_substrate_id;
ALTER TABLE add_tool_catalog ADD CONSTRAINT fk_add_tool_catalog_substrate_id
  FOREIGN KEY (substrate_id) REFERENCES execution_substrates (substrate_id);

-- RulebookFlavors
ALTER TABLE rulebook_flavors DROP CONSTRAINT IF EXISTS fk_rulebook_flavors_domain;
ALTER TABLE rulebook_flavors ADD CONSTRAINT fk_rulebook_flavors_domain
  FOREIGN KEY (domain) REFERENCES rulebook_domains (domain_id);

-- EvaluationSteps
ALTER TABLE evaluation_steps DROP CONSTRAINT IF EXISTS fk_evaluation_steps_phase_id;
ALTER TABLE evaluation_steps ADD CONSTRAINT fk_evaluation_steps_phase_id
  FOREIGN KEY (phase_id) REFERENCES substrate_contract_phases (phase_id);

-- EvaluationArtifacts
ALTER TABLE evaluation_artifacts DROP CONSTRAINT IF EXISTS fk_evaluation_artifacts_produced_by_phase_id;
ALTER TABLE evaluation_artifacts ADD CONSTRAINT fk_evaluation_artifacts_produced_by_phase_id
  FOREIGN KEY (produced_by_phase_id) REFERENCES substrate_contract_phases (phase_id);
ALTER TABLE evaluation_artifacts DROP CONSTRAINT IF EXISTS fk_evaluation_artifacts_consumed_by_phase_id;
ALTER TABLE evaluation_artifacts ADD CONSTRAINT fk_evaluation_artifacts_consumed_by_phase_id
  FOREIGN KEY (consumed_by_phase_id) REFERENCES substrate_contract_phases (phase_id);

-- SubstrateTradeoffs
ALTER TABLE substrate_tradeoffs DROP CONSTRAINT IF EXISTS fk_substrate_tradeoffs_substrate_id;
ALTER TABLE substrate_tradeoffs ADD CONSTRAINT fk_substrate_tradeoffs_substrate_id
  FOREIGN KEY (substrate_id) REFERENCES execution_substrates (substrate_id);
ALTER TABLE substrate_tradeoffs DROP CONSTRAINT IF EXISTS fk_substrate_tradeoffs_dimension_id;
ALTER TABLE substrate_tradeoffs ADD CONSTRAINT fk_substrate_tradeoffs_dimension_id
  FOREIGN KEY (dimension_id) REFERENCES substrate_tradeoff_dimensions (dimension_id);

-- DemoNarratives
ALTER TABLE demo_narratives DROP CONSTRAINT IF EXISTS fk_demo_narratives_related_domain_id;
ALTER TABLE demo_narratives ADD CONSTRAINT fk_demo_narratives_related_domain_id
  FOREIGN KEY (related_domain_id) REFERENCES rulebook_domains (domain_id);

-- FlavorTags
ALTER TABLE flavor_tags DROP CONSTRAINT IF EXISTS fk_flavor_tags_flavor;
ALTER TABLE flavor_tags ADD CONSTRAINT fk_flavor_tags_flavor
  FOREIGN KEY (flavor) REFERENCES rulebook_flavors (flavor_id);
ALTER TABLE flavor_tags DROP CONSTRAINT IF EXISTS fk_flavor_tags_tag;
ALTER TABLE flavor_tags ADD CONSTRAINT fk_flavor_tags_tag
  FOREIGN KEY (tag) REFERENCES rulebook_tags (tag_id);

-- ClaudeSkills
ALTER TABLE claude_skills DROP CONSTRAINT IF EXISTS fk_claude_skills_project;
ALTER TABLE claude_skills ADD CONSTRAINT fk_claude_skills_project
  FOREIGN KEY (project) REFERENCES project_metadata (project_id);

-- BuildPhases
ALTER TABLE build_phases DROP CONSTRAINT IF EXISTS fk_build_phases_project;
ALTER TABLE build_phases ADD CONSTRAINT fk_build_phases_project
  FOREIGN KEY (project) REFERENCES project_metadata (project_id);

-- ERBPackages
ALTER TABLE erb_packages DROP CONSTRAINT IF EXISTS fk_erb_packages_primary_phase;
ALTER TABLE erb_packages ADD CONSTRAINT fk_erb_packages_primary_phase
  FOREIGN KEY (primary_phase) REFERENCES build_phases (build_phase_id);
ALTER TABLE erb_packages DROP CONSTRAINT IF EXISTS fk_erb_packages_project;
ALTER TABLE erb_packages ADD CONSTRAINT fk_erb_packages_project
  FOREIGN KEY (project) REFERENCES project_metadata (project_id);

-- ERBFeatureCategories
ALTER TABLE erb_feature_categories DROP CONSTRAINT IF EXISTS fk_erb_feature_categories_erb_package;
ALTER TABLE erb_feature_categories ADD CONSTRAINT fk_erb_feature_categories_erb_package
  FOREIGN KEY (erb_package) REFERENCES erb_packages (erb_package_id);

-- ERBFeatures
ALTER TABLE erb_features DROP CONSTRAINT IF EXISTS fk_erb_features_category;
ALTER TABLE erb_features ADD CONSTRAINT fk_erb_features_category
  FOREIGN KEY (category) REFERENCES erb_feature_categories (erb_feature_category_id);
ALTER TABLE erb_features DROP CONSTRAINT IF EXISTS fk_erb_features_erb_package;
ALTER TABLE erb_features ADD CONSTRAINT fk_erb_features_erb_package
  FOREIGN KEY (erb_package) REFERENCES erb_packages (erb_package_id);

-- UserStories
ALTER TABLE user_stories DROP CONSTRAINT IF EXISTS fk_user_stories_build_phase;
ALTER TABLE user_stories ADD CONSTRAINT fk_user_stories_build_phase
  FOREIGN KEY (build_phase) REFERENCES build_phases (build_phase_id);
ALTER TABLE user_stories DROP CONSTRAINT IF EXISTS fk_user_stories_epic;
ALTER TABLE user_stories ADD CONSTRAINT fk_user_stories_epic
  FOREIGN KEY (epic) REFERENCES erb_feature_categories (erb_feature_category_id);
ALTER TABLE user_stories DROP CONSTRAINT IF EXISTS fk_user_stories_feature;
ALTER TABLE user_stories ADD CONSTRAINT fk_user_stories_feature
  FOREIGN KEY (feature) REFERENCES erb_features (erb_feature_id);
ALTER TABLE user_stories DROP CONSTRAINT IF EXISTS fk_user_stories_effort_class;
ALTER TABLE user_stories ADD CONSTRAINT fk_user_stories_effort_class
  FOREIGN KEY (effort_class) REFERENCES effort_classes (effort_class_id);

-- AcceptanceCriteria
ALTER TABLE acceptance_criteria DROP CONSTRAINT IF EXISTS fk_acceptance_criteria_user_story;
ALTER TABLE acceptance_criteria ADD CONSTRAINT fk_acceptance_criteria_user_story
  FOREIGN KEY (user_story) REFERENCES user_stories (user_story_id);

-- ConsistencyRules
ALTER TABLE consistency_rules DROP CONSTRAINT IF EXISTS fk_consistency_rules_project;
ALTER TABLE consistency_rules ADD CONSTRAINT fk_consistency_rules_project
  FOREIGN KEY (project) REFERENCES project_metadata (project_id);

-- ConsistencyFindings
ALTER TABLE consistency_findings DROP CONSTRAINT IF EXISTS fk_consistency_findings_rule;
ALTER TABLE consistency_findings ADD CONSTRAINT fk_consistency_findings_rule
  FOREIGN KEY (rule) REFERENCES consistency_rules (consistency_rule_id);
ALTER TABLE consistency_findings DROP CONSTRAINT IF EXISTS fk_consistency_findings_domain;
ALTER TABLE consistency_findings ADD CONSTRAINT fk_consistency_findings_domain
  FOREIGN KEY (domain) REFERENCES rulebook_domains (domain_id);

-- MobileNavTabs
ALTER TABLE mobile_nav_tabs DROP CONSTRAINT IF EXISTS fk_mobile_nav_tabs_project;
ALTER TABLE mobile_nav_tabs ADD CONSTRAINT fk_mobile_nav_tabs_project
  FOREIGN KEY (project) REFERENCES project_metadata (project_id);

-- MobileRoutes
ALTER TABLE mobile_routes DROP CONSTRAINT IF EXISTS fk_mobile_routes_tab;
ALTER TABLE mobile_routes ADD CONSTRAINT fk_mobile_routes_tab
  FOREIGN KEY (tab) REFERENCES mobile_nav_tabs (mobile_nav_tab_id);
ALTER TABLE mobile_routes DROP CONSTRAINT IF EXISTS fk_mobile_routes_parent_route;
ALTER TABLE mobile_routes ADD CONSTRAINT fk_mobile_routes_parent_route
  FOREIGN KEY (parent_route) REFERENCES mobile_routes (mobile_route_id);
ALTER TABLE mobile_routes DROP CONSTRAINT IF EXISTS fk_mobile_routes_screen;
ALTER TABLE mobile_routes ADD CONSTRAINT fk_mobile_routes_screen
  FOREIGN KEY (screen) REFERENCES app_screens (screen_id);

-- SkillRoutes
ALTER TABLE skill_routes DROP CONSTRAINT IF EXISTS fk_skill_routes_from_skill;
ALTER TABLE skill_routes ADD CONSTRAINT fk_skill_routes_from_skill
  FOREIGN KEY (from_skill) REFERENCES claude_skills (skill_id);
ALTER TABLE skill_routes DROP CONSTRAINT IF EXISTS fk_skill_routes_to_skill;
ALTER TABLE skill_routes ADD CONSTRAINT fk_skill_routes_to_skill
  FOREIGN KEY (to_skill) REFERENCES claude_skills (skill_id);

-- 43 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
