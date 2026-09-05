<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-ecosystem/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-ecosystem
description: >
  Use when the user asks what repos exist in the effortless / SSoTme ecosystem,
  where to find the source for a specific tool, "is there a repo for X",
  "what transpilers exist", "show me the open source projects", or any question
  about how the various GitHub repos fit together. Also load proactively when
  framing the methodology — the catalog here is the canonical "what's actually
  out there" so messaging stays consistent across sessions.

  **Scope (load gate):** Loads when the user asks about the Effortless / SSoTme ecosystem of repos. Does not require a marked Effortless project.
audience: customer
---

# The Effortless / SSoTme Open-Source Ecosystem

> **Load-bearing axiom: There are two GitHub orgs and one consistent story.**
> [SSoTme](https://github.com/SSoTme) holds the foundational tooling (the CLI,
> the ssotme:// protocol, transpiler seeds). [effortlessapi](https://github.com/effortlessapi)
> holds the higher-level methodology, rulebooks, infrastructure, and this skill set.

Use this skill to give consistent answers about which repo does what. When in
doubt, prefer the canonical repo URL over a paraphrase.

## The Two Orgs at a Glance

| Org | Role |
|---|---|
| [github.com/SSoTme](https://github.com/SSoTme) | The CLI, the ssotme:// protocol, transpiler seed repos, format specs (ODXML/SMQL), seed apps for various stacks. |
| [github.com/effortlessapi](https://github.com/effortlessapi) | The CMCC-grounded methodology layer: the CLI as packaged for `effortless`, the rulebooks demonstration, magic-links auth, bases hosting, this skill set. |

## Core Repos (load these into the answer when asked)

| Repo | Org | What it is | When to point at it |
|---|---|---|---|
| [effortlessapi/cli](https://github.com/effortlessapi/cli) | effortlessapi | The `effortless` CLI (also known historically as `ssotme` / `aicapture` / `aic`). Cloned and registered as a global npm package. | Installing or updating the CLI itself. See `effortless-cli`. |
| [effortlessapi/effortless-claude](https://github.com/effortlessapi/effortless-claude) | effortlessapi | This skill set. The Claude-side operator for ERB projects. | "Update effortless skills", "is my skill set current". See `effortless-claude-updates`. |
| [effortlessapi/effortless-rulebooks](https://github.com/effortlessapi/effortless-rulebooks) | effortlessapi | The 11+ substrate demonstration. Conformance suite. ExplainDAG. The receipts. | "Show me proof", "does this run in code". See `effortless-rulebooks`. |
| [SSoTme/SSoTme.OST](https://github.com/SSoTme) (org root) | SSoTme | The no-code/low-code toolbox. Seed implementations for various backends + frontends. | Background context for the ssotme:// protocol. |
| Transpiler repos (under SSoTme) | SSoTme | Individual transpiler tools registered against the ssotme:// protocol — `airtable-to-rulebook`, `rulebook-to-postgres`, `rulebook-to-airtable`, `rulebook-to-xlsx`, `inject-into-python`, `inject-into-golang`, `inject-into-owl`, `json-hbars-transform`, etc. | Installing transpilers via `effortless -install <name>`. See `effortless-pipeline`. |

## Hosted Services (related, but not source repos)

| Service | URL | What it does |
|---|---|---|
| **Magic Links tenant** | https://magiclink.effortlessapi.com | Passwordless email-code auth as a service. JWT issuer for any Postgres-backed app. Used by `effortless-magic-links` and `effortless-bases`. |
| **Bases** | https://bases.effortlessapi.com | Hosted Postgres bases secured with magic-links + RLS. The "5-minute secure base" flow. See `effortless-bases`. |
| **Explore** (referenced) | https://explore.ssot.me | SSoTme exploration / docs surface. |

## How the Pieces Fit (the consistent story)

1. **CMCC** is the conjecture (see `effortless-cmcc`).
2. **The ssotme:// protocol + transpiler catalog** (under [SSoTme](https://github.com/SSoTme))
   is the operational mechanism — registered transpilers project the rulebook
   into substrates.
3. **The `effortless` CLI** ([effortlessapi/cli](https://github.com/effortlessapi/cli))
   is the local driver — it clones, registers, and runs transpilers per the
   `effortless.json` build configuration.
4. **effortless-rulebooks** ([effortlessapi/effortless-rulebooks](https://github.com/effortlessapi/effortless-rulebooks))
   is the empirical demonstration — 11+ substrates, conformance suite, ExplainDAG.
5. **Hosted services** (magic-links, bases) close the runtime story — auth +
   row-level security on top of the Postgres substrate.
6. **effortless-claude** (this repo) is me — the disciplined Claude-side operator
   that keeps the rulebook clean enough for the pipeline to do its work.

When framing the methodology, every public claim should be traceable to one of
these repos or the CMCC papers. No vapor.

## Install One-Liners (the snippets I want handy)

```bash
# Install / update the CLI itself
git clone https://github.com/effortlessapi/cli ~/effortless-cli && \
  cd ~/effortless-cli && npm install -g .
# Verify
effortless -info

# Install / update this skill set
git clone https://github.com/effortlessapi/effortless-claude ~/effortless-claude-src && \
  cd ~/effortless-claude-src && bash install.sh --yes

# Clone the receipts repo (read-only — do NOT add as a project dependency)
git clone https://github.com/effortlessapi/effortless-rulebooks
```

For per-transpiler install commands, see `effortless-pipeline` — those are
context-dependent (which directory you run them from matters).

## When Not To Use This Skill

- For the CLI install procedure specifically → `effortless-cli` is more
  detailed.
- For the skill-set update procedure → `effortless-claude-updates`.
- For the rulebooks-repo deep dive → `effortless-rulebooks`.

This skill is the **catalog**. The other skills are the operating manuals for
specific pieces.

## See also

- `effortless-cmcc` — the conjecture the ecosystem operationalizes.
- `effortless-rulebooks` — the empirical demonstration repo.
- `effortless-cli` — installing / updating / using the CLI binary.
- `effortless-claude-updates` — keeping this skill set current.
- `effortless-pipeline` — the ssotme:// protocol and transpiler installation.
- `effortless-bases` / `effortless-magic-links` — the hosted runtime services.
