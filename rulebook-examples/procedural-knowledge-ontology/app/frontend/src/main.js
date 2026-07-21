// ============================================================================
// PKO Procedure Register — console
//
// THE VIEW IS THE CONTRACT. Everything rendered here is a column that already
// exists on a vw_<entity> row:
//
//   vw_steps.assigned_role_label      <- lookup, resolved by Postgres
//   vw_steps.assigned_agent_kind      <- lookup, resolved by Postgres
//   vw_step_executions.actual_duration_minutes  <- calc (DATETIME_DIFF)
//   vw_step_executions.expected_duration_minutes<- lookup (INDEX/MATCH)
//   vw_step_executions.is_late        <- calc (actual > expected)
//
// There is no formula evaluator, no lookup resolver, and no "first non-null
// column" helper in this file. If a value looks wrong, the fix is in the
// rulebook formula, not here.
// ============================================================================
import "./styles.css";
import { renderLogin, storedClaims, tokenIsLive, signOut } from "./login.js";
import {
  ACCESS_TABS, loadAccessModel, accessCounts, wireAccess,
  viewPrincipals, viewPolicies, viewGrants,
  viewWitnesses as viewDenialWitnesses, saveBarHtml,
} from "./access.js";
import {
  ADMIN_TABS, loadAdmin, adminCount, wireAdmin,
  viewBoard, viewWitnesses, viewLoops, viewTrace,
} from "./admin.js";
import {
  EXPLORE_TABS, loadExplore, exploreCount, wireExplore, wireCells,
  viewInferences, viewTables, viewRecord,
} from "./explore.js";

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );

// ---------- data ----------
// One fetch of the whole register. Every entry is a view read server-side.
let T = {};
let META = {};

// The register is now scoped to the signed-in principal, so every read needs
// the token. What comes back IS that principal's world -- if a table is absent
// here it is because Postgres does not expose it to them, not because the UI
// filtered it.
const authed = () => ({ Authorization: `Bearer ${localStorage.getItem("pko.token")}` });

let ME = {};

async function load() {
  const [reg, meta, me] = await Promise.all([
    fetch("/api/register", { headers: authed() }).then(async (r) => {
      if (!r.ok) throw new Error(`/api/register -> ${r.status} ${await r.text()}`);
      return r.json();
    }),
    fetch("/api/meta").then(async (r) => {
      if (!r.ok) throw new Error(`/api/meta -> ${r.status} ${await r.text()}`);
      return r.json();
    }),
    fetch("/api/me", { headers: authed() }).then(async (r) => {
      if (!r.ok) throw new Error(`/api/me -> ${r.status} ${await r.text()}`);
      return r.json();
    }),
  ]);
  T = reg;
  META = meta;
  ME = me;
}

// Row lookup by primary key — this is indexing already-fetched view rows, not
// re-deriving a relationship. The FK columns come from the views themselves.
const by = (t, k) => Object.fromEntries((T[t] || []).map((r) => [r[k], r]));
let IX = {};
function buildIndexes() {
  IX = {
    step: by("steps", "step_id"),
    se: by("step_executions", "step_execution_id"),
    exe: by("procedure_executions", "procedure_execution_id"),
    pv: by("procedure_versions", "procedure_version_id"),
    proc: by("procedures", "procedure_id"),
    role: by("roles", "role_id"),
    agent: by("agents", "agent_id"),
    org: by("organizations", "organization_id"),
    req: by("requirements", "requirement_id"),
    err: by("errors", "error_id"),
    tool: by("tools", "tool_id"),
    act: by("actions", "action_id"),
  };
}

// Display helpers. roleLabel/agentName read the row's own name column — the
// views already carry `name` for every entity.
const roleLabel = (id) => IX.role[id]?.label ?? id ?? "—";
const agentName = (id) => IX.agent[id]?.display_name ?? id ?? "—";
const agentKind = (id) => IX.agent[id]?.agent_kind ?? "";

const dt = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
};
// Format a duration the VIEW computed. We never compute the minutes ourselves.
const mins = (m) =>
  m == null ? "—" : m < 60 ? `${m}m` : m < 1440 ? `${(m / 60).toFixed(1)}h` : `${(m / 1440).toFixed(1)}d`;
const vclass = (v) => ({ PASS: "pass", WARN: "warn", FAIL: "fail", PENDING: "pend" }[v] || "pend");

// ---------- roles ----------
const ROLES = {
  operator: {
    label: "Operator",
    tabs: ["run", "ledger", "flow"],
  },
  author: {
    label: "Author",
    tabs: ["catalog", "flow", "knowledge", "changes"],
  },
  approver: {
    label: "Approver",
    tabs: ["queue", "ledger", "changes"],
  },
  steward: {
    label: "Steward",
    tabs: ["health", "knowledge", "ledger", "changes"],
  },
  publisher: {
    label: "Comms",
    tabs: ["comms", "health", "knowledge"],
  },
  auditor: {
    label: "Auditor",
    tabs: ["ledger", "evidence", "mappings"],
  },
  admin: {
    label: "Admin",
    tabs: ["board", "witnesses", "loops", "trace"],
  },
  // The curated screens above are deliberately selective — they tell the
  // procedural story with ~80 of the model's 1521 fields. The explorer is
  // where the other 1400 live: every table, every column, every inference
  // beside the values it was computed from.
  explorer: {
    label: "Explorer",
    tabs: ["inferences", "tables", "record"],
  },
  // Administrators only. The button is not rendered for anyone else, and the
  // API refuses the calls regardless -- the UI hiding it is a courtesy, not
  // the control.
  access: {
    label: "Access Control",
    adminOnly: true,
    tabs: ACCESS_TABS.map((t) => t.id),
  },
};
const TABS = {
  run: "My Steps",
  ledger: "Spec ↔ Execution",
  flow: "Procedure Flow",
  catalog: "Procedures",
  knowledge: "Knowledge",
  changes: "Change Requests",
  queue: "Awaiting Me",
  health: "Knowledge Health",
  evidence: "Evidence Trail",
  mappings: "Ontology Mapping",
  comms: "Communications",
  ...ADMIN_TABS,
  ...EXPLORE_TABS,
  ...Object.fromEntries(ACCESS_TABS.map((t) => [t.id, t.label])),
};

let role = "operator";   // corrected at first render to one this principal can use
let tab = "run";
let execSel = null;

const stepsOf = (pv) =>
  (T.steps || [])
    .filter((s) => s.procedure_version === pv)
    .sort((a, b) => String(a.step_number).localeCompare(String(b.step_number)));

function tabCount(t) {
  switch (t) {
    case "run": return (T.step_executions || []).filter((s) => s.execution_status !== "Completed").length;
    case "catalog": return (T.procedures || []).length;
    case "knowledge": return (T.knowledge_fragments || []).length;
    case "changes": return (T.change_requests || []).length;
    case "queue": return (T.step_executions || []).filter((s) => s.verification_result === "PENDING").length;
    case "health": return (T.knowledge_gaps || []).filter((g) => g.status === "Open").length;
    case "mappings": return (T.semantic_mappings || []).length;
    case "evidence": return (T.requirement_satisfactions || []).length;
    case "board": case "witnesses": case "loops": return adminCount(t);
    case "inferences": case "tables": return exploreCount(t);
    case "ac-principals": return accessCounts().principals ?? null;
    case "ac-policies": return accessCounts().policies ?? null;
    case "ac-witnesses": return accessCounts().denials ?? null;
    default: return null;
  }
}

