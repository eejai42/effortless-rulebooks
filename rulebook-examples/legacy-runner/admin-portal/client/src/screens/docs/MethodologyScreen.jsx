import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function MethodologyScreen({ screen, projectRulebook }) {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const invariants = projectRulebook?.FramingInvariants?.data || [];
  const axioms     = projectRulebook?.OntologyAxioms?.data || [];

  const tab = params.get("tab") === "invariants" ? "invariants" : "axioms";
  const [selectedId, setSelectedId] = useState(params.get("axiom") || params.get("invariant") || axioms[0]?.AxiomId);

  useEffect(() => {
    const a = params.get("axiom"), i = params.get("invariant");
    if (a) setSelectedId(a);
    else if (i) setSelectedId(i);
  }, [params]);

  const setTab = (t) => navigate(`/docs/methodology?tab=${t}`);

  const selected = tab === "axioms"
    ? axioms.find((a) => a.AxiomId === selectedId)
    : invariants.find((i) => i.InvariantId === selectedId);

  return (
    <>
      <ScreenHeader screen={screen || { Title: "Methodology", Story: "Ontology axioms (positive-form load-bearing claims) and framing invariants (mistakes that violate those axioms)." }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className={`btn ${tab === "axioms" ? "" : "secondary"}`} onClick={() => setTab("axioms")}>
          Axioms ({axioms.length})
        </button>
        <button className={`btn ${tab === "invariants" ? "" : "secondary"}`} onClick={() => setTab("invariants")}>
          Framing Invariants ({invariants.length})
        </button>
      </div>

      {tab === "axioms" && (
        <div className="split">
          <div className="list-panel">
            {axioms.map((a) => (
              <div key={a.AxiomId}
                   className={`list-item ${a.AxiomId === selectedId ? "active" : ""}`}
                   onClick={() => { setSelectedId(a.AxiomId); navigate(`/docs/methodology?tab=axioms&axiom=${encodeURIComponent(a.AxiomId)}`); }}>
                <div className="name">{a.ShortName}</div>
                <div className="meta"><span className="tag">{a.AxiomId}</span></div>
              </div>
            ))}
          </div>
          <div className="detail-panel">
            {selected ? (
              <>
                <h3 style={{ marginTop: 0 }}>{selected.ShortName}</h3>
                <p style={{ fontSize: 17 }}>{selected.Statement}</p>
                <h4>Why</h4><p>{selected.Why}</p>
                {selected.Implication && <><h4>Implication</h4><p>{selected.Implication}</p></>}
                <h4>Framing invariants that violate this axiom</h4>
                <ul>
                  {invariants.filter((i) => i.ViolatedAxiomId === selected.AxiomId).map((i) => (
                    <li key={i.InvariantId} className="clickable"
                        onClick={() => navigate(`/docs/framing?invariant=${encodeURIComponent(i.InvariantId)}`)}>
                      {i.Name}
                    </li>
                  ))}
                </ul>
              </>
            ) : <div className="muted">Select an axiom.</div>}
          </div>
        </div>
      )}

      {tab === "invariants" && (
        <div className="split">
          <div className="list-panel">
            {invariants.map((i) => (
              <div key={i.InvariantId}
                   className={`list-item ${i.InvariantId === selectedId ? "active" : ""}`}
                   onClick={() => { setSelectedId(i.InvariantId); navigate(`/docs/methodology?tab=invariants&invariant=${encodeURIComponent(i.InvariantId)}`); }}>
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
                  <div className="k">Severity</div> <div className="v"><span className={`pill ${selected.Severity === "critical" ? "warn" : ""}`}>{selected.Severity}</span></div>
                  <div className="k">Violates</div> <div className="v">
                    {selected.ViolatedAxiomId
                      ? <span className="pill clickable" onClick={() => navigate(`/docs/methodology?tab=axioms&axiom=${encodeURIComponent(selected.ViolatedAxiomId)}`)}>{selected.ViolatedAxiomId}</span>
                      : "—"}
                  </div>
                </div>
                <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
                  <div className="card" style={{ borderLeft: "4px solid var(--bad)" }}>
                    <h3 style={{ color: "var(--bad)" }}>WRONG</h3><p>{selected.WrongFraming}</p>
                  </div>
                  <div className="card" style={{ borderLeft: "4px solid var(--good)" }}>
                    <h3 style={{ color: "var(--good)" }}>RIGHT</h3><p>{selected.CorrectFraming}</p>
                  </div>
                </div>
                <h4>Why</h4><p>{selected.Why}</p>
              </>
            ) : <div className="muted">Select an invariant.</div>}
          </div>
        </div>
      )}
    </>
  );
}
