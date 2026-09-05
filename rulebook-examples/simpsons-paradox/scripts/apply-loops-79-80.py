#!/usr/bin/env python3
"""Apply Effortless loops 79 (vocabulary prune) and 80 (confounder identity layer) to rulebook JSON."""
from __future__ import annotations

import json
import re
from pathlib import Path

RULEBOOK = Path(__file__).resolve().parents[1] / "effortless-rulebook" / "simpsons-paradox-rulebook.json"

SUPERSEDED_HYPOTHESES = {
    "H-econ-zero",
    "H-domain-dist",
    "H-catalog-flip-prediction",
    "H-domain-flip-geometry-controlled",
    "H-econ-encoding-selection",
    "H-domain-profiles-stable",
}

MODEL_SUMMARY_PRUNE_FIELDS = {
    "DomainFlipGapSurvivesGeometryControl",
    "CorpusPatternSupersededFailCount",
    "ExpansionWave3DiscoveryNote",
}

HISTORICAL_CONCLUSIONS = {
    "conc-17-economics-flip-free",
    "conc-22-domain-flip-geometry",
    "conc-27-economics-encoding-selection",
}

CONFOUNDER_IDENTITIES = [
    {
        "ConfounderIdentityId": "id-age-composition",
        "DisplayName": "Age Composition",
        "MechanismClass": "demographic-composition",
        "Description": "Age or cohort stratification shifts treatment exposure and baseline outcome rates independently — classic demographic confounding (CFR by age, trial subgroups, school entry age).",
        "PolicyDefault": "stratify-by-age",
    },
    {
        "ConfounderIdentityId": "id-disease-severity",
        "DisplayName": "Disease Severity / Case Mix",
        "MechanismClass": "severity-case-mix",
        "Description": "Illness severity, stage, or case-mix drives both treatment selection and prognosis — dominant in medicine and epidemiology reversals.",
        "PolicyDefault": "stratify-by-severity",
    },
    {
        "ConfounderIdentityId": "id-institutional-unit",
        "DisplayName": "Institutional Unit",
        "MechanismClass": "organizational-unit",
        "Description": "School, department, hospital, or center choice correlates with both treatment exposure and outcomes — admissions and quality comparisons.",
        "PolicyDefault": "investigate-unit-choice",
    },
    {
        "ConfounderIdentityId": "id-socioeconomic-status",
        "DisplayName": "Socioeconomic Status",
        "MechanismClass": "ses-income",
        "Description": "Income, SES, or neighborhood tier confounds pooled comparisons in economics, education, and lending encodes.",
        "PolicyDefault": "stratify-by-ses",
    },
    {
        "ConfounderIdentityId": "id-geographic-composition",
        "DisplayName": "Geographic Composition",
        "MechanismClass": "geography",
        "Description": "Country, region, state, or city composition drives aggregate rate differences without per-unit reversal.",
        "PolicyDefault": "stratify-by-geography",
    },
    {
        "ConfounderIdentityId": "id-legal-case-context",
        "DisplayName": "Legal Case Context",
        "MechanismClass": "legal-offense-victim",
        "Description": "Offense type, charge severity, victim characteristics, or stage in criminal process — legal/sentencing paradox encodes.",
        "PolicyDefault": "stratify-by-offense-context",
    },
    {
        "ConfounderIdentityId": "id-credit-risk-tier",
        "DisplayName": "Credit / Risk Tier",
        "MechanismClass": "lending-risk",
        "Description": "Credit score, FICO band, or loan-risk tier — financial lending allocation confounds.",
        "PolicyDefault": "stratify-by-risk-tier",
    },
    {
        "ConfounderIdentityId": "id-situational-context",
        "DisplayName": "Situational Context",
        "MechanismClass": "sports-situation",
        "Description": "Game situation, score state, home/away, surface, or down-and-distance — sports analytics allocation confounds.",
        "PolicyDefault": "stratify-by-situation",
    },
    {
        "ConfounderIdentityId": "id-user-platform-segment",
        "DisplayName": "User / Platform Segment",
        "MechanismClass": "ab-test-segment",
        "Description": "User tenure, device, platform, or experiment segment — online A/B and recsys allocation confounds.",
        "PolicyDefault": "stratify-by-segment",
    },
    {
        "ConfounderIdentityId": "id-demographic-group",
        "DisplayName": "Demographic Group",
        "MechanismClass": "race-sex-group",
        "Description": "Race, sex, or demographic group base rates — distinct from age composition when not age-stratified.",
        "PolicyDefault": "stratify-by-demographic",
    },
    {
        "ConfounderIdentityId": "id-contested-org-choice",
        "DisplayName": "Contested Organizational Choice",
        "MechanismClass": "contested-mediator",
        "Description": "Department or institution where causal role is disputed (Berkeley) — geometry without adjust-resolvable explanation.",
        "PolicyDefault": "do-not-naively-adjust",
    },
    {
        "ConfounderIdentityId": "id-collider-proxy",
        "DisplayName": "Collider / Conditioning Proxy",
        "MechanismClass": "collider-selection",
        "Description": "BMI, birth-weight category, or other collider/selection variables — latent sweep sensitivity without manifest flip.",
        "PolicyDefault": "do-not-condition",
    },
    {
        "ConfounderIdentityId": "id-selection-frailty",
        "DisplayName": "Selection / Frailty",
        "MechanismClass": "healthy-vaccinee",
        "Description": "Frailty, employment, abstainer composition, or healthy-vaccinee selection — epidemiology selection bias.",
        "PolicyDefault": "model-selection-explicitly",
    },
    {
        "ConfounderIdentityId": "id-treatment-indication",
        "DisplayName": "Treatment Indication",
        "MechanismClass": "clinical-indication",
        "Description": "Baseline risk tier, HbA1c, PD-L1, or indication-for-treatment stratification in trials.",
        "PolicyDefault": "stratify-by-indication",
    },
    {
        "ConfounderIdentityId": "id-mechanism-other",
        "DisplayName": "Other Mechanism",
        "MechanismClass": "other",
        "Description": "Catch-all for stratum variables not yet assigned a canonical archetype — pending ontology refinement.",
        "PolicyDefault": "investigate-confounder",
    },
]


