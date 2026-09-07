# First Valley Bank — Admin Portal

Four role-specific portals (Admin, RM, Underwriter, BranchBanker) backed by
the Effortless rulebook + Postgres `vw_*` views. Double-click any field to
inspect its rulebook definition (formula, deps).

## Run it

```bash
# 1. Make sure Postgres is up and reset-rulebook-db.sh has been run:
( cd ../postgres && bash reset-rulebook-db.sh )

# 2. Backend (Express, port 4000):
cd backend && npm install && npm run dev

# 3. Frontend (Vite, port 5173):
cd ../frontend && npm install && npm run dev
```

Open http://localhost:5173 and pick a demo user.

## Demo users (no passwords; simulated RLS)

| Email | Role |
|---|---|
| `renee.okafor@firstvalley.bank` | Admin |
| `devon.marshall@firstvalley.bank` | RM |
| `priya.iyer@firstvalley.bank` | Underwriter |
| `thomas.bell@firstvalley.bank` | Underwriter |
| `maya.chen@firstvalley.bank` | BranchBanker |

## Architecture

- **Backend** (`backend/server.js`) — Express + `pg`. Cookie session holds
  `{name, role, email}`. Every DB call wraps a transaction that sets
  `app.current_user_role`, `app.current_user_name`, `app.current_user_email`
  via `set_config(..., true)` (LOCAL). Real RLS policies should pivot on
  those session vars; until policies are written, role filtering is
  simulated with `WHERE` clauses in `roleFilter()`.
- **Frontend** (`frontend/`) — Vite + React + React Router. `Shell` builds
  navigation from the user's role. `FieldDrawer` opens on double-click of
  any `<Field>` cell and shows the rulebook definition + dependency hops
  (placeholder for a future `rulebook-to-react-explainer-dag` transpiler).
- **Reads only via `vw_*` views** per project convention. No writes yet —
  the portal is read-only against the rulebook-generated database.
