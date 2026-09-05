// Renders a RuleNode tree as a nested outline — the RuleSpeak® way to lay out a
// priority ladder or a multi-condition (AND/OR) rule. Leaves are linkified so the
// field references inside each clause stay clickable.
//
//   <priority>  headline + numbered cases ("1. value — if <when>"; last = "otherwise")
//   <all>/<any> a labeled group ("all of:" / "any of:") + bulleted children
//   <leaf>      one clause (linkified prose)
//
// Falls back to nothing if given null; the page renders the flat sentence instead.

import type { ReactNode } from "react";
import type { RuleNode, RuleSpeakRef } from "../lib/rulespeak.ts";
import { linkifyText } from "../lib/rulespeak.ts";

type RenderRef = (r: RuleSpeakRef, matched: string, key: number) => ReactNode;

export function RuleTree({
  node, refs, renderRef,
}: {
  node: RuleNode;
  refs: RuleSpeakRef[];
  renderRef: RenderRef;
}): JSX.Element {
  return <div className="dag-rt">{renderNode(node, refs, renderRef, 0)}</div>;
}

function leafText(text: string, refs: RuleSpeakRef[], renderRef: RenderRef): ReactNode {
  return linkifyText(text, refs, renderRef);
}

function renderNode(
  n: RuleNode,
  refs: RuleSpeakRef[],
  renderRef: RenderRef,
  depth: number,
): ReactNode {
  switch (n.kind) {
    case "priority":
      return (
        <div className="dag-rt-priority">
          {n.headline && <p className="dag-rt-headline">{n.headline}</p>}
          {n.cases && n.cases.length > 0 && (
            <ol className="dag-rt-cases">
              {n.cases.map((c, i) => {
                const isElse = c.when == null;
                return (
                  <li key={i} className={`dag-rt-case${isElse ? " dag-rt-else" : ""}`}>
                    {isElse ? (
                      <span className="dag-rt-case-val">
                        otherwise <Val text={c.value} refs={refs} renderRef={renderRef} />
                      </span>
                    ) : (
                      <>
                        <span className="dag-rt-case-val">
                          <Val text={c.value} refs={refs} renderRef={renderRef} />
                        </span>
                        <span className="dag-rt-if"> if </span>
                        {renderCondition(c.when!, refs, renderRef, depth + 1)}
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          {/* A lone condition group (boolean-classification rule with no cases). */}
          {n.children && n.children.length > 0 && (
            <div className="dag-rt-cond-block">
              {n.children.map((ch, i) => (
                <div key={i}>{renderCondition(ch, refs, renderRef, depth + 1)}</div>
              ))}
            </div>
          )}
        </div>
      );
    case "all":
    case "any":
      return renderGroup(n, refs, renderRef, depth);
    default:
      return <span className="dag-rt-leaf">{leafText(n.text ?? "", refs, renderRef)}</span>;
  }
}

// A condition that may be a group (→ nested bullets) or a single leaf (→ inline).
function renderCondition(
  n: RuleNode,
  refs: RuleSpeakRef[],
  renderRef: RenderRef,
  depth: number,
): ReactNode {
  if (n.kind === "leaf") {
    return <span className="dag-rt-leaf">{leafText(n.text ?? "", refs, renderRef)}</span>;
  }
  return renderGroup(n, refs, renderRef, depth);
}

function renderGroup(
  n: RuleNode,
  refs: RuleSpeakRef[],
  renderRef: RenderRef,
  depth: number,
): ReactNode {
  const label = n.kind === "all" ? "all of these hold:" : "any of these hold:";
  return (
    <span className={`dag-rt-group dag-rt-${n.kind}`}>
      <span className="dag-rt-group-label">{label}</span>
      <ul className="dag-rt-children">
        {(n.children ?? []).map((ch, i) => (
          <li key={i} className="dag-rt-child">
            {renderCondition(ch, refs, renderRef, depth + 1)}
          </li>
        ))}
      </ul>
    </span>
  );
}

// A case's yielded value. Values are short ("true", "\"healthy\"", a number, or a
// computed phrase) — linkify so any field reference inside a computed value links.
function Val({
  text, refs, renderRef,
}: {
  text: string;
  refs: RuleSpeakRef[];
  renderRef: RenderRef;
}): JSX.Element {
  return <strong className="dag-rt-val">{leafText(text, refs, renderRef)}</strong>;
}
