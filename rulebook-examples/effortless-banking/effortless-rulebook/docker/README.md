# effortless-rulebook-editor (v1, mostly read-only)

Generates the small, static set of files needed to run a self-rebuilding,
containerized rulebook editor/viewer for any Effortless project:

- `Dockerfile` -- Node 20 + .NET 8 SDK + bundled Postgres + the `effortless`
  CLI, baked once at image-build time.
- `container-entrypoint.sh` -- boot sequence: start `boot-server.js`
  immediately (before anything else), start Postgres, run `effortless build`
  (rulebook -> SQL -> API -> UI -> RuleSpeak® -> XLSX export),
  start the generated API + UI, then watch the mounted rulebook (and the
  boot page's Rebuild button) for changes and rebuild.
- `boot-server.js` -- owns the external UI port for the container's whole
  lifetime. Serves a live progress page (SSE log tail + Rebuild button) from
  the very first second the container starts, and transparently reverse-
  proxies to the real Vite dev server once a build succeeds -- the port
  never changes, so a tab left open just starts working once ready. It also
  serves the diagnostics endpoints described under **Partial failures** below.
- `effortless.editor.json` -- the fixed, generic pipeline config. Copied into
  the image as a SEED (`/app/effortless.editor.json.seed`), then copied to
  `/app/effortless-root/effortless.json` on first boot ONLY IF that file is
  not already there (see `effortless-root` below) -- registering
  `rulebook-to-postgres`, its compatibility database-reset step,
  `rulebook-to-node-postgres-api`, `rulebook-to-vite-admin-portal`,
  `rulebook-to-explainer-dag` (into the portal's Vite `public/`, so the
  provenance assets are served at `/rulebook-explainer-dag/*`),
  `rulebook-to-rulespeak` (all 10 languages, via `languages=all`), and
  `rulebook-to-xlsx`.
- `edit-rulebook.sh` -- thin launcher, generated INTO the rulebook's own
  folder (see Parameters below), not alongside the other files. Runs
  `docker build` against the Dockerfile at TOOL_DIR (wherever this tool was
  installed/run from) and `docker run` with the correct bind mounts (the
  rulebook's containing directory, read-write, so Save Changes and the
  uncommitted-change log can write back to it; `~/.ssotme`, read-only, for
  CLI auth; optionally `tempDir`, read-write -- see below), then tails the
  container's logs in the launching terminal (use a second terminal / the
  in-app boot page for parallel monitoring).

## Parameters

- `-p rulebookPath=...` -- where the rulebook JSON file lives, relative to
  wherever this tool is installed/run from (TOOL_DIR). Default:
  `../effortless-rulebook.json`. `edit-rulebook.sh` is generated into that
  file's folder; every other file (Dockerfile, effortless.editor.json,
  container-entrypoint.sh, boot-server.js, README.md) stays at TOOL_DIR --
  this keeps the rulebook's own folder clean (just the one launcher script).
