# notation-invariance — the many-to-one receipt

```bash
python3 testing/notation-invariance/notation-invariance.py
```

Exits `0` when the receipt holds, non-zero when it does not. Requires a local
Postgres on `localhost:5432`, plus `psycopg2` and `pyyaml`.

## What it measures

Ten notationally different serializations of the same rulebook content are each
loaded into Postgres through this project's own **generated** SQL
(`01-drop-and-create-tables.sql`, `02-create-functions.sql`,
`03-create-views.sql`). For each notation three hashes are recorded:

| hash | what it covers | expectation |
|---|---|---|
| `input` | the notation's bytes | all different |
| `state` | the substrate's content, read back under a canonical order | all identical |
| `answers` | the eight-clause gate verdicts, computed by the generated SQL functions | all identical |

Many texts in. One state. One set of answers.

## Why the collapse is the point, and high fidelity is not

The intuitive experiment is a round trip: JSON out, JSON back, compare bytes.
That experiment is weaker than it looks. Byte-for-byte fidelity requires the
intermediate to preserve key order, whitespace and formatting — that is, to
preserve exactly the notational surplus — which is indistinguishable from the
intermediate being a **cipher** of the text. High fidelity is evidence for the
skeptical reading, not against it.

The collapse is the receipt a cipher cannot fake, because a cipher is injective
by construction. Nine byte-streams that differ in every delimiter, in key order,
in row order, in whitespace significance, in whether a value is an element or an
attribute, arriving at one state and one set of answers, is a **many-to-one**
result. The notational distinctions are provably destroyed while every computed
answer is provably preserved.

## The variants

| # | notation | what it varies |
|---|---|---|
| 01 | `canonical.json` | the rulebook file, byte for byte as it sits on disk |
| 02 | `keys-sorted.json` | key order alphabetised |
| 03 | `rows-reversed.json` | document order destroyed outright |
| 04 | `compact.json` | no whitespace at all |
| 05 | `block.yaml` | a different language, whitespace load-bearing |
| 06 | `flow.yaml` | the same language as 05, unrecognisably different bytes |
| 07 | `elements.xml` | values as child elements, nulls as `xsi:nil` |
| 08 | `attributes.xml` | the same language as 07, values as attributes instead |
| 09 | `tables.csv` | tabular, one table at a time, `\N` for null |
| 10 | `fixed-width-30.csv` | **expected to diverge** — see below |

Pairs 02/03/04, 05/06 and 07/08 matter most: they show the collapse happening
*within* a single language, so the result is not an artifact of comparing
different languages.

## The variant that is supposed to fail

`10-fixed-width-30.csv` cannot hold a text value longer than 30 characters, the
way COBOL's `PIC X(30)` or a fixed-record importer cannot. This rulebook has 48
raw text cells over that limit (`Statement` runs to 231 characters), so the
notation is genuinely lossy. It diverges, and the run prints the columns and rows
that broke.

It is here because **a test that cannot fail proves nothing.** Convergence is a
claim about the content, not a property this harness confers on whatever it is
given.

An earlier attempt used a CSV with no null convention as the deliberate failure.
It converged, because this rulebook contains zero SQL nulls — every empty cell is
an empty string. The harness caught that itself and refused to pass, which is
what the `EXPECTED_TO_DIVERGE` assertion is for.

## What the substrate computes rather than carries

The base tables hold **raw facts only**. Eight derived fields —
`PredictedAnswer`, `PredictionFail`, `PredictionPredicates`, `Question`,
`HasGrammar`, `IsDescriptionOf`, `RelationshipToConcept`,
`IsOpenClosedWorldConflicted` — travel in the notations as display copies, are
ignored on load, and are recomputed by generated SQL. The eight-clause gate is
`calc_language_candidates_predicted_answer()`, a generated function.

This matters to the argument: a cipher holds a message, it does not have
consequences. The state here produces verdicts nobody serialized.

## Honest limits

- **The emitters and parsers are hand-written**, as every serializer is. What is
  not hand-written is the convergence point: the schema, the gate and every
  derived value are generated SQL evaluated by Postgres. This script never
  computes an answer; it reads them back out.
- **The canonical read imposes an order** (rows by primary key, columns
  alphabetical). That is not hiding a difference. A relation is a set, and the
  database stores no fact recording which notation produced it. The run also
  reports the count of distinct *physical* storage orders, which is normally 2
  — insertion order does differ, and that is precisely a storage artifact rather
  than content.
- **Scope.** `ERBCustomizations` and `__meta__` are excluded because the
  transpiler generates no base table for them. Two tables and 50 rows are in
  scope.
- **Where the SQL run stops.** Files are applied in lex order exactly as
  `init-db.sh` does, including the `*b-customize-*` seams, but stopping after
  `03b`. `04`/`04b` would enable row security with no policies, and
  `05-insert-data.sql` would load the canonical seed data straight over the
  variant under test.

## Safety

The harness runs only against its own scratch database,
`erb_ieal_notation_invariance`, which it creates if absent. The generated
`01-*.sql` drops every table in the target database, so `current_database()` is
asserted before that file is ever applied. `erb_is_everything_a_language` is
never touched.
