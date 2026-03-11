# Plan: Documentation Overhaul — Reframe as Seed Ontology Demo

**Purpose:** Plan for updating all markdown/documentation in this repo to decouple from the "is-everything-really-a-language" origin and reframe as a practical seed ontology demonstration.

**This is a DOCUMENTATION PLAN, not an implementation plan.** We are planning how to update the extensive markdown in this project.

**Created:** 2026-03-09

---

## Executive Summary

This repo started as a fork of `is-everything-really-a-language` but has improved inject scripts that handle generic use cases. The documentation overhaul will:

1. Fully decouple from the original philosophical content
2. Reframe as a "seed ontology" that anyone can point at their own Airtable
3. Use a simple e-commerce domain (Customers, Orders, Products, OrderLineItems)
4. Document substrate drift through a 3-commit narrative
5. **Frame substrates as polymorphic implementations of a shared interface**

### Red Flag Words to Remove

Any reference to these indicates holdover content from the philosophical origin:
- "language" (in the meta sense), "grammar", "syntax", "semiotic"
- "LanguageCandidate", "FamilyFeud", "HasSyntax", "CanBeHeld"
- "is everything really a language", "language classification"

---

NO COMMITS!  NO CHANGES OTHER THAN DOCS/CODE!!!

## Core Framing: Polymorphism Over Invariance

The original repo talked about "two empirical invariants" — rename propagation and interpreter-free semantic completeness. This is technically accurate but abstract.

**Better framing: Polymorphism.**

### The Canonical Trio (The Interface)

```
Airtable (UI) → effortless-rulebook.json (IR) → Postgres (Reference Implementation)
```

These three define **the interface**:
- Schema: what fields exist, their types, which are raw vs. calculated
- Formulas: how calculated fields are derived
- Data: the ground facts

### Substrates as Polymorphic Implementations

Each substrate **implements the same interface** in its native syntax:

| Substrate | Implementation |
|-----------|----------------|
| Python | `calc_*()` methods on dataclasses |
| Go | `Calc*()` methods on structs |
| SQL | `calc_*()` functions + views |
| Excel | Cell formulas |
| OWL | SWRL rules |
| English | Prose specification |

**They are polymorphic because:**
- Same inputs → same outputs (conformance testing proves this)
- Same interface → different representations
- Change the interface (rename a field) → all implementations update

### Why This Matters

| Old Language | New Language | Benefit |
|--------------|--------------|---------|
| "Invariant model" | "The interface" | Familiar to developers |
| "Substrate conformance" | "Polymorphic implementation" | Explains WHY testing works |
| "Rename test" | "Interface change propagation" | Proves single source of truth |
| "Semantic equivalence" | "Same answers, different syntax" | Concrete, testable |

### The Key Claim (Concrete Version)

> All substrates are polymorphic with Airtable, the rulebook, and Postgres.
> Change any of them at the source → regenerate → all implementations follow.
> Test any implementation against the reference → verify polymorphic equivalence.

This replaces the philosophical "truth does not live in syntax" with something developers can immediately understand and verify.

### Analogy: Package Managers vs. Schema Generators

**Package managers (pip, npm, nuget):**
```
npm install lodash
     ↓
Same bytes for everyone (static package)
```
- Domain-agnostic tooling → domain-agnostic output
- Everyone who installs gets identical artifacts

**ERB substrate generators:**
```
python inject-into-python.py  (reads YOUR rulebook)
     ↓
Python code specific to YOUR schema (dynamic generation)
```
- Domain-agnostic tooling → domain-specific output
- Your rulebook parameterizes the generation

**The key difference:**
| | Package Manager | ERB Generator |
|--|-----------------|---------------|
| Input | Package name | Rulebook (schema + formulas + data) |
| Output | Static artifact (same for everyone) | Dynamic artifact (specific to your domain) |
| Reusability | The package is reusable | The generator is reusable |

