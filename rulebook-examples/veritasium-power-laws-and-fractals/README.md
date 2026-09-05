# Power Laws & Fractals

### Why You’ve Probably Been Playing the Game of Life Wrong

Most of the games we think we’re playing in life are “nice” games:

* work hard → move up a bit
* publish regularly → build a solid career
* post consistently → slowly grow an audience

That’s what a **normal** (Gaussian) world feels like: lots of small nudges, very few wild swings.

But a lot of the real world is not that game.

In a **power-law** world, most of the probability mass lives in the tail. A few earthquakes, a few videos, a few research papers, a few fires, a few hubs in a network can dominate the entire outcome. The “average” is almost a lie.

Veritasium’s *Power Laws* video is one of the cleanest explanations of this idea. I watched it, got obsessed in the productive way, and wanted to see what it would look like to treat those claims like something you can actually run end-to-end:

> “Okay, but if this is really how the world works…
> how would I actually *check* those claims, end-to-end, without hand-waving?”

**Intended Audience:**
This project is aimed at people who explain science for a living:

* science YouTubers and podcasters,
* writers and newsletter authors,
* teachers and lecturers,
* technically-inclined viewers who don’t want to stop at “look, it’s a straight line.”

We start in the same world as the video—Zipf, earthquakes, forest fires, sandpiles, scale-free networks, Sierpinski, Koch—and then build a companion thing the video doesn’t try to be:
a **small, reproducible, multi-language lab** where those stories can be tested, not just plotted.

(If you’re curious why this “one rulebook → many runtimes” approach is even plausible, it leans on the **Conceptual Model Completeness Conjecture (CMCC)**—I’ll touch it briefly at the very end.)

We’ll hint at that up front, then bring the receipts in the middle of this README.

---

## Table of Contents

