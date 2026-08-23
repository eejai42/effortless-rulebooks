import { useState, useEffect, useMemo } from "react";
import { makeDomainApi } from "../lib/api.js";
import { toast } from "../lib/toast.js";

// Time-travel scrubber for the active rulebook (Item 7).
//
// SHORTCUT NOTE: this v1 reads `git log` for the rulebook JSON — each
// commit is a tick. The full bitemporal vision (drag arbitrary timestamps,
// see rules fire in the past) needs per-cell history which doesn't exist
// yet. This is the honest shortcut: real history granular to commits.
//
// Props:
//   onRewind(rulebookAtSha, commit) — called when the parent should
//     swap its in-memory rulebook to a historical version. Pass `null`
//     to return to now.
//   activeSha — the commit currently being shown ('' or null = live).

export default function TimeScrubber({ onRewind, activeSha, domain }) {
  const [history, setHistory] = useState(null);
  const [busy, setBusy] = useState(false);
  const api = useMemo(() => makeDomainApi(domain), [domain]);

  useEffect(() => {
    if (!domain) return;
    let cancelled = false;
    api.get("/api/rulebook/history")
      .then((h) => { if (!cancelled) setHistory(h); })
      .catch((e) => { if (!cancelled) setHistory({ commits: [], error: e.message }); });
    return () => { cancelled = true; };
  }, [domain]);

  if (!history) return null;
  const commits = Array.isArray(history.commits) ? history.commits : [];
  if (commits.length <= 1) return null; // Nothing to scrub.

  // Ascending by time so left = older, right = newer.
  const ordered = [...commits].sort((a, b) => a.timestamp - b.timestamp);

  const pick = async (sha) => {
    if (!sha) { onRewind(null, null); return; }
    setBusy(true);
    try {
      const rb = await api.get(`/api/rulebook/at/${encodeURIComponent(sha)}`);
      const commit = commits.find((c) => c.sha === sha);
      onRewind(rb, commit || { sha });
    } catch (e) {
      toast("Could not load that revision: " + e.message, "error");
    }
    setBusy(false);
  };

  return (
    <div className="time-scrubber">
      <div className="time-scrubber-label muted small">
        Rulebook history · {commits.length} commits
      </div>
      <div className="time-scrubber-track">
        {ordered.map((c) => (
          <button
            key={c.sha}
            className={`time-scrubber-tick ${c.sha === activeSha ? "active" : ""} ${!activeSha && c === ordered[ordered.length - 1] ? "live" : ""}`}
            onClick={() => pick(c.sha)}
            title={`${formatDate(c.timestamp)} · ${c.author}\n${c.subject}`}
            disabled={busy}
          >
            <span className="time-scrubber-tick-mark" />
          </button>
        ))}
        <button
          className={`time-scrubber-now ${!activeSha ? "active" : ""}`}
          onClick={() => pick(null)}
          disabled={busy || !activeSha}
        >
          now
        </button>
      </div>
    </div>
  );
}

export function PastStateBanner({ commit, onReturn }) {
  if (!commit) return null;
  return (
    <div className="past-state-banner">
      <span className="past-state-icon">⏰</span>
      <span>
        Viewing state as of <strong>{formatDate(commit.timestamp)}</strong>
        {commit.subject && <span className="muted"> · {commit.subject}</span>}
      </span>
      <button className="btn btn-sm" onClick={onReturn}>Return to now →</button>
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  // Compact human format: "Mar 4, 2026 · 14:22"
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}
