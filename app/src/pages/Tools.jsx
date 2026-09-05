import { useEffect, useState } from "react";
import { fetchRows, fetchDocs, fetchViewHealth, num } from "../api.js";
import { useTables } from "../hooks.js";
import { Async, Panel, Pill, DataTable, Definition, ExternalLink } from "../components.jsx";

export function Tools() {
  const state = useTables(["ProjectLocalServices", "ProjectLaunchProfiles", "RulebookSourceSpokes", "FormulaDialects"], async () => {
    const [services, profiles, spokes, dialects] = await Promise.all([
      fetchRows("ProjectLocalServices"),
      fetchRows("ProjectLaunchProfiles"),
      fetchRows("RulebookSourceSpokes"),
      fetchRows("FormulaDialects"),
    ]);
    const root = profiles.find((p) => p.domain === "domain-root");
    if (!root) throw new Error("ProjectLaunchProfiles has no row for domain-root");
    return {
      rootServices: services.filter((s) => s.launch_profile === root.project_launch_profile_id).sort((a, b) => num(a.sort_order) - num(b.sort_order)),
      spokes,
      dialects,
    };
  });

  return (
    <Async state={state} what="tools">
      {({ rootServices, spokes, dialects }) => (
        <>
          <section className="hero compact">
            <p className="eyebrow">Tools</p>
            <h1>Editor, API, CLI and diagnostics</h1>
            <p className="summary">
              Everything the root runs is modeled in <code>ProjectLocalServices</code>. The generated editor is the
              editing surface; this explorer is a read-only guide over the same views.
            </p>
          </section>

          <Panel eyebrow="Root services" title="Modeled local services">
            <DataTable
              rows={rootServices}
              rowKey="project_local_service_id"
              columns={[
                { key: "service_role", label: "Service" },
                { key: "local_url", label: "URL", render: (s) => <ExternalLink href={s.local_url} /> },
                { key: "health_url", label: "Health", render: (s) => (s.health_url ? <ExternalLink href={s.health_url} /> : "—") },
                { key: "is_complete", label: "Contract", render: (s) => <Pill value={s.is_complete ? "complete" : "incomplete"} /> },
              ]}
            />
          </Panel>

          <Panel eyebrow="Live" title="Generated API diagnostics">
            <ApiDiagnostics />
          </Panel>

          <Panel eyebrow="CLI" title="Rebuilding a project">
            <pre><code>{`# from any governed project directory
effortless build            # regenerate every enabled output spoke from the rulebook
effortless build -id        # include disabled transpilers for one build
python3 scripts/scan-project-slots.py effortless-rulebook/effortless-rulebook.json .   # root only: refresh slot witnesses`}</code></pre>
            <p className="muted">
              The rulebook JSON is HEAD. Edit it, run <code>effortless build</code>, and the editor container that watches
              the file rebuilds its database and API automatically. Never edit generated output.
            </p>
          </Panel>

          <Panel eyebrow="Input and output" title="Rulebook source spokes">
            <DataTable
              rows={spokes}
              rowKey="spoke_id"
              columns={[
                { key: "surface_label", label: "Surface" },
                { key: "kind", label: "Kind" },
                { key: "direction", label: "Direction", render: (r) => <Pill value={r.direction} tone="neutral" /> },
                { key: "authority", label: "Authority" },
                { key: "purpose", label: "Purpose" },
              ]}
            />
          </Panel>

          <Panel eyebrow="Formulas" title="Formula dialects">
            <DataTable
              rows={dialects}
              rowKey="dialect_id"
              columns={[
                { key: "dialect_label", label: "Dialect" },
                { key: "field_ref_syntax", label: "Field refs", render: (r) => <code>{r.field_ref_syntax}</code> },
                { key: "string_concat", label: "Concatenation" },
                { key: "example_formula", label: "Example", render: (r) => <code>{r.example_formula}</code> },
                { key: "primary_substrates", label: "Substrates" },
                { key: "status", label: "Status", render: (r) => <Pill value={r.status} /> },
              ]}
            />
          </Panel>
        </>
      )}
    </Async>
  );
}

function ApiDiagnostics() {
  const [state, setState] = useState({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDocs(), fetchViewHealth()])
      .then(([docs, health]) => !cancelled && setState({ status: "ready", docs, health }))
      .catch((error) => !cancelled && setState({ status: "error", error }));
    return () => {
      cancelled = true;
    };
  }, []);
  if (state.status === "loading") return <p className="muted">Querying /api/docs and /api/view-health…</p>;
  if (state.status === "error")
    return (
      <div className="panel error">
        <p>{state.error.message}</p>
      </div>
    );
  const { docs, health } = state;
  const broken = (health.views || []).filter((v) => v.ok !== true);
  return (
    <>
      <Definition
        items={[
          ["Rulebook served", docs.rulebookName],
          ["Generator", docs.generator],
          ["Views checked", health.checked],
          ["Broken views", <Pill value={health.brokenCount} tone={health.brokenCount === 0 ? "good" : health.brokenCount === 1 && broken[0]?.table === "__meta__" ? "neutral" : "bad"} />],
          ["Health verdict", <Pill value={health.ok ? "ok" : "not ok"} tone={health.ok ? "good" : "warn"} />],
        ]}
      />
      {broken.length > 0 && (
        <p className="muted">
          Broken: {broken.map((b) => b.table).join(", ")}.{" "}
          {broken.length === 1 && broken[0].table === "__meta__"
            ? "The __meta__ table is transpiler-ignored by design and has no vw_meta projection; every business view is healthy."
            : "A broken business view means the rulebook needs fixing; do not code around it."}
        </p>
      )}
      <p>
        Start here: <ExternalLink href="http://localhost:42441/api/docs" /> · <ExternalLink href="http://localhost:42441/api/view-health" /> ·{" "}
        <ExternalLink href="http://localhost:42441/api/rulespeak" />
      </p>
      <p>
        Generated documents: <ExternalLink href="/generated/rulespeak/rulespeak.html">RuleSpeak (HTML)</ExternalLink> ·{" "}
        <ExternalLink href="/generated/rulespeak/rulespeak.md">RuleSpeak (Markdown)</ExternalLink> ·{" "}
        <ExternalLink href="/generated/progress-report/progress-report.html">Progress report</ExternalLink> ·{" "}
        <ExternalLink href="/generated/progress-report/narrative.html">Delivery narrative</ExternalLink>
      </p>
    </>
  );
}
