# Cross-Domain Build Status

This directory holds the structured, committed view of `[B]uild` status
across every demo in `rulebook-examples/`. It is populated by
`orchestration/build-all-domains.sh` and rendered by
`orchestration/build-status-report.py`.

## Files

| File           | Committed? | Purpose                                                   |
| -------------- | ---------- | --------------------------------------------------------- |
| `summary.json` | yes        | Machine-readable row per demo: status, root cause, log path |
| `REPORT.md`    | yes        | Human/agent-readable triage table rendered from `summary.json` |
| `logs/*.log`   | **no** (gitignored) | Raw build output per demo. Large, churns each run |
| `.gitignore`   | yes        | Ignores `logs/`                                           |
| `README.md`    | yes        | This file                                                 |

## How an agent should use this

1. Read `summary.json` (or `REPORT.md`) to pick a failing domain.
2. Read `logs/<domain>.log` for the full output (re-run
   `bash orchestration/build-all-domains.sh --domain <name>` if the log is
   missing — `logs/` is gitignored).
3. Make the fix (typically in `orchestration/formula_parser.py` or that
   demo's `effortless.json`).
4. Re-run `bash orchestration/build-all-domains.sh --domain <name>` to
   refresh that one log + the summary/report.
5. When a batch of fixes lands, run `--failing` to re-verify everything
   that was previously broken, and confirm the totals in `REPORT.md` moved
   in the right direction.

## How a human should use this

- The orchestrator's main menu has `[A] ALL-DOMAINS` which opens a separate
  sub-screen that wraps this same script. The per-domain UI never gets
  cluttered with cross-domain controls.
- Direct CLI usage works too:
  ```
  bash orchestration/build-all-domains.sh --help
  ```

## Conventions

- A build is `PASS` only if the log has no Traceback / FATAL / RuntimeError /
  `✗ FAILED` / `Error:` / explicit `raise`. Conformance score < 100% is a
  substrate gap, **not** a build failure.
- The driver does not alter the active domain — whatever was active when you
  invoked it is restored on exit.
