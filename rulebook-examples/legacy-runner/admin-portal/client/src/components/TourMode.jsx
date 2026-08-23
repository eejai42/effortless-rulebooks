import { useState, useEffect, useRef } from "react";
import RichText, { RichInline } from "./RichText.jsx";
import { metaAsObject } from "../rulebookMeta.js";

// 90-second auto-narration of the reception desk.
//
// No interestingness heuristic — walks the `important: true` items the
// rulebook author already curated, in page order:
//   1. Use cases
//   2. Featured entities (summary + first three rows)
//   3. Featured rules (explanation + worked example)
//   4. Substrate witnesses
//
// One affordance, two audiences: demo button + new-developer onboarding.

const STEP_DURATION_MS = 7000; // ~13 steps to fill 90s

export default function TourMode({ rulebook, dom, onClose }) {
  const meta = metaAsObject(rulebook);
  const steps = buildSteps(rulebook, meta, dom);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length) return;
    timerRef.current = setTimeout(() => setIdx((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [idx, playing, steps.length]);

  // Close on Escape.
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (steps.length === 0) {
    return (
      <div className="tour-backdrop" onClick={onClose}>
        <div className="tour-card" onClick={(e) => e.stopPropagation()}>
          <h3>No tour available</h3>
          <p className="muted">
            This rulebook has no <code>important: true</code> entities, rules, or use cases yet. Flag a few to author a tour.
          </p>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const done = idx >= steps.length;
  const step = done ? steps[steps.length - 1] : steps[idx];
  const progress = Math.min(100, Math.round(((done ? steps.length : idx + 1) / steps.length) * 100));

  return (
    <div className="tour-backdrop" onClick={onClose}>
      <div className="tour-card" onClick={(e) => e.stopPropagation()}>
        <div className="tour-progress-bar">
          <div className="tour-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="tour-step-of">
          {Math.min(idx + 1, steps.length)} of {steps.length} · {step.kind}
        </div>
        <h2 className="tour-step-title">{step.title}</h2>
        <div className="tour-step-body">
          {step.body && <RichText text={step.body} />}
          {step.example && (
            <div className="tour-step-example">
              <span className="muted small">Worked example:</span>
              <code>{step.example}</code>
            </div>
          )}
        </div>
        <div className="tour-controls">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >← Prev</button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setPlaying((p) => !p)}
          >{playing ? "⏸ Pause" : "▶ Play"}</button>
          <button
            className="btn btn-sm"
            onClick={() => done ? onClose() : setIdx((i) => i + 1)}
          >{done ? "Done" : "Next →"}</button>
          <button className="btn btn-sm btn-ghost tour-close" onClick={onClose}>esc</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function buildSteps(rb, meta, dom) {
  const steps = [];
  if (!rb) return steps;

  // Step 0: intro.
  if (meta.tagline || dom?.displayName) {
    steps.push({
      kind: "intro",
      title: dom?.displayName || rb.Name || "This rulebook",
      body: meta.description_rich || (meta.tagline ? `*${meta.tagline}*` : null),
    });
  }

  // Use cases.
  if (Array.isArray(meta.use_cases)) {
    for (const uc of meta.use_cases) {
      steps.push({ kind: "use case", title: "What you can do here", body: uc });
    }
  }

  // Featured entities.
  for (const [name, value] of Object.entries(rb)) {
    if (name.startsWith("$") || name.startsWith("_")) continue;
    if (name === "Name" || name === "Description") continue;
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
    if (!value.important) continue;
    steps.push({
      kind: `entity · ${name}`,
      title: name,
      body: value.summary_rich || `${value.schema.length} fields · ${(value.data || []).length} rows.`,
    });
  }

  // Featured rules.
  for (const [name, value] of Object.entries(rb)) {
    if (name.startsWith("$") || name.startsWith("_")) continue;
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
    for (const f of value.schema) {
      if (!f.important) continue;
      if (!["calculated", "lookup", "aggregation"].includes(f.type)) continue;
      const example = exampleFor(value, f);
      steps.push({
        kind: `rule · ${f.type}`,
        title: `${name}.${f.name}`,
        body: f.explanation_rich || f.formula || "",
        example: example ? `${name}.${f.name} = ${example}` : null,
      });
    }
  }

  // Substrate witnesses.
  if (Array.isArray(meta.substrates)) {
    const featured = meta.substrates.filter((s) => s && s.important);
    if (featured.length > 0) {
      steps.push({
        kind: "substrates",
        title: "The same rulebook, multiple substrates",
        body: `This rulebook compiles to **${featured.length}** featured substrate${featured.length === 1 ? "" : "s"}: ${featured.map((s) => s.chip_label || s.key).join(", ")}. Each one computes the same answers — that's the conformance claim, made visible.`,
      });
    }
  }

  // Closer.
  steps.push({
    kind: "closer",
    title: "That's the tour.",
    body: "Close this card and explore the reception desk yourself. Every featured row, rule, and substrate is one click away from its source in the rulebook.",
  });

  return steps;
}

function exampleFor(entity, field) {
  if (!Array.isArray(entity.data) || entity.data.length === 0) return null;
  const row = entity.data.find((r) => r[field.name] != null && r[field.name] !== "") || entity.data[0];
  if (!row) return null;
  const v = row[field.name];
  if (v === true || v === "True" || v === "true") return "TRUE";
  if (v === false || v === "False" || v === "false") return "FALSE";
  if (typeof v === "string" && v.length > 40) return v.slice(0, 38) + "…";
  return String(v);
}