**Why this matters:**
- The inject scripts are like npm/pip — reusable infrastructure
- But unlike npm, they produce domain-specific code from YOUR schema
- This is why you can "point at any Airtable" and get working substrates

Think of it as: **ERB generators are parameterized package generators where the rulebook is the parameter.**

---

## The 3-Commit Narrative

The documentation frames the repo around these 3 commits (described in present tense since they will exist by publication):

| Commit | What Happens | Key Lesson |
|--------|--------------|------------|
| **BASIC** | All substrates pass (100%). OWL takes 10s (100x longer than 0.1s). English takes 5min and gets ~85% correct. But they all succeed. | Substrates have wildly different regeneration costs. English is 3 orders of magnitude slower. |
| **ADVANCED** | Rename/modify elements within the ontology. Everything "follows along" — same results as BASIC. | Interface changes propagate automatically. This is the polymorphism payoff. |
| **NEW ONTOLOGY** | New baseId, entirely new domain. Everything keeps following along — EXCEPT English, which is now 100% wrong until we spend another 5-10min regenerating it. | The static English content is now 100% stale and should be deleted. But deleting/regenerating takes time too! This is operational drift. |

This tells a cleaner story than the philosophical argument. It demonstrates **operational drift** concretely.

### How This Ties to Polymorphism

The 3-commit progression shows **what happens when polymorphic implementations drift from the interface**:

- **BASIC**: All implementations are in sync with the interface. Polymorphic equivalence holds. But note the cost differences: 0.1s vs 10s vs 5min.
- **ADVANCED**: Interface changes (renames, modifications). Fast substrates regenerate instantly. Everything stays in sync. Polymorphism holds.
- **NEW ONTOLOGY**: Interface changes completely (new domain). Fast substrates follow along. English is now 100% wrong — it implements the OLD interface. Until regenerated, it's pure drift.

**The irony:** English is general-purpose so it *can* handle any domain. But that generality costs time and money every single time.

**Conformance testing = verifying polymorphic equivalence.**

---

## PLAN 1: What to Remove (Fully Decouple from "Is Everything a Language")

### Files to Delete

| File | Reason |
|------|--------|
| `README.ARGUMENT.md` | Entire philosophical argument |
| `docs/Jessica-Talisman-Ontology-Parts-1-2-3.md` | If it references old domain |

### Content to Remove from README.md

| Section | Content to Remove |
|---------|-------------------|
| §5 | "This repo uses 'LanguageCandidates' as an example domain (classifying whether things like 'English', 'Python', 'A Coffee Mug' count as languages)." |
| §6 | The entire "three questions" framing — keep the questions but reframe around business data, not philosophy |
| §7 | "The Core Claim" — "Not everything that can be interpreted is a language", "Serialization alone is insufficient to define language", etc. |
| §8.3 | The `calc_language_candidates_predicted_answer` example |
| §9 | "Two Empirical Invariants" — reframe without philosophical terminology |
| §10 | "The Predicates & Core Formula" — `has_syntax`, `can_be_held`, `top_family_feud_answer` — all of this |

### Search Patterns to Find and Remove

```bash
grep -r "LanguageCandidate" --include="*.md" --include="*.py"
grep -r "FamilyFeud" --include="*.md" --include="*.py"
grep -r "HasSyntax\|CanBeHeld\|HasIdentity" --include="*.md"
grep -r "language classification" --include="*.md"
grep -r "is everything.*language" --include="*.md"
grep -r "semiotic\|SignVehicle" --include="*.md"
```

---

## PLAN 2: Content to Reword (Generic E-Commerce Ontology)

### New Domain: E-Commerce Order System

| Entity | Fields (Raw) | Fields (Calculated) |
|--------|--------------|---------------------|
| **Customers** | `CustomerId`, `FirstName`, `LastName`, `Email`, `TotalPurchases` | `FullName` (concat), `IsVIP` (TotalPurchases > 1000) |
| **Products** | `ProductId`, `Name`, `UnitPrice`, `Category` | `DisplayPrice` (format as currency) |
| **Orders** | `OrderId`, `CustomerId`, `OrderDate`, `Status` | `CustomerName` (lookup), `LineItemCount`, `OrderTotal` (sum) |
| **OrderLineItems** | `LineItemId`, `OrderId`, `ProductId`, `Quantity` | `ProductName` (lookup), `LineTotal` (Quantity * UnitPrice) |

