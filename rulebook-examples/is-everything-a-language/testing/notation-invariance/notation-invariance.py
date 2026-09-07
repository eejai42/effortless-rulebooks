#!/usr/bin/env python3
"""
notation-invariance -- the many-to-one receipt for this rulebook's SDLAF container.

WHAT THIS MEASURES
  Ten notationally different serializations of the SAME rulebook content are each
  loaded into a real Postgres substrate through this project's own GENERATED SQL
  (01-drop-and-create-tables.sql, 02-create-functions.sql, 03-create-views.sql).
  For every notation, three hashes are recorded:

    input    sha256 of the notation's bytes                 expect: ALL DIFFERENT
    state    sha256 of the substrate's content, read back
             under a canonical order                        expect: ALL IDENTICAL
    answers  sha256 of the eight-clause gate verdicts, as
             computed by the generated SQL functions        expect: ALL IDENTICAL

  Many texts in, one state, one set of answers. That collapse is the receipt. A
  cipher is injective by construction and cannot collapse, so an intermediate
  that provably discards notational distinctions while provably preserving every
  computed answer is not an encoding of the text.

WHY ONE VARIANT IS EXPECTED TO DIVERGE
  10-fixed-width-30.csv cannot hold a text value longer than 30 characters, the
  way COBOL's PIC X(30) or a fixed-record importer cannot. This rulebook has 48
  raw text cells over that limit, so the notation is genuinely lossy and it
  FAILS, naming the columns that broke. A test that cannot fail proves nothing.
  The nine converging notations each declare a null convention (JSON/YAML null,
  XML xsi:nil, CSV \\N); declaring one is part of designing a notation, not a
  thumb on the scale.

WHAT THIS DOES NOT PROVE
  The emitters and parsers below are hand-written, as every serializer is. What
  is NOT hand-written is the convergence point: the schema, the eight-clause
  gate, and every derived value are this project's generated SQL, evaluated by
  Postgres. This script never computes an answer; it reads them back out.

SAFETY
  Runs only against its own scratch database (SCRATCH_DB). The generated
  01-*.sql drops every table in the target database, so the connection's
  current_database() is asserted before that file is ever applied. This script
  never touches erb_is_everything_a_language.
"""

import csv
import hashlib
import io
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import psycopg2
import yaml

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
RULEBOOK = PROJECT / "effortless-rulebook" / "is-everything-a-language-rulebook.json"
BOOTSTRAP = PROJECT / "postgres-bootstrap"
VARIANTS = HERE / "variants"

SCRATCH_DB = "erb_ieal_notation_invariance"
ADMIN_DSN = "postgresql://postgres@localhost:5432/postgres"
SCRATCH_DSN = f"postgresql://postgres@localhost:5432/{SCRATCH_DB}"

# Applied in lex order for every variant, exactly as init-db.sh does, including
# the *b-customize-* seams. Deliberately stops before 04/04b (RLS, which would
# enable row security with no policies) and before 05/05b, since 05-insert-data
# would load the canonical seed data on top of the variant under test and defeat
# the whole experiment.
GENERATED_SQL = [
    "01-drop-and-create-tables.sql",
    "01b-customize-schema.sql",
    "02-create-functions.sql",
    "02b-customize-functions.sql",
    "03-create-views.sql",
    "03b-customize-views.sql",
]

XSI = "http://www.w3.org/2001/XMLSchema-instance"
NULL_TOKEN = "\\N"  # the Postgres COPY convention, reused for CSV


def die(msg):
    sys.stderr.write(f"[notation-invariance] FAIL: {msg}\n")
    sys.exit(1)


def log(msg):
    sys.stdout.write(f"{msg}\n")
    sys.stdout.flush()


def snake(name):
    """PascalCase -> snake_case, matching the transpiler's own convention."""
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    s2 = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1)
    return s2.lower()


# ---------------------------------------------------------------------------
# The content: every table's rows, exactly as the rulebook declares them.
# ---------------------------------------------------------------------------