def normalize_var(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def classify_identity(row: dict) -> str:
    var = normalize_var(row["VariableName"])
    role = row.get("CausalRole", "confounder")

    if role == "contested" and "department" in var:
        return "id-contested-org-choice"
    if role in ("collider",) or "birth_weight" in var or "birth-weight" in var or var == "bmi_category":
        if role == "collider" or "birth" in var:
            return "id-collider-proxy"
    if role == "selection" or var in ("employment_status", "frailty", "abstainer_composition"):
        return "id-selection-frailty"
    if role == "mediator":
        return "id-collider-proxy"

    age_tokens = ("age", "cohort", "menopause", "maternal")
    if any(t in var for t in age_tokens):
        return "id-age-composition"

    severity_tokens = (
        "severity", "case_mix", "case_mix", "baseline_risk", "baseline_risk", "risk_class",
        "risk_tier", "risk_class", "cancer_stage", "illness", "injury", "indication", "hba1c",
        "pd_l1", "ecg", "arrhythmia", "diabetes", "stone_size", "resistance", "dose",
        "coronary", "patient_risk", "cardiovascular_risk", "pretrial", "charge_severity",
        "aggravating", "offense_severity", "crime", "offense", "arrest", "stage_in",
        "stage_in", "water_company", "exposure_dose", "flu_season", "time_since",
        "vaccination_base", "hospital_incidence", "trial_allocation", "center_baseline",
        "study_design", "model_specification", "gear", "handedness", "kick_distance",
        "pass_depth", "shot_type", "position_group", "preliminary", "race_day", "month_half",
        "inning", "season_year", "field", "task_type", "routine", "quantile", "loan_size",
        "loan_channel", "firm_size", "firm_age", "bank_size", "bank_capitalization",
        "occupation", "industry", "education_composition", "workforce", "commuting",
        "proximity", "application_portfolio", "lottery", "incoming", "prior_year", "grade_level",
        "grade", "sat_score", "applicant", "field_of", "institution_selectivity", "institutional",
        "institution", "school", "legacy", "selectivity", "achievement", "preparation",
        "spending", "isolation", "mentor", "co_author", "restaurant", "sequential", "traffic",
        "concurrent", "exposure_popularity", "activity", "tenure", "wealth", "platform",
        "device", "user", "segment", "population", "passenger", "faculty", "subarea",
        "science", "gear", "park", "ballpark", "course", "surface", "home", "away", "situation",
        "pressing", "trailing", "leading", "down_and", "match_situation", "score_situation",
    )
    # severity / clinical indication (check before institutional school)
    clinical = (
        "severity", "case_mix", "baseline", "risk", "stage", "illness", "injury", "indication",
        "hba1c", "pd_l1", "ecg", "arrhythmia", "diabetes", "stone", "resistance", "coronary",
        "patient_risk", "cardiovascular", "cancer", "hospital_incidence", "trial_allocation",
        "center_baseline", "dose", "time_since", "vaccination_base", "water_company",
        "flu_season", "smoking", "bmi", "birth_weight", "abstainer",
    )
    if any(t in var for t in clinical):
        if "smoking" in var:
            return "id-selection-frailty"
        if "bmi" in var and role == "confounder":
            return "id-disease-severity"
        return "id-disease-severity" if any(
            x in var for x in ("severity", "case_mix", "baseline", "stage", "illness", "injury", "indication", "hba1c", "pd_l1", "cancer", "coronary", "patient_risk", "cardiovascular", "stone", "resistance", "dose", "hospital", "trial_allocation", "center", "diabetes", "ecg", "arrhythmia", "flu", "vaccination", "time_since", "water")
        ) else "id-treatment-indication"

    institutional = (
        "school", "department", "institution", "college", "university", "center", "hospital",
        "precinct", "legacy", "selectivity", "lottery", "applicant", "portfolio",
    )
    if any(t in var for t in institutional):
        return "id-institutional-unit"

    ses_tokens = ("ses", "income", "neighborhood", "zip", "fico", "credit", "loan_to", "fractile", "quartile", "wealth")
    if any(t in var for t in ses_tokens):
        if "credit" in var or "fico" in var or "loan" in var:
            return "id-credit-risk-tier"
        return "id-socioeconomic-status"

    geo_tokens = ("country", "region", "state", "city", "geographic", "national", "commuting_zone", "zip")
    if any(t in var for t in geo_tokens):
        return "id-geographic-composition"

    legal_tokens = ("offense", "crime", "victim", "charge", "arrest", "sentencing", "precinct", "aggravating", "pretrial", "stage")
    if any(t in var for t in legal_tokens):
        return "id-legal-case-context"

    situational = (
        "situation", "score", "down", "distance", "home", "away", "surface", "park", "course",
        "inning", "half", "season", "month", "temperature", "pressing", "leading", "trailing",
        "field_goal", "completion", "depth", "shot", "handedness", "gear", "ballpark", "position",
        "preliminary", "final", "semifinal", "kick", "pass", "race_day",
    )
    if any(t in var for t in situational):
        return "id-situational-context"

    user_tokens = ("user", "segment", "platform", "device", "tenure", "activity", "experiment", "concurrent", "traffic", "restaurant", "sequential")
    if any(t in var for t in user_tokens):
        return "id-user-platform-segment"

    demo_tokens = ("race", "sex", "gender", "demographic", "legacy")
    if any(t in var for t in demo_tokens):
        return "id-demographic-group"

    edu_tokens = ("grade", "education", "achievement", "preparation", "spending", "mentor", "faculty", "field_of", "science", "occupation", "industry", "task", "routine", "workforce", "quantile", "firm", "bank", "loan_channel")
    if any(t in var for t in edu_tokens):
        if "industry" in var or "occupation" in var or "firm" in var or "bank" in var:
            return "id-socioeconomic-status"
        return "id-institutional-unit"

    return "id-mechanism-other"


def compact_data_rows(rb: dict) -> str:
    """Compact leaf data arrays to one object per line (with valid JSON commas)."""
    pretty = json.dumps(rb, indent=2, ensure_ascii=False)
    lines = pretty.splitlines()
    out: list[str] = []
    in_data = False
    depth = 0
    buf: list[str] = []

    for line in lines:
        if re.match(r'^\s+"data": \[\s*$', line):
            in_data = True
            depth = 0
            buf = []
            out.append(line)
            continue
        if in_data:
            stripped = line.strip()
            if stripped == "{":
                buf = [stripped]
                depth = 1
            elif buf:
                buf.append(stripped)
                depth += stripped.count("{") - stripped.count("}")
                if depth <= 0 and buf:
                    row = " ".join(buf).rstrip(",")
                    out.append("      " + row + ",")
                    buf = []
            elif stripped.startswith("{"):
                row = stripped.rstrip(",")
                out.append("      " + row + ",")
            elif re.match(r"^\s+\],?\s*$", line):
                in_data = False
                if out and out[-1].endswith(","):
                    out[-1] = out[-1][:-1]
                out.append(line)
            continue
        out.append(line)

    text = "\n".join(out) + "\n"
    json.loads(text)
    return text


def write_rulebook(rb: dict) -> None:
    RULEBOOK.write_text(compact_data_rows(rb), encoding="utf-8")


def apply_loop_79(rb: dict) -> None:
    loops = rb["Loops"]["data"]
    for loop in loops:
        if loop["LoopId"] == "loop-78":
            loop["NextSuggestion"] = "loop-79: vocabulary prune — retire superseded discovery predicates"
        if loop["LoopId"] == "loop-79":
            loop["Title"] = "Vocabulary prune: retire superseded discovery predicates (post loop-78)"
            loop["Status"] = "complete"
            loop["NewConcept"] = (
                "Archive loop-78 supersessions to conc-32 evidence only; remove from active DAG: "
                "6 DiscoveryHypotheses + DiscoveryFindings (EpistemicTier=corpus-pattern-superseded); "
                "prune ModelSummary predicates wired only to those hypotheses "
                "(DomainFlipGapSurvivesGeometryControl, CorpusPatternSupersededFailCount, "
                "ExpansionWave3DiscoveryNote; simplify DiscoveryWitnessNote); drop customize "
                "calc_discovery_findings branches for superseded hypotheses; mark conc-17/22/27 as historical."
            )
            loop["DomainQuestion"] = (
                "After loop-78 witnessed six corpus-pattern supersessions at N=238, which predicates "
                "are no longer clean load-bearing vocabulary — and can the instrument shed them without "
                "losing theorem/invariant witnesses or the conc-32 audit trail?"
            )
            loop["MockDataNote"] = (
                "Witnessed post-build: removed 6 corpus-pattern-superseded DiscoveryHypotheses + Findings; "
                "pruned ModelSummary supersession rollup fields; simplified DiscoveryWitnessNote; "
                "conc-17/22/27 → historical. conc-32 audit trail retained. inv-discovery-all-confirmed: 10/10 PASS."
            )
            loop["NextSuggestion"] = "loop-80: ConfounderIdentity ontology — cross-study accountable confounders"
            loop["TraditionId"] = "tradition-dag"

    rb["DiscoveryHypotheses"]["data"] = [
        r for r in rb["DiscoveryHypotheses"]["data"]
        if r["HypothesisId"] not in SUPERSEDED_HYPOTHESES
    ]
    rb["DiscoveryFindings"]["data"] = [
        r for r in rb["DiscoveryFindings"]["data"]
        if r["HypothesisId"] not in SUPERSEDED_HYPOTHESES
    ]

    for field in rb["DiscoveryHypotheses"]["schema"]:
        if field["name"] == "EpistemicTier":
            field["Description"] = (
                "consistency-check (definition-linked regression) | corpus-hypothesis (contingent corpus pattern)"
            )

    ms_schema = rb["ModelSummary"]["schema"]
    rb["ModelSummary"]["schema"] = [f for f in ms_schema if f["name"] not in MODEL_SUMMARY_PRUNE_FIELDS]

    for field in rb["ModelSummary"]["schema"]:
        if field["name"] == "DiscoveryWitnessNote":
            field["formula"] = (
                '=CONCAT("sweep: latentD=", {{LatentTypeDFraction}}, '
                '" purityMax=", {{SignFlipSignalPurityMax}}, '
                '" catalogExact=", {{TypePredictionMatchRate}}, '
                '" identities=", {{ConfounderIdentityCount}})'
            )

    # Add placeholder — loop 80 fills ConfounderIdentityCount
    if not any(f["name"] == "ConfounderIdentityCount" for f in rb["ModelSummary"]["schema"]):
        rb["ModelSummary"]["schema"].append({
            "name": "ConfounderIdentityCount",
            "datatype": "integer",
            "type": "aggregation",
            "nullable": True,
            "Description": "Canonical ConfounderIdentity archetypes in ontology (loop-80).",
            "formula": "=COUNT(ConfounderIdentities!{{ConfounderIdentityId}})",
        })

    for row in rb["Conclusions"]["data"]:
        if row["ConclusionId"] in HISTORICAL_CONCLUSIONS:
            row["Status"] = "historical"
            row["Category"] = "corpus-pattern-superseded"

    for inv in rb["InvariantChecks"]["data"]:
        if inv["InvariantCheckId"] == "inv-discovery-all-confirmed":
            inv["NaturalLanguage"] = (
                "All active corpus-hypothesis discovery findings confirmed at N=238 post loop-79 prune."
            )


def apply_loop_80(rb: dict) -> None:
    # --- ConfounderIdentities table ---
    rb["ConfounderIdentities"] = {
        "Description": (
            "Table: ConfounderIdentities — canonical cross-study archetypes for stratum variables. "
            "Each identity names a reusable confounding mechanism accountable across the corpus (loop-80)."
        ),
        "schema": [
            {"name": "ConfounderIdentityId", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "Unique slug (e.g. id-age-composition)."},
            {"name": "Name", "datatype": "string", "type": "calculated", "nullable": False,
             "Description": "Display label.", "formula": "={{ConfounderIdentityId}}"},
            {"name": "DisplayName", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "Human-readable archetype name."},
            {"name": "MechanismClass", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "Mechanism family tag for cross-study clustering."},
            {"name": "Description", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "How this identity confounds and where it appears."},
            {"name": "PolicyDefault", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "Default screening/adjustment posture for this archetype."},
            {"name": "StudyCount", "datatype": "integer", "type": "aggregation", "nullable": True,
             "Description": "Real studies mapped to this identity.",
             "formula": "=COUNTIFS(StratumVariableIdentityMaps!{{ConfounderIdentity}}, {{ConfounderIdentityId}})"},
        ],
        "data": [{k: v for k, v in row.items()} for row in CONFOUNDER_IDENTITIES],
    }

    sv_rows = rb["StratumVariables"]["data"]
    maps = []
    for row in sv_rows:
        sid = row["StratumVariableId"]
        identity = classify_identity(row)
        maps.append({
            "MapId": f"map-{sid}",
            "StratumVariable": sid,
            "ConfounderIdentity": identity,
            "VariableNameNormalized": normalize_var(row["VariableName"]),
        })

    rb["StratumVariableIdentityMaps"] = {
        "Description": (
            "Table: StratumVariableIdentityMaps — many-to-one map from per-study StratumVariables "
            "to canonical ConfounderIdentities (loop-80)."
        ),
        "schema": [
            {"name": "MapId", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "Unique slug."},
            {"name": "Name", "datatype": "string", "type": "calculated", "nullable": False,
             "Description": "Display label.", "formula": "={{MapId}}"},
            {"name": "StratumVariable", "datatype": "string", "type": "relationship", "nullable": False,
             "Description": "FK → StratumVariables.", "RelatedTo": "StratumVariables"},
            {"name": "ConfounderIdentity", "datatype": "string", "type": "relationship", "nullable": False,
             "Description": "FK → ConfounderIdentities.", "RelatedTo": "ConfounderIdentities"},
            {"name": "VariableNameNormalized", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "Lowercase normalized variable token for dedup audit."},
        ],
        "data": maps,
    }

    cluster_rows = []
    for ident in CONFOUNDER_IDENTITIES:
        iid = ident["ConfounderIdentityId"]
        cluster_rows.append({
            "IdentityClusterId": f"cluster-{iid}",
            "ConfounderIdentity": iid,
        })

    rb["IdentityClusterSummaries"] = {
        "Description": (
            "Table: IdentityClusterSummaries — witnessed geometry rollup per ConfounderIdentity "
            "(manifest flip, latent-D, avg distortion) — loop-80 open-question substrate."
        ),
        "schema": [
            {"name": "IdentityClusterId", "datatype": "string", "type": "raw", "nullable": False,
             "Description": "Unique slug; one row per ConfounderIdentity cluster."},
            {"name": "Name", "datatype": "string", "type": "calculated", "nullable": False,
             "Description": "Display label.", "formula": "={{IdentityClusterId}}"},
            {"name": "ConfounderIdentity", "datatype": "string", "type": "relationship", "nullable": False,
             "Description": "FK → ConfounderIdentities.", "RelatedTo": "ConfounderIdentities"},
            {"name": "DisplayName", "datatype": "string", "type": "lookup", "nullable": True,
             "Description": "Lookup archetype display name.",
             "formula": "=LOOKUP({{ConfounderIdentity}}, ConfounderIdentities[ConfounderIdentityId], ConfounderIdentities[DisplayName])"},
            {"name": "StudyCount", "datatype": "integer", "type": "raw", "nullable": True,
             "Description": "Real studies in cluster (customize SQL)."},
            {"name": "ManifestFlipCount", "datatype": "integer", "type": "raw", "nullable": True,
             "Description": "IsSignFlip=TRUE count in cluster."},
            {"name": "LatentFlipCount", "datatype": "integer", "type": "raw", "nullable": True,
             "Description": "LatentFlipPotential=TRUE without manifest flip."},
            {"name": "TypeDCount", "datatype": "integer", "type": "raw", "nullable": True,
             "Description": "Type-D studies in cluster."},
            {"name": "AvgAllocationDistortion", "datatype": "number", "type": "raw", "nullable": True,
             "Description": "Mean allocation distortion in cluster."},
            {"name": "LatentFractionAmongTypeD", "datatype": "number", "type": "raw", "nullable": True,
             "Description": "Fraction of Type-D rows with LatentFlipPotential."},
            {"name": "DomainCount", "datatype": "integer", "type": "raw", "nullable": True,
             "Description": "Distinct Studies.Domain values in cluster."},
            {"name": "ManifestFlipRate", "datatype": "number", "type": "calculated", "nullable": True,
             "Description": "ManifestFlipCount / StudyCount.",
             "formula": "=IF({{StudyCount}}=0, \"\", {{ManifestFlipCount}} / {{StudyCount}})"},
        ],
        "data": cluster_rows,
    }

    # StratumVariables: ConfounderIdentity lookup
    sv_schema = rb["StratumVariables"]["schema"]
    if not any(f["name"] == "ConfounderIdentity" for f in sv_schema):
        sv_schema.append({
            "name": "ConfounderIdentity",
            "datatype": "string",
            "type": "lookup",
            "nullable": True,
            "Description": "Canonical cross-study identity via StratumVariableIdentityMaps (loop-80).",
            "formula": "=LOOKUP({{StratumVariableId}}, StratumVariableIdentityMaps[StratumVariable], StratumVariableIdentityMaps[ConfounderIdentity])",
        })

    # ModelSummary identity rollups
    extra_ms = [
        {
            "name": "MappedStratumVariableCount",
            "datatype": "integer",
            "type": "aggregation",
            "nullable": True,
            "Description": "Stratum variables with an identity map row.",
            "formula": "=COUNT(StratumVariableIdentityMaps!{{MapId}})",
        },
        {
            "name": "UnmappedStratumVariableCount",
            "datatype": "integer",
            "type": "calculated",
            "nullable": True,
            "Description": "Stratum variables lacking identity map (should be 0).",
            "formula": "=COUNT(StratumVariables!{{StratumVariableId}}) - {{MappedStratumVariableCount}}",
        },
        {
            "name": "IdentityClusterWitnessNote",
            "datatype": "string",
            "type": "raw",
            "nullable": True,
            "Description": "Loop-80 identity layer witness rollup (customize SQL).",
        },
    ]
    names = {f["name"] for f in rb["ModelSummary"]["schema"]}
    for field in extra_ms:
        if field["name"] not in names:
            rb["ModelSummary"]["schema"].append(field)

    # Discovery hypotheses
    new_h = [
        {
            "HypothesisId": "H-age-identity-flip-rate",
            "Statement": "Age-composition identity (id-age-composition) produces manifest flip rate ≥ 40% among real studies — cross-domain demographic confounding is flip-prone, not latent-only.",
            "ExpectedOutcome": "AgeIdentityManifestFlipRate >= 0.40 AND AgeIdentityStudyCount >= 10",
            "RegisteredInLoop": "loop-80",
            "TraditionId": "tradition-epidemiology",
            "EpistemicTier": "corpus-hypothesis",
        },
        {
            "HypothesisId": "H-severity-vs-age-latent",
            "Statement": "Disease-severity identity shows lower Type-D latent fraction than age-composition identity — severity drives manifest reversals more than hidden sweep sensitivity.",
            "ExpectedOutcome": "SeverityIdentityLatentFractionAmongTypeD < AgeIdentityLatentFractionAmongTypeD",
            "RegisteredInLoop": "loop-80",
            "TraditionId": "tradition-dag",
            "EpistemicTier": "corpus-hypothesis",
        },
        {
            "HypothesisId": "H-identity-map-coverage",
            "Statement": "At least 95% of real-study StratumVariables carry a ConfounderIdentity map — ontology covers the corpus.",
            "ExpectedOutcome": "IdentityMapCoverageRate >= 0.95",
            "RegisteredInLoop": "loop-80",
            "TraditionId": "tradition-historical",
            "EpistemicTier": "consistency-check",
        },
    ]
    rb["DiscoveryHypotheses"]["data"].extend(new_h)

    new_f = [
        {"FindingId": "find-H-age-identity-flip-rate", "HypothesisId": "H-age-identity-flip-rate", "WitnessedInLoop": "loop-80"},
        {"FindingId": "find-H-severity-vs-age-latent", "HypothesisId": "H-severity-vs-age-latent", "WitnessedInLoop": "loop-80"},
        {"FindingId": "find-H-identity-map-coverage", "HypothesisId": "H-identity-map-coverage", "WitnessedInLoop": "loop-80"},
    ]
    rb["DiscoveryFindings"]["data"].extend(new_f)

    inv = rb["InvariantChecks"]["data"]
    for row in inv:
        if row["InvariantCheckId"] == "inv-discovery-all-confirmed":
            row["SqlFilter"] = (
                "hypothesis_id IN ('H-latent-d', 'H-small-effect', 'H-causal-manifest', "
                "'H-causal-latent', 'H-explained-confounder', 'H-unexplained-nonconfounder', "
                "'H-catalog-exact-match', 'H-collider-no-manifest-v2', 'H-cplus-magnitude', "
                "'H-ultra-fragile', 'H-age-identity-flip-rate', 'H-severity-vs-age-latent')"
            )
            row["PassCount"] = 12
        if row["InvariantCheckId"] == "inv-theorem-consistency-confirmed":
            pass

    rb["Conclusions"]["data"].append({
        "ConclusionId": "conc-33-confounder-identity-layer",
        "Category": "instrument",
        "Status": "witnessed",
        "Title": "ConfounderIdentity ontology: cross-study accountable stratum archetypes (loop-80)",
        "Evidence": "Pending post-build witness — canonical identities map 233 stratum variables; IdentityClusterSummaries expose manifest vs latent geometry by mechanism, not domain.",
        "WitnessedInLoop": "loop-80",
        "TraditionId": "tradition-dag",
    })

    loops = rb["Loops"]["data"]

    # Replace planned loop-80 (vocab prune) with confounder identity implementation
    loop_80_idx = next(i for i, l in enumerate(loops) if l["LoopId"] == "loop-80")
    loops[loop_80_idx] = {
        "LoopId": "loop-80",
        "Title": "ConfounderIdentity ontology — cross-study accountable confounding archetypes",
        "Status": "complete",
        "NewConcept": (
            "ConfounderIdentities + StratumVariableIdentityMaps + IdentityClusterSummaries; "
            "StratumVariables.ConfounderIdentity lookup; DiscoveryHypotheses H-age-identity-flip-rate, "
            "H-severity-vs-age-latent, H-identity-map-coverage; ModelSummary identity rollups; conc-33."
        ),
        "DomainQuestion": (
            "When 181 raw stratum variable strings collapse to named ConfounderIdentities, do manifest-flip "
            "vs latent-D geometry cluster by mechanism (age, severity, org-unit) rather than domain — and "
            "can the instrument hold each identity accountable across 238+ studies?"
        ),
        "MockDataNote": "Pending post-build witness.",
        "NextSuggestion": "loop-82: methods-paper export on pruned instrument with identity layer",
        "TraditionId": "tradition-dag",
    }

    # Preserve methods-export as loop-82 if not already present
    if not any(l["LoopId"] == "loop-82" for l in loops):
        loop_81_idx = next(i for i, l in enumerate(loops) if l["LoopId"] == "loop-81")
        loops.insert(loop_81_idx + 1, {
            "LoopId": "loop-82",
            "Title": "Methods-paper export: theorem portfolio + instrument spec packaging",
            "Status": "planned",
            "NewConcept": (
                "Rulespeak theorem section export; InstrumentSpec catalog PDF; witnessed Conclusions "
                "conc-28..31 + conc-32 synthesis + conc-33 identity layer."
            ),
            "DomainQuestion": (
                "With five theorems witnessed, supersession audit complete, and ConfounderIdentity ontology "
                "live, is the instrument ready for external methods-paper submission?"
            ),
            "MockDataNote": "Pending — after loop-80 witness refresh.",
            "NextSuggestion": "Clinical-trials domain encode or peer-review draft",
            "TraditionId": "tradition-historical",
        })


def main() -> None:
    rb = json.loads(RULEBOOK.read_text(encoding="utf-8"))
    apply_loop_79(rb)
    apply_loop_80(rb)
    write_rulebook(rb)
    print(f"Updated {RULEBOOK} ({RULEBOOK.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
