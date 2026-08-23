#!/bin/bash
# start.sh -- stop/restart the traffic-ticket-contest rulebook editor app.
#
# Delegates to effortless-rulebook/edit-rulebook.local.sh, a project-local fork
# of the generated edit-rulebook.sh that uses a project-pinned container name
# and ports (42451/42452/5452) instead of the shared defaults (42441/42442/5442),
# so this project doesn't fight other rulebook-editor instances for the same
# container name/ports. It already force-removes its own container before
# booting fresh -- restart is always this one command.
#
# UI:   http://localhost:42452
# API:  http://localhost:42451/api/docs
# PG:   postgresql://postgres:postgres@localhost:5452/effortless-rulebook

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/effortless-rulebook"
exec bash edit-rulebook.local.sh
