// Routing context for the explainer DAG. The host app supplies a FieldLink /
// TableLink component (and optional onBack / onHome / navigate fns) so this
// package never depends on a specific router.

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export interface FieldLinkProps {
  table: string;
  field: string;
  className?: string;
  children: ReactNode;
}

export interface TableLinkProps {
  table: string;
  className?: string;
  children: ReactNode;
}

export interface ExplainerDagRouting {
  /** Render a link to another field's DAG page (/dag/:table/:field). */
  FieldLink?: (props: FieldLinkProps) => JSX.Element;
  /** Render a link to a table's page (/dag/:table). */
  TableLink?: (props: TableLinkProps) => JSX.Element;
  /** Called when the user clicks the "← back" button. */
  onBack?: () => void;
  /** Called when the user clicks the "🏠 Home" button — return to the host
   *  app's original page (the point the exploration started from). */
  onHome?: () => void;
  /** Programmatic navigation to a field page (used by DagCell's double-click). */
  navigate?: (table: string, field: string) => void;
  /** Programmatic navigation to a table page. */
  navigateTable?: (table: string) => void;
}

function fieldHref(table: string, field: string): string {
  return `#/dag/${encodeURIComponent(table)}/${encodeURIComponent(field)}`;
}
function tableHref(table: string): string {
  return `#/dag/${encodeURIComponent(table)}`;
}

function DefaultFieldLink(props: FieldLinkProps): JSX.Element {
  return (
    <a href={fieldHref(props.table, props.field)} className={props.className}>
      {props.children}
    </a>
  );
}

function DefaultTableLink(props: TableLinkProps): JSX.Element {
  return (
    <a href={tableHref(props.table)} className={props.className}>
      {props.children}
    </a>
  );
}

function defaultNavigate(table: string, field: string): void {
  if (typeof window !== "undefined") window.location.hash = fieldHref(table, field).slice(1);
}
function defaultNavigateTable(table: string): void {
  if (typeof window !== "undefined") window.location.hash = tableHref(table).slice(1);
}

// The default routing — used when the host app supplies nothing. Exported so the
// page wrappers (FieldDag / TablePage / TablesIndex) can fill gaps in a partial
// routing prop from ONE place instead of re-declaring the fallbacks each.
export const defaultRouting: Required<ExplainerDagRouting> = {
  FieldLink: DefaultFieldLink,
  TableLink: DefaultTableLink,
  onBack: () => {
    if (typeof window !== "undefined") window.history.back();
  },
  onHome: () => {
    // Default "home" leaves the explainer entirely — to the app root.
    if (typeof window !== "undefined") window.location.hash = "#/";
  },
  navigate: defaultNavigate,
  navigateTable: defaultNavigateTable,
};

// Fill any missing handlers on a partial routing prop with the defaults above.
//
// Hosts commonly wire only FieldLink + navigate (e.g. a react-router app that has
// just the field route). The defaults above emit *hash* URLs (#/dag/..., #/).
// A path router (BrowserRouter) silently IGNORES a hash change: the hash updates,
// the route does not, and the user bounces to the "/" root node. So the rule when
// merging is: **if the host wired ANY path-based navigation, no handler may fall
// back to a hash URL.** We derive the missing path handlers from whatever the host
// DID supply, and only keep the pure-hash defaults when the host gave NOTHING
// navigational (a standalone, router-less embedding).
//
//   • navigateTable ← host.navigateTable, else host.navigate(table, "")  (the
//     table page is the field route with an empty field, which a host with
//     /dag/:table/:field can honor; hosts with a dedicated /dag/:table should
//     pass their own navigateTable — this app does).
//   • TableLink ← a button-style <a> that routes through navigateTable.
//   • onHome ← host.onHome, else (for a path host) navigateTable("") — i.e. "leave
//     the explainer the same way the Tables crumb does," NOT the hash "#/". A host
//     that wants a distinct home target should pass onHome explicitly.
export function mergeRouting(
  r: ExplainerDagRouting | undefined,
): Required<ExplainerDagRouting> {
  const hostNavigate = r?.navigate;
  // "Path host" = the host wired real path navigation. For these we must never
  // hand back a hash-URL handler (it would no-op against their router).
  const isPathHost = !!(r?.navigate || r?.navigateTable || r?.onHome);

  // Resolve navigateTable first — TableLink and onHome below depend on it.
  const navigateTable: (table: string) => void =
    r?.navigateTable ??
    (hostNavigate
      ? (table: string) => hostNavigate(table, "")
      : defaultRouting.navigateTable);

  const TableLink: (props: TableLinkProps) => JSX.Element =
    r?.TableLink ??
    (r?.navigateTable || hostNavigate
      ? (props: TableLinkProps) => (
          <a
            href={tableHref(props.table)}
            className={props.className}
            onClick={(e) => {
              // Let modifier-clicks (open in new tab) use the href; otherwise route.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              navigateTable(props.table);
            }}
          >
            {props.children}
          </a>
        )
      : defaultRouting.TableLink);

  // onHome: a path host that didn't supply one leaves the explainer via the
  // resolved navigateTable("") (its index / leave-explainer route), so Home never
  // dead-ends on the ignored hash "#/". Only a router-less host keeps the hash.
  const onHome: () => void =
    r?.onHome ??
    (isPathHost ? () => navigateTable("") : defaultRouting.onHome);

  return {
    FieldLink: r?.FieldLink ?? defaultRouting.FieldLink,
    TableLink,
    onBack: r?.onBack ?? defaultRouting.onBack,
    onHome,
    navigate: hostNavigate ?? defaultRouting.navigate,
    navigateTable,
  };
}

export const RoutingContext = createContext<Required<ExplainerDagRouting>>(defaultRouting);

export function useFieldLink(): (props: FieldLinkProps) => JSX.Element {
  return useContext(RoutingContext).FieldLink;
}

export function useTableLink(): (props: TableLinkProps) => JSX.Element {
  return useContext(RoutingContext).TableLink;
}

export function useOnBack(): () => void {
  return useContext(RoutingContext).onBack;
}

export function useOnHome(): () => void {
  return useContext(RoutingContext).onHome;
}

export function useNavigateField(): (table: string, field: string) => void {
  return useContext(RoutingContext).navigate;
}

export function useNavigateTable(): (table: string) => void {
  return useContext(RoutingContext).navigateTable;
}
