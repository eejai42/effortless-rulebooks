
Two Layers: Scaling Lab Now, [Physics Unification Next](/physics-model/README.md)

This folder defines a **physics-first extension** to the existing “Power Laws & Fractals” ERB/SSOT.

The base repo already treats “straight lines in log–log space” as executable, testable objects across multiple runtimes. The goal here is to add **connective tissue** that:

1. lets multiple log–log systems relate to each other explicitly (at any scale), and
2. introduces a physics extension that can unify higher-level fields using the same CMCC/ERB machinery.

This extension is intentionally designed to be **additive**: it should not require changes to the existing SSOT tables/fields to keep the current model stable and reproducible. 

---

## What exists today

This is the current base SSOT (source of truth):

```
../effortless-rulebook/effortless-rulebook.json
```

It defines the systems, scales, observed scales, measurement models, inference runs, and regime machinery used to generate:

* PostgreSQL schema + functions/views
* Python model + evaluator
* Go structs + evaluator
* Cross-platform test harness + report

The physics extension builds on that—without breaking it. 

---

## What will be added

### 1) A patch SSOT

A new patch file will be introduced here:

```
physics-model/ssot/physics-model-patch.json
```

This patch will **add** physics-oriented entities/fields (and optional relationships) to the base SSOT.

The patch is not a fork. It is a structured “delta” that can be merged into the base ERB.

### 2) A merged “hybrid” SSOT

A build step will produce:

```
physics-model/ssot/physics-model.json
```

This file is the **hybrid** of:

* the base SSOT: `../effortless-rulebook/effortless-rulebook.json`
* plus the patch: `physics-model/ssot/physics-model-patch.json`

Conceptually:

```text
physics-model.json = merge(base ERB, physics-model-patch)
```

The merged SSOT is the *single* source of truth for the physics extension.

---

## The build pipeline

### Step A — Merge

A small merge utility (language-agnostic; could be Python first) will:

* load the base ERB JSON
* load the patch JSON
* validate patch operations (additive-only by default)
* emit the merged ERB as `physics-model/ssot/physics-model.json`

**Design goal:** “add-only” merging should be the default mode to reduce risk:

* add new tables
* add new columns (optionally nullable)
* add new formulas / aggregations / lookups
* add new systems or regimes
* add new relationships

Optional “override” operations can exist later, but should require explicit flags.

### Step B — Generate runtimes from the merged ERB (same generic tools)

Once `physics-model.json` exists, the extension should replicate the base behavior using the same generator/toolchain approach:

* PostgreSQL artifacts from the ERB (tables + functions + views)
* Python artifacts from the ERB (models + evaluator)
* Go artifacts from the ERB (structs + evaluator)

In other words: no bespoke physics engine.

The physics model is still “just” ERB:

* schema
* data
* lookups
* calculations
* aggregations

So the same generic compilation path applies.

---

## What the physics extension will *do*

### A) Unify different log–log systems at any scale

The base model already compares systems via shared log–log machinery (scale/measure/log transforms, theoretical slopes, empirical fits, residuals, regimes). 

The physics extension will add explicit bridges so that “system A and system B both look linear in log–log space” becomes something you can query structurally, not just observe.

Examples of the kinds of connective tissue to encode (as ERB entities + formulas):

* shared “scale” semantics across domains (rank vs length vs energy vs degree)
* mappings between measures when a domain provides a derivation (e.g., energy ↔ magnitude proxies, perimeter ↔ iteration rules)
* regime/crossover descriptors that can be compared across systems
* explicit “what is being measured” metadata that survives translation into SQL/Python/Go

### B) Provide a physics-first extension that can unify fields

This extension is about making “physics” an explicit, queryable layer—while staying inside the same ERB/CMCC primitives.

At a high level, the patch will introduce tables/fields that let you express:

* quantities (typed meaning of numeric fields)
* dimensional/unit metadata (so derived fields can be checked/annotated)
* optional state/dynamics descriptors where relevant (without forcing every system into the same mold)
* constraints/invariants expressed as computed/aggregated checks (so “admissible explanations” can be filtered)

This is not intended to replace the base log–log scaffold. It’s intended to **sit above it** and **connect through it**, so the “scaling lab” remains the common observable layer.

---

## Output artifacts

When implemented, this folder should generate its own artifacts parallel to the base model, derived from `physics-model/ssot/physics-model.json`:

* `physics-model/postgres/…`
* `physics-model/python/…`
* `physics-model/golang/…`

…with the same philosophy:

> one rulebook → many runtimes

---

## Current state of affairs

* The base model exists and runs end-to-end.  
* This `physics-model/` folder defines the plan to:

  * create a patch SSOT,
  * merge it into a hybrid SSOT,
  * and run the same generic generators to produce Postgres/Python/Go SDKs from the merged ERB.

Until the patch and merge step are implemented, this folder is a **design + specification** for how physics becomes an additive extension of the existing SSOT.
