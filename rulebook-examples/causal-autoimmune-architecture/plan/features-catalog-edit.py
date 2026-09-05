#!/usr/bin/env python3
"""Bring the Features table up to date and enrich it with challenge provenance.

One coherent rule-change to effortless-rulebook.json. The Features table was ~30
commits stale (10 rows, only Title/Description). This:

  (1) Adds metadata fields to the schema:
        - Category        (raw)  : which layer of the platform this belongs to
        - Priority        (raw)  : Load-bearing | Supporting | Roadmap
        - ChallengeRefs   (raw)  : JSON array string of provenance objects, each
                                   {file,line,col,len,quote,section,relation} — the
                                   EXACT text + filename + line + char position the
                                   feature addresses, for UI hover tips.
        - ChallengeNotes  (raw)  : free-form Markdown comment: which challenge
                                   elements it relates to (direct/indirect) and how.
        - ChallengeRefsRendered (raw) : pre-flattened Markdown bullet list of the
                                   refs, so the dumb hbars template can just print it.
        - RefCount        (calc) : COUNTA-free count carried as raw int for display.
        - CatalogBlock    (calc) : one assembled Markdown block per feature for the
                                   PLATFORM_FEATURES.md template (header + meta line).

  (2) Refreshes the existing 10 rows with that metadata.

  (3) ADDS rows for capabilities that now exist but were never catalogued:
        keystone four-gate verdict, witnessed red/green harness, disease-state
        machine, derived SLEDAI activity, treatment-line recommendation,
        emergent serology-signature cluster, evidence/disease disagreement,
        cohort discovery board, in-app explainer DAG, URL-driven routing,
        reverse-sync DB->rulebook, honest coverage map.

Provenance offsets were resolved against THE-ORIGINAL-CHALLENGE.md and verified.
Idempotent (re-running replaces the Features table cleanly). ensure_ascii=False to
preserve literal em-dashes / en-dashes (file convention).
"""
import json, collections

RB_PATH = 'effortless-rulebook/effortless-rulebook.json'
CHALLENGE_FILE = 'THE-ORIGINAL-CHALLENGE.md'

rb = json.load(open(RB_PATH), object_pairs_hook=collections.OrderedDict)
OD = collections.OrderedDict


# The json-hbars-transform engine HTML-entity-escapes any non-ASCII char it
# interpolates (· -> &#183;, curly quotes -> &#8220;, em-dash -> &#8212;, etc.),
# which renders as literal entity codes in the Markdown. Keep every string we emit
# ASCII so the derived PLATFORM_FEATURES.md stays clean. (The structured ChallengeRefs
# JSON keeps its original quote text — the quotes there must match the source file
# byte-for-byte for the UI hover-highlight, so JSON is NOT ascii-ized.)
_ASCII_MAP = {
    '—': '-', '–': '-', '‒': '-',   # em / en / figure dash -> hyphen
    '‘': "'", '’': "'",                   # curly single quotes -> '
    '“': '"', '”': '"',                   # curly double quotes -> "
    '…': '...',                                # ellipsis
    '→': '->', '←': '<-', '↔': '<->',  # arrows
    '·': '-', ' ': ' ', ' ': ' ',    # middot, thin space, nbsp
    '≥': '>=', '≤': '<=',                 # >= / <=
    '×': 'x',                                  # multiplication sign
}


def ascii_clean(s):
    if s is None:
        return s
    for k, v in _ASCII_MAP.items():
        s = s.replace(k, v)
    # final safety net: drop any remaining non-ASCII so nothing entity-escapes
    return s.encode('ascii', 'ignore').decode('ascii')


def field(name, datatype, ftype, desc, formula=None, nullable=True):
    d = OD()
    d['name'] = name
    d['datatype'] = datatype
    d['type'] = ftype
    d['nullable'] = nullable
    d['Description'] = desc
    if formula is not None:
        d['formula'] = formula
    return d