1. [Why This Exists (Who This Is For)](#1-why-this-exists-who-this-is-for)

2. [The Veritasium Move: Straight Lines in Log–Log Space](#2-the-veritasium-move-straight-lines-in-loglog-space)

3. [Where That Story Starts to Creak](#3-where-that-story-starts-to-creak)

4. [What This Repo Actually Is (For a Science Communicator)](#4-what-this-repo-actually-is-for-a-science-communicator)

5. [The Receipts: One Source of Truth, Explicit Formulas](#5-the-receipts-one-source-of-truth-explicit-formulas)

6. [Executing the Same Claim in Python, PostgreSQL, and Go](#6-executing-the-same-claim-in-python-postgresql-and-go)

7. [The Test Harness: Base Data, Answer Keys, and Running It](#7-the-test-harness-base-data-answer-keys-and-running-it)

8. [Measurement Models, Noise, and Where Power Laws Break](#8-measurement-models-noise-and-where-power-laws-break)

9. [Extending the Question to New Domains](#9-extending-the-question-to-new-domains)

10. [What This Is (and Is Not)](#10-what-this-is-and-is-not)

11. [CMCC (Briefly): Why “One Rulebook → Many Runtimes” Works](#11-cmcc-briefly-why-one-rulebook--many-runtimes-works)

---

## 1. Why This Exists (Who This Is For)

This repository is inspired by (and meant as a continuation of) Veritasium’s *Power Laws* video. 

The video does a hard thing well: it shows that the **same mathematical pattern** keeps appearing in wildly different places:

* word frequencies (Zipf law),
* earthquakes (Gutenberg–Richter),
* forest fires,
* sandpile avalanches,
* scale-free networks,
* geometric fractals like Sierpinski and Koch.

The beats are familiar:

1. You take messy counts over many orders of magnitude.
2. You plot them in log–log space.
3. A curve straightens into a line.
4. The slope of that line becomes your “one number to rule them all.”

If you’re a science communicator, this is gold: it compresses a lot of complexity into a single visual and a single exponent.

But if you keep thinking about it, a natural follow-up question appears:

> “If this is really how the world works,
> what would it take to treat those log–log lines like *lab results*, not just plots?”

This repo is built for that moment.

### Two Layers: Scaling Lab Now, [Physics Unification Next](/physics-model/README.md)

This repo currently ships a scaling-focused lab: a single JSON Single Source of Truth defines several classic log–log systems (fractal and power-law), and the same rulebook is executed in PostgreSQL, Python, and Go with shared test data + cross-platform validation. 

But... a possible 2nd layer is still planned: a physics-first extension adds connective tissue for “why these log–log laws relate,” providing a single, unifying bridge from the original log-log-lab to add +physics-model - to use the same underlying computational infrastructure to compare these two usually disparate models.  Once the physics is modeled using the same ontology as forest fires, comparing them becomes... relatively trivial because they all share the same platform agnostic computational and visualization environment.  This is intended to be demonstrated by the current implemetation.


---

## 2. The Veritasium Move: Straight Lines in Log–Log Space

The central move in the video is simple and powerful:

1. Take a distribution that spans orders of magnitude.
2. Transform both axes to log₁₀.
3. Watch a messy curve become “basically a straight line.”

In that picture:

* the x-axis is typically some notion of **scale** (rank, size, degree, iteration),
* the y-axis is some **measure** (frequency, count, energy, perimeter, etc.),
* and the line’s **slope** is your power-law exponent.

This move works, visually, for:

* the rank-frequency distribution of words (ZipfWords),
* the count of nodes by degree in a scale-free network (ScaleFreeNet),
* distributions of earthquake energies and forest fire sizes,
* the number of black triangles in Sierpinski and the perimeter of the Koch snowflake as iteration increases.

It’s compelling because it suggests something like:

> “These systems have different mechanisms, but they share the *same kind* of scaling structure.”

This repo leans into that shared structure.
It uses a **common log–log “machine”** to model all of those systems side by side.

But it also asks:
**When is that line actually telling the truth, and when is it just fooling our eyes?**

---

## 3. Where That Story Starts to Creak

If you’ve ever tried to fit a power law to real data, you know what lives behind the scenes:

* the line only looks straight over *some* range,
* the tail is short because the world is finite,
* small events are censored or under-reported,
* rounding and binning distort the low end,
* estimated slopes change when you slide the window. 

In other words:

> The straight line is not the phenomenon.
> It’s a **fixed point**.

The *phenomenon* is the **neighborhood around that fixed point** in log–log space:

* how tightly observations cluster,
* how they deviate,
* where they bend,
* how robust the slope is to noise, cutoffs, and discretization.

If you only ever show the line, you’re leaving the most interesting part of the story—and the part that might be wrong—off screen.

For a video, that’s a reasonable trade-off.

For someone who wants to be able to say “yes, we checked this properly,” it’s not.

This repo is structured to turn that “fixed point vs neighborhood” idea into an actual **computational object**:

* the fixed point = theoretical slope definition,
* the neighborhood = observed data (idealized and measured),
* the validation = fitted slopes, residual geometry, quality metrics.

---

## 4. What This Repo Actually Is (For a Science Communicator)

Short version:

> This repository turns the power-law stories from Veritasium’s *Power Laws* video into a **small, reproducible, multi-platform lab** where those stories can be tested, not just plotted.

Specifically, it gives you:

* **The same cast of systems as the video (plus a bit of structure around them):**

  * Sierpinski Triangle (fractal)
  * Koch Snowflake (fractal)
  * Zipf word frequencies
  * Scale-free network degrees
  * Sandpile avalanches
  * Earthquake energies
  * Forest fire sizes

* **A clear separation between:**

  * theoretical slopes (“what the math derivation predicts”),
  * idealized log–log points (“what the toy model says should happen”),
  * noisy measured data (“what a seismometer / corpus / sensor might actually record”),
  * inferred fits and residuals (“what happens when we actually run the regression”).

* **A single, canonical definition of the math**, written once in a JSON “Entity Rule Book” (ERB), and then auto-translated into:

  * Python models and calculations,
  * PostgreSQL tables, functions, and views,
  * Go structs and execution logic.

* **A test harness** that:

  * generates test datasets from that single definition,
  * runs all three platforms,
  * compares their derived results to a canonical answer key,
  * and produces a single HTML report summarizing everything.

From a communicator’s perspective, this means:

* you can still use log–log plots and straight lines as storytelling tools,
* but you know there is an actual, executable, cross-checked model backing them up,
* and if someone asks “how do you *know* those slopes are right?”, there is a concrete answer.

The rest of this README explains how that works.

---

## 5. The Receipts: One Source of Truth, Explicit Formulas

This is where the math stops being implied.

### 5.1 The Entity Rule Book (ERB) JSON

At the heart of the repo is:

```text
ssot/effortless-rulebook.json
```

This file defines the **entire** model:

* tables: `systems`, `scales`, `observed_scales`, `inference_runs`, `system_stats`, `measurement_models`, `scale_regimes` and more,
* columns (fields) for each table,
* relationships between tables,
* and, critically, the **formulas** that connect fields.

Every field is tagged as one of:

* `raw` – directly stored input (e.g. `Measure`, `Iteration`, `SystemID`),
* `relationship` – foreign key to another table (e.g. `System` on `scales`),
* `lookup` – something you pull from a parent table via an Excel-style `INDEX/MATCH` formula,
* `calculated` – a formula combining other fields (`Scale = BaseScale * ScaleFactorPower`),
* `aggregation` – a rollup over many rows (`MinLogScale`, `PointCount`, etc.).

Example (simplified) from the ERB:

```json
{
  "name": "ScaleFactorPower",
  "datatype": "number",
  "type": "calculated",
  "formula": "=POWER({{ScaleFactor}}, {{Iteration}})",
  "Description": "ScaleFactor raised to the Iteration power."
},
{
  "name": "Scale",
  "datatype": "number",
  "type": "calculated",
  "formula": "={{BaseScale}} * {{ScaleFactorPower}}",
  "Description": "X-axis variable: BaseScale multiplied by ScaleFactorPower."
},
{
  "name": "LogScale",
  "datatype": "number",
  "type": "calculated",
  "formula": "=LOG10({{Scale}})",
  "Description": "log10 of Scale."
}
```

Those formulas are the **source of truth** for every platform.

### 5.2 CMCC: raw → lookup → calculated → aggregated

This “raw / lookup / calculated / aggregated” shape is the same five-primitive decomposition CMCC points at (Schema, Data, Lookups, Aggregations, Formulas)—we’re using it here purely as a practical organizing principle.

Because each field has a type, you get a clean pipeline:

1. **Raw facts** — what’s observed or declared:

   * `SystemID`, `Iteration`, `Measure`, `IsProjected`
2. **Lookups** — what’s inherited from definitions:

   * `BaseScale` and `ScaleFactor` from `systems`
   * `TheoreticalLogLogSlope` from `systems`
3. **Calculated** — what depends on both:

   * `ScaleFactorPower = ScaleFactor^Iteration`
   * `Scale = BaseScale * ScaleFactorPower`
   * `LogScale = log10(Scale)`
   * `LogMeasure = log10(Measure)`
4. **Aggregations** — what summarizes:

   * `MinLogScale`, `MaxLogScale`, `EmpiricalLogLogSlope`, `R2`, etc.

That separation isn’t just tidy—it answers uncomfortable questions:

* “Is that number measured or derived?”
* “Is that slope theoretical or fitted?”
* “Is that range an artifact of truncation?”

The ERB forces you to encode those distinctions explicitly.

### 5.3 Concrete systems and slopes (the Veritasium cast)

The ERB encodes the canonical systems from the video with their theoretical slopes:

| System       | Class     | Theoretical slope | BaseScale | ScaleFactor |
| ------------ | --------- | ----------------- | --------- | ----------- |
| Sierpinski   | fractal   | −1.585            | 1         | 0.5         |
| Koch         | fractal   | −0.262            | 1         | 1/3         |
| ZipfWords    | power_law | −1.0              | 1         | 2           |
| ScaleFreeNet | power_law | −2.5              | 1         | 2           |
| Sandpile     | power_law | −1.0              | 1         | 2           |
| Earthquakes  | power_law | −1.0              | 1         | 2           |
| ForestFires  | power_law | −1.3              | 1         | 2           |

Those aren’t just names and numbers; they drive every calculation downstream.

---

## 6. Executing the Same Claim in Python, PostgreSQL, and Go

Once the ERB exists, the rest of the repo is “just” making that definition real in different environments.

### 6.1 Code generation: formulas → real code

From the ERB, the repo generates:

* **Python** dataclasses and helpers in `python/rulebook/` via `rulebook-to-python.py`,
* **Go** structs and helpers in `golang/pkg/rulebook/` via a Go generator,
* **PostgreSQL** functions and views via `postgres/02-create-functions*.sql` and `03-create-views*.sql`.

The generator:

* parses the ERB,
* builds a dependency graph of fields,
* converts Excel-style formulas (`POWER`, `LOG10`, `INDEX/MATCH`) into Python, Go, and SQL expressions,
* and writes out platform-native code.

So the same ERB snippet:

```text
=POWER({{ScaleFactor}}, {{Iteration}})
```

turns into:

* Python: `math.pow(self._scale_factor, self.iteration)`
* Go: `math.Pow(*s.scaleFactor, float64(s.Iteration))`
* SQL: `POWER(calc_scales_scale_factor(p_scale_id), (SELECT iteration FROM scales WHERE scale_id = p_scale_id))`

You never hand-copy formulas across languages.

### 6.2 Python engine

* Lives in `python/`
* Generated models in `python/rulebook/` (e.g. `models.py`, `data.py`)
* Test runner: `python/run-tests.py`

It:

1. Loads generated data from the ERB-derived JSON.
2. Lazily computes derived fields when accessed.
3. Writes `test-results/python-results.json` for validation.

### 6.3 PostgreSQL engine

* Schema: `postgres/01-drop-and-create-tables*.sql`
* Functions: `postgres/02-create-functions*.sql`
* Views: `postgres/03-create-views*.sql`
* Data loads: `postgres/05-insert-data*.sql`

The DB stores only **raw** fields in base tables.
Everything computed (scale, logs, slopes, residuals, etc.) appears through views like:

* `vw_scales`
* `vw_observed_scales`
* `vw_inference_runs`

That means you can run queries like:

```sql
SELECT * FROM vw_scales WHERE system = 'ZipfWords';
SELECT * FROM vw_inference_runs;
```

and see the same numbers that drive the plots, directly inside PostgreSQL.

### 6.4 Go engine

* Lives in `golang/`
* Generated core in `golang/pkg/rulebook/`
* Test runner: `golang/run-tests.go`

The Go runner:

1. Loads shared test data files (`base-data.json`, `test-input.json`, `answer-key.json`).
2. Computes derived values with carefully ordered method calls.
3. Writes `test-results/golang-results.json`.
4. Prints per-system tables and an ASCII log–log plot (● actual, ◌ projected, · theoretical).

From a “show this in a talk” perspective, that ASCII plot is a nice trick: you can demonstrate log–log geometry live in a terminal.

---

## 7. The Test Harness: Base Data, Answer Keys, and Running It

All three engines are wired into a single test protocol.

### 7.1 Test data split: base vs projected

A script, `generate-test-data.py`, reads the ERB and creates three JSON files in `test-data/`:

* `base-data.json`

  * iterations 0–3,
  * with all fields filled in,
  * used to initialize systems consistently.

* `test-input.json`

  * iterations 4–7,
  * *only* raw fields (System, Iteration, Measure, IsProjected),
  * forces each platform to recompute all derived fields from scratch.

* `answer-key.json`

  * the canonical “this is what you should get” for all systems and iterations,
  * used for cross-platform validation.

### 7.2 Orchestrator and start script

At the top level:

* `orchestrator.py` coordinates the whole test regime.
* `start.sh` is an interactive launcher with options like:

  * “Run ALL Platform Tests”,
  * “Python only”,
  * “Go only”,
  * “PostgreSQL only”,
  * “View Results Report”.

Typical command-line flows:

```bash
# Interactive menu
./start.sh

# Or scripted:
./orchestrator.py --all        # run all platforms
./orchestrator.py --all --report   # run and generate HTML report
```

Each platform’s results live in `test-results/`:

* `python-results.json`
* `postgres-results.json`
* `golang-results.json`

### 7.3 Validation

Validation is simple and strict:

* every projected scale (iterations 4–7) across the 7 systems is compared to the `answer-key.json`,
* key fields (BaseScale, ScaleFactor, ScaleFactorPower, Scale, LogScale, LogMeasure) must match within a tight numeric tolerance,
* there are 28 such projected scales (7 systems × 4 iterations).

If everything matches, the platform passes.

### 7.4 The report (the artifact you actually care about)

A visualizer in `visualizer/` generates a single HTML report:

* `visualizer/generate_report.py` produces `visualizer/report.html`,
* with:

  * per-system tables for all 8 iterations,
  * Chart.js log–log scatter plots,
  * theoretical lines overlaid,
  * fitted slopes and R²,
  * cross-platform pass/fail indicators.

That HTML file is the thing you can hand to someone and say:

> “Here is exactly how well these systems behave like power laws, under explicit assumptions, across three independent implementations.”

---

## 8. Measurement Models, Noise, and Where Power Laws Break

The ERB doesn’t only encode “perfect” power laws; it also encodes how they get messed up by reality.

### 8.1 Measurement models

The `measurement_models` table specifies, for each system:

* noise type (e.g. lognormal),
* noise strength (`NoiseSigma`),
* minimum and maximum observable scales (`CutoffMinScale`, `CutoffMaxScale`),
* how measurements are discretized (rounding, binning),
* residual and outlier metrics computed from observed data.

This is where you say things like:

* “earthquakes are measured above a certain threshold,”
* “word frequencies are rounded,”
* “forest fire sizes are log-noisy.”

### 8.2 Observed vs idealized scales

For each system there are two parallel tables:

* `scales` — idealized points (what the perfect scaling construction says),
* `observed_scales` — noisy points (what a real instrument or simulation might give you).

Observed points carry:

* the same scale calculations (Scale, LogScale),
* log-space measures (LogMeasure),
* predicted log measures from fitted slopes,
* residuals, squared residuals, standardized residuals, outlier flags.

### 8.3 Regimes and cutoffs

The `scale_regimes` table lets you define different ranges where different slopes are expected:

* e.g. “small fires” vs “large fires” regimes for forest fire sizes,
* “body” vs “tail” regimes for scale-free networks,
* or “early” vs “mature” scaling in a fractal construction.

This lines up with a key theme of the video:
that scaling behavior is often **local** in scale, not global.

Instead of talking about “does this follow a power law?” in a yes/no way, you can ask:

* *where* does it behave like one,
* *how long* does that regime last,
* and *how strong* is the evidence, given noise and finite size.

---

## 9. Extending the Question to New Domains

This repo is not meant to be frozen to “just the Veritasium examples.”

The whole point of the ERB + generator + test harness stack is that adding a new scaling claim looks like:

1. **Define the system** in the ERB:

   * give it a SystemID, DisplayName, class (`fractal` vs `power_law`),
   * declare `BaseScale`, `ScaleFactor`, `MeasureName`,
   * specify a theoretical log–log slope.

2. **Add idealized `scales`** if you have a clean construction.

3. **Add noisy `observed_scales`** if you have real or simulated data.

4. **Add an `inference_runs` row** describing the fit (OLS/log–log, number of points, etc.).

5. Regenerate test data + code, run the orchestrator, and inspect the new system in the report.

You don’t have to:

* rewrite plotting code,
* reinvent the calculation chain,
* or decide ad-hoc how to handle log transforms, slopes, and residuals.

You just define the claim and let the lab run.

---

## 10. What This Is (and Is Not)

This repo does **not** claim:

* that power laws are universal,
* that every phenomenon in the video is perfectly described by a single slope,
* or that this is the final word on how to fit heavy-tailed data.

What it *does* claim is narrower and, hopefully, more useful:

> Scaling laws can be represented as explicit, executable objects;
> their assumptions can be written down;
> their behavior can be tested across independent implementations;
> and their failures can be made visible and interesting, not hidden.

For science communicators, that means:

* you can keep telling the intuitive story of power laws and fractals,
* while having a concrete, inspectable backing for the plots you show,
* and a place to experiment when you want to go one step further than the video.

If we’ve been “playing the game of life wrong” by assuming we live in a Gaussian world,
this repo is one small attempt to show what it looks like to **take the power-law world seriously**—
not just in animations and plots, but in code, queries, and tests anyone can rerun.

---

## 11. Two Layers: Scaling Lab Now, [Physics Unification Next](/physics-model/README.md)

This repo currently ships a scaling-focused lab: a single JSON Single Source of Truth defines several classic log–log systems (fractal and power-law), and the same rulebook is executed in PostgreSQL, Python, and Go with shared test data + cross-platform validation. 

But... a possible 2nd layer is still planned: a physics-first extension adds connective tissue for “why these log–log laws relate,” providing a single, unifying bridge from the original log-log-lab to add +physics-model - to use the same underlying computational infrastructure to compare these two usually disparate models.  Once the physics is modeled using the same ontology as forest fires, comparing them becomes... relatively trivial because they all share the same platform agnostic computational and visualization environment.  This is intended to be demonstrated by the current implemetation.

---

## 12. CMCC (Briefly): Why “One Rulebook → Many Runtimes” Works

This repo isn’t *about* CMCC. But the reason the ERB approach works as cleanly as it does is basically the CMCC bet:

> A lot of domain logic can be expressed declaratively using a small set of primitives—**schema, data, lookups, aggregations, and formulas**—so the “meaning” lives in a rulebook you can translate, not in hand-copied implementations.

In this repository, that shows up as:

* **Schema + Data**: the ERB declares entities/fields, and the test JSON files carry the ground facts.
* **Lookups**: explicit inheritance / parent references (the Excel-ish `INDEX/MATCH` style fields).
* **Calculated fields**: the pure formulas (`POWER`, `LOG10`, etc.) that generate derived columns.
* **Aggregations**: rollups for fitted slopes, ranges, residual summaries, and quality metrics.

Nothing here requires you to buy any big universality claims to benefit from the structure—but CMCC is a useful lens for explaining *why* the “single source of truth” stays coherent across Python, SQL, and Go.

*(Edits applied to your provided README.md.)* 

[1]: https://zenodo.org/records/14761025?utm_source=chatgpt.com "The Conceptual Model Completeness Conjecture (CMCC) ..."

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
