<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `PlatformFeatures`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Platform Features

The catalog of distinctive features the ERB platform offers. The rulebook is the formal SSoT for this list; the repo's README and per-feature README files MUST conform to these rows. Each feature has a one-line summary (the elevator pitch), a Tier (headline vs additional), a Priority (sort order within tier), and a ReadmeFilePath (where the long-form explanation lives — even if it's still a stub). IsReadmeStub is calculated so 'which READMEs are still missing' is a queryable fact, not a tribal one. Many features reference an OntologyAxiom — that's the axiom the feature operationalizes.

## Tier: headline

### Abstract Derivative Percentage (ADP)

A first-class, measurable percentage of any ERB project that is derivative (mechanically rebuildable) vs. hand-written — `effortless -clean` deletes everything derivative, build restores it, and the LOC delta is the ADP.

_short: `ADP` · hand-doc: [docs/features/README.ADP.md](../../docs/features/README.ADP.md) · axiom: `ax-001` · status: shipped_

ADP draws a bright red line between Derivative Code (rebuildable on demand) and Hand Code (would be permanently lost without backup). Measured as (LOC_before_cleanall - LOC_after_cleanall) / LOC_before_cleanall. A pure scaffold starts at ~100%; a typical ERB project lands at 60-80%.

### effortless -clean / implicit clean before build

`effortless -clean` removes every file whose OverwriteMode is ALWAYS, plus every NEVER-mode file that still matches the original generator output — both are Derivative Code by definition. Every build runs this implicitly first, so 'following along' is the default.

_short: `Clean` · hand-doc: [docs/features/README.clean.md](../../docs/features/README.clean.md) · axiom: `ax-012` · status: shipped_

Clean is the mechanism that lets ADP be measured. OverwriteMode=ALWAYS files are always derivative; OverwriteMode=NEVER files are derivative as long as their content still matches the generator output. Once a NEVER file is customized, it crosses into Hand Code and clean leaves it alone.

### Rulebook as IR / Hub-and-Spoke Topology

The rulebook JSON is the hub; every input (Airtable, LLM, admin portal, hand edits) and every output (Postgres, Python, Go, Excel, OWL, …) is a spoke. Spokes never talk to each other — they all route through the rulebook, eliminating the n×n integration problem.

_short: `Hub-and-Spoke` · hand-doc: [docs/features/README.hub-and-spoke.md](../../docs/features/README.hub-and-spoke.md) · axiom: `ax-004` · status: shipped_

The topology IS the architecture: one durable IR, N peer spokes. Generated artifacts are projections of the rulebook, never accumulations.

### Convergent Builds (not Additive Codegen)

`effortless build` makes downstream artifacts mirror the current rulebook — additions appear, removals disappear, renames propagate. A conventional code generator only adds; ERB conforms, in both directions.

_short: `Convergent Build` · hand-doc: [docs/features/README.convergent-build.md](../../docs/features/README.convergent-build.md) · axiom: `ax-012` · status: shipped_

Conventional codegen is one-way: you remove a field from the spec, the generated column lingers until someone notices. ERB is two-way: removing a field from the rulebook removes it from every substrate on the next build. This is what makes the rulebook stay authoritative.

### No Privileged Substrate / Portability

Every substrate (Postgres, Python, Go, OWL, COBOL, Excel, English, ARM64) is a peer projection of the rulebook. Languages not yet invented can be plugged in down the road by writing one transpiler — the rest of the stack lights up unchanged.

_short: `Substrate Equivalence` · hand-doc: [docs/features/README.substrate-equivalence.md](../../docs/features/README.substrate-equivalence.md) · axiom: `ax-002` · status: shipped_

No substrate is the reference. Trustworthiness is measured by passing the conformance tests, not by being Postgres. This is what justifies 'portable across not-yet-invented languages'.

### Conformance Testing Across Substrates

Every build runs every substrate's conformance test against a locally-designated answer key and shows the pass/fail matrix. Substrate agreement is the empirical receipt that the rulebook is the SSoT.

_short: `Conformance` · hand-doc: [docs/features/README.conformance.md](../../docs/features/README.conformance.md) · axiom: `ax-008` · status: shipped_

There is no 'build without testing'. Build = generate + test + regenerate report + open. If a substrate has no take-test, that is a bug to fix, not a case to handle.

### Locally-Designated SSoT

The 'answer key' for a conformance run is whichever spoke the user designates — Airtable export, Excel workbook, hand-edited JSON, Postgres dump. The same harness validates Airtable-driven, Excel-driven, and JSON-driven projects.

_short: `Local SSoT` · hand-doc: [docs/features/README.local-ssot.md](../../docs/features/README.local-ssot.md) · axiom: `ax-003` · status: shipped_

SSoT is a per-run designation, not a global property. The rulebook is the portable IR; the SSoT for a given run is whichever substrate the user nominates as the oracle.

### Portal/CLI Parity

The admin portal and `./start.sh --cli` are peer interfaces to the same `effortless.json` pipeline. Every portal mutation shells out to the same `effortless` CLI command, so the two surfaces cannot drift.

