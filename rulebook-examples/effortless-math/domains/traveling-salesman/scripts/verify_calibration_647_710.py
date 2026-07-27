#!/usr/bin/env python3
"""Independent raw-witness verifier for TSP loops 647-710."""
from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
DOMAIN = HERE.parent
RULEBOOK = DOMAIN / "effortless-rulebook" / "traveling-salesman-rulebook.json"
CONTRACT = DOMAIN / "problem-contract.json"
STATUS = DOMAIN / "testing" / "calibration-647-710-status.json"
VERIFIED = DOMAIN / "testing" / "calibration-647-710-verified.json"
HISTORY_MODE = DOMAIN / "testing" / "calibration-history-mode.json"
sys.path.insert(0, str(HERE))
import exact_oracle_v1 as oracle  # noqa: E402

EXPECTED_LOOP_COMMITS = [
    'TSP loop 647: seal loop-646 raw witnesses',
    'TSP loop 648: freeze semantic basis',
    'TSP loop 649: declare exact oracle contract',
    'TSP loop 650: canonicalize tour classes',
    'TSP loop 651: run development exact oracle',
    'TSP loop 652: normalize oracle witnesses',
    'TSP loop 653: audit lower-bound soundness',
    'TSP loop 654: audit optimality concordance',
    'TSP loop 655: audit search accounting',
    'TSP loop 656: freeze development held-out split',
    'TSP loop 657: classify instance families',
    'TSP loop 658: define calibration vector',
    'TSP loop 659: summarize development calibration',
    'TSP loop 660: seal pre-held-out instrument',
    'TSP loop 661: materialize held-out ring6',
    'TSP loop 662: analyze held-out ring6',
    'TSP loop 663: materialize held-out metric6',
    'TSP loop 664: analyze held-out metric6',
    'TSP loop 665: materialize held-out cluster7',
    'TSP loop 666: analyze held-out cluster7',
    'TSP loop 667: materialize held-out hetero8',
    'TSP loop 668: analyze held-out hetero8',
    'TSP loop 669: materialize held-out sparse8',
    'TSP loop 670: analyze held-out sparse8',
    'TSP loop 671: materialize held-out bottleneck7',
    'TSP loop 672: analyze held-out bottleneck7',
    'TSP loop 673: materialize held-out tie6',
    'TSP loop 674: analyze held-out tie6',
    'TSP loop 675: materialize held-out dominance7',
    'TSP loop 676: analyze held-out dominance7',
    'TSP loop 677: materialize held-out nested8',
    'TSP loop 678: analyze held-out nested8',
    'TSP loop 679: materialize held-out nonmetric6',
    'TSP loop 680: analyze held-out nonmetric6',
    'TSP loop 681: materialize held-out fourregion8',
    'TSP loop 682: analyze held-out fourregion8',
    'TSP loop 683: materialize held-out residual8',
    'TSP loop 684: analyze held-out residual8',
    'TSP loop 685: exactness gap',
    'TSP loop 686: closure yield',
    'TSP loop 687: rule leverage',
    'TSP loop 688: structural sufficiency',
    'TSP loop 689: value rigidity',
    'TSP loop 690: choice entropy',
    'TSP loop 691: defect support',
    'TSP loop 692: repair potential',
    'TSP loop 693: boundary demand',
    'TSP loop 694: port compatibility',
    'TSP loop 695: quotient width',
    'TSP loop 696: residual kernel',
    'TSP loop 697: branch necessity',
    'TSP loop 698: search compression profile',
    'TSP loop 699: corpus rule coverage',
    'TSP loop 700: predicate stability',
    'TSP loop 701: heterogeneous region repair',
    'TSP loop 702: asymmetric crossing repair',
    'TSP loop 703: hierarchical quotient composition',
    'TSP loop 704: sparse quotient composition',
    'TSP loop 705: genuine value branch orbit',
    'TSP loop 706: calibration branch certificate',
    'TSP loop 707: held-out calibration summary',
    'TSP loop 708: combinatorial scale profile',
    'TSP loop 709: postgres/oracle conformance',
    'TSP loop 710: third coherence event',
]


