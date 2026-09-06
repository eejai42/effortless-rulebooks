/**
 * Portable Explainer DAG — vanilla-JS client for any HTML host. Feature-parity
 * port of rulebook-to-explainer-dag-react:
 *   • Provenance toggle pill (top-right)      — glyphs on/off; OFF still allows dbl-click
 *   • Narration slider (RuleSpeak®·English·Formula) — global, remembered
 *   • Settings gear (top-right)               — checkboxes gating which sections
 *                                               show in the hover card AND the page
 *   • Hover micro-page over cells             — sticky, dialect follows narration
 *   • Double-click a cell                     — opens the full DAG page
 *   • Full field page                         — hero + table link, rule (RuleTree),
 *                                               inputs, consumers (direct+transitive),
 *                                               ground-truth leaves
 * Requires: embedded-graph.js, dag-resolver.js, routing.js, dag.css
 */
(function (global) {
  const R = () => global.EffortlessDagResolver;

  let config = { mode: "hash", basePath: "/rulebook-explainer-dag" };
  let routing = null;
  const CLOSE_DELAY_MS = 220;
  const CARD_W = 360;
  const SAFETY = 15;
  const GAP = 8;
  const MARGIN = 12;
  const EST_CARD_H = 300;
  let hoverCloseTimer = null;
  let activeHoverCard = null;

  // The page currently on screen, so a prefs change (narration / gear / glyphs)
  // can re-render IT — host-agnostic. Outlet/hash hosts and framework hosts that
  // render into their own container (e.g. the Angular DagFieldComponent's <div>)
  // both work, because we replay the exact last render call rather than relying
  // on a global outlet or the URL hash.
  let lastRender = null; // { kind: "index"|"table"|"field", container, table, field }
  function rerenderCurrent() {
    if (!lastRender || !lastRender.container || !lastRender.container.isConnected) return false;
    const { kind, container, table, field } = lastRender;
    if (kind === "field") renderFieldPage(container, table, field);
    else if (kind === "table") renderTablePage(container, table);
    else renderTablesIndex(container);
    return true;
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function humanizeField(name) { return R().humanizeField(name); }

  // Guarantee `routing` exists before any renderer runs. A host that calls a
  // render method (e.g. renderFieldPage) BEFORE init() — common with framework
  // routers that mount a component on hard-load before the explainer's own
  // init has run — would otherwise hit a null `routing` and render nothing (the
  // "works only after navigating away and back" bug). We lazily build a default
  // hash-routing so the first paint always works; a later init() with custom
  // routing replaces it.
  function ensureRouting() {
    if (routing) return routing;
    routing = global.EffortlessExplainerRouting.createRouting({
      mode: (config && config.mode) || "hash",
      hashPrefix: config && config.hashPrefix,
      fieldPath: config && config.fieldPath,
      tablePath: config && config.tablePath,
      indexPath: config && config.indexPath,
      homePath: config && config.homePath,
      htmxFieldUrl: config && config.htmxFieldUrl,
      routing: config && config.routing,
    });
    return routing;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PREFS — single source of truth (localStorage + a custom event), read
  //  synchronously so the first paint is already correct. Mirrors React
  //  lib/dagPrefs.ts plus the doc-element gating the gear controls.
  // ════════════════════════════════════════════════════════════════════════
  const PREFS_EVENT = "dag-prefs-changed";
  // Kept as the original key so existing hosts (e.g. the demo) stay compatible.
  const GLYPHS_KEY = "effortless-explainer-glyphs-on";
  const MODE_KEY = "dag.narrationMode";
  const ELEM_KEY = "dag.docElements";

  const NARRATION_MODES = ["rulespeak", "english", "formula"];
  const DEFAULT_MODE = "rulespeak";

  // The independent doc-element toggles the gear exposes. `key` drives the
  // page container class (show-<key>) and the hover-card section visibility.
  const DOC_ELEMENTS = [
    { key: "desc",      label: "Description", hint: "The field's plain-language description." },
    { key: "rulespeak", label: "RuleSpeak®",  hint: "The declarative business rule." },
    { key: "english",   label: "English",    hint: "The formula read as a plain sentence." },
    { key: "formula",   label: "Formula",    hint: "The raw spreadsheet-style formula." },
    { key: "inputs",    label: "Inputs",     hint: "The fields this one-line function calls." },
    { key: "consumers", label: "Consumers",  hint: "Fields whose function calls this one." },
  ];
  const DEFAULT_ELEMS = { desc: true, rulespeak: true, english: true, formula: true, inputs: true, consumers: true };

  const prefs = (function () {
    function glyphsOn() {
      return localStorage.getItem(GLYPHS_KEY) !== "false"; // default ON (host-friendly)
    }
    function setGlyphs(on) {
      localStorage.setItem(GLYPHS_KEY, on ? "true" : "false");
      fire();
    }
    function narrationMode() {
      const v = localStorage.getItem(MODE_KEY);
      return v && NARRATION_MODES.includes(v) ? v : DEFAULT_MODE;
    }
    function setNarrationMode(mode) {
      if (!NARRATION_MODES.includes(mode)) return;
      localStorage.setItem(MODE_KEY, mode);
      fire();
    }
    function docElements() {
      try {
        const raw = JSON.parse(localStorage.getItem(ELEM_KEY) || "null");
        if (raw && typeof raw === "object") return Object.assign({}, DEFAULT_ELEMS, raw);
      } catch { /* fall through */ }
      return Object.assign({}, DEFAULT_ELEMS);
    }
    function setDocElement(key, on) {
      const next = docElements();
      next[key] = !!on;
      localStorage.setItem(ELEM_KEY, JSON.stringify(next));
      fire();
    }
    function resetDocElements() {
      localStorage.removeItem(ELEM_KEY);
      fire();
    }
    // The space-separated `show-<key>` classes for the page container, computed
    // synchronously so the field page paints with the right sections up front.
    function docElementClasses() {
      const e = docElements();
      return DOC_ELEMENTS.filter((d) => e[d.key]).map((d) => `show-${d.key}`).join(" ");
    }
    function fire() { window.dispatchEvent(new Event(PREFS_EVENT)); }
    function subscribe(cb) {
      window.addEventListener(PREFS_EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(PREFS_EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    }
    return {
      glyphsOn, setGlyphs, narrationMode, setNarrationMode,
      docElements, setDocElement, resetDocElements, docElementClasses, subscribe,
    };
  })();

  // ════════════════════════════════════════════════════════════════════════
  //  SHARED RENDER HELPERS
  // ════════════════════════════════════════════════════════════════════════

  function ruleSpeakFor(table, field) { return R().ruleSpeakForField(table, field); }

  function renderFieldLink(table, field, label, className) {
    const a = document.createElement("a");
    a.href = routing.fieldHref(table, field);
    a.className = className || "dag-link";
    a.textContent = label;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      routing.navigate(table, field);
    });
    return a;
  }
  function renderTableLink(table, label, className) {
    const a = document.createElement("a");
    a.href = routing.tableHref(table);
    a.className = className || "dag-link";
    a.textContent = label;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      routing.navigateTable(table);
    });
    return a;
  }

  // ── Markdown emphasis (**kw**, *em*) → HTML, with field-ref linkification.
  // Mirrors React lib/rulespeak.ts (renderRuleMarkdown / linkifyText / renderRuleRich).
  function indexOfWord(hay, needle) {
    const lc = hay.toLowerCase(), target = needle.toLowerCase();
    let from = 0;
    while (from <= lc.length - target.length) {
      const idx = lc.indexOf(target, from);
      if (idx < 0) return -1;
      const before = idx === 0 ? "" : lc[idx - 1];
      const after = idx + target.length >= lc.length ? "" : lc[idx + target.length];
      if ((!before || !/[a-z0-9]/i.test(before)) && (!after || !/[a-z0-9]/i.test(after))) return idx;
      from = idx + 1;
    }
    return -1;
  }
  // Returns HTML string. refs become clickable fc-inline spans.
  function linkifyHtml(text, refs) {
    if (!text) return "";
    const sorted = (refs || []).filter((r) => r.label).slice().sort((a, b) => b.label.length - a.label.length);
    if (!sorted.length) return esc(text);
    let out = "", rest = text;
    while (true) {
      let bestIdx = -1, bestRef = null;
      for (const r of sorted) {
        const idx = indexOfWord(rest, r.label);
        if (idx >= 0 && (bestIdx === -1 || idx < bestIdx)) { bestIdx = idx; bestRef = r; if (idx === 0) break; }
      }
      if (bestIdx === -1 || !bestRef) { out += esc(rest); break; }
      if (bestIdx > 0) out += esc(rest.slice(0, bestIdx));
      const matched = rest.slice(bestIdx, bestIdx + bestRef.label.length);
      const tone = bestRef.tone || "calc";
      out += `<a class="fc-inline fc-inline-${tone}" href="${esc(refHref(bestRef.table, bestRef.field))}" data-ref-table="${esc(bestRef.table)}" data-ref-field="${esc(bestRef.field)}">${esc(matched)}</a>`;
      rest = rest.slice(bestIdx + bestRef.label.length);
    }
    return out;
  }
  // Bold/italic markdown + ref linkification inside the plain segments.
  function renderRuleRichHtml(md, refs) {
    if (!md) return "";
    const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let out = "", last = 0, m;
    while ((m = re.exec(md)) !== null) {
      if (m.index > last) out += linkifyHtml(md.slice(last, m.index), refs);
      if (m[1] !== undefined) out += `<strong class="dag-rs-kw">${esc(m[1])}</strong>`;
      else if (m[2] !== undefined) out += `<em>${esc(m[2])}</em>`;
      last = re.lastIndex;
    }
    if (last < md.length) out += linkifyHtml(md.slice(last), refs);
    return out;
  }
  // Tag each rulespeak ref with the referenced field's tone so links are color-coded.
  function tonedRefs(rs) {
    if (!rs || !rs.refs) return [];
    return rs.refs.map((r) => {
      const f = R().fieldOf(R().rulebook(), r.table, r.field);
      return Object.assign({}, r, { tone: R().typeTone((f && f.type) || "raw") });
    });
  }

  // ── Formula AST → HTML (clickable chips). Mirrors lib/renderJsx.tsx. ─────────
  const BINOP_LABEL = { "+": "+", "-": "−", "*": "×", "/": "÷", "&": "&", "=": "=", "<>": "≠", "<": "<", ">": ">", "<=": "≤", ">=": "≥" };
  function fmtNum(n) {
    if (Number.isInteger(n) && Math.abs(n) >= 1000) return n.toLocaleString("en-US");
    return String(n);
  }
  // Real href for a ref link (so chips/pills/inline refs behave like links —
  // cursor, focus, cmd/middle-click open-in-new-tab — and don't go dead if a JS
  // handler ever fails to bind). The click handler still intercepts for SPA nav.
  function refHref(table, field) {
    try { return (routing && routing.fieldHref) ? routing.fieldHref(table, field) : `#/dag/${encodeURIComponent(table)}/${encodeURIComponent(field)}`; }
    catch { return `#/dag/${encodeURIComponent(table)}/${encodeURIComponent(field)}`; }
  }
  function tableHrefSafe(table) {
    try { return (routing && routing.tableHref) ? routing.tableHref(table) : `#/dag/${encodeURIComponent(table)}`; }
    catch { return `#/dag/${encodeURIComponent(table)}`; }
  }
  function chipHtml(table, field, pageTable) {
    const node = R().fieldOf(R().rulebook(), table, field);
    const type = (node && node.type) || "raw";
    const tone = R().typeTone(type);
    const glyph = R().typeGlyph(type);
    const showTable = table && table !== pageTable;
    return `<a class="fc fc-${tone} fc-chip" href="${esc(refHref(table, field))}" data-ref-table="${esc(table)}" data-ref-field="${esc(field)}">` +
      `<span class="fc-glyph">${esc(glyph)}</span>` +
      (showTable ? `<span class="fc-table">${esc(table)}.</span>` : "") +
      `<span class="fc-name">${esc(humanizeField(field))}</span></a>`;
  }
  function formulaNodeHtml(node, pageTable, top) {
    switch (node.kind) {
      case "ref": return chipHtml(node.table || pageTable, node.field, pageTable);
      case "num": return `<span class="fx-num">${esc(fmtNum(node.value))}</span>`;
      case "str": return `<span class="fx-str">“${esc(node.value)}”</span>`;
      case "bool": return `<span class="fx-bool">${node.value ? "TRUE" : "FALSE"}</span>`;
      case "unary": return `−${formulaNodeHtml(node.arg, pageTable, false)}`;
      case "binop": {
        const inner = `${formulaNodeHtml(node.left, pageTable, false)} <span class="fx-op">${esc(BINOP_LABEL[node.op] || node.op)}</span> ${formulaNodeHtml(node.right, pageTable, false)}`;
        return top ? inner : `(${inner})`;
      }
      case "call": {
        const args = node.args.map((a, i) =>
          (i > 0 ? `<span class="fx-comma">,&nbsp;</span>` : "") + formulaNodeHtml(a, pageTable, false)).join("");
        return `<span class="fx-fn">${esc(node.fn.toLowerCase())}</span><span class="fx-paren">(</span>${args}<span class="fx-paren">)</span>`;
      }
    }
    return "";
  }
  function formulaHtml(formula, pageTable) {
    const ast = R().tryParseFormula(formula);
    if (!ast) return `<code class="fx-raw">${esc(formula)}</code>`;
    return `<span class="fx"><span class="fx-eq">= </span>${formulaNodeHtml(ast, pageTable, true)}</span>`;
  }

  // ── RuleTree (priority ladders / AND-OR) → HTML. Mirrors components/RuleTree.tsx.
  function ruleTreeHtml(node, refs) {
    function group(n) {
      const label = n.kind === "all" ? "all of these hold:" : "any of these hold:";
      const items = (n.children || []).map((ch) => `<li class="dag-rt-child">${cond(ch)}</li>`).join("");
      return `<span class="dag-rt-group dag-rt-${n.kind}"><span class="dag-rt-group-label">${label}</span><ul class="dag-rt-children">${items}</ul></span>`;
    }
    function cond(n) {
      if (n.kind === "leaf") return `<span class="dag-rt-leaf">${linkifyHtml(n.text || "", refs)}</span>`;
      return group(n);
    }
    function val(text) { return `<strong class="dag-rt-val">${linkifyHtml(text || "", refs)}</strong>`; }
    function render(n) {
      if (n.kind === "priority") {
        let html = "";
        if (n.headline) html += `<p class="dag-rt-headline">${linkifyHtml(n.headline, refs)}</p>`;
        if (n.cases && n.cases.length) {
          html += "<ol class=\"dag-rt-cases\">";
          for (const c of n.cases) {
            const isElse = c.when == null;
            if (isElse) html += `<li class="dag-rt-case dag-rt-else"><span class="dag-rt-case-val">otherwise ${val(c.value)}</span></li>`;
            else html += `<li class="dag-rt-case"><span class="dag-rt-case-val">${val(c.value)}</span><span class="dag-rt-if"> if </span>${cond(c.when)}</li>`;
          }
          html += "</ol>";
        }
        if (n.children && n.children.length) {
          html += `<div class="dag-rt-cond-block">${n.children.map((ch) => `<div>${cond(ch)}</div>`).join("")}</div>`;
        }
        return `<div class="dag-rt-priority">${html}</div>`;
      }
      if (n.kind === "all" || n.kind === "any") return group(n);
      return `<span class="dag-rt-leaf">${linkifyHtml(n.text || "", refs)}</span>`;
    }
    return `<div class="dag-rt">${render(node)}</div>`;
  }

  // Wire data-ref-table/field links (chips + inline refs + rule-tree refs) to navigation.
  function wireRefLinks(root) {
    root.querySelectorAll("[data-ref-table][data-ref-field]").forEach((a) => {
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        routing.navigate(a.getAttribute("data-ref-table"), a.getAttribute("data-ref-field"));
      });
    });
  }

  function typeBadgeHtml(type, size) {
    const tone = R().typeTone(type);
    return `<span class="tb tb-${tone} tb-${size || "md"}"><span class="tb-glyph">${esc(R().typeGlyph(type))}</span><span class="tb-label">${esc(R().typeLabel(type))}</span></span>`;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HEADER (back / home / crumbs + narration slider + gear)
  // ════════════════════════════════════════════════════════════════════════
  function renderHeader(crumbs) {
    const bar = document.createElement("div");
    bar.className = "dag-topbar";

    const left = document.createElement("div");
    left.className = "dag-nav-left";
    const back = document.createElement("button");
    back.type = "button"; back.className = "dag-back"; back.textContent = "← back";
    back.title = "Go back one step"; back.onclick = () => routing.onBack();
    left.appendChild(back);
    const home = document.createElement("button");
    home.type = "button"; home.className = "dag-home"; home.textContent = "🏠 Home";
    home.title = "Leave the explainer — back to the app"; home.onclick = () => routing.onHome();
    left.appendChild(home);

    if (crumbs && crumbs.length) {
      const trail = document.createElement("span");
      trail.className = "dag-crumb-trail";
      const sep0 = document.createElement("span"); sep0.className = "dag-crumb-sep"; sep0.textContent = "·";
      trail.appendChild(sep0);
      crumbs.forEach((c, i) => {
        if (i > 0) { const s = document.createElement("span"); s.className = "dag-crumb-sep"; s.textContent = "›"; trail.appendChild(s); }
        if (typeof c === "string") {
          const span = document.createElement("span"); span.className = "dag-crumb-text"; span.textContent = c; trail.appendChild(span);
        } else if (c.index) {
          const a = document.createElement("a"); a.className = "dag-crumb-index-link"; a.href = routing.cfg.mode === "hash" ? "#/dag" : indexPath();
          a.textContent = c.label || "Tables";
          a.onclick = (e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); routing.navigateTable(""); };
          trail.appendChild(a);
        } else if (c.table) {
          trail.appendChild(renderTableLink(c.table, c.table, "dag-crumb-table-link"));
        }
      });
      left.appendChild(trail);
    }
    bar.appendChild(left);

    const right = document.createElement("div");
    right.className = "dag-nav-right";
    right.appendChild(renderNarrationSlider());
    right.appendChild(renderGear());
    bar.appendChild(right);
    return bar;
  }

  // The global 3-way RuleSpeak®·English·Formula segmented control.
  const NARRATION_OPTIONS = [
    { value: "rulespeak", label: "RuleSpeak®", hint: "The declarative business rule (only if / must / priority)" },
    { value: "english",   label: "English",   hint: "The formula read as a plain English sentence" },
    { value: "formula",   label: "Formula",   hint: "The raw spreadsheet-style formula, with clickable fields" },
  ];
  function renderNarrationSlider() {
    const seg = document.createElement("div");
    seg.className = "dag-narr-seg"; seg.setAttribute("role", "radiogroup");
    seg.setAttribute("aria-label", "How to explain this rule");
    const mode = prefs.narrationMode();
    for (const o of NARRATION_OPTIONS) {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(mode === o.value));
      b.className = `dag-narr-seg-opt${mode === o.value ? " is-active" : ""} dag-narr-${o.value}`;
      b.title = o.hint; b.textContent = o.label;
      b.onclick = () => prefs.setNarrationMode(o.value);
      seg.appendChild(b);
    }
    return seg;
  }

  // The settings gear: a ⚙︎ button opening a popup of independent doc-element
  // checkboxes. Controls which sections show in the hover card AND the field page.
  function renderGear() {
    const wrap = document.createElement("div");
    wrap.className = "dag-gear-wrap";
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "dag-gear"; btn.textContent = "⚙︎";
    btn.title = "Settings — choose what shows in the hover card and on the field page";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Settings");
    wrap.appendChild(btn);

    let pop = null;
    function close() {
      if (pop) { pop.remove(); pop = null; }
      btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", onDocClick, true);
    }
    function onDocClick(e) { if (!wrap.contains(e.target)) close(); }
    function open() {
      pop = document.createElement("div");
      pop.className = "dag-gear-pop";
      const title = document.createElement("div");
      title.className = "dag-gear-pop-title"; title.textContent = "Show in popup & on page";
      pop.appendChild(title);
      const elems = prefs.docElements();
      for (const d of DOC_ELEMENTS) {
        const label = document.createElement("label");
        label.className = "dag-gear-opt";
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = !!elems[d.key];
        cb.onchange = () => prefs.setDocElement(d.key, cb.checked);
        const lab = document.createElement("span");
        lab.className = "dag-gear-opt-label"; lab.textContent = d.label;
        const hint = document.createElement("span");
        hint.className = "dag-gear-opt-hint"; hint.textContent = d.hint;
        label.appendChild(cb); label.appendChild(lab); label.appendChild(hint);
        pop.appendChild(label);
      }
      const reset = document.createElement("button");
      reset.type = "button"; reset.className = "dag-gear-reset"; reset.textContent = "Reset to all on";
      reset.onclick = () => { prefs.resetDocElements(); };
      pop.appendChild(reset);
      wrap.appendChild(pop);
      btn.setAttribute("aria-expanded", "true");
      // Defer so the opening click doesn't immediately close it.
      setTimeout(() => document.addEventListener("click", onDocClick, true), 0);
    }
    btn.onclick = (e) => { e.stopPropagation(); if (pop) close(); else open(); };
    return wrap;
  }

  function indexPath() {
    return global.EffortlessExplainerRouting.indexPath(routing.cfg);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PAGES
  // ════════════════════════════════════════════════════════════════════════
  function renderTablesIndex(container) {
    ensureRouting();
    lastRender = { kind: "index", container };
    container.innerHTML = "";
    container.className = "dag-page " + prefs.docElementClasses();
    container.appendChild(renderHeader([{ index: true }]));

    const hero = document.createElement("header");
    hero.className = "dag-hero dag-hero-calc";
    hero.innerHTML = `<h1 class="dag-title">The ontology</h1>` +
      `<p class="dag-subtitle"><span class="dag-subtitle-human">Every table in the rulebook. Click a table to see its columns.</span></p>`;
    container.appendChild(hero);

    const grid = document.createElement("div");
    grid.className = "dag-table-grid";
    for (const t of R().listTables()) {
      const card = renderTableLink(t.table, "", "dag-table-card");
      card.innerHTML =
        `<span class="dag-table-card-name">${esc(t.table)}</span>` +
        `<span class="dag-table-card-human">${esc(humanizeField(t.table))}</span>` +
        `<span class="dag-table-card-meta">${t.fieldCount} fields · ${t.derivedCount} derived · ${t.relationshipCount} rel</span>` +
        (t.description ? `<span class="dag-table-card-desc">${esc(t.description)}</span>` : "");
      grid.appendChild(card);
    }
    container.appendChild(grid);
    wireRefLinks(container);
  }

  function renderTablePage(container, table) {
    ensureRouting();
    lastRender = { kind: "table", container, table };
    container.innerHTML = "";
    container.className = "dag-page " + prefs.docElementClasses();
    container.appendChild(renderHeader([{ index: true }, { table }]));
    if (!R().tableExists(table)) {
      const d = document.createElement("div"); d.className = "muted"; d.textContent = "Table not found.";
      container.appendChild(d); return;
    }
    const mode = prefs.narrationMode();
    const hero = document.createElement("header");
    hero.className = "dag-hero dag-hero-rel";
    const desc = R().tableDescription(table);
    hero.innerHTML = `<h1 class="dag-title">${esc(table)}</h1>` +
      `<p class="dag-subtitle"><span class="dag-subtitle-human">${esc(humanizeField(table))}</span></p>` +
      (desc ? `<p class="dag-description">${esc(desc)}</p>` : "");
    container.appendChild(hero);

    const list = document.createElement("div");
    list.className = "dag-col-list";
    for (const col of R().tableColumns(table)) {
      const row = renderFieldLink(table, col.field, "", `dag-col dag-col-${R().typeTone(col.type)}`);
      let explain = "";
      if (col.type !== "raw" && col.type !== "relationship") {
        if (mode === "rulespeak") {
          const rs = ruleSpeakFor(table, col.field);
          if (rs && rs.rule) explain = renderRuleRichHtml(rs.rule, tonedRefs(rs));
        }
        if (!explain) {
          const eng = R().englishForFormula(col.formula);
          if (eng) explain = esc(eng) + ".";
        }
      }
      if (!explain && col.description) explain = esc(col.description);
      row.innerHTML =
        `<span class="dag-col-head">${typeBadgeHtml(col.type, "sm")}` +
        `<span class="dag-col-name">${esc(col.field)}</span>` +
        `<span class="dag-col-human">${esc(humanizeField(col.field))}</span>` +
        (col.nullable ? `<span class="dag-pill dag-pill-muted">nullable</span>` : "") + `</span>` +
        (explain ? `<span class="dag-col-explain">${explain}</span>` : "") +
        (col.type === "relationship" && col.relatedTo
          ? `<span class="dag-col-rel">→ <a class="dag-col-rel-link" href="${esc(tableHrefSafe(col.relatedTo))}" data-table-link="${esc(col.relatedTo)}">${esc(col.relatedTo)}</a></span>` : "");
      list.appendChild(row);
    }
    container.appendChild(list);
    // Relationship → related-table links inside column rows.
    container.querySelectorAll("[data-table-link]").forEach((a) => {
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey) return; e.preventDefault();
        e.stopPropagation();
        routing.navigateTable(a.getAttribute("data-table-link"));
      });
    });
    wireRefLinks(container);
  }

  function renderFieldPage(container, table, field) {
    ensureRouting();
    lastRender = { kind: "field", container, table, field };
    container.innerHTML = "";
    container.className = "dag-page " + prefs.docElementClasses();
    const dag = R().resolveDag(table, field);
    if (!dag) {
      container.appendChild(renderHeader([{ index: true }, { table }, field]));
      const d = document.createElement("div"); d.className = "muted"; d.textContent = "Field not found in rulebook.";
      container.appendChild(d); return;
    }
    const mode = prefs.narrationMode();
    const tone = R().typeTone(dag.type);
    const rs = ruleSpeakFor(table, field);
    const refs = tonedRefs(rs);

    container.appendChild(renderHeader([{ index: true }, { table: dag.table }, dag.field]));

    // Hero (with the owning table as a link).
    const hero = document.createElement("header");
    hero.className = `dag-hero dag-hero-${tone}`;
    let metaPills = typeBadgeHtml(dag.type, "md");
    if (dag.depth > 0) metaPills += `<span class="dag-pill dag-pill-depth">${dag.depth === 1 ? "1 hop from ground truth" : dag.depth + " hops from ground truth"}</span>`;
    metaPills += `<span class="dag-pill">${esc(dag.datatype)}</span>`;
    if (dag.nullable) metaPills += `<span class="dag-pill dag-pill-muted">nullable</span>`;
    hero.innerHTML =
      `<div class="dag-hero-meta">${metaPills}</div>` +
      `<h1 class="dag-title">${esc(dag.field)}</h1>` +
      `<p class="dag-subtitle"><a class="dag-subtitle-table dag-subtitle-table-link" href="${esc(tableHrefSafe(dag.table))}" data-table-link="${esc(dag.table)}">${esc(dag.table)}</a> · <span class="dag-subtitle-human">${esc(humanizeField(dag.field))}</span></p>` +
      (dag.description ? `<p class="dag-description elem elem-desc">${esc(dag.description)}</p>` : "");
    container.appendChild(hero);

    // The rule card.
    if (dag.type === "raw" || dag.type === "relationship") {
      container.appendChild(renderGroundTruthCard(dag));
    } else if (mode === "rulespeak") {
      container.appendChild(renderRuleSpeakCard(dag, rs, refs));
    } else if (mode === "english") {
      container.appendChild(renderEnglishCard(dag, refs));
    } else {
      container.appendChild(renderFormulaCard(dag));
    }

    if (dag.upstream.length) container.appendChild(renderInputsSection(dag.upstream, mode));
    container.appendChild(renderConsumersSection(dag.downstream, dag.consumerTransitive));
    if (dag.leaves.length) container.appendChild(renderLeavesSection(dag.leaves));

    // Wire all navigation.
    container.querySelectorAll("[data-table-link]").forEach((a) => {
      a.addEventListener("click", (e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); routing.navigateTable(a.getAttribute("data-table-link")); });
    });
    wireRefLinks(container);
  }

  function renderGroundTruthCard(dag) {
    const sec = document.createElement("section");
    sec.className = "dag-card dag-gt";
    const isRel = dag.type === "relationship";
    let body;
    if (isRel) {
      body = dag.relatedTo
        ? `This field is a pointer to <a class="dag-gt-rel-link" href="${esc(tableHrefSafe(dag.relatedTo))}" data-table-link="${esc(dag.relatedTo)}">${esc(dag.relatedTo)}</a>. It is not derived from anything else — it’s the link the rest of the DAG hangs off.`
        : `This field is a pointer to another table. It is not derived from anything else — it’s the link the rest of the DAG hangs off.`;
    } else {
      body = `This cell is a leaf. It is <em>written</em> directly to the database (datatype <code>${esc(dag.datatype)}</code>) and is not computed from anything else. Everything else upstream eventually traces back to values like this one.`;
    }
    sec.innerHTML =
      `<div class="dag-gt-glyph">${esc(R().typeGlyph(dag.type))}</div>` +
      `<div><h3 class="dag-gt-title">${isRel ? "Relationship pointer" : "Ground truth"}</h3>` +
      `<p class="dag-gt-body">${body}</p>` +
      (isRel && dag.relatedTo ? `<p class="dag-gt-rel-cta"><a class="dag-gt-rel-btn" href="${esc(tableHrefSafe(dag.relatedTo))}" data-table-link="${esc(dag.relatedTo)}">Open ${esc(dag.relatedTo)} →</a></p>` : "") +
      `</div>`;
    return sec;
  }

  function renderRuleSpeakCard(dag, rs, refs) {
    const sec = document.createElement("section");
    sec.className = "dag-card dag-rulespeak elem elem-rulespeak";
    let inner = `<h3 class="dag-card-title">This cell is the value of one declarative rule</h3>`;
    if (rs && rs.rule) {
      const mech = rs.mechanical ? ` <span class="dag-rs-mech" title="Faithful but clunky wording — a flag for an optional reword pass"> ⚠︎ mechanical</span>` : "";
      const ruleBody = rs.structure
        ? `<div class="dag-english-text">${ruleTreeHtml(rs.structure, refs)}</div>`
        : `<p class="dag-english-text">${renderRuleRichHtml(rs.rule, refs)}.</p>`;
      inner += `<div class="dag-english dag-rs-rule"><span class="dag-english-label">In RuleSpeak®${mech}</span>${ruleBody}</div>`;
    } else {
      inner += `<p class="dag-english-text muted">No declarative rule was rendered for this ${esc(dag.type)} field.</p>`;
    }
    const obls = R().obligationsForField(dag.table, dag.field);
    if (obls.length) {
      inner += `<div class="dag-rs-obligations"><span class="dag-english-label">Obligations</span><ul class="dag-rs-obl-list">` +
        obls.map((o) => `<li class="dag-rs-obl dag-rs-obl-${o.severity || "hard"}">${renderRuleRichHtml(o.markdown, refs)}</li>`).join("") +
        `</ul></div>`;
    }
    inner += `<p class="dag-formula-hint muted">${dag.formula ? "This is the same logic the formula encodes, written as a business rule — rendered from the rulebook by the shared RuleSpeak® engine." : "Rendered from the rulebook by the shared RuleSpeak® engine."}</p>`;
    sec.innerHTML = inner;
    return sec;
  }

  function renderEnglishCard(dag, refs) {
    const sec = document.createElement("section");
    sec.className = "dag-card dag-formula elem elem-english";
    const english = R().englishForFormula(dag.formula);
    let inner = `<h3 class="dag-card-title">This cell is the value of one one-line function</h3>`;
    if (english) {
      inner += `<div class="dag-english"><span class="dag-english-label">In English</span><p class="dag-english-text">${linkifyHtml(english, refs)}.</p></div>` +
        `<p class="dag-formula-hint muted">Each underlined field is itself a one-line function. Click any to drill in.</p>`;
    } else {
      inner += `<p class="dag-english-text muted">This ${esc(dag.type)} has no spreadsheet formula to read as a sentence — it is a roll-up defined structurally over a relationship. Switch to <strong>RuleSpeak®</strong> to see how it’s defined.</p>`;
    }
    sec.innerHTML = inner;
    return sec;
  }

  function renderFormulaCard(dag) {
    const sec = document.createElement("section");
    sec.className = "dag-card dag-formula elem elem-formula";
    let inner = `<h3 class="dag-card-title">This cell is the value of one one-line function</h3>`;
    if (dag.formula) {
      inner += `<div class="dag-formula-syntax"><span class="dag-formula-label">As a formula</span><div class="dag-formula-code">${formulaHtml(dag.formula, dag.table)}</div></div>` +
        `<p class="dag-formula-hint muted">Each chip is itself a one-line function. Click any chip to drill in.</p>`;
    } else {
      inner += `<p class="dag-english-text muted">This ${esc(dag.type)} has no spreadsheet formula — it is a roll-up defined structurally over a relationship. Switch to <strong>RuleSpeak®</strong> to see how it’s defined.</p>`;
    }
    sec.innerHTML = inner;
    return sec;
  }

  function renderInputsSection(upstream, mode) {
    const sec = document.createElement("section");
    sec.className = "dag-section elem elem-inputs";
    sec.innerHTML = `<h2 class="dag-section-title">▼ Inputs <span class="dag-count">${upstream.length}</span></h2>` +
      `<p class="dag-section-lead muted">Fields this one-line function calls.</p>`;
    const grid = document.createElement("div");
    grid.className = "dag-input-grid";
    for (const u of upstream) {
      const tone = R().typeTone(u.type);
      const card = renderFieldLink(u.table, u.field, "", `dag-input dag-input-${tone}`);
      let explain = "";
      if (mode === "rulespeak") {
        const rs = ruleSpeakFor(u.table, u.field);
        if (rs && rs.rule) explain = `<span class="dag-input-english dag-input-rulespeak">${renderRuleRichHtml(rs.rule, tonedRefs(rs))}</span>`;
      }
      if (!explain) {
        const eng = R().englishForFormula(u.formula);
        if (eng) explain = `<span class="dag-input-english">${esc(eng)}.</span>`;
      }
      if (!explain && u.description) explain = `<span class="dag-input-desc">${esc(u.description)}</span>`;
      if (!explain && u.type === "raw") explain = `<span class="dag-input-desc muted">Ground truth · datatype ${esc(u.datatype)}</span>`;
      card.innerHTML =
        `<span class="dag-input-head">${typeBadgeHtml(u.type, "sm")}` +
        `<span class="dag-input-name">${esc(u.field)}</span>` +
        `<span class="dag-input-table">${esc(u.table)}</span></span>` + explain;
      grid.appendChild(card);
    }
    sec.appendChild(grid);
    return sec;
  }

  function pillHtml(table, field) {
    const node = R().fieldOf(R().rulebook(), table, field);
    const type = (node && node.type) || "raw";
    const tone = R().typeTone(type);
    return `<a class="fc fc-${tone} fc-pill" href="${esc(refHref(table, field))}" data-ref-table="${esc(table)}" data-ref-field="${esc(field)}">` +
      `<span class="fc-glyph">${esc(R().typeGlyph(type))}</span>` +
      `<span class="fc-table">${esc(table)}.</span>` +
      `<span class="fc-name">${esc(humanizeField(field))}</span></a>`;
  }

  function renderConsumersSection(direct, transitive) {
    const sec = document.createElement("section");
    sec.className = "dag-section elem elem-consumers";
    const transitiveOnly = (transitive || []).filter((t) => !direct.some((d) => d.table === t.table && d.field === t.field));
    if (!direct.length && !transitiveOnly.length) {
      sec.innerHTML = `<h2 class="dag-section-title">▼ Consumers <span class="dag-count">0</span></h2>` +
        `<p class="muted">Nothing else in the rulebook references this cell yet.</p>`;
      return sec;
    }
    let inner = `<h2 class="dag-section-title">▼ Consumers <span class="dag-count">${direct.length} direct</span>` +
      (transitiveOnly.length ? `<span class="dag-count dag-count-muted">+${transitiveOnly.length} transitive</span>` : "") + `</h2>` +
      `<p class="dag-section-lead muted">Fields whose one-line function calls this one.</p>`;
    if (direct.length) {
      inner += `<div class="dag-pill-row">${direct.map((d) => pillHtml(d.table, d.field)).join("")}</div>`;
    }
    if (transitiveOnly.length) {
      inner += `<details class="dag-transitive"><summary>Show ${transitiveOnly.length} transitive consumers (downstream of downstream)</summary>` +
        `<div class="dag-pill-row dag-pill-row-faded">${transitiveOnly.map((t) => pillHtml(t.table, t.field)).join("")}</div></details>`;
    }
    sec.innerHTML = inner;
    return sec;
  }

  function renderLeavesSection(leaves) {
    const sec = document.createElement("section");
    sec.className = "dag-section dag-section-leaves";
    sec.innerHTML = `<h2 class="dag-section-title">▼ Ground truth at the leaves <span class="dag-count">${leaves.length}</span></h2>` +
      `<p class="dag-section-lead muted">Ultimately, this cell’s value depends on these raw values. Editing any of these and rebuilding propagates here automatically.</p>` +
      `<div class="dag-pill-row">${leaves.map((l) => pillHtml(l.table, l.field)).join("")}</div>`;
    return sec;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MODAL (routing mode === "modal")
  // ════════════════════════════════════════════════════════════════════════
  function ensureModal() {
    let modal = document.getElementById("effortless-explainer-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "effortless-explainer-modal";
    modal.className = "dag-modal hidden";
    modal.innerHTML =
      '<div class="dag-modal-backdrop"></div><div class="dag-modal-panel"><button type="button" class="dag-modal-close">×</button><div id="effortless-explainer-modal-body"></div></div>';
    document.body.appendChild(modal);
    modal.querySelector(".dag-modal-backdrop").onclick = closeModal;
    modal.querySelector(".dag-modal-close").onclick = closeModal;
    return modal;
  }
  function openModal(table, field) {
    const modal = ensureModal();
    renderFieldPage(modal.querySelector("#effortless-explainer-modal-body"), table, field);
    modal.classList.remove("hidden");
  }
  function closeModal() {
    const modal = document.getElementById("effortless-explainer-modal");
    if (modal) modal.classList.add("hidden");
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HOVER MICRO-PAGE over cells (sticky; dialect follows narration + gear)
  // ════════════════════════════════════════════════════════════════════════
  function cancelHoverClose() {
    if (hoverCloseTimer !== null) { clearTimeout(hoverCloseTimer); hoverCloseTimer = null; }
  }
  function removeHoverCard() {
    if (activeHoverCard) { activeHoverCard.remove(); activeHoverCard = null; }
  }
  function scheduleHoverClose() {
    cancelHoverClose();
    hoverCloseTimer = setTimeout(() => { removeHoverCard(); hoverCloseTimer = null; }, CLOSE_DELAY_MS);
  }
  function positionHoverCard(shell, anchor) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cardW = Math.min(CARD_W, vw - 2 * MARGIN);
    const cardLeft = Math.min(Math.max(anchor.right - cardW, MARGIN), vw - cardW - MARGIN);
    const spaceBelow = vh - anchor.bottom - GAP - MARGIN;
    const spaceAbove = anchor.top - GAP - MARGIN;
    const placeBelow = spaceBelow >= EST_CARD_H || spaceBelow >= spaceAbove;
    const maxH = Math.max(120, placeBelow ? spaceBelow : spaceAbove);
    let cardTop = placeBelow ? anchor.bottom + GAP : anchor.top - GAP - Math.min(EST_CARD_H, maxH);
    cardTop = Math.min(Math.max(cardTop, MARGIN), vh - MARGIN - Math.min(EST_CARD_H, maxH));
    shell.style.position = "fixed";
    shell.style.left = `${cardLeft - SAFETY}px`;
    shell.style.top = `${cardTop - SAFETY}px`;
    shell.style.setProperty("--dag-card-maxh", `${Math.round(maxH)}px`);
  }

  function hoverDialectHtml(dag, mode, elems) {
    // Raw / relationship cells have no rule to narrate.
    if (dag.type === "raw") {
      return `<span class="dag-hovercard-gt">Ground truth — written directly to the database${dag.datatype ? ` (datatype <code>${esc(dag.datatype)}</code>)` : ""}.</span>`;
    }
    if (dag.type === "relationship") {
      return `<span class="dag-hovercard-gt">Relationship pointer — the link the rest of the DAG hangs off.</span>`;
    }
    if (mode === "rulespeak" && elems.rulespeak) {
      const rs = ruleSpeakFor(dag.table, dag.field);
      const body = rs && rs.rule
        ? `<span class="dag-hovercard-english-text">${renderRuleRichHtml(rs.rule, tonedRefs(rs))}.</span>`
        : `<span class="dag-hovercard-english-text dag-hovercard-muted">No declarative rule rendered.</span>`;
      return `<span class="dag-hovercard-english"><span class="dag-hovercard-label">In RuleSpeak®</span>${body}</span>`;
    }
    if (mode === "english" && elems.english) {
      const rs = ruleSpeakFor(dag.table, dag.field);
      const eng = R().englishForFormula(dag.formula);
      const body = eng
        ? `<span class="dag-hovercard-english-text">${linkifyHtml(eng, tonedRefs(rs))}.</span>`
        : `<span class="dag-hovercard-english-text dag-hovercard-muted">No formula — a structural roll-up. See RuleSpeak®.</span>`;
      return `<span class="dag-hovercard-english"><span class="dag-hovercard-label">In English</span>${body}</span>`;
    }
    if (mode === "formula" && elems.formula) {
      const body = dag.formula
        ? `<span class="dag-hovercard-formula-code">${formulaHtml(dag.formula, dag.table)}</span>`
        : `<span class="dag-hovercard-english-text dag-hovercard-muted">No formula — a structural roll-up. See RuleSpeak®.</span>`;
      return `<span class="dag-hovercard-formula"><span class="dag-hovercard-label">As a formula</span>${body}</span>`;
    }
    return ""; // current dialect disabled in settings → show nothing for it
  }

  function openHoverCard(table, field, anchor) {
    cancelHoverClose();
    removeHoverCard();
    const dag = R().resolveDag(table, field);
    if (!dag || !anchor) return;
    const tone = R().typeTone(dag.type);
    const mode = prefs.narrationMode();
    const elems = prefs.docElements();

    const shell = document.createElement("span");
    shell.className = "dag-hovercard-shell dag-hovercard-shell-fixed";
    shell.addEventListener("mouseenter", cancelHoverClose);
    shell.addEventListener("mouseleave", scheduleHoverClose);

    let inputsHtml = "";
    if (elems.inputs && dag.upstream.length) {
      inputsHtml = `<span class="dag-hovercard-inputs"><span class="dag-hovercard-label">Inputs <span class="dag-hovercard-count">${dag.upstream.length}</span></span>` +
        `<span class="dag-hovercard-input-row">${dag.upstream.map((u) => pillHtml(u.table, u.field)).join("")}</span></span>`;
    }

    shell.innerHTML =
      `<span class="dag-hovercard dag-hovercard-${tone}" role="dialog">` +
      `<span class="dag-hovercard-head">${typeBadgeHtml(dag.type, "sm")}` +
      `<span class="dag-hovercard-where"><span class="dag-hovercard-table">${esc(table)}</span>` +
      `<span class="dag-hovercard-dot">·</span><span class="dag-hovercard-field">${esc(humanizeField(field))}</span></span></span>` +
      (elems.desc && dag.description ? `<span class="dag-hovercard-desc">${esc(dag.description)}</span>` : "") +
      hoverDialectHtml(dag, mode, elems) +
      inputsHtml +
      `<span class="dag-hovercard-hint">Double-click the cell to open the full DAG page.</span>` +
      `</span>`;

    wireRefLinks(shell);
    positionHoverCard(shell, anchor);
    document.body.appendChild(shell);
    activeHoverCard = shell;
  }

  function attachHoverToGlyph(glyphEl, table, field) {
    glyphEl.addEventListener("mouseenter", () => openHoverCard(table, field, glyphEl.getBoundingClientRect()));
    glyphEl.addEventListener("mouseleave", scheduleHoverClose);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INLINE CELL ENHANCEMENT (data-er-dag="Table.Field")
  // ════════════════════════════════════════════════════════════════════════
  function dagType(table, field) {
    const f = R().fieldOf(R().rulebook(), table, field);
    return (f && f.type) || "calculated";
  }
  function enhanceCells(root) {
    ensureRouting();
    root = root || document;
    const glyphsOn = prefs.glyphsOn();
    root.querySelectorAll("[data-er-dag]").forEach((el) => {
      if (el.dataset.erEnhanced) return;
      const spec = el.dataset.erDag;
      if (!spec || !spec.includes(".")) return;
      const [table, field] = spec.split(".", 2);
      if (!R().isDerivedField(table, field)) return;
      el.dataset.erEnhanced = "1";
      el.classList.add("dag-cell");
      if (!glyphsOn) el.classList.add("dag-cell-quiet");
      el.title = glyphsOn
        ? "Hover the badge to peek; double-click to open the full DAG page"
        : "Double-click to see provenance (toggle ƒ glyphs in header)";

      const tone = R().typeTone(dagType(table, field));
      const badge = document.createElement("span");
      badge.className = "dag-cell-badge-wrap";
      const link = renderFieldLink(table, field, "", `dag-cell-fx dag-cell-fx-${tone}`);
      const glyph = document.createElement("span");
      glyph.className = "dag-cell-fx-glyph";
      glyph.textContent = R().typeGlyph(dagType(table, field));
      link.appendChild(glyph);
      attachHoverToGlyph(glyph, table, field);
      badge.appendChild(link);
      el.appendChild(badge);

      el.addEventListener("dblclick", (e) => {
        if (e.target.closest("a, button, input, select, textarea")) return;
        e.preventDefault();
        routing.navigate(table, field);
      });
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ROUTING DISPATCH
  // ════════════════════════════════════════════════════════════════════════
  function parseHashRoute() {
    const h = (window.location.hash || "").replace(/^#/, "");
    const m = h.match(/^\/dag\/([^/]+)(?:\/([^/]+))?/);
    if (!m) return null;
    return { table: decodeURIComponent(m[1]), field: m[2] ? decodeURIComponent(m[2]) : null };
  }
  function parsePathRoute() {
    const path = window.location.pathname;
    const m = path.match(/\/dag\/?([^/]*)\/?([^/]*)/);
    if (!m) return null;
    return { table: m[1] ? decodeURIComponent(m[1]) : null, field: m[2] ? decodeURIComponent(m[2]) : null };
  }
  function renderFromHash() {
    const outlet = document.getElementById("effortless-explainer-outlet");
    if (!outlet) return;
    const route = routing.cfg.mode === "path" ? parsePathRoute() : parseHashRoute();
    if (!route || (!route.table && !route.field)) { renderTablesIndex(outlet); return; }
    if (route.table && route.field) renderFieldPage(outlet, route.table, route.field);
    else if (route.table) renderTablePage(outlet, route.table);
    else renderTablesIndex(outlet);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PROVENANCE TOGGLE PILL (styled — glyph + label + knob; is-on/is-off)
  // ════════════════════════════════════════════════════════════════════════
  function setGlyphsOn(on) {
    prefs.setGlyphs(on);
    document.querySelectorAll(".dag-cell").forEach((el) => el.classList.toggle("dag-cell-quiet", !on));
  }
  function syncTogglePill(btn) {
    const on = prefs.glyphsOn();
    btn.className = `dag-toggle ${on ? "is-on" : "is-off"}`;
    btn.title = on
      ? "Hide ƒ provenance glyphs. Double-click on cells still opens the DAG."
      : "Show ƒ provenance glyphs on cells with explorable provenance.";
    btn.setAttribute("aria-pressed", String(on));
    btn.innerHTML =
      `<span class="dag-toggle-glyph">ƒ</span>` +
      `<span class="dag-toggle-label">${on ? "Provenance · ON" : "Provenance · off"}</span>` +
      `<span class="dag-toggle-knob" aria-hidden="true"></span>`;
  }
  function mountToggle(container) {
    container = container || document.body;
    const btn = document.createElement("button");
    btn.type = "button";
    syncTogglePill(btn);
    btn.onclick = () => setGlyphsOn(!prefs.glyphsOn());
    // Keep the pill in sync if prefs change elsewhere.
    prefs.subscribe(() => syncTogglePill(btn));
    container.appendChild(btn);
    return btn;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════════════════
  let _outletWired = false;
  let _prefsWired = false;
  function init(opts) {
    config = Object.assign({}, config, opts || {});
    routing = global.EffortlessExplainerRouting.createRouting({
      mode: config.mode || "hash",
      hashPrefix: config.hashPrefix,
      fieldPath: config.fieldPath,
      tablePath: config.tablePath,
      indexPath: config.indexPath,
      homePath: config.homePath,
      htmxFieldUrl: config.htmxFieldUrl,
      routing: config.routing,
    });

    if (config.enhance !== false) enhanceCells(document);
    if (config.mountToggle) {
      mountToggle(typeof config.mountToggle === "string" ? document.querySelector(config.mountToggle) : config.mountToggle);
    }

    // Re-render the page on screen when a pref changes (narration mode, gear
    // doc-element toggles, glyphs) so the choice takes effect live. Wired ONCE
    // and host-agnostic: outlet/hash hosts re-render from the hash, while hosts
    // that render into their own container (frameworks) re-render that same
    // container via lastRender. Without this, a framework host's narration
    // slider / gear would appear dead because nothing re-rendered.
    if (!_prefsWired) {
      prefs.subscribe(() => {
        if (document.getElementById("effortless-explainer-outlet")) renderFromHash();
        else rerenderCurrent();
      });
      _prefsWired = true;
    }

    if (document.getElementById("effortless-explainer-outlet")) {
      renderFromHash();
      if (!_outletWired) {
        window.addEventListener("hashchange", renderFromHash);
        _outletWired = true;
      }
    }

    return { routing, enhanceCells, renderFromHash, openModal, closeModal, setGlyphsOn, rerenderCurrent };
  }

  global.EffortlessExplainer = {
    init,
    enhanceCells,
    renderTablesIndex,
    renderTablePage,
    renderFieldPage,
    renderFromHash,
    openModal,
    closeModal,
    setGlyphsOn,
    mountToggle,
    rerenderCurrent,
    prefs,
  };
})(typeof window !== "undefined" ? window : globalThis);
