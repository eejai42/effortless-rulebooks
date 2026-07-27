# effortless-rulebook-editor -- generic, reusable container image.
#
# This image is DELIBERATELY generic: no rulebook content is baked in. The
# consuming project's effortless-rulebook/ folder is bind-mounted at `docker
# run` time (read-only, v1 scope). Only this Dockerfile + the pipeline config
# + the entrypoint script are per-tool-version; everything about a specific
# project's schema/data/formulas comes from the mounted rulebook at runtime.
#
# Base image rationale: start FROM the .NET 8 SDK (Debian bookworm-slim
# based) and apt-install Node 20.x + Postgres on top, rather than starting
# from a Node base and retrofitting dotnet. The effortless CLI's install
# does a `dotnet build` on first run (the heavier, more fragile of the two
# runtimes to get right); NodeSource's apt-based Node install on Debian is a
# well-trodden one-liner by comparison. Postgres runs INSIDE this same
# container (not a sidecar/docker-compose service) so the whole thing stays
# a single `docker run` -- the explicit ask from this tool's spec.
FROM mcr.microsoft.com/dotnet/sdk:8.0

ENV DEBIAN_FRONTEND=noninteractive
# Pin a UTF-8 locale explicitly. Debian's default C/POSIX locale makes bash
# mis-tokenize multi-byte UTF-8 bytes inside double-quoted strings under
# `set -u` (observed as a bogus 'unbound variable' error pointing at a
# variable name immediately followed by a UTF-8 character). Generated
# scripts are ASCII-only now regardless (see below), but this is
# defense-in-depth against the same class of bug from any other source.
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# --- Node.js 20.x (NodeSource) -------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl ca-certificates gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# --- PostgreSQL (bundled in-container -- keeps this a single-container app)
RUN apt-get update && apt-get install -y --no-install-recommends \
        postgresql postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

# --- filesystem watcher -----------------------------------------------
# inotify-tools gives us `inotifywait`, a small reliable primitive for the
# watch loop in container-entrypoint.sh. Preferred over a hand-rolled Node
# fs.watch script: inotifywait's blocking-wait-then-exit shape maps directly
# onto a `while true; do inotifywait -e modify ...; done` loop with no extra
# Node process/dependency needed just to watch one file.
RUN apt-get update && apt-get install -y --no-install-recommends \
        inotify-tools \
    && rm -rf /var/lib/apt/lists/*

# --- effortless CLI --------------------------------------------------
# Installed from source per the documented install mechanics (no published
# npm package as of this writing). Requires dotnet >= 8.0 (present above)
# and node >= 18 (present above). First run of the CLI does its own
# `dotnet build` (~30-60s) -- this happens once here at image-build time via
# the `effortless -version` warm-up call, so containers START fast.
RUN mkdir -p /root/.effortless && rm -rf /root/.effortless/cli \
    && git clone --depth 1 https://github.com/effortlessapi/cli /root/.effortless/cli \
    && cd /root/.effortless/cli && npm install -g . \
    && effortless -version || true

WORKDIR /app

# The generic pipeline config for this tool's version. Copied in at image
# build time (NOT project-specific) -- see effortless.editor.json for the
# ProjectTranspilers this registers: rulebook-to-postgres (/postgres),
# init-db.sh exec (/postgres), rulebook-to-node-postgres-api (/api),
# rulebook-to-vite-admin-portal (/admin-portal), rulebook-to-rulespeak
# (/rulespeak), rulebook-to-rulespeak-de (/rulespeak-de), rulebook-to-xlsx
# (/xlsx).
COPY effortless.editor.json /app/effortless.json
COPY container-entrypoint.sh /app/container-entrypoint.sh
COPY boot-server.js /app/boot-server.js
RUN chmod +x /app/container-entrypoint.sh

# NOTE: /app/effortless-rulebook is intentionally NOT created/populated here.
# It is bind-mounted at `docker run` time from the host project's
# effortless-rulebook/ folder (read-only, v1 scope) -- see edit-rulebook.sh.

# Generated Node API (rulebook-to-node-postgres-api) listens on $PORT,
# default 5177 (see that tool's generated index.js). The generated Vite UI
# (rulebook-to-vite-admin-portal) listens INTERNALLY on 5175 -- the EXTERNAL
# UI port is 5174, owned by boot-server.js (see that file), which serves an
# immediate boot/progress page + log stream + rebuild button and transparently
# reverse-proxies to the internal Vite dev server once a build succeeds. This
# means 5174 is reachable from t=0 (container start), not just once the first
# `effortless build` finishes. Postgres listens internally on 5432 but is NOT
# exposed outside the container in v1 (only the API + UI ports are meant to
# be reached from the host).
EXPOSE 5177 5174

ENTRYPOINT ["/app/container-entrypoint.sh"]
