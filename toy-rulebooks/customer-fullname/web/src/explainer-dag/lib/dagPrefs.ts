// Persistent UI prefs for the DAG explorer (localStorage). One source of
// truth so DagCell and DagToggle stay in sync via a custom event.

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "dag.glyphsOn";
const EVENT = "dag-prefs-changed";

// Default: OFF. Provenance is opt-in via the DagToggle so the host app
// looks like a normal admin UI by default; double-click on any DagCell
// still navigates to the field's DAG page regardless of this setting.
function getGlyphsOnFromStorage(): boolean {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === null) return false;
  return v === "1";
}

export function setGlyphsOn(on: boolean): void {
  localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  // Also react to storage events from other tabs.
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useGlyphsOn(): boolean {
  return useSyncExternalStore(subscribe, getGlyphsOnFromStorage, () => true);
}

// ── Narration mode ──────────────────────────────────────────────────────────
// How a derived field's rule is explained — a GLOBAL three-way choice, remembered
// in localStorage and shared across every cell/page via the same custom event:
//   "rulespeak" — the declarative business rule ("… only if …", priority lists,
//                 "must / must not")  ·  the default, the headline view
//   "english"   — the formula read as a literal English sentence ("True when …")
//   "formula"   — the raw Excel formula with clickable chips
// In all three, referenced fields stay clickable so you can drill into the DAG.

export type NarrationMode = "rulespeak" | "english" | "formula";

const MODE_KEY = "dag.narrationMode";
const MODES: NarrationMode[] = ["rulespeak", "english", "formula"];
const DEFAULT_MODE: NarrationMode = "rulespeak";

function getNarrationModeFromStorage(): NarrationMode {
  const v = localStorage.getItem(MODE_KEY) as NarrationMode | null;
  // Migrate the old 2-value pref: a stored "formula" stays formula; anything else
  // (incl. the legacy default of an absent key) lands on the new default.
  return v && MODES.includes(v) ? v : DEFAULT_MODE;
}

// ⚠️ DEPRECATED — the exclusive RuleSpeak®/English/Formula slider. Superseded by the
// six independent DOC_ELEMENTS toggles below (the gear). Still exported so any host
// importing it keeps compiling, but the explainer pages no longer use it.
export function setNarrationMode(mode: NarrationMode): void {
  localStorage.setItem(MODE_KEY, mode);
  window.dispatchEvent(new Event(EVENT));
}

export function useNarrationMode(): NarrationMode {
  return useSyncExternalStore(subscribe, getNarrationModeFromStorage, () => DEFAULT_MODE);
}

export const NARRATION_MODES = MODES;

// ── Document elements — the gear's six independent toggles ───────────────────
// Each part of a field's documentation is its own on/off switch (not a single
// exclusive mode): RuleSpeak®, English, Formula, Description, Inputs, Consumers.
// Any combination can be on at once — a field can show all three narrations
// stacked, or just one. This is the React twin of rulebook-to-rulespeak's
// HtmlRenderer `DocElements` (same keys, same defaults), so the React explainer
// and the static RuleSpeak® HTML present identically.
//
// Each is remembered as `dag.show.<key>` = '1' | '0' in localStorage and applied
// as a `show-<key>` class on the page container; CSS (dag.css) reveals the
// matching `.elem-<key>` blocks. Reads are synchronous, so the very first render
// already has the right classes (no flash of the wrong sections on reload).

export type DocElementKey =
  | "rulespeak" | "english" | "formula" | "desc" | "inputs" | "consumers";

export interface DocElement {
  key: DocElementKey;
  label: string;
  hint: string;
  default: boolean;
}

// Single source of truth — drives the checkboxes, the storage keys, and the CSS
// classes, so they can never drift apart. Mirrors HtmlRenderer.DocElements.
export const DOC_ELEMENTS: readonly DocElement[] = [
  { key: "rulespeak", label: "RuleSpeak®",          hint: "The declarative business rule (only if / must / priority)",    default: true  },
  { key: "english",   label: "English",            hint: "The formula read aloud as a plain-English sentence",           default: false },
  { key: "formula",   label: "Formulas",           hint: "The raw =expression, with clickable field chips",              default: false },
  { key: "desc",      label: "Description",        hint: "The author's narrative comment on a field, when present",      default: true  },
  { key: "inputs",    label: "Links to inputs",    hint: "The fields each rule reads (its DAG inputs / upstream)",       default: true  },
  { key: "consumers", label: "Links to consumers", hint: "The rules that read this one (its DAG consumers / downstream)", default: false },
];

const DOC_DEFAULTS: Record<DocElementKey, boolean> = DOC_ELEMENTS.reduce(
  (acc, e) => { acc[e.key] = e.default; return acc; },
  {} as Record<DocElementKey, boolean>,
);

function docKey(key: DocElementKey): string {
  return "dag.show." + key;
}

function getDocElementFromStorage(key: DocElementKey): boolean {
  const v = localStorage.getItem(docKey(key));
  if (v === "1") return true;
  if (v === "0") return false;
  return DOC_DEFAULTS[key];
}

export function setDocElement(key: DocElementKey, on: boolean): void {
  localStorage.setItem(docKey(key), on ? "1" : "0");
  window.dispatchEvent(new Event(EVENT));
}

export function resetDocElements(): void {
  for (const e of DOC_ELEMENTS) localStorage.setItem(docKey(e.key), e.default ? "1" : "0");
  window.dispatchEvent(new Event(EVENT));
}

export function useDocElement(key: DocElementKey): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getDocElementFromStorage(key),
    () => DOC_DEFAULTS[key],
  );
}

// The whole on/off map, for the gear popup (one render, all checkboxes in sync).
export type DocElementState = Record<DocElementKey, boolean>;

function readDocStateRaw(): DocElementState {
  const s = {} as DocElementState;
  for (const e of DOC_ELEMENTS) s[e.key] = getDocElementFromStorage(e.key);
  return s;
}

// Cache the snapshot object so useSyncExternalStore sees a stable reference until
// a pref actually changes — otherwise it loops (a fresh object every render reads
// as "changed"). We rebuild only when the serialized state differs.
let docStateCache: DocElementState = readDocStateRaw();
let docStateKey = JSON.stringify(docStateCache);
function getDocStateSnapshot(): DocElementState {
  const next = readDocStateRaw();
  const nextKey = JSON.stringify(next);
  if (nextKey !== docStateKey) {
    docStateCache = next;
    docStateKey = nextKey;
  }
  return docStateCache;
}

export function useDocElements(): DocElementState {
  return useSyncExternalStore(subscribe, getDocStateSnapshot, () => ({ ...DOC_DEFAULTS }));
}

// The `show-<key>` classes for the enabled elements, e.g. "show-rulespeak show-desc
// show-inputs". Pages spread this onto their root `.dag-page` div so the CSS can
// gate every `.elem-<key>` block. Computed synchronously from storage → correct on
// the first paint.
export function docElementClasses(state?: DocElementState): string {
  const s = state ?? readDocStateRaw();
  return DOC_ELEMENTS.filter((e) => s[e.key]).map((e) => "show-" + e.key).join(" ");
}

export function useDocElementClasses(): string {
  const state = useDocElements();
  return docElementClasses(state);
}
