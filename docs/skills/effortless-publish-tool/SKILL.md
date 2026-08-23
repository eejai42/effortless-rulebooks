<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-publish-tool/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-publish-tool
description: >
  Use whenever the user asks to **publish, push, deploy, or release a new version of a
  transpiler tool** in `Versioned-Stable-SSoTme-Tools` — e.g. "publish rulebook-to-sql-server",
  "push the tool online", "deploy the new version", "ship this transpiler", "release it",
  "make a new version live". This is the EXACT, supported, scripted path that mirrors the
  green 🚀 Deploy button in the transpiler-server UI. It is NOT the same as `effortless build`
  (that CONSUMES a published tool) and NOT `build-and-push-cpln-workload.sh` alone (that only
  builds the image without flipping `[latest]` live).

  **Do not invent a publish procedure.** There is exactly one scripted path:
  `scripts/publish-tool.sh <transpilerId> <category>/<tool-name>`. If the transpiler-server
  isn't on port 3000, find the port — don't conclude it's "down". See below.

  **Scope (load gate):** Loads when the user wants to publish/push/deploy a transpiler tool
  from the `Versioned-Stable-SSoTme-Tools` repo. Requires that repo (and `cpln` authenticated).
audience: general
---

# Publishing a Transpiler Tool (`Versioned-Stable-SSoTme-Tools`)

"Publish / push / deploy a new version of tool X" is **one specific multi-step sequence**,
NOT a single ad-hoc script. There are exactly two real publish paths and **both run the same
sequence**:

1. The green **🚀 Deploy button** in the transpiler-server UI.
2. **`scripts/publish-tool.sh <transpilerId> <category>/<tool-name>`** — the only supported
   scripted path. It drives the same SSE endpoint the Deploy button uses, then activates the
   new version.

When the user says "push it online", "publish", "deploy", or "ship the tool" — **use
`publish-tool.sh`**. Do not hand-roll `cpln apply` + "click Deploy". Do not reach for a
`POST /api/transpilers/:id/deploy` curl (that endpoint was deleted — it created broken,
un-built Airtable records).

## Standing rule: develop on localhost:300xx first, publish last

**Whenever a tool under `Versioned-Stable-SSoTme-Tools/tools/effortless/*` is being actively
worked on (edited, debugged, iterated), default to the local-dev loop — never publish first
and iterate against the live cpln URL.**

1. Run the tool's own `./start.sh` (or `dotnet run` from its `workload/`), which listens on
   its dev port in the `300xx` range (each tool's `Program.cs` sets this via
   `defaultPort:` in `EffortlessHelper.StartToolListener` — e.g. `rulebook-to-node-postgres-api`
   defaults to `30039`, `rulebook-to-vite-admin-portal` to `30040`; read the tool's own
   `Program.cs`/`start.sh` for its actual number rather than assuming). Override with
   `PORT=<port> dotnet run` if a specific port is needed for a given debugging session.