// ---------- drawer ----------
function openDrawer(title, kicker, html) {
  const d = $("drawer");
  d.innerHTML = `<div class="drawer-head">
      <div style="flex:1"><div class="eyebrow">${esc(kicker)}</div><h3 id="dtitle">${esc(title)}</h3></div>
      <button class="x-btn" id="dx" aria-label="Close">×</button></div>
    <div class="drawer-body">${html}</div>`;
  d.classList.add("open");
  $("dbg").classList.add("open");
  $("dx").onclick = closeDrawer;
  $("dx").focus();
  // Values in the drawer are view columns like any other — make the derived
  // ones traceable here too, so provenance is never more than a click away.
  wireCells(d, goTo);
}
function closeDrawer() {
  $("drawer").classList.remove("open");
  $("dbg").classList.remove("open");
}

// ---------- step detail ----------
function stepDetail(stepId, seId) {
  const s = IX.step[stepId];
  if (!s) return;
  const se = seId ? IX.se[seId] : (T.step_executions || []).find((x) => x.step === stepId);
  const reqIds = (T.step_requirements || []).filter((r) => r.step === stepId).map((r) => r.requirement);
  const reqs = reqIds.map((id) => IX.req[id]).filter(Boolean);
  const vers = (T.step_verifications || []).filter((v) => v.step === stepId);
  const excs = (T.exceptions || []).filter((e) => e.trigger_step === stepId);
  const rats = (T.rationales || []).filter((r) => r.step === stepId);
  const kfs = (T.knowledge_fragments || []).filter((k) => k.step === stepId);
  const gaps = (T.knowledge_gaps || []).filter((g) => g.step === stepId);
  const tools = (T.step_tools || []).filter((t) => t.step === stepId).map((t) => IX.tool[t.tool]).filter(Boolean);
  const acts = (T.step_actions || []).filter((a) => a.step === stepId).map((a) => IX.act[a.action]).filter(Boolean);
  const outs = (T.step_transitions || []).filter((t) => t.from_step === stepId);
  const sats = se ? (T.requirement_satisfactions || []).filter((r) => r.step_execution === se.step_execution_id) : [];
  const issues = se ? (T.issue_occurrences || []).filter((i) => i.step_execution === se.step_execution_id) : [];

  let h = "";
  h += `<div class="sect"><h4>Specification</h4>
    <p class="prose" style="margin:0 0 13px">${esc(s.instruction)}</p>
    <dl class="kv">
      <dt>Assigned role</dt><dd>${esc(s.assigned_role_label)}
        <span class="kind" style="margin-left:6px">${esc(s.assigned_agent_kind)}</span></dd>
      <dt>Step kind</dt><dd class="mono">${esc(s.step_kind)}</dd>
      <dt>Expertise</dt><dd>${esc(s.expertise_level ?? "—")}</dd>
      <dt>Expected</dt><dd class="mono">${s.expected_duration_minutes ?? "—"} min</dd>
      ${s.requires_human_confirmation ? `<dt>Human confirm</dt><dd><span class="chip fail">Required</span></dd>` : ""}
      ${tools.length ? `<dt>Tools</dt><dd>${tools.map((t) => esc(t.label)).join(", ")}</dd>` : ""}
      ${acts.length ? `<dt>Actions</dt><dd>${acts.map((a) => esc(a.label)).join(", ")}</dd>` : ""}
    </dl></div>`;

  if (vers.length)
    h += `<div class="sect"><h4>How it is verified</h4><ul class="bullet">${vers
      .map(
        (v) => `<li><b>${esc(v.instruction)}</b><br>
      <span class="mono muted" style="font-size:12px">${esc(v.signal_identifier)} = ${esc(v.expected_signal_value)}</span>
      <span class="kind" style="margin-left:8px">${esc(v.verification_kind)}</span></li>`
      )
      .join("")}</ul></div>`;

  if (reqs.length)
    h += `<div class="sect"><h4>Requirements it must satisfy</h4><ul class="bullet">${reqs
      .map((r) => {
        const sat = sats.find((x) => x.requirement === r.requirement_id);
        return `<li class="${r.is_blocking ? "blocking" : ""}"><b>${esc(r.label)}</b>
        ${r.is_blocking ? '<span class="chip fail" style="margin-left:6px">Blocking</span>' : ""}
        ${sat ? `<span class="chip ${sat.satisfaction_level === "Satisfied" ? "pass" : "warn"}" style="margin-left:6px">${esc(sat.satisfaction_level)}</span>` : ""}
        <br><span class="prose" style="font-size:13.5px">${esc(r.statement)}</span>
        ${sat ? `<br><span class="muted" style="font-size:12.5px">Evidence: ${esc(sat.evidence)} — ${esc(agentName(sat.evaluated_by_agent))}</span>` : ""}
      </li>`;
      })
      .join("")}</ul></div>`;

  if (excs.length)
    h += `<div class="sect"><h4>When it goes wrong</h4><ul class="bullet">${excs
      .map(
        (e) => `<li><b>${esc(e.condition)}</b><br>
      <span class="prose" style="font-size:13.5px">${esc(e.handling)}</span><br>
      <span class="muted" style="font-size:12.5px">Approval: ${esc(roleLabel(e.approval_role))} · Fallback: ${esc(roleLabel(e.fallback_role))}</span></li>`
      )
      .join("")}</ul></div>`;

  if (outs.length)
    h += `<div class="sect"><h4>Where it can go next</h4><ul class="bullet">${outs
      .map(
        (t) => `<li><span class="chip ${t.transition_kind === "Next" ? "spec" : "exec"}">${esc(t.transition_kind)}</span>
      <b style="margin-left:7px">${esc(IX.step[t.to_step]?.title ?? t.to_step)}</b><br>
      <span class="muted" style="font-size:12.5px">${esc(t.condition)}</span></li>`
      )
      .join("")}</ul></div>`;

  if (rats.length)
    h += `<div class="sect"><h4>Why it is written this way</h4>${rats
      .map(
        (r) => `<div style="margin-bottom:11px"><b style="font-size:13.5px">${esc(r.title)}</b>
      <p class="prose" style="margin:4px 0 0">${esc(r.statement)}</p>
      <span class="muted" style="font-size:12px">Approved by ${esc(roleLabel(r.authority_role))}</span></div>`
      )
      .join("")}</div>`;

  if (kfs.length)
    h += `<div class="sect"><h4>Practitioner knowledge captured here</h4>${kfs
      .map(
        (k) => `<div class="kf-row"><span class="kf-form kf-${esc(k.knowledge_form)}">${esc(k.knowledge_form)}</span>
      <span class="kf-stmt">${esc(k.statement)}</span></div>`
      )
      .join("")}</div>`;

  if (gaps.length)
    h += `<div class="sect"><h4>Known gaps</h4><ul class="bullet">${gaps
      .map(
        (g) => `<li class="${g.blocking_kind === "Blocking" ? "blocking" : ""}"><b>${esc(g.statement)}</b><br>
      <span class="chip ${g.status === "Open" ? "warn" : "pass"}">${esc(g.status)}</span>
      <span class="chip pend" style="margin-left:5px">${esc(g.severity)}</span>
      <span class="muted" style="font-size:12.5px;margin-left:7px">Owner: ${esc(roleLabel(g.owner_role))}</span></li>`
      )
      .join("")}</ul></div>`;

  if (se) {
    // Every number below is a COLUMN. actual_duration_minutes and is_late were
    // computed by Postgres from the rulebook formula, not by this file.
    h += `<div class="sect"><h4>This execution</h4>
      <dl class="kv">
        <dt>Status</dt><dd><span class="chip ${vclass(se.verification_result)}">${esc(se.execution_status)} · ${esc(se.verification_result)}</span></dd>
        <dt>Executed by</dt><dd>${esc(agentName(se.executed_by_agent))} <span class="kind">${esc(agentKind(se.executed_by_agent))}</span></dd>
        <dt>Started</dt><dd class="mono" style="font-size:12.5px">${dt(se.started_at)}</dd>
        <dt>Ended</dt><dd class="mono" style="font-size:12.5px">${dt(se.ended_at)}</dd>
        <dt>Actual</dt><dd class="mono">
          <button class="xcell" data-cell="StepExecutions|${esc(se.step_execution_id)}|actual_duration_minutes">${mins(se.actual_duration_minutes)}</button>
          <span class="muted">vs</span>
          <button class="xcell" data-cell="StepExecutions|${esc(se.step_execution_id)}|expected_duration_minutes">${se.expected_duration_minutes ?? "—"}m expected</button>
          <button class="xcell" data-cell="StepExecutions|${esc(se.step_execution_id)}|is_late" style="margin-left:6px;border:0">
            ${se.is_late ? '<span class="chip warn">Over</span>' : '<span class="chip pass">Within</span>'}</button></dd>
        ${se.deviation ? `<dt>Deviation</dt><dd>${esc(se.deviation)}</dd>` : ""}
      </dl></div>`;
    if (issues.length)
      h += `<div class="sect"><h4>Issues encountered</h4><ul class="bullet">${issues
        .map((i) => {
          const e = IX.err[i.error];
          return `<li class="blocking"><b>${esc(e?.label ?? i.error)}</b><br>
        <span class="muted" style="font-size:13px">Cause: ${esc(i.issue_cause)}</span><br>
        <span class="muted" style="font-size:13px">Resolution: ${esc(i.issue_solution)}</span><br>
        <span class="mono muted" style="font-size:12px">${dt(i.occurred_at)} · ${esc(agentName(i.encountered_by_agent))}</span></li>`;
        })
        .join("")}</ul></div>`;
  }
  openDrawer(s.title, `Step ${s.step_number} · ${s.procedure_version}`, h);
}