def ref(line, col, length, quote, section, relation='direct'):
    """One provenance pointer into THE-ORIGINAL-CHALLENGE.md.

    line   : 1-based line number in the file
    col    : 0-based character offset of the quote within that line
    length : character length of the quote
    quote  : the exact text the feature addresses
    section: prompt | payoff | audit | response  (which part of the doc)
    relation: direct | indirect (does the feature implement the clause, or only
              illustrate / scaffold-for it)
    """
    return OD([
        ('file', CHALLENGE_FILE),
        ('line', line),
        ('col', col),
        ('len', length),
        ('quote', quote),
        ('section', section),
        ('relation', relation),
    ])


def render_refs(refs):
    """Pre-flatten refs into a Markdown bullet list for the dumb hbars template."""
    if not refs:
        return "_No direct challenge clause - internal scaffolding._"
    out = []
    for r in refs:
        tag = "directly addresses" if r['relation'] == 'direct' else "indirectly supports"
        # Quote is ascii-cleaned for the rendered Markdown only; the structured JSON
        # (ChallengeRefs) keeps the byte-exact original quote for UI hover-highlighting.
        # Wrap the quoted phrase in backticks: avoids the engine HTML-escaping `"` to
        # &quot;, and reads cleanly in raw Markdown and rendered views alike.
        q = ascii_clean(r['quote'])
        out.append(
            f"- **{tag}** ({r['section']}, `{r['file']}` L{r['line']}:{r['col']}+{r['len']}): "
            f"_{q}_"
        )
    return "\n".join(out)