_short: `Portal/CLI Parity` · hand-doc: [docs/features/README.portal-cli-parity.md](../../docs/features/README.portal-cli-parity.md) · axiom: `ax-009` · status: partial_

Two surfaces, one pipeline. If the portal grows logic the CLI doesn't have, that logic moves into the CLI and the portal calls it.

### Write-Through Invariant

The portal's editor Postgres DB is live; the rulebook JSON is durable. Every save writes to BOTH in the same logical transaction — drop Postgres at any time and rebuild from JSON, never the other direction.

_short: `Write-Through` · hand-doc: [docs/features/README.write-through.md](../../docs/features/README.write-through.md) · axiom: `ax-010` · status: partial_

The rulebook JSON is the only file that travels with the repo. Postgres is convenience; JSON is truth. Lazy sync is forbidden.

### Skills as LLM force multiplier

The rulebook gives the LLM something to operate on; the skills give it the instructions for how to operate — together they replace a learning curve that previously cost weeks.

_short: `Claude Skills` · hand-doc: [docs/features/README.claude-skills.md](../../docs/features/README.claude-skills.md) · status: shipped_

Before ERB, every developer had to teach their LLM the ERB conventions from scratch. Skills pre-encode that learning — naming rules, pipeline mechanics, formula semantics, the Leopold loop — so the LLM arrives already trained. The rulebook is the subject matter; the skills are the curriculum. Without the rulebook there is nothing for the skills to operate on. Without the skills the LLM has to rediscover the conventions by trial and error.

## Tier: additional

### Fail Loudly, Never Fall Back

When a file or value isn't where it's expected, the code fails with the exact expected path. No silent fallbacks. Defaults derived from the SSoT are fine; defaults that substitute a guess are not.

_short: `Fail Loud` · hand-doc: [docs/features/README.fail-loud.md](../../docs/features/README.fail-loud.md) · axiom: `ax-005` · status: shipped_

Silent fallbacks make conformance run against the wrong data and report 100% pass, masking the real failure. A loud failure produces a fixable stack trace.

### Rulebook Is a Complete Spec

A rulebook alone — no accompanying source code, no documentation — is sufficient for any frontier LLM to answer any question about the domain or produce a faithful implementation in any language.

_short: `Complete Spec` · hand-doc: [docs/features/README.complete-spec.md](../../docs/features/README.complete-spec.md) · axiom: `ax-011` · status: shipped_

The load-bearing portability claim. If the rulebook were not self-sufficient, the methodology would degrade into docs-plus-code where the docs lie and the code is the real spec.

### Per-Rulebook Formula Dialect

Each rulebook declares its formula dialect (Excel, Airtable, …). Substrates honor the declared dialect; the conformance claim is 'all substrates compute identically under THIS rulebook's declared dialect.'

_short: `Dialect Binding` · hand-doc: [docs/features/README.dialect-binding.md](../../docs/features/README.dialect-binding.md) · axiom: `ax-013` · status: shipped_

Excel is the current default because domain experts can read it, but it is not invariant. Dialect is metadata on the rulebook, not a property of ERB.

### Project Rulebook ≠ Demo Rulebook

The platform rulebook describes ERB itself; the demo rulebooks under `rulebook-examples/` describe one business domain each. They never mix — portal config lives only in the platform rulebook; business tables live only in their demo rulebook.

_short: `Project/Demo Split` · hand-doc: [docs/features/README.project-vs-demo.md](../../docs/features/README.project-vs-demo.md) · axiom: `ax-006` · status: shipped_

Mixing platform-meta with business-data couples the wrapper to a domain, which destroys portability. Two file reads, two concerns, never merged.

### Admin Portal ≠ a Domain

The portal is the app (`erb_admin_portal` DB); a domain is a document the app opens (`erb_<domain>` DB). The name 'admin' never appears with a domain suffix — `erb_admin_<domain>` is a category-error red flag.

_short: `Portal/Domain Split` · hand-doc: [docs/features/README.portal-vs-domain.md](../../docs/features/README.portal-vs-domain.md) · axiom: `ax-007` · status: shipped_

Word's install directory isn't named after any document; a .docx isn't named after Word. Two connections, two purposes, two categories.

### ssotme-proxy Transpiler Bus

A local HTTP server on `localhost:4242` exposes every injector as a first-class `ssotme://` transpiler route, so repo-local transpilers and officially-licensed ones look identical to the CLI.

_short: `ssotme-proxy` · hand-doc: [docs/features/README.ssotme-proxy.md](../../docs/features/README.ssotme-proxy.md) · status: shipped_

POST /rulebook-to-python, POST /rulebook-to-postgres, … Each route runs the corresponding injector. The proxy IS the mechanism, not a wrapper.

### Self-Hosting Platform (dog-fooding)

The orchestration tool, admin portal, and ssotme-proxy are themselves generated from the platform rulebook in `effortless-platform/effortless-rulebook/effortless-rulebook.json` — ERB is its own first customer.

_short: `Self-Hosting` · hand-doc: [docs/features/README.self-hosting.md](../../docs/features/README.self-hosting.md) · status: partial_

The wrapper eats its own dog food. Every feature, screen, API, and table you see in the portal exists because the platform rulebook says it does.

