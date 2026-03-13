#!/bin/bash

# Tag a commit based on rulebook name + date + time
# Usage: ./tag-commit.sh [commit-hash]
# If no hash provided, uses HEAD

REPO_ROOT=$(git rev-parse --show-toplevel)
RULEBOOK="$REPO_ROOT/effortless-rulebook/effortless-rulebook.json"

# Get commit (default to HEAD)
COMMIT="${1:-HEAD}"
COMMIT=$(git rev-parse "$COMMIT" 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "Error: Invalid commit reference '$1'"
    exit 1
fi

if [ ! -f "$RULEBOOK" ]; then
    echo "Error: Rulebook not found at $RULEBOOK"
    exit 1
fi

# Extract Name field from rulebook JSON
NAME=$(grep -m1 '"Name"' "$RULEBOOK" | sed 's/.*"Name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

if [ -z "$NAME" ]; then
    echo "Error: Could not extract Name from rulebook"
    exit 1
fi

# Convert to tag-friendly format: lowercase, replace spaces/special chars with dashes
TAG_NAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Append date and time (HHMM)
DATETIME=$(date +%Y-%m-%d_%H%M)
FULL_TAG="${TAG_NAME}_${DATETIME}"

# Create and push tag
git tag "$FULL_TAG" "$COMMIT" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Created tag '$FULL_TAG' at $(git rev-parse --short "$COMMIT")"
    git push origin "$FULL_TAG" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "Pushed tag '$FULL_TAG'"
    else
        echo "Tag created locally (push failed or no remote)"
    fi
else
    echo "Error: Tag '$FULL_TAG' already exists"
    exit 1
fi