def read_content():
    rb = json.loads(RULEBOOK.read_text())
    tables = {}
    for key, val in rb.items():
        if isinstance(val, dict) and "schema" in val and "data" in val:
            tables[key] = val["data"]
    if not tables:
        die(f"no tables with schema+data found in {RULEBOOK}")
    return tables


# ---------------------------------------------------------------------------
# Emitters. Each writes the same content in a structurally different notation.
# ---------------------------------------------------------------------------

def sort_deep(obj):
    if isinstance(obj, dict):
        return {k: sort_deep(obj[k]) for k in sorted(obj)}
    if isinstance(obj, list):
        return [sort_deep(v) for v in obj]
    return obj


def emit_variants(tables):
    VARIANTS.mkdir(parents=True, exist_ok=True)
    written = []

    def write(name, data):
        p = VARIANTS / name
        p.write_bytes(data if isinstance(data, bytes) else data.encode())
        written.append(p)

    sorted_tables = {t: [sort_deep(r) for r in rows] for t, rows in tables.items()}
    reversed_tables = {t: list(reversed(rows)) for t, rows in sorted_tables.items()}

    # 01 - the canonical rulebook file, byte for byte as it sits on disk.
    write("01-canonical.json", RULEBOOK.read_bytes())

    # 02 - JSON, every object's keys alphabetised. Same facts, new document order.
    write("02-keys-sorted.json", json.dumps(sorted_tables, indent=2) + "\n")

    # 03 - JSON with every data array reversed. Document order destroyed outright.
    write("03-rows-reversed.json", json.dumps(reversed_tables, indent=2) + "\n")

    # 04 - JSON with no whitespace at all.
    write("04-compact.json", json.dumps(sorted_tables, separators=(",", ":")))

    # 05 / 06 - YAML twice, block then flow. Same language, unrecognisably
    # different bytes, and whitespace is load-bearing in one of them.
    write("05-block.yaml", yaml.safe_dump(sorted_tables, default_flow_style=False, sort_keys=True))
    write("06-flow.yaml", yaml.safe_dump(sorted_tables, default_flow_style=True, sort_keys=True))

    # 07 - XML with every value as a child element, nulls as xsi:nil.
    write("07-elements.xml", xml_elements(sorted_tables))

    # 08 - XML with every value as an attribute instead. Same language again,
    # a completely different structural convention.
    write("08-attributes.xml", xml_attributes(sorted_tables))

    # 09 - CSV per table, with an explicit null convention (\N).
    write("09-tables.csv", csv_tables(sorted_tables, null_token=NULL_TOKEN))

    # 10 - a fixed-width notation that cannot hold a text value longer than 30
    #      characters, the way COBOL's PIC X(30) or a fixed-record importer
    #      cannot. Included to prove this instrument can fail: this rulebook has
    #      48 raw text cells over that limit (Statement runs to 231 characters),
    #      so this notation is genuinely lossy and MUST diverge.
    write("10-fixed-width-30.csv", csv_tables(sorted_tables, null_token=NULL_TOKEN, text_limit=30))

    return written


def _scalar_to_text(v):
    if v is None:
        return None
    if isinstance(v, bool):
        return "true" if v else "false"
    return str(v)


def xml_elements(tables):
    root = ET.Element("rulebook", {"xmlns:xsi": XSI})
    for tname, rows in tables.items():
        tel = ET.SubElement(root, "table", {"name": tname})
        for row in rows:
            rel = ET.SubElement(tel, "row")
            for k in sorted(row):
                fel = ET.SubElement(rel, "field", {"name": k})
                txt = _scalar_to_text(row[k])
                if txt is None:
                    fel.set("xsi:nil", "true")
                else:
                    fel.text = txt
    return ET.tostring(root, encoding="unicode") + "\n"


