#!/usr/bin/env python3
"""Validate the consolidated TSP semantic ledger, evidence, and build identity."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any, Iterable

HERE = Path(__file__).resolve().parent
DOMAIN = HERE.parent
REPO = DOMAIN.parents[3]
RULEBOOK = DOMAIN / "effortless-rulebook" / "traveling-salesman-rulebook.json"
CONTRACT = DOMAIN / "problem-contract.json"
EFFORTLESS = DOMAIN / "effortless.json"
CAMPAIGN = DOMAIN / "scripts" / "campaign_713_812.py"
CAMPAIGN_STATUS = DOMAIN / "testing" / "campaign-713-812" / "status.json"
CAMPAIGN_AGGREGATE = DOMAIN / "testing" / "campaign-713-812" / "aggregate.json"
CAMPAIGN_POSTGRES = DOMAIN / "testing" / "campaign-713-812" / "postgres-status.json"
SOURCE_LEDGER = DOMAIN / "evidence-providers" / "tsplib-713-812" / "source-ledger.json"
CLASSIFICATION = DOMAIN / "testing" / "consolidation" / "campaign-classification.json"
TOOLCHAIN_LOCK = DOMAIN / "testing" / "consolidation" / "toolchain-lock.json"
BENCHMARK_PROVENANCE = DOMAIN / "testing" / "consolidation" / "benchmark-provenance.json"
ARTIFACT_LIFECYCLE = DOMAIN / "testing" / "consolidation" / "artifact-lifecycle.json"
BUILD_CERTIFICATE = DOMAIN / "testing" / "consolidation" / "build-certificate.json"
LOOP_HISTORY_AUDIT = DOMAIN / "testing" / "consolidation" / "loop-history-audit.json"
LOCAL_INVENTORY = REPO / "research-campaigns" / "_alignment" / "local-artifact-inventory.json"
SHARED_ORCHESTRATION = REPO / "rulebook-examples" / "effortless-math" / "shared-kernels" / "semantic-orchestration" / "DOMAIN_CONTRACT.md"

REQUIRED_LOOP_FIELDS = (
    "TSPLoopId",
    "LoopOrder",
    "Status",
    "BeforeState",
    "PlannedClosureCriterion",
    "AfterState",
    "WitnessSummary",
    "CompletionDisposition",
)

FORBIDDEN_GENERIC_TSP_TABLES = {
    "Providers",
    "ProviderCapabilities",
    "SolvePlans",
    "SolvePlanSteps",
    "SolveRequests",
    "SolveRuns",
    "OrchestrationStates",
    "OrchestrationStateTransitions",
    "ArtifactLifecycle",
    "Artifacts",
    "AcceptanceDecisions",
    "WorkQueues",
    "Jobs",
    "Tenants",
    "Users",
}


def load_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"missing required file: {path}")
    return json.loads(path.read_text())


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


def table_names(rulebook: dict[str, Any]) -> set[str]:
    return {
        key
        for key, value in rulebook.items()
        if key != "__meta__"
        and isinstance(value, dict)
        and isinstance(value.get("schema"), list)
        and isinstance(value.get("data"), list)
    }


def meta_values(rulebook: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for row in rulebook.get("__meta__", {}).get("data", []):
        key = row.get("MetaKey")
        if not key:
            continue
        kind = row.get("ValueType")
        if kind == "integer":
            result[key] = row.get("IntegerValue")
        elif kind == "boolean":
            result[key] = row.get("BooleanValue")
        else:
            result[key] = row.get("StringValue")
    return result


def iter_files(path: Path) -> Iterable[Path]:
    if path.is_file():
        yield path
        return
    if not path.is_dir():
        raise FileNotFoundError(path)
    for item in sorted(path.rglob("*")):
        if item.is_file() and "__pycache__" not in item.parts and not item.name.endswith(".pyc"):
            yield item


def certified_input_files() -> list[Path]:
    paths: list[Path] = [
        RULEBOOK,
        CONTRACT,
        EFFORTLESS,
        DOMAIN / "start.sh",
        DOMAIN / "CAMPAIGN_REPORT_713_812.md",
        DOMAIN / "testing" / "take-test.py",
        CLASSIFICATION,
        TOOLCHAIN_LOCK,
        BENCHMARK_PROVENANCE,
        ARTIFACT_LIFECYCLE,
        LOCAL_INVENTORY,
        REPO / "research-campaigns" / "wall-clock-813-912" / "summary.json",
        REPO / "research-campaigns" / "wall-clock-813-912" / "validation.json",
        REPO / "research-campaigns" / "_alignment" / "provider-local-result-1033-1532.md",
        SHARED_ORCHESTRATION,
        REPO / ".github" / "workflows" / "validate-tsp-domain.yml",
        REPO / ".github" / "workflows" / "verify-tsp-effortless-build.yml",
    ]
    roots = [
        DOMAIN / "scripts",
        DOMAIN / "evidence-providers" / "tsplib-713-812",
    ]
    files: list[Path] = []
    for path in paths:
        if path.is_file():
            files.append(path)
    for root in roots:
        files.extend(iter_files(root))
    return sorted(set(files), key=lambda item: item.relative_to(REPO).as_posix())


def certified_input_digest() -> tuple[str, list[dict[str, Any]]]:
    digest = hashlib.sha256()
    rows: list[dict[str, Any]] = []
    for path in certified_input_files():
        rel = path.relative_to(REPO).as_posix()
        content = path.read_bytes()
        file_hash = hashlib.sha256(content).hexdigest()
        digest.update(rel.encode("utf-8") + b"\0" + content + b"\0")
        rows.append({"path": rel, "size_bytes": len(content), "sha256": file_hash})
    return digest.hexdigest(), rows


def parse_optimum_ledger(path: Path) -> dict[str, int]:
    result: dict[str, int] = {}
    for raw in path.read_text().splitlines():
        if ":" not in raw:
            continue
        name, value = raw.split(":", 1)
        token = value.strip().split()[0]
        try:
            result[name.strip()] = int(token)
        except ValueError:
            continue
    return result


def validate_loop_ledger(rulebook: dict[str, Any], contract: dict[str, Any]) -> None:
    rows = rulebook["TSPLoops"]["data"]
    orders = [int(row["LoopOrder"]) for row in rows]
    expected = list(range(577, 813))
    if orders != expected:
        raise AssertionError(
            f"TSPLoops must be sorted and contiguous 577-812; got "
            f"first={min(orders)} last={max(orders)} count={len(orders)}"
        )
    if len(set(orders)) != len(orders):
        raise AssertionError("duplicate canonical loop order")
    for row in rows:
        order = int(row["LoopOrder"])
        if row.get("TSPLoopId") != f"tsp-loop-{order}":
            raise AssertionError(f"loop ID/order mismatch at {order}")
        if row.get("Status") != "CLOSED":
            raise AssertionError(f"canonical loop {order} is not CLOSED")
        required_fields = (
            REQUIRED_LOOP_FIELDS
            if order >= 587
            else ("TSPLoopId", "LoopOrder", "Status", "WitnessSummary")
        )
        missing = [field for field in required_fields if not row.get(field)]
        if missing:
            raise AssertionError(f"canonical loop {order} lacks {missing}")

    projected = {int(row["LoopOrder"]): row for row in contract["Loops"]}
    if sorted(projected) != expected:
        raise AssertionError("problem contract loop set differs from TSPLoops")
    for row in rows:
        order = int(row["LoopOrder"])
        contract_row = projected[order]
        if contract_row.get("Status") != row.get("Status"):
            raise AssertionError(f"contract status mismatch for loop {order}")
        if contract_row.get("AfterState") != row.get("AfterState"):
            raise AssertionError(f"contract after-state mismatch for loop {order}")
        if contract_row.get("Result") != row.get("WitnessSummary"):
            raise AssertionError(f"contract witness mismatch for loop {order}")

    meta = meta_values(rulebook)
    for key in ("last_loop", "last_planned_loop", "highest_completed_loop"):
        if int(meta.get(key, -1)) != 812:
            raise AssertionError(f"rulebook meta {key}={meta.get(key)!r}, expected 812")

    acceptance = contract["Acceptance"]
    expected_acceptance = {
        "TSPLoops": 236,
        "CanonicalLoopFirst": 577,
        "CanonicalLoopLast": 812,
        "CanonicalLoopCount": 236,
        "CanonicalLoopContinuity": True,
        "LastPlannedLoop": 812,
        "HighestCompletedLoop": 812,
        "CampaignPostgresHighestLoop": 812,
        "CampaignPostgresLoopRowCount": 236,
    }
    for key, expected_value in expected_acceptance.items():
        if acceptance.get(key) != expected_value:
            raise AssertionError(
                f"contract Acceptance.{key}={acceptance.get(key)!r}, expected {expected_value!r}"
            )


def validate_campaign_evidence() -> None:
    status = load_json(CAMPAIGN_STATUS)
    aggregate = load_json(CAMPAIGN_AGGREGATE)
    postgres = load_json(CAMPAIGN_POSTGRES)
    ledger = load_json(SOURCE_LEDGER)
    if status.get("status") != "SUCCEEDED" or status.get("last_loop") != 812:
        raise AssertionError(f"campaign status is not closed: {status}")
    if status.get("aggregate_sha256") != raw_sha256(CAMPAIGN_AGGREGATE):
        raise AssertionError("campaign aggregate hash mismatch")
    if postgres.get("status") != "SUCCEEDED":
        raise AssertionError(f"campaign Postgres status is not SUCCEEDED: {postgres}")
    if postgres.get("highest_loop") != 812 or postgres.get("loop_row_count") != 236:
        raise AssertionError(f"campaign Postgres loop surface mismatch: {postgres}")
    if aggregate.get("instance_count") != 10 or aggregate.get("new_active_terms") != 0:
        raise AssertionError("campaign aggregate count or frozen-basis result changed")

    provider = DOMAIN / "evidence-providers" / "tsplib-713-812"
    solutions = provider / "solutions"
    if ledger["optimum_ledger"]["sha256"] != raw_sha256(solutions):
        raise AssertionError("TSPLIB optimum-ledger content hash mismatch")
    optimum_values = parse_optimum_ledger(solutions)
    for name, row in ledger["sources"].items():
        source = provider / name / f"{name}.tsp"
        if row["sha256"] != raw_sha256(source):
            raise AssertionError(f"TSPLIB source hash mismatch for {name}")
        expected_optimum = ledger["optimum_ledger"]["verified_values"][name]
        if optimum_values.get(name) != expected_optimum:
            raise AssertionError(f"published optimum replay mismatch for {name}")

    loop_711 = load_json(DOMAIN / "testing" / "loop-711-gr17-result.json")
    loop_712 = load_json(DOMAIN / "testing" / "loop-712-gr21-result.json")
    if loop_711["constructive_witness_value"] != 2085 or not loop_711["value_status"] == "CLOSED":
        raise AssertionError("loop 711 bridge evidence mismatch")
    if loop_712["constructive_witness_value"] != 2707 or not loop_712["value_status"] == "CLOSED":
        raise AssertionError("loop 712 bridge evidence mismatch")
    if aggregate["instances"]["gr17"]["optimum"] != 2085:
        raise AssertionError("GR17 campaign/bridge disagreement")
    if aggregate["instances"]["gr21"]["optimum"] != 2707:
        raise AssertionError("GR21 campaign/bridge disagreement")


def validate_classification() -> None:
    classification = load_json(CLASSIFICATION)
    inventory = load_json(LOCAL_INVENTORY)
    canonical = classification["canonical_ledger"]
    if canonical["first_loop"] != 577 or canonical["last_loop"] != 812 or canonical["loop_count"] != 236:
        raise AssertionError("classification canonical ledger mismatch")
    if classification["identifier_policy"]["reserved_pending_audit"] != [813, 1532]:
        raise AssertionError("provider-local identifier reservation mismatch")
    if classification["identifier_policy"]["next_unambiguous_new_loop_order"] != 1533:
        raise AssertionError("next unambiguous loop order must be 1533")

    inventory_map = {
        row["filename"]: (row["size_bytes"], row["sha256"])
        for row in inventory["artifacts"]
    }
    classified_map: dict[str, tuple[int, str]] = {}
    for campaign in classification["historical_label_ranges"]:
        for artifact in campaign.get("artifacts", []):
            classified_map[artifact["filename"]] = (
                artifact["size_bytes"],
                artifact["sha256"],
            )
    if inventory_map != classified_map:
        missing = sorted(set(inventory_map) - set(classified_map))
        extra = sorted(set(classified_map) - set(inventory_map))
        mismatch = sorted(
            name
            for name in set(inventory_map) & set(classified_map)
            if inventory_map[name] != classified_map[name]
        )
        raise AssertionError(
            f"local artifact classification mismatch; missing={missing}, extra={extra}, changed={mismatch}"
        )


def validate_toolchain() -> None:
    effortless = load_json(EFFORTLESS)
    lock = load_json(TOOLCHAIN_LOCK)
    declared = {
        row["Name"]: {
            "version": row["LastVersionUsed"],
            "url": row["LastUrl"],
            "command": row["CommandLine"],
        }
        for row in effortless["ProjectTranspilers"]
    }
    locked = {
        row["name"]: {
            "version": row["version"],
            "url": row["url"],
            "command": row["command"],
        }
        for row in lock["transpilers"]
    }
    if declared != locked:
        raise AssertionError(f"effortless.json/transpiler lock mismatch: {declared!r} != {locked!r}")
    cli = lock["effortless_cli"]
    if cli["git_commit"] not in cli["archive_url"]:
        raise AssertionError("Effortless CLI archive does not identify the pinned commit")


def validate_domain_boundary(rulebook: dict[str, Any]) -> None:
    bad = sorted(table_names(rulebook) & FORBIDDEN_GENERIC_TSP_TABLES)
    if bad:
        raise AssertionError(f"generic orchestration tables leaked into TSP rulebook: {bad}")
    if not SHARED_ORCHESTRATION.is_file():
        raise FileNotFoundError(SHARED_ORCHESTRATION)


def validate_artifact_status(contract: dict[str, Any]) -> None:
    if "ArtifactHashes" in contract:
        raise AssertionError("ambiguous top-level ArtifactHashes must not be present")
    lifecycle = load_json(ARTIFACT_LIFECYCLE)
    current = lifecycle["current"]
    if current["rulebook_raw_sha256"] != raw_sha256(RULEBOOK):
        raise AssertionError("artifact lifecycle raw rulebook hash is stale")
    if current["rulebook_semantic_sha256"] != semantic_sha256(RULEBOOK):
        raise AssertionError("artifact lifecycle semantic rulebook hash is stale")
    if contract["ArtifactLifecycle"]["path"] != ARTIFACT_LIFECYCLE.relative_to(DOMAIN).as_posix():
        raise AssertionError("contract artifact lifecycle pointer mismatch")
    provenance = load_json(BENCHMARK_PROVENANCE)
    if not provenance["status"].startswith("PASS_FOR_CHECKED_IN_713_812"):
        raise AssertionError("benchmark provenance status mismatch")


def validate_build_certificate(required: bool) -> None:
    if not BUILD_CERTIFICATE.is_file():
        if required:
            raise FileNotFoundError(BUILD_CERTIFICATE)
        return
    certificate = load_json(BUILD_CERTIFICATE)
    if certificate.get("status") != "PASS":
        raise AssertionError(f"consolidated build certificate is not PASS: {certificate}")
    expected_digest, expected_files = certified_input_digest()
    if certificate.get("certified_input_scope_sha256") != expected_digest:
        raise AssertionError("consolidated build certificate input scope is stale")
    if certificate.get("certified_input_file_count") != len(expected_files):
        raise AssertionError("consolidated build certificate input file count mismatch")
    if certificate.get("rulebook_raw_sha256") != raw_sha256(RULEBOOK):
        raise AssertionError("build certificate raw rulebook hash mismatch")
    if certificate.get("rulebook_semantic_sha256") != semantic_sha256(RULEBOOK):
        raise AssertionError("build certificate semantic rulebook hash mismatch")
    if certificate.get("loop_surface") != "812|236":
        raise AssertionError("build certificate loop surface mismatch")
    if certificate.get("view_count") != 45:
        raise AssertionError("build certificate generated view count mismatch")
    if certificate.get("rulebook_semantic_object_equal_after_build") is not True:
        raise AssertionError("build certificate does not prove pre/post semantic equality")
    if certificate.get("generated_database_loaded_from_effortless_projection") is not True:
        raise AssertionError("build certificate does not prove generated database load")
    if certificate.get("python_postgres_peer_conformance") != "PASS":
        raise AssertionError("build certificate peer conformance mismatch")
    if certificate.get("campaign_713_812_replay") != "PASS":
        raise AssertionError("build certificate campaign replay mismatch")
    if certificate.get("bridge_711_712_replay") != "PASS":
        raise AssertionError("build certificate bridge replay mismatch")
    if certificate.get("toolchain_lock_sha256") != raw_sha256(TOOLCHAIN_LOCK):
        raise AssertionError("build certificate toolchain lock hash mismatch")


def validate_head_commit_protocol() -> None:
    try:
        parents = subprocess.check_output(
            ["git", "show", "-s", "--format=%P", "HEAD"],
            cwd=REPO,
            text=True,
        ).strip().split()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return
    if not parents:
        return
    subject = subprocess.check_output(
        ["git", "show", "-s", "--format=%s", "HEAD"],
        cwd=REPO,
        text=True,
    ).strip()
    before_text = subprocess.check_output(
        ["git", "show", f"{parents[0]}:{RULEBOOK.relative_to(REPO).as_posix()}"],
        cwd=REPO,
        text=True,
    )
    before = json.loads(before_text)
    after = load_json(RULEBOOK)
    semantic_changed = before != after
    loop_subject = re.fullmatch(r"TSP loop (\d+): .+", subject)
    if semantic_changed and not loop_subject:
        raise AssertionError(
            f"HEAD changed the canonical rulebook but is not named as one TSP loop: {subject!r}"
        )
    if not semantic_changed and loop_subject:
        raise AssertionError(
            f"HEAD is labeled as a TSP loop but the parsed rulebook is unchanged: {subject!r}"
        )
    if semantic_changed and loop_subject:
        order = int(loop_subject.group(1))
        before_rows = {int(row["LoopOrder"]): row for row in before["TSPLoops"]["data"]}
        after_rows = {int(row["LoopOrder"]): row for row in after["TSPLoops"]["data"]}
        changed = sorted(
            key
            for key in set(before_rows) | set(after_rows)
            if before_rows.get(key) != after_rows.get(key)
        )
        if changed != [order]:
            raise AssertionError(
                f"semantic commit {subject!r} must change exactly loop {order}; changed={changed}"
            )


def validate_history_audit(required: bool) -> None:
    if not LOOP_HISTORY_AUDIT.is_file():
        if required:
            raise FileNotFoundError(LOOP_HISTORY_AUDIT)
        return
    audit = load_json(LOOP_HISTORY_AUDIT)
    if audit.get("status") != "PASS_WITH_RECORDED_HISTORICAL_EXCEPTION":
        raise AssertionError("loop history audit status mismatch")
    if audit.get("canonical_loop_range") != [577, 812]:
        raise AssertionError("loop history audit range mismatch")
    if audit.get("ordered_campaign_loop_commit_count") != 100:
        raise AssertionError("loop history audit campaign commit count mismatch")
    if audit.get("historical_bulk_preregistration", {}).get("status") != "RECORDED_PROTOCOL_EXCEPTION":
        raise AssertionError("bulk preregistration exception is not recorded")


def run_validation(require_build_certificate: bool, require_history_audit: bool) -> None:
    rulebook = load_json(RULEBOOK)
    contract = load_json(CONTRACT)
    validate_loop_ledger(rulebook, contract)
    validate_campaign_evidence()
    validate_classification()
    validate_toolchain()
    validate_domain_boundary(rulebook)
    validate_artifact_status(contract)
    validate_history_audit(require_history_audit)
    validate_build_certificate(require_build_certificate)
    validate_head_commit_protocol()
    print("traveling-salesman consolidation validation: PASS")
    print(
        json.dumps(
            {
                "canonical_loop_surface": "577-812|236",
                "rulebook_raw_sha256": raw_sha256(RULEBOOK),
                "rulebook_semantic_sha256": semantic_sha256(RULEBOOK),
                "certified_input_scope_sha256": certified_input_digest()[0],
                "build_certificate_required": require_build_certificate,
                "history_audit_required": require_history_audit,
            },
            indent=2,
        )
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-build-certificate", action="store_true")
    parser.add_argument("--require-history-audit", action="store_true")
    parser.add_argument("--print-input-digest", action="store_true")
    parser.add_argument("--print-input-files", action="store_true")
    args = parser.parse_args()
    if args.print_input_digest:
        print(certified_input_digest()[0])
        return
    if args.print_input_files:
        print(json.dumps(certified_input_digest()[1], indent=2))
        return
    run_validation(args.require_build_certificate, args.require_history_audit)


if __name__ == "__main__":
    main()
