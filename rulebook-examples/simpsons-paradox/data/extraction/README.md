# PDF table extraction side loop (out-of-channel)

Standalone **PDF → table extract** pipeline for expansion-wave-1 catalog candidates.
Intentionally **outside** Effortless loops 68–72 so table transcription does not collide
with rulebook encode work happening in parallel.

## Why this exists

The acquisition loop (`scripts/acquisition-loop-expansion-wave-1.py`) often saved
`source-1.html` landing pages when publisher PDFs returned HTTP 403. That creates an
**HTML GET bias** in what artifacts we have on disk. This side loop re-fetches verified
manuscript PDFs (with title-token checks), extracts embedded tables, and writes
provenance sidecars — **without editing the rulebook**.

## Files

| File | Purpose |
|------|---------|
| `pdf-table-extraction-manifest.json` | Per-study extraction status, PDF source URL, table picks |
| `../raw/<study-id>/manuscript.pdf` | Verified manuscript PDF (not `openalex-search.pdf`) |
| `../raw/<study-id>/manuscript-source-url.txt` | URL that produced `manuscript.pdf` |
| `../raw/<study-id>/table-extract.json` | Machine-readable extracted tables + encode hints |
| `../raw/<study-id>/provenance.md` | Human audit trail (reintjes/radelet format when 2×K ready) |

## Run

```bash
python3 scripts/pdf-table-extraction-side-loop.py
python3 scripts/pdf-table-extraction-side-loop.py --id moss-racusin-et-al-2012
python3 scripts/pdf-table-extraction-side-loop.py --limit 3   # smoke test
```

## Merge into rulebook (after loops 68–72)

**Integrated 2026-07-07** via `python3 scripts/integrate-expansion-wave-1.py` (or the individual merge scripts below).

Updates `CandidateStudyCatalog` only:
- `DataAcquisitionStatus` → `downloaded` (verified manuscript PDF on disk)
- `DataSourceNote` → appends `PDF side-loop:` pointer to `table-extract.json`
- `SourceUrl` → manuscript PDF URL

Does **not** encode CaseCells — that remains a Effortless encode wave.

Re-merge after a fresh extraction run:

```bash
python3 scripts/pdf-table-extraction-side-loop.py
python3 scripts/merge-pdf-extraction-manifest.py
```
