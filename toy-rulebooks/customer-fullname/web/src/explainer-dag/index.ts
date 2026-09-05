// Public barrel for the explainer-dag module.

export { FieldDag } from "./pages/FieldDag.tsx";
export type {
  FieldDagProps,
  ExplainerDagRouting,
  FieldLinkProps,
} from "./pages/FieldDag.tsx";

// Ontology navigation pages: the tables index (/dag) and a single table's
// columns (/dag/:table). Both take the same optional `routing` prop as FieldDag.
export { TablesIndex } from "./pages/TablesIndex.tsx";
export type { TablesIndexProps } from "./pages/TablesIndex.tsx";
export { TablePage } from "./pages/TablePage.tsx";
export type { TablePageProps } from "./pages/TablePage.tsx";

export {
  resolveDag,
  listTablesAndFields,
  listTables,
  tableColumns,
  tableDescription,
  tableExists,
} from "./lib/dagResolver.ts";
export type {
  DagResponse,
  FieldNode,
  FieldRef,
  FieldType,
  RawField,
} from "./lib/types.ts";
export type { TableSummary } from "./lib/dagResolver.ts";

// Shared top bar (Home + back + the gear popup of doc-element toggles) — exported
// so a host can reuse it above its own explainer surfaces if desired.
export { ExplainerHeader, DocOptionsGear, ExplainerPage } from "./components/ExplainerHeader.tsx";

export { rulebook } from "./embedded-rulebook.ts";
export type { Rulebook } from "./embedded-rulebook.ts";

// RuleSpeak® narration — per-field declarative rules baked at transpile time by
// the shared rulebook-rulespeak-core engine, plus the remembered Formula⇄RuleSpeak®
// toggle. The DAG page uses these; host apps can read them too.
export {
  ruleSpeakForField,
  obligationsForEntity,
  obligationsForField,
  structuralRulesForTable,
  renderRuleMarkdown,
  renderRuleRich,
  linkifyText,
} from "./lib/rulespeak.ts";
export type { RuleSpeakFieldRule, RuleSpeakObligation, RuleSpeakRef, RuleNode } from "./lib/rulespeak.ts";
export { RuleTree } from "./components/RuleTree.tsx";
export {
  // The gear: six independent doc-element toggles (RuleSpeak®/English/Formula/
  // Description/Inputs/Consumers), each remembered in localStorage. This is the
  // headline presentation control — host apps can read/drive it too.
  DOC_ELEMENTS,
  useDocElement,
  setDocElement,
  resetDocElements,
  useDocElements,
  docElementClasses,
  useDocElementClasses,
  // DAG-glyph toggle on host data tables (separate from the gear).
  useGlyphsOn,
  setGlyphsOn,
  // ⚠️ Deprecated exclusive narration slider — kept for back-compat only.
  useNarrationMode,
  setNarrationMode,
} from "./lib/dagPrefs.ts";
export type { NarrationMode, DocElementKey, DocElement, DocElementState } from "./lib/dagPrefs.ts";

// Optional companion components — host apps can drop these in alongside FieldDag.
export { DagCell } from "./components/DagCell.tsx";
export { DagHoverCard } from "./components/DagHoverCard.tsx";
export { DagToggle } from "./components/DagToggle.tsx";
export { FieldChip } from "./components/FieldChip.tsx";
export { FormulaText } from "./components/FormulaText.tsx";
export { TypeBadge, typeGlyph, typeLabel, typeTone } from "./components/TypeBadge.tsx";
export { XlsxDownload } from "./components/XlsxDownload.tsx";
export type { XlsxDownloadProps } from "./components/XlsxDownload.tsx";

// Routing context — for advanced consumers who want to nest <FieldChip /> /
// <DagCell /> outside of a <FieldDag /> tree.
export {
  RoutingContext,
  defaultRouting,
  mergeRouting,
  useFieldLink,
  useTableLink,
  useOnBack,
  useOnHome,
  useNavigateField,
  useNavigateTable,
} from "./lib/routingContext.tsx";
export type { TableLinkProps } from "./lib/routingContext.tsx";