2. Point whatever consumes the tool at that local URL with
   `effortless -setToolUrl <tool-name>=http://localhost:<port>` (or, for a consumer that
   already branches on it, its own `LOCAL_TOOL_URLS=1` / `LOCAL_*_PORT` env vars — e.g.
   `effortless-rulebook-editor`'s `edit-rulebook.sh` does this natively).
3. Debug and iterate entirely against that local process. Do **not** run `publish-tool.sh`
   during this phase — a publish here would ship an unfinished tool live for every consumer.
4. Only once the tool is verified working locally: run `publish-tool.sh` (below) to actually
   publish, **then** remove the override — `effortless -removeUrl <tool-name>` (or unset the
   consumer's `LOCAL_TOOL_URLS`) — so normal resolution picks up the newly published version.

If a task involves editing one of these tools' source, assume this loop by default — don't
ask the user whether to publish first; ask only if it's ambiguous whether the tool is still
being actively developed or is already considered done for this session.

## The one command

```bash
cd Versioned-Stable-SSoTme-Tools
API_BASE="http://localhost:<PORT>/api" \
  ./scripts/publish-tool.sh <transpilerId> <category>/<tool-name>
```

Example (real):

```bash
API_BASE="http://localhost:4205/api" \
  ./scripts/publish-tool.sh recyxbCdc8WlhTTfs effortless/rulebook-to-sql-server
```

What it does, end to end (the full sequence — don't replicate it by hand):
1. `GET /api/transpilers/:transpilerId/deploy/stream?toolPath=<category>/<tool-name>&steps=airtable,metadata,build,wait`
   — creates the Airtable `TranspilerVersions` record, copies metadata, generates a
   `yyyy.mm.dd.hhmm` version, shells out to `build-and-push-cpln-workload.sh` to build+push
   the Docker image and `cpln apply` the workload to GVC `ssotme-tools`, waits for it online,
   streaming SSE progress.
2. On the SSE `complete` event, `PUT /api/versions/:versionRecordId { "IsActive": true }` —
   flips the new version live so `[latest]` moves and a plain `effortless build` picks it up.

A successful run ends with `✅ Build + deploy complete` then `✅ Version activated`.

## The two arguments — how to get them

`publish-tool.sh` takes **two** positional args. You need both before you can run it.

- **`<category>/<tool-name>`** — the path under `Versioned-Stable-SSoTme-Tools/tools/`.
  For rulebook tools it's `effortless/<tool-name>` (e.g. `effortless/rulebook-to-sql-server`).
  Just read it off the directory you're working in.

- **`<transpilerId>`** — the Airtable record id (`recXXXX`), found in the transpiler-server
  URL fragment `#.../transpiler/<id>`. If the user doesn't paste it, **fetch it** from the
  running server:

  ```bash
  curl -s "http://localhost:<PORT>/api/transpilers" \
    | python3 -c 'import json,sys;
  d=json.load(sys.stdin); items=d["data"] if isinstance(d,dict) else d
  [print(t["id"],"|",t["fields"].get("Name") or t["fields"].get("DisplayName"))
   for t in items if "<tool-name>" in str(t.get("fields",{})).lower()]'
  ```

## "The transpiler-server is down" — it probably isn't. Find its port.

`publish-tool.sh` drives the transpiler-server, which defaults to `http://localhost:3000` BUT
**often runs on a different `PORT`** (e.g. 4205). If `curl localhost:3000` fails, **do not
conclude it's down** — find the actual port:

```bash
# Find the running transpiler-server process and its listening port:
ps aux | grep -i 'transpiler-server\|ts-node-dev.*src/index.ts' | grep -v grep
# Then, for that PID:
lsof -nP -p <PID> -iTCP -sTCP:LISTEN
```

Then pass `API_BASE="http://localhost:<that-port>/api"` to `publish-tool.sh` (its default
`API_BASE` is `http://localhost:3000/api`; override it). The transpiler-server lives at
`Versioned-Stable-SSoTme-Tools/transpiler-server` (`npm run dev`). If it genuinely isn't
running, start it there — but check the port first; the user usually already has it up.

> **Sandbox note (Claude Code):** localhost and `*.cpln.app` calls can be blocked by the
> Bash sandbox even when the service IS up. If a localhost `curl` returns nothing, retry the
> command with the sandbox disabled before deciding it's down.

## Prerequisites

- **`cpln` CLI authenticated** (`cpln profile get` shows an active profile). The build step
  pushes to GVC `ssotme-tools`, org defaults to `effortlessapi`. No CPLN_* env vars needed if
  the profile is active.
- **`jq`** (the script requires it).
- **transpiler-server running** (find its port, above).

## Don't confuse these three scripts

| Script | What it does | Flips `[latest]` live? |
|---|---|---|
| `scripts/publish-tool.sh` | **The real publish.** Airtable version + build + push + cpln apply + wait + activate. | ✅ yes |
| `scripts/build-and-push-cpln-workload.sh` | Build the Docker image, push it, `cpln apply` the workload **only**. | ❌ no — reachable at its own versioned URL, but `[latest]` still points at the old version |
| `effortless build` / `-install` | **Consumes** a published tool in a project. Not a publish. | n/a |

To use a freshly-built-but-unpublished version locally without publishing:
`effortless -setToolUrl <tool>=<versioned-url>` (undo with `effortless -removeUrl <tool>`).

## After publishing — verify

The SSE `complete` payload includes `versionNumber`, `workloadUrl`, and the activated
`versionRecord.id`. The new `[latest]` is live immediately; a consumer project that runs
`effortless -install <tool> …` / `effortless build` now gets the new version.

### First consume after publish: warm the cold workload

cpln workloads scale to zero (`minScale: 0`). The **first** call after a publish hits a cold
start, and `effortless -install` / `effortless build` can fail with
`Remote transpiler not ready (GatewayTimeout)` → `ERROR: Timed out waiting for cook`. This is a
cold-start timing quirk (shared with the other rulebook-to-* tools), **not** a defect in the
freshly-published tool. To confirm the tool is actually live and to warm it:

```bash
# 1. Warm it (first hit cold-starts the container):
curl -s "<workloadUrl>/healthz"        # → {"status":"ok"} once warm

# 2. Confirm it transpiles (the real path) — POST the FileSet, then poll the async task:
curl -s -X POST "<workloadUrl>/" -H 'Content-Type: application/json' \
  -d '{"FileSetFiles":[{"RelativePath":"effortless-rulebook.json","FileContents":"<json>","OverwriteMode":"Always"}],"cliParams":["mode=check-add","stage=dev","schema=dbo"]}'
# → {"TaskId":"…","TaskStatus":"pending"}; then GET <workloadUrl>/task/<TaskId> until "completed".
```

Once warm, re-run `effortless -install` / `effortless build`; it succeeds. A direct POST
completing with a `TranspileRequest` (the generated fileset) is proof the published tool works
even if the CLI's cold-start wait timed out.
