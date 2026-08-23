import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Global Cmd-K / Ctrl-K command palette.
//
// Indexes the active rulebook on every keystroke (cheap — the rulebook is
// already in memory). Match order:
//   1. Entities flagged `important: true`
//   2. Rules flagged `important: true`
//   3. Other entities
//   4. Rows of important entities (matched by ANY field's text content)
//   5. Domain switches (jump to a different domain)
//   6. Other rules
//
// Cmd-K cycles open/close; Escape closes; Up/Down cycles selection;
// Enter triggers the selected match.

const MAX_RESULTS = 30;

export default function CommandPalette({ rulebook, projects, activeDomain }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Global keybind.
  useEffect(() => {
    const handler = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (open && e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    if (open) setIdx(0);
  }, [open]);

  const index = useMemo(() => buildIndex(rulebook, projects, activeDomain), [rulebook, projects, activeDomain]);
  const results = useMemo(() => search(index, q), [index, q]);

  useEffect(() => { setIdx(0); }, [q]);

  const choose = (r) => {
    if (!r) return;
    setOpen(false);
    if (r.action) r.action(navigate);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(results[idx]); }
  };

  if (!open) return null;

  return (
    <div className="cmdk-backdrop" onClick={() => setOpen(false)}>
      <div className="cmdk-modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmdk-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search entities, rules, rows, domains…   (⌘K)"
          spellCheck={false}
        />
        <ul className="cmdk-list">
          {results.length === 0 ? (
            <li className="cmdk-empty muted small">No matches.</li>
          ) : results.map((r, i) => (
            <li
              key={r.id}
              className={`cmdk-item ${i === idx ? "selected" : ""}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => choose(r)}
            >
              <span className={`cmdk-kind ${r.kind}`}>{r.kindLabel}</span>
              <span className="cmdk-title">{r.title}</span>
              {r.subtitle && <span className="cmdk-subtitle muted small">{r.subtitle}</span>}
            </li>
          ))}
        </ul>
        <div className="cmdk-foot muted small">
          ↑↓ cycle · ↵ open · esc close
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function buildIndex(rb, projects, activeDomain) {
  const items = [];
  let nextId = 0;
  const mkId = () => `cmd-${nextId++}`;

  // Domain switches (from projects list).
  const domains = (projects?.projects || []).filter((d) => d.id && d.id !== activeDomain);
  for (const d of domains) {
    items.push({
      id: mkId(),
      kind: "domain",
      kindLabel: "domain",
      title: d.displayName || d.name || d.id,
      subtitle: d.id === "__top__" ? "platform (top-level)" : d.tagline || d.id,
      haystack: [d.id, d.displayName, d.name, d.tagline].filter(Boolean).join(" ").toLowerCase(),
      priority: 60,
      action: (nav) => nav(d.id === "__top__" ? `/developer/${d.id}` : `/developer/${d.id}`),
    });
  }

  if (!rb || typeof rb !== "object") return items;

  // Entities + rules + rows from the active rulebook.
  for (const [name, value] of Object.entries(rb)) {
    if (name.startsWith("$") || name.startsWith("_")) continue;
    if (name === "Name" || name === "Description") continue;
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;

    const important = !!value.important;
    items.push({
      id: mkId(),
      kind: "entity",
      kindLabel: important ? "entity ★" : "entity",
      title: name,
      subtitle: value.summary_rich ? trimRich(value.summary_rich, 80) : `${value.schema.length} fields · ${(value.data || []).length} rows`,
      haystack: `${name} ${value.summary_rich || ""}`.toLowerCase(),
      priority: important ? 90 : 50,
      action: (nav) => nav(`/developer/${activeDomain}/explorer/${encodeURIComponent(name)}`),
    });

    for (const f of value.schema) {
      if (!["calculated", "lookup", "aggregation"].includes(f.type)) continue;
      const ruleImportant = !!f.important;
      items.push({
        id: mkId(),
        kind: "rule",
        kindLabel: ruleImportant ? `${f.type} ★` : f.type,
        title: `${name}.${f.name}`,
        subtitle: f.explanation_rich ? trimRich(f.explanation_rich, 80) : (f.formula || ""),
        haystack: `${name} ${f.name} ${f.formula || ""} ${f.explanation_rich || ""}`.toLowerCase(),
        priority: ruleImportant ? 80 : 30,
        action: (nav) => nav(`/developer/${activeDomain}/formulas`),
      });
    }

    // Index rows of important entities only — keeps the index from
    // exploding on rulebooks with thousands of rows in tangential tables.
    if (important && Array.isArray(value.data)) {
      const pkField = value.schema.find((s) => /Id$/i.test(s.name))?.name;
      const labelField = (value.important_fields || []).find((fn) => /Name$/.test(fn) || fn === "Name" || fn === "FullName")
        || (value.important_fields || [])[0]
        || pkField
        || null;
      for (const row of value.data) {
        const pk = pkField ? row[pkField] : null;
        const title = labelField ? (row[labelField] ?? pk ?? "(row)") : (pk ?? "(row)");
        const haystack = Object.values(row).filter((v) => typeof v === "string" || typeof v === "number").join(" ").toLowerCase();
        // §2.6: deep-link to the exact node using the row's Name. Falls
        // back to the entity's unscoped list when Name is absent.
        const deepLink = row.Name
          ? `/developer/${activeDomain}/explorer/${encodeURIComponent(name)}/${encodeURIComponent(row.Name)}`
          : `/developer/${activeDomain}/explorer/${encodeURIComponent(name)}`;
        items.push({
          id: mkId(),
          kind: "row",
          kindLabel: name,
          title: String(title),
          subtitle: pk && pk !== title ? String(pk) : null,
          haystack,
          priority: 70,
          action: (nav) => nav(deepLink),
        });
      }
    }
  }

  return items;
}

function trimRich(s, n) {
  // Strip the few inline markdown markers we support so the subtitle reads cleanly.
  const stripped = String(s).replace(/\*\*|\*|`/g, "");
  return stripped.length > n ? stripped.slice(0, n - 1) + "…" : stripped;
}

function search(items, q) {
  const query = (q || "").trim().toLowerCase();
  if (!query) {
    // Empty query — show high-priority items first (featured entities, rules,
    // last-visited domains) up to MAX_RESULTS.
    return [...items].sort((a, b) => b.priority - a.priority).slice(0, MAX_RESULTS);
  }
  const terms = query.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const it of items) {
    let score = 0;
    let allMatch = true;
    for (const t of terms) {
      if (!it.haystack.includes(t)) { allMatch = false; break; }
      // Title-prefix matches score higher.
      if (it.title.toLowerCase().startsWith(t)) score += 50;
      else if (it.title.toLowerCase().includes(t)) score += 25;
      else score += 5;
    }
    if (!allMatch) continue;
    score += it.priority;
    scored.push({ ...it, _score: score });
  }
  scored.sort((a, b) => b._score - a._score);
  return scored.slice(0, MAX_RESULTS);
}
