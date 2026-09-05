# ACME, LLC — Effortless Project

<!-- rulebook-authoritative-banner -->
## Authoritative Source: `effortless-rulebook/acme-llc-rulebook.json` is HEAD

For this project, **`effortless-rulebook/acme-llc-rulebook.json` is the single, authoritative source of truth.** Edit it directly. All other artifacts (Postgres SQL, Python, Go, Excel, OWL, etc.) are mechanically derived from it via `effortless build`.

### Airtable pull is disabled by default

The `airtabletorulebook` transpiler in `effortless.json` is set to `IsDisabled: true` / `Enabled: false` so that **a routine `effortless build` will never silently overwrite your JSON edits with whatever is in Airtable**.

If you want to re-enable Airtable pull as the source of truth for a single build, you must do it explicitly and with intent:

1. Confirm with the user that the rulebook JSON should be overwritten from Airtable.
2. Either:
   - Run the transpiler one-off:
     ```bash
     effortless airtabletorulebook -o effortless-rulebook/acme-llc-rulebook.json -account airtable -p "view=Grid view"
     ```
   - Or flip `IsDisabled` back to `false` in `effortless.json`, run `effortless build`, then flip it back to `true`.

**Default rule for Claude / any agent operating in this project:** treat the JSON as authoritative; do not enable or invoke `airtabletorulebook` without explicit user consent on that specific turn. Memory or "we usually pull from Airtable" is not consent — every pull must be a fresh, in-context decision.
### Never silently revert `acme-llc-rulebook.json`

**Treat `effortless-rulebook/acme-llc-rulebook.json` as sacred.** It contains human-authored business rules and CANNOT be casually overwritten. Before running any command that could touch this file — `effortless build`, `effortless airtabletorulebook`, any transpiler that writes to it, any sync script, any `git checkout`/`git restore` against it — first run `git status` / `git diff` on it.

- If the file has uncommitted changes that you (the agent) did NOT just make this turn, **stop**. Ask the user before proceeding.
- It is only acceptable to let a regeneration touch this file when you are certain the *only* uncommitted edits in it are ones you just made in the current turn.
- This applies to every `**/effortless-rulebook/acme-llc-rulebook.json` in this repo, not just the project-local one.

There is no upstream to "restore from." The JSON is the upstream.

<!-- /rulebook-authoritative-banner -->

**A one-table customer example for tracing calculated fields across generated surfaces.**

This folder is a **self-contained Effortless Rulebook (ERB) project** built around one `Customers` table.

## What This Demonstrates

- **Raw customer facts**: Email address, first name, and last name
- **Calculated identifiers**: `Name` and `FullName`
- **Generated explanations**: RuleSpeak follows the same formulas
- **Multiple projections**: The editor, Postgres, application, and Excel agree

## Quick Start

```bash
./start.sh
```

## Key Files

- `effortless.json` — Project config with base ID: `appWrXPvXbkgQGOxt`
- `effortless-rulebook/acme-llc-rulebook.json` — The rulebook
- `README.md` — Narrative documentation
- `execution-substrates/` — Generated code

## Testing

```bash
./start.sh
```

---

**The rulebook is the specification. Everything else is derived.**
