<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-cli/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-cli
description: >
  Use for the `effortless` CLI — both **installing/updating the binary** AND
  **using its commands**. Triggers: "install effortless", "install the CLI",
  "update effortless cli", "the cli isn't installed", `effortless: command
  not found`, version mismatches, login flow, `effortless -init`,
  `effortless build`, `-setAccountAPIKey`, `-install <transpiler>`, transpiler
  management, build flags, project file structure. The CLI is also known as
  `ssotme`, `aicapture`, or `aic` — always use `effortless` in docs/scripts.
  For the **skill set** (different artifact), use effortless-claude-updates.

  **Scope (load gate):** Effortless projects, OR when the user explicitly asks to install / update / use the Effortless CLI. CLI-management work doesn't require an Effortless-marked project.
audience: customer
---

# Effortless CLI — Install + Use

The `effortless` CLI ships from https://github.com/effortlessapi/cli as an npm package whose `bin` entries (`effortless`, `ssotme`, `aicapture`, `aic`) all shim through `cli.js`, which invokes the bundled .NET 8 binary. Because it's just an npm package, Claude can manage the install end-to-end.

**Canonical clone location:** `~/.effortless/cli`
**Canonical command name:** `effortless`

---

# Part 1 — Install / Update the Binary

## Prerequisites

```bash
which dotnet && dotnet --version    # need >= 8.0
which npm && npm --version
node --version                      # need >= 18, prefer 20+
```

If `dotnet` is missing: tell the user, link to https://dotnet.microsoft.com/download. Don't auto-install .NET.

### Node version — install the CLI under Node 20+

The CLI itself runs on Node 16+, but generated apps (Vite 5) require Node 18+ (`crypto.getRandomValues` is missing on 16). Always install the CLI under the same Node version the user's apps will run on, otherwise `which effortless` resolves to a different nvm prefix and switching versions silently "loses" the CLI.

When the user has nvm with an old default:

```bash
source ~/.nvm/nvm.sh
nvm install 20 || true
nvm use 20 && nvm alias default 20
cd ~/.effortless/cli && npm install -g .
which effortless                    # should resolve under v20.x.x/bin
```

Symptoms that this is needed: Vite/Node errors like `crypto.getRandomValues is not a function`, ESM `node:` import errors, "this worked a few days ago" after an nvm change. Check `node --version` before suggesting "downgrade Vite."

App `node_modules` built against Node 16 must be rebuilt: `cd app && rm -rf node_modules package-lock.json && npm install`.

**`nvm alias default 20` only affects new shells.** Existing terminals keep the old version. For projects with a `start.sh`, bake the switch into the script:

```bash
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    . "$HOME/.nvm/nvm.sh"
    node_major=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)
    if (( node_major < 18 )); then
        echo "Node $(node --version) is too old for Vite 5 — switching to Node 20."
        nvm use 20 >/dev/null
    fi
fi
```

## Fresh install

```bash
mkdir -p ~/.effortless
rm -rf ~/.effortless/cli
git clone --depth 1 https://github.com/effortlessapi/cli ~/.effortless/cli
cd ~/.effortless/cli && npm install -g .
```

Verify:

```bash
which effortless                    # should resolve in npm prefix, NOT /usr/local/bin
effortless -version                 # first run triggers dotnet build (~30-60s)
effortless -version                 # second run is instant
```

First invocation prints `dotnet build` warnings — normal. Final line is the version.

## Update

```bash
cd ~/.effortless/cli
git pull
rm -rf Windows/CLI/bin            # force rebuild against new sources
npm install -g .
effortless -version
```

## Uninstall

```bash
npm uninstall -g ssotme           # the npm package name is "ssotme"
rm -rf ~/.effortless/cli
```

## Coexistence with the legacy PKG installer

Older Macs may have `/usr/local/bin/{ssotme,aicapture}` from the old PKG. The npm install doesn't touch those — it places its own symlinks in the npm global prefix. As long as the npm prefix bin dir comes before `/usr/local/bin` on PATH, the npm copy wins.

```bash
echo $PATH | tr ':' '\n' | grep -nE 'nvm|/usr/local/bin'
which -a effortless ssotme
```

If `/usr/local/bin` resolves first: reorder PATH or remove the legacy symlinks (with explicit user confirmation) — `sudo rm /usr/local/bin/ssotme /usr/local/bin/aicapture`.

## When to install automatically

- **Without asking:** `which effortless` returns nothing AND the user has just asked for something that requires the CLI.
- **Confirm first:** working CLI exists; user hasn't asked for an update.
- **Stop and surface:** `dotnet` is missing.

---

# Part 2 — Using the CLI

## Authentication — must happen first

```bash
effortless -login              # interactive: email + 6-digit code
effortless -info               # check login status
effortless -logout
effortless -projectLogin       # project-scoped override
```

