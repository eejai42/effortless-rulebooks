import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function FramingScreen({ screen, projectRulebook }) {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const invariants = projectRulebook?.FramingInvariants?.data || [];
  const [selectedId, setSelectedId] = useState(params.get("invariant") || invariants[0]?.InvariantId);

  useEffect(() => {
    const p = params.get("invariant");
    if (p) setSelectedId(p);
  }, [params]);

  const selected = invariants.find((i) => i.InvariantId === selectedId);

  return (
    <>
      <ScreenHeader screen={screen || { Title: "Framing Invariants", Story: "The mistakes-to-avoid catalog. Each entry shows the wrong framing, the correct framing, why it matters, and which axiom it protects." }} />
      <div className="split">
        <div className="list-panel">
          {invariants.map((i) => (
            <div key={i.InvariantId}
                 className={`list-item ${i.InvariantId === selectedId ? "active" : ""}`}
                 onClick={() => { setSelectedId(i.InvariantId); navigate(`/docs/framing?invariant=${encodeURIComponent(i.InvariantId)}`); }}>
              <div className="name">{i.Name}</div>
              <div className="meta">
                <span className="tag">{i.Category}</span>
                <span className={`pill ${i.Severity === "critical" ? "warn" : ""}`} style={{ marginLeft: 4 }}>{i.Severity}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="detail-panel">
          {selected ? (
            <>
              <h3 style={{ marginTop: 0 }}>{selected.Name}</h3>
              <div className="kv">
                <div className="k">Category</div>  <div className="v"><span className="tag">{selected.Category}</span></div>
                <div className="k">Severity</div>  <div className="v"><span className={`pill ${selected.Severity === "critical" ? "warn" : ""}`}>{selected.Severity}</span></div>
                <div className="k">Status</div>    <div className="v">{selected.Status}</div>
                <div className="k">Violates</div>  <div className="v">
                  {selected.ViolatedAxiomId
                    ? <span className="pill clickable"
                            onClick={() => navigate(`/docs/methodology?tab=axioms&axiom=${encodeURIComponent(selected.ViolatedAxiomId)}`)}>
                        {selected.ViolatedAxiomId}
                      </span>
                    : "—"}
                </div>
              </div>
              <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
                <div className="card" style={{ borderLeft: "4px solid var(--bad)" }}>
                  <h3 style={{ color: "var(--bad)" }}>WRONG</h3>
                  <p>{selected.WrongFraming}</p>
                </div>
                <div className="card" style={{ borderLeft: "4px solid var(--good)" }}>
                  <h3 style={{ color: "var(--good)" }}>RIGHT</h3>
                  <p>{selected.CorrectFraming}</p>
                </div>
              </div>
              <h4>Why</h4>
              <p>{selected.Why}</p>
              {selected.ExampleContext && (
                <p className="muted small"><b>Example:</b> {selected.ExampleContext}</p>
              )}
            </>
          ) : <div className="muted">Select an invariant.</div>}
        </div>
      </div>
    </>
  );
}
