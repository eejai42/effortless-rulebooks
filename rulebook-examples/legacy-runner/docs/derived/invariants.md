<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `FramingInvariants`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Framing Invariants

Mistakes-to-avoid catalog. Each row is one wrong framing that has been caught and corrected, paired with the right framing and the axiom it violates. The portal surfaces these so future agents (and humans) can be re-grounded without rediscovering them.

## Category: build-semantics

### ERB is a code generator

**Wrong framing.** ERB generates code from a declarative spec — like any other code generator.

**Correct framing.** `effortless build` is CONVERGENT, not additive. Downstream artifacts mirror the current rulebook: additions appear, removals disappear, renames propagate. A conventional code generator only adds; ERB conforms. The rulebook is the SSoT in BOTH directions.

**Why.** Calling ERB a 'code generator' anchors readers on a category (one-way emit-and-forget) that misses the load-bearing property. The convergence is what lets the rulebook stay authoritative — if removals didn't propagate, generated code would silently outlive its spec and the SSoT claim would collapse.

_violates `ax-012` · severity: critical · status: active_

## Category: category-error

### Project rulebook is a demo rulebook

**Wrong framing.** Portal-config tables (UserRoles, AppUsers, AppNavigation) belong in whichever rulebook is active.

**Correct framing.** Portal-config tables live ONLY in the project rulebook (this file). Demo rulebooks contain only their domain's business tables. Two file reads, two concerns, never merged.

**Why.** Mixing platform-meta with business-data couples the wrapper to one domain. The wrapper has to work for every demo; the demo has to travel without portal config.

_violates `ax-006` · severity: critical · status: active_

### Build can run without testing

**Wrong framing.** Add a 'build without testing' option so users can iterate faster.

**Correct framing.** Build = generate + test + regenerate report + open. The conformance proof is the point of the build; codegen alone produces output of unknown correctness.

**Why.** Splitting build from test makes 'did this work' ambiguous and silently allows substrates to drift apart between formal runs.

_violates `ax-008` · severity: important · status: active_

## Category: dialect-binding

### Excel formulas are the formula language of ERB

**Wrong framing.** ERB formulas are Excel-compatible (IF, AND, OR, CONCAT, LEFT, RIGHT, …) — that's how calculated fields work in ERB.

**Correct framing.** ERB rulebooks declare a formula DIALECT. Excel is the current default because domain experts can read it, but Airtable dialect (or any other) is equally valid. The dialect is a per-rulebook property; the conformance claim is 'all substrates compute identically UNDER THIS RULEBOOK'S DECLARED DIALECT.'

**Why.** Hardcoding Excel as 'the ERB formula language' couples the methodology to one dialect's quirks (1-indexed strings, specific function set, etc.) and excludes teams who already think in another dialect. The dialect is metadata on the rulebook; the platform's job is to make every substrate's transpiler honor whichever dialect is declared.

_violates `ax-013` · severity: important · status: active_

## Category: fail-loud

### Silent fallback when a path is missing

**Wrong framing.** If a rulebook file is not at the expected path, check a legacy location or return {} with a warning.

**Correct framing.** Fail loudly with the exact expected path. Every fallback hides a bug; there are no compatibility shims in a project this young.

**Why.** Fallbacks make conformance run against the wrong data and report 100% pass, masking the real failure. A loud failure produces a fixable stack trace.

_violates `ax-005` · severity: critical · status: active_

### Defaults are fallbacks

**Wrong framing.** All `or`-defaults are fallbacks and should be removed.

**Correct framing.** A default computed from the SSoT (e.g. `or f"erb_{active_domain}"`) is NOT a fallback — it's the deterministically-correct value the env var would override. A fallback is one that silently substitutes a guess.

**Why.** Over-correcting on the 'no fallbacks' rule removes correct SSoT-derived defaults and forces every caller to set env vars. The test: if the default would still be correct after the env var was unset by accident, it's a default.

_violates `ax-005` · severity: nuance · status: active_

## Category: naming

### Admin portal is named after a domain

