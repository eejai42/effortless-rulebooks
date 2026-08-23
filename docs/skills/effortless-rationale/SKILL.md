<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-rationale/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-rationale
description: >
  Use when explaining or defending the effortless / CMCC methodology to a skeptic
  — "why use this instead of just writing code", "isn't this overkill", "convince
  me", "what's wrong with ORM / microservices / hand-written SQL", "why Airtable",
  "isn't this just MDE", "how is this different from low-code", or any conversation
  where the user (or someone they're talking to) needs the rationale grounded in
  receipts rather than enthusiasm. This skill is strictly receipts-based — every
  claim cites a paper, repo, or runnable demo. Pair with effortless-cmcc for the
  theory and effortless-rulebooks for the empirical proof.

  **Scope (load gate):** Loads when the user (or a third party) needs the methodology defended. Does not require a marked Effortless project.
audience: customer
---

# The Case For Effortless / CMCC — Receipts Only

> **Load-bearing axiom: Every claim cites a paper, a repo, or a runnable demo.**
> No marketing voice. No "imagine if." If the receipt isn't on file, the claim
> doesn't get made.

This skill is for **skeptic-facing** conversations — when the user (or someone they're talking to) is openly challenging the methodology and wants the case made with receipts.

**This skill is NOT the right register for friendly-but-exploratory evaluative questions** like *"what do you make of this approach"*, *"is this any good"*, or *"could this work for X"*. Those are answered from inside the conjecture, with the Evaluative Posture established in `effortless-orchestrator` and `effortless-cmcc`. Loading this skill for a friendly question turns a collaborative thinking-out-loud moment into a debate, which is the wrong tone.

**Decision rule:**
- User is *openly skeptical* (or asking you to brief them for a skeptical conversation) → load this skill.
- User is *exploring or evaluating the methodology with you* → use `effortless-orchestrator`'s Evaluative Posture + `effortless-cmcc`'s "How To Operate Inside The Conjecture" instead.
- User explicitly asks for the steelman / critique / "what would a critic say" → load this skill on top of CMCC.

The goal of *this* skill is not to convert — it is to make the case *honestly* and let the receipts do the work.

## Tone Rules

- **No superlatives.** "Best", "revolutionary", "game-changing" — not in this
  skill's voice. The conjecture is interesting enough on its merits.
- **No hand-waving.** If a claim depends on "it just works" or "trust me," don't
  make the claim. Find the receipt or strengthen the argument.
- **Concede where appropriate.** CMCC is a conjecture, not a theorem. Substrate
  equivalence is verified by conformance, not proven. Bitemporal storage has
  costs. Say so.
- **Prefer the strongest version of the objection.** Steelman first, then respond.

## The Common Objections (with grounded responses)

### "Isn't this just Model-Driven Engineering with extra steps?"

MDE has a thirty-year history of underdelivering, and the comparison is fair to
raise. The substantive differences:

- **One ACID substrate, not artifact fragmentation.** Traditional MDE scatters
  truth across UML files, OCL constraints, generated code, and hand-written
  glue. CMCC keeps everything in one transactional store. See [Why CMCC
  transcends MDE](https://medium.com/@eejai42/why-the-conceptual-model-completeness-conjecture-cmcc-transcends-traditional-model-driven-241ba020031a).
- **Multi-dimensional, not textual.** MDE is built around DSLs and partial
  graphical diagrams plus sidecar text. CMCC is structural — the model is a
  bitemporal DAG of relations, never forced into linear notation.
- **Empirical multi-substrate proof.** MDE rarely demonstrates that the same
  model produces field-equivalent outputs across radically different substrates.
  The [effortless-rulebooks](https://github.com/effortlessapi/effortless-rulebooks)
  conformance suite does exactly that across 11+ substrates including ARM64
  and COBOL.

Concede: MDE failures are real history. The response is "look at the receipts,"
not "this time it's different."

### "Why Airtable? That's a toy."

You don't need Airtable at all. The hub is `effortless-rulebook.json`, and the
best-practice default is **Rulebook-First**: edit the JSON directly (LLMs do this
natively) and project it to Postgres. The architecture is:

```
editing surface (rulebook-direct, or optional Airtable/Excel)
        →  effortless-rulebook.json (IR / hub)  →  Postgres (runtime)
```

Airtable is **one optional editing surface** — a sibling of Excel and Notion — for
teams whose domain experts prefer a grid they already understand. It's never the
runtime and never the source of truth; the IR detaches the editing surface from
the execution surface, so the surface is replaceable. If Airtable disappeared
tomorrow, the IR + transpilers would still work unchanged — many projects never
touch it. The rulebook is the invariant; Airtable is a convenience.

### "A single source of truth is fragile — one bug poisons everything."

The substrate constraints are designed to address this:

- **ACID** prevents partial reads of half-applied changes.
- **Bitemporal** lets you roll back transaction-time without losing valid-time
  history. You can reconstruct what the system believed at any past instant.
- **Conformance suite** catches transpiler regressions before they reach
  production substrates. Same inputs → same outputs across all substrates, or
  the build fails.

Compare this to the alternative: truth is *already* fragmented across documents,
code, configuration, and tribal knowledge in most systems. A "single source of
truth bug" is a localizable, reproducible defect. A "drift between three copies
of the truth" bug is forensic archaeology.

Receipt: [CMCC executive summary](https://medium.com/effortlessapi/executive-summary-the-conceptual-model-completeness-conjecture-cmcc-5490fadaa73e)
on transparency / auditability; the ExplainDAG section in `effortless-rulebooks`.

### "Why not just use an ORM?"

ORMs **re-fragment** the SSoT. The schema gets restated in code (often
imperfectly), business rules migrate into application methods, and JOINs get
hand-written instead of being declared as Lookups in the model. The system
ends up with two sources of truth that drift.

The CMCC alternative is to read from generated `vw_*` views that already
materialize the lookups, aggregations, and formulas. The application code
treats derived values as opaque truth — it doesn't recompute them.

Receipt: `effortless-diagnostics` documents the JOIN-in-app-code anti-pattern
and the migration path. `effortless-sql` covers the views-vs-tables discipline.

### "What about runtime behavior — events, user actions, side effects?"

CMCC is about **design-time semantics**. Runtime is a separate concern, and
the methodology acknowledges this:

- The rulebook describes what the system *is* and what derived values *mean*.
- The runtime — user actions, event flows, external integrations, UI — lives
  outside the rulebook, and consumes the rulebook's derived views.
- For auth + RLS at the runtime layer, see `effortless-magic-links` and
  `effortless-bases`. These are the runtime piece, not a contradiction of the
  design-time piece.

The honest framing: CMCC handles the part of the system that has been
historically over-engineered (the schema and rule layer). It does not pretend
to handle every part of every application.

### "Doesn't this lock me into your stack?"

The opposite, structurally. The rulebook is a portable JSON document. The
transpilers project it into 11+ substrates including assembly, COBOL, OWL,
SHACL, English, Python, Go, Postgres, and Excel. If you wanted to abandon the
ssotme:// CLI tomorrow, you would still have:

- A canonical, vendor-neutral JSON description of your domain model.
- Working code in your substrate of choice that you can fork and own.
- A conformance suite that documents what "correct" means.

Receipt: [effortless-rulebooks](https://github.com/effortlessapi/effortless-rulebooks)
substrate matrix.

### "How do I know the conjecture is true?"

You don't, in the strict sense — it's a conjecture. The honest position:

- It has been argued formally to be Turing-complete (aligned with Lambda
  Calculus, Rule 110, Wolfram's Principle of Computational Equivalence). See
  the Zenodo papers ([15252466](https://zenodo.org/records/15252466),
  [14804332](https://zenodo.org/records/14804332)).
- It has working meta-models in mathematics, chemistry, biology, and physics.
- The author has spent multiple years actively soliciting falsifiers — single
  english sentences describing computable, design-time semantics that cannot
  be decomposed into SDLAF in a bitemporal ACID DAG. As of this writing, none
  has survived attack.
- The empirical demonstration ([effortless-rulebooks](https://github.com/effortlessapi/effortless-rulebooks))
  shows multi-substrate equivalence at the implementation level.

The skeptic-honest answer: **try to falsify it.** Bring the wildest semantic
phenomenon you can think of, attempt the SDLAF decomposition, and report what
breaks. That is what the conjecture invites.

## What I Will Not Claim

- "It works for every domain." → I will say: it has working meta-models in
  several domains; bring yours and we'll attempt the decomposition.
- "It eliminates the need for developers." → I will say: it relocates developer
  effort from glue code to model design, runtime behavior, and substrate
  ergonomics.
- "It's faster than X." → Performance comparisons are not the argument and
  conflating them is dishonest. The argument is about expressiveness, audit,
  and substrate-equivalence.
- "It replaces your existing system tomorrow." → It is a way to model new work
  cleanly and migrate existing fragmented logic incrementally.

## How To Open A Skeptic Conversation

Three openers, in increasing confrontation order:

1. **Curious:** "Have you seen the multi-substrate conformance demo? One
   rulebook, eleven substrates including ARM64 and COBOL, all matching a
   single answer key. That's the empirical claim — happy to walk through it."
2. **Direct:** "The conjecture is that any finitely-computable design-time
   semantic decomposes into five primitives in a bitemporal ACID DAG. The
   author has been soliciting falsifiers for years. Want to try one?"
3. **Engaged:** "Most of what we call 'business logic code' is residue from not
   having had a CMCC-shaped substrate. Pick a piece of code in your codebase
   and let's see if it's actually a Lookup, an Aggregation, or a Formula in
   disguise."

Match the opener to the audience's posture.

## Receipts (the citation list)

- **Theory:** `effortless-cmcc` skill + the Medium / Zenodo links it carries.
- **Empirical:** `effortless-rulebooks` skill + [github.com/effortlessapi/effortless-rulebooks](https://github.com/effortlessapi/effortless-rulebooks).
- **Operational:** `effortless-pipeline`, `effortless-cli`, `effortless-conventions`
  — the day-to-day mechanics that show the methodology is actually used, not
  just papered.
- **Ecosystem catalog:** `effortless-ecosystem` for the full repo list.

## See also

- `effortless-cmcc` — the theory this skill is the rhetorical face of.
- `effortless-rulebooks` — the empirical demonstration.
- `effortless-ecosystem` — the canonical repo list.
- `effortless-orchestrator` — the umbrella where my posture lives.
