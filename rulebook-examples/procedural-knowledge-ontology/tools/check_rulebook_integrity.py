#!/usr/bin/env python3
"""Structural integrity checks the transpiler will not do for you.

Run before `effortless build`. Each check exists because the corresponding
breakage actually happened in this repo and produced a GREEN build with a
broken database.

  1. relationship-with-formula
     A relationship field must carry `RelatedTo`, not `formula`. With a
     `formula` the transpiler emits `SELECT (TargetTable)::text` -- a function
     that references a bare table name as a column and fails at CALL time,
     not build time. 17 fields were silently corrupted this way (something in
     the toolchain rewrites RelatedTo -> formula), and the failure only
     surfaced when a query happened to touch the view.

  2. dangling RelatedTo
     A relationship pointing at a table that does not exist.

  3. IIF
     Documented transpiler defect: emits a warning comment, returns NULL, and
     the build still reports success.

  4. multi-criteria COUNTIFS
     Documented defect: silently drops the 2nd+ criteria, so the aggregation
     returns a total count and looks plausible.

  5. INDEX/MATCH on a non-primary-key
     Only matches the target table's PK; anything else generates nothing.

Exit 1 on any finding.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RB = os.path.join(os.path.dirname(HERE), "effortless-rulebook",
                  "procedural-knowledge-ontology-rulebook.json")


def main():
    rb = json.load(open(RB))
    tables = {k: v for k, v in rb.items()
              if isinstance(v, dict) and "schema" in v}
    problems = []

    for tname, t in tables.items():
        pk = t["schema"][0]["name"] if t["schema"] else None
        for f in t["schema"]:
            fname, ftype = f.get("name"), f.get("type")
            where = f"{tname}.{fname}"

            if ftype == "relationship":
                if "formula" in f:
                    problems.append(
                        f"{where}: relationship carries `formula` "
                        f"({f['formula']!r}). Must be `RelatedTo`. The "
                        f"transpiler will emit SELECT ({f['formula']})::text, "
                        f"a function that fails at call time.")
                tgt = f.get("RelatedTo")
                if tgt and tgt not in tables:
                    problems.append(
                        f"{where}: RelatedTo points at {tgt!r}, "
                        f"which is not a table in this rulebook.")
                if not tgt and "formula" not in f:
                    problems.append(
                        f"{where}: relationship has no RelatedTo target.")

            fo = f.get("formula")
            if not fo or ftype == "relationship":
                continue

            if "IIF" in fo:
                problems.append(
                    f"{where}: uses IIF, which is not supported. It emits a "
                    f"warning comment, returns NULL, and the build still "
                    f"reports success. Use IF(cond, a, b).")

            if fo.count("(") != fo.count(")"):
                problems.append(f"{where}: unbalanced parentheses in formula.")

            if "COUNTIFS" in fo:
                seg = fo[fo.index("COUNTIFS") + len("COUNTIFS"):]
                depth, args = 0, 1
                for ch in seg:
                    if ch == "(":
                        depth += 1
                    elif ch == ")":
                        depth -= 1
                        if depth == 0:
                            break
                    elif ch == "," and depth == 1:
                        args += 1
                if args > 2:
                    problems.append(
                        f"{where}: COUNTIFS has {args} arguments. The "
                        f"transpiler silently drops the 2nd+ criteria and "
                        f"returns a total count. Use the composite-key echo.")

            for m in re.finditer(r"MATCH\(\{\{(\w+)\}\},\s*(\w+)!\{\{(\w+)\}\}",
                                 fo):
                tgt, col = m.group(2), m.group(3)
                if tgt not in tables:
                    problems.append(
                        f"{where}: MATCH target table {tgt!r} does not exist.")
                elif tables[tgt]["schema"] and \
                        col != tables[tgt]["schema"][0]["name"]:
                    problems.append(
                        f"{where}: MATCH on {tgt}!{col}, but INDEX/MATCH only "
                        f"matches the primary key "
                        f"({tables[tgt]['schema'][0]['name']}).")

            if re.search(r'MATCH\("', fo):
                problems.append(
                    f"{where}: MATCH on a string literal generates no "
                    f"function, while the view calling it is still emitted.")

    print(f"checked {len(tables)} tables, "
          f"{sum(len(t['schema']) for t in tables.values())} fields")
    if problems:
        print(f"\n{len(problems)} PROBLEM(S):\n", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        sys.exit(1)
    print("integrity: clean")


if __name__ == "__main__":
    main()
