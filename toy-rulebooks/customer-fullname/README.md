# effortless-rulebook-editor (v1, mostly read-only)

Generates the small, static set of files needed to run a self-rebuilding,
containerized rulebook editor/viewer for any Effortless project:

- `Dockerfile` -- Node 20 + .NET 8 SDK + bundled Postgres + the `effortless`
  CLI, baked once at image-build time.
- `container-entrypoint.sh` -- boot sequence: start `boot-server.js`
  immediately (before anything else), start Postgres, run `effortless build`
  (rulebook -> SQL -> API -> UI -> RuleSpeak -> XLSX export),
  start the generated API + UI, then watch the mounted rulebook (and the
  boot page's Rebuild button) for changes and rebuild.
- `boot-server.js` -- owns the external UI port for the container's whole
  lifetime. Serves a live progress page (SSE log tail + Rebuild button) from
  the very first second the container starts, and transparently reverse-
  proxies to the real Vite dev server once a build succeeds -- the port
  never changes, so a tab left open just starts working once ready.
- `effortless.editor.json` -- the fixed, generic pipeline config (copied into
  the image as `/app/effortless.json`), registering `rulebook-to-postgres`,
  its `-exec ./init-db.sh` step, `rulebook-to-node-postgres-api`,
  `rulebook-to-vite-admin-portal`, `rulebook-to-rulespeak` (all 10 languages,
  via `languages=all`), and `rulebook-to-xlsx`.
- `edit-rulebook.sh` -- thin launcher: `docker build` + `docker run` with the
  correct bind mounts (the rulebook, read-only; `~/.ssotme`, read-only, for
  CLI auth), then tails the container's logs in the launching terminal (use
  a second terminal / the in-app boot page for parallel monitoring).

## Usage

From an Effortless project containing `effortless-rulebook/effortless-rulebook.json`:

```
effortless -install effortless-rulebook-editor -i effortless-rulebook.json
./edit-rulebook.sh
```

Open the UI URL immediately -- it shows a live boot/progress page (no need
to wait for the first build to finish before opening the tab) and hands off
to the app automatically once ready. Edit the rulebook, or click the portal's
Rebuild button, to trigger a rebuild; either path is watchable live from the
boot page at any time, in any tab, not just during the first boot.

## V1 scope

Table/entity data is read-only end to end. Name, Description, and `_meta`
are editable from the UI (backed by the generated API's `PATCH /api/meta`)
-- but writing those edits through to the mounted rulebook FILE on disk is
still out of scope; the mount stays read-only and a future version will add
that save path.

## Unified portal tabs

The admin portal isn't just a table browser -- it's the single front end for
everything this stack generates from the rulebook, as tabs alongside Tables:
- **RuleSpeak** -- the business-rules document in all 10 supported languages
  (English, German, Spanish, French, Portuguese, Italian, Dutch, Russian,
  Japanese, Chinese), rendered inline via iframe, served straight from the
  container's `/app/rulespeak` output. The portal's own language picker
  (see below) passes `?lang=` into the iframe so it opens on the language
  you're already using; the document's own in-page language selector still
  works independently if you want to compare languages side by side.
- **Export** -- a one-click download of the Excel workbook snapshot
  (`rulebook-to-xlsx`'s output), one sheet per table, regenerated on every
  build.

These are served by `boot-server.js`'s static-file routes
(`/__tools/rulespeak/...`, `/__tools/xlsx/...`) -- not by the Vite dev server
itself, so they work even before/independent of the admin-portal UI finishing
its own build.

As of this version, RuleSpeak is unified into a single multilingual tab; the
previously separate "RuleSpeak (DE)" tab (backed by the now-deprecated
`rulebook-to-rulespeak-de` alias tool) has been removed. Projects with an
already-generated `effortless.editor.json` keep their old two-tab pipeline
until they re-run `effortless -install effortless-rulebook-editor`.

## Language picker

On first load, the portal shows a full-screen language chooser (10 flags);
your choice is remembered in the browser's local storage, so it only appears
once per browser. A picker in the top bar lets you change languages at any
time afterward -- this re-labels the portal's own UI chrome (nav, buttons,
messages) and, if you're on the RuleSpeak tab, switches that document's
displayed language too.

## Local dev vs production tool resolution

By default, `edit-rulebook.sh` uses normal published-tool registry
resolution for `rulebook-to-node-postgres-api` / `rulebook-to-vite-admin-portal`
-- what every user other than this tool's own developer wants. Developers
actively iterating on those two transpilers' source can opt into local-dev
mode with `LOCAL_TOOL_URLS=1 ./edit-rulebook.sh`: the container then points
at the developer's own `dotnet run` processes via `host.docker.internal:30039`
/ `:30040`, so source edits are picked up on the very next rebuild -- no
publish step in that loop.

## Host ports

`API_PORT` / `UI_PORT` are unpinned by default -- Docker assigns free
ephemeral host ports (`edit-rulebook.sh` prints the actual URLs once the
container starts). Set `RULEBOOK_EDITOR_API_PORT` / `RULEBOOK_EDITOR_UI_PORT`
to pin specific host ports instead.
