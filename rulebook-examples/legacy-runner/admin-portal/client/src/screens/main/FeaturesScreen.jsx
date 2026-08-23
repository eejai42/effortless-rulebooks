import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api.js";
import { toast } from "../../lib/toast.js";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function FeaturesScreen({ screen, me }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [data, setData]       = useState({ headline: [], additional: [] });
  const [selectedId, setSelectedId] = useState(params.get("feature") || null);
  const [detail, setDetail]   = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(null);
  const [err, setErr]         = useState(null);

  const loadList = useCallback(async () => {
    const d = await api.get("/api/features");
    setData(d);
    if (!selectedId) setSelectedId((d.headline[0] || d.additional[0])?.FeatureId || null);
  }, [selectedId]);

  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    api.get(`/api/features/${encodeURIComponent(selectedId)}`).then(setDetail).catch((e) => setErr(String(e)));
  }, [selectedId]);

  useEffect(() => {
    const fid = params.get("feature");
    if (fid && fid !== selectedId) setSelectedId(fid);
  }, [params]);

  const canEdit = !!(me?.permissions || []).find((p) => p.Resource === "rulebook.entity" && p.Action === "update");

  const startEdit = () => {
    if (!detail) return;
    setDraft({ Name: detail.Name, ShortName: detail.ShortName, Tier: detail.Tier,
               Priority: detail.Priority, OneLineSummary: detail.OneLineSummary,
               ReadmeFilePath: detail.ReadmeFilePath, Status: detail.Status,
               RelatedAxiomId: detail.RelatedAxiomId || "" });
    setEditing(true); setErr(null);
  };

  const saveEdit = async () => {
    try {
      await api.patch(`/api/features/${encodeURIComponent(selectedId)}`,
        { ...draft, Priority: Number(draft.Priority) || 0, RelatedAxiomId: draft.RelatedAxiomId || null });
      setEditing(false);
      await loadList();
      setDetail(await api.get(`/api/features/${encodeURIComponent(selectedId)}`));
    } catch (e) { setErr(String(e.message || e)); }
  };

  const item = (f) => (
    <div key={f.FeatureId}
         className={`list-item ${f.FeatureId === selectedId ? "active" : ""}`}
         onClick={() => { setSelectedId(f.FeatureId); navigate(`/features?feature=${encodeURIComponent(f.FeatureId)}`); }}>
      <div className="name">{f.ShortName} <span className="muted small">· {f.Name}</span></div>
      <div className="meta">
        <span className="pill">{f.Status}</span>
        {f.IsReadmeStub && <span className="pill warn" style={{ marginLeft: 4 }}>stub README</span>}
        {f.RelatedAxiomId && <span className="tag" style={{ marginLeft: 4 }}>{f.RelatedAxiomId}</span>}
      </div>
    </div>
  );

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="split">
        <div className="list-panel">
          <h4 style={{ margin: "6px 10px" }}>Headline ({data.headline.length})</h4>
          {data.headline.map(item)}
          <h4 style={{ margin: "14px 10px 4px" }}>Additional ({data.additional.length})</h4>
          {data.additional.map(item)}
        </div>
        <div className="detail-panel">
          {!detail ? <div className="muted">Select a feature.</div>
          : editing ? (
            <>
              <h3 style={{ marginTop: 0 }}>Edit {detail.ShortName}</h3>
              <div className="kv">
                <div className="k">Name</div>
                <div className="v"><input value={draft.Name} onChange={(e) => setDraft({ ...draft, Name: e.target.value })} style={{ width: "100%" }} /></div>
                <div className="k">Tier</div>
                <div className="v">
                  <select value={draft.Tier} onChange={(e) => setDraft({ ...draft, Tier: e.target.value })}>
                    <option value="headline">headline</option>
                    <option value="additional">additional</option>
                  </select>
                </div>
                <div className="k">Status</div>
                <div className="v">
                  <select value={draft.Status} onChange={(e) => setDraft({ ...draft, Status: e.target.value })}>
                    <option value="shipped">shipped</option>
                    <option value="partial">partial</option>
                    <option value="planned">planned</option>
                  </select>
                </div>
                <div className="k">Priority</div>
                <div className="v"><input type="number" value={draft.Priority} onChange={(e) => setDraft({ ...draft, Priority: e.target.value })} /></div>
                <div className="k">Related axiom</div>
                <div className="v"><input value={draft.RelatedAxiomId} placeholder="ax-001" onChange={(e) => setDraft({ ...draft, RelatedAxiomId: e.target.value })} /></div>
              </div>
              <h4>One-line summary</h4>
              <textarea rows={3} style={{ width: "100%" }} value={draft.OneLineSummary}
                onChange={(e) => setDraft({ ...draft, OneLineSummary: e.target.value })} />
              {err && <p style={{ color: "var(--bad)" }}>{err}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn" onClick={saveEdit}>Save</button>
                <button className="btn secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ marginTop: 0 }}>{detail.Name}</h3>
                {canEdit && <button className="btn secondary" onClick={startEdit}>Edit</button>}
              </div>
              <div className="kv">
                <div className="k">Status</div>
                <div className="v"><span className={`pill ${detail.Status === "shipped" ? "" : "warn"}`}>{detail.Status}</span></div>
                <div className="k">Tier</div>
                <div className="v"><span className="pill">{detail.Tier}</span> · priority {detail.Priority}</div>
                <div className="k">Related axiom</div>
                <div className="v">
                  {detail.RelatedAxiomId
                    ? <span className="pill clickable"
                            onClick={() => navigate(`/docs/methodology?tab=axioms&axiom=${encodeURIComponent(detail.RelatedAxiomId)}`)}>
                        {detail.RelatedAxiomId}{detail.Axiom ? ` — ${detail.Axiom.ShortName}` : ""}
                      </span>
                    : "—"}
                </div>
                <div className="k">README</div>
                <div className="v mono">
                  {detail.ReadmeFilePath}
                  {detail.IsReadmeStub
                    ? <span className="pill warn" style={{ marginLeft: 6 }}>stub</span>
                    : <span className="pill" style={{ marginLeft: 6 }}>{detail.EffectiveReadmeLength} bytes</span>}
                </div>
              </div>
              <h4>Summary</h4>
              <p>{detail.OneLineSummary}</p>
              {detail.ReadmeOnDisk
                ? <><h4>README on disk</h4><pre style={{ whiteSpace: "pre-wrap", background: "var(--panel-2)", padding: 12, borderRadius: 4 }}>{detail.ReadmeOnDisk}</pre></>
                : <p className="muted small">No README file at <span className="mono">{detail.ReadmeFilePath}</span></p>}
            </>
          )}
        </div>
      </div>
    </>
  );
}