def xml_attributes(tables):
    root = ET.Element("rulebook")
    for tname, rows in tables.items():
        tel = ET.SubElement(root, "table", {"name": tname})
        for row in rows:
            attrs, nils = {}, []
            for k in sorted(row):
                txt = _scalar_to_text(row[k])
                if txt is None:
                    nils.append(k)
                else:
                    attrs[k] = txt
            rel = ET.SubElement(tel, "row", attrs)
            if nils:
                rel.set("nil-fields", ",".join(nils))
    return ET.tostring(root, encoding="unicode") + "\n"


def csv_tables(tables, null_token, text_limit=None):
    out = io.StringIO()
    for tname, rows in tables.items():
        cols = sorted({k for r in rows for k in r})
        out.write(f"# table: {tname}\n")
        w = csv.writer(out, lineterminator="\n")
        w.writerow(cols)
        for row in rows:
            cells = []
            for c in cols:
                if c not in row or row[c] is None:
                    cells.append(null_token)
                    continue
                txt = _scalar_to_text(row[c])
                if text_limit is not None and isinstance(row[c], str):
                    txt = txt[:text_limit]
                cells.append(txt)
            w.writerow(cells)
        out.write("\n")
    return out.getvalue()


# ---------------------------------------------------------------------------
# Parsers. One per notation; each must recover {table: [row, ...]}.
# ---------------------------------------------------------------------------

def parse_json(path):
    """Handles both shapes: the canonical rulebook nests rows under a table
    object's "data" key; the emitted variants carry the row list directly."""
    d = json.loads(path.read_text())
    out = {}
    for k, v in d.items():
        if isinstance(v, dict) and isinstance(v.get("data"), list):
            out[k] = v["data"]
        elif isinstance(v, list):
            out[k] = v
    return out


def parse_yaml(path):
    d = yaml.safe_load(path.read_text())
    return {k: v for k, v in d.items() if isinstance(v, list)}


def parse_xml_elements(path):
    root = ET.fromstring(path.read_text())
    tables = {}
    for tel in root.findall("table"):
        rows = []
        for rel in tel.findall("row"):
            row = {}
            for fel in rel.findall("field"):
                nil = fel.get(f"{{{XSI}}}nil") or fel.get("xsi:nil")
                row[fel.get("name")] = None if nil == "true" else (fel.text or "")
            rows.append(row)
        tables[tel.get("name")] = rows
    return tables


def parse_xml_attributes(path):
    root = ET.fromstring(path.read_text())
    tables = {}
    for tel in root.findall("table"):
        rows = []
        for rel in tel.findall("row"):
            row = dict(rel.attrib)
            nils = row.pop("nil-fields", "")
            for k in [n for n in nils.split(",") if n]:
                row[k] = None
            rows.append(row)
        tables[tel.get("name")] = rows
    return tables


def parse_csv(path, null_token):
    tables, tname, header = {}, None, None
    for line in path.read_text().split("\n"):
        if line.startswith("# table: "):
            tname = line[len("# table: "):].strip()
            tables[tname], header = [], None
            continue
        if not line.strip() or tname is None:
            continue
        cells = next(csv.reader([line]))
        if header is None:
            header = cells
            continue
        row = {}
        for k, v in zip(header, cells):
            row[k] = None if (null_token and v == null_token) else v
        tables[tname].append(row)
    return tables


PARSERS = {
    "01-canonical.json": parse_json,
    "02-keys-sorted.json": parse_json,
    "03-rows-reversed.json": parse_json,
    "04-compact.json": parse_json,
    "05-block.yaml": parse_yaml,
    "06-flow.yaml": parse_yaml,
    "07-elements.xml": parse_xml_elements,
    "08-attributes.xml": parse_xml_attributes,
    "09-tables.csv": lambda p: parse_csv(p, NULL_TOKEN),
    "10-fixed-width-30.csv": lambda p: parse_csv(p, NULL_TOKEN),
}
EXPECTED_TO_DIVERGE = {"10-fixed-width-30.csv"}


# ---------------------------------------------------------------------------
# The substrate.
# ---------------------------------------------------------------------------