# ---------------------------------------------------------------------------
# The catalog. Each entry: id, title, category, priority, description, notes,
# and the list of challenge refs (with exact line/col/len). Order = display order.
# ---------------------------------------------------------------------------
FEATURES = [
    # ---- KEYSTONE / TRUST BOUNDARY ----------------------------------------
    dict(
        id="feat-keystone-actionability-gate",
        title="Four-gate clinical-actionability keystone",
        category="Keystone / inference DAG",
        priority="Load-bearing",
        description=(
            "The entire system reduces to one computed boolean, "
            "`IndividualPredictions.IsClinicallyActionable`, TRUE only when all four derived gates hold "
            "(causally grounded, well-calibrated, non-spurious, ancestry-generalizable). Computed from a "
            "pure formula DAG, never entered. Seven synthetic patients land on both sides; each failure "
            "names the single deciding gate."
        ),
        notes=(
            "This is the north-star reduction. It directly operationalizes the payoff paragraph's "
            "“individualized… ancestry-equitable… actionable prediction” and the prompt's "
            "demand for *calibrated uncertainty and no reliance on spurious correlations*. The four gates "
            "are the four hardest constraints in the prompt, each made a falsifiable boolean rather than a promise."
        ),
        refs=[
            ref(6, 223, 87, "individualized prevention, presymptomatic diagnosis, ancestry-equitable risk prediction", "payoff", "direct"),
            ref(4, 1608, 68, "with calibrated uncertainty and no reliance on spurious correlations", "prompt", "direct"),
            ref(4, 351, 79, "identify the complete causal architecture of a heterogeneous autoimmune disease", "prompt", "indirect"),
        ],
    ),
    dict(
        id="feat-trust-boundary-line-in-dag",
        title="Trust boundary as a line in the DAG",
        category="Keystone / inference DAG",
        priority="Load-bearing",
        description=(
            "Any field with a formula belongs to the model; any raw-input field is the human's (or the LLM's, "
            "as an overridable front-end). Every Z-stat, gate, and the keystone is a pure inspectable formula; "
            "nothing above the leaves is enterable. The trust boundary is literally an edge in the dependency graph."
        ),
        notes=(
            "This is the conceptual spine that makes the whole platform auditable rather than 'an LLM that "
            "diagnoses'. It is what lets the system claim *no reliance on spurious correlations* structurally "
            "(the V2 response: known reasoning *decomposes into inspectable structure*)."
        ),
        refs=[
            ref(4, 1608, 68, "with calibrated uncertainty and no reliance on spurious correlations", "prompt", "direct"),
            ref(66, 191, 37, "decomposes into inspectable structure", "response", "indirect"),
        ],
    ),

    # ---- LEAF / LLM SURFACE ------------------------------------------------
    dict(
        id="feat-llm-intake-clerk",
        title="LLM intake clerk",
        category="Leaf / LLM surface",
        priority="Load-bearing",
        description=(
            "LLM reads a natural-language case and writes raw intake observation rows (ancestry, allele freqs, "
            "presenting facts) to base tables. It interprets the case like an intake nurse and never computes a "
            "single inference above the leaf layer."
        ),
        notes=(
            "Addresses the front of the challenge's data pipeline: turning heterogeneous clinical input into "
            "structured observations. The LLM is the *transcriber*, never the diagnostician — the half of the "
            "trust boundary that stays human-overridable."
        ),
        refs=[
            ref(4, 751, 65, "resolving cell-state-specific effects, allele-specific expression", "prompt", "indirect"),
            ref(4, 1446, 83, "accurately predict disease onset, severity, treatment response, and adverse effects", "prompt", "indirect"),
        ],
    ),
    dict(
        id="feat-synthetic-lab",
        title="Synthetic-but-transparent lab generator",
        category="Leaf / LLM surface",
        priority="Load-bearing",
        description=(
            "LLM emits the case's test results (effect sizes/SEs, replication signs/p-values, permutation effect "
            "sizes, calibration coverage) as visible, sourced, editable leaf rows. The numbers are fake (the case "
            "is invented) but every value is transparent, sourced to the case, and editable."
        ),
        notes=(
            "Stands in for the prompt's enormous multi-omic measurement surface. The point isn't real biology "
            "(out of scope); it's that the *shape* real measurements would slot into exists, with each number a "
            "visible, correctable knob — defeating 'a hallucination laundered through a deterministic function'."
        ),
        refs=[
            ref(4, 818, 54, "3D enhancer–promoter interactions, rare-variant burden", "prompt", "indirect"),
            ref(4, 1396, 45, "produce experimentally falsifiable mechanisms", "prompt", "indirect"),
        ],
    ),

    # ---- WITNESS / HARNESS -------------------------------------------------
    dict(
        id="feat-three-panel-witness",
        title="Three-panel witness view",
        category="Witness / harness",
        priority="Load-bearing",
        description=(
            "Input case text | extracted facts with per-fact provenance back into the text | deterministic "
            "diagnosis + four-gate trace. The middle panel is human-checkable independently of the verdict."
        ),
        notes=(
            "This is the anti-laundering instrument: it lets a reviewer verify the extracted leaves against the "
            "source text *before* trusting any derived conclusion. Indirectly serves the prompt's demand for "
            "*no reliance on spurious correlations* by making the raw→derived path inspectable end to end."
        ),
        refs=[
            ref(4, 1608, 68, "with calibrated uncertainty and no reliance on spurious correlations", "prompt", "indirect"),
        ],
    ),
    dict(
        id="feat-witnessed-harness-home",
        title="Witnessed red→green inference harness (home screen)",
        category="Witness / harness",
        priority="Load-bearing",
        description=(
            "The app's home page IS a red/green test tree, not a form. Every category of inference (the DAG "
            "levels / the four gates) and the specific tests under each are asserted against the app's own API "
            "for all patients. As the model is built out, tests turn green; a fully green run is the proof."
        ),
        notes=(
            "The harness is how the platform makes its claims *checkable rather than asserted*. It is the "
            "operational form of the V2 response's argument: not 'how much is modeled' but 'does adding the next "
            "thing keep the audit guarantee' — and it stays green and inspectable when it does."
        ),
        refs=[
            ref(4, 1396, 45, "produce experimentally falsifiable mechanisms", "prompt", "indirect"),
            ref(66, 191, 37, "decomposes into inspectable structure", "response", "indirect"),
        ],
    ),
    dict(
        id="feat-knob-edit-ui",
        title="Knob-editing admin UI",
        category="Witness / harness",
        priority="Load-bearing",
        description=(
            "Every LLM-produced leaf value is an editable field; correcting it re-derives the DAG. Every formula "
            "is inspectable/correctable in place, like a spreadsheet cell, so a wrong input is nudged, not re-prompted."
        ),
        notes=(
            "Makes the trust boundary *actionable* for a human reviewer: the model's judgment is externalized "
            "into editable bottom-row cells, and all reasoning lives in the open DAG above them."
        ),
        refs=[
            ref(4, 1608, 68, "with calibrated uncertainty and no reliance on spurious correlations", "prompt", "indirect"),
        ],
    ),
    dict(
        id="feat-gate-explainability",
        title="Gate explainability",
        category="Witness / harness",
        priority="Load-bearing",
        description=(
            "For a patient, show why each gate passed/failed by walking one level down (coverage, "
            "cross-ancestry replication count, permutation survival, cryptic-relatedness flag, etc.)."
        ),
        notes=(
            "Turns the keystone from a verdict into an explanation. Directly serves the prompt's "
            "*calibrated uncertainty* and ancestry-generalizability requirements by exposing the exact "
            "sub-evidence each gate rests on."
        ),
        refs=[
            ref(4, 1545, 62, "from ancestries and environments absent from the training data", "prompt", "direct"),
            ref(4, 1608, 68, "with calibrated uncertainty and no reliance on spurious correlations", "prompt", "indirect"),
        ],
    ),

    # ---- DISEASE-STATE SIMULATION (the v1-audit answer) --------------------
    dict(
        id="feat-disease-state-machine",
        title="Disease-state machine derived from raw labs",
        category="Disease-state simulation",
        priority="Load-bearing",
        description=(
            "Disease progresses as a state machine: Presymptomatic → SerologicActive → EarlyNephritis → "
            "RenalFlareRisk → BiopsyIndicated. The current state is computed from rising anti-dsDNA + falling "
            "complement + proteinuria — never entered — and dwell time per state is tracked."
        ),
        notes=(
            "Directly answers the doctor's central v1 critique: the difference between an evidence gate and a "
            "disease-state simulator. This is the 'is the disease progressing' layer, built additively onto the "
            "same trust boundary (labs are the clinician's input; state is the model's derivation)."
        ),
        refs=[
            ref(34, 569, 69, "the difference between an evidence gate and a disease-state simulator", "audit", "direct"),
            ref(51, 0, 63, "Disease now progresses as a state machine derived from raw labs", "response", "direct"),
            ref(4, 1019, 56, "feedback between disease progression and molecular state", "prompt", "indirect"),
        ],
    ),
    dict(
        id="feat-sledai-activity-score",
        title="Derived SLEDAI disease-activity score",
        category="Disease-state simulation",
        priority="Load-bearing",
        description=(
            "A SLEDAI activity score (and activity tier) computed per patient from the serology series "
            "(renal points, serology points, proteinuria), not a label anyone typed. Drives the worked "
            "nephritis example: rising anti-dsDNA, falling complement, renal-flare risk, biopsy-indicated."
        ),
        notes=(
            "Concretely supplies the 'real disease activity scores' the doctor named as missing in v1, and "
            "produces the first computed worked example: a patient *transitioning toward early lupus nephritis*."
        ),
        refs=[
            ref(34, 275, 62, "This patient is transitioning from presymptomatic autoimmunity", "audit", "direct"),
            ref(32, 518, 67, "the clinical workflow from referral, differential diagnosis, workup", "audit", "indirect"),
        ],
    ),

    # ---- TREATMENT REASONING -----------------------------------------------
    dict(
        id="feat-treatment-line-recommendation",
        title="Derived treatment-line recommendation with one stated reason",
        category="Treatment reasoning",
        priority="Load-bearing",
        description=(
            "A recommended treatment line with a single stated reason, differentiated by the confirmed "
            "mechanism and the disease state: mycophenolate induction for active nephritis, anifrolumab for an "
            "IFN-pathway mechanism, belimumab for autoantibody-driven, secukinumab for IL-17/23."
        ),
        notes=(
            "The doctor's *second* worked example, computed. Implements 'therapies that target each person's "
            "causal molecular pathway' as a derived field grounded in a confirmed CausalMechanism node — a "
            "mechanism match, not a broad immunosuppression label."
        ),
        refs=[
            ref(6, 348, 60, "therapies that target each person’s causal molecular pathway", "payoff", "direct"),
            ref(34, 473, 85, "would likely respond differently to mycophenolate versus belimumab versus anifrolumab", "audit", "direct"),
            ref(55, 37, 67, "A derived treatment-line recommendation with a single stated reason", "response", "direct"),
        ],
    ),
    dict(
        id="feat-treatment-response-mechanism-match",
        title="Treatment-response prediction via mechanism match",
        category="Treatment reasoning",
        priority="Supporting",
        description=(
            "A treatment-response prediction is trustworthy only when the treatment targets a confirmed causal "
            "mechanism (IsMechanismMatched) AND the treatment is effective. A drug aimed at a debunked mechanism, "
            "or one that didn't work / was adverse, is never 'predicted to respond'."
        ),
        notes=(
            "One of the three prediction types the prompt asks for (onset / severity / treatment-response). "
            "Grounds treatment response in the same causal-mechanism DAG so it can never be a free-floating label."
        ),
        refs=[
            ref(4, 1446, 83, "accurately predict disease onset, severity, treatment response, and adverse effects", "prompt", "direct"),
            ref(6, 633, 29, "reduce failed clinical trials", "payoff", "indirect"),
        ],
    ),

    # ---- CORPUS-LEVEL DISCOVERY --------------------------------------------
    dict(
        id="feat-emergent-serology-cluster",
        title="Emergent serology-signature cluster (corpus-level discovery)",
        category="Corpus-level discovery",
        priority="Load-bearing",
        description=(
            "A per-patient IsInPreNephriticSignatureCluster rolled up from each person's raw serology series "
            "(rising anti-dsDNA + falling complement), no label assigned. On the synthetic cohort it lands "
            "cleanly — 6 of 12 in the cluster — and perfectly separates active/progressing from quiescent patients."
        ),
        notes=(
            "Answers the doctor's deepest point: discovery is inherently corpus-level — a single chart never "
            "discovers a mechanism, a pattern across many patients does. This is the *shape* of discovery on "
            "synthetic data: membership emerges from the population's raw data and tracks the disease."
        ),
        refs=[
            ref(62, 63, 36, "discovery is inherently corpus-level", "response", "direct"),
            ref(62, 340, 66, "surfaces as a derived emergent cluster across the whole population", "response", "direct"),
            ref(4, 351, 79, "identify the complete causal architecture of a heterogeneous autoimmune disease", "prompt", "indirect"),
        ],
    ),
    dict(
        id="feat-evidence-disease-disagreement",
        title="Evidence-gate ↔ disease-state disagreement detector",
        category="Corpus-level discovery",
        priority="Load-bearing",
        description=(
            "Flags the patient where the disease-state simulator and the actionability gate disagree: the disease "
            "is clearly progressing (biopsy-indicated, high activity) yet the prediction is correctly judged "
            "not clinically actionable (a relatedness-leakage problem)."
        ),
        notes=(
            "The single clearest proof that disease-state simulation is a *second, independent* layer and not the "
            "old evidence gate relabeled. A system that only gated evidence could never say 'needs attention now, "
            "but our mechanism prediction isn't trustworthy enough to pick a targeted therapy.'"
        ),
        refs=[
            ref(57, 95, 63, "the disease-state simulator and the actionability gate disagree", "response", "direct"),
            ref(34, 569, 69, "the difference between an evidence gate and a disease-state simulator", "audit", "direct"),
        ],
    ),
    dict(
        id="feat-cohort-discovery-board",
        title="Cohort discovery board (corpus surface)",
        category="Corpus-level discovery",
        priority="Supporting",
        description=(
            "Top nav item for every role: the disease-state map, the emergent serology-signature scatter (with "
            "the derived cluster drawn as a halo, not a painted colour), the disagreement board, and the "
            "treatment-line distribution — all reading derived fields."
        ),
        notes=(
            "The corpus-level surface where discovery is *expressed*. Moves the platform from per-patient "
            "adjudication (v1) to a population view, which is where the prompt's 'causal architecture' lives."
        ),
        refs=[
            ref(6, 312, 30, "precise patient stratification", "payoff", "direct"),
            ref(62, 63, 36, "discovery is inherently corpus-level", "response", "indirect"),
        ],
    ),

    # ---- REPORTING ---------------------------------------------------------
    dict(
        id="feat-diagnosis-writeup",
        title="Per-patient diagnosis writeup",
        category="Reporting",
        priority="Load-bearing",
        description=(
            "Doctor-style Markdown writeup (→ diagnosis.pdf once green) produced as an artifact of a passing "
            "run: 'The patient presented with… tests xyz confirmed abc… therefore C (actionable / not, and the "
            "single deciding reason).' It needs no UI to be valuable."
        ),
        notes=(
            "The real output of the platform is a diagnosis, not a screen. This is the human-facing payoff that "
            "the prompt's 'presymptomatic diagnosis' and 'individualized' language ultimately asks for."
        ),
        refs=[
            ref(6, 223, 87, "individualized prevention, presymptomatic diagnosis, ancestry-equitable risk prediction", "payoff", "direct"),
        ],
    ),
    dict(
        id="feat-derived-report-fragments",
        title="Derived narrative fragment fields",
        category="Reporting",
        priority="Supporting",
        description=(
            "Per-row calculated text fields that turn each fact into structured natural language, predicate-gated "
            "and case-by-case (e.g. TemperatureNarrative → 'normal temperature' | 'light fever' | 'severe fever' "
            "from the row's own value). Each fragment is one spreadsheet-cell formula reading sibling fields and "
            "__meta__ phrases only — no joins or aggregations — composed upward into complex sentences."
        ),
        notes=(
            "Keeps all narrative wording inside the auditable DAG: the writeup is assembled from inspectable "
            "calculated cells, never free-text generated at render time. Reporting stays on the trust boundary."
        ),
        refs=[
            ref(66, 191, 37, "decomposes into inspectable structure", "response", "indirect"),
        ],
    ),
    dict(
        id="feat-report-meta-phrasebook",
        title="Global phrasebook in __meta__",
        category="Reporting",
        priority="Supporting",
        description=(
            "Reusable, contextual language atoms stored once in the __meta__ settings table — literal global "
            "phrases ('The patient presented with…') and shared banding vocabulary — referenced by fragment "
            "fields so common language is authored/corrected in one place, never re-implemented per case."
        ),
        notes=(
            "DRY for narrative: the one place global phrasing is corrected. Supports the writeup feature without "
            "duplicating wording across patients."
        ),
        refs=[],
    ),
    dict(
        id="feat-report-renderer",
        title="Thin Python report renderer (replaces handlebars)",
        category="Reporting",
        priority="Supporting",
        description=(
            "A small Python renderer whose only job is to read each patient's derived fragment fields from vw_* "
            "views and concatenate the non-empty, predicate-gated fragments in order into the diagnosis report "
            "(Markdown → diagnosis.pdf). All sentence wording lives in the rulebook as calculated fields; the "
            "renderer owns no business or narrative logic."
        ),
        notes=(
            "Enforces the rule that the renderer is dumb and the rulebook is the single source of narrative truth "
            "— the same discipline this PLATFORM_FEATURES.md generation itself follows."
        ),
        refs=[],
    ),
    dict(
        id="feat-report-total-coverage-check",
        title="Report total-coverage harness",
        category="Reporting",
        priority="Supporting",
        description=(
            "Tests that every patient word and every linked DAG node down to ground truth is represented in that "
            "patient's report (see tfs-report-covers-every-word, tfs-report-covers-every-dag-node)."
        ),
        notes=(
            "Closes the loop on the writeup: nothing in a patient's record is silently dropped from their "
            "report, and nothing in the report is unsourced. Total coverage is itself a witnessed test."
        ),
        refs=[],
    ),

    # ---- PLATFORM / NAVIGATION / HONESTY -----------------------------------
    dict(
        id="feat-explainer-dag",
        title="In-app Explainer DAG (clickable field provenance)",
        category="Platform infrastructure",
        priority="Supporting",
        description=(
            "A generated, embedded visualization of the rulebook's calculated-field DAG: click any cell/field and "
            "see exactly how it was derived (raw inputs → lookups → calcs → aggregations), with RuleSpeak prose "
            "baked in at transpile time."
        ),
        notes=(
            "Makes 'the trust boundary is a line in the graph' literally clickable. Any reviewer can trace a "
            "verdict back to the raw leaves it rests on — the in-app form of the audit guarantee."
        ),
        refs=[
            ref(66, 191, 37, "decomposes into inspectable structure", "response", "indirect"),
        ],
    ),
    dict(
        id="feat-url-driven-routing",
        title="URL-driven routing & role navigation",
        category="Platform infrastructure",
        priority="Supporting",
        description=(
            "The URL is the single source of truth for view state: every thing/list has a stable URL, F5 restores "
            "the exact view+tab, and links reach any piece. Role trees (admin / intake clinician / …) gate what "
            "each role can create/read/update/delete, derived from the RoutingAndNavigation rows."
        ),
        notes=(
            "Workflow scaffolding the doctor named as missing: referral → workup → monitoring needs addressable, "
            "role-scoped navigation. Permissions are derived from the rulebook, not hand-wired per screen."
        ),
        refs=[
            ref(32, 518, 67, "the clinical workflow from referral, differential diagnosis, workup", "audit", "indirect"),
        ],
    ),
    dict(
        id="feat-reverse-sync-db-to-rulebook",
        title="Reverse-sync DB → rulebook (input spoke)",
        category="Platform infrastructure",
        priority="Supporting",
        description=(
            "vw_* raw + computed values are written back into the rulebook data[] (snapshot-to-rulebook), so "
            "edits made in the running app round-trip into the hub. A 'Save to rulebook' admin action and the "
            "init-db snapshot step keep the hub and the DB mirrored."
        ),
        notes=(
            "Makes the running app a peer input spoke to the rulebook hub, not a downstream dead end — the "
            "mechanism by which knob edits in the UI become durable rule-state."
        ),
        refs=[],
    ),
    dict(
        id="feat-coverage-map-honesty",
        title="Honest coverage map (modeled vs. vocabulary-only)",
        category="Platform infrastructure",
        priority="Load-bearing",
        description=(
            "A clause-by-clause map against the original challenge plus an honest scorecard: each capability is "
            "marked DEEPLY MODELED, SCHEMA-MODELED, or VOCABULARY / OUT-OF-SCOPE (IsDeeplyModeled / "
            "IsSchemaModeled on DiseaseDomainConcepts). What is derived says so; what is only named says so too."
        ),
        notes=(
            "The integrity feature. It directly confronts the prompt's own breadth — counterfactual trajectories, "
            "federated privacy, batch effects — by stating exactly which clauses are real derivations and which "
            "are vocabulary only. This is what keeps the platform 'a proof of shape, not a sales pitch.'"
        ),
        refs=[
            ref(4, 1085, 78, "infer counterfactual disease trajectories without randomized perturbation data", "prompt", "indirect"),
            ref(4, 1325, 37, "privacy-preserving federated datasets", "prompt", "indirect"),
            ref(4, 1254, 69, "batch effects, missing tissues, measurement error, ascertainment bias", "prompt", "indirect"),
        ],
    ),
]


