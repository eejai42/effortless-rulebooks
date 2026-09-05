#!/usr/bin/env python3
"""Record a consistency rule (if new) and one or more findings in the root rulebook.

Findings are witnessed rows: they are added with Status open and today's date and
are never deleted; close them with scripts/mark-finding-fixed.py.

Usage:
    python3 scripts/record-finding.py effortless-rulebook/effortless-rulebook.json \
        --rule cr-20 --code init-db-fresh-database --severity major --scope demo \
        --statement "..." --check "..." --fix "..." --doctrine "..." \
        --finding domain-procedural-knowledge-ontology "detail text" \
        [--finding <domain-or-empty> "detail" ...]

If --rule names an existing rule, the rule text flags are optional and ignored.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("rulebook")
    ap.add_argument("--rule", required=True)
    ap.add_argument("--code")
    ap.add_argument("--severity", choices=["critical", "major", "minor"])
    ap.add_argument("--scope", choices=["repo", "demo", "platform"])
    ap.add_argument("--statement")
    ap.add_argument("--check")
    ap.add_argument("--fix")
    ap.add_argument("--doctrine")
    ap.add_argument("--finding", nargs=2, action="append", metavar=("DOMAIN", "DETAIL"), default=[])
    args = ap.parse_args()

    path = Path(args.rulebook)
    rb = json.loads(path.read_text(encoding="utf-8"))
    rules = {r["ConsistencyRuleId"]: r for r in rb["ConsistencyRules"]["data"]}
    domains = {r["DomainId"] for r in rb["RulebookDomains"]["data"]}

    if args.rule not in rules:
        missing = [n for n in ("code", "severity", "scope", "statement", "check", "fix", "doctrine") if not getattr(args, n)]
        if missing:
            raise SystemExit(f"new rule {args.rule} needs --{' --'.join(missing)}")
        if any(r["RuleCode"] == args.code for r in rules.values()):
            raise SystemExit(f"rule code {args.code!r} already exists")
        rb["ConsistencyRules"]["data"].append({
            "ConsistencyRuleId": args.rule, "RuleCode": args.code, "Severity": args.severity, "Scope": args.scope,
            "Statement": args.statement, "CheckMechanism": args.check, "FixPlaybook": args.fix,
            "SourceDoctrine": args.doctrine, "IsScannerDerived": False, "Project": "erb-001",
        })
        print(f"added rule {args.rule} ({args.code})")

    findings = rb["ConsistencyFindings"]["data"]
    existing = {f["ConsistencyFindingId"] for f in findings}
    n = sum(1 for f in findings if f["Rule"] == args.rule)
    today = dt.date.today().isoformat()
    for domain, detail in args.finding:
        domain = domain or None
        if domain is not None and domain not in domains:
            raise SystemExit(f"unknown domain {domain!r}")
        n += 1
        fid = f"{args.rule}-{n:02d}"
        while fid in existing:
            n += 1
            fid = f"{args.rule}-{n:02d}"
        findings.append({"ConsistencyFindingId": fid, "Rule": args.rule, "Domain": domain, "Detail": detail, "Status": "open", "DetectedOn": today})
        existing.add(fid)
        print(f"added finding {fid} on {domain or '(repo)'}")

    path.write_text(json.dumps(rb, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
