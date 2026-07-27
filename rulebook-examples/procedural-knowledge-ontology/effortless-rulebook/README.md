# effortless-rulebook-editor (v1, mostly read-only)

Generates the small, static set of files needed to run a self-rebuilding,
containerized rulebook editor/viewer for any Effortless project:

- `Dockerfile` -- Node 20 + .NET 8 SDK + bundled Postgres + the `effortless`
  CLI, baked once at image-build time.
- `container-entrypoint.sh` -- boot sequence: start `boot-server.js`
  immediately (before anything else), start Postgres, run `effortless build`
  (rulebook -> SQL -> API -> UI -> RuleSpeak -> RuleSpeak-DE -> XLSX export),
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
  `rulebook-to-vite-admin-portal`, `rulebook-to-rulespeak`,
  `rulebook-to-rulespeak-de`, and `rulebook-to-xlsx`.
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
- **RuleSpeak** / **RuleSpeak (DE)** -- the plain-English (and German)
  business-rules documents, rendered inline via iframe, served straight from
  the container's `/app/rulespeak` and `/app/rulespeak-de` output.
- **Export** -- a one-click download of the Excel workbook snapshot
  (`rulebook-to-xlsx`'s output), one sheet per table, regenerated on every
  build.

These are served by `boot-server.js`'s static-file routes
(`/__tools/rulespeak/...`, `/__tools/rulespeak-de/...`, `/__tools/xlsx/...`)
-- not by the Vite dev server itself, so they work even before/independent of
the admin-portal UI finishing its own build.

## Local dev vs production tool resolution

`rulebook-to-node-postgres-api` / `rulebook-to-vite-admin-portal` are under
active local development, so `edit-rulebook.sh` defaults `LOCAL_TOOL_URLS=1`:
the container points at the developer's own `dotnet run` processes via
`host.docker.internal:30039` / `:30040`, so source edits to those tools are
picked up on the very next rebuild -- no publish step in the loop. Once those
tools are stable and you want normal registry resolution instead, run with
`LOCAL_TOOL_URLS=0 ./edit-rulebook.sh`.