// ---------- views ----------
const head = (t, p) =>
  `<div class="page-head"><div class="eyebrow">${esc(ROLES[role].label)} view</div>
   <h2>${esc(t)}</h2><p>${esc(p)}</p></div>`;

function viewLedger() {
  const ex = IX.exe[execSel];
  if (!ex) return head("Spec ↔ Execution", "No execution selected.");
  const pv = IX.pv[ex.procedure_version];
  const steps = stepsOf(ex.procedure_version);
  const ses = (T.step_executions || []).filter((s) => s.procedure_execution === execSel);
  const seByStep = Object.fromEntries(ses.map((s) => [s.step, s]));
  const done = ses.filter((s) => s.execution_status === "Completed").length;
  const warns = ses.filter((s) => s.verification_result === "WARN").length;
  const notRun = steps.length - ses.length;
  const late = ses.filter((s) => s.is_late).length; // computed by the view

  const opts = (T.procedure_executions || [])
    .map((e) => {
      const v = IX.pv[e.procedure_version];
      return `<button class="role-btn" data-exec="${esc(e.procedure_execution_id)}" aria-pressed="${e.procedure_execution_id === execSel}">${esc(IX.proc[v?.procedure]?.title ?? e.procedure_execution_id)}</button>`;
    })
    .join("");

  const rows = steps
    .map((s) => {
      const se = seByStep[s.step_id];
      return `<div class="lrow">
      <div class="lcell s">
        <div class="step-n">STEP ${esc(s.step_number)}</div>
        <div class="step-t">${esc(s.title)}</div>
        <p class="step-i">${esc(s.instruction)}</p>
        <div class="step-meta">
          <span class="role-tag">${esc(s.assigned_role_label)}</span>
          <span>·</span><span class="kind">${esc(s.assigned_agent_kind)}</span>
          <span>·</span><span class="mono">${s.expected_duration_minutes}m expected</span>
        </div>
        <button class="link-btn" data-step="${esc(s.step_id)}" style="margin-top:8px">Open specification →</button>
      </div>
      <div class="lcell gap">
        <div class="tie ${se ? "" : "none"}"></div>
        ${se ? `<span class="chip ${vclass(se.verification_result)}">${esc(se.verification_result)}</span>` : `<span class="chip pend">not&nbsp;run</span>`}
        <div class="tie ${se ? "" : "none"}"></div>
      </div>
      <div class="lcell e exec">
        ${
          se
            ? `<div class="step-n">${esc(se.step_execution_id.toUpperCase())}</div>
          <div class="step-t">${esc(se.execution_status)}</div>
          <div class="step-meta" style="margin-bottom:7px">
            <span class="role-tag">${esc(agentName(se.executed_by_agent))}</span>
            <span class="kind">${esc(agentKind(se.executed_by_agent))}</span>
          </div>
          <div class="step-meta"><span class="mono">${dt(se.started_at)}</span></div>
          <div class="step-meta" style="margin-top:4px">
            <span class="mono">took ${mins(se.actual_duration_minutes)}</span>
            <span>·</span><span class="muted">vs ${se.expected_duration_minutes ?? "—"}m</span>
            ${se.is_late ? '<span class="chip warn">Over</span>' : ""}
          </div>
          ${se.verification_result === "WARN" ? `<div class="drift"><b>Verification warned.</b> The step completed, but its signal did not meet spec.</div>` : ""}
          ${se.verification_result === "PENDING" ? `<div class="drift"><b>Awaiting ${esc(s.assigned_role_label)}.</b> This step is open; downstream steps have not started.</div>` : ""}
          ${se.is_late && se.verification_result !== "WARN" ? `<div class="drift"><b>Ran long.</b> ${mins(se.actual_duration_minutes)} against a ${se.expected_duration_minutes}m specification — verification still passed.</div>` : ""}
          <button class="link-btn" data-step="${esc(s.step_id)}" data-se="${esc(se.step_execution_id)}" style="margin-top:8px;color:var(--exec)">Open execution record →</button>`
            : `<div class="empty-exec">No execution record. The specification says this step exists; nothing has been performed against it.</div>`
        }
      </div>
    </div>`;
    })
    .join("");

  return (
    head(
      "Specification ↔ Execution",
      "PKO keeps what a procedure says separate from what an execution did. This screen puts the two side by side so the gap between them is visible rather than inferred."
    ) +
    `<div class="roles" style="margin-bottom:20px;width:fit-content;max-width:100%;flex-wrap:wrap">${opts}</div>` +
    `<div class="strip">
      <div class="tile"><div class="tile-l">Execution</div><div class="tile-v b" style="font-size:16px">${esc(ex.execution_status)}</div><div class="tile-s">${esc(ex.context)}</div></div>
      <div class="tile"><div class="tile-l">Steps performed</div><div class="tile-v">${ses.length}<span class="muted" style="font-size:16px">/${steps.length}</span></div><div class="tile-s">${done} completed</div></div>
      <div class="tile"><div class="tile-l">Verifications warned</div><div class="tile-v ${warns ? "w" : "ok"}">${warns}</div><div class="tile-s">${warns ? "signal did not meet spec" : "all signals met spec"}</div></div>
      <div class="tile"><div class="tile-l">Ran over expected</div><div class="tile-v ${late ? "w" : "ok"}">${late}</div><div class="tile-s">is_late computed by the view</div></div>
      <div class="tile"><div class="tile-l">Never performed</div><div class="tile-v ${notRun ? "w" : "ok"}">${notRun}</div><div class="tile-s">specified but no record</div></div>
     </div>` +
    `<div class="ledger-legend">
      <span class="legend-item"><span class="swatch s"></span>Specification — <span class="mono">vw_steps</span></span>
      <span class="legend-item"><span class="swatch e"></span>Execution — <span class="mono">vw_step_executions</span></span>
      <span class="legend-item">A dashed tie means a specified step with no execution record.</span>
     </div>` +
    `<div class="ledger-head"><div class="lh s">Specification · ${esc(pv?.procedure_version_id ?? "")}</div>
      <div class="lh mid">Verify</div>
      <div class="lh e">Execution · ${esc(ex.procedure_execution_id)}</div></div>` +
    `<div class="ledger">${rows}</div>`
  );
}

