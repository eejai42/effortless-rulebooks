#!/usr/bin/env bash
# Cross-substrate conformance receipt for Simpson's Paradox formula fields.
#
# Runs the local OWL-SHACL reasoner (owl/reason.py) over the just-generated
# ontology + individuals, asserts Postgres-computed aggregation values as leaf
# facts, runs pyshacl fixpoint derivation, and diffs the SHACL-derived formula
# fields against vw_treatment_rankings / vw_stratum_summaries / vw_stratum_variables.
#
# Exits non-zero if the two substrates disagree.
#
# On-demand only — run from the Effortless Loops tab in the admin UI
# (POST /api/conformance/run) or manually: ./owl/run-conformance.sh
# Disabled in effortless.json (owl-conformance IsDisabled: true) so build
# does not block on the ~10min OWL-SHACL receipt at 238 studies.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f owl/src/ontology.owl ]]; then
  echo "[conformance] ERROR: owl/src not generated — did rulebook-to-owl run first?" >&2
  exit 1
fi

python3 owl/reason.py
