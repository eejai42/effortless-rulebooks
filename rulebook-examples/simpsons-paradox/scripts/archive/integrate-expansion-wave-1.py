#!/usr/bin/env python3
"""Full metadata integration for expansion-wave-1 out-of-band work.

Merges acquisition manifest + PDF table extraction into CandidateStudyCatalog,
refreshes expansion-wave-1-ready-queue.json, and leaves Studies/CaseCells
unchanged (encode waves are separate Effortless loops).

Usage:
  python3 scripts/integrate-expansion-wave-1.py
"""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RULEBOOK = ROOT / "effortless-rulebook" / "simpsons-paradox-rulebook.json"
ACQ_MANIFEST = ROOT / "data" / "acquisition" / "expansion-wave-1-manifest.json"
PDF_MANIFEST = ROOT / "data" / "extraction" / "pdf-table-extraction-manifest.json"
READY_QUEUE = ROOT / "data" / "acquisition" / "expansion-wave-1-ready-queue.json"

ACQ_NOTE_PREFIX = "Acquisition side-loop:"
PDF_NOTE_PREFIX = "PDF side-loop:"

STATUS_MAP = {
    "downloaded": "downloaded",
    "portal_manual": "manual_only",
    "landing_saved": "manual_only",
    "metadata_only": "manual_only",
    "manual_only": "manual_only",
    "blocked": "blocked",
}


def compact_json(obj: dict) -> str:
    lines = ["{"]
    top_keys = list(obj.keys())
    for ki, key in enumerate(top_keys):
        val = obj[key]
        trail = "," if ki < len(top_keys) - 1 else ""
        if isinstance(val, dict) and "data" in val:
            head = json.dumps({k: v for k, v in val.items() if k != "data"}, indent=2, ensure_ascii=False)
            if head.endswith("\n}"):
                head = head[:-2]
            elif head.endswith("}"):
                head = head[:-1]
            data_rows = ",\n".join("      " + json.dumps(r, ensure_ascii=False) for r in val["data"])
            block = f'  "{key}": {head},\n    "data": [\n{data_rows}\n    ]\n  }}'
            lines.append(block + trail)
        else:
            chunk = json.dumps(val, indent=2, ensure_ascii=False)
            lines.append(f'  "{key}": {chunk}{trail}')
    lines.append("}")
    return "\n".join(lines) + "\n"


def merge_note(existing: str, prefix: str, new_part: str) -> str:
    if prefix in existing:
        before = existing.split(prefix)[0].rstrip(" |")
        return f"{before} | {new_part}" if before else new_part
    return f"{existing} | {new_part}" if existing else new_part


def merge_acquisition(rb: dict, manifest: dict) -> int:
    by_candidate = {s["candidate_id"]: s for s in manifest["studies"]}
    updated = 0
    for row in rb["CandidateStudyCatalog"]["data"]:
        entry = by_candidate.get(row["CandidateId"])
        if not entry:
            continue
        study_id = entry["proposed_study_id"]
        acq_status = entry["acquisition_status"]
        mapped = STATUS_MAP.get(acq_status)
        if not mapped:
            raise SystemExit(f"Unknown acquisition_status {acq_status!r} for {row['CandidateId']}")

        files = entry.get("files") or []
        file_hint = ", ".join(files[:4])
        if len(files) > 4:
            file_hint += f", +{len(files) - 4} more"
        acq_note = (
            f"{ACQ_NOTE_PREFIX} {acq_status} → catalog `{mapped}`; "
            f"raw=`data/raw/{study_id}/`"
            + (f"; files=[{file_hint}]" if file_hint else "")
        )

        changed = False
        # Do not downgrade rows that already have verified PDF manuscripts.
        if PDF_NOTE_PREFIX not in (row.get("DataSourceNote") or ""):
            if row.get("DataAcquisitionStatus") != mapped:
                row["DataAcquisitionStatus"] = mapped
                changed = True

        new_note = merge_note(row.get("DataSourceNote") or "", ACQ_NOTE_PREFIX, acq_note)
        if row.get("DataSourceNote") != new_note:
            row["DataSourceNote"] = new_note
            changed = True

        if changed:
            updated += 1
    return updated