**Wrong framing.** Database names like erb_admin_acme_llc, erb_admin_star_trek — admin portal plus the active domain.

**Correct framing.** erb_admin_portal (singular) for the portal's own state; erb_<domain> for each document. The word 'admin' appears only in the portal's own DB name and never with a domain suffix.

**Why.** The naming itself proves the category error: the app is not named after the document it opens. Word's install directory is not 'Word_my_resume'.

_violates `ax-007` · severity: critical · status: active_

## Category: project-catalog

### Swappable active domain

**Wrong framing.** The platform has one stack and a 'swappable active domain' — switch the active domain (acme-llc, star-trek, talisman-advanced, …) and the entire stack regenerates against it.

**Correct framing.** rulebook-examples/ is a CATALOG of N independent Effortless projects. Each project owns its own rulebook and picks the subset of the platform's 15 substrates it needs (acme-llc uses all 15; most use 3+). active-domain.txt is a convenience pointer for the orchestrator/portal — not the architecture.

**Why.** The 'swappable' framing implies one shared stack parameterized by domain. In reality each project is self-contained; the platform is a catalog, not a runtime that mounts one domain at a time. Calling them 'swappable' hides the fact that projects choose different substrate subsets and evolve independently.

_violates `ax-006` · severity: critical · status: active_

## Category: role-confusion

### Portal grows logic the CLI lacks

**Wrong framing.** It's easier to implement 'install a tool' directly in the portal backend than to call the effortless CLI.

**Correct framing.** The portal shells out to the same `effortless` CLI command the user would run by hand. Both surfaces are peer interfaces to the same pipeline.

**Why.** Two implementations of the same operation will drift; conformance claims become qualified by interface.

_violates `ax-009` · severity: important · status: active_

## Category: ssot-locality

### The rulebook JSON is always the SSoT

**Wrong framing.** The rulebook JSON file is the single source of truth in every deployment.

**Correct framing.** The rulebook is the portable IR. The SSoT for a given conformance run is whichever spoke the user designates — Airtable export, Excel workbook, hand-edited JSON, etc. If Airtable is the SSoT, the rulebook JSON is downstream from it.

**Why.** Treating the JSON as universally authoritative ignores that input spokes can BE the SSoT. The framework supports several deployment modes; only one of them has the JSON as primary.

_violates `ax-003` · severity: critical · status: active_

### Postgres editor wins over JSON

**Wrong framing.** Persist edits to Postgres now and write them to JSON on demand (lazy sync).

**Correct framing.** Every save is write-through: Postgres and JSON in the same logical transaction. Postgres is the live editor; JSON is the durable SSoT.

**Why.** Lazy sync means a crash leaves the JSON behind the editor — and the JSON is the only file that travels with the repo.

_violates `ax-010` · severity: critical · status: active_

## Category: substrate-equality

### Postgres is the reference substrate

**Wrong framing.** Postgres is the reference substrate with no expressive gaps; other substrates are demonstrations with gaps relative to it.

**Correct framing.** Postgres is one of N peer substrates. It happens to have few expressive gaps in practice, which makes it a convenient witness — but witnessing is not the same as crowning.

**Why.** Calling Postgres 'the reference' redefines 'correct' as 'matches Postgres'. The actual SSoT is the rulebook (or the user-designated answer-key substrate for that run). Postgres being trustworthy doesn't make it privileged.

_violates `ax-002` · severity: critical · status: active_

### IsProduction = trustworthy

**Wrong framing.** Substrates with IsProduction=true (Postgres, Excel, Entity Framework) are the trustworthy ones; the others are proof-of-concept.

**Correct framing.** 'Production' here means 'backed by an officially-licensed transpiler' — a fact about who built the generator, not about whether the substrate computes correctly. Trustworthiness is measured by passing the conformance tests.

**Why.** Using one column to mean both 'authorized vendor built it' AND 'we trust its output' conflates provenance with correctness. They are independent properties; conformance is what proves correctness.

_violates `ax-002` · severity: important · status: active_