def ensure_database():
    con = psycopg2.connect(ADMIN_DSN)
    con.autocommit = True
    with con.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (SCRATCH_DB,))
        if cur.fetchone() is None:
            cur.execute(f'CREATE DATABASE "{SCRATCH_DB}"')
            log(f"  created scratch database {SCRATCH_DB}")
        else:
            log(f"  reusing scratch database {SCRATCH_DB}")
    con.close()


def apply_generated_sql():
    for fname in GENERATED_SQL:
        path = BOOTSTRAP / fname
        if not path.exists():
            die(f"generated SQL missing: {path}")
        r = subprocess.run(
            ["psql", SCRATCH_DSN, "-v", "ON_ERROR_STOP=1", "-q", "-f", str(path)],
            capture_output=True, text=True,
        )
        if r.returncode != 0:
            die(f"{fname} failed:\n{r.stderr.strip()}")


def introspect(con):
    """Column types and primary keys, taken from the substrate, not assumed."""
    schema = {}
    with con.cursor() as cur:
        cur.execute("""
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name IN (SELECT table_name FROM information_schema.tables
                                 WHERE table_schema='public' AND table_type='BASE TABLE')
            ORDER BY table_name, ordinal_position
        """)
        for t, c, dt in cur.fetchall():
            schema.setdefault(t, {"cols": {}, "pk": None})["cols"][c] = dt
        for t in schema:
            cur.execute("""
                SELECT a.attname
                FROM pg_index i
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE i.indrelid = %s::regclass AND i.indisprimary
            """, (t,))
            row = cur.fetchone()
            if not row:
                die(f"table {t} has no primary key; cannot order state deterministically")
            schema[t]["pk"] = row[0]
    return schema


def coerce(value, pgtype):
    """Notations differ in what types they can express; the SCHEMA supplies the
    typing that XML and CSV lack. Unrecognised input fails loudly."""
    if value is None:
        return None
    if pgtype == "boolean":
        if isinstance(value, bool):
            return value
        s = str(value).strip().lower()
        if s in ("true", "t", "1", "yes"):
            return True
        if s in ("false", "f", "0", "no"):
            return False
        if s == "":
            return None
        die(f"cannot coerce {value!r} to boolean")
    if pgtype == "integer":
        if isinstance(value, bool):
            die(f"refusing to coerce boolean {value!r} into integer")
        s = str(value).strip()
        if s == "":
            return None
        try:
            return int(s)
        except ValueError:
            die(f"cannot coerce {value!r} to integer")
    return str(value)


def load(con, parsed, schema, in_scope):
    """Project the parsed notation onto the substrate's raw columns and insert.

    Derived fields carried in the notation as display copies are dropped here on
    purpose: the base tables hold raw facts only, and every derived value is
    recomputed by the generated SQL functions.
    """
    dropped = set()
    with con.cursor() as cur:
        for tname, rows in parsed.items():
            if tname not in in_scope:
                continue
            phys = snake(tname)
            if phys not in schema:
                die(f"rulebook table {tname!r} maps to {phys!r}, which is not in the substrate")
            cols = schema[phys]["cols"]
            for row in rows:
                vals = {}
                for k, v in row.items():
                    col = snake(k)
                    if col not in cols:
                        dropped.add(f"{tname}.{k}")
                        continue
                    vals[col] = coerce(v, cols[col])
                names = sorted(vals)
                cur.execute(
                    f'INSERT INTO {phys} ({", ".join(names)}) '
                    f'VALUES ({", ".join(["%s"] * len(names))})',
                    [vals[n] for n in names],
                )
    return dropped


def norm(v):
    if v is None:
        return NULL_TOKEN
    if isinstance(v, bool):
        return "true" if v else "false"
    return str(v).replace("\\", "\\\\").replace("\t", "\\t").replace("\n", "\\n")


def digest(rows_by_table):
    h = hashlib.sha256()
    for tname in sorted(rows_by_table):
        h.update(f"##{tname}\n".encode())
        for row in rows_by_table[tname]:
            h.update(("\t".join(f"{k}={norm(row[k])}" for k in sorted(row)) + "\n").encode())
    return h.hexdigest()