### Content Mapping (Old to New)

| Old Concept | New Concept |
|-------------|-------------|
| "Is X a language?" | "What is the order total?" |
| `has_syntax`, `can_be_held`, `requires_parsing` | `quantity`, `unit_price`, `total_purchases` |
| `top_family_feud_answer = AND(...)` | `is_vip = total_purchases > 1000` |
| "The Core Formula" (7-condition AND) | Simple business rules (IsVIP, LineTotal, OrderTotal) |
| "The Evaluation Matrix" (25 candidates) | 5-10 sample orders with computed totals |
| "Falsifiers" (intentional mismatches) | Validation errors (negative quantity, missing price) |

### English Specification Target Format

```markdown
## Customers

### Input Fields
- FirstName: The customer's first name
- LastName: The customer's last name
- TotalPurchases: Lifetime purchase total in dollars

### Calculated Fields
1. **FullName** = LastName & ", " & FirstName
   - Example: FirstName="Jane", LastName="Smith" -> "Smith, Jane"

2. **IsVIP** = TotalPurchases > 1000
   - Example: TotalPurchases=1500 -> true (VIP customer)
```

---

## PLAN 3: New README Structure

### Proposed Section Outline

```markdown
# Effortless Rulebook (ERB) — Seed Ontology Demo

**One declarative rulebook. Many execution substrates. Watch them drift.**

> This repo demonstrates what happens when you evolve an ontology and different
> substrates update at different speeds.

---

## 1. Quick Start (60 seconds)
[Same as current — run start.sh, pick option 6]

---

## 2. The Architecture (Polymorphism)

**Content needed:** The canonical trio as the interface:

    Airtable (UI) → effortless-rulebook.json (IR) → Postgres (Reference)
                              ↓
              Polymorphic Implementations
              ↓           ↓           ↓
           Python       Go        Excel       OWL       English
           calc_*()   Calc*()   formulas    SWRL      prose

*Key point: All substrates implement the same interface. Same inputs → same outputs.*

---

## 3. The Demo Scenario: Watching Substrates Drift

**Content needed:** Explain the 3-commit progression:
- BASIC: All substrates pass. OWL=10s (100x slower). English=5min, ~85% correct.
- ADVANCED: Rename/modify elements. Everything follows along automatically.
- NEW ONTOLOGY: New domain. Everything follows — except English (100% wrong until regenerated).

*Visual: Bar chart showing accuracy % and regeneration time by substrate at each commit.*

---

## 4. Execution Substrates

[Keep the table. Update descriptions to be domain-agnostic.]

| Substrate | Speed | Cost to Regenerate | Fragility |
|-----------|-------|-------------------|-----------|
| Python | 0.1s | Low | Low |
| Go | 0.05s | Medium | High (type errors) |
| OWL | 10s | Low | Low |
| English | 5min | High ($) | Medium (LLM drift) |

---

## 5. The Problem This Solves (Polymorphism Breaks Down)

**Content needed:** When business logic lives in multiple places, implementations drift:

1. **Where is the interface?** When you have SQL, Python, Go, Excel all computing the same thing, which one is authoritative? (Answer: The rulebook. Everything else is a polymorphic implementation.)

2. **How do you verify polymorphism?** How do you know all implementations produce the same outputs? (Answer: Conformance testing against a reference implementation.)

3. **Can you trace a computation?** For any derived value, can you show which inputs produced it? (Answer: ExplainDAG substrate emits the derivation graph.)

*The practical framing: You already have polymorphic implementations of your business logic (SQL + app code + validation + UI). This repo makes that polymorphism explicit, testable, and maintainable.*

---

## 6. The Seed Ontology (E-Commerce Example)

**Content needed:** Show the 4 entities:
- Customers (FullName, IsVIP)
- Products (DisplayPrice)
- Orders (OrderTotal, CustomerName)
- OrderLineItems (LineTotal)

*Include the formula examples and 5-10 sample records.*

---

## 7. How the Formula Compiler Works

**Content needed:** Show the transformation pipeline:

    Airtable formula -> AST -> Python/Go/SQL/Excel expression

Supported formula types: LOWER, SUBSTITUTE, IF, concatenation (&), arithmetic (+, -, *, /), SUM, COUNTIFS.

---

## 8. Project Structure

[Keep current structure, update entity references]

---

## 9. Using Your Own Data

**Content needed:**
1. Export Airtable to JSON
2. Run inject scripts
3. Run orchestration
4. View conformance report

---

## 10. Limitations / What This Doesn't Do

**Content needed:**
- No complex aggregations (window functions, GROUP BY)
- No recursive formulas
- No bi-temporal support (yet)
- The commercial ERB tool handles these

---

## 11. Contributing / License

[Keep as-is]
```

