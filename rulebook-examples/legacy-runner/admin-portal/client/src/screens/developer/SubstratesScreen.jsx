import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api, makeDomainApi } from "../../lib/api.js";
import { toast } from "../../lib/toast.js";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function SubstratesScreen({ screen, me }) {
  const { domain } = useParams();
  const dApi = useMemo(() => makeDomainApi(domain), [domain]);
  const canBuild = me?.role?.CanRunBuilds;

  const [subs, setSubs]           = useState([]);
  const [selected, setSelected]   = useState(null);
  const [catalog, setCatalog]     = useState({ fromRulebook: [], liveProxy: null });
  const [installed, setInstalled] = useState({ transpilers: [] });
  const [installing, setInstalling] = useState(null);
  const [removing, setRemoving]   = useState(null);

  const load = async () => {
    if (!domain) return;
    try {
      const [s, c, i] = await Promise.all([
        dApi.get("/api/substrates"),
        api.get("/api/tools/catalog"),
        dApi.get("/api/tools/installed"),
      ]);
      setSubs(s);
      setCatalog(c);
      setInstalled(i);
    } catch (e) { toast(e.message, "error"); }
  };

  useEffect(() => { load(); }, [domain]);

  const sel = subs.find((s) => s.SubstrateId === selected) || subs[0];

  const buildAll = async () => {
    toast("Building…");
    try {
      const r = await dApi.post("/api/build/all");
      toast(r.ok ? "Build complete" : "Build failed", r.ok ? "ok" : "error");
    } catch (e) { toast(e.message, "error"); }
  };

  const install = async (tool) => {
    setInstalling(tool.ToolId);
    try {
      const r = await dApi.post("/api/tools/install", {
        installUrl: tool.InstallUrl,
        outputPath: tool.OutputPath,
      });
      toast(r.ok ? `Installed ${tool.Name}` : "Install failed", r.ok ? "ok" : "error");
      await load();
    } catch (e) { toast(e.message, "error"); }
    setInstalling(null);
  };

  const norm = (s) => (s || "").toLowerCase().replace(/-/g, "");
  const installedKey = new Set((installed.transpilers || []).map((t) => norm(t.Name)));
  const notYetInstalled = (catalog.fromRulebook || []).filter((t) => !installedKey.has(norm(t.Name)));

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="story-banner" style={{ borderLeftColor: "#888" }}>
        Every tool that turns the rulebook into something — transpilers, the build orchestrator, conformance tests — driven by this domain's <code>effortless.json</code>. Substrates are PEER projections of the rulebook; no substrate is the reference, conformance is the proof.
      </div>

      {/* Section A — orchestration: the build pipeline that runs across every installed tool */}
      <h3 className="muted small" style={{ marginTop: 12 }}>
        ORCHESTRATION · build runs every installed transpiler, then verifies conformance
      </h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span className="muted small">
          <code>effortless build</code> → {installed.transpilers?.length || 0} transpilers fire → {subs.length} substrates regenerate → conformance tests verify they all compute identically.
        </span>
        <div className="spacer" style={{ flex: 1 }} />
        {canBuild && <button className="btn" onClick={buildAll}>Run build + tests</button>}
      </div>

      {/* Section B — installed transpilers / substrates */}
      <h3 className="muted small" style={{ marginTop: 12 }}>
        INSTALLED · {installed.transpilers?.length || 0} transpilers · {subs.length} substrates
      </h3>
      <div style={{ marginBottom: 12 }}>
        <span className="muted small"><code>effortless.json</code> controls what's installed for this domain.</span>
      </div>
      <div className="split">
        <div className="list-panel">
          {subs.map((s) => (
            <div key={s.SubstrateId}
                 className={`list-item ${s.SubstrateId === sel?.SubstrateId ? "active" : ""}`}
                 onClick={() => setSelected(s.SubstrateId)}>
              <div className="name">{s.Name} <span className="tag">{s.Technology}</span></div>
              <div className="meta">
                {s.RelativePath}
                {s.Maturity && <span className="pill" style={{ marginLeft: 6 }}>{s.Maturity}</span>}
                {s.CanBeAnswerKey && <span className="pill good" style={{ marginLeft: 4 }}>answer-key</span>}
                {s.exists === false && <span className="pill warn" style={{ marginLeft: 4 }}>not built</span>}
              </div>
            </div>
          ))}
          {subs.length === 0 && <div className="muted small" style={{ padding: 14 }}>No substrates yet — add one below.</div>}
        </div>
        <div className="detail-panel">
          {sel ? (
            <>
              <h3 style={{ marginTop: 0 }}>{sel.Name}</h3>
              <div className="kv">
                <div className="k">Technology</div>           <div className="v">{sel.Technology}</div>
                <div className="k">Path</div>                 <div className="v mono">{sel.RelativePath}</div>
                <div className="k">Transpiler source</div>    <div className="v"><span className="pill">{sel.TranspilerSource || "—"}</span></div>
                <div className="k">Maturity</div>             <div className="v"><span className="pill">{sel.Maturity || "—"}</span></div>
                <div className="k">Expressive completeness</div><div className="v"><span className="pill">{sel.ExpressiveCompleteness || "—"}</span></div>
                <div className="k">Can be answer key?</div>   <div className="v">{sel.CanBeAnswerKey ? "yes" : "no"}</div>
                <div className="k">Status</div>               <div className="v">{sel.Status || "—"}</div>
              </div>
              <p>{sel.Description}</p>
            </>
          ) : <div className="muted">No substrate selected.</div>}
        </div>
      </div>

      {/* Section C — catalog of available tools to add */}
      <h3 className="muted small" style={{ marginTop: 28 }}>
        AVAILABLE TO ADD · {notYetInstalled.length} tools
      </h3>
      <div className="muted small" style={{ marginBottom: 8 }}>
        Catalog: {(catalog.fromRulebook || []).length} total ·
        live proxy: {catalog.liveProxy?.transpilers ? Object.keys(catalog.liveProxy.transpilers).length : "offline"} routes
      </div>
      <div className="cards">
        {notYetInstalled.map((t) => (
          <div key={t.ToolId} className="card">
            <h3>{t.Category}</h3>
            <div className="big" style={{ fontSize: 15 }}>{t.Name}</div>
            <div className="sub">{t.Description}</div>
            <div className="muted small mono" style={{ marginTop: 6, wordBreak: "break-all" }}>{t.InstallUrl}</div>
            <div className="muted small">→ {t.OutputPath}</div>
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                disabled={installing === t.ToolId || !canBuild}
                onClick={() => install(t)}
              >
                {installing === t.ToolId ? "Installing…" : "Install"}
              </button>
            </div>
          </div>
        ))}
        {notYetInstalled.length === 0 && (
          <div className="muted small">Everything in the catalog is already installed.</div>
        )}
      </div>
    </>
  );
}
