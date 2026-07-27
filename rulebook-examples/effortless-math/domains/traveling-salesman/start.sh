#!/usr/bin/env bash
# ============================================================================
# traveling-salesman — semantic-geometry control panel
# ============================================================================
# Subcommands:
#   ./start.sh all       validate -> effortless build -> db -> test -> show
#   ./start.sh validate  validate the canonical rulebook without Postgres
#   ./start.sh build     generate Postgres + RuleSpeak projections
#   ./start.sh db        drop/recreate erb_traveling_salesman and load generated SQL
#   ./start.sh test      compare generated Postgres views with the Python substrate
#   ./start.sh show      show graph, tour, invariant, and search-frontier rows
#   ./start.sh contract  print the current research contract
#   ./start.sh stop      drop the local TSP database
#   ./start.sh restart   stop then all
# ============================================================================
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

HERE="$(pwd)"
RULEBOOK="$HERE/effortless-rulebook/traveling-salesman-rulebook.json"
PG_DIR="$HERE/effortless-postgres"

DB="${TSP_DB:-erb_traveling_salesman}"
PGHOST="${PGHOST:-localhost}"
PGUSER="${PGUSER:-postgres}"
export TSP_DB="$DB" PGHOST PGUSER
export ERB_DOMAIN="traveling-salesman"

if [ -x /opt/homebrew/opt/postgresql@16/bin/psql ]; then
  export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
fi

psql_db() {
  psql -h "$PGHOST" -U "$PGUSER" -d "$DB" -v ON_ERROR_STOP=1 "$@"
}

cmd_validate() {
  python3 "$HERE/scripts/validate_rulebook.py"
}

cmd_build() {
  if ! command -v effortless >/dev/null 2>&1; then
    echo "missing required executable: effortless" >&2
    exit 1
  fi

  local formatter="$HERE/../../scripts/format-rulebook.py"
  local mutation_checker="$HERE/scripts/check_rulebook_build_mutation.py"
  if [ ! -f "$formatter" ]; then
    echo "missing canonical formatter: $formatter" >&2
    exit 1
  fi
  if [ ! -f "$mutation_checker" ]; then
    echo "missing rulebook semantic-mutation checker: $mutation_checker" >&2
    exit 1
  fi

  local before
  before="$(mktemp)"
  trap 'rm -f "$before"' RETURN
  cp "$RULEBOOK" "$before"

  echo "[tsp] effortless build → Postgres + RuleSpeak"
  effortless build

  # Effortless may rewrite JSON presentation. Normalize it, then require the
  # parsed semantic object to be identical to the pre-build rulebook.
  python3 "$formatter" "$RULEBOOK"
  if [ -n "${TSP_BUILD_MUTATION_REPORT:-}" ]; then
    python3 "$mutation_checker" \
      --before "$before" \
      --after "$RULEBOOK" \
      --report "$TSP_BUILD_MUTATION_REPORT"
  else
    python3 "$mutation_checker" --before "$before" --after "$RULEBOOK"
  fi
}

cmd_db() {
  local init="$PG_DIR/init-db.sh"
  if [ ! -f "$init" ]; then
    echo "missing generated Postgres initializer: $init" >&2
    echo "run ./start.sh build first" >&2
    exit 1
  fi

  echo "[tsp] (re)creating Postgres database: $DB"
  psql -h "$PGHOST" -U "$PGUSER" -q -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB' AND pid<>pg_backend_pid()" \
    >/dev/null 2>&1 || true
  psql -h "$PGHOST" -U "$PGUSER" -q -d postgres -c "DROP DATABASE IF EXISTS $DB"
  psql -h "$PGHOST" -U "$PGUSER" -q -d postgres -c "CREATE DATABASE $DB"
  DATABASE_URL="postgresql://$PGUSER@$PGHOST:5432/$DB" bash "$init"
}

cmd_test() {
  python3 "$HERE/testing/take-test.py"
}

cmd_show() {
  echo "=== normalized graph ==="
  psql_db -c "
    SELECT tsp_instance_id, count_of_required_stops, count_of_travel_edges,
           count_of_inadmissible_edges, count_of_non_unique_edge_pair_rows,
           expected_undirected_edge_count, is_complete_undirected_graph
      FROM vw_tsp_instances
     ORDER BY tsp_instance_id;"

  echo
  echo "=== supplied tour witnesses ==="
  psql_db -c "
    SELECT candidate_tour_id, total_travel_cost,
           is_hamiltonian_cycle_witness, is_optimality_proved, residual_claim
      FROM vw_candidate_tours
     ORDER BY candidate_tour_id;"

  echo
  echo "=== degree-two lower bound ==="
  psql_db -c "
    SELECT local_degree_bound_id, instance_stop, local_bound_cost,
           is_two_cheapest_witness
      FROM vw_local_degree_bounds
     ORDER BY local_degree_bound_id;"
  psql_db -c "
    SELECT instance_lower_bound_id, total_local_degree_bound_cost,
           lower_bound_cost, is_certified
      FROM vw_instance_lower_bounds
     ORDER BY instance_lower_bound_id;"
  psql_db -c "
    SELECT optimality_certificate_id, candidate_travel_cost, lower_bound_cost,
           is_passing, scope_claim
      FROM vw_optimality_certificates
     ORDER BY optimality_certificate_id;"

  echo
  echo "=== frontier obligations ==="
  psql_db -c "
    SELECT tsp_frontier_obligation_id, obligation_kind, status,
           is_imported_dependency, certificate_type
      FROM vw_tsp_frontier_obligations
     ORDER BY tsp_frontier_obligation_id;"

  echo
  echo "=== invariants ==="
  psql_db -c "
    SELECT tsp_graph_invariant_check_id, is_passing
      FROM vw_tsp_graph_invariant_checks
     ORDER BY tsp_graph_invariant_check_id;"
  psql_db -c "
    SELECT tsp_invariant_check_id, is_passing
      FROM vw_tsp_invariant_checks
     ORDER BY tsp_invariant_check_id;"

  echo
  echo "=== residual search ==="
  psql_db -c "
    SELECT search_metric_id, search_question, branch_count_before,
           branch_count_after, search_elimination_pct, residual_ambiguity_count
      FROM vw_search_metrics
     ORDER BY search_metric_id;"
}

cmd_contract() {
  python3 - <<'PY'
import json
from pathlib import Path
p = Path("problem-contract.json")
if not p.is_file():
    raise FileNotFoundError(f"missing required contract: {p}")
c = json.loads(p.read_text())
print(f"{c['Title']} v{c['Version']}")
print("status:", c["Status"])
print("scope:", c["Scope"])
print("claims:", json.dumps(c["Claims"], sort_keys=True))
print("frontier:")
for item in c["RemainingFrontier"]:
    print(" -", item)
PY
}

cmd_stop() {
  echo "[tsp] dropping database $DB"
  psql -h "$PGHOST" -U "$PGUSER" -q -d postgres -c "DROP DATABASE IF EXISTS $DB"
}

cmd_all() {
  cmd_validate
  cmd_build
  cmd_db
  cmd_test
  echo
  cmd_show
}

SUB="${1:-all}"
shift || true
case "$SUB" in
  all)      cmd_all ;;
  validate) cmd_validate ;;
  build)    cmd_build ;;
  db)       cmd_db ;;
  test)     cmd_test ;;
  show)     cmd_show ;;
  contract) cmd_contract ;;
  stop)     cmd_stop ;;
  restart)  cmd_stop; cmd_all ;;
  -h|--help|help) sed -n '2,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ;;
  *) echo "unknown subcommand '$SUB' (try: ./start.sh help)" >&2; exit 2 ;;
esac