# ---------------------------------------------------------------------------
# Rebuild the Features table object (schema + data), preserving its position.
# ---------------------------------------------------------------------------
feat_tbl = rb['Features']

feat_tbl['Description'] = (
    "Catalog of buildable capabilities the platform has / allows for. Coarser grain than loops. "
    "Each row carries challenge provenance (ChallengeRefs: exact quoted text + file/line/col into "
    "THE-ORIGINAL-CHALLENGE.md, for UI hover tips), a Category, a Priority, and a free-form Markdown "
    "ChallengeNotes comment. Source of truth for the DERIVED PLATFORM_FEATURES.md. AssignedLoop links "
    "a feature to the loop that delivers it (nullable until scheduled)."
)

feat_tbl['schema'] = [
    field('FeatureId', 'string', 'raw', "Stable identifier.", nullable=False),
    field('Title', 'string', 'raw', "Short feature name.", nullable=False),
    field('Category', 'string', 'raw',
          "Which layer of the platform this belongs to (Keystone / inference DAG, Leaf / LLM surface, "
          "Witness / harness, Disease-state simulation, Treatment reasoning, Corpus-level discovery, "
          "Reporting, Platform infrastructure).", nullable=False),
    field('Priority', 'string', 'raw',
          "Load-bearing | Supporting | Roadmap.", nullable=False),
    field('Description', 'string', 'raw', "What the capability does (factual, not a pitch).", nullable=False),
    field('ChallengeRefs', 'string', 'raw',
          "JSON array of provenance pointers into THE-ORIGINAL-CHALLENGE.md. Each: "
          "{file,line,col,len,quote,section,relation}. col is the 0-based char offset within the line; "
          "len is the quote length; section is prompt|payoff|audit|response; relation is direct|indirect. "
          "Drives UI hover tips that highlight the exact span.", nullable=True),
    field('ChallengeRefsRendered', 'string', 'raw',
          "Pre-flattened Markdown bullet list of ChallengeRefs, so the dumb hbars template can print it "
          "verbatim (the engine has no loop-over-JSON helper).", nullable=True),
    field('ChallengeNotes', 'string', 'raw',
          "Free-form Markdown comment: which challenge elements this relates to (directly or indirectly) "
          "and how it is load-bearing or illustrative.", nullable=True),
    field('RefCount', 'number', 'raw',
          "Number of challenge refs (carried as raw for display; the hbars engine can't count a JSON string).",
          nullable=False),
    field('AssignedLoop', 'string', 'raw',
          "FK -> EffortlessLoops.EffortlessLoopId; empty if unscheduled.", nullable=True),
    field('Name', 'string', 'calculated', "Display label.", formula="={{Title}}"),
    field('RelativePath', 'string', 'calculated',
          "Path to this Features entry: /admin/features/<id>.",
          formula="=\"/admin/features/\" & {{FeatureId}}"),
    field('MetaLine', 'string', 'calculated',
          "One-line meta summary for the catalog (category - priority - ref count).",
          formula="=\"**Category:** \" & {{Category}} & \" - **Priority:** \" & {{Priority}} & "
                  "\" - **Challenge refs:** \" & {{RefCount}}"),
]

