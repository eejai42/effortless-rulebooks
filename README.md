# effortless-rulebooks

**One repo, one shape.** This repository is a catalog of Effortless projects — and it is itself an Effortless project. Every governed project is moving toward the same explicit contract, so the generated rulebook editor, the planned root explorer, and an LLM with the skill suite can work with each project consistently.

The repo's own rulebook, [effortless-rulebook/effortless-rulebook.json](effortless-rulebook/effortless-rulebook.json), governs the whole thing. It lists every governed project including the root, the canonical project-shape rows, strict filesystem/manifest witnesses, consistency rules and findings, skills, routes, and the delivery programme. Readiness and toy/example classification are derived from those witnesses and must not be inferred in app code.

The active continuation is [Platform Explorer and Repository Consistency Plan](PLATFORM-EXPLORER-PLAN.md): promote the root rulebook, generated editor, and a new root React explorer; make `./start.sh` universal across the root, toys, and examples; then retire the transitional legacy runner capability by capability.

## The shape

Every project — the root included, the legacy runner included — fills the same slots:

| Slot | Where |
|---|---|
| Build manifest | `effortless.json` |
| The hub (single source of truth) | `effortless-rulebook/effortless-rulebook.json` **or** `effortless-rulebook/<slug>-rulebook.json` — both are valid |
| Project metadata | the `__meta__` table inside the rulebook |
| Story | `README.md`, ending with the *Local transpiler bus* section |
| Doctrine marker | `CLAUDE.md` (required of showcase examples) |
| Plain-English rules | `rulespeak/` via `rulebook-to-rulespeak` |
| Reference substrate | `postgres/` via `rulebook-to-postgres` + `init-db.sh` (examples) |
| Editor | `effortless-rulebook/edit-rulebook.sh` via `effortless-rulebook-editor` (examples) |
| An app that reads the views | `app/`, `web/`, `server/` … (examples) |
| Run story | `start.sh` (root, toys, and examples) |

`ProjectLayoutSlots` is the authoritative contract and `ProjectSlotWitnesses` records one strict observation per governed project and slot. The resulting `vw_rulebook_domains` columns derive coverage, readiness, toy/example classification, and misfiling.

## The map

```
effortless-rulebooks/            ← the platform IS the repo; itself a project
├── effortless.json
├── effortless-rulebook/effortless-rulebook.json   ← the governing rulebook
├── rulespeak/  postgres/  progress-report/  docs/  ← this project's outputs
├── rulebook-examples/<slug>/    ← fully implemented showcase projects
│   └── legacy-runner/           ← transitional former platform; being retired
│                                   after useful capabilities have an explicit home
└── toy-rulebooks/<slug>/        ← projects that implement a piece or two
```

Two physical folders, one concept: in the rulebook they are all project rows. `rulebook-examples/` projects target the full shape; `toy-rulebooks/` projects target the universal slots. `Area` records physical placement only; `IsToyByCoverage`, `IsFullyImplemented`, `ReadinessState`, `ExpectedArea`, and `IsMisfiled` are derived from witnessed slots.

## Working with any project

```bash
cd <project>                      # the root, an example, a toy — same commands
effortless build                  # regenerate every registered output from the rulebook
cd effortless-rulebook && bash edit-rulebook.sh   # browser editor + live DB + API (examples)
```

Edit the rulebook JSON; everything else is derived. Read computed values from the `vw_<table>` views, never recompute them.

At the repository root, refresh and validate project conformance with:

```bash
python3 scripts/scan-project-slots.py effortless-rulebook/effortless-rulebook.json .
scripts/validate-rulebook.py effortless-rulebook/effortless-rulebook.json
```

The scan records exact failures as findings and exits nonzero for malformed or ambiguous project artifacts.
The root build's final step runs `scripts/init-root-db.sh` against the explicit
`erb_effortless_rulebooks` database. On a first checkout, create that empty local
database once with `createdb erb_effortless_rulebooks`; the build fails loudly if
it is absent and never uses the generated `demo` default.

## Where the repo's health lives

After `effortless build` at the root, the database `erb_effortless_rulebooks` holds the governing rulebook's views:

- `vw_project_metadata` — one row with findings/rule/programme fields plus `layout_slot_count` and `fully_implemented_count`.
- `vw_rulebook_domains` — one row per governed project with `slot_coverage_percent`, `required_slot_coverage_percent`, `is_fully_implemented`, `is_toy_by_coverage`, `readiness_state`, `is_misfiled`, `open_finding_count`, and `consistency_grade`.
- `vw_project_layout_slots` and `vw_project_slot_witnesses` — the canonical contract and exact observed pass/gap evidence.
- `vw_consistency_findings` — the sweep work queue, with a derived `priority` (P1/P2/P3).
- `progress-report/progress-report/progress-report.html` — the delivery report rendered from the story corpus.

## The legacy runner

[rulebook-examples/legacy-runner/](rulebook-examples/legacy-runner/) is the transitional home of the former admin portal (`:7777`), `ssotme-proxy` bus (`:4242`), execution substrates, and conformance harness. It is being retired, not developed as the new platform. The root explorer will replace its discovery and guidance role; any other useful capability must be promoted, separated, replaced, or consciously retired before removal. See the [active plan](PLATFORM-EXPLORER-PLAN.md).

## Skills

The `effortless-*` Claude skill suite is modeled in the root rulebook (`ClaudeSkills`, `SkillRoutes`) and mirrored into [docs/skills/](docs/skills/) on every build. Load `effortless-orchestrator` first in any project here.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Once you run
> `./start.sh` from `rulebook-examples/legacy-runner/`, the ssotme-proxy exposes every repo-local
> transpiler — `rulebook-to-postgres`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.

This is the current launch path. The active plan moves any retained local-bus ownership out of the retiring legacy runner and into an explicitly owned root or standalone tool.
