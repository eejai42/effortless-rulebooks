import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function SpokesScreen({ screen, projectRulebook }) {
  const spokes = projectRulebook?.RulebookSourceSpokes?.data || [];
  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="cards">
        {spokes.map((s) => (
          <div key={s.SpokeId} className="card">
            <h3>{s.Kind} · {s.Direction}</h3>
            <div className="big" style={{ fontSize: 15 }}>{s.Name}</div>
            <div className="sub">{s.Purpose}</div>
            <div className="muted small" style={{ marginTop: 8 }}>{s.Authority || ""}</div>
          </div>
        ))}
        {!spokes.length && <p className="muted">No input spokes defined in this rulebook.</p>}
      </div>
    </>
  );
}
