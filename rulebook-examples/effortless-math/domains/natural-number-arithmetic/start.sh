#!/usr/bin/env bash
# ============================================================================
# natural-number-arithmetic — sub-graph control panel
# ============================================================================
# Manages the whole natural-number-arithmetic sub-graph directly from this
# folder. The sub-graph is two things:
#
#   1. theorem-contract.json  — the Peano (Zero/Successor) contract. Part of the
#      main effortless-math rulebook; no build/DB of its own.
#   2. bit-calculator/        — a federated provider: gate-level 4-bit arithmetic
#      as data, with its own effortless build, standalone Postgres, and tests.
#
# Subcommands:
#   ./start.sh all       (default) build -> db -> test -> boot the calculator app
#   ./start.sh app       boot the Casio-style calculator (API + Vite web together)
#   ./start.sh server    the calc API only (drives the gate engine)
#   ./start.sh web       the Vite React web app only
#   ./start.sh build     effortless build the bit-calculator (SQL + rulespeak),
#                        then normalize its rulebook (single-line leaves)
#   ./start.sh db        (re)create the standalone Postgres from generated SQL
#   ./start.sh test      run the conformance harness (invariant + substrate equiv)
#   ./start.sh netlist   exhaustive netlist validation (Python simulator)
#   ./start.sh show      print the flagship answers from vw_computation_answer
#   ./start.sh calc A OP B   compute A OP B live through the gate engine
#                            (OP is one of + - x / ; e.g. ./start.sh calc 3 + 5)
#   ./start.sh contract  show the Peano + bit-calculator provider contracts
#   ./start.sh stop      free the app ports and drop the standalone Postgres DB
#   ./start.sh restart   stop then all
#
# `db` always drops-and-recreates the database first, and app boots always free
# their ports first — restart is one command.
# ============================================================================
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

HERE="$(pwd)"
BITCALC="$HERE/bit-calculator"
PG_DIR="$BITCALC/effortless-postgres"
APP="$BITCALC/app"

# Deterministic defaults derived from the sub-graph; env vars only override.
DB="${BITCALC_DB:-erb_bit_calculator}"
PGHOST="${PGHOST:-localhost}"
PGUSER="${PGUSER:-postgres}"
SERVER_PORT="${SERVER_PORT:-3040}"
WEB_PORT="${WEB_PORT:-5180}"
export BITCALC_DB="$DB" PGHOST PGUSER SERVER_PORT WEB_PORT
export ERB_DOMAIN="${ERB_DOMAIN:-effortless-math}"

# Prefer a homebrew pg16 if present, else whatever psql is on PATH.
if [ -x /opt/homebrew/opt/postgresql@16/bin/psql ]; then
  export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
fi
# Ensure the effortless CLI is on PATH for `build`.
if command -v effortless >/dev/null 2>&1; then
  export PATH="$(dirname "$(command -v effortless)"):$PATH"
fi

psql_db() { psql -h "$PGHOST" -U "$PGUSER" -d "$DB" -v ON_ERROR_STOP=1 "$@"; }

kill_port() {
  local p="$1" pids
  pids="$(lsof -ti:"$p" 2>/dev/null || true)"
  [ -n "$pids" ] && { echo "[nna] freeing port $p"; kill $pids 2>/dev/null || true; sleep 0.4; }
  return 0
}

ensure_deps() {
  [ -d "$1/node_modules" ] || { echo "[nna] installing deps in $(basename "$1")"; ( cd "$1" && npm install --silent ); }
}

db_ready() {
  # The app needs the standalone DB with the settling engine loaded. If the
  # answer view isn't there yet, build the DB first (deterministic; drop-first).
  if ! psql_db -tAc "SELECT 1 FROM pg_views WHERE viewname='vw_computation_answer'" 2>/dev/null | grep -q 1; then
    echo "[nna] database $DB not ready — initializing it first"
    cmd_db
  fi
}

cmd_build() {
  echo "[nna] effortless build → bit-calculator (SQL + rulespeak)"
  ( cd "$BITCALC" && effortless build )
  # effortless build re-expands the rulebook; normalize to single-line leaves.
  local fmt="$HERE/../../scripts/format-rulebook.py"
  if [ -f "$fmt" ]; then
    echo "[nna] normalizing bit-calculator rulebook (single-line leaves)"
    python3 "$fmt" "$BITCALC/effortless-rulebook/bit-calculator-rulebook.json"
  fi
}