function viewRun() {
  const mine = (T.step_executions || []).filter((s) => s.execution_status !== "Completed");
  let h = head("My Steps", "What is in front of you right now, with the verification that will be applied and the exception path if it fails.");
  h += `<div class="notice"><span class="ni">Scope</span><div>An operator sees steps on <b>open</b> executions only. Completed history lives in the Spec ↔ Execution ledger.</div></div>`;
  if (!mine.length) h += `<div class="card" style="padding:26px"><p class="muted" style="margin:0">Nothing open.</p></div>`;
  mine.forEach((se) => {
    const s = IX.step[se.step];
    const ex = IX.exe[se.procedure_execution];
    const vers = (T.step_verifications || []).filter((v) => v.step === se.step);
    const excs = (T.exceptions || []).filter((e) => e.trigger_step === se.step);
    h += `<div class="card" style="padding:20px 22px;margin-bottom:14px">
      <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:11px">
        <div style="flex:1;min-width:220px">
          <div class="eyebrow" style="margin-bottom:5px">${esc(ex?.context ?? "")} · Step ${esc(s.step_number)}</div>
          <h3 style="font-size:18px;letter-spacing:-.015em">${esc(s.title)}</h3>
        </div>
        <span class="chip ${vclass(se.verification_result)}">${esc(se.verification_result)}</span>
      </div>
      <p class="prose" style="margin:0 0 13px">${esc(s.instruction)}</p>
      <div class="step-meta" style="margin-bottom:13px">
        <span class="role-tag">${esc(s.assigned_role_label)}</span><span>·</span>
        <span>${esc(agentName(se.executed_by_agent))}</span><span>·</span>
        <span class="mono">started ${dt(se.started_at)}</span>
      </div>
      ${
        vers.length
          ? `<div style="padding:12px 14px;background:var(--spec-wash);border-radius:5px;margin-bottom:11px">
        <div class="eyebrow" style="color:var(--spec);margin-bottom:6px">Will be verified by</div>
        ${vers.map((v) => `<div style="font-size:13.5px">${esc(v.instruction)}
          <span class="mono muted" style="font-size:12px;margin-left:6px">${esc(v.signal_identifier)} = ${esc(v.expected_signal_value)}</span></div>`).join("")}
      </div>`
          : ""
      }
      ${
        excs.length
          ? `<div style="padding:12px 14px;background:var(--exec-wash);border-radius:5px;margin-bottom:11px">
        <div class="eyebrow" style="color:var(--exec);margin-bottom:6px">If it fails</div>
        ${excs.map((e) => `<div style="font-size:13.5px;margin-bottom:5px"><b>${esc(e.condition)}</b> — ${esc(e.handling)}</div>`).join("")}
      </div>`
          : ""
      }
      <button class="link-btn" data-step="${esc(s.step_id)}" data-se="${esc(se.step_execution_id)}">Open full step record →</button>
    </div>`;
  });
  return h;
}

function viewFlow() {
  const pvs = (T.procedure_versions || []).filter((v) => v.status !== "Archived");
  let h = head("Procedure Flow", "The specification as written: ordered steps plus every alternative and fallback transition. Branches are first-class rows, not prose caveats.");
  pvs.forEach((pv) => {
    const pr = IX.proc[pv.procedure];
    const steps = stepsOf(pv.procedure_version_id);
    const ses = (T.step_executions || []).filter((s) => IX.exe[s.procedure_execution]?.procedure_version === pv.procedure_version_id);
    const seByStep = Object.fromEntries(ses.map((s) => [s.step, s]));
    h += `<div class="card" style="padding:22px 24px;margin-bottom:20px">
      <div style="margin-bottom:18px;padding-bottom:15px;border-bottom:1px solid var(--rule-soft)">
        <div class="eyebrow">${esc(pv.procedure_version_id)} · ${esc(pv.status)}</div>
        <h3 style="font-size:19px">${esc(pr?.title ?? "")}</h3>
        <p class="prose muted" style="margin:6px 0 0;font-size:14px">${esc(pr?.purpose ?? "")}</p>
      </div><div class="rail">`;
    steps.forEach((s, i) => {
      const se = seByStep[s.step_id];
      const branches = (T.step_transitions || []).filter((t) => t.from_step === s.step_id && t.transition_kind !== "Next");
      const cls = se ? (se.execution_status === "Completed" ? "done" : "prog") : "";
      h += `<div class="rail-step">
        <div class="rail-gut"><div class="rail-num ${cls}">${esc(s.step_number)}</div>
          ${i < steps.length - 1 ? '<div class="rail-bar"></div>' : ""}</div>
        <div class="rail-body">
          <button class="link-btn" data-step="${esc(s.step_id)}" style="color:var(--ink);text-decoration:none;font-weight:600;font-size:14.5px">${esc(s.title)}</button>
          <div class="step-meta" style="margin-top:3px">
            <span class="role-tag">${esc(s.assigned_role_label)}</span><span>·</span>
            <span class="kind">${esc(s.step_kind)}</span><span>·</span>
            <span class="mono">${s.expected_duration_minutes}m</span>
          </div>
          ${branches.map((b) => `<div class="branch"><b>${esc(b.transition_kind)}</b> → ${esc(IX.step[b.to_step]?.title ?? b.to_step)}<br>
            <span style="font-size:11.5px">${esc(b.condition)}</span></div>`).join("")}
        </div></div>`;
    });
    h += `</div></div>`;
  });
  return h;
}

function viewCatalog() {
  let h = head("Procedures", "Every procedure specification in the register. A procedure is abstract; its versions carry the actual steps, and only one is current.");
  h += '<div class="grid2">';
  (T.procedures || []).forEach((p) => {
    const vs = (T.procedure_versions || [])
      .filter((v) => v.procedure === p.procedure_id)
      .sort((a, b) => String(b.version_number).localeCompare(String(a.version_number)));
    const cur = IX.pv[p.current_version_key];
    const nsteps = cur ? stepsOf(cur.procedure_version_id).length : 0;
    const execs = (T.procedure_executions || []).filter((e) => vs.some((v) => v.procedure_version_id === e.procedure_version));
    h += `<div class="card pcard">
      <div><div class="eyebrow">${esc(p.procedure_type)}</div><h3>${esc(p.title)}</h3></div>
      <p class="purpose">${esc(p.purpose)}</p>
      <div class="pcard-foot">
        <span class="chip spec">${nsteps} steps</span>
        <span class="chip exec">${execs.length} execution${execs.length === 1 ? "" : "s"}</span>
        <span class="chip pend">${vs.length} version${vs.length === 1 ? "" : "s"}</span>
      </div>
      ${vs
        .map(
          (v) => `<div class="ver-line">
        <span style="color:${v.procedure_version_id === p.current_version_key ? "var(--spec)" : "var(--muted)"};font-weight:600">v${esc(v.version_number)}</span>
        <span class="chip ${v.status === "Approved" ? "pass" : v.status === "Archived" ? "pend" : "warn"}">${esc(v.status)}</span>
        <span style="flex:1;text-align:right;font-size:11px">${esc(v.new_version_motivation ?? "")}</span>
      </div>`
        )
        .join("")}
      <div style="font-size:12.5px;color:var(--muted);padding-top:9px;border-top:1px solid var(--rule-soft)">
        Owned by ${esc(IX.org[p.owner_organization]?.display_name ?? p.owner_organization)}
      </div>
    </div>`;
  });
  return h + "</div>";
}

