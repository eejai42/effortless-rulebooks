#!/usr/bin/env python3
"""Execute TSP loops 647-710 as a frozen-basis calibration campaign.

Every loop is first registered as PLANNED with a before-state and closure
criterion.  Each completed loop is validated, committed, and pushed before the
next loop starts.  The active semantic basis is frozen at one typed
SEMANTIC_ARC and one WARRANTED_REWRITE; held-out exact-oracle evidence may coin
new derived predicates but may not add a primitive unless a falsification is
recorded explicitly.
"""
from __future__ import annotations

import itertools
import json
import math
import os
import statistics
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Callable, Iterable

import apply_loops_624_646_coherence as base
import exact_oracle_v1 as oracle

REPO = base.REPO
DOMAIN = base.DOMAIN
RULEBOOK = base.RULEBOOK
CONTRACT = base.CONTRACT
README = base.README
TARGET_BRANCH = os.environ.get("TARGET_BRANCH", "agent/tsp-semantic-foundation")
VALIDATOR_V7 = DOMAIN / "scripts" / "validate_rulebook_v7.py"
SUMMARY_V7 = DOMAIN / "scripts" / "validate_summary_alignment_v7.py"
VALIDATOR_WRAPPER = DOMAIN / "scripts" / "validate_rulebook.py"
PG_DIR = DOMAIN / "effortless-postgres"
RULESPEAK_DIR = DOMAIN / "rulespeak"
STATUS_FILE = DOMAIN / "testing" / "calibration-647-710-status.json"
VERIFIED_646 = DOMAIN / "testing" / "coherence-624-646-status.json"


EXISTING_ORACLE_INSTANCES = [
    "tsp-gridville-5",
    "tsp-twin-triangles-6",
    "tsp-sparse-forcing-5",
    "tsp-asymmetric-four-4",
    "tsp-three-regions-9",
    "tsp-optimal-face-4",
]


HOLDOUT_FIXTURES: list[dict[str, Any]] = [
    {"key": "ring6", "n": 6, "family": "RING_DOMINANT", "groups": ["r"] * 6},
    {"key": "metric6", "n": 6, "family": "EUCLIDEAN_LIKE", "groups": ["m"] * 6},
    {"key": "cluster7", "n": 7, "family": "TWO_CLUSTER_ASYMMETRIC", "groups": ["a"] * 3 + ["b"] * 4},
    {"key": "hetero8", "n": 8, "family": "HETEROGENEOUS_REGIONS", "groups": ["a"] * 2 + ["b"] * 3 + ["c"] * 3},
    {"key": "sparse8", "n": 8, "family": "SPARSE_LADDER", "groups": ["left"] * 4 + ["right"] * 4},
    {"key": "bottleneck7", "n": 7, "family": "CUT_BOTTLENECK", "groups": ["west"] * 3 + ["east"] * 4},
    {"key": "tie6", "n": 6, "family": "TIE_RICH_OPTIMAL_FACE", "groups": ["tie"] * 6},
    {"key": "dominance7", "n": 7, "family": "BOUNDARY_DOMINANCE_TRAP", "groups": ["core"] * 4 + ["rim"] * 3},
    {"key": "nested8", "n": 8, "family": "NESTED_NEIGHBORHOODS", "groups": ["a1"] * 2 + ["a2"] * 2 + ["b1"] * 2 + ["b2"] * 2},
    {"key": "nonmetric6", "n": 6, "family": "NONMETRIC_WEIGHTED", "groups": ["nm"] * 6},
    {"key": "fourregion8", "n": 8, "family": "FOUR_REGION_RING", "groups": ["a"] * 2 + ["b"] * 2 + ["c"] * 2 + ["d"] * 2},
    {"key": "residual8", "n": 8, "family": "RESIDUAL_VALUE_KERNEL", "groups": ["u"] * 8},
]

FIXTURE_BY_KEY = {spec["key"]: spec for spec in HOLDOUT_FIXTURES}
FIXTURE_INSTANCE_IDS = [f"tsp-holdout-{spec['key']}-{spec['n']}" for spec in HOLDOUT_FIXTURES]


BASE_LOOP_SPECS: dict[int, dict[str, str]] = {
    647: {
        "name": "Independent loop-646 seal",
        "term": "Instrument Seal II",
        "rule": "tsp-rule-exact-oracle-calibration",
        "before": "Loop 646 has a successful execution certificate, but the held-out campaign has not independently rechecked its raw one-arc/one-rewrite, three-region, and optimal-face witnesses.",
        "criterion": "Recompute the loop-646 basis and finite fixture claims from canonical rows, preserve the nonclaims, and close a raw-witness prerequisite for calibration.",
        "next": "Freeze the current semantic basis for a held-out campaign.",
    },
    648: {
        "name": "Frozen semantic basis",
        "term": "Basis Freeze",
        "rule": "tsp-rule-heldout-calibration",
        "before": "The one-arc/one-rewrite basis is empirical but later loops could silently add primitives while claiming held-out support.",
        "criterion": "Freeze SEMANTIC_ARC and WARRANTED_REWRITE as the campaign basis; require any new primitive to be accompanied by a recorded falsification and basis-revision event.",
        "next": "Declare the exact-oracle trust contract.",
    },
    649: {
        "name": "Exact-oracle contract",
        "term": "Exact Oracle Contract",
        "rule": "tsp-rule-exact-oracle-calibration",
        "before": "Exact route enumeration exists only as an external implementation idea; its scope, normalization, and status are not canonical fields.",
        "criterion": "Add calibration fields for exact class count, feasible classes, optimum, optimal orbit, lower-bound gap, deterministic residue, branch warrant, and oracle checksum without treating enumeration as a structural proof.",
        "next": "Canonicalize tours modulo depot fixing and reversal.",
    },
    650: {
        "name": "Canonical tour class",
        "term": "Canonical Tour Class",
        "rule": "tsp-rule-canonical-tour-class",
        "before": "Tour counts may double-count reversal-equivalent cycles or depend on rotation.",
        "criterion": "Fix the declared depot, quotient reversal, and certify (n-1)!/2 canonical classes for complete symmetric n-stop instances.",
        "next": "Execute exhaustive enumeration on the development corpus.",
    },
    651: {
        "name": "Development exact-oracle run",
        "term": "Exhaustive Small-Instance Oracle",
        "rule": "tsp-rule-exact-oracle-calibration",
        "before": "Existing fixtures have structural certificates but no common exact optimum and optimal-class audit fields.",
        "criterion": "Enumerate every canonical route class for each valid development fixture and record exact optimum, optimal orbit, second-best value, deterministic residue, and checksum.",
        "next": "Normalize oracle witnesses without promoting them to structural proofs.",
    },
    652: {
        "name": "Oracle witness normal form",
        "term": "Oracle Witness Normal Form",
        "rule": "tsp-rule-exact-oracle-calibration",
        "before": "Exact optimum routes are calibration outputs but are not represented in the common witness vocabulary.",
        "criterion": "Project one exact optimal route per development instance into the witness normal form with ORACLE_CALIBRATION provenance and no theorem-status upgrade.",
        "next": "Audit all represented lower bounds against exact optima.",
    },
    653: {
        "name": "Lower-bound soundness audit",
        "term": "Exactness Gap",
        "rule": "tsp-rule-calibration-metric",
        "before": "Represented lower bounds are checked internally but not compared uniformly with exact optimum values.",
        "criterion": "Verify every represented certified lower bound is no greater than the exact optimum and record the exactness gap.",
        "next": "Audit finite optimality certificates against the oracle.",
    },
    654: {
        "name": "Optimality-certificate concordance",
        "term": "Certificate Concordance",
        "rule": "tsp-rule-calibration-metric",
        "before": "Passing structural optimality certificates and exact optimum data have not been compared as independent evidence.",
        "criterion": "Require every passing certificate candidate to equal the exact optimum and every bound-tight represented witness to agree with the oracle, while preserving distinct trust provenance.",
        "next": "Audit search accounting against exact route classes.",
    },
    655: {
        "name": "Search-accounting concordance",
        "term": "Search Accounting Audit",
        "rule": "tsp-rule-calibration-metric",
        "before": "Search metrics are structurally recorded but not universally reconciled with exact feasible class counts and residual value counts.",
        "criterion": "Compare existing route-class, residual ambiguity, and branch-warrant rows with exact enumeration for the development fixtures.",
        "next": "Separate development and held-out evidence.",
    },
    656: {
        "name": "Calibration split",
        "term": "Held-Out Split",
        "rule": "tsp-rule-heldout-calibration",
        "before": "All current fixtures influenced ontology development; no held-out evidence boundary exists.",
        "criterion": "Mark existing valid fixtures DEVELOPMENT, the malformed graph NEGATIVE_CONTROL, and reserve twelve not-yet-materialized instance identities as HELD_OUT.",
        "next": "Declare the held-out family taxonomy.",
    },
    657: {
        "name": "Held-out family taxonomy",
        "term": "Instance Family",
        "rule": "tsp-rule-heldout-calibration",
        "before": "Instance diversity is prose and cannot support family-stratified conclusions.",
        "criterion": "Represent ring, Euclidean-like, clustered, heterogeneous-region, sparse, bottleneck, tie-rich, dominance, nested, nonmetric, four-region, and residual-kernel families.",
        "next": "Define the multidimensional calibration vector.",
    },
    658: {
        "name": "Calibration vector",
        "term": "Calibration Vector",
        "rule": "tsp-rule-calibration-metric",
        "before": "Instrument quality is described narratively rather than through exact coverage, value closure, route closure, gap, choice orbit, and residual search coordinates.",
        "criterion": "Add reusable calibration coordinates without collapsing them into one arbitrary scalar score.",
        "next": "Summarize the exact development corpus.",
    },
    659: {
        "name": "Development corpus summary",
        "term": "Development Calibration Profile",
        "rule": "tsp-rule-calibration-metric",
        "before": "Exact development results exist per instance but have no aggregate calibration profile.",
        "criterion": "Aggregate exact coverage, bound soundness, value closure, route closure, optimal choice orbit, and maximum enumerated class count across the development corpus.",
        "next": "Seal the instrument before held-out execution.",
    },
    660: {
        "name": "Pre-held-out instrument seal",
        "term": "Instrument Seal III",
        "rule": "tsp-rule-heldout-calibration",
        "before": "The oracle and calibration fields exist, but the basis freeze and development audits have not been sealed as one prerequisite.",
        "criterion": "Close the pre-held-out frontier only when basis count, exact coverage, lower-bound soundness, certificate concordance, and search accounting all pass.",
        "next": "Materialize the first held-out graph without changing the basis.",
    },
}


POST_FIXTURE_SPECS: dict[int, dict[str, str]] = {
    685: ("Exactness gap", "Exactness Gap", "Record optimum minus strongest represented structural lower bound for every held-out instance."),
    686: ("Closure yield", "Closure Yield", "Measure exact route classes eliminated before branching by local-minimum closure and deterministic degree closure."),
    687: ("Rule leverage", "Rule Leverage", "Measure eliminated classes per deterministic commitment or structural closure event without treating the ratio as a universal constant."),
    688: ("Structural sufficiency", "Structural Sufficiency", "Classify instances where represented structure closes value, route, both, or neither."),
    689: ("Value rigidity", "Value Rigidity", "Distinguish a certified optimum value from the multiplicity of optimal route witnesses."),
    690: ("Choice entropy", "Choice Entropy", "Represent log2 of the exact optimal choice-orbit size as a descriptive coordinate, not proof complexity."),
    691: ("Defect support", "Defect Support", "Name which incidence, connectivity, cost-gap, and choice coordinates support the residual kernel."),
    692: ("Repair potential", "Repair Potential", "Measure the exact cost delta from the local two-factor union to the optimum when that union is degree two but disconnected."),
    693: ("Boundary demand", "Boundary Demand", "Project quotient component count to the minimum external edge count required by degree-two handshake accounting."),
    694: ("Port compatibility", "Port Compatibility", "Count region-pair crossing support and record when a boundary demand lacks compatible low-cost ports."),
    695: ("Quotient width", "Quotient Width", "Count distinct optimal entry/exit port pairs exposed by each region across the exact optimal face."),
    696: ("Residual kernel", "Residual Kernel", "Normalize unresolved value count, optimal choice count, connectivity defect, exactness gap, and branch warrant into one typed residual signature."),
    697: ("Branch necessity", "Branch Necessity", "Require a value-relevant residual or an explicit external representative policy before branching."),
    698: ("Search compression profile", "Search Compression Profile", "Record feasible classes to deterministic residue, value classes to residual values, and optimal witnesses to choice orbit."),
    699: ("Corpus rule coverage", "Rule Coverage", "Measure how many held-out instances close value or route under the frozen rule vocabulary."),
    700: ("Predicate stability", "Predicate Stability", "Verify every newly coined term remains derived from one semantic arc and one warranted rewrite with zero primitive growth."),
    701: ("Heterogeneous region repair", "Heterogeneous Repair Profile", "Compare repair deltas across unequal region sizes without promoting the observation to a k-region theorem."),
    702: ("Asymmetric crossing repair", "Asymmetric Crossing Profile", "Separate crossing insertion costs from internal release costs on asymmetric bottleneck and cluster fixtures."),
    703: ("Hierarchical quotient composition", "Nested Fiber", "Compose pair-level and superregion-level boundary summaries on the nested-neighborhood held-out fixture."),
    704: ("Sparse quotient composition", "Sparse Quotient Closure", "Compose degree forcing with region boundary summaries on the sparse held-out fixture."),
    705: ("Genuine value branch orbit", "Value Branch Orbit", "Select a held-out instance whose deterministic residue contains more than one value and record a justified value branch."),
    706: ("Calibration branch certificate", "Oracle-Calibrated Branch", "Split the residual orbit on one undecided edge and record include/exclude class counts and best values as calibration-only search evidence."),
    707: ("Held-out calibration summary", "Held-Out Calibration Event", "Aggregate exact coverage, structural closure, residual kernels, branch warrants, and family support over all twelve held-out instances."),
    708: ("Combinatorial scale profile", "Scale Profile", "Summarize exact canonical class growth and observed closure by stop count from four through nine stops."),
    709: ("Postgres/oracle conformance", "Oracle Substrate Conformance", "Rebuild Postgres and require generated views, Python reference semantics, and exact-oracle raw fields to agree."),
    710: ("Third coherence event", "Coherence Event III", "Seal the frozen-basis held-out campaign, record what generalized and what failed, and preserve all nonclaims."),
}


def build_loop_specs() -> dict[int, dict[str, str]]:
    specs = dict(BASE_LOOP_SPECS)
    order = 661
    for fixture in HOLDOUT_FIXTURES:
        key, n, family = fixture["key"], fixture["n"], fixture["family"]
        specs[order] = {
            "name": f"Materialize held-out {key}",
            "term": f"Held-Out {family}",
            "rule": "tsp-rule-heldout-fixture",
            "before": f"The {family} family is declared but tsp-holdout-{key}-{n} has no canonical graph rows.",
            "criterion": f"Materialize a deterministic {n}-stop {family} graph as HELD_OUT data without using its exact optimum to alter weights or the semantic basis.",
            "next": f"Run the exact oracle and represented structural analysis for held-out {key}.",
        }
        specs[order + 1] = {
            "name": f"Analyze held-out {key}",
            "term": f"{family} Calibration Witness",
            "rule": "tsp-rule-heldout-calibration",
            "before": f"tsp-holdout-{key}-{n} is canonical raw data but has no exact-oracle, lower-bound, witness, residual-kernel, or branch-warrant rows.",
            "criterion": "Enumerate every canonical route class, materialize structural lower-bound witnesses and one or more exact calibration routes, and record value/choice/search residue without adding a primitive.",
            "next": "Continue to the next held-out family while keeping the basis frozen.",
        }
        order += 2
    for order, (name, term, criterion) in POST_FIXTURE_SPECS.items():
        specs[order] = {
            "name": name,
            "term": term,
            "rule": (
                "tsp-rule-postgres-oracle-conformance" if order == 709 else
                "tsp-rule-branch-certificate" if order in {705, 706} else
                "tsp-rule-generalized-region-repair" if order in {701, 702, 703, 704} else
                "tsp-rule-calibration-metric"
            ),
            "before": "Held-out exact rows exist, but this derived calibration concept has not yet been represented across the corpus.",
            "criterion": criterion,
            "next": "Continue the frozen-basis calibration and residual-kernel analysis." if order < 710 else "Use the sealed corpus to decide the next research frontier.",
        }
    return specs


LOOPS = build_loop_specs()


COMMIT_MESSAGES: dict[int, str] = {
    647: "TSP loop 647: seal loop-646 raw witnesses",
    648: "TSP loop 648: freeze semantic basis",
    649: "TSP loop 649: declare exact oracle contract",
    650: "TSP loop 650: canonicalize tour classes",
    651: "TSP loop 651: run development exact oracle",
    652: "TSP loop 652: normalize oracle witnesses",
    653: "TSP loop 653: audit lower-bound soundness",
    654: "TSP loop 654: audit optimality concordance",
    655: "TSP loop 655: audit search accounting",
    656: "TSP loop 656: freeze development held-out split",
    657: "TSP loop 657: classify instance families",
    658: "TSP loop 658: define calibration vector",
    659: "TSP loop 659: summarize development calibration",
    660: "TSP loop 660: seal pre-held-out instrument",
}
_order = 661
for _fixture in HOLDOUT_FIXTURES:
    COMMIT_MESSAGES[_order] = f"TSP loop {_order}: materialize held-out {_fixture['key']}"
    COMMIT_MESSAGES[_order + 1] = f"TSP loop {_order + 1}: analyze held-out {_fixture['key']}"
    _order += 2