def load(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(path)
    return json.loads(path.read_text())


def rows(rb: dict[str, Any], name: str) -> list[dict[str, Any]]:
    return rb[name]["data"]


def index(rb: dict[str, Any], name: str) -> dict[str, dict[str, Any]]:
    ident = rb[name]["schema"][0]["name"]
    return {row[ident]: row for row in rows(rb, name)}


def loop_number(value: Any) -> int:
    try:
        return int(str(value).rsplit("-", 1)[-1])
    except Exception:
        return 0


def close(a: Any, b: Any) -> bool:
    if a is None or b is None:
        return a is b
    if isinstance(a, (int, float)) or isinstance(b, (int, float)):
        return abs(float(a) - float(b)) < 1e-8
    return a == b


def physical_tables(rb: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        key: value for key, value in rb.items()
        if key != "__meta__" and isinstance(value, dict)
        and isinstance(value.get("schema"), list)
        and isinstance(value.get("data"), list)
    }


def candidate_route_and_cost(rb: dict[str, Any], candidate_id: str) -> tuple[list[str], float]:
    stops = sorted(
        (row for row in rows(rb, "TourStops") if row["CandidateTour"] == candidate_id),
        key=lambda row: int(row["SequencePosition"]),
    )
    route = [row["InstanceStop"] for row in stops]
    edge_index = index(rb, "TravelEdges")
    legs = [row for row in rows(rb, "TourLegs") if row["CandidateTour"] == candidate_id]
    cost = sum(float(edge_index[row["TravelEdge"]]["TravelCost"]) for row in legs)
    return route, cost


def raw_lower_bound(rb: dict[str, Any], instance_id: str) -> float:
    edge_index = index(rb, "TravelEdges")
    local = [row for row in rows(rb, "LocalDegreeBounds") if row["TSPInstance"] == instance_id]
    return sum(
        float(edge_index[row["FirstEdge"]]["TravelCost"])
        + float(edge_index[row["SecondEdge"]]["TravelCost"])
        for row in local
    ) / 2.0


def main() -> None:
    status = load(STATUS)
    if status.get("status") != "SUCCEEDED" or int(status.get("last_loop", 0)) != 710:
        raise AssertionError(f"executor status is {status!r}")
    rb = load(RULEBOOK)
    contract = load(CONTRACT)
    loops = {int(row["LoopOrder"]): row for row in rows(rb, "TSPLoops")}
    required_loop_orders = set(range(577, 711))
    missing_loop_orders = sorted(required_loop_orders - set(loops))
    if missing_loop_orders:
        raise AssertionError(f"required calibration history is missing: {missing_loop_orders}")
    for order in range(647, 711):
        row = loops[order]
        if row["Status"] != "CLOSED":
            raise AssertionError(f"loop {order} is {row['Status']!r}")
        if not row.get("BeforeState") or not row.get("AfterState") or not row.get("PlannedClosureCriterion"):
            raise AssertionError(f"loop {order} lacks complete before/after history")

    tables = physical_tables(rb)
    if len(tables) != 45:
        raise AssertionError(f"physical table count is {len(tables)}, expected 45")
    concepts = rows(rb, "TSPConceptRegistry")
    atoms = {row["DisplayName"] for row in concepts if row.get("Status") == "ACTIVE_PRIMITIVE"}
    operators = {row["DisplayName"] for row in concepts if row.get("Status") == "ACTIVE_OPERATOR"}
    if atoms != {"Semantic Arc"} or operators != {"Warranted Rewrite"}:
        raise AssertionError(f"basis mismatch atoms={atoms} operators={operators}")
    growth = [
        row["TSPConceptId"] for row in concepts
        if loop_number(row.get("IntroducedByLoop")) > 646
        and row.get("ConceptKind") in {"PRIMITIVE", "OPERATOR"}
    ]
    if growth:
        raise AssertionError(f"basis grew during held-out campaign: {growth}")
    unrecovered = [row["TSPConceptId"] for row in concepts if row.get("IsRecoverableFromCurrentBasis") is False]
    if unrecovered:
        raise AssertionError(f"unrecoverable concepts: {unrecovered[:10]}")

    instance_index = index(rb, "TSPInstances")
    heldout = sorted(
        (row for row in rows(rb, "TSPInstances") if row.get("ExperimentSplit") == "HELD_OUT"),
        key=lambda row: row["TSPInstanceId"],
    )
    if len(heldout) != 12:
        raise AssertionError(f"held-out count is {len(heldout)}")
    search_index = index(rb, "TSPSearchCertificates")
    candidate_index = index(rb, "CandidateTours")
    optimality = rows(rb, "OptimalityCertificates")
    exact_summaries: dict[str, dict[str, Any]] = {}
    value_closed = route_closed = branch_required = 0
    for instance in heldout:
        iid = instance["TSPInstanceId"]
        exact = oracle.evaluate_instance(rb, iid)
        exact_summaries[iid] = exact
        checks = {
            "OracleStatus": "EXACT",
            "ExactTourClassCount": exact["total_class_count"],
            "ExactFeasibleClassCount": exact["feasible_class_count"],
            "ExactOptimumCost": exact["optimum_cost"],
            "ExactOptimalClassCount": exact["optimal_class_count"],
            "ExactSecondBestCost": exact["second_best_cost"],
            "ExactDistinctValueCount": exact["distinct_feasible_value_count"],
            "ExactOracleChecksum": exact["oracle_checksum"],
            "DegreeTwoOracleLowerBound": exact["degree_two_lower_bound"],
            "DegreeTwoOracleGap": exact["degree_two_gap"],
            "LocalMinimumUnionComponentCount": exact["local_union_component_count"],
            "LocalMinimumUnionDegreeViolationCount": exact["local_union_degree_violation_count"],
            "DeterministicResidualClassCount": exact["deterministic_residual_class_count"],
            "DeterministicResidualValueCount": exact["deterministic_residual_value_count"],
            "DeterministicResidualOptimalCount": exact["deterministic_residual_optimal_count"],
            "DeterministicValueClosed": exact["deterministic_value_closed"],
            "DeterministicRouteClosed": exact["deterministic_route_closed"],
            "BranchWarrantStatus": exact["branch_warrant_status"],
        }
        for key, expected in checks.items():
            if not close(instance.get(key), expected):
                raise AssertionError(f"{iid}.{key}={instance.get(key)!r}, expected {expected!r}")
        lower = raw_lower_bound(rb, iid)
        if lower > float(exact["optimum_cost"]) + 1e-9:
            raise AssertionError(f"unsound held-out lower bound {iid}: {lower} > {exact['optimum_cost']}")
        search = search_index[f"search-calibration-{iid}"]
        if int(search["InitialRouteClassCount"]) != int(exact["feasible_class_count"]):
            raise AssertionError(f"search initial count mismatch {iid}")
        if int(search["SurvivingRouteClassCount"]) != int(exact["deterministic_residual_class_count"]):
            raise AssertionError(f"search residual count mismatch {iid}")
        if search.get("OracleChecksum") != exact["oracle_checksum"]:
            raise AssertionError(f"search checksum mismatch {iid}")
        oracle_candidates = [
            row for row in candidate_index.values()
            if row["TSPInstance"] == iid and row.get("CandidateKind") == "EXACT_ORACLE_CALIBRATION_WITNESS"
        ]
        expected_candidate_count = min(max(int(exact["optimal_class_count"]), 1), 2)
        if len(oracle_candidates) != expected_candidate_count:
            raise AssertionError(f"oracle candidate count mismatch {iid}: {len(oracle_candidates)}")
        optimal_routes = {tuple(route) for route in exact["optimal_routes"]}
        for candidate in oracle_candidates:
            route, cost = candidate_route_and_cost(rb, candidate["CandidateTourId"])
            canonical = oracle.canonical_cycle(route, exact["depot_stop"])
            if canonical not in optimal_routes or not close(cost, exact["optimum_cost"]):
                raise AssertionError(f"candidate is not exact optimal {candidate['CandidateTourId']}")
        if exact["deterministic_value_closed"]:
            value_closed += 1
        if exact["deterministic_route_closed"]:
            route_closed += 1
        if exact["branch_warrant_status"] == "REQUIRED_FOR_VALUE":
            branch_required += 1

    for cert in optimality:
        candidate = candidate_index[cert["CandidateTour"]]
        if candidate.get("CandidateKind") != "EXACT_ORACLE_CALIBRATION_WITNESS":
            continue
        iid = candidate["TSPInstance"]
        exact = exact_summaries.get(iid)
        if exact is None:
            continue
        _, cost = candidate_route_and_cost(rb, candidate["CandidateTourId"])
        if not close(cost, exact["optimum_cost"]):
            raise AssertionError(f"held-out optimality certificate disagrees with oracle: {cert['OptimalityCertificateId']}")
        if not close(raw_lower_bound(rb, iid), exact["optimum_cost"]):
            raise AssertionError(f"held-out structural certificate lacks tight lower bound: {cert['OptimalityCertificateId']}")

    meta = {row["MetaKey"]: row for row in rb["__meta__"]["data"]}
    branch_iid = meta["calibration_value_branch_instance"]["StringValue"]
    branch_row = instance_index[branch_iid]
    if branch_row.get("BranchNecessaryForValue") is not True:
        raise AssertionError("selected calibration branch is not value relevant")
    if int(branch_row.get("CalibrationBranchDecisionCount") or 0) != 1:
        raise AssertionError("calibration branch count is not one")
    if int(branch_row["BranchIncludeClassCount"]) + int(branch_row["BranchExcludeClassCount"]) != int(branch_row["DeterministicResidualClassCount"]):
        raise AssertionError("branch partition does not cover the residual orbit")
    if not close(min(branch_row["BranchIncludeBestCost"], branch_row["BranchExcludeBestCost"]), branch_row["ExactOptimumCost"]):
        raise AssertionError("branch best values do not recover the exact optimum")

    claims = contract["Claims"]
    required_true = {
        "ExactHeldOutCalibrationCompleted": True,
        "CalibrationBasisFrozenAtLoop646": True,
    }
    for key, expected in required_true.items():
        if claims.get(key) is not expected:
            raise AssertionError(f"claim {key}={claims.get(key)!r}")
    for key in (
        "ExactOracleIsStructuralProof",
        "GeneralTSPAlgorithmProved",
        "GeneralKRegionRepairProved",
        "UniversalPolynomialNormalization",
        "CoherenceConvergenceProvedUniversally",
    ):
        if claims.get(key) is not False:
            raise AssertionError(f"nonclaim promoted: {key}={claims.get(key)!r}")
    if claims.get("HeldOutInstanceCount") != 12 or claims.get("HeldOutExactOracleCoveragePct") != 100:
        raise AssertionError("held-out final claim mismatch")
    if claims.get("FrozenBasisPrimitiveGrowthCount") != 0:
        raise AssertionError("basis growth claim mismatch")

    history = load(HISTORY_MODE) if HISTORY_MODE.is_file() else {}
    history_mode = history.get("mode", "DETAILED_GIT_HISTORY")
    positions: list[int] = []
    ordered_commit_history_verified = False
    canonical_ledger_history_verified = False
    if history_mode == "SQUASHED_CANONICAL_LEDGER":
        if history.get("detailed_git_commit_history_required") is not False:
            raise AssertionError("squashed calibration history must disable commit-subject dependence")
        if history.get("required_loop_range") != "647-710":
            raise AssertionError(f"unexpected calibration history range: {history!r}")
        canonical_ledger_history_verified = True
    else:
        subjects = subprocess.check_output(["git", "log", "--format=%s", "--reverse"], text=True).splitlines()
        plan_message = "TSP loops 647-710: register frozen-basis exact calibration"
        expected = [plan_message, *EXPECTED_LOOP_COMMITS]
        for message in expected:
            if message not in subjects:
                raise AssertionError(f"missing calibration commit: {message}")
            positions.append(subjects.index(message))
        if positions != sorted(positions) or len(set(positions)) != len(positions):
            raise AssertionError(f"calibration commits are not strictly ordered: {positions}")
        ordered_commit_history_verified = True

    payload = {
        "status": "VERIFIED",
        "loops": "647-710",
        "physical_table_count": 45,
        "active_atoms": sorted(atoms),
        "active_operators": sorted(operators),
        "heldout_instance_count": len(heldout),
        "exact_oracle_coverage_pct": 100,
        "value_closed_count": value_closed,
        "route_closed_count": route_closed,
        "branch_required_count": branch_required,
        "branch_instance": branch_iid,
        "max_feasible_class_count": max(int(row["ExactFeasibleClassCount"]) for row in heldout),
        "primitive_growth_count": 0,
        "exact_oracle_is_structural_proof": False,
        "general_tsp_algorithm_proved": False,
        "history_mode": history_mode,
        "ordered_commit_history_verified": ordered_commit_history_verified,
        "canonical_ledger_history_verified": canonical_ledger_history_verified,
        "ordered_commit_positions": positions,
    }
    VERIFIED.write_text(json.dumps(payload, indent=2) + "\n")
    print("independent TSP frozen-basis calibration verification: PASS")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
