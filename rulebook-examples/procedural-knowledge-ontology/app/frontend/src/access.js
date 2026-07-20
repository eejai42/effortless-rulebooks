// ---------------------------------------------------------------------------
// Access Control console (administrators only).
//
// Four views:
//   principals  who exists, what they can reach, and the over-privilege flags
//   policies    the vertical cut -- editable predicates, inference-backed ones
//               called out because that is the interesting capability
//   grants      the horizontal cut -- a field-by-field matrix per principal
//   witnesses   the denial tests, and whether they have actually been run
//
// Editing writes to the rulebook and then rebuilds the database from it. The
// UI never issues DDL; it cannot, and that is the point.
// ---------------------------------------------------------------------------

export const ACCESS_TABS = [
  { id: "ac-principals", label: "Principals" },
  { id: "ac-policies", label: "Row policies" },
  { id: "ac-grants", label: "Field grants" },
  { id: "ac-witnesses", label: "Denial witnesses" },
];

let MODEL = null;
let pendingEdits = [];
let grantState = { principal: null, table: null, fields: [] };

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[m]));

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("pko.token")}` };
}

export async function loadAccessModel() {
  const r = await fetch("/api/admin/access/model", { headers: authHeaders() });
  if (!r.ok) {
    // Do not render an empty console on failure -- that reads as "no access
    // rules exist", which is the opposite of the truth.
    const body = await r.text();
    throw new Error(`access model unavailable (${r.status}): ${body}`);
  }
  MODEL = await r.json();
  return MODEL;
}

export function accessCounts() {
  if (!MODEL) return {};
  return {
    principals: MODEL.principals.length,
    policies: MODEL.policies.length,
    denials: MODEL.denials.length,
    live: MODEL.live,
  };
}

// --- principals -------------------------------------------------------------
export function viewPrincipals() {
  if (!MODEL) return `<div class="pad">Loading…</div>`;
  const live = MODEL.live || {};
  return `
    <div class="ac-summary">
      <div class="ac-stat"><b>${MODEL.principals.length}</b><span>principals</span></div>
      <div class="ac-stat"><b>${live.policies ?? "?"}</b><span>policies live in Postgres</span></div>
      <div class="ac-stat"><b>${live.schemas ?? "?"}</b><span>role schemas</span></div>
      <div class="ac-stat"><b>${live.views ?? "?"}</b><span>narrowed views</span></div>
    </div>
    <p class="ac-note">
      Every number above is read from <code>pg_policies</code> and
      <code>information_schema</code> — what Postgres actually has, not what
      the rulebook intends. They agree only because the DDL is generated from
      the rulebook on every rebuild.
    </p>
    <table class="grid">
      <thead><tr>
        <th>Principal</th><th>Domain role</th><th>Org</th>
        <th class="num">Tables</th><th class="num">Policies</th>
        <th class="num">Grants</th><th>Schema</th><th>Flags</th>
      </tr></thead>
      <tbody>
      ${MODEL.principals.map((p) => `
        <tr class="${p.is_administrator ? "is-admin-row" : ""}">
          <td><b>${esc(p.label)}</b></td>
          <td><code>${esc(p.domain_role)}</code></td>
          <td>${esc(p.organization_scope || "—")}</td>
          <td class="num">${p.visible_table_count ?? "—"}</td>
          <td class="num">${p.policy_count ?? "—"}</td>
          <td class="num">${p.grant_count ?? "—"}</td>
          <td><code>${esc(p.schema_name)}</code></td>
          <td>
            ${p.is_administrator ? '<span class="chip chip-admin">admin</span>' : ""}
            ${p.has_no_access ? '<span class="chip chip-bad">no access</span>' : ""}
            ${p.is_over_privileged
              ? '<span class="chip chip-warn">over-privileged</span>' : ""}
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;
}

// --- policies ---------------------------------------------------------------
export function viewPolicies() {
  if (!MODEL) return `<div class="pad">Loading…</div>`;
  const inference = MODEL.policies.filter((p) => p.references_inference);
  const unrestricted = MODEL.policies.filter(
    (p) => p.is_unrestricted_non_admin_grant);

  return `
    <div class="ac-summary">
      <div class="ac-stat"><b>${MODEL.policies.length}</b><span>policies</span></div>
      <div class="ac-stat"><b>${inference.length}</b><span>inference-backed</span></div>
      <div class="ac-stat ${unrestricted.length ? "is-warn" : ""}">
        <b>${unrestricted.length}</b><span>unrestricted non-admin</span></div>
    </div>
    <p class="ac-note">
      An <b>inference-backed</b> predicate calls a <code>calc_*</code> function,
      so the cut depends on a field computed several hops down the DAG rather
      than on a stored column. That is what lets a one-line policy carry deep
      semantics — <code>is_open</code> below is derived, not stored.
    </p>
    <div class="ac-filter">
      <input id="ac-pol-filter" type="search"
             placeholder="filter by principal, table or predicate…">
    </div>
    <table class="grid" id="ac-pol-table">
      <thead><tr>
        <th>Principal</th><th>Table</th><th>Cmd</th>
        <th>Row predicate</th><th></th>
      </tr></thead>
      <tbody>
      ${MODEL.policies.map((p) => `
        <tr data-hay="${esc(
            `${p.principal} ${p.target_table} ${p.row_predicate}`.toLowerCase())}">
          <td><code>${esc(p.principal.replace("principal-", ""))}</code></td>
          <td>${esc(p.target_table)}</td>
          <td><span class="chip">${esc(p.command)}</span></td>
          <td>
            <input class="ac-pred" data-id="${esc(p.access_policy_id)}"
                   value="${esc(p.row_predicate || "")}"
                   placeholder="(no predicate — all rows)">
          </td>
          <td>
            ${p.references_inference
              ? '<span class="chip chip-inf">inference</span>' : ""}
            ${p.is_unrestricted_non_admin_grant
              ? '<span class="chip chip-warn">unrestricted</span>' : ""}
            ${p.is_unwitnessed_write
              ? '<span class="chip chip-bad">untested write</span>' : ""}
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;
}

// --- grants -----------------------------------------------------------------
export function viewGrants() {
  if (!MODEL) return `<div class="pad">Loading…</div>`;
  const tables = MODEL.tables.filter((t) => t.physical_view);
  return `
    <p class="ac-note">
      A field with no grant is <b>absent</b> from the principal's view, not
      blanked in it. Untick a column here, rebuild, and that column ceases to
      exist for that principal — selecting it raises
      <code>column does not exist</code>.
    </p>
    <div class="ac-picker">
      <label>Principal
        <select id="ac-grant-principal">
          ${MODEL.principals.map((p) =>
            `<option value="${esc(p.access_principal_id)}">${esc(p.label)}</option>`
          ).join("")}
        </select>
      </label>
      <label>Table
        <select id="ac-grant-table">
          ${tables.map((t) =>
            `<option value="${esc(t.table_name)}">${esc(t.table_name)}</option>`
          ).join("")}
        </select>
      </label>
      <button class="btn" id="ac-grant-load">Show fields</button>
    </div>
    <div id="ac-grant-matrix"></div>`;
}

export function renderGrantMatrix() {
  const el = document.getElementById("ac-grant-matrix");
  if (!el) return;
  const { fields, principal, table } = grantState;
  if (!fields.length) { el.innerHTML = ""; return; }
  const readable = fields.filter((f) => f.can_read).length;
  el.innerHTML = `
    <div class="ac-summary">
      <div class="ac-stat"><b>${readable}</b><span>of ${fields.length} readable</span></div>
      <div class="ac-stat"><b>${fields.length - readable}</b><span>absent from the view</span></div>
    </div>
    <table class="grid">
      <thead><tr><th>Read</th><th>Field</th><th>Kind</th><th>Formula</th></tr></thead>
      <tbody>
      ${fields.map((f) => `
        <tr>
          <td><input type="checkbox" class="ac-grant-cb"
                     data-field="${esc(f.rulebook_field_id)}"
                     data-grant="${esc(f.field_grant_id || "")}"
                     ${f.can_read ? "checked" : ""}></td>
          <td><code>${esc(f.field_name)}</code></td>
          <td><span class="chip chip-${esc(f.field_type)}">${esc(f.field_type)}</span></td>
          <td class="formula">${esc(f.formula || "")}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <p class="ac-note">Editing <code>${esc(principal)}</code> ×
       <code>${esc(table)}</code></p>`;
}

// --- witnesses --------------------------------------------------------------
export function viewWitnesses() {
  if (!MODEL) return `<div class="pad">Loading…</div>`;
  const d = MODEL.denials;
  const failing = d.filter((t) => t.has_run && !t.is_passing);
  const unproven = d.filter((t) => !t.has_run);
  const leaks = d.filter((t) => t.is_leak);
  return `
    <div class="ac-summary">
      <div class="ac-stat"><b>${d.length}</b><span>witnesses</span></div>
      <div class="ac-stat ${leaks.length ? "is-bad" : ""}">
        <b>${leaks.length}</b><span>leaks</span></div>
      <div class="ac-stat ${failing.length ? "is-bad" : ""}">
        <b>${failing.length}</b><span>failing</span></div>
      <div class="ac-stat ${unproven.length ? "is-warn" : ""}">
        <b>${unproven.length}</b><span>never run</span></div>
    </div>
    <p class="ac-note">
      A denial suite with no <b>positive controls</b> cannot tell a working
      policy from one that denies everything, so entitlement tests sit
      alongside the denials here. A witness that has never run proves nothing,
      however it is written.
    </p>
    <table class="grid">
      <thead><tr>
        <th>Witness</th><th>Principal</th><th>Table</th><th>Row</th>
        <th>Expected</th><th>Observed</th><th></th>
      </tr></thead>
      <tbody>
      ${d.map((t) => `
        <tr>
          <td>${esc(t.access_denial_test_id)}</td>
          <td><code>${esc((t.principal || "").replace("principal-", ""))}</code></td>
          <td>${esc(t.target_table)}</td>
          <td><code>${esc(t.forbidden_row_id)}</code></td>
          <td>${t.expected_visible ? "visible" : "hidden"}</td>
          <td>${t.has_run ? (t.observed_visible ? "visible" : "hidden") : "—"}</td>
          <td>
            ${!t.has_run ? '<span class="chip chip-warn">never run</span>'
              : t.is_leak ? '<span class="chip chip-bad">LEAK</span>'
              : t.is_passing ? '<span class="chip chip-ok">pass</span>'
              : '<span class="chip chip-bad">fail</span>'}
            ${t.is_positive_control
              ? '<span class="chip">control</span>' : ""}
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;
}

// --- edits + rebuild --------------------------------------------------------
export function queueEdit(edit) {
  pendingEdits = pendingEdits.filter(
    (e) => !(e.table === edit.table &&
             Object.values(e.row)[0] === Object.values(edit.row)[0]));
  pendingEdits.push(edit);
  updateSaveBar();
}

export function pendingCount() { return pendingEdits.length; }

function updateSaveBar() {
  const bar = document.getElementById("ac-savebar");
  if (!bar) return;
  bar.hidden = pendingEdits.length === 0;
  const n = bar.querySelector("#ac-pending-count");
  if (n) n.textContent = String(pendingEdits.length);
}

export async function saveAndRebuild(logEl) {
  const say = (cls, msg) => {
    const line = document.createElement("div");
    line.className = `ac-log-line ${cls}`;
    line.textContent = msg;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  };

  if (pendingEdits.length) {
    say("head", `Writing ${pendingEdits.length} edit(s) to the rulebook…`);
    const r = await fetch("/api/admin/access/edits", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ edits: pendingEdits }),
    });
    const body = await r.json();
    if (!r.ok) { say("bad", `Save failed: ${body.error}`); return false; }
    say("ok", `Rulebook updated: ${body.applied.join(", ")}`);
    pendingEdits = [];
    updateSaveBar();
  }

  say("head", "Rebuilding — this takes about a minute.");

  // fetch + ReadableStream rather than EventSource: this is a POST and needs
  // an Authorization header, neither of which EventSource supports.
  const res = await fetch("/api/admin/access/rebuild", {
    method: "POST", headers: authHeaders(),
  });
  if (!res.ok) { say("bad", `Rebuild refused (${res.status})`); return false; }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let ok = true;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const chunks = buf.split("\n\n");
    buf = chunks.pop();
    for (const chunk of chunks) {
      const ev = /^event: (.+)$/m.exec(chunk)?.[1];
      const dt = /^data: (.+)$/m.exec(chunk)?.[1];
      if (!ev || !dt) continue;
      const data = JSON.parse(dt);
      if (ev === "step") say("head", `[${data.index}/${data.total}] ${data.label}`);
      else if (ev === "log") say("", data.line);
      else if (ev === "warn") say("warn", data.message);
      else if (ev === "stepdone") say("ok", `✓ ${data.step}`);
      else if (ev === "failed") { ok = false; say("bad", `FAILED at ${data.step}`); }
      else if (ev === "done") say("ok", "Rebuild complete.");
    }
  }
  if (ok) {
    say("head", "Reloading the access model…");
    await loadAccessModel();
  }
  return ok;
}

export function wireAccess(root, rerender) {
  root.addEventListener("input", (e) => {
    const f = e.target.closest("#ac-pol-filter");
    if (f) {
      const q = f.value.toLowerCase();
      root.querySelectorAll("#ac-pol-table tbody tr").forEach((tr) => {
        tr.hidden = q && !tr.dataset.hay.includes(q);
      });
      return;
    }
    const pred = e.target.closest(".ac-pred");
    if (pred) {
      const id = pred.dataset.id;
      const row = MODEL.policies.find((p) => p.access_policy_id === id);
      queueEdit({
        table: "AccessPolicies", op: "upsert",
        row: {
          AccessPolicyId: id,
          Principal: row.principal,
          TargetTable: row.target_table,
          Command: row.command,
          RowPredicate: pred.value,
          CheckPredicate: row.check_predicate || "",
          Rationale: row.rationale || "",
          ReferencesInference: /calc_\w+\(/.test(pred.value),
          SemanticTypeIri: "urn:effortless:pko-extension#AccessPolicy",
        },
      });
    }
  });

  root.addEventListener("change", (e) => {
    const cb = e.target.closest(".ac-grant-cb");
    if (!cb) return;
    const fieldId = cb.dataset.field;
    const existing = cb.dataset.grant;
    const principal = grantState.principal;
    if (cb.checked) {
      queueEdit({
        table: "FieldGrants", op: "upsert",
        row: {
          FieldGrantId: existing ||
            `fg-${principal.replace("principal-", "")}-${fieldId}`,
          Principal: principal, TargetField: fieldId,
          CanRead: true, CanWrite: false, MaskStrategy: "plain",
          SemanticTypeIri: "urn:effortless:pko-extension#FieldGrant",
        },
      });
    } else if (existing) {
      queueEdit({ table: "FieldGrants", op: "delete",
                  row: { FieldGrantId: existing } });
    }
  });

  root.addEventListener("click", async (e) => {
    if (e.target.closest("#ac-grant-load")) {
      const principal = root.querySelector("#ac-grant-principal").value;
      const table = root.querySelector("#ac-grant-table").value;
      const r = await fetch(
        `/api/admin/access/grants?principal=${encodeURIComponent(principal)}` +
        `&table=${encodeURIComponent(table)}`, { headers: authHeaders() });
      const body = await r.json();
      grantState = { principal, table, fields: body.fields || [] };
      renderGrantMatrix();
      return;
    }
    if (e.target.closest("#ac-save-rebuild")) {
      const log = document.getElementById("ac-log");
      log.hidden = false;
      log.innerHTML = "";
      e.target.disabled = true;
      try {
        await saveAndRebuild(log);
        rerender?.();
      } finally {
        e.target.disabled = false;
      }
    }
  });
}

export function saveBarHtml() {
  return `
    <div class="ac-savebar" id="ac-savebar" hidden>
      <span><b id="ac-pending-count">0</b> pending change(s) to the rulebook</span>
      <button class="btn btn-primary" id="ac-save-rebuild">
        Save &amp; rebuild database
      </button>
    </div>
    <pre class="ac-log" id="ac-log" hidden></pre>`;
}
