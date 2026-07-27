#!/usr/bin/env python3
"""Reconcile TSP contract projections from canonical rulebook and evidence.

This script updates only mechanically derivable summaries and evidence-status
boundaries. It never edits the canonical rulebook and never promotes a provider
result into canonical mathematical truth.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
DOMAIN = HERE.parent
REPO = DOMAIN.parents[3]
RULEBOOK = DOMAIN / "effortless-rulebook" / "traveling-salesman-rulebook.json"
CONTRACT = DOMAIN / "problem-contract.json"
CAMPAIGN_STATUS = DOMAIN / "testing" / "campaign-713-812" / "status.json"
CAMPAIGN_AGGREGATE = DOMAIN / "testing" / "campaign-713-812" / "aggregate.json"
CAMPAIGN_POSTGRES = DOMAIN / "testing" / "campaign-713-812" / "postgres-status.json"
SOURCE_LEDGER = DOMAIN / "evidence-providers" / "tsplib-713-812" / "source-ledger.json"
CLASSIFICATION = DOMAIN / "testing" / "consolidation" / "campaign-classification.json"
TOOLCHAIN_LOCK = DOMAIN / "testing" / "consolidation" / "toolchain-lock.json"
BUILD_CERTIFICATE = DOMAIN / "testing" / "consolidation" / "build-certificate.json"
BENCHMARK_PROVENANCE = DOMAIN / "testing" / "consolidation" / "benchmark-provenance.json"
ARTIFACT_LIFECYCLE = DOMAIN / "testing" / "consolidation" / "artifact-lifecycle.json"
LOCAL_ARTIFACT_INVENTORY = REPO / "research-campaigns" / "_alignment" / "local-artifact-inventory.json"


def load_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"missing required file: {path}")
    return json.loads(path.read_text())


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def raw_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def semantic_sha256(path: Path) -> str:
    value = load_json(path)
    payload = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def canonical_tables(rulebook: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        key: value
        for key, value in rulebook.items()
        if key != "__meta__"
        and isinstance(value, dict)
        and isinstance(value.get("schema"), list)
        and isinstance(value.get("data"), list)
    }


def current_meta(rulebook: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for row in rulebook.get("__meta__", {}).get("data", []):
        key = row.get("MetaKey")
        kind = row.get("ValueType")
        if not key:
            continue
        if kind == "integer":
            result[key] = row.get("IntegerValue")
        elif kind == "boolean":
            result[key] = row.get("BooleanValue")
        else:
            result[key] = row.get("StringValue")
    return result


def build_benchmark_provenance() -> dict[str, Any]:
    ledger = load_json(SOURCE_LEDGER)
    classification = load_json(CLASSIFICATION)
    inventory = load_json(LOCAL_ARTIFACT_INVENTORY)
    return {
        "schema_version": 1,
        "status": "PASS_FOR_CHECKED_IN_713_812; ARCHIVE_RESTORATION_REQUIRED_FOR_813_1532",
        "checked_in_tsplib_campaign": {
            "loop_range": [713, 812],
            "source_ledger_path": SOURCE_LEDGER.relative_to(DOMAIN).as_posix(),
            "optimum_ledger": ledger["optimum_ledger"],
            "sources": ledger["sources"],
            "source_files_are_content_addressed": True,
            "published_optima_are_evaluation_inputs_not_construction_antecedents": True,
        },
        "provider_local_campaigns": [
            {
                "label_range": [row["first_label"], row["last_label"]],
                "classification": row["classification"],
                "repository_source_present": row["repository_source_present"],
                "canonical_promotion": row.get("canonical_promotion"),
                "artifacts": row.get("artifacts", []),
            }
            for row in classification["historical_label_ranges"]
            if row["first_label"] >= 813
        ],
        "alignment_inventory_path": LOCAL_ARTIFACT_INVENTORY.relative_to(REPO).as_posix(),
        "alignment_inventory_sha256": raw_sha256(LOCAL_ARTIFACT_INVENTORY),
        "alignment_inventory_status": inventory["status"],
        "claim_boundary": "A URL and checksum establish source identity; they do not establish a mathematical claim. Accepted finite claims additionally require witness/bound replay and the declared trust-boundary checks.",
    }


def build_artifact_lifecycle(legacy: dict[str, Any]) -> dict[str, Any]:
    historical = {
        key: value
        for key, value in legacy.items()
        if key.startswith("loop_")
    }
    superseded = {
        key: value
        for key, value in legacy.items()
        if key not in historical
    }
    return {
        "schema_version": 1,
        "status": "EXPLICIT_LIFECYCLE",
        "semantics": {
            "CURRENT": "Certified for the current source commit and toolchain lock.",
            "HISTORICAL": "Valid evidence for an earlier loop or source state.",
            "SUPERSEDED": "Retained for provenance but replaced as the current build artifact.",
            "REJECTED": "Preserved evidence that failed a declared gate.",
            "UNVERIFIED_PROVIDER_LOCAL": "Content-addressed evidence not yet restored, ingested, and independently replayed in this repository."
        },
        "current": {
            "status": "CERTIFICATE_PATH_IS_AUTHORITATIVE",
            "certificate_path": BUILD_CERTIFICATE.relative_to(DOMAIN).as_posix(),
            "toolchain_lock_path": TOOLCHAIN_LOCK.relative_to(DOMAIN).as_posix(),
            "rulebook_path": RULEBOOK.relative_to(DOMAIN).as_posix(),
            "rulebook_raw_sha256": raw_sha256(RULEBOOK),
            "rulebook_semantic_sha256": semantic_sha256(RULEBOOK),
            "policy": "No bare hash is current unless the named build certificate has status PASS and identifies the source commit, semantic input, generated trees, database load, and independent checks."
        },
        "historical_loop_artifacts": historical,
        "superseded_legacy_top_level_artifacts": superseded,
        "provider_local": {
            "classification_path": CLASSIFICATION.relative_to(DOMAIN).as_posix(),
            "benchmark_provenance_path": BENCHMARK_PROVENANCE.relative_to(DOMAIN).as_posix(),
            "status": "SEE_CLASSIFICATION"
        }
    }


def main() -> None:
    rulebook = load_json(RULEBOOK)
    contract = load_json(CONTRACT)
    campaign = load_json(CAMPAIGN_STATUS)
    aggregate = load_json(CAMPAIGN_AGGREGATE)
    postgres = load_json(CAMPAIGN_POSTGRES)
    classification = load_json(CLASSIFICATION)
    toolchain = load_json(TOOLCHAIN_LOCK)
    tables = canonical_tables(rulebook)
    meta = current_meta(rulebook)

    loop_rows = rulebook["TSPLoops"]["data"]
    rulebook_loops = {int(row["LoopOrder"]): row for row in loop_rows}
    expected = list(range(577, 813))
    if sorted(rulebook_loops) != expected:
        raise AssertionError(
            f"canonical loop set is not 577-812: first={min(rulebook_loops)} "
            f"last={max(rulebook_loops)} count={len(rulebook_loops)}"
        )
    if any(row.get("Status") != "CLOSED" for row in rulebook_loops.values()):
        raise AssertionError("all canonical TSP loops must be CLOSED at consolidation")

    contract_loops = {int(row["LoopOrder"]): row for row in contract["Loops"]}
    if set(contract_loops) != set(rulebook_loops):
        missing = sorted(set(rulebook_loops) - set(contract_loops))
        extra = sorted(set(contract_loops) - set(rulebook_loops))
        raise AssertionError(
            f"contract loop set differs from canonical rulebook; missing={missing}, extra={extra}"
        )
    for order, canonical in rulebook_loops.items():
        projected = contract_loops[order]
        projected["Status"] = canonical["Status"]
        projected["AfterState"] = canonical.get("AfterState")
        projected["Result"] = canonical.get("WitnessSummary")
        projected["CompletionDisposition"] = canonical.get("CompletionDisposition")
    contract["Loops"] = [contract_loops[order] for order in expected]

    count_tables = {
        "Cities": "Cities",
        "Neighborhoods": "Neighborhoods",
        "Addresses": "Addresses",
        "TSPInstances": "TSPInstances",
        "InstanceStops": "InstanceStops",
        "TravelEdges": "TravelEdges",
        "CandidateTours": "CandidateTours",
        "TourStops": "TourStops",
        "TourLegs": "TourLegs",
        "TSPLoops": "TSPLoops",
        "FrontierObligations": "TSPFrontierObligations",
        "ExecutionRuns": "TSPExecutionRuns",
        "InferenceStates": "TSPInferenceStates",
        "InferenceApplications": "TSPInferenceApplications",
        "InferenceAntecedents": "TSPInferenceAntecedents",
        "EdgeStates": "TSPEdgeStates",
        "EdgeSupports": "TSPEdgeSupports",
        "DerivedEdgeSets": "TSPDerivedEdgeSets",
        "DerivedEdgeSetMembers": "TSPDerivedEdgeSetMembers",
        "ConnectedDegreeTwoCertificates": "TSPConnectedDegreeTwoCertificates",
        "RouteReconstructions": "TSPRouteReconstructions",
        "RouteReconstructionSteps": "TSPRouteReconstructionSteps",
        "SearchCertificates": "TSPSearchCertificates",
        "ConstraintRounds": "TSPConstraintRounds",
        "ConstraintDecisions": "TSPConstraintDecisions",
        "ClusterBoundaryStates": "TSPClusterBoundaryStates",
        "ClusterBoundaryStateMembers": "TSPClusterBoundaryStateMembers",
        "ClusterContractionCertificates": "TSPClusterContractionCertificates"
    }
    acceptance = contract.setdefault("Acceptance", {})
    acceptance["RulebookTables"] = len(tables)
    for contract_key, table_name in count_tables.items():
        acceptance[contract_key] = len(rulebook[table_name]["data"])
    acceptance.update(
        {
            "CanonicalLoopFirst": 577,
            "CanonicalLoopLast": 812,
            "CanonicalLoopCount": 236,
            "CanonicalLoopContinuity": True,
            "LastPlannedLoop": 812,
            "HighestCompletedLoop": 812,
            "TSPLIBCampaignInstanceCount": aggregate["instance_count"],
            "TSPLIBCampaignValueClosedCount": aggregate["value_closed_count"],
            "TSPLIBCampaignWitnessClosedCount": aggregate["witness_closed_count"],
            "TSPLIBCampaignPathProvedCount": aggregate["path_proved_count"],
            "TSPLIBCampaignNewActiveTerms": aggregate["new_active_terms"],
            "CampaignPostgresHighestLoop": postgres["highest_loop"],
            "CampaignPostgresLoopRowCount": postgres["loop_row_count"],
            "PostgresCommissioningStatus": rulebook_loops[587]["Status"]
        }
    )
    acceptance["ActiveImportedDependencies"] = sum(
        1
        for row in rulebook["TSPFrontierObligations"]["data"]
        if row.get("IsImportedDependency") is True and row.get("Status") != "CLOSED"
    )

    contract["Version"] = "0.8.1-consolidated"
    contract["Scope"] = (
        "The canonical semantic ledger contains 236 closed TSP loops, 577-812, "
        "including the frozen one-arc/one-rewrite development and held-out "
        "calibration work plus the checked-in ten-instance TSPLIB search-and-cut "
        "campaign. Later provider work historically labeled 813-1532 remains "
        "content-addressed evidence, not canonical rulebook truth, because its "
        "physical archives are absent from this repository and its per-change "
        "rulebook deltas have not been audited. No general TSP algorithm, universal "
        "region-repair theorem, basis-minimality theorem, solver-leaderboard claim, "
        "or complexity-class claim is made."
    )
    contract["TrustBoundary"] = (
        "Input graph weights, source payloads, declared memberships, published "
        "benchmark optima, numerical LP/MILP implementations, and remote transpiler "
        "services retain their stated trust status. Exact integer replay, generated "
        "Postgres, and Python are distinct evidence surfaces. Provider-local summaries "
        "do not become canonical without archive restoration, rulebook-delta audit, "
        "Effortless generation, generated database load, and independent replay."
    )
    claims = contract.setdefault("Claims", {})
    claims.update(
        {
            "LoopMeansCanonicalRulebookSemanticChange": True,
            "CanonicalLoopBoundary": 812,
            "CanonicalLoopRowCount": 236,
            "CanonicalLoopLedgerUnified": True,
            "CanonicalLoopLedgerContiguous": True,
            "TSPLIBCampaign713812Completed": campaign["status"] == "SUCCEEDED",
            "TSPLIBCampaignPostgresConformance": postgres["status"] == "SUCCEEDED",
            "ProviderLocalLabels8131532Canonical": False,
            "ProviderLocalArchives8131532PresentInRepository": False,
            "GenericOrchestrationTablesBelongInTSPRulebook": False,
            "GeneralTSPAlgorithmProved": False,
            "UniversalPolynomialNormalization": False,
            "PEqualsNP": False
        }
    )

    contract["LoopSemantics"] = {
        "definition": classification["loop_definition"],
        "canonical_ledger": classification["canonical_ledger"]["path"],
        "future_commit_rule": "A semantic rulebook delta must change exactly one loop row and name that loop in the commit subject. A parsed-object-equivalent formatting rewrite is not a loop.",
        "historical_preregistration_disposition": "The 713-812 runner bulk-added PLANNED rows before ordered closure. The final rows are retained, but this publication pattern is prohibited for future semantic campaigns.",
        "reserved_provider_labels": classification["identifier_policy"]["reserved_pending_audit"],
        "next_unambiguous_new_loop_order": classification["identifier_policy"]["next_unambiguous_new_loop_order"]
    }
    contract["EvidenceBoundary"] = classification["claim_boundary"]
    contract["ToolchainLock"] = {
        "path": TOOLCHAIN_LOCK.relative_to(DOMAIN).as_posix(),
        "status": toolchain["status"]
    }

    legacy_hashes = contract.pop("ArtifactHashes", {})
    artifact_lifecycle = build_artifact_lifecycle(legacy_hashes)
    write_json(ARTIFACT_LIFECYCLE, artifact_lifecycle)
    contract["ArtifactLifecycle"] = {
        "path": ARTIFACT_LIFECYCLE.relative_to(DOMAIN).as_posix(),
        "current_build_certificate": BUILD_CERTIFICATE.relative_to(DOMAIN).as_posix(),
        "status": "EXPLICIT_CURRENT_HISTORICAL_SUPERSEDED_AND_PROVIDER_LOCAL_STATES"
    }

    benchmark_provenance = build_benchmark_provenance()
    write_json(BENCHMARK_PROVENANCE, benchmark_provenance)
    contract["BenchmarkProvenance"] = {
        "path": BENCHMARK_PROVENANCE.relative_to(DOMAIN).as_posix(),
        "status": benchmark_provenance["status"]
    }
    contract["Consolidation"] = {
        "status": "CANONICAL_AVAILABLE_EVIDENCE_ALIGNED",
        "canonical_loop_surface": "577-812|236",
        "rulebook_meta_last_loop": meta.get("last_loop"),
        "rulebook_meta_highest_completed_loop": meta.get("highest_completed_loop"),
        "campaign_status_path": CAMPAIGN_STATUS.relative_to(DOMAIN).as_posix(),
        "campaign_postgres_status_path": CAMPAIGN_POSTGRES.relative_to(DOMAIN).as_posix(),
        "classification_path": CLASSIFICATION.relative_to(DOMAIN).as_posix(),
        "build_certificate_path": BUILD_CERTIFICATE.relative_to(DOMAIN).as_posix()
    }

    write_json(CONTRACT, contract)
    print("traveling-salesman consolidated summary reconciliation: PASS")
    print(
        f"tables={len(tables)} loops={len(rulebook_loops)} "
        f"highest={acceptance['HighestCompletedLoop']} "
        f"raw_rulebook_sha256={raw_sha256(RULEBOOK)} "
        f"semantic_rulebook_sha256={semantic_sha256(RULEBOOK)}"
    )


if __name__ == "__main__":
    main()