cmd_db() {
  # start.sh owns "make the database exist" (drop + create — the restart story);
  # the transpiler-GENERATED reset-rulebook-db.sh owns "load all the SQL into it" (every
  # NN[b]-*.sql: schema, functions, ALL views, data, the 03b gate engine). There
  # is exactly ONE initializer — the generated one — pointed at our domain DB.
  echo "[nna] (re)creating standalone Postgres: $DB"
  # Boot any stale sessions so the drop can't be blocked — restart is one command.
  psql -h "$PGHOST" -U "$PGUSER" -q -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB' AND pid<>pg_backend_pid()" \
    >/dev/null 2>&1 || true
  psql -h "$PGHOST" -U "$PGUSER" -q -c "DROP DATABASE IF EXISTS $DB"
  psql -h "$PGHOST" -U "$PGUSER" -q -c "CREATE DATABASE $DB"
  echo "[nna] loading generated SQL (schema + functions + views + data + gate engine)"
  DATABASE_URL="postgresql://$PGUSER@$PGHOST:5432/$DB" bash "$PG_DIR/reset-rulebook-db.sh"
}

cmd_test() {
  echo "[nna] conformance: invariant (value_ok) + substrate equivalence"
  python3 "$BITCALC/testing/take-test.py"
}

cmd_netlist() {
  echo "[nna] exhaustive netlist validation (Python simulator vs reference arithmetic)"
  ( cd "$BITCALC/scripts" && python3 build_netlists.py >/dev/null && python3 validate_netlists.py )
}

cmd_show() {
  echo "[nna] flagship results settled by the gate engine:"
  psql_db -c "
    SELECT op, a_value AS a, b_value AS b, result_bits, result_value, expected_value, value_ok
    FROM vw_computation_answer WHERE is_flagship = 1 ORDER BY op;" 2>&1 | grep -v NOTICE
}

# Compute A OP B live. We insert a Computations row (input bits only), let the
# engine settle it, read the answer back, then remove the row. The rulebook stays
# the source of truth for the four flagship rows; this is an ad-hoc scratch eval.
cmd_calc() {
  local a op b
  a="${1:-}"; op="${2:-}"; b="${3:-}"
  if [ -z "$a" ] || [ -z "$op" ] || [ -z "$b" ]; then
    echo "usage: ./start.sh calc A OP B    (OP is + - x /)"; exit 2
  fi
  local opname comp width=4
  case "$op" in
    +) opname="add"; comp="comp-add4" ;;
    -) opname="sub"; comp="comp-sub4" ;;
    x|X|\*) opname="mul"; comp="comp-mul4" ;;
    /) opname="div"; comp="comp-div4" ;;
    *) echo "unknown op '$op' (use + - x /)"; exit 2 ;;
  esac
  if [ "$a" -lt 0 ] || [ "$a" -gt 15 ] || [ "$b" -lt 0 ] || [ "$b" -gt 15 ]; then
    echo "operands must be 0..15 (4-bit)"; exit 2
  fi
  if [ "$opname" = "div" ] && [ "$b" -eq 0 ]; then
    echo "division by zero is undefined"; exit 2
  fi
  local abits bbits prefix cid
  abits="$(python3 -c "print(format($a,'04b'))")"
  bbits="$(python3 -c "print(format($b,'04b'))")"
  cid="scratch--${opname}--${a}--${b}"
  case "$opname" in add|sub) prefix="s" ;; mul) prefix="p" ;; div) prefix="q" ;; esac

  psql_db -q -c "
    INSERT INTO computations
      (computation_id, op, component_id, a_value, b_value, a_bits, b_bits,
       expected_bits, expected_value, is_flagship)
    VALUES ('$cid','$opname','$comp',$a,$b,'$abits','$bbits','',0,0)
    ON CONFLICT (computation_id) DO UPDATE SET
      op=EXCLUDED.op, component_id=EXCLUDED.component_id, a_value=EXCLUDED.a_value,
      b_value=EXCLUDED.b_value, a_bits=EXCLUDED.a_bits, b_bits=EXCLUDED.b_bits;" \
    2>&1 | grep -v NOTICE || true

  # Read the 4-bit result register (same as the app): displayed value wraps mod 16,
  # overflow flags when the true result didn't fit.
  local res
  res="$(psql_db -tAF, -c "SELECT bits, val, overflow, full_val FROM erb_result_register('$cid','$prefix',4);" 2>/dev/null | grep -v NOTICE | tail -1)"
  psql_db -q -c "DELETE FROM computations WHERE computation_id='$cid';" 2>&1 | grep -v NOTICE || true

  local bits val ovf full
  IFS=, read -r bits val ovf full <<<"$res"
  if [ "$ovf" = "t" ]; then
    echo "[nna] $a $op $b  =  $val   (4-bit register: $bits · OVERFLOW — true value $full wrapped mod 16)"
  else
    echo "[nna] $a $op $b  =  $val   (4-bit register: $bits, settled by the netlist)"
  fi
}