# Preserve AssignedLoop values from the prior rows where they existed.
prior_loops = {}
for r in feat_tbl.get('data', []):
    prior_loops[r.get('FeatureId')] = r.get('AssignedLoop', "")

new_data = []
for f in FEATURES:
    refs = f['refs']
    refs_json = json.dumps([dict(r) for r in refs], ensure_ascii=False)
    row = OD()
    row['FeatureId'] = f['id']
    row['Title'] = ascii_clean(f['title'])
    row['Category'] = ascii_clean(f['category'])
    row['Priority'] = f['priority']
    row['Description'] = ascii_clean(f['description'])
    row['ChallengeRefs'] = refs_json   # byte-exact quotes for UI hover — NOT ascii-ized
    row['ChallengeRefsRendered'] = render_refs(refs)
    row['ChallengeNotes'] = ascii_clean(f['notes'])
    row['RefCount'] = len(refs)
    row['AssignedLoop'] = prior_loops.get(f['id'], "")
    # calculated fields are materialized by the transpiler; seed values so the
    # data shape matches schema (init-db / reverse-sync re-derive them).
    row['Name'] = ascii_clean(f['title'])
    row['RelativePath'] = "/admin/features/" + f['id']
    row['MetaLine'] = ("**Category:** " + ascii_clean(f['category']) + " - **Priority:** " + f['priority']
                       + " - **Challenge refs:** " + str(len(refs)))
    new_data.append(row)

feat_tbl['data'] = new_data

with open(RB_PATH, 'w') as fh:
    json.dump(rb, fh, indent=2, ensure_ascii=False)
    fh.write("\n")

print(f"Features table rebuilt: {len(new_data)} rows.")
cats = collections.Counter(f['category'] for f in FEATURES)
pris = collections.Counter(f['priority'] for f in FEATURES)
print("By category:", dict(cats))
print("By priority:", dict(pris))
print("Total challenge refs:", sum(len(f['refs']) for f in FEATURES))