function viewKnowledge() {
  const kfs = T.knowledge_fragments || [];
  const forms = ["Tacit", "Implicit", "Explicit", "SituatedJudgment"];
  let h = head("Knowledge", "What practitioners actually know, captured by form. Tacit and situated judgment are the knowledge that normally never makes it into an SOP — here they are rows, attached to the step they belong to.");
  h += `<div class="strip">${forms
    .map((f) => {
      const n = kfs.filter((k) => k.knowledge_form === f).length;
      return `<div class="tile"><div class="tile-l">${esc(f)}</div><div class="tile-v">${n}</div><div class="tile-s">fragment${n === 1 ? "" : "s"}</div></div>`;
    })
    .join("")}
    <div class="tile"><div class="tile-l">Elicitation</div><div class="tile-v b">${(T.elicitation_sessions || []).length}</div><div class="tile-s">sessions</div></div></div>`;
  h += `<div class="card" style="padding:20px 22px;margin-bottom:20px"><h3 style="font-size:15px;margin-bottom:14px">Captured fragments</h3>`;
  kfs.forEach((k) => {
    const s = IX.step[k.step];
    h += `<div class="kf-row">
      <span class="kf-form kf-${esc(k.knowledge_form)}">${esc(k.knowledge_form)}</span>
      <div class="kf-stmt">${esc(k.statement)}
        <div class="step-meta" style="margin-top:6px">
          ${s ? `<button class="link-btn" data-step="${esc(k.step)}" style="font-size:11.5px">Step ${esc(s.step_number)} · ${esc(s.title)}</button>` : ""}
          ${k.elicitation_session ? `<span>·</span><span class="mono" style="font-size:11px">${esc(k.elicitation_session)}</span>` : ""}
        </div>
      </div></div>`;
  });
  h += "</div>";
  h += `<div class="card" style="padding:20px 22px"><h3 style="font-size:15px;margin-bottom:14px">Elicitation sessions</h3>
    <div class="scroll-x"><table><thead><tr><th>Method</th><th>Practitioner</th><th>Facilitator</th><th>When</th><th>Summary</th></tr></thead><tbody>${(T.elicitation_sessions || [])
      .map(
        (e) => `<tr>
      <td><span class="chip spec">${esc(e.method)}</span></td>
      <td>${esc(agentName(e.practitioner_agent))}</td>
      <td>${esc(agentName(e.facilitator_agent))}</td>
      <td class="mono">${dt(e.started_at)}</td>
      <td class="serif">${esc(e.summary)}</td></tr>`
      )
      .join("")}</tbody></table></div></div>`;
  return h;
}

function viewHealth() {
  const gaps = T.knowledge_gaps || [];
  const stew = T.stewardship_assignments || [];
  const openGaps = gaps.filter((g) => g.status === "Open");
  const covered = new Set((T.knowledge_fragments || []).map((k) => k.step)).size;
  const allSteps = (T.steps || []).length;
  let h = head("Knowledge Health", "Where the register is thin. A gap is a first-class row with an owner and a severity — not a missing paragraph nobody noticed.");
  h += `<div class="strip">
    <div class="tile"><div class="tile-l">Open gaps</div><div class="tile-v ${openGaps.length ? "w" : "ok"}">${openGaps.length}</div><div class="tile-s">of ${gaps.length} recorded</div></div>
    <div class="tile"><div class="tile-l">Blocking</div><div class="tile-v ${gaps.filter((g) => g.blocking_kind === "Blocking" && g.status === "Open").length ? "w" : "ok"}">${gaps.filter((g) => g.blocking_kind === "Blocking" && g.status === "Open").length}</div><div class="tile-s">halt execution</div></div>
    <div class="tile"><div class="tile-l">Steps with knowledge</div><div class="tile-v b">${covered}<span class="muted" style="font-size:16px">/${allSteps}</span></div><div class="tile-s">have captured fragments</div></div>
    <div class="tile"><div class="tile-l">Stewarded versions</div><div class="tile-v b">${stew.length}</div><div class="tile-s">with review cadence</div></div>
  </div>`;
  h += `<div class="card" style="padding:20px 22px;margin-bottom:20px"><h3 style="font-size:15px;margin-bottom:14px">Knowledge gaps</h3><ul class="bullet">${gaps
    .map(
      (g) => `<li class="${g.blocking_kind === "Blocking" ? "blocking" : ""}">
      <b>${esc(g.statement)}</b><br>
      <span style="display:inline-flex;gap:6px;margin-top:5px;flex-wrap:wrap">
        <span class="chip ${g.status === "Open" ? "warn" : "pass"}">${esc(g.status)}</span>
        <span class="chip ${g.severity === "High" ? "fail" : "pend"}">${esc(g.severity)}</span>
        <span class="chip pend">${esc(g.blocking_kind)}</span>
      </span><br>
      <span class="muted" style="font-size:12.5px">Owner: ${esc(roleLabel(g.owner_role))} · </span>${g.step ? `<button class="link-btn" data-step="${esc(g.step)}" style="font-size:12.5px">${esc(IX.step[g.step]?.title ?? g.step)}</button>` : ""}
    </li>`
    )
    .join("")}</ul></div>`;
  h += `<div class="card" style="padding:20px 22px"><h3 style="font-size:15px;margin-bottom:14px">Stewardship &amp; review cadence</h3>
    <div class="scroll-x"><table><thead><tr><th>Procedure version</th><th>Steward</th><th>Authority</th><th>Cadence</th><th>Valid from</th></tr></thead><tbody>${stew
      .map(
        (s) => `<tr><td class="mono">${esc(s.procedure_version)}</td>
      <td>${esc(roleLabel(s.steward_role))}</td><td>${esc(roleLabel(s.authority_role))}</td>
      <td class="mono">${esc(s.review_cadence_days)} days</td>
      <td class="mono">${dt(s.valid_from)}</td></tr>`
      )
      .join("")}</tbody></table></div></div>`;
  return h;
}

function viewQueue() {
  const pend = (T.step_executions || []).filter((s) => s.verification_result === "PENDING");
  const crs = (T.change_requests || []).filter((c) => c.status === "UnderReview");
  let h = head("Awaiting Me", "Only what needs a decision, and what each decision commits you to. Approving is an act with a named authority behind it.");
  h += `<div class="notice"><span class="ni">Authority</span><div>Approvals are recorded against a role, not a person. The preparer may never be the approver — that separation is a blocking requirement.</div></div>`;
  if (pend.length) {
    h += `<h3 style="font-size:14px;margin-bottom:12px" class="eyebrow">Step approvals</h3>`;
    pend.forEach((se) => {
      const s = IX.step[se.step];
      const ex = IX.exe[se.procedure_execution];
      const reqIds = (T.step_requirements || []).filter((r) => r.step === se.step).map((r) => r.requirement);
      const sats = (T.requirement_satisfactions || []).filter((r) => r.step_execution === se.step_execution_id);
      h += `<div class="card" style="padding:20px 22px;margin-bottom:14px">
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:11px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <div class="eyebrow" style="margin-bottom:5px">${esc(ex?.context ?? "")}</div>
            <h3 style="font-size:17px">${esc(s.title)}</h3></div>
          <span class="chip pend">Pending</span>
        </div>
        <p class="prose" style="margin:0 0 13px">${esc(s.instruction)}</p>
        <div style="padding:13px 15px;background:var(--paper);border-radius:5px;border:1px solid var(--rule-soft);margin-bottom:12px">
          <div class="eyebrow" style="margin-bottom:8px">Approving this asserts</div>
          <ul class="bullet">${reqIds
            .map((id) => {
              const r = IX.req[id];
              if (!r) return "";
              const sat = sats.find((x) => x.requirement === id);
              return `<li class="${r.is_blocking ? "blocking" : ""}"><b>${esc(r.label)}</b> — ${esc(r.statement)}
              ${sat ? `<br><span class="chip ${sat.satisfaction_level === "Satisfied" ? "pass" : "warn"}" style="margin-top:4px">${esc(sat.satisfaction_level)}</span>
              <span class="muted" style="font-size:12px;margin-left:6px">${esc(sat.evidence)}</span>` : ""}</li>`;
            })
            .join("")}</ul>
        </div>
        <button class="link-btn" data-step="${esc(s.step_id)}" data-se="${esc(se.step_execution_id)}">Review full record →</button>
      </div>`;
    });
  }
  if (crs.length) {
    h += `<h3 style="font-size:14px;margin:26px 0 12px" class="eyebrow">Change requests under review</h3>`;
    crs.forEach((c) => {
      h += `<div class="card" style="padding:20px 22px;margin-bottom:14px">
        <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:9px">
          <div style="flex:1;min-width:200px"><div class="eyebrow">${esc(c.change_kind)} · ${esc(c.procedure_version)}</div>
          <h3 style="font-size:17px">${esc(c.title)}</h3></div>
          <span class="chip warn">${esc(c.status)}</span></div>
        <p class="prose muted" style="margin:0 0 10px">${esc(c.impact_assessment ?? "")}</p>
        <div class="step-meta"><span>Requested by ${esc(agentName(c.requested_by_agent))}</span><span>·</span>
          <span>Authority: ${esc(roleLabel(c.authority_role))}</span><span>·</span>
          <span class="mono">${dt(c.requested_at)}</span></div>
      </div>`;
    });
  }
  return h;
}