def merge_pdf(rb: dict, manifest: dict) -> int:
    by_study = {s["study_id"]: s for s in manifest.get("studies", [])}
    updated = 0
    raw = ROOT / "data" / "raw"
    for row in rb["CandidateStudyCatalog"]["data"]:
        study_id = row.get("ProposedStudyId")
        entry = by_study.get(study_id)
        if not entry:
            continue
        extract_path = raw / study_id / "table-extract.json"
        if not extract_path.exists():
            continue
        extract = json.loads(extract_path.read_text(encoding="utf-8"))
        source_url = entry.get("manuscript_source_url") or extract.get("manuscript_source_url", "")
        table_count = entry.get("table_count") or len(extract.get("tables") or [])
        pdf_note = (
            f"{PDF_NOTE_PREFIX} verified manuscript PDF; "
            f"{table_count} table(s) in `data/raw/{study_id}/table-extract.json`"
            + (f"; manuscript={source_url}" if source_url else "")
        )
        changed = False
        if row.get("DataAcquisitionStatus") != "downloaded":
            row["DataAcquisitionStatus"] = "downloaded"
            changed = True
        new_note = merge_note(row.get("DataSourceNote") or "", PDF_NOTE_PREFIX, pdf_note)
        if row.get("DataSourceNote") != new_note:
            row["DataSourceNote"] = new_note
            changed = True
        if source_url and row.get("SourceUrl") != source_url:
            row["SourceUrl"] = source_url
            changed = True
        if changed:
            updated += 1
    return updated


def refresh_ready_queue(rb: dict, manifest: dict) -> None:
    catalog_by_study = {r["ProposedStudyId"]: r for r in rb["CandidateStudyCatalog"]["data"]}
    totals: dict[str, int] = {}
    by_status: dict[str, list] = {}
    encode_ready: list[str] = []

    for entry in manifest["studies"]:
        status = entry["acquisition_status"]
        totals[status] = totals.get(status, 0) + 1
        by_status.setdefault(status, []).append(
            {
                "proposed_study_id": entry["proposed_study_id"],
                "candidate_id": entry["candidate_id"],
                "title": entry.get("title"),
                "domain": entry.get("domain"),
                "catalog_ingestion_status": catalog_by_study.get(entry["proposed_study_id"], {}).get(
                    "IngestionStatus"
                ),
            }
        )
        cat = catalog_by_study.get(entry["proposed_study_id"])
        if not cat:
            continue
        if cat.get("IngestionStatus") != "candidate":
            continue
        if cat.get("DataAcquisitionStatus") == "downloaded":
            encode_ready.append(entry["proposed_study_id"])
        elif entry["acquisition_status"] == "downloaded":
            encode_ready.append(entry["proposed_study_id"])

    payload = {
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "channel": "out-of-band",
        "integrated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "note": "Refreshed from rulebook + acquisition manifest after integrate-expansion-wave-1.py",
        "totals": totals,
        "encode_ready_now": sorted(encode_ready),
        "by_status": by_status,
    }
    READY_QUEUE.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    if not ACQ_MANIFEST.exists():
        raise SystemExit(f"Missing {ACQ_MANIFEST}")
    if not PDF_MANIFEST.exists():
        raise SystemExit(f"Missing {PDF_MANIFEST}")

    acq_manifest = json.loads(ACQ_MANIFEST.read_text(encoding="utf-8"))
    pdf_manifest = json.loads(PDF_MANIFEST.read_text(encoding="utf-8"))
    rb = json.loads(RULEBOOK.read_text(encoding="utf-8"))

    acq_updated = merge_acquisition(rb, acq_manifest)
    pdf_updated = merge_pdf(rb, pdf_manifest)
    RULEBOOK.write_text(compact_json(rb), encoding="utf-8")

    refresh_ready_queue(rb, acq_manifest)

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    acq_manifest["merged_at"] = now
    acq_manifest["note"] = "Integrated into CandidateStudyCatalog via integrate-expansion-wave-1.py"
    ACQ_MANIFEST.write_text(json.dumps(acq_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    pdf_manifest["merged_at"] = now
    pdf_manifest["merge_note"] = (
        "Integrated into CandidateStudyCatalog via integrate-expansion-wave-1.py"
    )
    PDF_MANIFEST.write_text(json.dumps(pdf_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    catalog = rb["CandidateStudyCatalog"]["data"]
    exp1 = [r for r in catalog if r.get("ExpansionWave") == "expansion-wave-1"]
    print(f"Acquisition notes updated/merged: {acq_updated} catalog rows")
    print(f"PDF extraction merged: {pdf_updated} catalog rows")
    print(f"CandidateStudyCatalog: {len(catalog)} total, {len(exp1)} expansion-wave-1")
    print(
        f"Ingestion: imported={sum(1 for r in catalog if r['IngestionStatus']=='imported')}, "
        f"candidate={sum(1 for r in catalog if r['IngestionStatus']=='candidate')}"
    )
    print(
        f"DataAcquisition: downloaded={sum(1 for r in catalog if r.get('DataAcquisitionStatus')=='downloaded')}, "
        f"manual_only={sum(1 for r in catalog if r.get('DataAcquisitionStatus')=='manual_only')}"
    )
    print(f"Ready queue: {READY_QUEUE} ({len(json.loads(READY_QUEUE.read_text())['encode_ready_now'])} encode-ready candidates)")


if __name__ == "__main__":
    main()
