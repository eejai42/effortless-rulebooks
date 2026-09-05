#!/usr/bin/env python3
"""Repoint the launch profiles of the five examples that gained view-backed apps (2026-09-05).

Idempotent. Each project now starts an Express API over its vw_* views plus a Vite
web client from ./start.sh; the root rulebook's launch rows must describe that
experience so the explorer's launch instructions and health probes stay truthful.

Usage:
    python3 scripts/migrate-phase5-example-apps.py effortless-rulebook/effortless-rulebook.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# domain id -> (web port, api port, experience description)
APPS = {
    "domain-is-everything-a-language": (43101, 43301, "Language-classification board reading the rulebook views"),
    "domain-naive-set-theory": (43102, 43302, "Three-valued membership explorer reading the set-theory views"),
    "domain-planar-unit-discovery": (43103, 43303, "Unit-distance discovery ledger reading the rulebook views"),
    "domain-ross-style-business-rules": (43104, 43304, "Claims desk showing each Ross-style rule verdict from the views"),
    "domain-veritasium-power-laws-and-fractals": (43105, 43305, "Power-law systems gallery with log-log plots from the views"),
}
PREREQ = "npm, psql and lsof are required; the launcher dies if the project database has no vw_* views."


def main() -> None:
    path = Path(sys.argv[1])
    rb = json.loads(path.read_text(encoding="utf-8"))
    profiles = {r["Domain"]: r for r in rb["ProjectLaunchProfiles"]["data"]}
    services = rb["ProjectLocalServices"]["data"]
    for domain, (web, api, description) in APPS.items():
        profile = profiles[domain]
        profile["ExperienceKind"] = "web"
        profile["ExperienceDescription"] = description
        profile["PrerequisiteNotes"] = PREREQ
        profile["IsStartRequired"] = True
        profile["RequiresLocalUrl"] = True
        sid = f"{domain}:primary"
        row = next((s for s in services if s["ProjectLocalServiceId"] == sid), None)
        if row is None:
            row = {"ProjectLocalServiceId": sid, "LaunchProfile": profile["ProjectLaunchProfileId"], "ServiceRole": "primary", "SortOrder": 1, "IsPrimaryFlag": 1}
            services.append(row)
        row["LocalUrl"] = f"http://localhost:{web}"
        row["HealthUrl"] = f"http://localhost:{api}/api/views"
        print(f"{domain}: web :{web}, api :{api}")
    path.write_text(json.dumps(rb, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
