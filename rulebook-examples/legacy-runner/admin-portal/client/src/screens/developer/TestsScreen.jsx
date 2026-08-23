import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function TestsScreen({ screen, projectRulebook }) {
  const framework = projectRulebook?.TestingFramework?.data || [];

  return (
    <>
      <ScreenHeader screen={screen} />
      <p className="muted">
        Conformance test runner wires to <span className="mono">take-test.py</span> per substrate.
        Live matrix (run → stream → cell updates) is the next iteration.
      </p>
      <table className="grid">
        <thead><tr><th>id</th><th>name</th><th>scope</th><th>path</th><th>purpose</th></tr></thead>
        <tbody>
          {framework.map((t) => (
            <tr key={t.TestId}>
              <td className="mono">{t.TestId}</td>
              <td>{t.Name}</td>
              <td><span className="pill">{t.Scope}</span></td>
              <td className="mono">{t.FilePath}</td>
              <td>{t.Purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
