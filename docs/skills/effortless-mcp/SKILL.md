<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-mcp/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-mcp
description: >
  Use for the **Effortless MCP server** — the always-on Model Context Protocol
  endpoint that exposes the entire Effortless transpiler catalog (~54 tools)
  plus the effortless-claude skill set (resources) to any MCP-compatible
  agent (Claude Code, Cursor, Windsurf, ChatGPT, etc.). Triggers: "install
  the effortless mcp server", "wire up effortless mcp", "configure cursor
  for effortless", "what mcp tools does effortless expose", "call
  effortless_build via mcp", `effortless_ping`/`effortless_build`/
  `query_rulebook`/`validate_dag` tool names, `effortless://skills/...`
  resource URIs, "run the mcp server locally", "stdio mode", "bake skills
  into the mcp image". For the **CLI binary**, use effortless-cli; for the
  **skill set source**, use effortless-claude-updates.

  **Scope (load gate):** Loads ONLY on explicit user request — never auto-load. Does NOT require an Effortless-marked project — the MCP server is wire-compatible with any MCP client and useful even outside ERB projects (e.g. driving builds from Cursor in a non-ERB repo that just consumes a generated artifact).
audience: customer
---

# Effortless MCP Server — Install + Use

A versioned `ssotme://` tool deployed to Control Plane. Speaks the Model Context Protocol over **streamable HTTP** (default) or **stdio**. Every active transpiler in the baked catalog snapshot becomes an MCP tool; every text file under each skill folder becomes an MCP resource.

| What | Where |
|---|---|
| **Deployed (HTTP)** | `https://effortless-mcp-server-v2026-05-02-1329-cmvbd4phczmeg.7pktzg2z971j0.cpln.app/mcp` |
| **Source** | [Versioned-Stable-SSoTme-Tools/tools/effortless/mcp-server/](../../../../api.effortlessapi.com/Versioned-Stable-SSoTme-Tools/tools/effortless/mcp-server/) |
| **Local dev port** | `30051` |
| **Browser explorer** | `<base>/explorer` (single-page UI that calls `/mcp` from the browser) |

The deployed URL is **version-pinned** — bumping versions publishes a new URL, and the previous URL keeps working until clients are migrated.

## Surface

**Tools** (callable via `tools/call`):

| Tool | What it does |
|---|---|
| `effortless_ping` | Health/echo. Returns server version + your message. Use to verify wiring. |
| `effortless_build` | Shells out to the `effortless` CLI to run a project pipeline. Inputs: `projectDir`, `includeDisabled` (the `-id` flag). |
| `query_rulebook` | Structured queries against an `effortless-rulebook.json`. Inputs: `input` (path), `query` (`tables` / `schema` / `relationships` / `calculated_fields` / `field` / `dag`), optional `table` / `field`. |
| `validate_dag` | DAG integrity check on an `effortless-rulebook.json`. Catches cycles, broken FK targets, missing Name fields, naming-convention violations. |
| `<transpiler>` (~54) | One auto-generated tool per active transpiler in the baked catalog snapshot. Schemas come from the Airtable Parameter table. POSTs directly to the transpiler's Control Plane URL — does **not** shell out to the CLI. |

**Resources** (read via `resources/read`):

- `effortless://skills/index` — list of all skills in the baked snapshot.
- `effortless://skills/<name>` — manifest for one skill.
- `effortless://skills/<name>/<file>` — every text file under that skill folder.

The baked skill snapshot is a frozen copy of `github.com/effortlessapi/effortless-claude/skills/` taken at image build time.

## Install

### Claude Code

Already wired at user level if you see `mcp__effortless-mcp__*` tools in the deferred list. To configure manually, add to `~/.claude.json` under the appropriate project (or the user-level block):

```json
{
  "mcpServers": {
    "effortless-mcp": {
      "type": "http",
      "url": "https://effortless-mcp-server-v2026-05-02-1329-cmvbd4phczmeg.7pktzg2z971j0.cpln.app/mcp"
    }
  }
}
```

Restart Claude Code (or `/mcp` to inspect). Tool names will appear as `mcp__effortless-mcp__effortless_ping`, etc.

### Cursor / Windsurf

```json
{
  "mcpServers": {
    "effortless-mcp": {
      "url": "https://effortless-mcp-server-v2026-05-02-1329-cmvbd4phczmeg.7pktzg2z971j0.cpln.app/mcp",
      "transport": "streamable-http"
    }
  }
}
```

### Self-describing config generation