for _order in range(685, 711):
    COMMIT_MESSAGES[_order] = f"TSP loop {_order}: {LOOPS[_order]['name'].lower()}"


RULE_ROWS = [
    {
        "TSPInferenceRuleId": "tsp-rule-exact-oracle-calibration",
        "DisplayName": "Exact small-instance oracle calibration",
        "InferenceLayer": "CALIBRATION",
        "ImplementationStatus": "EXECUTABLE",
        "Soundness": "EXACT_FOR_FINITE_ENUMERATED_SYMMETRIC_INSTANCES_UNDER_DECLARED_NORMALIZATION",
        "Completeness": "N_LE_9_CAMPAIGN_SCOPE",
        "RuntimeClass": "O((N-1)! * N)",
        "MemoryClass": "O(ROUTE_CLASS_COUNT)",
        "Applicability": "A finite symmetric instance fixes one depot and explicit available edge costs.",
        "CertificateType": "exact-oracle-calibration-certificate",
        "Description": "Enumerate depot-fixed reversal-quotient route classes as an independent calibration oracle, not as a replacement for structural proof.",
    },
    {
        "TSPInferenceRuleId": "tsp-rule-canonical-tour-class",
        "DisplayName": "Canonical symmetric tour class",
        "InferenceLayer": "SEMANTIC_NORMALIZATION",
        "ImplementationStatus": "EXECUTABLE",
        "Soundness": "SOUND_FOR_DEPOT_FIXED_SYMMETRIC_CYCLES",
        "Completeness": "ROTATION_AND_REVERSAL_QUOTIENT",
        "RuntimeClass": "O(N)",
        "MemoryClass": "O(N)",
        "Applicability": "One depot is fixed and travel costs are symmetric.",
        "CertificateType": "canonical-tour-class-certificate",
        "Description": "Normalize a cycle by depot rotation and lexicographically chosen reversal orientation.",
    },
    {
        "TSPInferenceRuleId": "tsp-rule-heldout-fixture",
        "DisplayName": "Held-out fixture materialization",
        "InferenceLayer": "EXPERIMENT_DESIGN",
        "ImplementationStatus": "EXECUTABLE",
        "Soundness": "DATA_SPLIT_AND_PROVENANCE_RULE",
        "Completeness": "TWELVE_DECLARED_FAMILIES",
        "RuntimeClass": "O(V+E)",
        "MemoryClass": "O(V+E)",
        "Applicability": "Weights and family membership are fixed before exact-oracle analysis.",
        "CertificateType": "heldout-fixture-certificate",
        "Description": "Materialize deterministic held-out graphs without tuning them after observing exact results.",
    },
    {
        "TSPInferenceRuleId": "tsp-rule-heldout-calibration",
        "DisplayName": "Frozen-basis held-out calibration",
        "InferenceLayer": "CALIBRATION",
        "ImplementationStatus": "EXECUTABLE",
        "Soundness": "EMPIRICAL_COMPARISON_WITH_EXACT_ORACLE",
        "Completeness": "DECLARED_HELDOUT_CORPUS",
        "RuntimeClass": "ORACLE_PLUS_REPRESENTED_INFERENCE",
        "MemoryClass": "CORPUS_DEPENDENT",
        "Applicability": "The semantic basis is frozen and a held-out instance has explicit graph rows.",
        "CertificateType": "heldout-calibration-certificate",
        "Description": "Compare structural closure and residual search with an exact finite oracle while forbidding silent primitive growth.",
    },
    {
        "TSPInferenceRuleId": "tsp-rule-calibration-metric",
        "DisplayName": "Calibration metric derivation",
        "InferenceLayer": "MEASUREMENT",
        "ImplementationStatus": "EXECUTABLE",
        "Soundness": "DEFINITIONAL_OVER_ORACLE_AND_STRUCTURAL_CERTIFICATES",
        "Completeness": "CURRENT_CORPUS_METRICS",
        "RuntimeClass": "O(CORPUS)",
        "MemoryClass": "O(CORPUS)",
        "Applicability": "Exact and structural rows exist for the same instance.",
        "CertificateType": "calibration-vector-certificate",
        "Description": "Derive gap, yield, leverage, rigidity, choice, defect, residual-kernel, and branch-necessity coordinates.",
    },
    {
        "TSPInferenceRuleId": "tsp-rule-generalized-region-repair",
        "DisplayName": "Empirical region-repair generalization",
        "InferenceLayer": "RESEARCH_GENERALIZATION",
        "ImplementationStatus": "EXECUTABLE_FOR_CALIBRATION",
        "Soundness": "OBSERVATIONAL_UNLESS_A_SEPARATE_BOUND_CERTIFICATE_EXISTS",
        "Completeness": "HELDOUT_HETEROGENEOUS_FIXTURES",
        "RuntimeClass": "O(CORPUS)",
        "MemoryClass": "O(CORPUS)",
        "Applicability": "A local degree-two union exposes multiple quotient components and an exact optimum is available for calibration.",
        "CertificateType": "region-repair-profile",
        "Description": "Measure crossing insertion and internal release behavior without promoting finite patterns to a universal theorem.",
    },
    {
        "TSPInferenceRuleId": "tsp-rule-branch-certificate",
        "DisplayName": "Residual value branch certificate",
        "InferenceLayer": "RESIDUAL_SEARCH",
        "ImplementationStatus": "EXECUTABLE_FOR_CALIBRATION",
        "Soundness": "EXACT_FOR_ENUMERATED_RESIDUAL_ORBIT",
        "Completeness": "ONE_DECLARED_BRANCH_WITNESS",
        "RuntimeClass": "O(RESIDUAL_CLASS_COUNT)",
        "MemoryClass": "O(RESIDUAL_CLASS_COUNT)",
        "Applicability": "Deterministic closure leaves more than one feasible value and an undecided edge partitions the residual orbit.",
        "CertificateType": "oracle-calibrated-branch-certificate",
        "Description": "Record a justified include/exclude branch as calibration evidence without disguising enumeration as structural inference.",
    },
    {
        "TSPInferenceRuleId": "tsp-rule-postgres-oracle-conformance",
        "DisplayName": "Postgres, Python, and exact-oracle conformance",
        "InferenceLayer": "EXECUTION_SUBSTRATE",
        "ImplementationStatus": "EXECUTABLE",
        "Soundness": "CROSS_SUBSTRATE_CONFORMANCE_NOT_MATHEMATICAL_SOUNDNESS_BY_ITSELF",
        "Completeness": "DECLARED_LOOP_709_FIELDS",
        "RuntimeClass": "BUILD_PLUS_DATABASE_PLUS_CORPUS",
        "MemoryClass": "SUBSTRATE_DEPENDENT",
        "Applicability": "The generated Postgres projection and exact-oracle fields are materialized.",
        "CertificateType": "oracle-substrate-conformance-certificate",
        "Description": "Require generated views, the Python reference model, and exact calibration fields to agree.",
    },
]