## Initializing a project

```bash
effortless -init -projectName "My Project"   # creates effortless.json
effortless -init force                       # nested sub-project
```

For the full project-init walkthrough (directory structure, CLAUDE.md, start.sh, and the optional upstream-surface connection), see **effortless-init**.

## API Key Management (only for projects that talk to Airtable)

Rulebook-First projects need no API key. This applies only when the project opted
into Airtable as an input spoke.

```bash
effortless -setAccountAPIKey airtable=patXXXXXXXX.XXXXXXXX
```

Stored in `~/.ssotme/ssotme.key`:

```json
{
  "EmailAddress": "user@example.com",
  "APIKeys": { "airtable": "patXXXXXXXX.XXXXXXXX" }
}
```

**Resolution order for Airtable key:** `AIRTABLE_API_KEY` env → `~/.ssotme/ssotme.key` → `effortless.json` → `ProjectSettings._apikey_`.

**Every airtable-facing tool MUST include `-account airtable`** to inject the key:

```bash
effortless airtable-to-rulebook -o effortless-rulebook.json -account airtable
```

`effortless.env` is the dotenv alternative for project-scoped secrets: `AIRTABLE_API_KEY=patXXX...`. Full Airtable mechanics live in `effortless-airtable`.

## Installing transpilers

Transpilers are installed **from the directory where the output is expected**. The `-install` flag saves the command into `effortless.json` under `ProjectTranspilers`, recording `RelativePath` (where install was run) and `CommandLine` (full command).

```bash
effortless -install <transpiler> -p key=value -i input.txt -o output.json
```

### Standard installation paths

Output spokes are the common core. Input-spoke transpilers are optional — they
appear only in a project that seeds the hub from an upstream surface.

| Directory | Command | Notes |
|---|---|---|
| `/postgres/` | `effortless -install rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json` | SQL generation (output) |
| `/docs/` | `effortless -install rulebook-to-docs` | Doc generation (output) |
| `/bootstrap/` | `effortless -install raw-text-to-rulebook -i requirements.txt -o bootstrap-rulebook.json` | Rough starting rulebook (optional input) |
| `/effortless-rulebook/` | `effortless -install airtable-to-rulebook -o effortless-rulebook.json -account airtable` | Airtable input spoke (optional) |
| `/effortless-rulebook/push-to-airtable/` | `effortless -install rulebook-to-airtable -i ../effortless-rulebook.json -account airtable` | Reverse-sync (optional) — **MUST be `IsDisabled: true`** |

If wired, `rulebook-to-airtable` must be disabled so it doesn't run on a normal `effortless build` — only `effortless build -id` runs it.

## Building

```bash
effortless build              # all enabled transpilers from project root
effortless build -id          # ALL transpilers, including disabled
effortless buildLocal         # only transpilers in current folder
effortless buildAll           # all project transpilers
```

**Build flags:** `-skipClean`/`-sc`, `-dryRun`/`-dr`, `-debug`, `-ignoreErrors`, `-waitTimeout N`/`-w N`.

## Project inspection / management

```bash
effortless -describe          # describe project + transpilers
effortless -listSettings
effortless -addSetting key=value
effortless -removeSetting key

effortless -uninstall         # remove current command from project file
effortless -listVersions
effortless -upgrade           # update pinned version to current head
effortless -refreshTools      # purge + re-fetch the remote tools index

effortless -clean             # clean current folder + downstream
effortless -cleanAll
```

## `effortless.json` structure

```json
{
  "Name": "Project Name",
  "ProjectSettings": [
    { "Name": "project-name", "Value": "my-project" }
  ],
  "ProjectTranspilers": [
    {
      "Name": "rulebooktopostgres",
      "RelativePath": "/postgres",
      "CommandLine": "effortless rulebook-to-postgres -i ../effortless-rulebook/effortless-rulebook.json",
      "IsDisabled": false
    }
  ]
}
```

An Airtable-connected project additionally carries a `baseId` setting (the Airtable base ID, shared across all airtable-facing tools) and an `airtabletorulebook` transpiler entry.

## Smoke tests

```bash
effortless -version           # last line: e.g. 2026-04-24.18.54
effortless -help | head -1    # banner version derives from same package.json
effortless -info              # login state
```

If `-help` and `-version` drift, the clone predates commit `55634ab` (2026-04-25) — `git pull` and reinstall.

---

## See also

- `effortless-init` — full project-init walkthrough (this skill is just the CLI reference).
- `effortless-pipeline` — build pipeline / `ProjectTranspilers` schema in depth.
- `effortless-setup-postgres` — canonical first-run sequence for Postgres projects.
- `effortless-airtable` — Airtable API key conventions.
- `effortless-claude-updates` — for the **skill set** (different artifact).