### Key Visuals Needed

| Visual | Description | File |
|--------|-------------|------|
| **Architecture Diagram** | Update to show generic entities | `effortless_rulebook_architecture.png` |
| **Drift Bar Chart** | Show accuracy % + regen time by substrate at BASIC, ADVANCED, NEW ONTOLOGY | NEW: `docs/drift-progression.png` |
| **Formula Pipeline** | Airtable -> AST -> Multi-substrate code generation | NEW: `docs/formula-pipeline.png` |
| **Sample Data Table** | 5-10 orders with computed LineTotal, OrderTotal, IsVIP | In README inline |

---

## Documentation Update Order

This is the sequence for updating the markdown files:

### Phase 1: Remove Philosophical Content
1. Delete `README.ARGUMENT.md`
2. Search for and remove all red flag words (see Executive Summary)
3. Remove philosophical sections from `README.md` (§5, §6, §7, §8.3, §9, §10 as identified in PLAN 1)

### Phase 2: Reword for Generic Domain
1. Replace all LanguageCandidate examples with e-commerce examples
2. Update `specification.md` for e-commerce domain
3. Update any other markdown files that reference old domain

### Phase 3: Restructure README
1. Rewrite `README.md` following PLAN 3 structure
2. Add the 3-commit narrative framing
3. Add polymorphism explanation (from Core Framing section above)

### Phase 4: Create/Update Visuals
1. Update architecture diagram for generic entities
2. Create drift progression chart
3. Create formula pipeline diagram

---

## Notes

- **This plan is for documentation updates only**
- The 3-commit narrative describes the commits in present tense (as readers will see them)
- The commercial Postgres ERB tool handles complex cases (window functions, GROUP BY, recursion)
- This repo shows what a minimal open-source version looks like
- Supported formula types: ~5 simple cases (LOWER, SUBSTITUTE, SUM, IF, concatenation)
- The key insight: this becomes a **demonstration of operational drift** rather than a philosophical argument

### Why Polymorphism Keeps It Domain-Agnostic

The polymorphism framing is inherently domain-agnostic:
- **The interface** = any rulebook schema (Workflows, Customers, LanguageCandidates, whatever)
- **Polymorphic implementations** = substrates that implement that interface
- **Conformance testing** = verifying polymorphic equivalence regardless of domain

This means:
- The README can use a concrete domain (e-commerce) as an example
- The architecture and tooling remain fully domain-agnostic
- Users can substitute their own Airtable/rulebook and everything still works

**The meta-argument ("is everything a language?") was domain-specific content masquerading as architecture. The polymorphism framing is pure architecture.**

---

## Implementation Todo List

### Phase 0: Preparation
- [ ] Run full orchestration and capture baseline metrics
- [ ] Screenshot the orchestration report for "before" state