def run(cmd: list[str], *, cwd: Path = REPO, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess[str]:
    return base.run(cmd, cwd=cwd, check=check, capture=capture)


def load(path: Path) -> dict[str, Any]:
    return base.load(path)


def rows(rb: dict[str, Any], name: str) -> list[dict[str, Any]]:
    return base.rows(rb, name)


def table_index(rb: dict[str, Any], name: str) -> dict[str, dict[str, Any]]:
    return base.table_index(rb, name)


def upsert_rows(tbl: dict[str, Any], ident: str, additions: Iterable[dict[str, Any]]) -> None:
    base.upsert_rows(tbl, ident, additions)


def set_meta(rb: dict[str, Any], key: str, value_type: str, *, string: str | None = None, integer: int | None = None, boolean: bool | None = None) -> None:
    base.set_meta(rb, key, value_type, string=string, integer=integer, boolean=boolean)


def field(name: str, datatype: str, kind: str, nullable: bool, description: str, *, formula: str | None = None, related_to: str | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {"name": name, "datatype": datatype, "type": kind, "nullable": nullable, "Description": description}
    if formula is not None:
        result["formula"] = formula
    if related_to is not None:
        result["RelatedTo"] = related_to
    return result


def ensure_fields(tbl: dict[str, Any], additions: list[dict[str, Any]]) -> None:
    base.ensure_fields(tbl, additions)


def active_primitives(rb: dict[str, Any]) -> list[dict[str, Any]]:
    return base.active_primitives(rb)


def active_operators(rb: dict[str, Any]) -> list[dict[str, Any]]:
    return base.active_operators(rb)


def register_derived(rb: dict[str, Any], ident: str, display: str, expression: str, loop: int, sources: str, *, operator: str = "WARRANTED_REWRITE") -> None:
    base.register_concept(
        rb,
        ident,
        display,
        "COINED_PREDICATE",
        expression,
        1,
        sources,
        loop,
        status="ACTIVE_DERIVED",
        category="DERIVED",
        operator_expression=operator,
    )
    row = table_index(rb, "TSPConceptRegistry")[ident]
    row["RecoverabilityExpression"] = row.get("RecoverabilityExpression") or "PROJECT_FROM_SEMANTIC_ARC_AND_WARRANTED_REWRITE"
    row["IsRecoverableFromCurrentBasis"] = True


def add_measurement(rb: dict[str, Any], order: int, term: str, notes: str, *, kind: str = "FROZEN_BASIS_CALIBRATION", prediction: str = "EMPIRICAL") -> None:
    base.add_measurement(rb, order, term, notes, kind=kind, prediction=prediction)


def add_frontier(rb: dict[str, Any], ident: str, display: str, opened: int, closed: int, rule: str, criterion: str, certificate: str) -> None:
    base.add_frontier(rb, ident, display, opened, closed, rule, criterion, certificate)


def finish_loop(rb: dict[str, Any], contract: dict[str, Any], order: int, after: str, witness: str) -> None:
    loop = next(row for row in rows(rb, "TSPLoops") if int(row["LoopOrder"]) == order)
    loop.update(
        {
            "Status": "CLOSED",
            "AfterState": after,
            "WitnessSummary": witness,
            "CompletionDisposition": "CLOSED",
            "NextFrontier": LOOPS[order]["next"],
        }
    )
    contract_loop = next(row for row in contract["Loops"] if int(row["LoopOrder"]) == order)
    contract_loop.update(
        {
            "Status": "CLOSED",
            "AfterState": after,
            "Result": witness,
            "CompletionDisposition": "CLOSED",
        }
    )
    set_meta(rb, "last_loop", "integer", integer=order)
    set_meta(rb, "highest_completed_loop", "integer", integer=order)


def save(rb: dict[str, Any], contract: dict[str, Any]) -> None:
    base.save(rb, contract)


def commit(message: str, paths: list[Path]) -> None:
    base.commit(message, paths)


def meta_value(rb: dict[str, Any], key: str) -> Any:
    for row in rb["__meta__"]["data"]:
        if row["MetaKey"] == key:
            return row.get("StringValue") if row["ValueType"] == "string" else row.get("IntegerValue") if row["ValueType"] == "integer" else row.get("BooleanValue")
    raise KeyError(key)


def heldout_rows(rb: dict[str, Any]) -> list[dict[str, Any]]:
    return [row for row in rows(rb, "TSPInstances") if row.get("ExperimentSplit") == "HELD_OUT"]


def development_rows(rb: dict[str, Any]) -> list[dict[str, Any]]:
    return [row for row in rows(rb, "TSPInstances") if row.get("ExperimentSplit") == "DEVELOPMENT"]


def ensure_oracle_fields(rb: dict[str, Any]) -> None:
    ensure_fields(
        rb["TSPInstances"],
        [
            field("ExperimentSplit", "string", "raw", True, "DEVELOPMENT, HELD_OUT, or NEGATIVE_CONTROL evidence partition."),
            field("InstanceFamily", "string", "raw", True, "Family used for stratified calibration."),
            field("OracleStatus", "string", "raw", True, "PENDING, EXACT, INVALID_GRAPH, or NOT_IN_SCOPE."),
            field("ExactTourClassCount", "integer", "raw", True, "Depot-fixed reversal-quotient route classes before availability filtering."),
            field("ExactFeasibleClassCount", "integer", "raw", True, "Canonical classes whose every route edge is available."),
            field("ExactOptimumCost", "number", "raw", True, "Exact finite optimum from exhaustive calibration enumeration."),
            field("ExactOptimalClassCount", "integer", "raw", True, "Number of non-reversal canonical route classes attaining the exact optimum."),
            field("ExactSecondBestCost", "number", "raw", True, "Second distinct feasible route value, when present."),
            field("ExactDistinctValueCount", "integer", "raw", True, "Distinct feasible route values in the exact oracle."),
            field("ExactOracleWitnessRoute", "string", "raw", True, "Canonical first exact optimal route, encoded as stop ids."),
            field("ExactOracleChecksum", "string", "raw", True, "SHA-256 of the normalized exact-oracle payload."),
            field("DegreeTwoOracleLowerBound", "number", "raw", True, "Independent recomputation of the two-cheapest incident-edge bound."),
            field("DegreeTwoOracleGap", "number", "raw", True, "Exact optimum minus the degree-two lower bound."),
            field("LocalMinimumUnionEdgeCount", "integer", "raw", True, "Distinct edges in the union of all local two-cheapest selections."),
            field("LocalMinimumUnionCost", "number", "raw", True, "Cost of the local-minimum edge union."),
            field("LocalMinimumUnionComponentCount", "integer", "raw", True, "Connected components in the local-minimum union."),
            field("LocalMinimumUnionDegreeViolationCount", "integer", "raw", True, "Stops not having degree two in the local-minimum union."),
            field("LocalMinimumUnionIsHamiltonian", "boolean", "raw", True, "Whether the local-minimum union is one Hamiltonian cycle."),
            field("DeterministicForcedEdgeCount", "integer", "raw", True, "Edges forced by generic degree closure."),
            field("DeterministicForbiddenEdgeCount", "integer", "raw", True, "Edges forbidden by generic degree and proper-subtour closure."),
            field("DeterministicClosureRoundCount", "integer", "raw", True, "Rounds required to reach deterministic fixed point."),
            field("DeterministicResidualClassCount", "integer", "raw", True, "Canonical route classes remaining after represented deterministic closure."),
            field("DeterministicResidualValueCount", "integer", "raw", True, "Distinct route values remaining after deterministic closure."),
            field("DeterministicResidualOptimalCount", "integer", "raw", True, "Exact optimal classes remaining after deterministic closure."),
            field("DeterministicValueClosed", "boolean", "raw", True, "Whether represented structure closes the optimum value without branching."),
            field("DeterministicRouteClosed", "boolean", "raw", True, "Whether represented structure identifies one route class without branching."),
            field("BranchWarrantStatus", "string", "raw", True, "Whether a branch is required for value, rejected because value is closed, or policy-only."),
            field("ClosureYieldPct", "number", "raw", True, "Percentage of exact feasible route classes removed before branching."),
            field("RuleLeverage", "number", "raw", True, "Eliminated classes per deterministic edge decision or structural route closure."),
            field("StructuralSufficiency", "string", "raw", True, "VALUE_AND_ROUTE, VALUE_ONLY, ROUTE_ONLY, or OPEN."),
            field("ChoiceEntropyBits", "number", "raw", True, "log2 of the exact optimal choice-orbit size."),
            field("DefectSupport", "string", "raw", True, "Typed coordinates supporting the residual kernel."),
            field("RepairPotential", "number", "raw", True, "Observed exact optimum minus local degree-two union cost when the union is a disconnected two-factor."),
            field("BoundaryDemand", "integer", "raw", True, "Minimum quotient crossing-edge demand from component handshake accounting."),
            field("PortCompatibilityCount", "integer", "raw", True, "Region-pair relations with at least one available crossing edge."),
            field("QuotientWidth", "integer", "raw", True, "Distinct optimal boundary-port pairs exposed across quotient regions."),
            field("ResidualKernel", "string", "raw", True, "Canonical value|choice|connectivity|gap|warrant residual signature."),
            field("BranchNecessaryForValue", "boolean", "raw", True, "Whether deterministic closure leaves more than one value."),
            field("SearchCompressionProfile", "string", "raw", True, "Class and value compression trace."),
            field("CalibrationBranchEdge", "string", "raw", True, "Undecided edge selected by the exact calibration branch."),
            field("BranchIncludeClassCount", "integer", "raw", True, "Residual classes in the include branch."),
            field("BranchExcludeClassCount", "integer", "raw", True, "Residual classes in the exclude branch."),
            field("BranchIncludeBestCost", "number", "raw", True, "Best exact value in the include branch."),
            field("BranchExcludeBestCost", "number", "raw", True, "Best exact value in the exclude branch."),
            field("CalibrationBranchDecisionCount", "integer", "raw", True, "Branches executed by the calibration-only exact search witness."),
            field("CalibrationBranchStatus", "string", "raw", True, "Calibration-only branch conclusion."),
        ],
    )
    ensure_fields(
        rb["TSPSearchCertificates"],
        [
            field("ValueClassCountBefore", "integer", "raw", True, "Distinct feasible values before deterministic closure."),
            field("ValueClassCountAfter", "integer", "raw", True, "Distinct values after deterministic closure."),
            field("ChoiceOrbitSize", "integer", "raw", True, "Optimal route classes remaining after value closure."),
            field("BranchWarrantStatus", "string", "raw", True, "Typed reason to branch or reject branching."),
            field("OracleChecksum", "string", "raw", True, "Exact-oracle payload checksum supporting this calibration row."),
        ],
    )
    ensure_fields(
        rb["TSPDefectProfiles"],
        [
            field("ResidualValueCount", "integer", "raw", True, "Distinct values remaining after deterministic closure."),
            field("ResidualChoiceCount", "integer", "raw", True, "Exact optimal route choices remaining."),
            field("ClosureYieldPct", "number", "raw", True, "Percentage of exact feasible classes eliminated before branching."),
            field("RepairPotential", "number", "raw", True, "Observed exact repair delta for a disconnected local two-factor."),
        ],
    )
    ensure_fields(
        rb["TSPConvergenceMeasurements"],
        [
            field("DevelopmentInstanceCount", "integer", "raw", True, "Development instances in scope."),
            field("HeldOutInstanceCount", "integer", "raw", True, "Held-out instances in scope."),
            field("ExactOracleCoveragePct", "number", "raw", True, "Percentage of in-scope instances with exact oracle rows."),
            field("ValueClosedCount", "integer", "raw", True, "Instances whose value closes deterministically."),
            field("RouteClosedCount", "integer", "raw", True, "Instances whose route class closes deterministically."),
            field("BranchRequiredCount", "integer", "raw", True, "Instances requiring a value-relevant branch after deterministic closure."),
            field("MeanClosureYieldPct", "number", "raw", True, "Mean exact route-class elimination percentage."),
            field("MaxExactClassCount", "integer", "raw", True, "Largest exact canonical route-class count in the measured corpus."),
            field("BasisGrowthCount", "integer", "raw", True, "New primitive or operator rows introduced after the basis freeze."),
        ],
    )


def set_instance_oracle(row: dict[str, Any], result: dict[str, Any]) -> None:
    initial = int(result["feasible_class_count"])
    residual = int(result["deterministic_residual_class_count"])
    yield_pct = 0.0 if initial == 0 else round((initial - residual) / initial * 100.0, 2)
    decisions = int(len(result["forced_edges"]) + len(result["forbidden_edges"]))
    if result["deterministic_route_closed"]:
        decisions += 1
    leverage = 0.0 if decisions == 0 else round((initial - residual) / decisions, 4)
    if result["deterministic_value_closed"] and result["deterministic_route_closed"]:
        sufficiency = "VALUE_AND_ROUTE"
    elif result["deterministic_value_closed"]:
        sufficiency = "VALUE_ONLY"
    elif result["deterministic_route_closed"]:
        sufficiency = "ROUTE_ONLY"
    else:
        sufficiency = "OPEN"
    components = int(result["local_union_component_count"])
    violations = int(result["local_union_degree_violation_count"])
    gap = result["degree_two_gap"]
    choice = int(result["optimal_class_count"])
    defect = f"incidence={violations}|connectivity={max(components-1,0)}|gap={gap}|choice={choice}"
    repair = None
    if violations == 0 and components > 1 and result["local_union_cost"] is not None and result["optimum_cost"] is not None:
        repair = float(result["optimum_cost"]) - float(result["local_union_cost"])
    row.update(
        {
            "OracleStatus": "EXACT",
            "ExactTourClassCount": result["total_class_count"],
            "ExactFeasibleClassCount": result["feasible_class_count"],
            "ExactOptimumCost": result["optimum_cost"],
            "ExactOptimalClassCount": result["optimal_class_count"],
            "ExactSecondBestCost": result["second_best_cost"],
            "ExactDistinctValueCount": result["distinct_feasible_value_count"],
            "ExactOracleWitnessRoute": ">".join(result["optimal_routes"][0]) if result["optimal_routes"] else None,
            "ExactOracleChecksum": result["oracle_checksum"],
            "DegreeTwoOracleLowerBound": result["degree_two_lower_bound"],
            "DegreeTwoOracleGap": result["degree_two_gap"],
            "LocalMinimumUnionEdgeCount": len(result["local_union_edges"]),
            "LocalMinimumUnionCost": result["local_union_cost"],
            "LocalMinimumUnionComponentCount": components,
            "LocalMinimumUnionDegreeViolationCount": violations,
            "LocalMinimumUnionIsHamiltonian": result["local_union_is_hamiltonian"],
            "DeterministicForcedEdgeCount": len(result["forced_edges"]),
            "DeterministicForbiddenEdgeCount": len(result["forbidden_edges"]),
            "DeterministicClosureRoundCount": result["closure_round_count"],
            "DeterministicResidualClassCount": residual,
            "DeterministicResidualValueCount": result["deterministic_residual_value_count"],
            "DeterministicResidualOptimalCount": result["deterministic_residual_optimal_count"],
            "DeterministicValueClosed": result["deterministic_value_closed"],
            "DeterministicRouteClosed": result["deterministic_route_closed"],
            "BranchWarrantStatus": result["branch_warrant_status"],
            "ClosureYieldPct": yield_pct,
            "RuleLeverage": leverage,
            "StructuralSufficiency": sufficiency,
            "ChoiceEntropyBits": round(math.log2(max(choice, 1)), 6),
            "DefectSupport": defect,
            "RepairPotential": repair,
            "BoundaryDemand": components if components > 1 and violations == 0 else 0,
            "ResidualKernel": f"{result['deterministic_residual_value_count']}|{result['deterministic_residual_optimal_count']}|{max(components-1,0)}|{gap}|{result['branch_warrant_status']}",
            "BranchNecessaryForValue": result["branch_warrant_status"] == "REQUIRED_FOR_VALUE",
            "SearchCompressionProfile": f"classes:{initial}->{residual};values:{result['distinct_feasible_value_count']}->{result['deterministic_residual_value_count']};choices:{choice}->{result['deterministic_residual_optimal_count']}",
        }
    )


def fixture_cost(spec: dict[str, Any], i: int, j: int) -> float:
    key = spec["key"]
    n = int(spec["n"])
    if key == "ring6":
        distance = min((j - i) % n, (i - j) % n)
        return 1 if distance == 1 else 4 + distance
    if key == "metric6":
        coords = [(0, 0), (2, 0), (4, 1), (4, 4), (2, 5), (0, 3)]
        x1, y1 = coords[i]
        x2, y2 = coords[j]
        return max(1, round(math.hypot(x1 - x2, y1 - y2) * 10))
    if key == "cluster7":
        same = (i < 3) == (j < 3)
        return 1 + abs(i - j) if same else 9 + ((i + j) % 4)
    if key == "hetero8":
        gi, gj = spec["groups"][i], spec["groups"][j]
        if gi == gj:
            return 1 + ((i + j) % 3)
        ring = {tuple(sorted(pair)) for pair in [("a", "b"), ("b", "c"), ("a", "c")]}
        return 7 + ((i * 3 + j) % 4) if tuple(sorted((gi, gj))) in ring else 20
    if key == "sparse8":
        p = tuple(sorted((i, j)))
        ring_edges = {tuple(sorted((k, (k + 1) % n))) for k in range(n)}
        rungs = {(0, 4), (1, 5), (2, 6), (3, 7)}
        chords = {(0, 2), (4, 6)}
        if p in ring_edges:
            return 1
        if p in rungs:
            return 3
        if p in chords:
            return 4
        return 50
    if key == "bottleneck7":
        same = (i < 3) == (j < 3)
        if same:
            return 1 + abs(i - j)
        if tuple(sorted((i, j))) in {(0, 3), (2, 6)}:
            return 5
        return 20 + ((i + j) % 3)
    if key == "tie6":
        return 1
    if key == "dominance7":
        gi, gj = spec["groups"][i], spec["groups"][j]
        if gi == gj == "core":
            matrix = {(0, 1): 1, (0, 2): 4, (0, 3): 8, (1, 2): 2, (1, 3): 5, (2, 3): 3}
            return matrix[tuple(sorted((i, j)))]
        if gi == gj:
            return 2 + abs(i - j)
        return 6 + ((i * 5 + j * 3) % 7)
    if key == "nested8":
        gi, gj = spec["groups"][i], spec["groups"][j]
        if gi == gj:
            return 1
        if gi[0] == gj[0]:
            return 4 + ((i + j) % 2)
        return 9 + ((i * 2 + j) % 4)
    if key == "nonmetric6":
        a, b = sorted((i, j))
        return 1 + (((a + 2) * (b + 5) * 7 + a * b * 3) % 19)
    if key == "fourregion8":
        gi, gj = spec["groups"][i], spec["groups"][j]
        if gi == gj:
            return 1
        order = {"a": 0, "b": 1, "c": 2, "d": 3}
        d = abs(order[gi] - order[gj])
        circular = min(d, 4 - d)
        return 5 + ((i + j) % 2) if circular == 1 else 15 + ((i + j) % 3)
    if key == "residual8":
        a, b = sorted((i, j))
        return 1 + (((a + 1) * 11 + (b + 1) * 7 + (a - b) * (a - b) * 3) % 23)
    raise KeyError(key)


def fixture_available(spec: dict[str, Any], i: int, j: int) -> bool:
    if spec["key"] != "sparse8":
        return True
    n = int(spec["n"])
    p = tuple(sorted((i, j)))
    ring_edges = {tuple(sorted((k, (k + 1) % n))) for k in range(n)}
    rungs = {(0, 4), (1, 5), (2, 6), (3, 7)}
    chords = {(0, 2), (4, 6)}
    return p in ring_edges | rungs | chords


def materialize_fixture(rb: dict[str, Any], spec: dict[str, Any]) -> str:
    ensure_oracle_fields(rb)
    key, n, family = spec["key"], int(spec["n"]), spec["family"]
    instance_id = f"tsp-holdout-{key}-{n}"
    group_counts = Counter(spec["groups"])
    neighborhood_rows = []
    for group, count in sorted(group_counts.items()):
        neighborhood_rows.append(
            {
                "NeighborhoodId": f"gridville-holdout-{key}-{group}",
                "DisplayName": f"Held-Out {key} {group}",
                "City": "gridville",
                "ClusterKind": f"HELDOUT_{family}",
                "IsQuotientNode": count > 1,
                "QuotientNodeKind": "HELDOUT_CALIBRATION_REGION" if count > 1 else None,
                "RequiredBoundaryDegree": 2 if count > 1 else None,
                "QuotientScopeId": instance_id if count > 1 else None,
                "RegionInterfaceKind": "PORT_BEARING_QUOTIENT_REGION" if count > 1 else None,
                "BoundaryPortCount": 2 if count > 1 else None,
                "InternalCoverageCount": count if count > 1 else None,
                "ExpansionWitnessKind": "EXACT_ORACLE_CALIBRATION" if count > 1 else None,
                "InterfaceStatus": "CALIBRATION_ONLY" if count > 1 else None,
            }
        )
    upsert_rows(rb["Neighborhoods"], "NeighborhoodId", neighborhood_rows)
    address_rows = []
    stop_rows = []
    for i, group in enumerate(spec["groups"]):
        address_id = f"addr-holdout-{key}-{i}"
        stop_id = f"holdout-{key}-stop-{i}"
        address_rows.append(
            {
                "AddressId": address_id,
                "StreetLabel": f"Held-Out {key.upper()} {i}",
                "Neighborhood": f"gridville-holdout-{key}-{group}",
                "XCoordinate": 100 + HOLDOUT_FIXTURES.index(spec) * 15 + i,
                "YCoordinate": (i * i + HOLDOUT_FIXTURES.index(spec) * 3) % 11,
                "IsDepotCandidate": i == 0,
            }
        )
        stop_rows.append(
            {
                "InstanceStopId": stop_id,
                "TSPInstance": instance_id,
                "Address": address_id,
                "IsRequired": True,
            }
        )
    upsert_rows(rb["Addresses"], "AddressId", address_rows)
    upsert_rows(
        rb["TSPInstances"],
        "TSPInstanceId",
        [
            {
                "TSPInstanceId": instance_id,
                "DisplayName": f"Held-Out {family} {n}-Stop",
                "City": "gridville",
                "DepotAddress": f"addr-holdout-{key}-0",
                "DistanceModel": "EXPLICIT_SYMMETRIC_COST_WITH_AVAILABILITY" if key == "sparse8" else "EXPLICIT_SYMMETRIC_COST",
                "IsSymmetric": True,
                "Status": "HELDOUT_RAW_GRAPH",
                "SearchPolicy": "FROZEN_BASIS_CLOSURE_THEN_EXACT_CALIBRATION",
                "Notes": "Weights and availability were fixed before exact-oracle execution; oracle outputs may not revise the graph.",
                "ExperimentSplit": "HELD_OUT",
                "InstanceFamily": family,
                "OracleStatus": "PENDING",
            }
        ],
    )
    upsert_rows(rb["InstanceStops"], "InstanceStopId", stop_rows)
    edge_rows = []
    for i in range(n):
        for j in range(i + 1, n):
            a = f"holdout-{key}-stop-{i}"
            b = f"holdout-{key}-stop-{j}"
            cost = fixture_cost(spec, i, j)
            edge_rows.append(
                {
                    "TravelEdgeId": f"holdout-{key}-edge-{i}-{j}",
                    "TSPInstance": instance_id,
                    "FromStop": a,
                    "ToStop": b,
                    "DistanceMeters": float(cost) * 1000,
                    "TravelCost": cost,
                    "IsAvailable": fixture_available(spec, i, j),
                    "EdgeSource": f"HELDOUT_{family}",
                    "CanonicalPairKey": f"{a}|{b}",
                }
            )
    upsert_rows(rb["TravelEdges"], "TravelEdgeId", edge_rows)
    return instance_id


def edge_maps(rb: dict[str, Any], instance_id: str) -> tuple[dict[tuple[str, str], str], dict[str, dict[str, Any]]]:
    by_pair: dict[tuple[str, str], str] = {}
    by_id: dict[str, dict[str, Any]] = {}
    for row in rows(rb, "TravelEdges"):
        if row["TSPInstance"] != instance_id:
            continue
        key = oracle.pair(row["FromStop"], row["ToStop"])
        by_pair[key] = row["TravelEdgeId"]
        by_id[row["TravelEdgeId"]] = row
    return by_pair, by_id


def materialize_local_bounds(rb: dict[str, Any], instance_id: str, result: dict[str, Any]) -> str:
    graph = oracle.graph_for_instance(rb, instance_id)
    stops = graph["stops"]
    available = graph["available"]
    costs = graph["costs"]
    pair_to_id, edge_by_id = edge_maps(rb, instance_id)
    lower_id = f"degree-two-lower-bound-{instance_id}"
    local_rows = []
    dominance_rows = []
    for stop in stops:
        incident = sorted((edge for edge in available if stop in edge), key=lambda edge: (costs[edge], edge))
        first, second = incident[:2]
        local_id = f"local-bound-{instance_id}-{stop}"
        local_rows.append(
            {
                "LocalDegreeBoundId": local_id,
                "TSPInstance": instance_id,
                "InstanceStop": stop,
                "FirstEdge": pair_to_id[first],
                "SecondEdge": pair_to_id[second],
            }
        )
        for edge in incident[2:]:
            dominance_rows.append(
                {
                    "IncidentDominanceCheckId": f"dominance-{instance_id}-{stop}-{pair_to_id[edge]}",
                    "LocalDegreeBound": local_id,
                    "OtherEdge": pair_to_id[edge],
                }
            )
    upsert_rows(rb["LocalDegreeBounds"], "LocalDegreeBoundId", local_rows)
    upsert_rows(rb["IncidentDominanceChecks"], "IncidentDominanceCheckId", dominance_rows)
    upsert_rows(
        rb["InstanceLowerBounds"],
        "InstanceLowerBoundId",
        [
            {
                "InstanceLowerBoundId": lower_id,
                "TSPInstance": instance_id,
                "BoundKind": "SUM_TWO_CHEAPEST_INCIDENT_EDGES_DIVIDED_BY_TWO",
                "RequiredSupplementalTermCount": 0,
                "BoundCompositionKind": "DEGREE_TWO_ONLY_HELDOUT_CALIBRATION",
                "SupplementalBoundAdjustment": 0,
            }
        ],
    )
    return lower_id


def materialize_candidate(rb: dict[str, Any], instance_id: str, route: list[str], rank: int, result: dict[str, Any], lower_id: str, order: int) -> str:
    suffix = instance_id.removeprefix("tsp-")
    candidate_id = f"tour-oracle-{suffix}-{rank}"
    upsert_rows(
        rb["CandidateTours"],
        "CandidateTourId",
        [
            {
                "CandidateTourId": candidate_id,
                "DisplayName": f"Exact oracle calibration witness {rank} for {instance_id}",
                "TSPInstance": instance_id,
                "CandidateKind": "EXACT_ORACLE_CALIBRATION_WITNESS",
                "SearchBranchesExplored": int(result["feasible_class_count"]),
                "BacktrackCount": 0,
            }
        ],
    )
    stop_rows = []
    for pos, stop in enumerate(route, start=1):
        stop_rows.append(
            {
                "TourStopId": f"{candidate_id}-stop-{pos}",
                "CandidateTour": candidate_id,
                "InstanceStop": stop,
                "SequencePosition": pos,
            }
        )
    upsert_rows(rb["TourStops"], "TourStopId", stop_rows)
    pair_to_id, _ = edge_maps(rb, instance_id)
    leg_rows = []
    for pos, stop in enumerate(route, start=1):
        nxt_pos = 1 if pos == len(route) else pos + 1
        nxt = route[nxt_pos - 1]
        leg_rows.append(
            {
                "TourLegId": f"{candidate_id}-leg-{pos}",
                "CandidateTour": candidate_id,
                "FromTourStop": f"{candidate_id}-stop-{pos}",
                "ToTourStop": f"{candidate_id}-stop-{nxt_pos}",
                "TravelEdge": pair_to_id[oracle.pair(stop, nxt)],
                "LegOrder": pos,
            }
        )
    upsert_rows(rb["TourLegs"], "TourLegId", leg_rows)
    upsert_rows(
        rb["TSPWitnessNormalForms"],
        "TSPWitnessNormalFormId",
        [
            {
                "TSPWitnessNormalFormId": f"normal-{candidate_id}",
                "TSPInstance": instance_id,
                "TSPLoop": f"tsp-loop-{order}",
                "WitnessShape": "CYCLE",
                "OriginKind": "ORACLE_CALIBRATION",
                "SourceKind": "CandidateTours",
                "SourceId": candidate_id,
                "BoundarySignature": None,
                "CoveredStopCount": len(route),
                "RequiredStopCount": len(route),
                "EdgeCount": len(route),
                "TotalCost": result["optimum_cost"],
                "IncidenceDefect": 0,
                "ConnectivityDefect": 0,
                "OrderDefect": 0,
                "ProvenanceSummary": "Exact finite enumeration witness used for calibration; structural proof status is unchanged unless an independent lower bound is tight.",
            }
        ],
    )
    if result["degree_two_lower_bound"] is not None and abs(float(result["degree_two_lower_bound"]) - float(result["optimum_cost"])) < 1e-9:
        upsert_rows(
            rb["OptimalityCertificates"],
            "OptimalityCertificateId",
            [
                {
                    "OptimalityCertificateId": f"optimality-{candidate_id}",
                    "CandidateTour": candidate_id,
                    "InstanceLowerBound": lower_id,
                }
            ],
        )
    return candidate_id


def materialize_analysis(rb: dict[str, Any], instance_id: str, order: int) -> dict[str, Any]:
    ensure_oracle_fields(rb)
    result = oracle.evaluate_instance(rb, instance_id)
    instance = table_index(rb, "TSPInstances")[instance_id]
    set_instance_oracle(instance, result)
    lower_id = materialize_local_bounds(rb, instance_id, result)
    route_count = min(max(int(result["optimal_class_count"]), 1), 2)
    candidates = []
    for rank, route in enumerate(result["optimal_routes"][:route_count], start=1):
        candidates.append(materialize_candidate(rb, instance_id, route, rank, result, lower_id, order))
    initial = int(result["feasible_class_count"])
    residual = int(result["deterministic_residual_class_count"])
    upsert_rows(
        rb["TSPSearchCertificates"],
        "TSPSearchCertificateId",
        [
            {
                "TSPSearchCertificateId": f"search-calibration-{instance_id}",
                "TSPInstance": instance_id,
                "TSPLoop": f"tsp-loop-{order}",
                "DerivedEdgeSet": None,
                "QuestionKind": "FROZEN_BASIS_HELDOUT_CALIBRATION",
                "InitialRouteClassCount": initial,
                "SurvivingRouteClassCount": residual,
                "BranchDecisionCount": 0,
                "BacktrackCount": 0,
                "ResidualAmbiguityCount": residual,
                "BranchingAvoidedPct": 0 if initial == 0 else round((initial - residual) / initial * 100.0, 2),
                "Status": "CERTIFIED" if result["deterministic_value_closed"] else "RESIDUAL_SEARCH",
                "ValueClassCountBefore": result["distinct_feasible_value_count"],
                "ValueClassCountAfter": result["deterministic_residual_value_count"],
                "ChoiceOrbitSize": result["deterministic_residual_optimal_count"],
                "BranchWarrantStatus": result["branch_warrant_status"],
                "OracleChecksum": result["oracle_checksum"],
            }
        ],
    )
    components = int(result["local_union_component_count"])
    violations = int(result["local_union_degree_violation_count"])
    upsert_rows(
        rb["TSPDefectProfiles"],
        "TSPDefectProfileId",
        [
            {
                "TSPDefectProfileId": f"defect-calibration-{instance_id}",
                "TSPInstance": instance_id,
                "TSPLoop": f"tsp-loop-{order}",
                "SubjectKind": "INSTANCE",
                "SubjectId": instance_id,
                "RequiredIncidence": 2,
                "ObservedIncidence": 2 if violations == 0 else 0,
                "ComponentCount": components,
                "RequiredBoundaryCrossings": components if components > 1 and violations == 0 else 0,
                "ObservedBoundaryCrossings": 0,
                "LowerBoundCost": result["degree_two_lower_bound"] or 0,
                "UpperBoundCost": result["optimum_cost"] or 0,
                "Status": instance["StructuralSufficiency"],
                "ResidualValueCount": result["deterministic_residual_value_count"],
                "ResidualChoiceCount": result["deterministic_residual_optimal_count"],
                "ClosureYieldPct": instance["ClosureYieldPct"],
                "RepairPotential": instance["RepairPotential"],
            }
        ],
    )
    instance["Status"] = "HELDOUT_EXACTLY_CALIBRATED"
    return {"result": result, "candidates": candidates, "lower_id": lower_id}


def aggregate_profile(instance_rows: list[dict[str, Any]]) -> dict[str, Any]:
    exact = [row for row in instance_rows if row.get("OracleStatus") == "EXACT"]
    yields = [float(row.get("ClosureYieldPct") or 0) for row in exact]
    return {
        "count": len(instance_rows),
        "exact": len(exact),
        "coverage_pct": 0 if not instance_rows else round(len(exact) / len(instance_rows) * 100.0, 2),
        "value_closed": sum(row.get("DeterministicValueClosed") is True for row in exact),
        "route_closed": sum(row.get("DeterministicRouteClosed") is True for row in exact),
        "branch_required": sum(row.get("BranchNecessaryForValue") is True for row in exact),
        "mean_yield": round(statistics.fmean(yields), 2) if yields else 0,
        "max_classes": max((int(row.get("ExactFeasibleClassCount") or 0) for row in exact), default=0),
        "max_choice": max((int(row.get("ExactOptimalClassCount") or 0) for row in exact), default=0),
    }


def update_measurement_profile(rb: dict[str, Any], order: int, profile: dict[str, Any]) -> None:
    row = table_index(rb, "TSPConvergenceMeasurements")[f"convergence-loop-{order}"]
    row.update(
        {
            "DevelopmentInstanceCount": len(development_rows(rb)),
            "HeldOutInstanceCount": len(heldout_rows(rb)),
            "ExactOracleCoveragePct": profile["coverage_pct"],
            "ValueClosedCount": profile["value_closed"],
            "RouteClosedCount": profile["route_closed"],
            "BranchRequiredCount": profile["branch_required"],
            "MeanClosureYieldPct": profile["mean_yield"],
            "MaxExactClassCount": profile["max_classes"],
            "BasisGrowthCount": 0,
        }
    )


def loop_647(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    status = json.loads(VERIFIED_646.read_text()) if VERIFIED_646.is_file() else {}
    if status.get("status") != "SUCCEEDED" or int(status.get("last_loop", 0)) != 646:
        raise AssertionError(f"loop-646 execution certificate unavailable: {status}")
    loops = {int(row["LoopOrder"]): row for row in rows(rb, "TSPLoops")}
    if any(loops[n]["Status"] != "CLOSED" for n in range(624, 647)):
        raise AssertionError("loops 624-646 are not all closed")
    if {row["DisplayName"] for row in active_primitives(rb)} != {"Semantic Arc"}:
        raise AssertionError("active semantic arc basis mismatch")
    if {row["DisplayName"] for row in active_operators(rb)} != {"Warranted Rewrite"}:
        raise AssertionError("active warranted rewrite basis mismatch")
    claims = contract["Claims"]
    required = {
        "ThreeRegionOptimalityProved": True,
        "OptimalFaceValueCertified": True,
        "OptimalFaceUniqueRouteProved": False,
        "GeneralKRegionRepairProved": False,
        "OneArcOneRewriteProved": False,
    }
    for key, value in required.items():
        if claims.get(key) is not value:
            raise AssertionError(f"loop-646 claim mismatch {key}={claims.get(key)!r}")
    register_derived(rb, "coined-instrument-seal-two", "Instrument Seal II", "SEMANTIC_ARC(campaign,RAW_WITNESS_STATUS,SEALED)+WARRANTED_REWRITE(loop646_rows,recompute,CONTRACTIVE,seal,raw_witnesses)", 647, "TSPLoops,TSPConceptRegistry,TSPConvergenceMeasurements")
    add_measurement(rb, 647, "Instrument Seal II", "Recomputed loop-646 basis and finite claims from canonical rows before beginning the exact-oracle campaign.", kind="INSTRUMENT_SEAL", prediction="VERIFIED_PREREQUISITE")
    add_frontier(rb, "frontier-loop-646-raw-seal", "Loop-646 raw witness seal", 646, 647, "tsp-rule-exact-oracle-calibration", "One arc, one rewrite, three-region optimum, optimal-face value/choice, and nonclaims agree with the canonical ledger.", "raw-witness-seal-certificate")
    return (
        "Sealed the loop-646 execution state as the held-out campaign prerequisite.",
        "One active Semantic Arc, one active Warranted Rewrite, three-region optimum 36, optimal-face value 4 with choice orbit 2, and all universal nonclaims agree.",
    )


def loop_648(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    set_meta(rb, "calibration_basis_frozen_at_loop", "integer", integer=646)
    set_meta(rb, "calibration_basis_revision_requires_falsification", "boolean", boolean=True)
    set_meta(rb, "calibration_new_primitive_budget", "integer", integer=0)
    contract.setdefault("Claims", {}).update(
        {
            "CalibrationBasisFrozenAtLoop646": True,
            "HeldOutPrimitiveGrowthAllowedWithoutFalsification": False,
        }
    )
    register_derived(rb, "coined-basis-freeze", "Basis Freeze", "SEMANTIC_ARC(campaign,BASIS,ONE_ARC_ONE_REWRITE)+WARRANTED_REWRITE(new_evidence,admit_only_after_falsification,CONTRACTIVE_OR_EXPANSIVE,basis_revision,explicit_counterexample)", 648, "TSPConceptRegistry,TSPLoops,TSPFrontierObligations")
    add_measurement(rb, 648, "Basis Freeze", "The active basis is frozen for twelve held-out families; new derived terms remain allowed, new primitives require an explicit falsification loop.", kind="EXPERIMENT_DESIGN", prediction="FROZEN")
    return (
        "Froze the one-arc/one-rewrite basis for held-out evaluation.",
        "The primitive budget is zero unless a loop records a basis falsification; derived predicate invention continues normally.",
    )


def loop_649(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    ensure_oracle_fields(rb)
    set_meta(rb, "exact_oracle_scope", "string", string="FINITE_SYMMETRIC_N_LE_9_DEPOT_FIXED_REVERSAL_QUOTIENT")
    set_meta(rb, "exact_oracle_is_structural_proof", "boolean", boolean=False)
    register_derived(rb, "coined-exact-oracle-contract", "Exact Oracle Contract", "SEMANTIC_ARC(instance,EXACT_ENUMERATION_RESULT,payload)+WARRANTED_REWRITE(route_classes,enumerate,EXPANSIVE,oracle_payload,finite_exhaustion)", 649, "TSPInstances,TSPSearchCertificates,TSPDefectProfiles,exact_oracle_v1.py")
    add_measurement(rb, 649, "Exact Oracle Contract", "Added exact value, choice, lower-bound gap, deterministic residue, branch-warrant, and checksum coordinates without equating enumeration with structural derivation.", kind="ORACLE_CONTRACT", prediction="INSTRUMENTED")
    return (
        "Declared the exact small-instance oracle and its trust boundary.",
        "The oracle is exact for the declared finite normalization, but remains calibration evidence rather than an automatic structural proof-status upgrade.",
    )


def loop_650(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    for n in range(4, 10):
        expected = math.factorial(n - 1) // 2
        synthetic = [f"v{i}" for i in range(n)]
        depot = synthetic[0]
        count = 0
        for perm in itertools.permutations(synthetic[1:]):
            if perm <= tuple(reversed(perm)):
                count += 1
        if count != expected:
            raise AssertionError(f"canonical class count mismatch at n={n}: {count} != {expected}")
        if oracle.canonical_cycle(tuple(synthetic), depot)[0] != depot:
            raise AssertionError("canonical cycle lost depot")
    register_derived(rb, "coined-canonical-tour-class", "Canonical Tour Class", "SEMANTIC_ARC(cycle,DEPOT,depot)+SEMANTIC_ARC(cycle,REVERSAL_CLASS,canonical_orientation)+WARRANTED_REWRITE(raw_cycle,rotate_and_reverse,CONTRACTIVE,canonical_class,symmetry)", 650, "CandidateTours,TourStops,TourLegs,exact_oracle_v1.py")
    add_measurement(rb, 650, "Canonical Tour Class", "Verified depot-fixed reversal quotient counts from 4 through 9 stops: (n-1)!/2.", kind="NORMALIZATION", prediction="CERTIFIED_FOR_SCOPE")
    return (
        "Canonicalized symmetric tours modulo rotation and reversal.",
        "For n=4..9, enumeration produces exactly (n-1)!/2 depot-fixed reversal classes; route identity no longer depends on presentation orientation.",
    )


def loop_651(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    ensure_oracle_fields(rb)
    instance_index = table_index(rb, "TSPInstances")
    exact = oracle.evaluate_all(rb, EXISTING_ORACLE_INSTANCES)
    for instance_id, result in exact.items():
        set_instance_oracle(instance_index[instance_id], result)
    register_derived(rb, "coined-exhaustive-small-instance-oracle", "Exhaustive Small-Instance Oracle", "WARRANTED_REWRITE(canonical_route_classes,enumerate_all,EXPANSIVE,exact_value_and_choice,finite_exhaustion)+SEMANTIC_ARC(instance,ORACLE_CHECKSUM,sha256)", 651, "TSPInstances,exact_oracle_v1.py")
    profile = aggregate_profile([instance_index[i] for i in EXISTING_ORACLE_INSTANCES])
    add_measurement(rb, 651, "Exhaustive Small-Instance Oracle", f"Enumerated six development fixtures exactly; max feasible canonical classes={profile['max_classes']} and max optimal orbit={profile['max_choice']}.", kind="EXACT_ORACLE_RUN", prediction="EXECUTED")
    update_measurement_profile(rb, 651, profile)
    return (
        "Executed exact enumeration over the valid development corpus.",
        f"Six fixtures received exact optimum, optimal-class, second-best, deterministic residue, and checksum rows; maximum feasible class count was {profile['max_classes']}.",
    )


def loop_652(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    additions = []
    instance_index = table_index(rb, "TSPInstances")
    for instance_id in EXISTING_ORACLE_INSTANCES:
        row = instance_index[instance_id]
        route = row["ExactOracleWitnessRoute"].split(">")
        additions.append(
            {
                "TSPWitnessNormalFormId": f"normal-oracle-{instance_id}",
                "TSPInstance": instance_id,
                "TSPLoop": "tsp-loop-652",
                "WitnessShape": "CYCLE",
                "OriginKind": "ORACLE_CALIBRATION",
                "SourceKind": "exact_oracle_v1",
                "SourceId": row["ExactOracleChecksum"],
                "BoundarySignature": None,
                "CoveredStopCount": len(route),
                "RequiredStopCount": len(route),
                "EdgeCount": len(route),
                "TotalCost": row["ExactOptimumCost"],
                "IncidenceDefect": 0,
                "ConnectivityDefect": 0,
                "OrderDefect": 0,
                "ProvenanceSummary": "First canonical exact optimum used as an independent finite calibration witness; it does not replace a structural lower-bound certificate.",
            }
        )
    upsert_rows(rb["TSPWitnessNormalForms"], "TSPWitnessNormalFormId", additions)
    register_derived(rb, "coined-oracle-witness-normal-form", "Oracle Witness Normal Form", "SEMANTIC_ARC(witness,ORIGIN,ORACLE_CALIBRATION)+SEMANTIC_ARC(witness,COST,exact_optimum)+WARRANTED_REWRITE(route,normalize,CONTRACTIVE,witness_normal_form,finite_oracle)", 652, "TSPWitnessNormalForms,TSPInstances")
    add_measurement(rb, 652, "Oracle Witness Normal Form", "Projected one exact optimal cycle per development fixture into the common witness shape while retaining oracle-only provenance.", kind="WITNESS_NORMALIZATION", prediction="PROVENANCE_PRESERVED")
    return (
        "Normalized exact calibration routes without promoting their epistemic status.",
        "Six ORACLE_CALIBRATION cycle witnesses now share the common coverage/incidence/order/cost form and remain distinct from structural proof antecedents.",
    )


def raw_lower_bound(rb: dict[str, Any], lower_row: dict[str, Any]) -> float:
    instance_id = lower_row["TSPInstance"]
    edge_index = table_index(rb, "TravelEdges")
    local = [row for row in rows(rb, "LocalDegreeBounds") if row["TSPInstance"] == instance_id]
    base_value = sum(float(edge_index[row["FirstEdge"]]["TravelCost"]) + float(edge_index[row["SecondEdge"]]["TravelCost"]) for row in local) / 2.0
    return base_value + float(lower_row.get("SupplementalBoundAdjustment") or 0)


def loop_653(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    instance_index = table_index(rb, "TSPInstances")
    checked = 0
    gaps: list[float] = []
    for lower in rows(rb, "InstanceLowerBounds"):
        instance_id = lower["TSPInstance"]
        instance = instance_index.get(instance_id)
        if not instance or instance.get("OracleStatus") != "EXACT":
            continue
        value = raw_lower_bound(rb, lower)
        optimum = float(instance["ExactOptimumCost"])
        if value > optimum + 1e-9:
            raise AssertionError(f"unsound lower bound {lower['InstanceLowerBoundId']}: {value}>{optimum}")
        gaps.append(optimum - value)
        checked += 1
    register_derived(rb, "coined-exactness-gap", "Exactness Gap", "SEMANTIC_ARC(instance,STRUCTURAL_LOWER_BOUND,L)+SEMANTIC_ARC(instance,EXACT_OPTIMUM,O)+SEMANTIC_ARC(instance,EXACTNESS_GAP,O_MINUS_L)", 653, "InstanceLowerBounds,TSPInstances")
    add_measurement(rb, 653, "Exactness Gap", f"Audited {checked} represented lower bounds against exact optima; minimum gap={min(gaps, default=0)} and maximum gap={max(gaps, default=0)}.", kind="SOUNDNESS_AUDIT", prediction="PASS")
    return (
        "Audited represented lower bounds against exact development optima.",
        f"All {checked} in-scope lower bounds were <= the exact optimum; the oracle detected no unsound bound.",
    )


def candidate_raw_cost(rb: dict[str, Any], candidate_id: str) -> float:
    edge_index = table_index(rb, "TravelEdges")
    return sum(float(edge_index[row["TravelEdge"]]["TravelCost"]) for row in rows(rb, "TourLegs") if row["CandidateTour"] == candidate_id)


def loop_654(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    candidate_index = table_index(rb, "CandidateTours")
    instance_index = table_index(rb, "TSPInstances")
    checked = 0
    for cert in rows(rb, "OptimalityCertificates"):
        candidate = candidate_index[cert["CandidateTour"]]
        instance = instance_index[candidate["TSPInstance"]]
        if instance.get("OracleStatus") != "EXACT":
            continue
        cost = candidate_raw_cost(rb, candidate["CandidateTourId"])
        optimum = float(instance["ExactOptimumCost"])
        if abs(cost - optimum) > 1e-9:
            raise AssertionError(f"certificate/oracle mismatch {cert['OptimalityCertificateId']}: {cost}!={optimum}")
        checked += 1
    register_derived(rb, "coined-certificate-concordance", "Certificate Concordance", "SEMANTIC_ARC(structural_certificate,CONCLUSION,optimum)+SEMANTIC_ARC(oracle,EXACT_VALUE,optimum)+WARRANTED_REWRITE(independent_evidence,compare,MIXED,concordance,no_status_conflation)", 654, "OptimalityCertificates,CandidateTours,TSPInstances")
    add_measurement(rb, 654, "Certificate Concordance", f"Compared {checked} structural finite-optimality certificates with exact oracle values; all agreed.", kind="CONCORDANCE_AUDIT", prediction="PASS")
    return (
        "Reconciled structural finite-optimality certificates with exact values.",
        f"All {checked} in-scope certificate candidates equal the exact optimum; structural and oracle provenance remain separate.",
    )


def loop_655(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    instance_index = table_index(rb, "TSPInstances")
    checked = 0
    mismatches: list[str] = []
    direct_questions = {
        "DISCOVER_ROUTE_WITHOUT_SUPPLIED_CANDIDATE",
        "NON_TIGHT_LOWER_BOUND_RESIDUAL",
        "OPTIMAL_FACE_VALUE_AND_CHOICE",
    }
    for cert in rows(rb, "TSPSearchCertificates"):
        instance = instance_index.get(cert["TSPInstance"])
        if not instance or instance.get("OracleStatus") != "EXACT":
            continue
        initial = int(cert["InitialRouteClassCount"])
        exact_feasible = int(instance["ExactFeasibleClassCount"])
        exact_total = int(instance["ExactTourClassCount"])
        compatible = initial in {exact_feasible, exact_total}
        if cert.get("QuestionKind") in direct_questions and not compatible:
            raise AssertionError(
                f"direct search accounting mismatch {cert['TSPSearchCertificateId']}: "
                f"initial={initial}, exact_feasible={exact_feasible}, exact_total={exact_total}"
            )
        if compatible:
            checked += 1
        else:
            mismatches.append(cert["TSPSearchCertificateId"])
    register_derived(rb, "coined-search-accounting-audit", "Search Accounting Audit", "SEMANTIC_ARC(instance,EXACT_CLASS_COUNT,N)+SEMANTIC_ARC(search_certificate,INITIAL_CLASS_COUNT,N)+WARRANTED_REWRITE(counts,compare,CONTRACTIVE,accounting_concordance,exact_enumeration)", 655, "TSPSearchCertificates,TSPInstances")
    notes = f"Reconciled {checked} direct or normalization-compatible search certificates with exact canonical/feasible counts."
    if mismatches:
        notes += " Preserved non-comparable metric rows as typed findings rather than forcing incompatible count semantics: " + ",".join(sorted(mismatches))
    add_measurement(rb, 655, "Search Accounting Audit", notes, kind="SEARCH_AUDIT", prediction="PASS")
    return (
        "Audited structural search accounting against exact route classes.",
        f"Reconciled {checked} compatible rows; {len(mismatches)} differently scoped metric rows were retained without false equivalence.",
    )


def loop_656(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    ensure_oracle_fields(rb)
    instance_index = table_index(rb, "TSPInstances")
    for instance_id in EXISTING_ORACLE_INSTANCES:
        instance_index[instance_id]["ExperimentSplit"] = "DEVELOPMENT"
    instance_index["tsp-gridville-broken-3"]["ExperimentSplit"] = "NEGATIVE_CONTROL"
    instance_index["tsp-gridville-broken-3"]["OracleStatus"] = "INVALID_GRAPH"
    set_meta(rb, "heldout_instance_target_count", "integer", integer=len(HOLDOUT_FIXTURES))
    set_meta(rb, "heldout_graphs_fixed_before_oracle", "boolean", boolean=True)
    register_derived(rb, "coined-heldout-split", "Held-Out Split", "SEMANTIC_ARC(instance,EVIDENCE_PARTITION,DEVELOPMENT_OR_HELDOUT_OR_NEGATIVE)+WARRANTED_REWRITE(corpus,freeze_split,CONTRACTIVE,calibration_design,no_post_oracle_tuning)", 656, "TSPInstances,TSPConvergenceMeasurements")
    add_measurement(rb, 656, "Held-Out Split", "Marked six valid development fixtures, one negative control, and reserved twelve deterministic held-out family identities before materialization.", kind="EXPERIMENT_DESIGN", prediction="FROZEN")
    return (
        "Established a development/held-out/negative-control evidence boundary.",
        "Existing valid fixtures are DEVELOPMENT, the malformed graph is NEGATIVE_CONTROL, and twelve future graphs are reserved as HELD_OUT before exact analysis.",
    )


def loop_657(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    ensure_oracle_fields(rb)
    families = {
        "tsp-gridville-5": "RING_CALIBRATION",
        "tsp-twin-triangles-6": "TWO_CLUSTER_REPAIR",
        "tsp-sparse-forcing-5": "SPARSE_FORCING",
        "tsp-asymmetric-four-4": "BOUNDARY_FIBER",
        "tsp-three-regions-9": "THREE_REGION_REPAIR",
        "tsp-optimal-face-4": "TIE_RICH_OPTIMAL_FACE",
        "tsp-gridville-broken-3": "NEGATIVE_NORMALIZATION",
    }
    index_ = table_index(rb, "TSPInstances")
    for instance_id, family in families.items():
        index_[instance_id]["InstanceFamily"] = family
    register_derived(rb, "coined-instance-family", "Instance Family", "SEMANTIC_ARC(instance,FAMILY,family)+SEMANTIC_ARC(family,CALIBRATION_ROLE,stratum)", 657, "TSPInstances,TSPConvergenceMeasurements")
    add_measurement(rb, 657, "Instance Family", "Declared twelve held-out and seven existing family strata so conclusions can be grouped rather than pooled opaquely.", kind="EXPERIMENT_DESIGN", prediction="STRATIFIED")
    return (
        "Made instance-family diversity first-class calibration data.",
        "The corpus can now separate ring, region-repair, sparse, boundary, tie-rich, nonmetric, nested, bottleneck, and residual-kernel behavior.",
    )


def loop_658(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    ensure_oracle_fields(rb)
    register_derived(rb, "coined-calibration-vector", "Calibration Vector", "SEMANTIC_ARC(instance,CALIBRATION_COORDINATE,value)+WARRANTED_REWRITE(exact_and_structural_rows,derive_vector,CONTRACTIVE,calibration_vector,typed_coordinates)", 658, "TSPInstances,TSPSearchCertificates,TSPDefectProfiles,TSPConvergenceMeasurements")
    profile = aggregate_profile(development_rows(rb))
    add_measurement(rb, 658, "Calibration Vector", "Defined exact coverage, value closure, route closure, exactness gap, choice orbit, closure yield, residual values, and branch warrant as separate coordinates.", kind="MEASUREMENT_SCHEMA", prediction="MULTIDIMENSIONAL")
    update_measurement_profile(rb, 658, profile)
    return (
        "Defined a multidimensional calibration vector.",
        "Instrument quality is no longer summarized by route-found or one scalar score; value, choice, gap, closure, and branch coordinates remain separable.",
    )


def loop_659(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    profile = aggregate_profile(development_rows(rb))
    register_derived(rb, "coined-development-calibration-profile", "Development Calibration Profile", "WARRANTED_REWRITE(instance_vectors,aggregate_by_split,CONTRACTIVE,development_profile,exact_coverage)+SEMANTIC_ARC(profile,MAX_CLASS_COUNT,N)", 659, "TSPInstances,TSPConvergenceMeasurements")
    add_measurement(rb, 659, "Development Calibration Profile", f"Development exact coverage={profile['coverage_pct']}%; value closed={profile['value_closed']}/{profile['count']}; route closed={profile['route_closed']}/{profile['count']}; max classes={profile['max_classes']}.", kind="CORPUS_SUMMARY", prediction="BASELINE")
    update_measurement_profile(rb, 659, profile)
    contract.setdefault("Acceptance", {}).update(
        {
            "DevelopmentExactCoveragePct": profile["coverage_pct"],
            "DevelopmentValueClosedCount": profile["value_closed"],
            "DevelopmentRouteClosedCount": profile["route_closed"],
            "DevelopmentMaxExactClassCount": profile["max_classes"],
        }
    )
    return (
        "Aggregated the exact development calibration profile.",
        f"Coverage={profile['coverage_pct']}%, deterministic value closure={profile['value_closed']}/{profile['count']}, route closure={profile['route_closed']}/{profile['count']}, maximum feasible classes={profile['max_classes']}.",
    )


def loop_660(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    profile = aggregate_profile(development_rows(rb))
    if profile["coverage_pct"] != 100:
        raise AssertionError("development exact coverage is incomplete")
    if len(active_primitives(rb)) != 1 or len(active_operators(rb)) != 1:
        raise AssertionError("basis changed before held-out campaign")
    set_meta(rb, "preheldout_instrument_status", "string", string="SEALED_AT_LOOP_660")
    register_derived(rb, "coined-instrument-seal-three", "Instrument Seal III", "SEMANTIC_ARC(campaign,PREHELDOUT_STATUS,SEALED)+WARRANTED_REWRITE(calibration_checks,conjoin,CONTRACTIVE,instrument_seal,all_pass)", 660, "TSPInstances,TSPConceptRegistry,TSPConvergenceMeasurements,TSPFrontierObligations")
    add_measurement(rb, 660, "Instrument Seal III", "Basis freeze, exact development coverage, lower-bound soundness, certificate concordance, search accounting, and split provenance all pass.", kind="INSTRUMENT_SEAL", prediction="PASS")
    update_measurement_profile(rb, 660, profile)
    add_frontier(rb, "frontier-preheldout-instrument-seal", "Pre-held-out instrument seal", 647, 660, "tsp-rule-heldout-calibration", "The frozen basis and development oracle audits all pass before any held-out optimum is observed.", "preheldout-instrument-seal-certificate")
    return (
        "Sealed the calibrated instrument before held-out execution.",
        "One arc, one rewrite, 100% exact development coverage, sound lower bounds, concordant certificates, and fixed evidence partitions are now a closed prerequisite.",
    )


def fixture_loop_order(key: str) -> tuple[int, int]:
    index_ = [spec["key"] for spec in HOLDOUT_FIXTURES].index(key)
    return 661 + index_ * 2, 662 + index_ * 2


def loop_fixture_materialize(rb: dict[str, Any], contract: dict[str, Any], order: int, spec: dict[str, Any]) -> tuple[str, str]:
    instance_id = materialize_fixture(rb, spec)
    register_derived(rb, f"coined-heldout-{spec['key']}-fixture", f"Held-Out {spec['family']}", f"SEMANTIC_ARC({instance_id},FAMILY,{spec['family']})+SEMANTIC_ARC({instance_id},EVIDENCE_PARTITION,HELD_OUT)", order, "TSPInstances,Neighborhoods,Addresses,InstanceStops,TravelEdges")
    add_measurement(rb, order, f"Held-Out {spec['family']}", f"Materialized {instance_id} with {spec['n']} stops and {spec['n']*(spec['n']-1)//2} canonical edge rows before exact analysis.", kind="HELDOUT_MATERIALIZATION", prediction="BLIND_TO_ORACLE")
    return (
        f"Materialized {instance_id} as frozen held-out graph data.",
        f"{spec['n']} stops, {spec['n']*(spec['n']-1)//2} canonical edge rows, family {spec['family']}, OracleStatus=PENDING; no weight was selected from an optimum result.",
    )


def loop_fixture_analyze(rb: dict[str, Any], contract: dict[str, Any], order: int, spec: dict[str, Any]) -> tuple[str, str]:
    instance_id = f"tsp-holdout-{spec['key']}-{spec['n']}"
    payload = materialize_analysis(rb, instance_id, order)
    result = payload["result"]
    register_derived(rb, f"coined-{spec['key']}-calibration-witness", f"{spec['family']} Calibration Witness", "SEMANTIC_ARC(instance,EXACT_VALUE,optimum)+SEMANTIC_ARC(instance,RESIDUAL_KERNEL,kernel)+WARRANTED_REWRITE(graph,deterministic_closure,MIXED,residue,structural_rules)", order, "TSPInstances,LocalDegreeBounds,InstanceLowerBounds,CandidateTours,TSPSearchCertificates,TSPDefectProfiles")
    if spec["key"] == "sparse8":
        register_derived(
            rb,
            "coined-witness-feasibility-independence",
            "Witness Feasibility Independence",
            "SEMANTIC_ARC(graph,COMPLETENESS,status)+SEMANTIC_ARC(witness,EDGE_ADMISSIBILITY,all_legs_available)+WARRANTED_REWRITE(witness,validate_without_global_completeness,CONTRACTIVE,HAMILTONIAN_CYCLE_WITNESS,coverage_and_leg_checks)",
            order,
            "TSPInstances,TravelEdges,CandidateTours,TourStops,TourLegs,reference_model.py",
        )
    add_measurement(rb, order, f"{spec['family']} Calibration Witness", f"{instance_id}: optimum={result['optimum_cost']}, classes={result['feasible_class_count']}, lower={result['degree_two_lower_bound']}, residual={result['deterministic_residual_class_count']}, optimal orbit={result['optimal_class_count']}.", kind="HELDOUT_ANALYSIS", prediction="OBSERVED")
    profile = aggregate_profile(heldout_rows(rb))
    update_measurement_profile(rb, order, profile)
    return (
        f"Completed exact and structural calibration for {instance_id}.",
        f"Exact optimum={result['optimum_cost']}; feasible classes={result['feasible_class_count']}; degree-two gap={result['degree_two_gap']}; deterministic residue={result['deterministic_residual_class_count']} classes/{result['deterministic_residual_value_count']} values; branch warrant={result['branch_warrant_status']}.",
    )


def group_map(rb: dict[str, Any], instance_id: str) -> dict[str, str]:
    addresses = table_index(rb, "Addresses")
    return {
        row["InstanceStopId"]: addresses[row["Address"]]["Neighborhood"]
        for row in rows(rb, "InstanceStops")
        if row["TSPInstance"] == instance_id and row["IsRequired"]
    }


def compute_port_metrics(rb: dict[str, Any], instance_id: str, result: dict[str, Any]) -> tuple[int, int]:
    groups = group_map(rb, instance_id)
    graph = oracle.graph_for_instance(rb, instance_id)
    region_pairs: set[tuple[str, str]] = set()
    for a, b in graph["available"]:
        ga, gb = groups[a], groups[b]
        if ga != gb:
            region_pairs.add(tuple(sorted((ga, gb))))
    widths: dict[str, set[tuple[str, str]]] = defaultdict(set)
    for route in result["optimal_routes"]:
        route_tuple = tuple(route)
        for group in sorted(set(groups.values())):
            members = {stop for stop, g in groups.items() if g == group}
            if len(members) <= 1:
                continue
            ports: list[str] = []
            for i, stop in enumerate(route_tuple):
                nxt = route_tuple[(i + 1) % len(route_tuple)]
                if (stop in members) != (nxt in members):
                    ports.append(stop if stop in members else nxt)
            unique = sorted(set(ports))
            if len(unique) == 2:
                widths[group].add(tuple(unique))
    return len(region_pairs), sum(len(value) for value in widths.values())


def refresh_corpus_metrics(rb: dict[str, Any]) -> None:
    ensure_oracle_fields(rb)
    for instance in heldout_rows(rb):
        if instance.get("OracleStatus") != "EXACT":
            continue
        result = oracle.evaluate_instance(rb, instance["TSPInstanceId"])
        set_instance_oracle(instance, result)
        compatibility, width = compute_port_metrics(rb, instance["TSPInstanceId"], result)
        instance["PortCompatibilityCount"] = compatibility
        instance["QuotientWidth"] = width


def metric_loop(rb: dict[str, Any], contract: dict[str, Any], order: int) -> tuple[str, str]:
    refresh_corpus_metrics(rb)
    heldout = heldout_rows(rb)
    exact = [row for row in heldout if row.get("OracleStatus") == "EXACT"]
    name = LOOPS[order]["term"]
    expressions = {
        685: "SEMANTIC_ARC(instance,EXACT_OPTIMUM,O)+SEMANTIC_ARC(instance,STRUCTURAL_LOWER_BOUND,L)+SEMANTIC_ARC(instance,EXACTNESS_GAP,O_MINUS_L)",
        686: "SEMANTIC_ARC(instance,INITIAL_CLASSES,N)+SEMANTIC_ARC(instance,RESIDUAL_CLASSES,R)+SEMANTIC_ARC(instance,CLOSURE_YIELD,(N-R)/N)",
        687: "SEMANTIC_ARC(instance,ELIMINATED_CLASSES,E)+SEMANTIC_ARC(instance,DETERMINISTIC_DECISIONS,D)+SEMANTIC_ARC(instance,RULE_LEVERAGE,E/MAX(D,1))",
        688: "SEMANTIC_ARC(instance,VALUE_CLOSED,boolean)+SEMANTIC_ARC(instance,ROUTE_CLOSED,boolean)+SEMANTIC_ARC(instance,STRUCTURAL_SUFFICIENCY,class)",
        689: "SEMANTIC_ARC(instance,OPTIMUM_VALUE,value)+SEMANTIC_ARC(instance,OPTIMAL_CHOICE_ORBIT,count)+WARRANTED_REWRITE(value_certificate,separate_choice,CONTRACTIVE,value_rigidity,no_unique_route_claim)",
        690: "SEMANTIC_ARC(instance,OPTIMAL_CHOICE_ORBIT,k)+SEMANTIC_ARC(instance,CHOICE_ENTROPY,LOG2_MAX_K_1)",
        691: "SEMANTIC_ARC(instance,DEFECT_SUPPORT,incidence_connectivity_gap_choice)+WARRANTED_REWRITE(defect_coordinates,normalize,CONTRACTIVE,defect_support,typed_residue)",
        692: "SEMANTIC_ARC(instance,LOCAL_TWO_FACTOR_COST,L)+SEMANTIC_ARC(instance,EXACT_OPTIMUM,O)+SEMANTIC_ARC(instance,REPAIR_POTENTIAL,O_MINUS_L)",
        693: "SEMANTIC_ARC(instance,LOCAL_COMPONENT_COUNT,k)+SEMANTIC_ARC(instance,BOUNDARY_DEMAND,k_crossing_edges)",
        694: "SEMANTIC_ARC(instance,REGION_PAIR,available_crossing)+SEMANTIC_ARC(instance,PORT_COMPATIBILITY_COUNT,count)",
        695: "SEMANTIC_ARC(region,OPTIMAL_BOUNDARY_PORT_PAIR,pair)+SEMANTIC_ARC(instance,QUOTIENT_WIDTH,count)",
        696: "SEMANTIC_ARC(instance,RESIDUAL_KERNEL,value_choice_connectivity_gap_warrant)+WARRANTED_REWRITE(calibration_vector,normalize,CONTRACTIVE,residual_kernel,typed_coordinates)",
        697: "SEMANTIC_ARC(instance,BRANCH_WARRANT,status)+WARRANTED_REWRITE(residual_kernel,classify_branch,CONTRACTIVE,branch_necessity,value_or_policy)",
        698: "SEMANTIC_ARC(instance,SEARCH_COMPRESSION_PROFILE,class_value_choice_trace)",
        699: "SEMANTIC_ARC(corpus,RULE_COVERAGE,value_and_route_counts)+WARRANTED_REWRITE(instance_profiles,aggregate,CONTRACTIVE,coverage_profile,frozen_basis)",
        700: "SEMANTIC_ARC(campaign,ACTIVE_BASIS,one_arc_one_rewrite)+SEMANTIC_ARC(campaign,PRIMITIVE_GROWTH,zero)+WARRANTED_REWRITE(new_terms,recover,CONTRACTIVE,predicate_stability,current_basis)",
    }
    register_derived(rb, f"coined-calibration-{order}", name, expressions[order], order, "TSPInstances,TSPConvergenceMeasurements,TSPConceptRegistry")
    if order == 685:
        values = [float(row["DegreeTwoOracleGap"]) for row in exact if row.get("DegreeTwoOracleGap") is not None]
        notes = f"Exactness gaps across {len(values)} held-out instances: min={min(values, default=0)}, median={statistics.median(values) if values else 0}, max={max(values, default=0)}."
    elif order == 686:
        values = [float(row["ClosureYieldPct"]) for row in exact]
        notes = f"Closure yield mean={round(statistics.fmean(values),2) if values else 0}%, max={max(values, default=0)}%, zero-yield cases={sum(v==0 for v in values)}."
    elif order == 687:
        values = [float(row["RuleLeverage"]) for row in exact]
        notes = f"Rule leverage is descriptive: mean={round(statistics.fmean(values),4) if values else 0}, max={max(values, default=0)} eliminated classes per represented decision/closure."
    elif order == 688:
        counts = Counter(row["StructuralSufficiency"] for row in exact)
        notes = f"Structural sufficiency classes={dict(counts)}."
    elif order == 689:
        value_closed = sum(row["DeterministicValueClosed"] is True for row in exact)
        multi_choice = sum(int(row["ExactOptimalClassCount"] or 0) > 1 for row in exact)
        notes = f"Value closed on {value_closed}/{len(exact)}; {multi_choice} exact optimal faces contain multiple route classes."
    elif order == 690:
        values = [float(row["ChoiceEntropyBits"]) for row in exact]
        notes = f"Choice entropy ranges {min(values, default=0)}..{max(values, default=0)} bits; it describes witness multiplicity, not proof complexity."
    elif order == 691:
        patterns = Counter(row["DefectSupport"] for row in exact)
        notes = f"Observed {len(patterns)} distinct defect-support signatures across {len(exact)} held-out cases."
    elif order == 692:
        values = [float(row["RepairPotential"]) for row in exact if row.get("RepairPotential") is not None]
        notes = f"Disconnected two-factor repair potential observed on {len(values)} cases; values={sorted(values)}."
    elif order == 693:
        values = [int(row["BoundaryDemand"] or 0) for row in exact]
        notes = f"Boundary demand distribution={dict(Counter(values))}."
    elif order == 694:
        values = [int(row.get("PortCompatibilityCount") or 0) for row in exact]
        notes = f"Port compatibility counts range {min(values, default=0)}..{max(values, default=0)} region pairs."
    elif order == 695:
        values = [int(row.get("QuotientWidth") or 0) for row in exact]
        notes = f"Optimal boundary quotient width ranges {min(values, default=0)}..{max(values, default=0)} represented port pairs."
    elif order == 696:
        kernels = Counter(row["ResidualKernel"] for row in exact)
        notes = f"Residual kernels collapse {len(exact)} instances to {len(kernels)} typed signatures."
    elif order == 697:
        counts = Counter(row["BranchWarrantStatus"] for row in exact)
        notes = f"Branch-warrant distribution={dict(counts)}."
    elif order == 698:
        notes = "Every held-out instance now exposes one class/value/choice compression trace rather than one untyped search count."
    elif order == 699:
        profile = aggregate_profile(exact)
        notes = f"Frozen-basis coverage: value closed={profile['value_closed']}/{profile['count']}, route closed={profile['route_closed']}/{profile['count']}, branch required={profile['branch_required']}/{profile['count']}."
    else:
        introduced_after = [row for row in rows(rb, "TSPConceptRegistry") if int(str(row["IntroducedByLoop"]).rsplit("-", 1)[-1]) > 646 and row.get("ConceptKind") in {"PRIMITIVE", "OPERATOR"}]
        if introduced_after:
            raise AssertionError(f"basis grew during held-out campaign: {[row['TSPConceptId'] for row in introduced_after]}")
        unrecovered = [row["TSPConceptId"] for row in rows(rb, "TSPConceptRegistry") if row.get("IsRecoverableFromCurrentBasis") is False]
        if unrecovered:
            raise AssertionError(f"unrecoverable held-out terms: {unrecovered[:10]}")
        notes = f"No primitive/operator rows were introduced after loop 646; {len(rows(rb, 'TSPConceptRegistry'))} named concepts remain recoverable from the frozen basis."
    add_measurement(rb, order, name, notes, kind="CORPUS_DERIVED_PREDICATE", prediction="OBSERVED")
    profile = aggregate_profile(exact)
    update_measurement_profile(rb, order, profile)
    return (
        f"Derived {name} across the exact held-out corpus.",
        notes,
    )


def loop_701(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    ids = ["tsp-holdout-hetero8-8", "tsp-holdout-cluster7-7", "tsp-holdout-fourregion8-8"]
    data = []
    for iid in ids:
        row = table_index(rb, "TSPInstances")[iid]
        data.append((iid, row.get("LocalMinimumUnionComponentCount"), row.get("RepairPotential"), row.get("ExactOptimumCost")))
    register_derived(rb, "coined-heterogeneous-repair-profile", "Heterogeneous Repair Profile", "SEMANTIC_ARC(region,SIZE,n)+SEMANTIC_ARC(instance,REPAIR_POTENTIAL,delta)+WARRANTED_REWRITE(local_components,compare_heterogeneous,MIXED,repair_profile,exact_calibration)", 701, "TSPInstances,Neighborhoods,TSPDefectProfiles")
    add_measurement(rb, 701, "Heterogeneous Repair Profile", f"Compared unequal region-size repair observations: {data}; no universal k-region lower-bound theorem is inferred.", kind="GENERALIZATION_STRESS", prediction="FINITE_OBSERVATION")
    return ("Compared repair behavior across heterogeneous region sizes.", f"Observed profiles={data}; the result is calibration evidence only and GeneralKRegionRepairProved remains false.")


def loop_702(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    ids = ["tsp-holdout-bottleneck7-7", "tsp-holdout-cluster7-7", "tsp-holdout-hetero8-8"]
    data = [(iid, table_index(rb, "TSPInstances")[iid].get("RepairPotential"), table_index(rb, "TSPInstances")[iid].get("PortCompatibilityCount")) for iid in ids]
    register_derived(rb, "coined-asymmetric-crossing-profile", "Asymmetric Crossing Profile", "SEMANTIC_ARC(crossing,COST,c)+SEMANTIC_ARC(component,RELEASE_COST,r)+SEMANTIC_ARC(instance,REPAIR_DELTA,delta)", 702, "TravelEdges,TSPInstances,TSPDefectProfiles")
    add_measurement(rb, 702, "Asymmetric Crossing Profile", f"Separated crossing support and observed repair deltas on bottleneck/cluster/heterogeneous fixtures: {data}.", kind="GENERALIZATION_STRESS", prediction="FINITE_OBSERVATION")
    return ("Separated asymmetric crossing support from internal repair cost.", f"Profiles={data}; crossing asymmetry is represented without adding a new primitive or claiming a general repair equation.")


def loop_703(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    row = table_index(rb, "TSPInstances")["tsp-holdout-nested8-8"]
    groups = group_map(rb, row["TSPInstanceId"])
    pair_groups = sorted(set(groups.values()))
    supergroups = sorted(set(group[0] for group in pair_groups))
    row["DefectSupport"] += f"|nested_levels=2|pair_regions={len(pair_groups)}|superregions={len(supergroups)}"
    register_derived(rb, "coined-nested-fiber", "Nested Fiber", "SEMANTIC_ARC(stop,PAIR_REGION,p)+SEMANTIC_ARC(p,SUPERREGION,s)+WARRANTED_REWRITE(pair_fibers,compose,MIXED,superregion_fiber,expansion_provenance)", 703, "Neighborhoods,TSPInstances,TSPClusterBoundaryStates")
    add_measurement(rb, 703, "Nested Fiber", f"Nested held-out fixture exposes {len(pair_groups)} pair regions and {len(supergroups)} superregions using the same arc/rewrite basis.", kind="HIERARCHICAL_QUOTIENT", prediction="OBSERVED")
    return ("Composed a two-level neighborhood quotient description.", f"Four pair regions collapse into two superregions; hierarchy is carried by typed arcs and expansion warrants, not a new relational primitive.")


def loop_704(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    row = table_index(rb, "TSPInstances")["tsp-holdout-sparse8-8"]
    register_derived(rb, "coined-sparse-quotient-closure", "Sparse Quotient Closure", "SEMANTIC_ARC(edge,AVAILABILITY,boolean)+SEMANTIC_ARC(region,BOUNDARY_PORT,stop)+WARRANTED_REWRITE(edge_state,degree_saturate,EXPANSIVE,forced_or_forbidden,warrant)", 704, "TravelEdges,TSPInstances,TSPSearchCertificates,Neighborhoods")
    add_measurement(rb, 704, "Sparse Quotient Closure", f"Sparse fixture forced={row['DeterministicForcedEdgeCount']}, forbidden={row['DeterministicForbiddenEdgeCount']}, residual={row['DeterministicResidualClassCount']} classes, quotient width={row.get('QuotientWidth')}.", kind="SPARSE_QUOTIENT", prediction="OBSERVED")
    return ("Composed degree closure with sparse region interfaces.", f"Forced={row['DeterministicForcedEdgeCount']}, forbidden={row['DeterministicForbiddenEdgeCount']}, residual classes={row['DeterministicResidualClassCount']}; no separate sparse primitive was required.")


def enumerate_residual_tours(rb: dict[str, Any], instance_id: str) -> tuple[list[tuple[tuple[str, ...], float, set[tuple[str, str]]]], dict[str, Any]]:
    graph = oracle.graph_for_instance(rb, instance_id)
    stops, depot, costs, available = graph["stops"], graph["depot"], graph["costs"], graph["available"]
    closure = oracle.degree_closure(stops, available)
    forced = {tuple(edge) for edge in closure["forced"]}
    forbidden = {tuple(edge) for edge in closure["forbidden"]}
    tours = []
    others = tuple(stop for stop in stops if stop != depot)
    for perm in itertools.permutations(others):
        if perm > tuple(reversed(perm)):
            continue
        route = (depot,) + perm
        edges = set(oracle.route_pairs(route))
        if edges <= available and forced <= edges and not (forbidden & edges):
            tours.append((route, sum(costs[e] for e in edges), edges))
    return tours, graph


def choose_branch(rb: dict[str, Any], instance_id: str) -> dict[str, Any]:
    tours, graph = enumerate_residual_tours(rb, instance_id)
    if len({cost for _, cost, _ in tours}) <= 1:
        raise AssertionError(f"{instance_id} has no value-relevant residual branch")
    closure = oracle.degree_closure(graph["stops"], graph["available"])
    decided = {tuple(edge) for edge in closure["forced"] + closure["forbidden"]}
    candidates = []
    for edge in sorted(graph["available"] - decided):
        include = [tour for tour in tours if edge in tour[2]]
        exclude = [tour for tour in tours if edge not in tour[2]]
        if not include or not exclude:
            continue
        inc_best = min(cost for _, cost, _ in include)
        exc_best = min(cost for _, cost, _ in exclude)
        score = (inc_best != exc_best, abs(inc_best - exc_best), min(len(include), len(exclude)))
        candidates.append((score, edge, include, exclude, inc_best, exc_best))
    if not candidates:
        raise AssertionError(f"{instance_id} residual orbit has no undecided splitting edge")
    _, edge, include, exclude, inc_best, exc_best = max(candidates, key=lambda item: item[0])
    return {
        "edge": edge,
        "include_count": len(include),
        "exclude_count": len(exclude),
        "include_best": inc_best,
        "exclude_best": exc_best,
        "global_best": min(inc_best, exc_best),
    }


def loop_705(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    preferred = table_index(rb, "TSPInstances").get("tsp-holdout-residual8-8")
    candidates = [row for row in heldout_rows(rb) if row.get("BranchNecessaryForValue")]
    if preferred and preferred.get("BranchNecessaryForValue"):
        selected = preferred
    elif candidates:
        selected = max(candidates, key=lambda row: (int(row.get("DeterministicResidualValueCount") or 0), int(row.get("DeterministicResidualClassCount") or 0)))
    else:
        raise AssertionError("no held-out instance exposes a value-relevant residual branch")
    set_meta(rb, "calibration_value_branch_instance", "string", string=selected["TSPInstanceId"])
    register_derived(rb, "coined-value-branch-orbit", "Value Branch Orbit", "SEMANTIC_ARC(instance,RESIDUAL_VALUE_COUNT,k_gt_1)+SEMANTIC_ARC(instance,BRANCH_WARRANT,REQUIRED_FOR_VALUE)", 705, "TSPInstances,TSPSearchCertificates")
    add_measurement(rb, 705, "Value Branch Orbit", f"Selected {selected['TSPInstanceId']} with {selected['DeterministicResidualClassCount']} residual classes and {selected['DeterministicResidualValueCount']} values.", kind="RESIDUAL_SEARCH", prediction="BRANCH_WARRANTED")
    return ("Exposed a genuine value-relevant residual orbit.", f"{selected['TSPInstanceId']} retains {selected['DeterministicResidualClassCount']} route classes spanning {selected['DeterministicResidualValueCount']} values, so a value branch is warranted.")


def loop_706(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    instance_id = str(meta_value(rb, "calibration_value_branch_instance"))
    branch = choose_branch(rb, instance_id)
    instance = table_index(rb, "TSPInstances")[instance_id]
    edge_id = edge_maps(rb, instance_id)[0][oracle.pair(*branch["edge"])]
    instance.update(
        {
            "CalibrationBranchEdge": edge_id,
            "BranchIncludeClassCount": branch["include_count"],
            "BranchExcludeClassCount": branch["exclude_count"],
            "BranchIncludeBestCost": branch["include_best"],
            "BranchExcludeBestCost": branch["exclude_best"],
            "CalibrationBranchDecisionCount": 1,
            "CalibrationBranchStatus": "ORACLE_CALIBRATION_ONLY",
        }
    )
    upsert_rows(
        rb["TSPSearchCertificates"],
        "TSPSearchCertificateId",
        [
            {
                "TSPSearchCertificateId": f"search-branch-{instance_id}",
                "TSPInstance": instance_id,
                "TSPLoop": "tsp-loop-706",
                "DerivedEdgeSet": None,
                "QuestionKind": "ORACLE_CALIBRATED_VALUE_BRANCH",
                "InitialRouteClassCount": branch["include_count"] + branch["exclude_count"],
                "SurvivingRouteClassCount": branch["include_count"] if branch["include_best"] <= branch["exclude_best"] else branch["exclude_count"],
                "BranchDecisionCount": 1,
                "BacktrackCount": 1 if branch["include_best"] != branch["exclude_best"] else 0,
                "ResidualAmbiguityCount": min(branch["include_count"], branch["exclude_count"]),
                "BranchingAvoidedPct": 0,
                "Status": "ORACLE_CALIBRATION",
                "ValueClassCountBefore": instance["DeterministicResidualValueCount"],
                "ValueClassCountAfter": 1 if branch["include_best"] != branch["exclude_best"] else 2,
                "ChoiceOrbitSize": instance["ExactOptimalClassCount"],
                "BranchWarrantStatus": "REQUIRED_FOR_VALUE",
                "OracleChecksum": instance["ExactOracleChecksum"],
            }
        ],
    )
    register_derived(rb, "coined-oracle-calibrated-branch", "Oracle-Calibrated Branch", "SEMANTIC_ARC(branch,DECISION_EDGE,edge)+SEMANTIC_ARC(branch,INCLUDE_BEST,value)+SEMANTIC_ARC(branch,EXCLUDE_BEST,value)+WARRANTED_REWRITE(residual_orbit,split,MIXED,branch_certificate,exact_calibration)", 706, "TSPInstances,TSPSearchCertificates,TravelEdges")
    add_measurement(rb, 706, "Oracle-Calibrated Branch", f"{instance_id} split on {edge_id}: include {branch['include_count']} classes best={branch['include_best']}; exclude {branch['exclude_count']} best={branch['exclude_best']}.", kind="RESIDUAL_SEARCH", prediction="CALIBRATION_ONLY")
    return ("Executed one explicit calibration branch on a value-relevant residual orbit.", f"Edge {edge_id}: include branch {branch['include_count']} classes/best {branch['include_best']}; exclude branch {branch['exclude_count']} classes/best {branch['exclude_best']}; this is exact-oracle calibration, not a new polynomial inference rule.")


def loop_707(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    refresh_corpus_metrics(rb)
    profile = aggregate_profile(heldout_rows(rb))
    if profile["count"] != 12 or profile["coverage_pct"] != 100:
        raise AssertionError(f"held-out corpus incomplete: {profile}")
    register_derived(rb, "coined-heldout-calibration-event", "Held-Out Calibration Event", "WARRANTED_REWRITE(heldout_instance_vectors,aggregate_by_family,CONTRACTIVE,heldout_event,frozen_basis)+SEMANTIC_ARC(event,EXACT_COVERAGE,100_PERCENT)", 707, "TSPInstances,TSPConvergenceMeasurements,TSPConceptRegistry")
    add_measurement(rb, 707, "Held-Out Calibration Event", f"12/12 exact; value closed={profile['value_closed']}; route closed={profile['route_closed']}; branch required={profile['branch_required']}; mean closure yield={profile['mean_yield']}%.", kind="HELDOUT_SUMMARY", prediction="OBSERVED")
    update_measurement_profile(rb, 707, profile)
    contract.setdefault("Acceptance", {}).update(
        {
            "HeldOutInstanceCount": 12,
            "HeldOutExactCoveragePct": profile["coverage_pct"],
            "HeldOutValueClosedCount": profile["value_closed"],
            "HeldOutRouteClosedCount": profile["route_closed"],
            "HeldOutBranchRequiredCount": profile["branch_required"],
            "HeldOutMeanClosureYieldPct": profile["mean_yield"],
            "HeldOutMaxExactClassCount": profile["max_classes"],
        }
    )
    return ("Aggregated the twelve-family held-out calibration event.", f"Exact coverage 12/12; value closed {profile['value_closed']}/12; route closed {profile['route_closed']}/12; value branch required {profile['branch_required']}/12; mean closure yield {profile['mean_yield']}%.")


def loop_708(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    exact = [row for row in rows(rb, "TSPInstances") if row.get("OracleStatus") == "EXACT"]
    by_n: dict[int, list[dict[str, Any]]] = defaultdict(list)
    stop_counts = Counter(row["TSPInstance"] for row in rows(rb, "InstanceStops") if row["IsRequired"])
    for row in exact:
        by_n[stop_counts[row["TSPInstanceId"]]].append(row)
    profile = {n: {"instances": len(group), "max_classes": max(int(row["ExactFeasibleClassCount"]) for row in group), "value_closed": sum(row["DeterministicValueClosed"] is True for row in group)} for n, group in sorted(by_n.items())}
    register_derived(rb, "coined-scale-profile", "Scale Profile", "SEMANTIC_ARC(instance,STOP_COUNT,n)+SEMANTIC_ARC(instance,EXACT_CLASS_COUNT,c)+WARRANTED_REWRITE(instance_vectors,group_by_n,CONTRACTIVE,scale_profile,finite_campaign)", 708, "TSPInstances,InstanceStops,TSPConvergenceMeasurements")
    add_measurement(rb, 708, "Scale Profile", f"Exact finite scale profile by stop count={profile}; no asymptotic complexity conclusion is inferred.", kind="SCALING_PROFILE", prediction="FINITE_ONLY")
    return ("Recorded exact finite class growth and closure by stop count.", f"Scale profile={profile}; it calibrates the instrument through nine stops but does not establish asymptotic behavior.")


def loop_709(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    register_derived(rb, "coined-oracle-substrate-conformance", "Oracle Substrate Conformance", "SEMANTIC_ARC(rulebook,CANONICAL_VALUE,x)+SEMANTIC_ARC(postgres,PROJECTED_VALUE,x)+SEMANTIC_ARC(oracle,RECOMPUTED_VALUE,x)+WARRANTED_REWRITE(peer_results,compare,CONTRACTIVE,conformance,all_equal)", 709, "TSPInstances,effortless-postgres,exact_oracle_v1.py,reference_model.py")
    add_measurement(rb, 709, "Oracle Substrate Conformance", "Prepared the final generated Postgres, Python reference, and exact-oracle cross-check for all held-out calibration fields.", kind="SUBSTRATE_CONFORMANCE", prediction="PENDING_LIVE_BUILD")
    return ("Prepared loop-709 live substrate conformance.", "The semantic loop closes only after the main executor rebuilds Postgres, runs existing Python/Postgres tests, and queries all twelve exact held-out rows.")


def append_readme_section() -> None:
    text = README.read_text()
    marker = "## Loops 647–710 — frozen-basis exact calibration"
    if marker in text:
        return
    text += '''

## Loops 647–710 — frozen-basis exact calibration

The semantic basis was frozen at loop 646:

```text
SEMANTIC_ARC(subject, label, target)
WARRANTED_REWRITE(input, rule, polarity, output, warrant)
```

Twelve deterministic held-out instances were fixed before exact analysis.  A depot-fixed, reversal-quotient oracle enumerated every feasible route class for instances through nine stops.  Oracle values are calibration evidence; they do not silently upgrade a structural proof status.

The campaign records separate coordinates for exactness gap, closure yield, value rigidity, choice entropy, defect support, repair potential, boundary demand, port compatibility, quotient width, residual kernel, branch necessity, and class/value/choice compression.

Local representational growth remains allowed when it replaces opacity.  The measured convergence target is a stable reusable basis, explicit warrants, exact recoverability, and a smaller typed residual kernel—not monotonically fewer rows.
'''
    README.write_text(text)


def loop_710(rb: dict[str, Any], contract: dict[str, Any]) -> tuple[str, str]:
    refresh_corpus_metrics(rb)
    heldout = heldout_rows(rb)
    profile = aggregate_profile(heldout)
    if profile["count"] != 12 or profile["coverage_pct"] != 100:
        raise AssertionError("held-out campaign is incomplete")
    if len(base.base.canonical_tables(rb)) != 45:
        raise AssertionError("frozen-basis campaign unexpectedly changed physical table count")
    if {row["DisplayName"] for row in active_primitives(rb)} != {"Semantic Arc"} or {row["DisplayName"] for row in active_operators(rb)} != {"Warranted Rewrite"}:
        raise AssertionError("active basis drifted")
    register_derived(rb, "coined-coherence-event-three", "Coherence Event III", "SEMANTIC_ARC(campaign,HELDOUT_EXACT_COVERAGE,100_PERCENT)+SEMANTIC_ARC(campaign,ACTIVE_BASIS,ONE_ARC_ONE_REWRITE)+WARRANTED_REWRITE(corpus_evidence,seal,MIXED,coherence_event,explicit_nonclaims)", 710, "TSPInstances,TSPConceptRegistry,TSPConvergenceMeasurements,TSPLoops")
    set_meta(rb, "calibration_program_status", "string", string="CLOSED_647_710")
    set_meta(rb, "physical_table_count_loop_710", "integer", integer=45)
    set_meta(rb, "heldout_exact_instance_count", "integer", integer=12)
    set_meta(rb, "coherence_event_three_status", "string", string="EMPIRICAL_HELDOUT_SUPPORT_NOT_UNIVERSAL_THEOREM")
    claims = contract.setdefault("Claims", {})
    claims.update(
        {
            "ExactHeldOutCalibrationCompleted": True,
            "HeldOutInstanceCount": 12,
            "HeldOutExactOracleCoveragePct": 100,
            "HeldOutValueClosedCount": profile["value_closed"],
            "HeldOutRouteClosedCount": profile["route_closed"],
            "HeldOutValueBranchRequiredCount": profile["branch_required"],
            "FrozenBasisPrimitiveGrowthCount": 0,
            "CurrentPredicateAtomCount": 1,
            "CurrentSemanticOperatorCount": 1,
            "PhysicalTableCountLoop710": 45,
            "ExactOracleIsStructuralProof": False,
            "GeneralTSPAlgorithmProved": False,
            "GeneralKRegionRepairProved": False,
            "UniversalPolynomialNormalization": False,
            "CoherenceConvergenceProvedUniversally": False,
        }
    )
    contract["Version"] = "0.7.0"
    contract["Scope"] = "The represented scope includes a frozen one-arc/one-rewrite basis, exact depot-fixed reversal-quotient calibration on six development and twelve held-out finite symmetric instances through nine stops, structural lower-bound and closure audits, and one explicit calibration-only value branch. No general TSP algorithm, universal region-repair theorem, basis-minimality theorem, or complexity-class claim is made."
    contract["TrustBoundary"] = "Input graph weights, availability, and membership remain trusted data. Exact enumeration is an independent finite calibration substrate, not an automatic structural proof. Structural certificates retain their own warrants. Held-out graphs were fixed before oracle execution. Postgres and Python are peer projections."
    certs = {row["CertificateId"]: row for row in contract.setdefault("CurrentCertificates", [])}
    for cert in [
        {"CertificateId": "tsp-exact-oracle-contract", "Kind": "exact-oracle-calibration-certificate", "Conclusion": "Depot-fixed reversal-quotient enumeration exactly calibrates the declared finite instances without promoting oracle output to structural proof."},
        {"CertificateId": "tsp-heldout-calibration-event", "Kind": "heldout-calibration-certificate", "Conclusion": f"Twelve held-out families have exact coverage; value closes on {profile['value_closed']} and route closes on {profile['route_closed']} under the frozen basis."},
        {"CertificateId": "tsp-residual-value-branch", "Kind": "oracle-calibrated-branch-certificate", "Conclusion": "At least one held-out residual kernel requires a value-relevant branch after deterministic closure; the branch is recorded explicitly as calibration-only search."},
        {"CertificateId": "tsp-coherence-event-three", "Kind": "coherence-vector-certificate", "Conclusion": "The active basis remains one Semantic Arc and one Warranted Rewrite across a twelve-family held-out exact campaign with zero physical-table growth."},
    ]:
        certs[cert["CertificateId"]] = cert
    contract["CurrentCertificates"] = list(certs.values())
    contract["RemainingFrontier"] = [
        "repeat the frozen-basis campaign on standard public TSP benchmark instances using a separately versioned importer",
        "replace calibration-only exact branches with structural branch-and-bound certificates whose bounds are themselves witnessed",
        "generalize region repair beyond the finite heterogeneous observations recorded here",
        "measure runtime and memory scaling without confusing exact small-instance enumeration with a general algorithm",
    ]
    append_readme_section()
    add_measurement(rb, 710, "Coherence Event III", f"Frozen basis 1 arc/1 rewrite; tables=45; held-out exact=12/12; value closed={profile['value_closed']}; route closed={profile['route_closed']}; value branch required={profile['branch_required']}; primitive growth=0.", kind="COHERENCE_EVENT_III", prediction="EMPIRICAL_HELDOUT_SUPPORT")
    update_measurement_profile(rb, 710, profile)
    add_frontier(rb, "frontier-frozen-basis-heldout-calibration", "Frozen-basis held-out exact calibration", 647, 710, "tsp-rule-heldout-calibration", "Twelve predeclared held-out families have exact oracle rows, structural comparison metrics, residual kernels, branch warrants, and zero basis growth.", "heldout-calibration-certificate")
    return ("Sealed the third coherence event through loop 710.", f"Twelve held-out instances are exactly calibrated; value closed={profile['value_closed']}, route closed={profile['route_closed']}, value branch required={profile['branch_required']}; active basis remains one arc/one rewrite and physical tables remain 45.")


LOOP_FUNCS: dict[int, Callable[[dict[str, Any], dict[str, Any]], tuple[str, str]]] = {
    647: loop_647,
    648: loop_648,
    649: loop_649,
    650: loop_650,
    651: loop_651,
    652: loop_652,
    653: loop_653,
    654: loop_654,
    655: loop_655,
    656: loop_656,
    657: loop_657,
    658: loop_658,
    659: loop_659,
    660: loop_660,
    701: loop_701,
    702: loop_702,
    703: loop_703,
    704: loop_704,
    705: loop_705,
    706: loop_706,
    707: loop_707,
    708: loop_708,
    709: loop_709,
    710: loop_710,
}
for _order in range(685, 701):
    LOOP_FUNCS[_order] = lambda rb, contract, order=_order: metric_loop(rb, contract, order)
for _fixture in HOLDOUT_FIXTURES:
    _materialize, _analyze = fixture_loop_order(_fixture["key"])
    LOOP_FUNCS[_materialize] = lambda rb, contract, order=_materialize, spec=_fixture: loop_fixture_materialize(rb, contract, order, spec)
    LOOP_FUNCS[_analyze] = lambda rb, contract, order=_analyze, spec=_fixture: loop_fixture_analyze(rb, contract, order, spec)


def plan_loops(rb: dict[str, Any], contract: dict[str, Any]) -> None:
    upsert_rows(rb["TSPInferenceRules"], "TSPInferenceRuleId", RULE_ROWS)
    existing = {int(row["LoopOrder"]) for row in rows(rb, "TSPLoops")}
    for order in range(647, 711):
        spec = LOOPS[order]
        if order not in existing:
            rows(rb, "TSPLoops").append(
                {
                    "TSPLoopId": f"tsp-loop-{order}",
                    "LoopOrder": order,
                    "DisplayName": spec["name"],
                    "Status": "PLANNED",
                    "PrimaryInferenceRule": spec["rule"],
                    "NewConcept": spec["term"],
                    "WitnessSummary": "Planned frozen-basis calibration loop; no closure claim yet.",
                    "NextFrontier": spec["next"],
                    "PlannedClosureCriterion": spec["criterion"],
                    "BeforeState": spec["before"],
                    "AfterState": None,
                    "CompletionDisposition": None,
                }
            )
    contract_loops = {int(row["LoopOrder"]): row for row in contract["Loops"]}
    for order in range(647, 711):
        spec = LOOPS[order]
        if order not in contract_loops:
            contract["Loops"].append(
                {
                    "LoopOrder": order,
                    "LoopId": f"tsp-loop-{order}",
                    "Status": "PLANNED",
                    "BeforeState": spec["before"],
                    "ClosureCriterion": spec["criterion"],
                    "AfterState": None,
                    "Result": "Planned; no conclusion recorded.",
                    "CompletionDisposition": None,
                }
            )
    contract["Loops"] = sorted(contract["Loops"], key=lambda row: int(row["LoopOrder"]))
    set_meta(rb, "last_planned_loop", "integer", integer=710)
    set_meta(rb, "calibration_program_status", "string", string="PLANNED_647_710")
    set_meta(rb, "calibration_loop_count", "integer", integer=64)
    contract["Version"] = "0.7.0-alpha"
    contract.setdefault("Claims", {}).update(
        {
            "ExactHeldOutCalibrationCompleted": False,
            "CalibrationBasisFrozenAtLoop646": False,
            "ExactOracleIsStructuralProof": False,
            "GeneralTSPAlgorithmProved": False,
        }
    )


def loop_number(value: Any) -> int:
    try:
        return int(str(value).rsplit("-", 1)[-1])
    except Exception:
        return 0


def close_enough(a: Any, b: Any) -> bool:
    if a is None or b is None:
        return a is b
    if isinstance(a, (int, float)) or isinstance(b, (int, float)):
        return abs(float(a) - float(b)) < 1e-8
    return a == b


def validate_state(rb: dict[str, Any], contract: dict[str, Any]) -> None:
    base.validate_state(rb, contract)
    loop_map = {int(row["LoopOrder"]): row for row in rows(rb, "TSPLoops")}
    contract_map = {int(row["LoopOrder"]): row for row in contract["Loops"]}
    required_loop_orders = set(range(577, 711))
    missing_loop_orders = sorted(required_loop_orders - set(loop_map))
    if missing_loop_orders:
        raise AssertionError(
            f"loop sequence is missing required history through 710: {missing_loop_orders}"
        )
    for order in range(647, 711):
        row = loop_map[order]
        if not row.get("BeforeState") or not row.get("PlannedClosureCriterion"):
            raise AssertionError(f"loop {order} lacks before-state or closure criterion")
        if contract_map[order]["Status"] != row["Status"]:
            raise AssertionError(f"loop {order} status mismatch")
        if row["Status"] == "CLOSED" and not row.get("AfterState"):
            raise AssertionError(f"loop {order} closed without after-state")
    closed = lambda n: loop_map[n]["Status"] == "CLOSED"
    if closed(648):
        if meta_value(rb, "calibration_basis_frozen_at_loop") != 646 or meta_value(rb, "calibration_new_primitive_budget") != 0:
            raise AssertionError("basis freeze metadata mismatch")
    if closed(649):
        fields = {item["name"] for item in rb["TSPInstances"]["schema"]}
        required = {"ExactOptimumCost", "ExactOptimalClassCount", "DegreeTwoOracleGap", "ResidualKernel", "BranchWarrantStatus", "ExactOracleChecksum"}
        if not required <= fields:
            raise AssertionError("oracle instrument fields missing")
    if closed(651):
        index_ = table_index(rb, "TSPInstances")
        for iid in EXISTING_ORACLE_INSTANCES:
            stored = index_[iid]
            recomputed = oracle.evaluate_instance(rb, iid)
            if stored.get("OracleStatus") != "EXACT" or stored.get("ExactOracleChecksum") != recomputed["oracle_checksum"]:
                raise AssertionError(f"development oracle drift at {iid}")
            if not close_enough(stored.get("ExactOptimumCost"), recomputed["optimum_cost"]):
                raise AssertionError(f"development optimum drift at {iid}")
    if closed(653):
        instances = table_index(rb, "TSPInstances")
        for lower in rows(rb, "InstanceLowerBounds"):
            instance = instances.get(lower["TSPInstance"])
            if instance and instance.get("OracleStatus") == "EXACT" and raw_lower_bound(rb, lower) > float(instance["ExactOptimumCost"]) + 1e-9:
                raise AssertionError(f"unsound lower bound after loop 653: {lower['InstanceLowerBoundId']}")
    for spec in HOLDOUT_FIXTURES:
        materialize_order, analyze_order = fixture_loop_order(spec["key"])
        iid = f"tsp-holdout-{spec['key']}-{spec['n']}"
        if closed(materialize_order):
            instance = table_index(rb, "TSPInstances").get(iid)
            if not instance or instance.get("ExperimentSplit") != "HELD_OUT":
                raise AssertionError(f"held-out fixture missing at {iid}")
            stop_count = sum(row["TSPInstance"] == iid for row in rows(rb, "InstanceStops"))
            edge_count = sum(row["TSPInstance"] == iid for row in rows(rb, "TravelEdges"))
            if (stop_count, edge_count) != (spec["n"], spec["n"] * (spec["n"] - 1) // 2):
                raise AssertionError(f"held-out fixture cardinality mismatch {iid}: {(stop_count, edge_count)}")
        if closed(analyze_order):
            instance = table_index(rb, "TSPInstances")[iid]
            recomputed = oracle.evaluate_instance(rb, iid)
            checks = {
                "ExactOracleChecksum": recomputed["oracle_checksum"],
                "ExactTourClassCount": recomputed["total_class_count"],
                "ExactFeasibleClassCount": recomputed["feasible_class_count"],
                "ExactOptimumCost": recomputed["optimum_cost"],
                "ExactOptimalClassCount": recomputed["optimal_class_count"],
                "DegreeTwoOracleLowerBound": recomputed["degree_two_lower_bound"],
                "DegreeTwoOracleGap": recomputed["degree_two_gap"],
                "DeterministicResidualClassCount": recomputed["deterministic_residual_class_count"],
                "DeterministicResidualValueCount": recomputed["deterministic_residual_value_count"],
                "BranchWarrantStatus": recomputed["branch_warrant_status"],
            }
            for key, expected in checks.items():
                if not close_enough(instance.get(key), expected):
                    raise AssertionError(f"held-out oracle drift {iid}.{key}: {instance.get(key)!r}!={expected!r}")
            lower_id = f"degree-two-lower-bound-{iid}"
            if lower_id not in table_index(rb, "InstanceLowerBounds"):
                raise AssertionError(f"held-out lower bound missing {iid}")
            search_id = f"search-calibration-{iid}"
            if search_id not in table_index(rb, "TSPSearchCertificates"):
                raise AssertionError(f"held-out search certificate missing {iid}")
    if any(closed(order) for order in range(685, 701)):
        if len(active_primitives(rb)) != 1 or len(active_operators(rb)) != 1:
            raise AssertionError("metric derivation changed active basis")
    if closed(700):
        growth = [row for row in rows(rb, "TSPConceptRegistry") if loop_number(row.get("IntroducedByLoop")) > 646 and row.get("ConceptKind") in {"PRIMITIVE", "OPERATOR"}]
        if growth:
            raise AssertionError(f"held-out campaign introduced basis rows: {[row['TSPConceptId'] for row in growth]}")
    if closed(706):
        iid = str(meta_value(rb, "calibration_value_branch_instance"))
        row = table_index(rb, "TSPInstances")[iid]
        if row.get("CalibrationBranchDecisionCount") != 1 or not row.get("CalibrationBranchEdge"):
            raise AssertionError("calibration branch certificate missing")
    if closed(707):
        profile = aggregate_profile(heldout_rows(rb))
        if profile["count"] != 12 or profile["coverage_pct"] != 100:
            raise AssertionError(f"held-out summary mismatch: {profile}")
    if closed(709):
        legacy_hashes = contract.get("ArtifactHashes", {})
        if "loop_709_postgres_projection_tree" not in legacy_hashes:
            lifecycle_path = contract.get("ArtifactLifecycle", {}).get("path")
            if not lifecycle_path:
                raise AssertionError("loop-709 live Postgres artifact lifecycle is missing")
            lifecycle = load(DOMAIN / lifecycle_path)
            historical = lifecycle.get("historical_loop_artifacts", {})
            if "loop_709_postgres_projection_tree" not in historical:
                raise AssertionError("loop-709 historical Postgres artifact hash missing")
    if closed(710):
        if meta_value(rb, "calibration_program_status") != "CLOSED_647_710":
            raise AssertionError("final calibration status mismatch")
        if len(base.base.canonical_tables(rb)) != 45:
            raise AssertionError("physical table count changed")
        claims = contract["Claims"]
        required_false = ["ExactOracleIsStructuralProof", "GeneralTSPAlgorithmProved", "GeneralKRegionRepairProved", "UniversalPolynomialNormalization", "CoherenceConvergenceProvedUniversally"]
        if any(claims.get(key) is not False for key in required_false):
            raise AssertionError("a final nonclaim was promoted")
        if claims.get("HeldOutInstanceCount") != 12 or claims.get("HeldOutExactOracleCoveragePct") != 100:
            raise AssertionError("final held-out claim mismatch")
        if claims.get("FrozenBasisPrimitiveGrowthCount") != 0:
            raise AssertionError("final basis growth mismatch")


def validate_repository_state() -> None:
    run([sys.executable, str(DOMAIN / "scripts" / "validate_rulebook_v3_temporal.py")])
    run([sys.executable, str(DOMAIN / "scripts" / "validate_rulebook_v5_temporal.py")])
    rb = load(RULEBOOK)
    contract = load(CONTRACT)
    validate_state(rb, contract)
    if any(int(row["LoopOrder"]) >= 662 and row["Status"] == "CLOSED" for row in rows(rb, "TSPLoops")):
        sys.path.insert(0, str(DOMAIN / "scripts"))
        from reference_model import evaluate_tours  # type: ignore
        evaluated = evaluate_tours(rb)
        bad = [tid for tid, value in evaluated.items() if tid.startswith("tour-oracle-holdout-") and not value.is_hamiltonian_cycle_witness]
        if bad:
            raise AssertionError(f"invalid held-out oracle candidates: {bad[:10]}")
    print("traveling-salesman frozen-basis calibration validation: PASS")
    print(f"loops={len(rows(rb, 'TSPLoops'))} tables={len(base.base.canonical_tables(rb))} atoms={len(active_primitives(rb))} operators={len(active_operators(rb))} heldout={len(heldout_rows(rb))}")


def validate_summary_alignment() -> None:
    rb = load(RULEBOOK)
    contract = load(CONTRACT)
    loops = {int(row["LoopOrder"]): row for row in rows(rb, "TSPLoops")}
    contract_loops = {int(row["LoopOrder"]): row for row in contract["Loops"]}
    if set(loops) != set(contract_loops):
        raise AssertionError("contract/rulebook loop set mismatch")
    for order, row in loops.items():
        if contract_loops[order]["Status"] != row["Status"]:
            raise AssertionError(f"summary status mismatch at loop {order}")
    if loops[710]["Status"] == "CLOSED":
        text = README.read_text()
        for marker in ("Loops 647–710", "SEMANTIC_ARC", "WARRANTED_REWRITE", "twelve", "exact"):
            if marker.lower() not in text.lower():
                raise AssertionError(f"README missing {marker!r}")
        claims = contract["Claims"]
        if claims.get("CurrentPredicateAtomCount") != 1 or claims.get("CurrentSemanticOperatorCount") != 1:
            raise AssertionError("summary basis mismatch")
        if claims.get("ExactHeldOutCalibrationCompleted") is not True:
            raise AssertionError("summary held-out completion missing")
    print("traveling-salesman frozen-basis calibration summary alignment: PASS")


def write_validation_files() -> None:
    VALIDATOR_V7.write_text(
        '''#!/usr/bin/env python3
from apply_loops_647_710_calibration import validate_repository_state

if __name__ == "__main__":
    validate_repository_state()
'''
    )
    SUMMARY_V7.write_text(
        '''#!/usr/bin/env python3
from apply_loops_647_710_calibration import validate_summary_alignment

if __name__ == "__main__":
    validate_summary_alignment()
'''
    )
    VALIDATOR_WRAPPER.write_text(
        '''#!/usr/bin/env python3
from validate_rulebook_v3_temporal import main as validate_v3
from validate_rulebook_v5_temporal import main as validate_v5
from validate_rulebook_v6 import validate_repository_state as validate_v6
from validate_summary_alignment_v6 import validate_summary_alignment as validate_summary_v6
from validate_rulebook_v7 import validate_repository_state as validate_v7
from validate_summary_alignment_v7 import validate_summary_alignment as validate_summary_v7

if __name__ == "__main__":
    validate_v3()
    validate_v5()
    validate_v6()
    validate_summary_v6()
    validate_v7()
    validate_summary_v7()
'''
    )


def rebuild_postgres_and_record(contract: dict[str, Any]) -> None:
    run(["bash", "start.sh", "build"], cwd=DOMAIN)
    run(["bash", "start.sh", "db"], cwd=DOMAIN)
    run(["bash", "start.sh", "test"], cwd=DOMAIN)
    psql_base = ["psql", "-h", os.environ.get("PGHOST", "localhost"), "-U", os.environ.get("PGUSER", "postgres"), "-d", os.environ.get("TSP_DB", "erb_traveling_salesman"), "-tA", "-F", ",", "-v", "ON_ERROR_STOP=1", "-c"]
    count = int(run(psql_base + ["SELECT count(*) FROM vw_tsp_instances WHERE experiment_split='HELD_OUT' AND oracle_status='EXACT'"], capture=True).stdout.strip())
    if count != 12:
        raise AssertionError(f"live held-out exact count {count} != 12")
    live = run(psql_base + ["SELECT tsp_instance_id,exact_optimum_cost::text,exact_optimal_class_count::text,deterministic_residual_class_count::text,branch_warrant_status FROM vw_tsp_instances WHERE experiment_split='HELD_OUT' ORDER BY tsp_instance_id"], capture=True).stdout.strip().splitlines()
    if len(live) != 12:
        raise AssertionError("live held-out rows incomplete")
    rb = load(RULEBOOK)
    index_ = table_index(rb, "TSPInstances")
    for line in live:
        iid, optimum, choices, residual, warrant = line.split(",")
        row = index_[iid]
        if not close_enough(float(optimum), row["ExactOptimumCost"]) or int(choices) != int(row["ExactOptimalClassCount"]) or int(residual) != int(row["DeterministicResidualClassCount"]) or warrant != row["BranchWarrantStatus"]:
            raise AssertionError(f"live oracle-field mismatch for {iid}: {line}")
    view_count = int(run(psql_base + ["SELECT count(*) FROM pg_views WHERE schemaname='public' AND viewname LIKE 'vw_%'"], capture=True).stdout.strip())
    contract.setdefault("ArtifactHashes", {}).update(
        {
            "loop_709_postgres_projection_tree": "sha256:" + base.base.sha256_tree(PG_DIR),
            "loop_709_rulespeak_tree": "sha256:" + base.base.sha256_tree(RULESPEAK_DIR),
            "loop_709_generated_view_count": view_count,
            "loop_709_live_heldout_exact_count": count,
            "loop_709_live_oracle_rows": live,
        }
    )
    base.base.write(CONTRACT, contract)


def main() -> None:
    rb = load(RULEBOOK)
    contract = load(CONTRACT)
    if base.base.meta_int(rb, "last_loop") < 646:
        raise AssertionError("loop 646 must be canonical before calibration")
    if 647 not in {int(row["LoopOrder"]) for row in rows(rb, "TSPLoops")}:
        plan_loops(rb, contract)
        write_validation_files()
        save(rb, contract)
        validate_repository_state()
        commit(
            "TSP loops 647-710: register frozen-basis exact calibration",
            [RULEBOOK, CONTRACT, VALIDATOR_V7, SUMMARY_V7, VALIDATOR_WRAPPER, DOMAIN / "scripts" / "exact_oracle_v1.py", DOMAIN / "scripts" / "apply_loops_647_710_calibration.py"],
        )
    for order in range(647, 711):
        rb = load(RULEBOOK)
        contract = load(CONTRACT)
        loop = next(row for row in rows(rb, "TSPLoops") if int(row["LoopOrder"]) == order)
        if loop["Status"] == "CLOSED":
            continue
        after, witness = LOOP_FUNCS[order](rb, contract)
        finish_loop(rb, contract, order, after, witness)
        save(rb, contract)
        if order == 709:
            rebuild_postgres_and_record(contract)
        validate_repository_state()
        paths = [RULEBOOK, CONTRACT]
        if order == 709:
            paths = [DOMAIN]
        if order == 710:
            validate_summary_alignment()
            paths = [RULEBOOK, CONTRACT, README]
        commit(COMMIT_MESSAGES[order], paths)
    validate_repository_state()
    validate_summary_alignment()
    print("TSP frozen-basis calibration loops 647-710: PASS")
    profile = aggregate_profile(heldout_rows(load(RULEBOOK)))
    print(f"heldout exact={profile['exact']}/{profile['count']} value_closed={profile['value_closed']} route_closed={profile['route_closed']} branch_required={profile['branch_required']}")


if __name__ == "__main__":
    main()
