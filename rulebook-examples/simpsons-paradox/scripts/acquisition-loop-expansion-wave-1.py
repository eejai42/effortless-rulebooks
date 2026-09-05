#!/usr/bin/env python3
"""Standalone acquisition loop for expansion-wave-1 catalog candidates.

Reads CandidateStudyCatalog from the rulebook (read-only), attempts to locate
and download source materials for each of the 142 expansion candidates, and
tracks progress in data/acquisition/expansion-wave-1-manifest.json.

This loop is intentionally OUT OF CHANNEL for Effortless loops 68–72: it does NOT
modify the rulebook JSON. When loops 68–72 finish, merge manifest statuses into
CandidateStudyCatalog.DataAcquisitionStatus and promote provenance into encode waves.

Usage:
  python3 scripts/acquisition-loop-expansion-wave-1.py          # process all pending
  python3 scripts/acquisition-loop-expansion-wave-1.py --limit 5
  python3 scripts/acquisition-loop-expansion-wave-1.py --retry-failed
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import certifi

ROOT = Path(__file__).resolve().parent.parent
RULEBOOK = ROOT / "effortless-rulebook" / "simpsons-paradox-rulebook.json"
PLAN = ROOT / "corpus-expansion-plan.md"
MANIFEST = ROOT / "data" / "acquisition" / "expansion-wave-1-manifest.json"
RAW_DIR = ROOT / "data" / "raw"

USER_AGENT = "SimpsonsParadoxCorpusAcquisition/1.0 (effortless-rulebook research; mailto:research@example.com)"
REQUEST_TIMEOUT = 45
RATE_LIMIT_SEC = 0.75
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

PORTAL_DOMAINS = (
    "ipums.org",
    "bls.gov",
    "census.gov",
    "nces.ed.gov",
    "nber.org/data",
    "opportunityinsights.org/data",
    "biolincc.nhlbi.nih.gov",
    "clinicaltrials.gov",
    "cdc.gov",
    "who.int",
    "oecd.org",
    "jstor.org",
    "psidonline",
    "nlsinfo.org",
    "icpsr.umich.edu",
    "openicpsr.org",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def http_get(url: str, accept: str | None = None) -> tuple[int, dict[str, str], bytes]:
    headers = {"User-Agent": USER_AGENT}
    if accept:
        headers["Accept"] = accept
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT, context=SSL_CONTEXT) as resp:
        body = resp.read()
        hdrs = {k.lower(): v for k, v in resp.headers.items()}
        return resp.status, hdrs, body


def extract_dois(text: str) -> list[str]:
    found = re.findall(r"10\.\d{4,9}/[^\s\"'<>]+", text, flags=re.I)
    cleaned: list[str] = []
    for d in found:
        d = d.rstrip(".,;)\\]")
        if d not in cleaned:
            cleaned.append(d)
    return cleaned


def extract_urls(text: str) -> list[str]:
    urls = re.findall(r"https?://[^\s\"'<>]+", text)
    cleaned: list[str] = []
    for u in urls:
        u = u.rstrip(".,;)\\]")
        if u not in cleaned:
            cleaned.append(u)
    return cleaned


def is_portal_url(url: str) -> bool:
    host = urllib.parse.urlparse(url).netloc.lower()
    return any(p in host or p in url.lower() for p in PORTAL_DOMAINS)


def guess_extension(content_type: str, url: str) -> str:
    ct = (content_type or "").lower()
    if "pdf" in ct:
        return ".pdf"
    if "json" in ct:
        return ".json"
    if "csv" in ct:
        return ".csv"
    if "zip" in ct:
        return ".zip"
    path = urllib.parse.urlparse(url).path.lower()
    for ext in (".pdf", ".csv", ".zip", ".json", ".xlsx", ".dta"):
        if path.endswith(ext):
            return ext
    if "html" in ct or "text" in ct:
        return ".html"
    return ".bin"


def save_bytes(dest: Path, data: bytes) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)


def url_variants(url: str) -> list[str]:
    parsed = urllib.parse.urlparse(url)
    variants = [url]
    if not parsed.netloc.startswith("www."):
        variants.append(urllib.parse.urlunparse(parsed._replace(netloc="www." + parsed.netloc)))
    if not parsed.path.endswith("/") and "." not in parsed.path.split("/")[-1]:
        variants.append(url.rstrip("/") + "/")
    # dedupe
    seen: set[str] = set()
    out: list[str] = []
    for v in variants:
        if v not in seen:
            seen.add(v)
            out.append(v)
    return out


def openalex_lookup(doi: str) -> dict | None:
    q = urllib.parse.quote(f"https://doi.org/{doi}")
    url = f"https://api.openalex.org/works/{q}"
    try:
        status, _, body = http_get(url, accept="application/json")
        if status == 200:
            return json.loads(body.decode("utf-8"))
    except Exception:
        return None
    return None


def unpaywall_pdf(doi: str) -> str | None:
    q = urllib.parse.quote(f"https://doi.org/{doi}")
    url = f"https://api.unpaywall.org/v2/{q}?email=corpus@effortlessapi.com"
    try:
        status, _, body = http_get(url, accept="application/json")
        if status != 200:
            return None
        data = json.loads(body.decode("utf-8"))
        best = data.get("best_oa_location") or {}
        pdf = best.get("url_for_pdf") or best.get("url")
        if pdf:
            return pdf
    except Exception:
        return None
    return None


def load_candidates() -> list[dict]:
    rb = json.loads(RULEBOOK.read_text(encoding="utf-8"))
    return [
        r
        for r in rb["CandidateStudyCatalog"]["data"]
        if r.get("ExpansionWave") == "expansion-wave-1" and r.get("IngestionStatus") == "candidate"
    ]


def plan_context_for_title(title: str) -> str:
    if not PLAN.exists():
        return ""
    text = PLAN.read_text(encoding="utf-8")
    # grab block starting at numbered entry whose bold title matches
    m = re.search(rf"\d+\.\s+\*\*{re.escape(title.split('(')[0].strip())}.*?(?=\n\d+\.\s+\*\*|\n## )", text, re.S)
    return m.group(0) if m else ""


def init_manifest(candidates: list[dict]) -> dict:
    studies = []
    for c in candidates:
        ctx = plan_context_for_title(c.get("Title", ""))
        plan_urls = extract_urls(ctx)
        plan_dois = extract_dois(ctx)
        studies.append(
            {
                "candidate_id": c["CandidateId"],
                "proposed_study_id": c["ProposedStudyId"],
                "title": c.get("Title"),
                "citation": c.get("Citation"),
                "domain": c.get("Domain"),
                "catalog_data_acquisition_status": c.get("DataAcquisitionStatus"),
                "catalog_source_url": c.get("SourceUrl"),
                "plan_urls": plan_urls,
                "plan_dois": plan_dois,
                "acquisition_status": "pending",
                "acquisition_notes": [],
                "files": [],
                "resolved_urls": [],
                "attempted_at": None,
                "raw_dir": f"data/raw/{c['ProposedStudyId']}",
            }
        )
    return {
        "loop": "acquisition-expansion-wave-1",
        "channel": "out-of-band",
        "note": "Standalone acquisition queue. Do NOT merge into rulebook until Effortless loops 68–72 complete.",
        "created_at": utc_now(),
        "updated_at": utc_now(),
        "studies": studies,
    }


def load_or_init_manifest() -> dict:
    candidates = load_candidates()
    if MANIFEST.exists():
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        by_id = {s["candidate_id"]: s for s in manifest.get("studies", [])}
        for c in candidates:
            if c["CandidateId"] not in by_id:
                ctx = plan_context_for_title(c.get("Title", ""))
                by_id[c["CandidateId"]] = {
                    "candidate_id": c["CandidateId"],
                    "proposed_study_id": c["ProposedStudyId"],
                    "title": c.get("Title"),
                    "citation": c.get("Citation"),
                    "domain": c.get("Domain"),
                    "catalog_data_acquisition_status": c.get("DataAcquisitionStatus"),
                    "catalog_source_url": c.get("SourceUrl"),
                    "plan_urls": extract_urls(ctx),
                    "plan_dois": extract_dois(ctx),
                    "acquisition_status": "pending",
                    "acquisition_notes": [],
                    "files": [],
                    "resolved_urls": [],
                    "attempted_at": None,
                    "raw_dir": f"data/raw/{c['ProposedStudyId']}",
                }
        manifest["studies"] = list(by_id.values())
        return manifest
    manifest = init_manifest(candidates)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return manifest


def write_manifest(manifest: dict) -> None:
    manifest["updated_at"] = utc_now()
    counts: dict[str, int] = {}
    for s in manifest["studies"]:
        counts[s["acquisition_status"]] = counts.get(s["acquisition_status"], 0) + 1
    manifest["summary"] = {"total": len(manifest["studies"]), **counts}
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def provenance_stub(entry: dict) -> str:
    files = ", ".join(entry["files"]) or "(none yet)"
    urls = "\n".join(f"- {u}" for u in entry.get("resolved_urls", [])[:8]) or "- (none)"
    notes = "\n".join(f"- {n}" for n in entry.get("acquisition_notes", [])[-6:]) or "- pending acquisition"
    return f"""# {entry['title']} — Provenance (acquisition stub)

