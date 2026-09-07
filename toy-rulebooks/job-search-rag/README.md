# Job Search RAG

> Local LLM + RAG pipeline that automates intelligent job filtering across
> multiple job boards. Encodes your hiring judgment as semantic search —
> not keyword matching — and runs entirely on your machine.

[![CI](https://github.com/grimlor/job-search-rag/actions/workflows/ci.yml/badge.svg)](https://github.com/grimlor/job-search-rag/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/grimlor/b6bda813bb4ef28ff592b6c81a09c791/raw/job-search-rag-coverage.json)](https://github.com/grimlor/job-search-rag/actions/workflows/ci.yml)
[![Python 3.13+](https://img.shields.io/badge/python-3.13%2B-blue)](https://www.python.org)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue)](LICENSE)

---

## Why This Exists

Senior-level job searches on major boards are high-noise, low-precision.
Mislabeled IC roles, vendor-chain postings, keyword-match junk, and irrelevant
industries overwhelm every search page. Signal-based tools still produce
misaligned results because they match keywords, not judgment.

This project encodes your judgment once — as semantic embeddings built from
your resume, your target role archetypes, and your own decision history — then
applies it continuously across every board you care about. Everything runs
locally via [Ollama](https://ollama.com) and [ChromaDB](https://www.trychroma.com/);
no data leaves your machine.

## How It Works

```
┌──────────────────────────────────────────────────────────────┐
│                     CLI Entry Point                          │
│               python -m jobsearch_rag [command]              │
└────────────────────────┬─────────────────────────────────────┘
                         │
          ┌──────────────┴───────────────┐
          │                              │
┌─────────▼───────────┐       ┌──────────▼───────────┐
│   Adapter Layer     │       │    RAG Pipeline      │
│  (IoC / Strategy)   │       │  (Ollama + ChromaDB) │
│                     │       │                      │
│ AdapterRegistry     │       │ - Resume embedding   │
│ JobBoardAdapter ABC │       │ - Role archetypes    │
│  ├ ZipRecruiter     │       │ - Decision history   │
│  ├ Indeed           │       │ - Semantic scoring   │
│  ├ WeWorkRemotely   │       │ - LLM disqualifier   │
│  └ LinkedIn*        │       │                      │
└─────────┬───────────┘       └──────────┬───────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
                ┌────────▼────────┐
                │  Ranker &       │
                │  Exporter       │
                │                 │
                │ - Score fusion  │
                │ - Deduplication │
                │ - Markdown/CSV  │
                │ - Browser tabs  │
                └─────────────────┘

* LinkedIn: overnight mode, stealth, throttled
```

1. **Adapter layer** — Playwright-based browser automation loads job board pages
   exactly as a human would. Each board has its own adapter; all produce the
   same `JobListing` data contract.
2. **RAG pipeline** — Job descriptions are embedded locally and scored against
   your resume, your role archetypes, and your past decisions.
3. **Ranker** — Weighted score fusion, cross-board deduplication, and an
   LLM disqualifier pass that catches structural mismatches keywords miss.
4. **Export** — Ranked results as Markdown, CSV, or opened directly as
   browser tabs.

## Prerequisites

| Requirement | Install |
|---|---|
| [Python 3.13+](https://www.python.org) | `brew install python@3.13` or via [uv](https://docs.astral.sh/uv/) |
| [uv](https://docs.astral.sh/uv/) | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| [Ollama](https://ollama.com) | `brew install ollama` |
| [direnv](https://direnv.net/) | `brew install direnv` *(optional — auto-activates venv)* |

## Quick Start

```bash
# Clone and install
git clone https://github.com/grimlor/job-search-rag.git
cd job-search-rag
uv sync --extra dev

# Optional: automatically installs uv, runs uv sync, and auto-activate venv via direnv
direnv allow

# Install Playwright browsers
uv run playwright install chromium

# Start Ollama and pull models
ollama serve &                          # if not already running
ollama pull mistral:7b
ollama pull nomic-embed-text

# Configure your search (edit these files)
#   config/settings.toml    — board URLs, scoring weights, output prefs
#   config/role_archetypes.toml — descriptions of your target roles
#   data/resume.md          — your resume in plain Markdown

# Index your resume and role archetypes into ChromaDB
uv run python -m jobsearch_rag index

# Run a search across enabled boards
uv run python -m jobsearch_rag search

# List registered board adapters
uv run python -m jobsearch_rag boards
```

## Configuration

All configuration lives in `config/`:

- **`settings.toml`** — Enabled boards, search URLs, scoring weights,
  Ollama model names, output preferences.
- **`role_archetypes.toml`** — Natural language descriptions of your ideal
  role types. Each archetype becomes one ChromaDB document used for
  archetype scoring.

Your resume goes in `data/resume.md`. Past decisions (yes/no/maybe on roles
you've reviewed) are auto-stored in `data/decisions/` and build a personal
preference signal over time.

## Development

```bash
# Individual checks
uv run task lint          # ruff check --fix
uv run task format        # ruff format
uv run task type          # pyright type checking
uv run task test          # pytest -v

# All checks at once
uv run task check         # lint → type → test
```

> **Note:** The `uv run` prefix is optional if your venv is already activated —
> either manually (`source .venv/bin/activate`) or automatically via `direnv allow`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development workflow,
testing philosophy, and PR process.

## Project Status

This project is under active development. Current state:

- **Phase 1 (Core Adapter Infrastructure)** — Complete. Adapter registry,
  session manager, ZipRecruiter adapter, error hierarchy, and CLI scaffolding.
- **Phase 2 (RAG Foundation)** — Complete. Ollama embeddings, ChromaDB
  vector store, resume/archetype indexing, semantic scoring with LLM
  disqualifier, and integration tests against live Ollama. 248 total tests
  (232 unit + 16 integration), all Phase 2 modules at 100% coverage.
- **Phases 3–6** — Planned. Score fusion & ranking, additional board
  adapters, export/UX, and portfolio polish.

## Responsible Use

This tool performs **browser automation** — it loads pages exactly as a human
would, navigates via visible links, and reads only data visible in your own
authenticated session. It does not redistribute data, bypass access controls,
or perform bulk harvesting.

That said, job boards have terms of service governing automated access.
**You are responsible for understanding and complying with the ToS of any
board you configure.** This project is provided as-is for personal,
educational, and research purposes. The authors assume no liability for
misuse.

Some practical guidelines:

- Use human-like request timing (the built-in throttle provides this)
- Run overnight passes for boards with stricter detection (e.g., LinkedIn)
- Don't redistribute scraped data
- Respect rate limits and session caps

Violating a board's terms of service may result in your account being
banned or, in extreme cases, a DMCA takedown of this project. Use
responsibly.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design, adapter pattern,
  testing philosophy
- [CONTRIBUTING.md](CONTRIBUTING.md) — Development setup, testing standards,
  PR process

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free for personal use, learning, and noncommercial purposes.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
