# Cross-Domain Build Status

_Generated 2026-07-02 01:30 UTC by `orchestration/build-status-report.py`._

This file is auto-generated. To refresh:

```
bash orchestration/build-all-domains.sh                 # rebuild everything
bash orchestration/build-all-domains.sh --missing       # only new demos
bash orchestration/build-all-domains.sh --failing       # only what's broken
bash orchestration/build-all-domains.sh --domain NAME   # one demo
bash orchestration/build-all-domains.sh --report-only   # re-render from existing logs
```

**Totals:** 0 PASS · 0 PARSER · 0 CONFIG · 1 OTHER · 12 NO_LOG  _(of 13 demos in rulebook-examples/)_

## Status by domain

| Status  | Domain | Root cause | Log |
| ------- | ------ | ---------- | --- |
| NO_LOG  | `causal-autoimmune-architecture` | No log on disk — run build-all-domains.sh --domain causal-autoimmune-architecture | — |
| NO_LOG  | `effortless-banking` | No log on disk — run build-all-domains.sh --domain effortless-banking | — |
| NO_LOG  | `effortless-rulebooks` | No log on disk — run build-all-domains.sh --domain effortless-rulebooks | — |
| OTHER   | `intelligence-taxonomy` | ERROR: Proxy request failed with status InternalServerError: { | [log](orchestration/build-status/logs/intelligence-taxonomy.log) |
| NO_LOG  | `is-everything-a-language` | No log on disk — run build-all-domains.sh --domain is-everything-a-language | — |
| NO_LOG  | `naive-set-theory` | No log on disk — run build-all-domains.sh --domain naive-set-theory | — |
| NO_LOG  | `planar-unit-discovery` | No log on disk — run build-all-domains.sh --domain planar-unit-discovery | — |
| NO_LOG  | `ross-style-business-rules` | No log on disk — run build-all-domains.sh --domain ross-style-business-rules | — |
| NO_LOG  | `simpsons-paradox` | No log on disk — run build-all-domains.sh --domain simpsons-paradox | — |
| NO_LOG  | `talismans-special-solutions` | No log on disk — run build-all-domains.sh --domain talismans-special-solutions | — |
| NO_LOG  | `tiling-the-plane` | No log on disk — run build-all-domains.sh --domain tiling-the-plane | — |
| NO_LOG  | `traffic-ticket-contest` | No log on disk — run build-all-domains.sh --domain traffic-ticket-contest | — |
| NO_LOG  | `veritasium-power-laws-and-fractals` | No log on disk — run build-all-domains.sh --domain veritasium-power-laws-and-fractals | — |

## Conventions

- `PASS` — orchestrator ran end-to-end with no Traceback / FATAL / RuntimeError / `✗ FAILED` / `Error:` / explicit `raise` in the log. Conformance score may still be < 100% — that's a substrate gap, not a build error.
- `PARSER` — STEP 1 (answer-key generation) raised `Formula recomputation FAILED`. The `Root cause` column shows which operator characters and function names the canonical evaluator did not recognize.
- `CONFIG` — a transpiler was invoked but isn't listed in that demo's `effortless.json` `ProjectTranspilers`.
- `OTHER` — failure pattern outside the categories above; check the log.
- `NO_LOG` — no log on disk yet for this demo.
