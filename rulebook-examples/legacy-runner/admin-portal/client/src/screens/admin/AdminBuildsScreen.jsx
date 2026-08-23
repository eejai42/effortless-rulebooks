import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function AdminBuildsScreen({ screen, projects }) {
  const domains = projects?.projects || [];

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="story-banner" style={{ borderLeftColor: "#f3b03e" }}>
        Cross-domain build status. Click a domain to drop into developer mode for it.
      </div>

      <table className="grid">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Name</th>
            <th>Rulebook</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d.id}>
              <td className="mono">{d.id}</td>
              <td>{d.name}</td>
              <td className="mono small muted">{d.rulebookPath}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small" style={{ marginTop: 12 }}>
        Per-domain build telemetry is coming. For now the per-domain Builds page (under Developer)
        is the source of truth.
      </p>
    </>
  );
}