`POST /run` with `{"clientType": "claude-code" | "cursor" | "windsurf" | ...}` returns a fileset including a pre-wired settings snippet. Use this when wiring a new client type rather than guessing the schema.

## Smoke tests

```bash
BASE='https://effortless-mcp-server-v2026-05-02-1329-cmvbd4phczmeg.7pktzg2z971j0.cpln.app'

curl -s "$BASE/healthz"        # liveness
curl -s "$BASE/_meta"          # version + protocol metadata
curl -s -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/run" | jq .summary
```

In Claude Code: ask *"Run `effortless_ping` with message 'hello'."* — should return JSON with the server version.

## Local development

The MCP server lives as a `ssotme://` versioned tool at [tools/effortless/mcp-server/](../../../../api.effortlessapi.com/Versioned-Stable-SSoTme-Tools/tools/effortless/mcp-server/). Local dev reads skills from the sibling `effortless-claude/skills/` repo directly (no bake step needed); the deployed image bakes a snapshot.

```bash
cd <repo>/Versioned-Stable-SSoTme-Tools/tools/effortless/mcp-server

./scripts/bake-catalog.sh      # workload/catalog.json (homedir CLI cache → snapshot)
./start.sh                     # HTTP on :30051
./start.sh --stdio             # stdio mode (for clients that spawn a child process)
```

`start.sh` requires Node ≥ 18. It tries `nvm use 20` automatically if your default is older. Port-squatters on `:30051` get killed.

To point a local Claude Code at the dev server instead of the deployed one:

```json
{
  "mcpServers": {
    "effortless-mcp-local": {
      "type": "http",
      "url": "http://localhost:30051/mcp"
    }
  }
}
```

## Deploy a new version

Through the **transpiler-server UI at `http://localhost:3000`**, not the cpln CLI directly. The flow:

1. `./scripts/bake-catalog.sh` — freeze the desired catalog snapshot.
2. `./scripts/bake-skills.sh` — freeze the desired `effortless-claude/skills/` snapshot.
3. Bump the version in [workload/ssotme-tool.json](../../../../api.effortlessapi.com/Versioned-Stable-SSoTme-Tools/tools/effortless/mcp-server/workload/ssotme-tool.json) (`vYYYY.MM.DD.HHMM` mirrored across `name`, `version`, `names.*`, `metaData.versionNumber`, `metaData.createdAt`, `metaData.createdOn`).
4. Bump `workload/package.json` `version` (semver, parallel to the timestamp).
5. Open the transpiler-server UI → navigate to `effortless/effortless/mcp-server` → **Publish New Version**. The UI runs `docker build`, pushes to the Control Plane org, applies `cpln/workload.yaml`, and inserts a `TranspilerVersion` row in Airtable base `app1dOUUtasVF6wc2`.
6. Verify: `curl <new-url>/_meta`. Update the deployed URL in `~/.claude.json` and any other client configs.

The previous version stays addressable at its pinned URL — existing clients keep working until migrated.

## When to invoke MCP tools vs. local CLI vs. Airtable API

| Goal | Use |
|---|---|
| Run a project's full build pipeline | `effortless_build` (or `effortless build` from a shell — same effect) |
| Call one transpiler in isolation | `mcp__effortless-mcp__<transpiler>` (direct HTTP to Control Plane — no local CLI needed) |
| Inspect rulebook structure cheaply | **Use a local python one-liner** (see `effortless-query`) — `query_rulebook` adds a network round-trip for no benefit when the CLI is available |
| Sanity-check rulebook before commit | `validate_dag` |
| Scalar field add / CRUD (rulebook-direct, default) | Edit `effortless-rulebook.json` directly |
| Scalar field add / CRUD (Airtable-connected projects only) | Airtable REST API (see `effortless-airtable`) — **not** the MCP transpiler tools |
| Formula / lookup / rollup / new table (Airtable-connected projects only) | OMNI via Playwright (see `effortless-airtable-omni`) |

The MCP server's transpiler tools are equivalent in effect to running the corresponding `effortless <transpiler>` CLI command, but they POST directly to Control Plane — useful when the CLI isn't installed (Cursor on a teammate's laptop, ChatGPT in the browser, etc.).

## See also

- `effortless-cli` — the CLI binary; complementary surface over the same catalog.
- `effortless-pipeline` — what `effortless_build` actually orchestrates.
- `effortless-query` — local one-liners equivalent to `query_rulebook`.
- `effortless-diagnostics` — what `validate_dag` is checking for.
- `effortless-claude-updates` — for editing the **skill set** that this server exposes as resources.
