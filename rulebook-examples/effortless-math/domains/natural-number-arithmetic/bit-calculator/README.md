# Bit Calculator — arithmetic all the way down to the gates, as data

A federated provider for `natural-number-arithmetic` that proves the four flagship
facts (`2+2=4`, `4−2=2`, `2×2=4`, `4÷2=2`) a **second, independent way**: not through
Peano `Zero`/`Successor` chains, but through a **logic-gate netlist** — AND/OR/XOR/NOT
wired up into a 4-bit adder, subtractor, multiplier, and divider, exactly the way a
CPU does it.

Everything below the input bits is **data**. There is no arithmetic in any formula,
injector, or hand-written SQL. See [DESIGN.md](DESIGN.md) for the full model.

## The claim, made checkable

1. The rulebook expresses `2 + 2` as a `Computations` row carrying the bit
   decomposition (`a_bits="0010"`, `b_bits="0010"`). **This is the only place that
   knows "2 is these bits."**
2. A width-agnostic **Chinese-room engine** (`erb_input_wires`) reads that row and lays
   *only the input bits* onto wires. It has no idea what operation it feeds; it works
   unchanged for 2, 4, 8, or N bits.
3. A recursive **fixed-point settle** (`erb_settle`) walks the netlist — firing gate
   truth-table lookups and propagating wires — until every internal and output wire
   settles. Nothing arithmetic is stored; every result bit is computed.
4. The **answer is an invariant over those rows**: `vw_computation_answer.value_ok`
   asserts the settled output pins spell the expected numeral (`0100 = 4`). The engine
   never learns it did addition — the gates did.

## Two substrates agree

| Substrate | File | Contains arithmetic? |
|---|---|---|
| Postgres | `effortless-postgres/03b-customize-views.sql` | no — truth-table lookups + wire propagation |
| Python | `scripts/netlist_sim.py` | no — the same |

Both read only the rulebook tables and agree on **all 24 computations**. The four
netlists are validated exhaustively (256 input pairs each for add/sub/mul, 240 for
div) against reference arithmetic — but that reference lives *only* in the validator
harness (`scripts/validate_netlists.py`), never in the engine.

## Run it

```bash
# from the parent folder (domains/natural-number-arithmetic)
./start.sh db                # fresh standalone Postgres erb_bit_calculator from
                             #   the GENERATED SQL (schema, functions, all views,
                             #   data, and the 03b gate engine) — one initializer
python3 bit-calculator/testing/take-test.py   # invariant + substrate equivalence
```

The database is **`erb_bit_calculator`**. There is exactly one initializer: the
transpiler-generated `effortless-postgres/reset-rulebook-db.sh`, which loads every
`NN[b]-*.sql` file. `./start.sh db` creates the database and points that generated
init at it (`DATABASE_URL=…/erb_bit_calculator`) — start.sh owns "make the DB
exist", the generated script owns "load all the SQL". The app connects to the same
DB via `BITCALC_DB`.

Or drive it from the parent folder's control panel:

```bash
cd ..                 # domains/natural-number-arithmetic
./start.sh app        # Casio-style solar calculator at http://localhost:5180
```

The `app/` directory is a tiny Vite + React calculator (`app/web`) backed by an
Express API (`app/server`). The `=` key posts `{op, a, b}` to `/api/calc`, which
lays the input bits onto a scratch `computations` row, settles the netlist, reads
the answer off the output pins via `erb_result_register(cid, prefix, 4)`, and
removes the row. **No arithmetic runs in the app or the API — the gates compute.**

It is an **honest 4-bit calculator**. The result register is 4 bits wide, so the
display shows the true result *mod 16* and lights an **OVER** lamp when the gates
produced more than the register can hold:

| entry | shows | why |
|---|---|---|
| `2 + 2` | `4` | fits |
| `15 + 1` | `0` OVER | carry-out dropped (real hardware wrap) |
| `3 − 5` | `14` OVER | two's-complement −2 ≡ 14 mod 16 |
| `3 × 8` | `8` OVER | full product 24; register keeps low nibble `1000` |
| `7 × 7` | `1` OVER | 49 mod 16 |

The LCD shows the settled result bits (`b 1000` for `3×8`) and, on overflow, the
untruncated value (`24 wrapped mod 16`). The width is not hardcoded in the app —
it comes from `GET /api/config`, so the same UI honestly reflects whatever width
the netlist is built for. (The provider *proof* still uses the full-width product;
the 4-bit register is a display concern, exactly like a real ALU whose result
register is narrower than its internal datapath.)

Or inspect a single computation live:

```sql
SELECT op, a_value, b_value, result_bits, result_value, value_ok
FROM vw_computation_answer WHERE is_flagship = 1;
```

## Model (rulebook tables)

`GateTypes` (4) · `GateTruthRows` (14) · `Components` (10) · `ComponentPins` (118) ·
`ComponentInstances` (79) · `ComponentConnections` (295) · `Computations` (24).
Widening to 8 bits (or 200) adds *rows*, never code — `scripts/build_netlists.py` is
the schematic-capture aid that emits the netlists; change `W` and re-run.

## What the main rulebook imports

Only the versioned `provider-certificate.json` — the four flagship results, as a
corroborating cross-substrate witness (`FULLY_INTERNALIZED_FOR_SCOPE`,
`ActiveImportCount = 0`, zero imports above the logic-gate kernel). It is **not**
load-bearing and does not change any Peano theorem's zero-import status; it is a
second, disjoint witness that the network holds two independent proofs of the same
four facts.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
