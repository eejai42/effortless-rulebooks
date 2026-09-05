import { Link } from "react-router-dom";
import { ApiError } from "./api.js";

export function Loading({ what = "data" }) {
  return <p className="muted">Loading {what} from the generated API…</p>;
}

export function ErrorPanel({ error, what }) {
  const detail = error instanceof ApiError && error.table ? `Table: ${error.table}` : null;
  return (
    <div className="panel error" role="alert">
      <h3>Could not load {what || "this page"}</h3>
      <p>{error.message}</p>
      {detail && <p className="muted">{detail}</p>}
      <p className="muted">
        The explorer reads only from the generated view-backed API on port 42441. If it is not
        running, start the root with <code>./start.sh</code> from the repository root.
      </p>
    </div>
  );
}

export function Async({ state, what, children }) {
  if (state.status === "loading") return <Loading what={what} />;
  if (state.status === "error") return <ErrorPanel error={state.error} what={what} />;
  return children(state.data);
}

const TONE = {
  // readiness / states
  "example-ready": "good",
  "root-ready": "good",
  toy: "info",
  "example-incomplete": "warn",
  "intentional-exception": "neutral",
  accepted: "good",
  done: "good",
  fixed: "good",
  built: "good",
  shippable: "good",
  clean: "good",
  satisfied: "good",
  complete: "good",
  live: "good",
  healthy: "good",
  "in-flight": "info",
  "in-progress": "info",
  partial: "info",
  planned: "info",
  "plan-only": "info",
  open: "warn",
  "not-started": "neutral",
  todo: "neutral",
  misparented: "bad",
  blocked: "bad",
  deprecated: "bad",
  P1: "bad",
  P2: "warn",
  P3: "info",
  critical: "bad",
  high: "warn",
  medium: "info",
  low: "neutral",
};

export function Pill({ value, tone }) {
  if (value === null || value === undefined || value === "") return <span className="pill neutral">—</span>;
  const text = typeof value === "boolean" ? (value ? "yes" : "no") : String(value);
  const t = tone || TONE[text] || (typeof value === "boolean" ? (value ? "good" : "neutral") : "neutral");
  return <span className={`pill ${t}`}>{text}</span>;
}

export function Stat({ label, value, hint, to }) {
  const body = (
    <>
      <span className="stat-value">{value ?? "—"}</span>
      <span className="stat-label">{label}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </>
  );
  return to ? (
    <Link className="stat" to={to}>
      {body}
    </Link>
  ) : (
    <div className="stat">{body}</div>
  );
}

export function Panel({ title, eyebrow, children, actions }) {
  return (
    <section className="panel">
      {(title || eyebrow) && (
        <header className="panel-head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

// Generic responsive table. `columns`: [{key, label, render?, width?}].
export function DataTable({ rows, columns, rowKey, empty = "No rows." }) {
  if (!rows.length) return <p className="muted">{empty}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label}>
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Definition({ items }) {
  return (
    <dl className="deflist">
      {items
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v === null || v === "" ? <span className="muted">—</span> : v}</dd>
          </div>
        ))}
    </dl>
  );
}

export function Progress({ percent }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <span className="progress" title={`${p}%`}>
      <span style={{ width: `${p}%` }} />
    </span>
  );
}

export function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children ?? href}
    </a>
  );
}