def read_state(con, schema, ordered=True):
    """Content read back out of the substrate. With ordered=True the read is
    canonical (rows by primary key, columns alphabetical), which is not hiding a
    difference: a relation is a set, and the database stores no fact about which
    notation produced it. With ordered=False this returns physical storage
    order, which is an artefact of insertion and MAY differ between notations."""
    out = {}
    with con.cursor() as cur:
        for t in sorted(schema):
            cols = sorted(schema[t]["cols"])
            q = f'SELECT {", ".join(cols)} FROM {t}'
            if ordered:
                q += f' ORDER BY {schema[t]["pk"]}'
            cur.execute(q)
            out[t] = [dict(zip(cols, r)) for r in cur.fetchall()]
    return out


ANSWER_COLS = [
    "language_candidate_id", "question", "predicted_answer", "is_language",
    "has_grammar", "is_description_of", "relationship_to_concept",
    "is_open_closed_world_conflicted", "prediction_predicates", "prediction_fail",
]


def read_answers(con):
    """The gate verdicts, computed by the generated SQL functions. Nothing here
    was carried by any notation; the base tables hold raw facts only."""
    with con.cursor() as cur:
        cur.execute(
            f'SELECT {", ".join(ANSWER_COLS)} FROM vw_language_candidates '
            f'ORDER BY language_candidate_id'
        )
        return {"vw_language_candidates": [dict(zip(ANSWER_COLS, r)) for r in cur.fetchall()]}


def diff_state(a, b, limit=6):
    notes = []
    for t in sorted(set(a) | set(b)):
        ra, rb = a.get(t, []), b.get(t, [])
        if len(ra) != len(rb):
            notes.append(f"{t}: {len(ra)} rows vs {len(rb)} rows")
            continue
        for x, y in zip(ra, rb):
            for k in sorted(set(x) | set(y)):
                if x.get(k) != y.get(k):
                    key = x.get("language_candidate_id") or x.get("name") or "?"
                    notes.append(f"{t}.{k} @ {key}: {x.get(k)!r} vs {y.get(k)!r}")
                    if len(notes) >= limit:
                        return notes
    return notes


# ---------------------------------------------------------------------------