**CandidateId:** {entry['candidate_id']}
**ProposedStudyId:** {entry['proposed_study_id']}
**Domain:** {entry.get('domain')}
**Citation:** {entry.get('citation')}

> Auto-generated by acquisition-loop-expansion-wave-1.py ({entry.get('attempted_at') or 'not yet attempted'}).
> Encoding into CaseCells is deferred until Effortless loops 68–72 complete.

## Acquisition status

**Status:** {entry['acquisition_status']}

## Resolved URLs

{urls}

## Downloaded files

{files}

## Notes

{notes}
"""


def openalex_search(title: str) -> dict | None:
    q = urllib.parse.quote(title[:120])
    url = f"https://api.openalex.org/works?search={q}&per_page=1"
    try:
        status, _, body = http_get(url, accept="application/json")
        if status != 200:
            return None
        results = json.loads(body.decode("utf-8")).get("results") or []
        return results[0] if results else None
    except Exception:
        return None


def try_download_url(url: str, out_dir: Path, basename: str) -> tuple[str | None, str | None]:
    last_err: str | None = None
    for variant in url_variants(url):
        try:
            status, hdrs, body = http_get(variant)
            if status >= 400:
                last_err = f"HTTP {status} for {variant}"
                continue
            ext = guess_extension(hdrs.get("content-type", ""), variant)
            fname = f"{basename}{ext}"
            save_bytes(out_dir / fname, body)
            return fname, None
        except urllib.error.HTTPError as exc:
            last_err = f"HTTP {exc.code} for {variant}"
        except Exception as exc:
            last_err = f"{type(exc).__name__}: {exc} for {variant}"
    return None, last_err


def acquire_one(entry: dict) -> dict:
    study_id = entry["proposed_study_id"]
    out_dir = RAW_DIR / study_id
    out_dir.mkdir(parents=True, exist_ok=True)

    entry["files"] = []
    entry["resolved_urls"] = []
    entry["acquisition_notes"] = []
    entry["attempted_at"] = utc_now()

    urls: list[str] = []
    if entry.get("catalog_source_url"):
        urls.append(entry["catalog_source_url"])
    urls.extend(entry.get("plan_urls") or [])
    # dedupe preserve order
    seen: set[str] = set()
    urls = [u for u in urls if not (u in seen or seen.add(u))]

    dois = list(entry.get("plan_dois") or [])
    if not dois:
        dois = extract_dois(entry.get("citation") or "")

    # OpenAlex + Unpaywall for DOIs
    for doi in dois[:3]:
        oa = openalex_lookup(doi)
        time.sleep(RATE_LIMIT_SEC)
        if oa:
            oa_url = oa.get("doi") or f"https://doi.org/{doi}"
            entry["resolved_urls"].append(oa_url)
            entry["acquisition_notes"].append(f"OpenAlex: {oa.get('display_name', doi)[:120]}")
            oa_pdf = (oa.get("open_access") or {}).get("oa_url")
            if oa_pdf:
                entry["resolved_urls"].append(oa_pdf)
                fname, err = try_download_url(oa_pdf, out_dir, f"openalex-{doi.replace('/', '_')}")
                time.sleep(RATE_LIMIT_SEC)
                if fname:
                    entry["files"].append(fname)
                    entry["acquisition_notes"].append(f"Downloaded OpenAlex OA file for DOI {doi}")
                elif err:
                    entry["acquisition_notes"].append(err)
        pdf_url = unpaywall_pdf(doi)
        time.sleep(RATE_LIMIT_SEC)
        if pdf_url:
            entry["resolved_urls"].append(pdf_url)
            fname, err = try_download_url(pdf_url, out_dir, f"oa-{doi.replace('/', '_')}")
            time.sleep(RATE_LIMIT_SEC)
            if fname:
                entry["files"].append(fname)
                entry["acquisition_notes"].append(f"Downloaded open-access PDF via Unpaywall for DOI {doi}")
            elif err:
                entry["acquisition_notes"].append(err)

    # OpenAlex title search when DOI path did not yield files
    if not any(f.endswith((".pdf", ".csv", ".zip", ".dta", ".xlsx")) for f in entry["files"]):
        hit = openalex_search(entry.get("title") or entry.get("citation") or "")
        time.sleep(RATE_LIMIT_SEC)
        if hit:
            entry["acquisition_notes"].append(f"OpenAlex search: {hit.get('display_name', '')[:120]}")
            if hit.get("doi"):
                entry["resolved_urls"].append(hit["doi"])
            oa_pdf = (hit.get("open_access") or {}).get("oa_url")
            if oa_pdf:
                entry["resolved_urls"].append(oa_pdf)
                fname, err = try_download_url(oa_pdf, out_dir, "openalex-search")
                time.sleep(RATE_LIMIT_SEC)
                if fname:
                    entry["files"].append(fname)
                elif err:
                    entry["acquisition_notes"].append(err)
            save_bytes(out_dir / "openalex-metadata.json", json.dumps(hit, indent=2).encode("utf-8"))
            entry["files"].append("openalex-metadata.json")

    # Direct URL fetches
    for i, url in enumerate(urls[:8]):
        if url in entry["resolved_urls"]:
            continue
        entry["resolved_urls"].append(url)
        fname, err = try_download_url(url, out_dir, f"source-{i+1}")
        time.sleep(RATE_LIMIT_SEC)
        if fname:
            entry["files"].append(fname)
            size = (out_dir / fname).stat().st_size
            entry["acquisition_notes"].append(f"Fetched {url} → {fname} ({size} bytes)")
        elif err:
            entry["acquisition_notes"].append(err)

    # Classify outcome
    has_pdf = any(f.endswith(".pdf") for f in entry["files"])
    has_data = any(f.endswith((".csv", ".zip", ".dta", ".xlsx")) for f in entry["files"])
    has_html = any(f.endswith(".html") for f in entry["files"])
    has_meta = "openalex-metadata.json" in entry["files"]

    if has_pdf or has_data:
        entry["acquisition_status"] = "downloaded"
    elif entry.get("catalog_data_acquisition_status") == "manual_only" and not urls:
        entry["acquisition_status"] = "manual_only"
        entry["acquisition_notes"].append("Catalog marked manual_only; no public URL — encode from published tables.")
    elif urls and all(is_portal_url(u) for u in urls):
        entry["acquisition_status"] = "portal_manual" if has_html else "portal_manual"
        if has_html:
            entry["acquisition_notes"].append("Data portal landing page saved — manual extract required.")
        else:
            entry["acquisition_notes"].append("Data portal URL(s) recorded; fetch failed — manual registration/download required.")
    elif has_html:
        entry["acquisition_status"] = "portal_manual" if any(is_portal_url(u) for u in urls) else "landing_saved"
    elif has_meta:
        entry["acquisition_status"] = "metadata_only"
        entry["acquisition_notes"].append("OpenAlex metadata saved; no open PDF/data file retrieved.")
    elif urls:
        entry["acquisition_status"] = "blocked"
        entry["acquisition_notes"].append("URLs present but no downloadable artifact retrieved (likely paywall/login).")
    elif dois:
        entry["acquisition_status"] = "metadata_only"
        entry["acquisition_notes"].append("DOI metadata resolved but no open PDF/data file retrieved.")
    else:
        entry["acquisition_status"] = "manual_only"
        entry["acquisition_notes"].append("No URL or DOI — manual lookup from citation required.")

    # metadata sidecar
    meta = {
        "candidate_id": entry["candidate_id"],
        "proposed_study_id": study_id,
        "acquisition_status": entry["acquisition_status"],
        "attempted_at": entry["attempted_at"],
        "catalog_source_url": entry.get("catalog_source_url"),
        "resolved_urls": entry["resolved_urls"],
        "files": entry["files"],
        "dois": dois,
    }
    save_bytes(out_dir / "acquisition.json", json.dumps(meta, indent=2).encode("utf-8"))
    entry["files"].append("acquisition.json")

    prov = provenance_stub(entry)
    (out_dir / "provenance.md").write_text(prov, encoding="utf-8")
    if "provenance.md" not in entry["files"]:
        entry["files"].append("provenance.md")

    return entry


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Max studies to process this run")
    parser.add_argument("--retry-failed", action="store_true", help="Re-run blocked/failed/pending")
    parser.add_argument("--id", dest="study_id", help="Process one ProposedStudyId")
    args = parser.parse_args()

    manifest = load_or_init_manifest()
    pending_statuses = {"pending", "blocked", "failed", "metadata_only", "landing_saved"}
    if args.retry_failed:
        pending_statuses |= {"blocked", "failed", "metadata_only", "landing_saved", "portal_manual"}

    processed = 0
    for entry in manifest["studies"]:
        if args.study_id and entry["proposed_study_id"] != args.study_id:
            continue
        if entry["acquisition_status"] not in pending_statuses and not args.study_id:
            continue
        if args.limit and processed >= args.limit:
            break

        print(f"[{processed+1}] {entry['proposed_study_id']} …", flush=True)
        acquire_one(entry)
        write_manifest(manifest)
        processed += 1

    write_manifest(manifest)
    summary = manifest.get("summary", {})
    print(f"Done. Processed {processed}. Summary: {summary}")


if __name__ == "__main__":
    main()
