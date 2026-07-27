# effortless-rulebook-editor (v1, READ-ONLY)

Generates the small, static set of files needed to run a self-rebuilding,
containerized rulebook viewer for any Effortless project:

- `Dockerfile` -- Node 20 + .NET 8 SDK + bundled Postgres + the `effortless`
  CLI, baked once at image-build time.
- `container-entrypoint.sh` -- boot sequence: start Postgres, run
  `effortless build` (rulebook -> SQL -> API -> UI), start the generated
  API + UI, then watch the mounted rulebook for changes and rebuild.
- `effortless.editor.json` -- the fixed, generic pipeline config (copied into
  the image as `/app/effortless.json`), registering `rulebook-to-postgres`,
  its `-exec ./init-db.sh` step, `rulebook-to-node-postgres-api`, and
  `rulebook-to-vite-admin-portal`.
- `edit-rulebook.sh` -- thin launcher: `docker build` + `docker run` with the
  correct bind mounts (the rulebook, read-only; `~/.ssotme`, read-only, for
  CLI auth).

## Usage

From an Effortless project containing `effortless-rulebook/effortless-rulebook.json`:

```
effortless -install effortless-rulebook-editor -i effortless-rulebook.json
./edit-rulebook.sh
```

Then open the printed API/UI URLs. Edit the rulebook and refresh -- the
container detects the change and rebuilds automatically.

## V1 scope

Read-only end to end: the mounted rulebook is `ro`, and the two consumed
generator tools (`rulebook-to-node-postgres-api`, `rulebook-to-vite-admin-portal`)
have no write/save/PATCH capability. A future version will make the mount
read-write and add a save path back to the rulebook.

## Local dev vs production tool resolution

While `rulebook-to-node-postgres-api` / `rulebook-to-vite-admin-portal` are
not yet published, `edit-rulebook.sh` sets `LOCAL_TOOL_URLS=1` so the
container points at the developer's own `dotnet run` processes via
`host.docker.internal:30039` / `:30040`. Once those tools are published to
their real URLs, unset `LOCAL_TOOL_URLS` (delete/comment the env line in
`edit-rulebook.sh`) and the container resolves them normally.
