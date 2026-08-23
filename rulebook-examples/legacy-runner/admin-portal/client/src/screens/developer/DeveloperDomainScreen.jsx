import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import RichText, { RichInline } from "../../components/RichText.jsx";
import EditableRich from "../../components/EditableRich.jsx";
import TimeScrubber, { PastStateBanner } from "../../components/TimeScrubber.jsx";
import TourMode from "../../components/TourMode.jsx";
import { api, makeDomainApi } from "../../lib/api.js";
import { metaAsObject } from "../../rulebookMeta.js";

// The reception desk for one domain.
//
// Reads only from props that already flow through usePortal():
//   - `projects` for tile-level metadata (tagline, motif, signature rows)
//   - `rulebook` for the live entity data, calculated-field schema, and
//     per-entity / per-rule importance flags
// The rulebook's project-level metadata lives in the `__meta__` table; we
// project it to a flat dictionary via `metaAsObject` so existing call sites
// can keep reading `meta.tagline`, `meta.use_cases`, etc.
// Nothing fetched here — the heavy reads already happened in usePortal().

export default function DeveloperDomainScreen({ screen, rulebook: liveRulebook, projects, me, reload, reloadDomainState }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { domain } = useParams();
  const dApi = useMemo(() => makeDomainApi(domain), [domain]);
  // Time-travel state. When `rewindCommit` is set, the page renders
  // against `rewindRulebook` instead of the live rulebook prop, and every
  // editable affordance is disabled.
  const [rewindRulebook, setRewindRulebook] = useState(null);
  const [rewindCommit, setRewindCommit] = useState(null);
  const inPast = !!rewindCommit;
  const rulebook = rewindRulebook || liveRulebook;
  const dom = (projects?.projects || []).find((p) => p.id === domain) || {};
  const meta = metaAsObject(rulebook);
  const canEdit = !!me?.role?.CanEditRulebook && !inPast;
  const onSaved = () => { if (reload) reload(); };

  // Drop the rewind when the user switches domains.
  useEffect(() => {
    setRewindRulebook(null);
    setRewindCommit(null);
  }, [domain]);

  const onRewind = (rb, commit) => {
    setRewindRulebook(rb);
    setRewindCommit(commit);
  };
  const returnToNow = () => onRewind(null, null);

  const [tourOpen, setTourOpen] = useState(false);

  // Rule glow (Item 10) — shortcut: "last fired" is the rulebook JSON's
  // most-recent commit time. We can't observe per-rule fires without a
  // runtime telemetry stream, so this is the honest approximation: the
  // entire DAG just refreshed if and only if the rulebook just changed.
  const [lastRuleFireTs, setLastRuleFireTs] = useState(null);
  useEffect(() => {
    if (!domain) return;
    let cancelled = false;
    dApi.get("/api/rulebook/history")
      .then((h) => {
        if (cancelled) return;
        const newest = (h?.commits || [])[0]?.timestamp || null;
        setLastRuleFireTs(newest);
      })
      .catch(() => { /* non-fatal */ });
    return () => { cancelled = true; };
  }, [domain]);

  // Record "I was here" — fires once per (domain, route) mount so the picker
  // chips and Welcome-back diff reflect the current visit on the next load.
  useEffect(() => {
    if (!domain) return;
    api.put("/api/portal/me/domain-state", { domain, last_route: location.pathname })
      .then(() => { if (reloadDomainState) reloadDomainState(); })
      .catch(() => { /* non-fatal */ });
  }, [domain, location.pathname]);

  const entities = entityList(rulebook);
  const important = entities.filter((e) => e.entity.important);
  const otherCount = entities.length - important.length;
  const rules = importantRules(rulebook);
  const otherRuleCount = countCalculatedFields(rulebook) - rules.length;

  const motif = dom.motif || meta.motif || "default";
  const palette = dom.motifPalette || meta.motif_palette || {};
  const heroStyle = {};
  if (palette.primary) heroStyle["--motif-primary"] = palette.primary;
  if (palette.accent)  heroStyle["--motif-accent"]  = palette.accent;
  if (palette.ink)     heroStyle["--motif-ink"]     = palette.ink;

  return (
    <div className={inPast ? "viewing-past" : ""}>
      <ScreenHeader screen={screen} />
      <PastStateBanner commit={rewindCommit} onReturn={returnToNow} />

      <section className={`reception-hero motif-${motif}`} style={heroStyle}>
        <div className="reception-hero-band">
          {dom.logoUrl && (
            <img src={dom.logoUrl} alt="" className="reception-hero-logo" />
          )}
          <div className="reception-hero-band-text">
            <div className="reception-hero-slug">{domain}</div>
            <h1 className="reception-hero-name">{dom.displayName || dom.name || rulebook?.Name || domain}</h1>
            {dom.tagline && <div className="reception-hero-tagline">{dom.tagline}</div>}
          </div>
          <div className="reception-hero-actions">
            <button className="tour-button" onClick={() => setTourOpen(true)} title="Take a 90-second tour">
              ▶ Take the tour
            </button>
            <SubstrateWitnessChips substrates={meta.substrates} domain={domain} navigate={navigate} />
          </div>
        </div>

        <div className="reception-hero-body">
          <div className="reception-hero-left">
            <EditableRich
              text={meta.description_rich}
              path={["__meta__", "description_rich"]}
              canEdit={canEdit}
              onSaved={onSaved}
              placeholder={`— no description_rich authored in __meta__ yet —`}
              className="reception-description"
            />
            <TelemetryStrip entities={entities} />
            {(meta.journal_seed || canEdit) && (
              <div className="reception-journal">
                <span className="reception-journal-marker">📖</span>
                <EditableRich
                  text={meta.journal_seed}
                  path={["__meta__", "journal_seed"]}
                  canEdit={canEdit}
                  onSaved={onSaved}
                  inline
                  placeholder="— no journal_seed authored —"
                />
              </div>
            )}
          </div>

          <div className="reception-hero-right">
            <h3 className="muted small">USE CASES</h3>
            {Array.isArray(meta.use_cases) && meta.use_cases.length > 0 ? (
              <ol className="use-case-list">
                {meta.use_cases.map((uc, i) => (
                  <li key={i}>
                    <EditableRich
                      text={uc}
                      path={["__meta__", "use_cases", i]}
                      canEdit={canEdit}
                      onSaved={onSaved}
                      inline
                      placeholder="— empty use case —"
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted small">— no use cases authored in <code>__meta__.use_cases</code> yet —</p>
            )}
          </div>
        </div>
      </section>

      {important.length === 0 ? (
        <NoImportanceFlags entities={entities} domain={domain} navigate={navigate} />
      ) : (
        important.map(({ name, entity }) => (
          <EntityScroller key={name} name={name} entity={entity} domain={domain} navigate={navigate} canEdit={canEdit} onSaved={onSaved} />
        ))
      )}

      {otherCount > 0 && (
        <div className="reception-more">
          <button className="link-like" onClick={() => navigate(`/developer/${domain}/explorer`)}>
            +{otherCount} more {otherCount === 1 ? "table" : "tables"} →
          </button>
        </div>
      )}

      <RulesPanel rules={rules} otherCount={otherRuleCount} domain={domain} navigate={navigate} canEdit={canEdit} onSaved={onSaved} lastFireTs={lastRuleFireTs} />

      <footer className="reception-footer muted small">
        <span>{entities.length} {entities.length === 1 ? "entity" : "entities"}</span>
        <span>·</span>
        <span>{countCalculatedFields(rulebook)} calculated/lookup/aggregation fields</span>
        <span>·</span>
        <button className="link-like" onClick={() => navigate(`/developer/${domain}/rulebook-json`)}>view JSON</button>
        <span>·</span>
        <button className="link-like" onClick={() => navigate(`/developer/${domain}/substrates`)}>effortless tools</button>
        <span>·</span>
        <button className="link-like" onClick={() => navigate(`/developer/${domain}/explorer`)}>open explorer</button>
      </footer>

      <TimeScrubber onRewind={onRewind} activeSha={rewindCommit?.sha || null} domain={domain} />

      {tourOpen && <TourMode rulebook={rulebook} dom={dom} onClose={() => setTourOpen(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Substrate witness chips — reads __meta__.substrates filtered by important.
// Hidden entirely when no substrate is flagged important (per §2.2).
// Click navigates to the Effortless Tools page with the substrate preselected.

function SubstrateWitnessChips({ substrates, domain, navigate }) {
  if (!Array.isArray(substrates)) return null;
  const featured = substrates.filter((s) => s && s.important);
  if (featured.length === 0) return null;
  const others = substrates.filter((s) => s && !s.important).length;
  return (
    <div className="substrate-witness-chips">
      {featured.map((s) => (
        <button
          key={s.key}
          className="substrate-chip"
          title={`${s.chip_label || s.key} — open in Effortless Tools`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/developer/${domain}/substrates?substrate=${encodeURIComponent(s.key || "")}`);
          }}
        >
          <span className="substrate-chip-dot" />
          <span className="substrate-chip-label">{s.chip_label || s.key}</span>
        </button>
      ))}
      {others > 0 && (
        <button
          className="substrate-chip substrate-chip-overflow"
          title="Open all substrates"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/developer/${domain}/substrates`);
          }}
        >
          <span>…</span>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Telemetry strip

function TelemetryStrip({ entities }) {
  if (entities.length === 0) return null;
  const parts = [];
  for (const { name, entity } of entities) {
    const n = Array.isArray(entity.data) ? entity.data.length : 0;
    parts.push(<span key={name}><strong>{n}</strong> {name.toLowerCase()}</span>);
  }
  const pending = pendingApprovalCount(entities);
  if (pending != null) {
    parts.push(<span key="pending" className="telemetry-warn"><strong>{pending}</strong> awaiting approval</span>);
  }
  // Join with middots.
  const out = [];
  parts.forEach((p, i) => {
    if (i > 0) out.push(<span key={`sep-${i}`} className="telemetry-sep">·</span>);
    out.push(p);
  });
  return <div className="telemetry-strip">{out}</div>;
}

// Detect the ACME-style "awaiting approval" pattern generically: rows in any
// entity that have BOTH an IsApproved field set to false AND a ProjectType-
// RequiresManagerApproval (or similarly-named) field set to true. Returns
// null when no such pattern can be derived — never a fake zero.
function pendingApprovalCount(entities) {
  let total = 0;
  let found = false;
  for (const { entity } of entities) {
    if (!Array.isArray(entity.data) || !Array.isArray(entity.schema)) continue;
    const hasApproved = entity.schema.some((f) => f.name === "IsApproved");
    const gateField = entity.schema.find((f) => /RequiresManagerApproval$/i.test(f.name))?.name;
    if (!hasApproved && !gateField) continue;
    found = true;
    for (const row of entity.data) {
      const approved = !!row["IsApproved"];
      const gated = gateField ? truthy(row[gateField]) : true;
      if (!approved && gated) total += 1;
    }
  }
  return found ? total : null;
}

function truthy(v) {
  if (v === true) return true;
  if (typeof v === "string") return /^(true|yes|1)$/i.test(v.trim());
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity scroller — one horizontal strip per important entity.

function EntityScroller({ name, entity, domain, navigate, canEdit, onSaved }) {
  const fields = entity.important_fields && entity.important_fields.length
    ? entity.important_fields
    : (entity.schema || []).slice(0, 3).map((f) => f.name);
  const labelField = pickLabelField(fields);
  const rows = Array.isArray(entity.data) ? entity.data : [];
  const pkField = (entity.schema || []).find((f) => /Id$/i.test(f.name))?.name;

  return (
    <section className="entity-scroller">
      <header className="entity-scroller-header">
        <h2>{name}</h2>
        {(entity.summary_rich || canEdit) && (
          <div className="entity-scroller-summary">
            <EditableRich
              text={entity.summary_rich}
              path={[name, "summary_rich"]}
              canEdit={canEdit}
              onSaved={onSaved}
              inline
              placeholder="— no summary_rich authored —"
            />
          </div>
        )}
      </header>
      {rows.length === 0 ? (
        <div className="muted small" style={{ padding: "12px 0" }}>— no rows in <code>data[]</code> —</div>
      ) : (
        <div className="entity-scroller-strip">
          {rows.map((row, i) => {
            // §2.6: instance URL ids are the entity's Name field. If a row is
            // missing Name (rulebook bug), fall back to the unscoped entity
            // list rather than minting a 404.
            const target = row.Name
              ? `/developer/${domain}/explorer/${encodeURIComponent(name)}/${encodeURIComponent(row.Name)}`
              : `/developer/${domain}/explorer/${encodeURIComponent(name)}`;
            return (
            <article key={i} className="entity-card" onClick={() => navigate(target)}>
              <header className="entity-card-name">
                {labelField ? (row[labelField] ?? "—") : (pkField ? row[pkField] : "—")}
              </header>
              <dl className="entity-card-fields">
                {fields.filter((f) => f !== labelField).map((f) => (
                  <div key={f} className="entity-card-field">
                    <dt>{f}</dt>
                    <dd>{formatValue(row[f])}</dd>
                  </div>
                ))}
              </dl>
            </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function pickLabelField(fields) {
  return (
    fields.find((f) => f === "Name") ||
    fields.find((f) => f === "FullName") ||
    fields.find((f) => /Name$/.test(f)) ||
    fields[0] ||
    null
  );
}

// Relative time formatter — "4m ago", "2h ago", "Mar 4". Used for the
// rules-panel last-fired timestamp.
function relativeTime(ts) {
  if (!ts) return "";
  const dMs = Date.now() - ts;
  if (dMs < 0) return "in the future";
  const sec = Math.floor(dMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatValue(v) {
  if (v == null || v === "") return <span className="muted">—</span>;
  if (v === true || v === "True" || v === "true") return "✓";
  if (v === false || v === "False" || v === "false") return "✗";
  if (typeof v === "string" && v.length > 64) return v.slice(0, 60) + "…";
  return String(v);
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules panel — one row per important calculated/lookup/aggregation field.

function RulesPanel({ rules, otherCount, domain, navigate, canEdit, onSaved, lastFireTs }) {
  if (rules.length === 0 && otherCount === 0) return null;
  const fresh = lastFireTs && (Date.now() - lastFireTs) < 60_000;
  return (
    <section className="rules-panel">
      <header className="rules-panel-header">
        <h2>Rules that matter</h2>
        <span className="muted small">
          {rules.length} featured · {otherCount} more in the DAG
          {lastFireTs && <> · last update {relativeTime(lastFireTs)}</>}
        </span>
      </header>
      {rules.length === 0 ? (
        <div className="muted small" style={{ padding: "8px 0" }}>
          — no rules flagged <code>important: true</code> yet —
        </div>
      ) : (
        <ul className="rules-list">
          {rules.map((r, i) => <RuleRow key={i} rule={r} canEdit={canEdit} onSaved={onSaved} fresh={fresh} lastFireTs={lastFireTs} />)}
        </ul>
      )}
      {otherCount > 0 && (
        <div className="reception-more">
          <button className="link-like" onClick={() => navigate(`/developer/${domain}/formulas`)}>
            +{otherCount} more calculated fields →
          </button>
        </div>
      )}
    </section>
  );
}

function RuleRow({ rule, canEdit, onSaved, fresh, lastFireTs }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={`rule-row ${open ? "open" : ""} ${fresh ? "rule-row-fresh" : ""}`}>
      <button className="rule-row-summary" onClick={() => setOpen((o) => !o)}>
        <span className="rule-row-type">{rule.field.type}</span>
        <span className="rule-row-path"><code>{rule.entity}.{rule.field.name}</code></span>
        {lastFireTs && <span className="muted small rule-row-fired">last fired {relativeTime(lastFireTs)}</span>}
        <span className="muted small rule-row-chev">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="rule-row-body">
          <EditableRich
            text={rule.field.explanation_rich}
            path={[rule.entity, "schema", rule.schemaIndex, "explanation_rich"]}
            canEdit={canEdit}
            onSaved={onSaved}
            placeholder="— no explanation_rich authored —"
          />
          <pre className="rule-row-formula">{rule.field.formula}</pre>
          {rule.example && (
            <div className="rule-row-example">
              <div className="muted small">Worked example on <code>{rule.example.pk}</code>:</div>
              <div className="rule-row-example-value">
                <strong>{rule.entity}.{rule.field.name}</strong> = {formatValue(rule.example.value)}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// No-importance fallback (the page still has to render for un-curated domains).

function NoImportanceFlags({ entities, domain, navigate }) {
  return (
    <section className="reception-empty">
      <p className="muted">
        No entity in this rulebook has <code>important: true</code> yet. Flag one on the
        entity itself to feature it here.
      </p>
      <div className="domain-gallery" style={{ marginTop: 12 }}>
        {entities.map(({ name, entity }) => (
          <div key={name} className="card clickable" onClick={() => navigate(`/developer/${domain}/explorer`)}>
            <h3>{name}</h3>
            <div className="sub">{Array.isArray(entity.data) ? entity.data.length : 0} rows</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers — pull from rulebook structure only.

function entityList(rb) {
  if (!rb) return [];
  const out = [];
  for (const [name, value] of Object.entries(rb)) {
    if (name.startsWith("$") || name.startsWith("_")) continue;
    if (name === "Name" || name === "Description") continue;
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
    out.push({ name, entity: value });
  }
  return out;
}

function countCalculatedFields(rb) {
  let n = 0;
  for (const { entity } of entityList(rb)) {
    for (const f of entity.schema) {
      if (["calculated", "lookup", "aggregation"].includes(f.type)) n += 1;
    }
  }
  return n;
}

function importantRules(rb) {
  const out = [];
  for (const { name, entity } of entityList(rb)) {
    for (let i = 0; i < entity.schema.length; i++) {
      const f = entity.schema[i];
      if (!f.important) continue;
      if (!["calculated", "lookup", "aggregation"].includes(f.type)) continue;
      let example = null;
      if (Array.isArray(entity.data) && entity.data.length > 0) {
        const pkField = entity.schema.find((s) => /Id$/i.test(s.name))?.name;
        const row = entity.data.find((r) => r[f.name] != null && r[f.name] !== "") || entity.data[0];
        if (row) {
          example = {
            pk: pkField ? row[pkField] : "row-0",
            value: row[f.name],
          };
        }
      }
      out.push({ entity: name, field: f, schemaIndex: i, example });
    }
  }
  return out;
}