- `-p tempDir=...` -- a folder, relative to TOOL_DIR, bind-mounted into the
  container (read-write, as `/app/effortless-editor-tmp`) as scratch/state
  storage. Default: `./.effortless`. Only actually mounted (and only then
  created + `.gitignore`'d) when explicitly provided, or when
  `srcIsExternal=true` -- otherwise the container keeps this state purely
  internal to its own filesystem (nothing written to the host).
- `-p srcIsExternal=true` -- forces `tempDir` to be mounted even without
  explicitly setting it, and is what makes `effortless-root` (below) resolve
  to a host-backed folder inside `tempDir` instead of a container-internal one.

## `effortless-root` and static-across-rebuilds generated code

Everything `effortless build` generates inside the container --
`effortless.json` itself, plus `api/`, `admin-portal/`, `postgres/`,
`rulespeak/`, `xlsx/` -- lives under a symlink, `/app/effortless-root`, whose
TARGET depends on `srcIsExternal`:
- `srcIsExternal=true` (or `tempDir` explicitly set): target is
  `effortless-editor-src/` INSIDE the mounted `tempDir` -- host-backed, so
  it's directly readable/editable from outside the container and survives a
  full container recreate, not just a restart.
- otherwise: target is a container-internal-only directory -- survives a
  plain restart, but NOT a container recreate (e.g. `edit-rulebook.sh
  --rebuild`, or `docker rm` + rerun).

Either way, the boot sequence is identical: seed `effortless.json` from the
tool's shipped default ONLY IF `effortless-root/effortless.json` doesn't
already exist, then run `effortless build`. This is what makes the generated
API/UI code EDITABLE and STATIC ACROSS REBUILDS by default -- a rebuild never
resets `effortless-root` back to the shipped pipeline, it just re-runs
`effortless build` against whatever's already there. To force a full reset
back to the tool's default pipeline, delete `effortless-root/effortless.json`
(or the whole `tempDir`, when host-backed) and restart the container; there
is no separate `buildall` flag -- `effortless build` itself is always the
command run, the reset is achieved by removing the seeded file instead of
overwriting it.

## Usage

From an Effortless project containing `effortless-rulebook.json` (default
location: one folder above wherever this tool is installed):

```
effortless -install effortless-rulebook-editor -i effortless-rulebook.json
./effortless-rulebook/edit-rulebook.sh
```

(the exact path to `edit-rulebook.sh` depends on `-p rulebookPath=...` --
it's always generated into that file's folder; see Parameters above.)

Open the UI URL immediately -- it shows a live boot/progress page (no need
to wait for the first build to finish before opening the tab) and hands off
to the app automatically once ready. Edit the rulebook, or click the portal's
Rebuild button, to trigger a rebuild; either path is watchable live from the
boot page at any time, in any tab, not just during the first boot.

## Upgrading an EXISTING project to a newer version of this tool

`container-entrypoint.sh` and `edit-rulebook.sh` are generated runtime files and
use **overwrite=Always**. That is deliberate: proxy, lifecycle, isolation, and
port fixes must reach existing projects rather than leaving them on whichever
script version they first installed. Put stable ports and a custom container
name in `ports.env`; never hand-edit generated runtime scripts.

To actually pick up a new version of this tool in a project that already has it:

```bash
effortless -refreshTools                   # SEE BELOW — do not skip this
effortless -upgradeAll                     # re-pin to the published head version

effortless build                           # regenerates Dockerfile, entrypoint,
                                           # launcher, boot server, README, pipeline config

bash <rulebookDir>/edit-rulebook.sh --rebuild
```

**`-refreshTools` first, always.** The CLI caches the published tools index. A
version published minutes ago is not in that cache, so `effortless build` happily
resolves the *previous* version and stamps `[latest]` next to it in the log — you
regenerate from the old tool and everything looks like it worked. The only tell is
the version number on the `cli:>` line, which nobody reads. Refresh first.

**`--rebuild` does not regenerate anything.** It rebuilds the Docker image from
whatever is already in `<dockerfileDir>/` on disk. Running it without the
`effortless build` above just re-bakes the files you already had. Both steps, in
that order.

That last step matters on its own for another reason: the image bakes in the
`effortless` CLI (cloned at image-build time), so without `--rebuild` you keep
running the old CLI — and features that depend on it, such as `-continueOnError`
below, stay switched off no matter how new the entrypoint script is.

## Partial failures: one broken tool does not take the container down

The build inside the container runs `effortless build -continueOnError`. That
flag is not optional here and is not configurable -- it is the reason this
container survives a broken transpiler.

What it changes:

- **Every step still runs.** A failing step no longer aborts the build, so the
  steps after it still generate. Previously one broken NON-load-bearing step
  (historically `rulebook-to-xlsx`, the Excel export) aborted the run, the API
  and admin portal were never built or started, and the whole container was
  useless because of a spreadsheet.
- **Nothing fails silently.** The CLI writes the full detail of anything that
  failed -- exit code, message, exception type, stack trace, inner exceptions,
  the exact command line, the resolved tool version/URL -- to
  `effortless-root/errors.json`. The file existing means the last build had
  failures; the file being absent means it was clean.
- **Whatever built, runs.** Services start based on what actually exists on
  disk, independently: Postgres, then the generated API if `api/index.js` was
  generated, then the portal if `admin-portal/` was. Each is useful alone --
  Postgres is inspectable from the host, the API exposes health/state/data for
  debugging, and the portal is the last thing to go down because it can report
  on everything below it.
- **A partial failure is a distinct state.** If the app comes up but the build
  had failures, the state is `degraded`, not `ready`. The app is proxied
  exactly as it would be when ready -- the separate name exists so the failure
  stays visible rather than being rounded up to success.
- **A proxy failure never paints a blank page.** If the state says the app is
  serving but the Vite dev server behind it is not answering (it died, or is
  mid-restart), a document request gets the boot page -- with the log, the
  failed-step summary, and the Rebuild button -- instead of a 502 body that the
  browser renders as a white screen.

Diagnostics endpoints are always available on the resolved UI port printed by
`edit-rulebook.sh`, whether or not the app itself is up:

| Endpoint | What it gives you |
|---|---|
| `GET /__boot/` | The boot/diagnostics page on demand, even while the app is up and proxied |
| `GET /__boot/status` | Per-component health: postgres / api / portal / bootServer, plus `buildHadFailures` |
| `GET /__boot/errors` | The CLI's `errors.json` verbatim (`hasErrors:false` when the last build was clean) |
| `GET /__boot/log` | The last 400 lines of the build log |
| `GET /__boot/events` | SSE stream of new build-log lines + state changes |
| `GET /__boot/pipeline` | The declared build pipeline in order (`effortless.json`'s `ProjectTranspilers`), each step carrying a plain-language `title`/`why` alongside its command line |
| `POST /__boot/pipeline-toggle` | Enable/disable steps by name (`{ steps: { name: isDisabled }, rebuild?: true }`), writing `IsDisabled` back to `effortless.json` atomically. The portal's language picker uses this to add/remove RuleSpeak® languages; unknown step names are ignored, never created |

## RuleSpeak® languages follow the pipeline

Which languages the portal offers is **derived** from which of the two RuleSpeak®
steps are enabled in `effortless.json` -- there is no separate language setting to
keep in sync:

| `rulebooktorulespeaken` (English) | `rulebooktorulespeak` (all 10) | Portal language picker |
|---|---|---|
| enabled | disabled | English only |
| disabled | enabled | all 10, with the picker (the default) |
| enabled | enabled | all 10 (both write `/rulespeak`; the 10-language step is ordered last, so it wins) |
| disabled | disabled | no picker -- the RuleSpeak® tab is shown disabled, explaining that the docs steps are off |

The picker's **"Add the other 9 languages"** button is a one-click shortcut for the
common transition: it POSTs to `/__boot/pipeline-toggle` to turn the 10-language
step on and the English-only step off, kicks a rebuild, and sends you to the build
screen to watch it. The Admin tab exposes both steps as independent checkboxes for
any combination the button does not cover.

## Watching it boot

Open the UI URL printed by `edit-rulebook.sh` at any point -- including the
instant you start the container, before anything has been built -- and you get
a progress dashboard rather than a connection error or a wall of scrolling text:

- **What is running right now.** One tile per component (database, API, admin
  portal, this page), each up or down, polled continuously. This is the answer to
  "which parts of this thing are alive?" when most of them are not.
- **The build steps, all of them, up front.** The whole pipeline is listed before
  the first one runs -- read from `effortless.json`, so a pipeline you edited
  shows your steps, not the shipped defaults. Each row says in plain language what
  that step is *for*, and carries its exact command line and description one
  disclosure down.
- **Live status per step.** Steps go pending -> running -> succeeded/failed as the
  build announces them, with a progress bar and a "step N of M" line. Disabled
  steps show as turned off rather than silently vanishing. The step in flight is a
  big green arrow in a lit-up row -- deliberately unmissable, because "which one is
  it on?" is the question you are actually asking while you wait.
- **Failures inline, on the step that failed.** The message from `errors.json`
  appears on the row itself, with the stack trace and inner-exception chain behind
  a disclosure. Nobody has to go hunting for one `ERROR:` line.
- **The raw output is still right there.** The **Build output** tab carries the
  unfiltered log exactly as before -- the dashboard is a layer over it, never a
  replacement for it.

Once the build finishes the page hands off to the real app automatically. To get
back to it at any time, go to `/__boot/`.

### After the first build: the same dashboard, inside the app

The boot page only exists until it hands off, so the identical monitor is mounted
permanently on the portal's **Admin** page, directly under **Run Build** -- the
component tiles and the same step rail, rendered from this server's
`GET /__boot/pipeline` so both surfaces describe a step with the same words.
Clicking **Run Build** there resets the rail and re-animates the whole sequence
live; when the build ends it reconciles against `errors.json` exactly as this page
does. That monitor ships with `rulebook-to-vite-admin-portal`, and falls back to a
plainer rail (no tiles) if that tool's output is ever served without this boot
server in front of it.

Note the image installs the `effortless` CLI by cloning it at image-build time,
so its version is not pinned to this tool's version. `container-entrypoint.sh`
probes for `-continueOnError` support at boot and, if the CLI is older than the
flag, warns loudly and falls back to the old abort-on-first-failure behavior
rather than passing an option that CLI would reject outright. Rebuild the image
(`./edit-rulebook.sh --rebuild`) to pick up a newer CLI.

## Live editing + Save Changes

Row/column data is live-editable from the UI against the real Postgres DB
(reads come from `vw_*` views, so calculated/lookup fields are always
correct; writes go to base tables). Every write is also appended to an
uncommitted-changes log file (`effortless-rulebook.uncommitted-NN.json`)
living alongside the rulebook. A prominent Save Changes action merges the
pending log(s) into `effortless-rulebook.json` on disk, in order, and
triggers a real rebuild -- Name, Description, and `_meta` remain additionally
editable via the generated API's `PATCH /api/meta`.

If the rulebook file changes externally (hand-edited, or written by some
other process) while uncommitted changes are still pending, any build --
whether triggered by the file watcher or by Save Changes -- is gated: the
boot page prompts for one of three resolutions (save the pending log as an
unresolved merge file for later reconciliation, discard it, or overwrite the
external change with the pending log) before the build proceeds. See
`container-entrypoint.sh`'s `check_uncommitted_before_build` step and
`boot-server.js`'s conflict-prompt route for the exact mechanics.

## Unified portal tabs

The admin portal isn't just a table browser -- it's the single front end for
everything this stack generates from the rulebook, as tabs alongside Tables:
- **RuleSpeak®** -- the business-rules document in all 10 supported languages
  (English, German, Spanish, French, Portuguese, Italian, Dutch, Russian,
  Japanese, Chinese), rendered inline via iframe, served straight from the
  container's `/app/effortless-root/rulespeak` output. The portal's own language picker
  (see below) passes `?lang=` into the iframe so it opens on the language
  you're already using; the document's own in-page language selector still
  works independently if you want to compare languages side by side.
- **Export** -- a one-click download of the Excel workbook snapshot
  (`rulebook-to-xlsx`'s output), one sheet per table, regenerated on every
  build.

These two are served by `boot-server.js`'s static-file routes
(`/__tools/rulespeak/...`, `/__tools/xlsx/...`) -- not by the Vite dev server
itself, so they work even before/independent of the admin-portal UI finishing
its own build.

- **Provenance** -- `rulebook-to-explainer-dag`'s DAG explorer, plus the ƒ
  badge that the portal puts on every derived cell in every grid and record.
  Unlike the two above this one is NOT an iframe or a download: its five
  assets are loaded into the portal page itself, so the hover cards and
  double-click-to-explain behavior work inline wherever a calculated, lookup,
  or aggregation value is displayed. That is why its build step writes into
  `admin-portal/public/` (Vite's publicDir) rather than a `/__tools` directory
  -- the portal and the explainer have to be same-origin, same-document.

As of this version, RuleSpeak® is unified into a single multilingual tab; the
previously separate "RuleSpeak® (DE)" tab (backed by the now-deprecated
`rulebook-to-rulespeak-de` alias tool) has been removed. Projects with an
already-generated `effortless.editor.json` keep their old two-tab pipeline
until they re-run `effortless -install effortless-rulebook-editor`.

## Language picker

On first load, the portal shows a full-screen language chooser (10 flags);
your choice is remembered in the browser's local storage, so it only appears
once per browser. A picker in the top bar lets you change languages at any
time afterward -- this re-labels the portal's own UI chrome (nav, buttons,
messages) and, if you're on the RuleSpeak® tab, switches that document's
displayed language too.


## Host ports

Host ports are unpinned by default: Docker assigns three currently free ports,
and `edit-rulebook.sh` prints the resolved API, UI, and Postgres URLs. The
container name is derived from the launcher's absolute installation path, so
two projects can run side by side even when both launchers live in a folder
named `effortless-rulebook`.

For stable project-specific URLs, create `ports.env` beside the launcher:

```
export RULEBOOK_EDITOR_API_PORT=47311
export RULEBOOK_EDITOR_UI_PORT=47312
export RULEBOOK_EDITOR_PG_PORT=47313
export RULEBOOK_EDITOR_CONTAINER_NAME=effortless-rulebook-editor-my-project
```

The same variables may be passed in the invoking environment; explicit caller
values win over `ports.env`. `RULEBOOK_EDITOR_PORTS_ENV_FILE` may point at a
different file.

A pinned-port collision is a hard error naming the container that owns the
port. The launcher never stops another project to steal its port and never
silently picks a different port than the one requested. Only this install's
own path-derived (or explicitly pinned) container name is replaced.

## Connecting to Postgres directly

Postgres (container-internal 5432, user/pass `postgres`/`postgres`, db
`effortless-rulebook`) is published to the resolved host port printed by the
launcher. The DB is reseeded from the mounted rulebook on every rebuild, so
treat it as disposable/read-only for inspection, not a place to persist manual
changes.
