// ---------------------------------------------------------------------------
// Sign-in: pick a principal, get a real token.
//
// The grid is built from /api/auth/sign-ins, which reads
// vw_principal_assignments. Add a principal to the rulebook and a card appears
// here on the next rebuild -- nothing in this file enumerates roles.
//
// Two people (elena-garcia, priya-raman) hold two principals each, so cards
// are keyed by ASSIGNMENT, not by user: 12 cards for 10 people. Choosing the
// principal is the whole point -- the token is scoped to one of them, and the
// server verifies the pairing rather than trusting the click.
// ---------------------------------------------------------------------------

const TOKEN_KEY = "pko.token";
const CLAIMS_KEY = "pko.claims";

export function storedToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storedClaims() {
  try {
    return JSON.parse(localStorage.getItem(CLAIMS_KEY) || "null");
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLAIMS_KEY);
  location.reload();
}

/** Expired tokens are indistinguishable from bad ones at the API. Check the
 *  exp claim client-side so we show the login page instead of a wall of 401s. */
export function tokenIsLive() {
  const c = storedClaims();
  if (!c?.exp) return false;
  return c.exp * 1000 > Date.now() + 5000;
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[m]));

const ORG_CLASS = {
  "acme-finance": "org-finance",
  "acme-people": "org-people",
  "acme-legal": "org-legal",
};

function initials(name) {
  return String(name || "?")
    .split(/[\s-]+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");
}

export async function renderLogin(mount) {
  mount.innerHTML = `<div class="login-wrap"><div class="login-loading">
    Loading sign-ins…</div></div>`;

  let data;
  try {
    const r = await fetch("/api/auth/sign-ins");
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    data = await r.json();
  } catch (e) {
    // Fail loudly. A login page that renders an empty grid on a broken API
    // looks like "no users exist", which is a lie.
    mount.innerHTML = `<div class="login-wrap"><div class="login-error">
      <h2>Cannot reach the sign-in service</h2>
      <p><code>${esc(e.message)}</code></p>
      <p class="hint">The API reads <code>vw_principal_assignments</code>.
      If the database has not been rebuilt since the identity tables were
      added, run <code>./start.sh</code>.</p>
    </div></div>`;
    return;
  }

  const signIns = data.signIns || [];
  const admins = signIns.filter((s) => s.isAdministrator);
  const regular = signIns.filter((s) => !s.isAdministrator);

  const card = (s) => `
    <button class="signin-card ${ORG_CLASS[s.organization] || ""} ${
      s.isAdministrator ? "is-admin" : ""}"
            data-user="${esc(s.appUserId)}"
            data-principal="${esc(s.principalId)}">
      <div class="signin-avatar">${esc(initials(s.displayName))}</div>
      <div class="signin-body">
        <div class="signin-name">${esc(s.displayName)}</div>
        <div class="signin-role">${esc(s.principalLabel)}</div>
        <div class="signin-meta">
          <span class="chip chip-org">${esc(s.organization || "—")}</span>
          ${s.isAdministrator ? '<span class="chip chip-admin">admin</span>' : ""}
          ${s.agentKind && s.agentKind !== "Human"
            ? `<span class="chip chip-bot">${esc(s.agentKind)}</span>` : ""}
        </div>
        ${s.responsibility
          ? `<div class="signin-resp">${esc(s.responsibility)}</div>` : ""}
      </div>
    </button>`;

  mount.innerHTML = `
    <div class="login-wrap">
      <header class="login-head">
        <h1>PKO Procedure Register</h1>
        <p class="login-sub">
          Choose who to sign in as. Every card mints a real RS256 token whose
          claims are read from the database — the schema, rows and columns you
          get are decided by Postgres, not by this page.
        </p>
      </header>

      <section class="login-section">
        <h2 class="login-h2">Operating roles</h2>
        <div class="signin-grid">${regular.map(card).join("")}</div>
      </section>

      ${admins.length ? `
      <section class="login-section">
        <h2 class="login-h2">Administrators
          <span class="login-h2-note">— full read across every table</span>
        </h2>
        <div class="signin-grid">${admins.map(card).join("")}</div>
      </section>` : ""}

      <footer class="login-foot">
        <span>issuer <code>${esc(data.issuer)}</code></span>
        <span>${signIns.length} assignments · ${
          new Set(signIns.map((s) => s.appUserId)).size} people</span>
      </footer>
      <div class="login-status" id="login-status" hidden></div>
    </div>`;

  const status = mount.querySelector("#login-status");

  mount.querySelectorAll(".signin-card").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const appUserId = btn.dataset.user;
      const principalId = btn.dataset.principal;
      mount.querySelectorAll(".signin-card")
        .forEach((b) => b.classList.toggle("is-busy", b === btn));
      status.hidden = false;
      status.textContent = "Minting token…";
      try {
        const r = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appUserId, principalId }),
        });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || `${r.status}`);
        localStorage.setItem(TOKEN_KEY, body.token);
        localStorage.setItem(CLAIMS_KEY, JSON.stringify(body.claims));
        location.reload();
      } catch (e) {
        btn.classList.remove("is-busy");
        status.className = "login-status is-error";
        status.textContent = `Sign-in refused: ${e.message}`;
      }
    });
  });
}
