// A "trailer" for one domain: motif band, tagline, signature rows, status ribbon.
// Rendered on the picker (DeveloperHomeScreen / DeveloperDomainsScreen / Viewer*).
// Reads only fields surfaced by /api/projects — never reaches into the rulebook
// directly. The picker stays cheap; the interior pages do the heavy reads.

export default function DomainTile({ d, onClick, accentColor = "#b48cff", sinceLabel = null }) {
  const motif = d.motif || "default";
  const palette = d.motifPalette || {};
  const style = {};
  if (palette.primary) style["--motif-primary"] = palette.primary;
  if (palette.accent)  style["--motif-accent"]  = palette.accent;
  if (palette.ink)     style["--motif-ink"]     = palette.ink;

  return (
    <div className={`domain-tile motif-${motif}`} style={style} onClick={onClick}>
      <div className="domain-tile-band">
        {d.logoUrl && (
          <img
            src={d.logoUrl}
            alt=""
            className="domain-tile-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="domain-tile-band-text">
          <div className="domain-tile-slug" style={{ color: accentColor }}>{d.id}</div>
          <div className="domain-tile-name">{d.displayName || d.name}</div>
        </div>
      </div>

      <div className="domain-tile-body">
        {d.tagline ? (
          <div className="domain-tile-tagline">{d.tagline}</div>
        ) : (
          <div className="domain-tile-tagline muted">— no tagline authored —</div>
        )}

        {Array.isArray(d.signatureRows) && d.signatureRows.length > 0 && (
          <div className="domain-tile-signatures">
            {d.signatureRows.map((block, i) => (
              <SignatureBlock key={i} block={block} />
            ))}
          </div>
        )}

        <div className="domain-tile-ribbon">
          <span className="domain-tile-status-dot" />
          <span>ready</span>
          {sinceLabel && (
            <>
              <span className="domain-tile-ribbon-sep">·</span>
              <span className="muted">{sinceLabel}</span>
            </>
          )}
          <span className="domain-tile-ribbon-sep">·</span>
          <span className="muted">open →</span>
        </div>
      </div>
    </div>
  );
}

function SignatureBlock({ block }) {
  const rows = Array.isArray(block.rows) ? block.rows : [];
  if (rows.length === 0) return null;
  // Pick the most "name-like" field to display per row.
  const labelField = pickLabelField(block.fields || []);
  return (
    <div className="signature-block">
      <div className="signature-block-label">{block.entity}</div>
      <ul className="signature-row-list">
        {rows.map((row, i) => (
          <li key={i}>{labelField ? (row[labelField] ?? "—") : firstStringValue(row)}</li>
        ))}
      </ul>
    </div>
  );
}

function pickLabelField(fields) {
  // Prefer Name, then FullName, then anything ending in Name, then first.
  return (
    fields.find((f) => f === "Name") ||
    fields.find((f) => f === "FullName") ||
    fields.find((f) => /Name$/.test(f)) ||
    fields[0] ||
    null
  );
}

function firstStringValue(row) {
  for (const v of Object.values(row)) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return "—";
}
