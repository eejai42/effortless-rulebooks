import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Icons from "lucide-react";
import { toast } from "../lib/toast.js";
import DomainSwitcher from "../components/DomainSwitcher.jsx";

// Brand logos via the iconify.design CDN — stable, broadly used, and (unlike
// simpleicons.org) still serves the actual Microsoft / VS Code brand marks.
// `vscode-icons:file-type-excel2` is the green-tile Excel icon; `logos:
// visual-studio-code` is the gradient VS Code mark. Folder stays on lucide
// so we don't need a third CDN round-trip for a generic glyph.
const EXCEL_ICON_URL  = "https://api.iconify.design/vscode-icons:file-type-excel2.svg";
const VSCODE_ICON_URL = "https://api.iconify.design/logos:visual-studio-code.svg";

function openProjectXlsx(domainId) {
  // Stream the generated workbook via a hidden anchor so the browser handles
  // it as a normal file download (preserves filename from Content-Disposition).
  const a = document.createElement("a");
  a.href = `/api/projects/${encodeURIComponent(domainId)}/export.xlsx`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function postQuickAction(domainId, action, label) {
  try {
    const r = await fetch(`/api/projects/${encodeURIComponent(domainId)}/${action}`, {
      method: "POST",
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${r.status}`);
    }
    toast(`${label} — opened on server host`, "ok");
  } catch (e) {
    toast(`${label} failed: ${e.message || e}`, "err");
  }
}

// `mode` is "viewer" | "developer" | "admin"
// `requiresDomain` is true when this layout's routes always have a :domain
// `domainOptional` means the layout has BOTH domain and no-domain routes
export default function RoleTopBar({
  mode,
  accent,
  label,
  icon = "Circle",
  requiresDomain = false,
  domainOptional = false,
  me,
  projects,
  onToggleSidebar,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const params   = useParams();
  const Icon = Icons[icon] || Icons.Circle;

  const activeDomain = params.domain || null;
  const activeProj   = (projects?.projects || []).find((p) => p.id === activeDomain);

  const switchDomain = (newId) => {
    if (!newId) return;
    let next;
    if (params.domain) {
      next = location.pathname.replace(
        new RegExp(`^/${mode}/${params.domain}(/|$)`),
        `/${mode}/${newId}$1`,
      );
    } else {
      next = `/${mode}/${newId}`;
    }
    navigate(next);
    toast(`Switched to ${newId}`, "ok");
  };

  const goRolePicker = () => navigate("/");

  const showDomainBlock = requiresDomain || (domainOptional && !!params.domain);

  return (
    <div className="topbar" style={{ ["--role-accent"]: accent }}>
      <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle navigation">
        <Icons.Menu size={20} />
      </button>

      <div className="role-brand" onClick={goRolePicker} title="Change role">
        <span className="role-mark" style={{ background: accent }}>
          <Icon size={14} />
        </span>
        <span className="role-name">{label}</span>
      </div>

      {showDomainBlock && (
        <div className="domain-block">
          <span className="domain-sep">›</span>
          <div className="domain-info">
            <span className="domain-name">{activeProj?.displayName || activeProj?.name || activeDomain || "—"}</span>
            <DomainSwitcher
              projects={projects?.projects || []}
              activeId={activeDomain}
              onPick={switchDomain}
            />
          </div>
        </div>
      )}

      {showDomainBlock && activeDomain && (
        <div className="domain-quick-actions">
          <button
            className="btn-icon"
            onClick={() => openProjectXlsx(activeDomain)}
            title="Download this domain as an Excel workbook (generated from the rulebook)"
            aria-label="Download Excel export"
          >
            <img src={EXCEL_ICON_URL} alt="" width={16} height={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => postQuickAction(activeDomain, "open-folder", "Open folder")}
            title={`Open ${activeDomain}/ in Finder/Explorer (on the server host)`}
            aria-label="Open project folder"
          >
            <Icons.FolderOpen size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => postQuickAction(activeDomain, "open-vscode", "Open in VS Code")}
            title={`Run 'code .' on ${activeDomain}/ (on the server host)`}
            aria-label="Open in VS Code"
          >
            <img src={VSCODE_ICON_URL} alt="" width={16} height={16} />
          </button>
        </div>
      )}

      <div className="topbar-spacer" />

      <div className="topbar-user">
        {me?.DisplayName && (
          <span className="topbar-user-name">{me.DisplayName}</span>
        )}
        <button className="btn-icon" onClick={goRolePicker} title="Change role">
          <Icons.LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