function viewChanges() {
  let h = head("Change Requests", "How the specification changes, and on whose authority. Each request names the version it targets and the authority role that must clear it.");
  h += `<div class="card" style="padding:0;overflow:hidden;margin-bottom:20px"><div class="scroll-x"><table>
    <thead><tr><th>Request</th><th>Version</th><th>Kind</th><th>Status</th><th>Requested by</th><th>Authority</th><th>When</th></tr></thead><tbody>${(T.change_requests || [])
      .map(
        (c) => `<tr>
      <td><b>${esc(c.title)}</b>${c.impact_assessment ? `<div class="muted serif" style="font-size:13px;margin-top:4px">${esc(c.impact_assessment)}</div>` : ""}</td>
      <td class="mono">${esc(c.procedure_version)}</td>
      <td><span class="kind">${esc(c.change_kind)}</span></td>
      <td><span class="chip ${c.status === "Approved" ? "pass" : "warn"}">${esc(c.status)}</span></td>
      <td>${esc(agentName(c.requested_by_agent))}</td>
      <td>${esc(roleLabel(c.authority_role))}</td>
      <td class="mono" style="font-size:12px">${dt(c.requested_at)}</td></tr>`
      )
      .join("")}</tbody></table></div></div>`;
  h += `<div class="card" style="padding:0;overflow:hidden;margin-bottom:20px"><div style="padding:16px 20px 0"><h3 style="font-size:15px">Review events</h3></div><div class="scroll-x"><table>
    <thead><tr><th>Version</th><th>Kind</th><th>Reviewer</th><th>Outcome</th><th>Reviewed</th><th>Next due</th></tr></thead><tbody>${(T.review_events || [])
      .map(
        (r) => `<tr><td class="mono">${esc(r.procedure_version)}</td>
      <td><span class="kind">${esc(r.review_kind)}</span></td>
      <td>${esc(agentName(r.reviewed_by_agent))}</td>
      <td><span class="chip ${/Approv|Pass|Confirm/i.test(r.outcome ?? "") ? "pass" : "warn"}">${esc(r.outcome)}</span></td>
      <td class="mono" style="font-size:12px">${dt(r.reviewed_at)}</td>
      <td class="mono" style="font-size:12px">${dt(r.next_review_due)}</td></tr>`
      )
      .join("")}</tbody></table></div></div>`;
  h += `<div class="card" style="padding:0;overflow:hidden"><div style="padding:16px 20px 0"><h3 style="font-size:15px">Status changes</h3></div><div class="scroll-x"><table>
    <thead><tr><th>Version</th><th>From</th><th>To</th><th>By</th><th>When</th></tr></thead><tbody>${(T.procedure_status_changes || [])
      .map(
        (s) => `<tr><td class="mono">${esc(s.procedure_version)}</td>
      <td><span class="chip pend">${esc(s.from_status ?? "—")}</span></td>
      <td><span class="chip ${s.to_status === "Approved" ? "pass" : "warn"}">${esc(s.to_status)}</span></td>
      <td>${esc(agentName(s.changed_by_agent))}</td>
      <td class="mono" style="font-size:12px">${dt(s.changed_at)}</td></tr>`
      )
      .join("")}</tbody></table></div></div>`;
  return h;
}

function viewEvidence() {
  const sats = T.requirement_satisfactions || [];
  const blocking = (T.requirements || []).filter((r) => r.is_blocking);
  let h = head("Evidence Trail", "Every requirement that was evaluated, the evidence recorded, and the agent who evaluated it. Read-only: an auditor reconstructs, never edits.");
  h += `<div class="strip">
    <div class="tile"><div class="tile-l">Requirements</div><div class="tile-v">${(T.requirements || []).length}</div><div class="tile-s">${blocking.length} blocking</div></div>
    <div class="tile"><div class="tile-l">Evaluated</div><div class="tile-v b">${sats.length}</div><div class="tile-s">satisfaction records</div></div>
    <div class="tile"><div class="tile-l">Fully satisfied</div><div class="tile-v ok">${sats.filter((s) => s.satisfaction_level === "Satisfied").length}</div><div class="tile-s">with evidence</div></div>
    <div class="tile"><div class="tile-l">Partial</div><div class="tile-v w">${sats.filter((s) => s.satisfaction_level !== "Satisfied").length}</div><div class="tile-s">still open</div></div>
  </div>`;
  h += `<div class="card" style="padding:0;overflow:hidden;margin-bottom:20px"><div class="scroll-x"><table>
    <thead><tr><th>Requirement</th><th>Step execution</th><th>Level</th><th>Evidence</th><th>Evaluated by</th></tr></thead><tbody>${sats
      .map((s) => {
        const r = IX.req[s.requirement];
        const se = IX.se[s.step_execution];
        const st = se ? IX.step[se.step] : null;
        return `<tr>
        <td><b>${esc(r?.label ?? s.requirement)}</b>${r ? `<div class="muted serif" style="font-size:12.5px;margin-top:3px">${esc(r.statement)}</div>` : ""}</td>
        <td>${st ? `<button class="link-btn" data-step="${esc(se.step)}" data-se="${esc(s.step_execution)}" style="font-size:12.5px">${esc(st.title)}</button>` : esc(s.step_execution)}
          <div class="mono muted" style="font-size:11px;margin-top:3px">${esc(s.step_execution)}</div></td>
        <td><span class="chip ${s.satisfaction_level === "Satisfied" ? "pass" : "warn"}">${esc(s.satisfaction_level)}</span></td>
        <td class="serif">${esc(s.evidence)}</td>
        <td>${esc(agentName(s.evaluated_by_agent))}<div class="kind">${esc(agentKind(s.evaluated_by_agent))}</div></td></tr>`;
      })
      .join("")}</tbody></table></div></div>`;
  h += `<div class="card" style="padding:0;overflow:hidden"><div style="padding:16px 20px 0"><h3 style="font-size:15px">Issues encountered during execution</h3></div><div class="scroll-x"><table>
    <thead><tr><th>Error</th><th>Step execution</th><th>Cause</th><th>Resolution</th><th>When</th></tr></thead><tbody>${(T.issue_occurrences || [])
      .map((i) => {
        const e = IX.err[i.error];
        return `<tr><td><b>${esc(e?.label ?? i.error)}</b></td>
        <td class="mono" style="font-size:12px">${esc(i.step_execution)}</td>
        <td class="serif">${esc(i.issue_cause)}</td>
        <td class="serif">${esc(i.issue_solution)}</td>
        <td class="mono" style="font-size:12px">${dt(i.occurred_at)}</td></tr>`;
      })
      .join("")}</tbody></table></div></div>`;
  return h;
}