cmd_contract() {
  echo "=== Peano contract (theorem-contract.json) ==="
  python3 -c "import json; c=json.load(open('theorem-contract.json')); print(c['Title']); print(' ', c['Statement']); print('  status:', c['Theorems'][0]['ProofStatus'], '| imports:', c['RemainingImports'])"
  echo
  echo "=== bit-calculator provider certificate ==="
  python3 -c "import json; c=json.load(open('bit-calculator/provider-certificate.json')); print(c['Title'], 'v'+c['Version']); print(' ', c['Statement']); print('  status:', c['ProofStatus'], '| imports:', c['RemainingImports']); print('  substrate equivalence:', c['SubstrateEquivalence']['Agreements'], 'of', c['SubstrateEquivalence']['ComputationsChecked'], 'agree')"
}

# ---- the Casio-style calculator app (API + Vite web) ----
# The '=' key posts to the API, which settles the netlist in Postgres and reads
# the answer off the output pins. No arithmetic runs in JS — the gates compute.
cmd_server() {
  db_ready
  kill_port "$SERVER_PORT"
  ensure_deps "$APP/server"
  echo "[nna] calc API → http://localhost:$SERVER_PORT (gate engine over $DB)"
  ( cd "$APP/server" && PORT="$SERVER_PORT" npm run dev )
}

cmd_web() {
  kill_port "$WEB_PORT"
  ensure_deps "$APP/web"
  echo "[nna] calculator → http://localhost:$WEB_PORT"
  ( cd "$APP/web" && npm run dev )
}

cmd_app() {
  db_ready
  kill_port "$SERVER_PORT"
  kill_port "$WEB_PORT"
  ensure_deps "$APP/server"
  ensure_deps "$APP/web"
  echo "[nna] calc API → http://localhost:$SERVER_PORT   calculator → http://localhost:$WEB_PORT"
  ( cd "$APP/server" && PORT="$SERVER_PORT" npm run dev ) &
  local server_pid=$!
  trap 'kill $server_pid 2>/dev/null || true' EXIT INT TERM
  ( cd "$APP/web" && npm run dev )
}

cmd_stop() {
  kill_port "$SERVER_PORT"
  kill_port "$WEB_PORT"
  echo "[nna] dropping database $DB"
  psql -h "$PGHOST" -U "$PGUSER" -q -c "DROP DATABASE IF EXISTS $DB" 2>&1 | grep -v NOTICE || true
  echo "[nna] stopped"
}

cmd_all() {
  cmd_build
  cmd_db
  cmd_test
  echo
  cmd_show
  echo
  echo "[nna] booting the calculator app…"
  cmd_app
}

SUB="${1:-all}"
shift || true
case "$SUB" in
  all)      cmd_all ;;
  app)      cmd_app ;;
  server)   cmd_server ;;
  web)      cmd_web ;;
  build)    cmd_build ;;
  db)       cmd_db ;;
  test)     cmd_test ;;
  netlist)  cmd_netlist ;;
  show)     cmd_show ;;
  calc)     cmd_calc "$@" ;;
  contract) cmd_contract ;;
  stop)     cmd_stop ;;
  restart)  cmd_stop; cmd_all ;;
  -h|--help|help) sed -n '2,32p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ;;
  *) echo "unknown subcommand '$SUB' (try: ./start.sh help)"; exit 2 ;;
esac
