#!/usr/bin/env python3
"""Conformance test for the bit-calculator: a 4-bit ripple-carry adder that is
PURE RULEBOOK DATA.

The claim under test: nothing arithmetic is stored and no hand-written engine
exists. The rulebook holds 3 gate types, 12 gate truth rows, and 29 named wires
(9 seeded inputs + 20 gate-driven). Every result bit is a lookup into a gate
truth table keyed on the two driver wires' own computed bits -- expressed as
plain Excel formulas the transpiler compiles into SQL.

Two checks:

  1. EXHAUSTIVE: for all 256 (A,B) pairs in 0..15, seed the 9 input wires and
     read the 5 result wires back out of vw_wires. The value must equal A+B.
     The ONLY arithmetic in this file is (a) computing the expected answer to
     compare against, and (b) weighting the result bits by place value. The
     circuit itself does neither -- it looks bits up in truth tables.

  2. STRUCTURAL: the model is honest -- the calculator's tables carry no
     arithmetic, the customize files are empty (no hand-written engine), and
     there is no function-overrides directory.

Run: python3 testing/take-test.py     (exit 0 = PASS)
"""
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BITCALC = HERE.parent
RULEBOOK = BITCALC / "effortless-rulebook" / "bit-calculator-rulebook.json"
PG_DIR = BITCALC / "effortless-postgres"
DB = os.environ.get("BITCALC_DB", "erb_bit_calculator")
PGHOST = os.environ.get("PGHOST", "localhost")
PGUSER = os.environ.get("PGUSER", "postgres")

PG16 = "/opt/homebrew/opt/postgresql@16/bin"
if os.path.isdir(PG16):
    os.environ["PATH"] = PG16 + os.pathsep + os.environ["PATH"]

# The result bus: which wires spell the answer, and at what place value.
# This is rulebook structure, not arithmetic -- bit i of a ripple-carry adder is
# full-adder i's sum wire, and the top bit is the last carry-out.
NBITS = 4
RESULT_WIRES = [(f"fa{i}_sum", 1 << i) for i in range(NBITS)] + [(f"fa{NBITS-1}_cout", 1 << NBITS)]
INPUT_WIRES = [f"a{i}" for i in range(NBITS)] + [f"b{i}" for i in range(NBITS)] + ["cin"]


def psql(sql):
    r = subprocess.run(
        ["psql", "-h", PGHOST, "-U", PGUSER, "-d", DB, "-tAF,", "-c", sql],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"psql failed: {r.stderr.strip()}")
    return [ln for ln in r.stdout.strip().splitlines() if ln and "NOTICE" not in ln]


def seed(a, b):
    """Write the ONLY thing an app is allowed to write: the 9 input bits."""
    sets = []
    for i in range(NBITS):
        sets.append(f"WHEN 'a{i}' THEN {(a >> i) & 1}")
        sets.append(f"WHEN 'b{i}' THEN {(b >> i) & 1}")
    sets.append("WHEN 'cin' THEN 0")
    ids = ",".join(f"'{w}'" for w in INPUT_WIRES)
    psql(f"UPDATE wires SET seeded_bit = CASE wire_id {' '.join(sets)} END "
         f"WHERE wire_id IN ({ids})")


def read_answer():
    """Read the settled result wires out of the view and weight them."""
    ids = ",".join(f"'{w}'" for w, _ in RESULT_WIRES)
    rows = psql(f"SELECT wire_id, computed_bit FROM vw_wires WHERE wire_id IN ({ids})")
    bits = {}
    for ln in rows:
        wid, cb = ln.split(",")
        if cb == "":
            raise RuntimeError(f"wire {wid} settled to NULL -- the netlist did not compute")
        bits[wid] = int(cb)
    return sum(bits[w] * place for w, place in RESULT_WIRES)


def main():
    failures = []
    rb = json.loads(RULEBOOK.read_text())

    # ---- check 1: exhaustive -- all 256 four-bit additions ----
    tested = 0
    for a in range(16):
        for b in range(16):
            seed(a, b)
            got = read_answer()
            tested += 1
            if got != a + b:
                failures.append(f"[exhaustive] {a} + {b}: circuit says {got}, want {a + b}")
    print(f"exhaustive 4-bit additions: {tested - len([f for f in failures if '[exhaustive]' in f])}/{tested} correct")

    # ---- check 2: structural -- the model is honest ----
    wires = rb["Wires"]["data"]
    truth = rb["GateTruthRows"]["data"]
    seeded = [w for w in wires if w.get("SeededBit") is not None]
    driven = [w for w in wires if w.get("Gate")]
    print(f"rulebook: {len(wires)} wires ({len(seeded)} seeded inputs, {len(driven)} gate-driven), "
          f"{len(truth)} gate truth rows, {len(rb['GateTypes']['data'])} gate types")

    if len(wires) != 29:
        failures.append(f"[structure] expected 29 wires, found {len(wires)}")
    if len(truth) != 12:
        failures.append(f"[structure] expected 12 gate truth rows, found {len(truth)}")

    # No wire may store a result: only inputs carry a bit, and only via SeededBit.
    for w in driven:
        if w.get("SeededBit") is not None:
            failures.append(f"[structure] gate-driven wire {w['WireId']} has a stored SeededBit "
                            f"-- that would be a stored answer")

    # The engine must not exist as hand-written SQL.
    for f in ("03b-customize-views.sql", "02b-customize-functions.sql"):
        p = PG_DIR / f
        if p.exists():
            body = [ln for ln in p.read_text().splitlines()
                    if ln.strip() and not ln.strip().startswith("--")]
            if body:
                failures.append(f"[structure] {f} contains {len(body)} lines of hand-written SQL "
                                f"-- the engine must come from the rulebook, not by hand")
    if (PG_DIR / "function-overrides").is_dir():
        overrides = list((PG_DIR / "function-overrides").glob("*.sql"))
        if overrides:
            failures.append(f"[structure] function-overrides/ exists with {len(overrides)} file(s) "
                            f"-- the generated functions must stand on their own")
    print("structural: no stored answers, no hand-written engine, no function overrides")

    if failures:
        print("\nFAIL:")
        for f in failures[:20]:
            print("  " + f)
        if len(failures) > 20:
            print(f"  ... and {len(failures) - 20} more")
        sys.exit(1)
    print("\nbit-calculator conformance: PASS")


if __name__ == "__main__":
    main()