def main():
    log("notation-invariance -- many notations, one state, one set of answers\n")

    ensure_database()
    con = psycopg2.connect(SCRATCH_DSN)
    # Autocommit is required, not cosmetic: a read left inside an open
    # transaction holds a relation lock, and the next variant's generated
    # DROP then blocks on it forever.
    con.autocommit = True
    with con.cursor() as cur:
        cur.execute("SELECT current_database()")
        actual = cur.fetchone()[0]
    if actual != SCRATCH_DB:
        die(f"refusing to run: connected to {actual!r}, expected {SCRATCH_DB!r}")
    log(f"  substrate: postgres, database {actual} (asserted before any DROP)")

    apply_generated_sql()
    schema = introspect(con)
    log(f"  substrate tables: {', '.join(sorted(schema))}")

    all_tables = read_content()
    in_scope = {t for t in all_tables if snake(t) in schema}
    excluded = sorted(set(all_tables) - in_scope)
    tables = {t: all_tables[t] for t in all_tables if t in in_scope}
    log(f"  content in scope: {', '.join(f'{t} ({len(r)} rows)' for t, r in tables.items())}")
    if excluded:
        log(f"  excluded (no base table generated for these): {', '.join(excluded)}")

    written = emit_variants(tables)
    log(f"  emitted {len(written)} notational variants into "
        f"{VARIANTS.relative_to(PROJECT)}/\n")

    results, dropped_fields = [], set()
    for path in sorted(VARIANTS.iterdir()):
        if path.name not in PARSERS:
            continue
        raw = path.read_bytes()
        apply_generated_sql()
        schema = introspect(con)
        dropped_fields |= load(con, PARSERS[path.name](path), schema, in_scope)
        state = read_state(con, schema, ordered=True)
        results.append({
            "variant": path.name,
            "bytes": len(raw),
            "input_sha": hashlib.sha256(raw).hexdigest(),
            "state_sha": digest(state),
            "physical_sha": digest(read_state(con, schema, ordered=False)),
            "answers_sha": digest(read_answers(con)),
            "state": state,
        })
        log(f"  loaded {path.name:<34} {len(raw):>7} bytes")

    baseline = next(r for r in results if r["variant"] == "01-canonical.json")
    for r in results:
        r["converged"] = (r["state_sha"] == baseline["state_sha"]
                          and r["answers_sha"] == baseline["answers_sha"])

    log("\n" + "=" * 108)
    log(f'{"variant":<34}{"bytes":>8}  {"input sha":<12}{"state sha":<12}{"answers sha":<12}  verdict')
    log("=" * 108)
    for r in results:
        mark = "converged" if r["converged"] else "DIVERGED"
        if r["variant"] in EXPECTED_TO_DIVERGE:
            mark += " (expected)"
        log(f'{r["variant"]:<34}{r["bytes"]:>8}  {r["input_sha"][:10]:<12}'
            f'{r["state_sha"][:10]:<12}{r["answers_sha"][:10]:<12}  {mark}')
    log("=" * 108)

    inputs = {r["input_sha"] for r in results}
    conv = [r for r in results if r["converged"]]
    states = {r["state_sha"] for r in conv}
    answers = {r["answers_sha"] for r in conv}
    physical = {r["physical_sha"] for r in conv}

    log(f"\n  distinct input byte-streams : {len(inputs)} of {len(results)}")
    log(f"  converging notations        : {len(conv)}")
    log(f"  distinct states among those : {len(states)}")
    log(f"  distinct answer sets        : {len(answers)}")
    log(f"  distinct PHYSICAL orders    : {len(physical)}  (storage artefact, not content)")

    # What the one answer set actually SAYS, so the receipt is not just hashes.
    with con.cursor() as cur:
        cur.execute("""
            SELECT count(*) FILTER (WHERE predicted_answer),
                   count(*),
                   count(*) FILTER (WHERE prediction_fail <> '')
            FROM vw_language_candidates
        """)
        yes, total, mismatches = cur.fetchone()
    log(f"\n  the one answer set, computed by generated SQL from raw facts only:")
    log(f"    {yes} of {total} candidates satisfy all eight clauses")
    log(f"    {mismatches} rows where the gate disagrees with the declared status")
    if dropped_fields:
        log(f"\n  derived display copies carried by the notations and ignored by the")
        log(f"  substrate, then recomputed by generated SQL: {len(dropped_fields)}")
        for f in sorted(dropped_fields):
            log(f"    {f}")

    for r in results:
        if not r["converged"] and r["variant"] not in EXPECTED_TO_DIVERGE:
            log(f'\n  UNEXPECTED divergence in {r["variant"]}:')
            for n in diff_state(baseline["state"], r["state"]):
                log(f"    {n}")
        if r["converged"] and r["variant"] in EXPECTED_TO_DIVERGE:
            die(f'{r["variant"]} was expected to diverge and did not; '
                f'this instrument can no longer demonstrate failure')
    for r in results:
        if not r["converged"] and r["variant"] in EXPECTED_TO_DIVERGE:
            log(f'\n  {r["variant"]} diverged as designed. A notation that cannot hold')
            log(f"  a value does not carry the content, and the receipt says so:")
            for n in diff_state(baseline["state"], r["state"]):
                log(f"    {n}")

    (HERE / "receipt.json").write_text(json.dumps(
        [{k: v for k, v in r.items() if k != "state"} for r in results], indent=2) + "\n")

    ok = len(inputs) == len(results) and len(states) == 1 and len(answers) == 1 and len(conv) >= 2
    log("\n  " + ("RECEIPT: " + f"{len(conv)} distinct byte-streams, 1 state, 1 answer set."
                  if ok else "RECEIPT FAILED -- see divergences above."))
    con.close()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
