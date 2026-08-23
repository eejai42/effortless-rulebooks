<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `OntologyAxioms`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Ontology Axioms

Positive-form invariants the project is built on. These are the load-bearing claims; if any one is dropped, the methodology no longer holds. FramingInvariants are mistakes that violate these axioms.

## Rulebook is the IR

**Statement.** The rulebook JSON is the portable intermediate representation. Every other artifact is mechanically derivable from it.

**Why.** If any artifact is hand-edited authoritatively, conformance no longer follows from a single source. The 'all substrates compute identically' claim depends on one IR.

**Implication.** Generated files are disposable; the rulebook JSON is the only file that is sacred.

_Status: active_

## No privileged substrate

**Statement.** Postgres, Airtable, Excel, Python, Go, OWL, COBOL — every substrate is a peer projection of the rulebook. None is the reference.

**Why.** Privileging one substrate quietly redefines 'correct' as 'matches that substrate' instead of 'matches the rulebook', which is the actual SSoT.

**Implication.** Substrate properties (maturity, transpiler source, expressive completeness) are facts about implementations, not authority rankings.

_Status: active_

## SSoT is locally designated

**Statement.** The 'answer key' for a conformance run is whichever substrate the user designates as SSoT for that run — Airtable export, Excel workbook, hand-edited JSON, or a Postgres dump.

**Why.** If the answer key is fixed, the methodology only works in one deployment mode. Locality lets the same harness validate Airtable-driven, Excel-driven, or JSON-driven projects.

**Implication.** Conformance reports must name the chosen SSoT for the run; trustworthy substrates witness, they do not crown.

_Status: active_

## Hub-and-spoke topology

**Statement.** The rulebook is the hub. Input spokes (Airtable, LLM, admin portal, hand edits) write to it. Output spokes (substrates) read from it. Spokes never talk to each other.

**Why.** Direct spoke-to-spoke traffic re-introduces the n×n integration problem the rulebook was created to eliminate.

**Implication.** If you find yourself wiring a substrate to consume another substrate's output, you are violating the topology — route through the rulebook.

_Status: active_

## Fail loudly, never fall back

**Statement.** When a file or value is not where it is expected, the code fails with the exact expected path. It does not check a second location, default to a guess, or return an empty object with a warning.

**Why.** Silent fallbacks mask the bug they are working around and cause 100% conformance against the wrong data.

**Implication.** Defaults derived from the SSoT are fine. Defaults that substitute a guess are not.

_Status: active_

## Project rulebook ≠ demo rulebook

**Statement.** The platform rulebook (this file) is the parent describing ERB itself. Demo rulebooks under rulebook-examples/ are children describing one business domain each. They never mix.

**Why.** Mixing platform-meta with business-data couples the wrapper to a domain, which destroys the wrapper's portability.

**Implication.** Portal config tables (AppUsers, AppNavigation, etc.) live ONLY in this file. Business tables (Customers, Episodes, etc.) live ONLY in their demo rulebook.

_Status: active_

## Admin portal ≠ a domain

**Statement.** The admin portal is the app; a domain is a document the app opens. Their databases are separate (erb_admin_portal vs erb_<domain>) and the names never merge.

**Why.** Names like erb_admin_<domain> conflate the editor with the thing being edited, which leads to drift between portal state and document state.

**Implication.** Two Postgres connections at all times: one to the portal's own DB, one to the active document's DB.

_Status: active_

## Build = generate + test + report

**Statement.** Every build runs all transpilers, then runs every substrate's conformance test, then regenerates and opens the report.

**Why.** A build that skips the test step produces output of unknown correctness; the methodology's value is the conformance proof, not the codegen.

**Implication.** There is no 'build without testing' menu option. If a substrate has no take-test.sh, that is a bug to fix, not a case to handle.

_Status: active_

## Portal/CLI parity

**Statement.** The admin portal and ./start.sh --cli are peer interfaces to the same effortless.json pipeline. Every portal mutation shells out to the same `effortless` CLI command.

**Why.** Two divergent implementations of 'install a tool' or 'run a build' will drift; conformance claims become qualified ('works in CLI, fails in portal').

**Implication.** If the portal grows logic the CLI does not have, that logic moves into the CLI and the portal calls it.

_Status: active_

## Write-through invariant

**Statement.** The portal's editor Postgres DB is live; the rulebook JSON is durable. Every save writes to BOTH in the same logical transaction.

**Why.** If Postgres ever wins alone, JSON drifts and the SSoT property is violated. If JSON ever wins alone, the live editor lies about state.

**Implication.** Drop Postgres at any time and rebuild from JSON; never the other direction.

_Status: active_

## Rulebook is a complete spec

**Statement.** A rulebook alone — no accompanying source code, no documentation — is sufficient for any frontier LLM to answer any question about the domain or produce a faithful implementation of the rules in any language, platform, or context.

**Why.** This is the load-bearing portability claim. If the rulebook is not self-sufficient, the methodology degrades into documentation-plus-code where the docs lie and the code is the real spec.

**Implication.** Anything required to understand or reproduce the domain MUST live in the rulebook. If a generated artifact contains business logic not derivable from the rulebook, that logic belongs IN the rulebook, not in the substrate.

_Status: active_

## Build is convergent, not additive

**Statement.** `effortless build` makes downstream artifacts conform to the current rulebook: additions appear, removals disappear, renames propagate. Generated artifacts are a projection of the rulebook's current state, never an accumulation of past states.

**Why.** This is the property that distinguishes ERB from a conventional code generator. Codegen accumulates (you run it, code appears, removing things from the spec doesn't remove the corresponding code). ERB conforms — the projection is total, so the rulebook stays the single source of truth in both directions.

**Implication.** Hand-edits to generated artifacts are erased on the next build by design. The rulebook is the only place to add, modify, OR remove behavior.

_Status: active_

## Formula dialect is a rulebook property

**Statement.** A rulebook declares which formula dialect it uses (Excel, Airtable, …). Substrates implement the dialect's semantics; the conformance proof is 'all substrates compute identically under this rulebook's declared dialect.' The dialect is metadata on the rulebook, not a property of ERB.

**Why.** Hardcoding one dialect as 'the ERB formula language' would couple the methodology to that dialect's quirks and exclude domains that already think in another (e.g. Airtable-native teams). The conformance machinery doesn't care which dialect is in use; it only cares that every substrate's transpiler implements the same one.

**Implication.** Excel is the current default because domain experts can read it, but it is not invariant. A rulebook may declare a different dialect, and substrate transpilers must honor the declared dialect.

_Status: active_