### Phase 1: Remove Philosophical Content
- [ ] Delete `README.ARGUMENT.md`
- [ ] Run grep for red flag words and catalog all occurrences:
  ```bash
  grep -rn "LanguageCandidate\|FamilyFeud\|HasSyntax\|CanBeHeld" --include="*.md"
  grep -rn "is everything.*language\|language classification" --include="*.md"
  grep -rn "semiotic\|SignVehicle" --include="*.md"
  ```
- [ ] Remove/rewrite each occurrence found
- [ ] Remove sections from README.md:
  - [ ] §5 (LanguageCandidates example domain)
  - [ ] §7 (The Core Claim - philosophical)
  - [ ] §9 (Two Empirical Invariants - reframe as polymorphism)
  - [ ] §10 (The Predicates & Core Formula)
- [ ] Delete `docs/` articles that are purely philosophical (keep technical ones)

### Phase 2: Rewrite README.md Structure
- [ ] Write new §1: Quick Start (keep as-is, verify it works)
- [ ] Write new §2: The Architecture (Polymorphism)
  - [ ] Add canonical trio diagram (Airtable → Rulebook → Postgres)
  - [ ] Add polymorphic implementations table
- [ ] Write new §3: The Demo Scenario (3-commit narrative)
  - [ ] BASIC: all pass, cost differences
  - [ ] ADVANCED: rename propagation
  - [ ] NEW ONTOLOGY: English drift to 0%
- [ ] Write new §4: Execution Substrates (update table, remove philosophical descriptions)
- [ ] Write new §5: The Problem This Solves (polymorphism framing)
- [ ] Write new §6: The Seed Ontology (e-commerce example OR keep current Workflows domain)
- [ ] Write new §7: How the Formula Compiler Works
- [ ] Write new §8: Project Structure (update for generic entities)
- [ ] Write new §9: Using Your Own Data
- [ ] Write new §10: Limitations / What This Doesn't Do
- [ ] Keep §11: Contributing / License

### Phase 3: Update Supporting Documentation
- [ ] Update `README.TECHNICAL.md` to remove philosophical references
- [ ] Update `README.SCHEMA.md` if it has philosophical content
- [ ] Update substrate READMEs (`execution-substrates/*/README.md`) to be domain-agnostic
- [ ] Verify `specification.md` reflects current domain (already updated for Workflows)

### Phase 4: Create/Update Visuals
- [ ] Update `effortless_rulebook_architecture.png` for generic entities
- [ ] Create `docs/drift-progression.png` (bar chart: accuracy + regen time by substrate)
- [ ] Create `docs/formula-pipeline.png` (Airtable → AST → substrates)
- [ ] Add sample data table inline in README (5-10 records with computed values)

### Phase 5: Final Review
- [ ] Run full grep for red flag words again (should be zero)
- [ ] Read through all markdown files for coherence
- [ ] Verify all links work
- [ ] Run orchestration, verify expected results
- [ ] Update `PLAN_REFRAME_AS_SEED_ONTOLOGY.md` to mark as COMPLETED

---

## The 3 Commits (Reference)

The repo's git history tells the story. By the time someone reads this documentation, these commits exist:

| Commit | State | What the docs describe |
|--------|-------|------------------------|
| **BASIC** | Current state. All substrates pass. OWL=10s, English=5min at ~85%. | The baseline — polymorphism holds, but costs vary wildly. |
| **ADVANCED** | Renames/modifications to the ontology. Everything follows along. | Interface change propagation — the polymorphism payoff. |
| **NEW ONTOLOGY** | Entirely new domain. English is 100% wrong until regenerated. | Operational drift when regeneration cost is too high. |

**Note:** The ADVANCED and NEW ONTOLOGY commits are still being prepared (rulebooks in progress). The documentation describes them in present tense because by publication time they will exist.

---

## Related Files

- Current rulebook: `effortless-rulebook/effortless-rulebook.json` (Jessica Talisman Workflows)
- English substrate plan: `execution-substrates/english/PLAN_TO_MAKE_GENERIC.md`
- Substrate results: `testing/_substrate_results.json`