function viewMappings() {
  const ms = T.semantic_mappings || [];
  const rel = (m) => (m.mapping_relation === "exact" ? "exact" : m.mapping_relation === "extension" ? "extension" : "aligned");
  const counts = { exact: 0, aligned: 0, extension: 0 };
  ms.forEach((m) => counts[rel(m)]++);
  let h = head("Ontology Mapping", "What each table means in PKO terms. The three relations are kept distinct on purpose — an extension is not relabelled as native to make the model look more PKO-pure.");
  h += `<div class="strip">
    <div class="tile"><div class="tile-l">Exact</div><div class="tile-v ok">${counts.exact}</div><div class="tile-s">native PKO 2.0.0 terms</div></div>
    <div class="tile"><div class="tile-l">Aligned</div><div class="tile-v b">${counts.aligned}</div><div class="tile-s">reused external standards</div></div>
    <div class="tile"><div class="tile-l">Extension</div><div class="tile-v x">${counts.extension}</div><div class="tile-s">not defined by PKO</div></div>
    <div class="tile"><div class="tile-l">Profile</div><div class="tile-v" style="font-size:15px">${esc(META.ontology_profile ?? "PKO 2.0.0")}</div><div class="tile-s">${esc(META.erb_pko_profile_version ?? "")} ERB profile</div></div>
  </div>`;
  h += `<div class="card" style="padding:0;overflow:hidden"><div class="scroll-x"><table>
    <thead><tr><th>Source path</th><th>Relation</th><th>Kind</th><th>Target IRI</th><th>Notes</th></tr></thead><tbody>${ms
      .map(
        (m) => `<tr><td class="mono"><b>${esc(m.source_path)}</b></td>
        <td><span class="rel rel-${rel(m)}">${esc(m.mapping_relation)}</span></td>
        <td><span class="kind">${esc(m.mapping_kind)}</span></td>
        <td class="mono" style="font-size:11.5px;word-break:break-all">${esc(m.target_iri)}</td>
        <td class="serif">${esc(m.notes ?? "")}</td></tr>`
      )
      .join("")}</tbody></table></div></div>`;
  return h;
}

// ---------- comms ----------
// The outbound pipeline: what is queued to send, and what actually went out.
// Every column here is a view column; suppression_reason and delivery_status
// are computed by Postgres from the channel policy, not decided here.
function viewComms() {
  const intents = T.send_intents || [];
  const deliveries = T.message_deliveries || [];
  const policies = T.communication_policies || [];
  const recips = by("recipients", "recipient_id");

  const who = (id) => recips[id]?.display_name ?? recips[id]?.email_address ?? id ?? "—";

  return `
    ${head("Communications", "Send intents and deliveries, scoped to your schema")}
    ${policies.length ? `
    <div class="card" style="padding:18px;margin-bottom:18px">
      <div class="eyebrow">Channel policy</div>
      <table class="grid"><thead><tr>
        <th>Channel</th><th>Quiet hours</th><th class="num">Max len</th>
        <th class="num">Max segs</th><th>Consent</th><th>Status</th>
      </tr></thead><tbody>
      ${policies.map((p) => `<tr>
        <td><b>${esc(p.channel)}</b></td>
        <td>${esc(p.quiet_hours_start ?? "—")} – ${esc(p.quiet_hours_end ?? "—")}</td>
        <td class="num">${p.max_message_length ?? "—"}</td>
        <td class="num">${p.max_segments ?? "—"}</td>
        <td>${p.consent_required ? "required" : "not required"}</td>
        <td>${esc(p.status ?? "—")}</td>
      </tr>`).join("")}
      </tbody></table>
    </div>` : ""}

    <div class="card" style="padding:18px;margin-bottom:18px">
      <div class="eyebrow">Send queue — ${intents.length}</div>
      ${intents.length ? `<table class="grid"><thead><tr>
        <th>Recipient</th><th>Proposed body</th><th class="num">Local hour</th>
        <th>Evaluated</th></tr></thead><tbody>
      ${intents.map((i) => `<tr>
        <td>${esc(who(i.recipient))}</td>
        <td class="prose" style="max-width:520px">${esc((i.proposed_body ?? "").slice(0, 160))}</td>
        <td class="num">${i.proposed_send_at_local_hour ?? "—"}</td>
        <td>${dt(i.evaluated_at)}</td>
      </tr>`).join("")}</tbody></table>`
      : `<p class="muted">Nothing queued.</p>`}
    </div>

    <div class="card" style="padding:18px">
      <div class="eyebrow">Delivered — ${deliveries.length}</div>
      ${deliveries.length ? `<table class="grid"><thead><tr>
        <th>Recipient</th><th>Sent</th><th>Status</th><th>Suppressed because</th>
        <th>Acknowledged</th></tr></thead><tbody>
      ${deliveries.map((d) => `<tr>
        <td>${esc(who(d.recipient))}</td>
        <td>${dt(d.sent_at)}</td>
        <td><span class="chip ${d.delivery_status === "Sent" ? "chip-ok" : "chip-warn"}">${esc(d.delivery_status ?? "—")}</span></td>
        <td>${esc(d.suppression_reason ?? "—")}</td>
        <td>${dt(d.acknowledged_at)}</td>
      </tr>`).join("")}</tbody></table>`
      : `<p class="muted">Nothing delivered yet.</p>`}
    </div>`;
}

const VIEWS = {
  ledger: viewLedger, run: viewRun, flow: viewFlow, catalog: viewCatalog,
  knowledge: viewKnowledge, health: viewHealth, queue: viewQueue,
  changes: viewChanges, evidence: viewEvidence, mappings: viewMappings,
  comms: viewComms,
  board: viewBoard, witnesses: viewWitnesses, loops: viewLoops, trace: viewTrace,
  inferences: viewInferences, tables: viewTables, record: viewRecord,
};

// Navigate to a tab that may belong to a DIFFERENT role than the current one.
//
// The popover is available on every screen, so "open the whole record →" can be
// clicked while the user is an Operator — and `record` is an Explorer tab. Just
// setting `tab` would silently snap back to the role's first tab (see render()),
// which looks like a dead link. So when the requested tab is not in the current
// role, switch to the role that owns it and load that role's data first.
function goTo(next) {
  if (!next) return render();
  if (!reachableTabs(role).includes(next)) {
    const owner = Object.keys(ROLES).find((r) => reachableTabs(r).includes(next));
    if (!owner) throw new Error(`No role owns tab '${next}'`);
    role = owner;
    tab = next;
    // The destination role may not have fetched its data yet.
    const needsExplore = owner === "explorer" && exploreCount("inferences") == null;
    const needsAdmin = owner === "admin" && adminCount("board") == null;
    if (needsExplore || needsAdmin) {
      return (needsExplore ? loadExplore() : loadAdmin()).then(render);
    }
  } else {
    tab = next;
  }
  render();
}

// ---------- access console ----------
const ACCESS_VIEWS = {
  "ac-principals": viewPrincipals,
  "ac-policies": viewPolicies,
  "ac-grants": viewGrants,
  "ac-witnesses": viewDenialWitnesses,
};

// Display identity comes from the token; ME.tabs / ME.tables come from the
// server, which computed them by listing the principal's own schema.
const CLAIMS = storedClaims() || {};

