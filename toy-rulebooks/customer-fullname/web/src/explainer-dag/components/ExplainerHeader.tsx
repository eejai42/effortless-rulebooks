// Shared top bar for every explainer page (tables index, table page, field DAG).
//
//   ← back   🏠 Home   · Tables ›                              ⚙︎
//
// • Home leaves the exploration entirely and returns to the host app's original
//   page (routing.onHome) — the point you were trying to understand. Back walks
//   the navigation history one step.
// • The gear (top-right) opens a popup of SIX independent on/off toggles —
//   RuleSpeak®, English, Formulas, Description, Inputs, Consumers. Any combination
//   can be on at once (unlike the old exclusive slider). Each choice is remembered
//   in localStorage and applied on every page. This is the React twin of the gear
//   in rulebook-to-rulespeak's HtmlRenderer, so both tools present identically.

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  useOnBack,
  useOnHome,
  useTableLink,
  useNavigateTable,
} from "../lib/routingContext.tsx";
import {
  DOC_ELEMENTS,
  useDocElements,
  setDocElement,
  resetDocElements,
} from "../lib/dagPrefs.ts";

// A breadcrumb entry. A plain string is shown as static text; { table } links to
// that table's page; { index: true } links to the tables index (/dag).
export interface CrumbTable { table: string; }
export interface CrumbIndex { index: true; label?: string; }
export type Crumb = string | CrumbTable | CrumbIndex;

export function ExplainerHeader({
  crumbs,
  showOptions = true,
  // Back-compat alias: callers that still pass `showNarration` keep working.
  showNarration,
}: {
  crumbs?: Crumb[];
  showOptions?: boolean;
  showNarration?: boolean;
}): JSX.Element {
  const onBack = useOnBack();
  const onHome = useOnHome();
  const TableLink = useTableLink();
  const navigateTable = useNavigateTable();
  const showGear = showNarration ?? showOptions;

  return (
    <div className="dag-topbar">
      <div className="dag-nav-left">
        <button type="button" className="dag-back" onClick={() => onBack()} title="Go back one step">
          ← back
        </button>
        <button type="button" className="dag-home" onClick={() => onHome()} title="Leave the explainer — back to the app">
          🏠 Home
        </button>
        {crumbs && crumbs.length > 0 && (
          <span className="dag-crumb-trail">
            <span className="dag-crumb-sep">·</span>
            {crumbs.map((c, i) => {
              const sep = i > 0 ? <span key={`s${i}`} className="dag-crumb-sep">›</span> : null;
              let body: ReactNode;
              if (typeof c === "string") {
                body = <span className="dag-crumb-text">{c}</span>;
              } else if ("index" in c) {
                // Link to the tables index. navigateTable("") is the index route
                // (the host maps an empty table to /dag); fall back to a hash link.
                body = (
                  <a
                    href="#/dag"
                    className="dag-crumb-index-link"
                    onClick={(e) => { e.preventDefault(); navigateTable(""); }}
                  >
                    {c.label ?? "Tables"}
                  </a>
                );
              } else {
                body = (
                  <TableLink table={c.table} className="dag-crumb-table-link">
                    {c.table}
                  </TableLink>
                );
              }
              return <span key={`c${i}`}>{sep}{body}</span>;
            })}
          </span>
        )}
      </div>
      {showGear && <DocOptionsGear />}
    </div>
  );
}

// The gear: a ⚙︎ button that opens a popup of independent doc-element checkboxes,
// each persisted via dagPrefs and reflected as a `show-<key>` class on every page.
export function DocOptionsGear(): JSX.Element {
  const state = useDocElements();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="dag-gear-wrap" ref={rootRef}>
      <button
        type="button"
        className="dag-gear"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Documentation options"
        aria-label="Documentation options"
        onClick={() => setOpen((o) => !o)}
      >
        ⚙︎
      </button>
      {open && (
        <div className="dag-gear-pop" role="dialog" aria-label="Documentation options">
          <p className="dag-gear-pop-title">Show on this page</p>
          {DOC_ELEMENTS.map((e) => (
            <label key={e.key} className="dag-gear-opt" title={e.hint}>
              <input
                type="checkbox"
                checked={state[e.key]}
                onChange={(ev) => setDocElement(e.key, ev.target.checked)}
              />
              <span className="dag-gear-opt-label">{e.label}</span>
              <span className="dag-gear-opt-hint">{e.hint}</span>
            </label>
          ))}
          <button type="button" className="dag-gear-reset" onClick={() => resetDocElements()}>
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}

// Convenience wrapper so pages can place arbitrary content beneath the bar.
export function ExplainerPage({
  crumbs,
  showOptions,
  children,
}: {
  crumbs?: (string | CrumbTable)[];
  showOptions?: boolean;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="dag-page">
      <ExplainerHeader crumbs={crumbs} showOptions={showOptions} />
      {children}
    </div>
  );
}
