# GT Explorer for ERB

A landing pad for exploring this ERB repo from [Glamorous Toolkit](https://gtoolkit.com).

GT is used here **as a code explorer, not as a substrate**. Nothing in this folder
is consumed by `orchestration/inject.py`; no artifact here is graded against the  
Airtable oracle. Think of it as a thinking surface for inspecting the rulebook  
and the substrates that are already generated.

## One-time setup

1. **Download GT** from [gtoolkit.com](https://gtoolkit.com). It is a
  self-contained image + VM — unzip and run. Install it **outside** this repo;
   the image is a tool, not an artifact.
2. **Open GT.** You land in a Home page.
3. **Spotter** (`Cmd+Space` on macOS) is your primary navigation — every file,
  class, method, and page is reachable from there.

## First exploration: load the rulebook

Open a **Playground** (`Cmd+O, Cmd+P`) and paste the snippet from
[playground/01-load-rulebook.st](playground/01-load-rulebook.st). Select all,
press `Cmd+G` ("inspect it"). GT opens a live inspector on the rulebook
dictionary — drill into `Customers → schema → 0` to see the first field.

Subsequent snippets in [playground/](playground/) build on this:


| File                                                                              | What it does                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [01-load-rulebook.st](playground/01-load-rulebook.st)                             | Parse `effortless-rulebook.json` and inspect it               |
| [02-list-entities.st](playground/02-list-entities.st)                             | Enumerate entity names with field counts                      |
| [03-find-calc-fields.st](playground/03-find-calc-fields.st)                       | Pull every calculated field + its formula across all entities |
| [04-inspect-generated-artifacts.st](playground/04-inspect-generated-artifacts.st) | Open the per-substrate generated files as GT objects          |
| [05-rulebook-views.st](playground/05-rulebook-views.st)                           | Install `ERBRulebook` / `ERBEntity` / `ERBField` with `gtView*` methods |
| [05a-fullname-rulebook-spec.st](playground/05a-fullname-rulebook-spec.st)         | Vertical slice: the rulebook's spec for `FullName`            |
| [05b-fullname-python-source.st](playground/05b-fullname-python-source.st)         | Vertical slice: the Python function emitted from 05a          |
| [05c-fullname-python-output.st](playground/05c-fullname-python-output.st)         | Vertical slice: the Python substrate's stored answers         |
| [05d-invoke-python-live.st](playground/05d-invoke-python-live.st)                 | Execute 05b live via subprocess and diff against 05c          |
| [05e-walk-dag-live.st](playground/05e-walk-dag-live.st)                           | Walk the whole DAG live: trace every calc_\* call and grade every field |


Each snippet hardcodes the repo path at the top — **edit that constant once**
before running.

## Lepiter notebook

Lepiter is GT's native notebook. Create a new database from inside GT:

1. Spotter → "New Lepiter Database"
2. Point it at this folder (`execution-substrate-gt-explorer/lepiter-db/` is a
  reasonable convention — GT will create the folder).
3. Add your first page and paste the starter content from
  [notes/starter-notes.md](notes/starter-notes.md).

The `.db` folder is git-trackable if you want your exploration journal versioned
alongside the code; ignore it otherwise.

## What to defer

- **Don't write custom inspector extensions yet** (`gtViewX:` methods on
custom classes). Do enough raw inspection first to know which views you'd
reach for repeatedly.
- **Don't lower the rulebook into Pharo classes.** Generic `Dictionary` /
`OrderedCollection` inspection is fine for learning the tool. If custom
classes earn their keep later, they'll live here.
- **Don't treat this as a substrate.** That's the path in
[PLAN.md](PLAN.md) § "SDLAF → GT" and is deliberately out of scope for now.

## Folder layout

```
execution-substrate-gt-explorer/
├── README.md                 ← you are here
├── PLAN.md                   ← longer-term vision, not the current scope
├── playground/               ← paste-into-GT snippets
│   ├── 01-load-rulebook.st
│   ├── 02-list-entities.st
│   ├── 03-find-calc-fields.st
│   └── 04-inspect-generated-artifacts.st
├── notes/                    ← prose to seed your first Lepiter page
│   └── starter-notes.md
└── lepiter-db/               ← created by GT when you make the notebook
```

