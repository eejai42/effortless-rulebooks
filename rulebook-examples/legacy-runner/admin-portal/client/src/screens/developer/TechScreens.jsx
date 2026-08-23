import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api, makeDomainApi, withDomain } from "../../lib/api.js";
import { toast } from "../../lib/toast.js";
import ScreenHeader from "../../components/ScreenHeader.jsx";

function formatCell(v) {
  if (v === null || v === undefined) return <span className="muted">—</span>;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function TechPostgresScreen({ screen }) {
  const { domain } = useParams();
  const dApi = useMemo(() => makeDomainApi(domain), [domain]);
  const [tables, setTables] = useState([]);
  const [sql, setSql] = useState("SELECT entity_name, jsonb_array_length(data_json) AS rows FROM portal_rulebook_entities ORDER BY 1;");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!domain) return;
    dApi.get("/api/tech/postgres/tables").then((r) => setTables(r.tables || [])).catch(() => {});
  }, [domain]);

  const run = async () => {
    try { setResult(await dApi.post("/api/tech/postgres/query", { sql })); }
    catch (e) { toast(e.message, "error"); }
  };

  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="muted small" style={{ marginBottom: 8 }}>Editor DB tables: {tables.length}</div>
      <table className="grid">
        <thead><tr><th>schema</th><th>table</th></tr></thead>
        <tbody>{tables.map((t, i) => <tr key={i}><td>{t.table_schema}</td><td>{t.table_name}</td></tr>)}</tbody>
      </table>
      <h4 style={{ marginTop: 20 }}>SQL</h4>
      <textarea rows={4} value={sql} onChange={(e) => setSql(e.target.value)} />
      <div style={{ marginTop: 8 }}><button className="btn" onClick={run}>Run query</button></div>
      {result && (
        <>
          <h4>Result ({result.rowCount} rows)</h4>
          {result.rows?.length ? (
            <div style={{ overflowX: "auto" }}>
              <table className="grid">
                <thead><tr>{result.fields.map((f) => <th key={f}>{f}</th>)}</tr></thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i}>{result.fields.map((f) => <td key={f}>{formatCell(r[f])}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="muted">No rows.</div>}
        </>
      )}
    </>
  );
}

export function TechProxyScreen({ screen }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    api.get("/api/tech/proxy/status").then(setStatus).catch((e) => setStatus({ error: e.message }));
  }, []);
  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="editor">{JSON.stringify(status, null, 2)}</div>
    </>
  );
}

export function TechFilesScreen({ screen }) {
  return (
    <>
      <ScreenHeader screen={screen} />
      <p className="muted">Filesystem browser is read-only. Consult Effortless Tools for generated output trees.</p>
    </>
  );
}

export function TechJsonScreen({ screen }) {
  const { domain } = useParams();
  const [text, setText] = useState("");
  const load = () => {
    if (!domain) return;
    fetch(withDomain("/api/tech/rulebook-json", domain)).then((r) => r.text()).then(setText);
  };
  useEffect(() => { load(); }, [domain]);

  const save = async () => {
    try {
      JSON.parse(text); // local syntax check
      if (!text || !text.trim()) throw new Error("nothing to save — textarea is empty");
      const res = await fetch(withDomain("/api/tech/rulebook-json", domain), {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: text,
      });
      if (!res.ok) {
        let serverMsg = "";
        try { serverMsg = (await res.json()).error || ""; } catch { serverMsg = await res.text(); }
        throw new Error(`HTTP ${res.status}: ${serverMsg || "save rejected by server"}`);
      }
      toast("Saved rulebook JSON (and rebooted editor DB).");
    } catch (e) { toast("Invalid JSON or save failed: " + e.message, "error"); }
  };

  return (
    <>
      <ScreenHeader screen={screen} />
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button className="btn secondary" onClick={load}>Reload from disk</button>
        <button className="btn" onClick={save}>Save</button>
      </div>
      <textarea rows={30} value={text} onChange={(e) => setText(e.target.value)} />
    </>
  );
}

export function TechResetScreen({ screen }) {
  const { domain } = useParams();
  const dApi = useMemo(() => makeDomainApi(domain), [domain]);
  const [busy, setBusy] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [importing, setImporting] = useState(false);
  const reset = async () => {
    if (!confirm("Drop the editor Postgres DB and rebuild from rulebook JSON?")) return;
    setBusy(true);
    try {
      await dApi.post("/api/tech/reset");
      toast("Editor DB rebuilt from rulebook JSON.");
    } catch (e) { toast(e.message, "error"); }
    setBusy(false);
  };
  const launch = async () => {
    setLaunching(true);
    try {
      const r = await dApi.post("/api/tech/launch");
      if (r.url) { toast(`App launched → ${r.url}`); window.open(r.url, "_blank", "noopener"); }
      else toast(`App launched (pid ${r.pid}) — URL not auto-detected; check ${r.logPath || "start.sh log"}`, "info");
    } catch (e) { toast(e.message, "error"); }
    setLaunching(false);
  };
  const importFromPg = async () => {
    if (!confirm(
      "Import from Postgres ADOPTS the current database (including any edits/new rows made in the app or portal) as the rulebook's new RAW seed data. " +
      "This overwrites human-authored raw values. Continue?"
    )) return;
    setImporting(true);
    try {
      const r = await dApi.post("/api/tech/import-from-postgres", { confirm: true });
      toast("Imported Postgres → rulebook. " + (String(r.output || "").split("\n").find((l) => l.includes("updated")) || "Done."));
    } catch (e) { toast(e.message, "error"); }
    setImporting(false);
  };
  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="card" style={{ maxWidth: 480, marginBottom: 16 }}>
        <h3>Safe operation</h3>
        <p>Drops the per-project editor Postgres database and re-bootstraps from the rulebook JSON on disk. The rulebook JSON is the durable SSoT — no business data is lost.</p>
        <button className="btn danger" disabled={busy} onClick={reset}>
          {busy ? "Resetting…" : "Reset editor DB now"}
        </button>
      </div>

      <div className="card" style={{ maxWidth: 480, marginBottom: 16 }}>
        <h3>Launch this domain's app</h3>
        <p>Runs the domain's <code>start.sh</code> on the server and opens its test URL. Domains without an app return a clear error.</p>
        <button className="btn" disabled={launching} onClick={launch}>
          {launching ? "Launching…" : "Launch app & open"}
        </button>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3>Postgres ↔ rulebook</h3>
        <p>Download the current rulebook, or <strong>adopt the current Postgres data as the new seed</strong> — use after editing data in the app/portal. Import overwrites raw values, so it asks for confirmation and never runs automatically on build.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn secondary" href={withDomain("/api/tech/export-rulebook", domain)} download>
            Download rulebook
          </a>
          <button className="btn danger" disabled={importing} onClick={importFromPg}>
            {importing ? "Importing…" : "Import from Postgres"}
          </button>
        </div>
      </div>
    </>
  );
}
