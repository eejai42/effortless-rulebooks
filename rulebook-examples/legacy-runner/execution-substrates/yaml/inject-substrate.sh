#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# YAML schema is hand-maintained (or generated off-pipeline). YAML is a
# schema/data format, not a computation engine, so there is nothing to
# regenerate at inject time. Previously this script also regenerated the
# Python simulator, which is no longer true — the YAML substrate is
# explicitly forbidden from depending on the Python simulator.
echo "YAML schema available at: execution-substrates/yaml/schema.yaml"

# Run the test for this substrate (raw-passthrough only).
"$SCRIPT_DIR/take-test.sh"
