import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Above-the-gallery chip row for the domain picker.
//   - "Last visited" surfaces the domain you were in most recently.
//   - "New since you were here" lists any domain whose rulebook revision
//     changed since your last visit (or that you've never visited).
//   - "Bootstrap a new one" expands an inline panel pointing at the
//     existing init flow (Shadle-steps lives in a separate skill; the chip
//     just exposes the entry point — no full inline flow in v1).
//
// Reads only from `domainState` + `domains`. No fetches here.

export default function PickerChips({ domainState, domains, areaPath }) {
  const navigate = useNavigate();
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const states = domainState?.states || [];
  const currentRevs = domainState?.currentRevisions || {};

  const visited = states.find((s) => s.domain && s.domain !== "__top__");
  const newDomains = computeNew(states, currentRevs, domains);

  return (
    <div className="picker-chip-row">
      {visited && (
        <button
          className="picker-chip last-visited"
          onClick={() => navigate(`${areaPath}/${visited.domain}`)}
          title={visited.last_route || ""}
        >
          <span className="picker-chip-icon">↻</span>
          <span>
            <span className="picker-chip-label">Last visited:</span>
            <span className="picker-chip-value"> {visited.domain}</span>
          </span>
        </button>
      )}

      {newDomains.length > 0 && (
        <NewSinceChip domains={newDomains} areaPath={areaPath} navigate={navigate} />
      )}

      <button
        className="picker-chip bootstrap"
        onClick={() => setBootstrapOpen((o) => !o)}
        aria-expanded={bootstrapOpen}
      >
        <span className="picker-chip-icon">＋</span>
        <span>Bootstrap a new one</span>
      </button>

      {bootstrapOpen && (
        <div className="picker-bootstrap-panel">
          <h4>Bootstrap a new Effortless domain</h4>
          <p className="muted small">
            New domains start as a rulebook JSON in <code>rulebook-examples/&lt;slug&gt;/effortless-rulebook/</code>.
            The fastest path is the <code>effortless -init</code> CLI or the bootstrap skill.
          </p>
          <ol className="bootstrap-steps">
            <li>Create <code>rulebook-examples/&lt;slug&gt;/</code> with an <code>effortless-rulebook/&lt;slug&gt;-rulebook.json</code> stub.</li>
            <li>Add <code>effortless.json</code> referencing the desired transpilers.</li>
            <li>Run <code>effortless build</code> to materialize substrates.</li>
            <li>Restart the portal to pick up the new domain.</li>
          </ol>
          <button className="btn btn-sm btn-ghost" onClick={() => setBootstrapOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

function NewSinceChip({ domains, areaPath, navigate }) {
  const [open, setOpen] = useState(false);
  const count = domains.length;
  return (
    <div className="picker-chip-wrap">
      <button
        className="picker-chip new-since"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="picker-chip-icon">●</span>
        <span>
          <span className="picker-chip-label">New since you were here:</span>
          <span className="picker-chip-value"> {count}</span>
        </span>
      </button>
      {open && (
        <ul className="picker-chip-menu">
          {domains.map((d) => (
            <li key={d.id}>
              <button onClick={() => { setOpen(false); navigate(`${areaPath}/${d.id}`); }}>
                <span className="picker-chip-menu-name">{d.displayName || d.name || d.id}</span>
                <span className="picker-chip-menu-reason muted small">{d.reason}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function computeNew(states, currentRevs, domains) {
  const byDomain = {};
  for (const s of states) byDomain[s.domain] = s;
  const result = [];
  for (const d of domains) {
    if (!d || !d.id || d.id === "__top__") continue;
    const cur = currentRevs[d.id];
    const seen = byDomain[d.id];
    if (!seen) {
      // Never visited — only flag as "new" if there's at least one other
      // visited domain (otherwise the chip is just noise on first launch).
      const anyVisited = Object.keys(byDomain).length > 0;
      if (anyVisited) result.push({ ...d, reason: "you haven't opened this yet" });
    } else if (cur && cur !== seen.last_seen_rulebook_revision) {
      result.push({ ...d, reason: "rulebook changed since your last visit" });
    }
  }
  return result;
}
