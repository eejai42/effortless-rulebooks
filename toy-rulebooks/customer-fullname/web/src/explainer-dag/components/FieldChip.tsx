// Clickable chip that references a field. Color-coded by field type.
// Hover surfaces a mini-definition card. Click navigates via the host-provided
// FieldLink (see lib/routingContext.tsx).

import type { ReactNode } from "react";
import type { FieldNode, FieldType } from "../lib/types.ts";
import { humanizeField } from "../lib/renderEnglish.ts";
import { typeGlyph, typeTone } from "./TypeBadge.tsx";
import { useFieldLink } from "../lib/routingContext.tsx";

interface Props {
  table: string;
  field: string;
  // Known metadata about the referenced field, if we have it.
  node?: FieldNode;
  // Render variant:
  //   "chip"   — formula-inline glyph + label (the default, used in formula code)
  //   "pill"   — upstream/downstream card-list rendering with more space
  //   "inline" — a subtle in-prose link that wraps the EXACT words already in the
  //              sentence (passed as `children`); no glyph, no relabeling — so the
  //              RuleSpeak® / English text reads naturally but every ref is clickable
  variant?: "chip" | "pill" | "inline";
  // How to display the foreign table prefix on the chip.
  //   "auto"  → show the table only when it differs from `pageTable`
  //   "always"→ always render `Table.Field`
  //   "never" → never render the table (legacy behavior)
  showTable?: "auto" | "always" | "never";
  // The table being explained on the current page. Required when
  // showTable === "auto" so cross-table refs aren't visually flattened.
  pageTable?: string;
  // For variant="inline": the exact phrase from the prose to wrap as the link.
  children?: ReactNode;
}

export function FieldChip({
  table,
  field,
  node,
  variant = "chip",
  children,
}: Props): JSX.Element {
  const FieldLink = useFieldLink();
  const type: FieldType = node?.type ?? "raw";
  const tone = typeTone(type);

  // Inline-in-prose: wrap the matched words themselves as a quiet, type-tinted link.
  if (variant === "inline") {
    return (
      <FieldLink table={table} field={field} className={`fc-inline fc-inline-${tone}`}>
        {children}
      </FieldLink>
    );
  }

  const glyph = typeGlyph(type);
  const label = humanizeField(field);
  return (
    <FieldLink
      table={table}
      field={field}
      className={`fc fc-${tone} fc-${variant}`}
    >
      <span className="fc-glyph">{glyph}</span>
      {table && <span className="fc-table">{table}.</span>}
      <span className="fc-name">{label}</span>
    </FieldLink>
  );
}