function renderIdentityBar() {
  const el = $("whoami");
  if (!el) return;
  el.innerHTML = `
    <span class="who-name">${esc(CLAIMS.name || CLAIMS.email || "—")}</span>
    <span class="who-role">${esc(CLAIMS.principal_label || CLAIMS.principal || "")}</span>
    ${CLAIMS.is_admin ? '<span class="chip chip-admin">admin</span>' : ""}
    <span class="who-schema mono">${esc(CLAIMS.schema || "")}</span>
    <button class="btn btn-ghost" id="signout">Sign out</button>`;
  const so = $("signout");
  if (so) so.onclick = signOut;
}

// A tab is offered only if the server said this principal can feed it. The
// admin/explorer/access screens read the catalog rather than domain tables, so
// they are always available to whoever can reach them.
const SELF_FEEDING = new Set([
  ...Object.keys(ADMIN_TABS), ...Object.keys(EXPLORE_TABS),
  ...ACCESS_TABS.map((t) => t.id),
]);

function reachableTabs(r) {
  const declared = ROLES[r].tabs;
  if (!Array.isArray(ME.tabs)) return declared;
  return declared.filter((t) => SELF_FEEDING.has(t) || ME.tabs.includes(t));
}

// An honest empty state. This principal's schema does not carry the tables
// these screens read -- which is the access model working, not a failure.
function emptyRoleHtml() {
  const have = (ME.tables || []).slice().sort();
  return `<div class="card" style="padding:26px;margin-top:26px">
    <h2 style="font-size:17px;margin-bottom:10px">Nothing here for
      ${esc(ROLES[role].label)}</h2>
    <p class="prose" style="margin:0 0 12px">None of this section's screens can
    be filled from <span class="mono">${esc(ME.schema || "your schema")}</span>.
    That is the access model doing its job: your principal is granted
    ${have.length} table(s), and these screens read others.</p>
    <p class="muted" style="font-size:13.5px;margin:0">Granted to you:
      <span class="mono">${esc(have.join(", ") || "none")}</span></p>
  </div>`;
}

// Hide role buttons this principal may not use. The API refuses them anyway;
// this only avoids offering a door that will not open.
function renderRoleButtons() {
  document.querySelectorAll(".role-btn[data-role]").forEach((b) => {
    const def = ROLES[b.dataset.role];
    const adminBlocked = Boolean(def?.adminOnly) && CLAIMS.is_admin !== true;
    const noScreens = def && reachableTabs(b.dataset.role).length === 0;
    b.hidden = adminBlocked || noScreens;
    b.setAttribute("aria-pressed", String(b.dataset.role === role));
  });
}

// ---------- render ----------
function render() {
  renderRoleButtons();
  renderIdentityBar();
  const tabs = reachableTabs(role);
  if (!tabs.length) {
    $("nav").innerHTML = "";
    $("view").innerHTML = emptyRoleHtml();
    return;
  }
  if (!tabs.includes(tab)) tab = tabs[0];
  $("nav").innerHTML = tabs
    .map((t) => {
      const n = tabCount(t);
      return `<button class="nav-btn" data-tab="${t}" ${t === tab ? 'aria-current="page"' : ""}>${esc(TABS[t])}${n != null ? `<span class="n">${n}</span>` : ""}</button>`;
    })
    .join("");
  const isAccess = ACCESS_TABS.some((t) => t.id === tab);
  $("view").innerHTML = isAccess
    ? ACCESS_VIEWS[tab]() + saveBarHtml()
    : VIEWS[tab]();
  if (isAccess) {
    wireAccess($("view"), render);
  }
  if (ADMIN_TABS[tab]) {
    wireAdmin(tab, goTo);
  }
  if (EXPLORE_TABS[tab]) {
    wireExplore(tab, goTo);
  }
  // The inference popover is available on every screen, not just the explorer:
  // any curated view can mark a value with data-cell and get the full
  // formula-and-inputs read on click.
  wireCells(document, goTo);
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.addEventListener("click", (e) => {
  const r = e.target.closest(".role-btn[data-role]");
  if (r) {
    role = r.dataset.role;
    if (role === "admin" && adminCount("board") == null) {
      $("view").innerHTML = `<div class="card" style="padding:24px">Loading the witness layer…</div>`;
      return loadAdmin().then(render).catch((err) => {
        $("view").innerHTML = `<div class="card" style="padding:24px">
          <h2 style="color:var(--fail);font-size:17px;margin-bottom:8px">Could not load the admin layer</h2>
          <p class="prose">${esc(err.message)}</p></div>`;
      });
    }
    if (role === "access" && accessCounts().principals == null) {
      $("view").innerHTML = `<div class="card" style="padding:24px">Loading the access model…</div>`;
      return loadAccessModel().then(render).catch((err) => {
        $("view").innerHTML = `<div class="card" style="padding:24px">
          <h2 style="color:var(--fail);font-size:17px;margin-bottom:8px">Could not load the access model</h2>
          <p class="prose">${esc(err.message)}</p></div>`;
      });
    }
    if (role === "explorer" && exploreCount("inferences") == null) {
      $("view").innerHTML = `<div class="card" style="padding:24px">Loading the field catalog…</div>`;
      return loadExplore().then(render).catch((err) => {
        $("view").innerHTML = `<div class="card" style="padding:24px">
          <h2 style="color:var(--fail);font-size:17px;margin-bottom:8px">Could not load the field catalog</h2>
          <p class="prose">${esc(err.message)}</p></div>`;
      });
    }
    return render();
  }
  const t = e.target.closest(".nav-btn[data-tab]");
  if (t) { tab = t.dataset.tab; return render(); }
  const a = e.target.closest('.role-btn[data-role="admin"]');
  if (a) return;
  const x = e.target.closest("[data-exec]");
  if (x) { execSel = x.dataset.exec; return render(); }
  const s = e.target.closest("[data-step]");
  if (s) return stepDetail(s.dataset.step, s.dataset.se);
});
$("dbg").onclick = closeDrawer;
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

// ---------- boot ----------
// Sign-in gate. The console is a view onto data the signed-in principal is
// allowed to see, so there is nothing meaningful to render before a token
// exists. renderLogin() replaces the whole page until one does.
if (!tokenIsLive()) {
  document.body.classList.add("login-mode");
  renderLogin(document.getElementById("app") || document.body);
} else {

// A failed load is shown as a real error with the real message. We never render
// an empty console that looks like "this domain has no procedures".
load()
  .then(() => {
    buildIndexes();
    // Start on a section this principal can actually populate.
    if (reachableTabs(role).length === 0) {
      const first = Object.keys(ROLES).find(
        (r) => !(ROLES[r].adminOnly && CLAIMS.is_admin !== true)
               && reachableTabs(r).length > 0);
      if (first) role = first;
    }
    execSel = T.procedure_executions?.[0]?.procedure_execution_id ?? null;
    if (META.pko_core_version_iri) {
      $("brandmark").textContent = META.ontology_profile ?? "PKO 2.0.0";
    }
    render();
  })
  .catch((err) => {
    $("view").innerHTML = `<div class="card" style="padding:26px;margin-top:26px">
      <h2 style="font-size:18px;margin-bottom:10px;color:var(--fail)">Could not load the register</h2>
      <p class="prose" style="margin:0 0 12px">${esc(err.message)}</p>
      <p class="muted" style="font-size:13.5px;margin:0">The API reads <span class="mono">vw_&lt;entity&gt;</span> views from
      <span class="mono">erb_procedural_knowledge_ontology</span>. If the database was never loaded, run:</p>
      <p class="mono" style="font-size:13px;margin-top:8px">./postgres-bootstrap/init-db.sh</p>
    </div>`;
  });
}
