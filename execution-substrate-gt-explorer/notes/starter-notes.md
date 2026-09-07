# GT × ERB: exploration journal

Seed content for the first Lepiter page over this repo. Paste into a fresh
Lepiter page once the database is created; tweak as you learn GT's affordances.

## Orientation

- **Rulebook IR** — `effortless-rulebook/effortless-rulebook.json` is the single
  source of truth. Every substrate is generated from it.
- **Substrates** — one folder per target under `execution-substrates/`. Each has
  a `take-test.*` that emits `test-answers/<entity>.json`.
- **GT's role here** — inspect the rulebook and the generated artifacts
  moldably. Explicitly *not* a substrate.

## Playground recipes

See `../playground/` for runnable snippets:

- `01-load-rulebook.st` — parse the JSON and inspect
- `02-list-entities.st` — entity summary with field-type breakdown
- `03-find-calc-fields.st` — every calculated field + its formula
- `04-inspect-generated-artifacts.st` — collect per-substrate test answers into
  one dictionary for side-by-side browsing

## Starter questions to chase

- Which fields are `calculated`, and what formulas do they use?
- Do all substrates' `test-answers/customers.json` agree field-for-field?
- Where's the first place a substrate's output diverges from the rulebook's
  intent?
- What does the `_meta._CMCC_Summary` actually look like, and who reads it?

## Exploration log

> Date each entry. Dump what you find; leave a trail.

### 2026-04-22 — first session

- [ ] GT installed and opens
- [ ] `01-load-rulebook.st` returns a `Dictionary` with `Customers` under it
- [ ] First aha moment: …

## Things to come back to later

- Custom `gtView*` inspectors, once a view earns the right by being opened
  repeatedly from the raw-Dictionary path.
- A `Rulebook` / `Entity` / `Field` class hierarchy, if navigation through raw
  dictionaries starts feeling costly.
- Cross-substrate diff as a molded view over the `test-answers/` map from
  snippet `04`.
