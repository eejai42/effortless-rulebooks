<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-bases/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-bases
description: >
  Use when the user wants to spin up a Postgres base on
  bases.effortlessapi.com, get its credentials, apply schema, and
  (optionally) secure it with magic-links + RLS. Covers the
  actually-deployed API surface — the Node management server
  (`bases.effortlessapi.com`) plus the .NET CRUD/source-of-truth
  (`bases-api.effortlessapi.com`) — including the auth flow that
  actually works against both. Triggers: "create a bases base",
  "spin up a base", "set up a secure base", "wire magic links into
  this app on bases.effortlessapi.com", "publish to bases".

  **Scope (load gate):** Loads only on explicit user request — applies to any Postgres-backed app on bases.effortlessapi.com, not just Effortless-marked projects. Do not auto-load just because a project uses Postgres.
audience: customer
---

# Effortless Bases — actually-deployed quickstart

> **If you're reading an older copy of this skill that talks about
> `POST {MAGICLINK}/auth/send-code` as the way to authenticate against
> bases — that is wrong against the deployed services.** That magic-links
> self-auth flow issues JWTs for the magic-links tenant; the bases
> servers do not trust that tenant and reject those JWTs as
> "Unknown tenant". Use the bases-api auth flow below.

## User-facing documentation discipline

When generating READMEs, deployment guides, or client-facing setup documentation for a bases-deployed app, **center the business outcomes and use workflows, not the infrastructure.** 

The Effortless rulebook, the schema generation, the migration discipline, and the RLS machinery are the *how* — invisible to the end user. The *what* is the app's value proposition. Keep deployment and architecture docs separate from user guides.

## CRITICAL DISTINCTION — bases vs. local-dev

This skill applies **only** to `bases.effortlessapi.com`-hosted databases. Bases is the **one and only ERB deployment shape that uses migrations** — because the DB is shared/persistent and cannot be dropped + recreated. Ongoing schema changes go through `postgres/apply-migration.sh`.

**Local-dev ERB projects work the opposite way.** Local Postgres is regenerated from scratch on every `effortless build` via `init-db.sh`. They have **no `migrations/` folder, no migrations tracking table, no incremental deltas**. Schema changes there go through the rulebook → `effortless build` — see `effortless-workflow` "NO MIGRATIONS" section.

**Tell which path you're on before doing anything:**
- `BASES_DATABASE_URL` in `.env.example` OR a `## Bases is migration-only` block in CLAUDE.md → bases path, this skill applies.
- Neither marker present → local-dev path. **Do not** apply migration patterns from this skill. (You can still create a bases base for *deployment* of a local-dev project, which is what most of this skill covers; the migration discipline kicks in only after the first deploy.)

---

## Two services, one Postgres

| URL                              | What it is                          | What it does                                                                                  |
|----------------------------------|-------------------------------------|-----------------------------------------------------------------------------------------------|
| `https://bases.effortlessapi.com`     | Node — dashboard + base-lifecycle ops | Registers/clones bases, applies role privileges, manages trusted-tenants, runs RLS audits     |
| `https://bases-api.effortlessapi.com` | .NET — CRUD source-of-truth         | Lists bases, reads/writes the `bases` row directly, issues JWTs trusted by both services      |
| `bases.effortlessapi.com:5432`        | The actual Postgres                 | Each base = a database; `appXXX_yyyy` style names                                             |

Both Node and .NET share the **same Postgres**, but they expose different endpoints and the Node server's queries don't surface .NET-created bases through `GET /bases` (it's an older view). **Use the .NET service to list and read; use the Node service to create, clone, apply privileges, and manage auth.**

---

## The axiom (still load-bearing)

> **Magic-links is a notary, not a referee.** It makes one claim per JWT:
> *"we sent code C to email E, the holder of C returned it, therefore E is verified."*
>
> Magic-links **stores no users, knows no users, has no concept of tenant
> ownership.** Everything user-shaped — `auth.trusted_tenants`, `app_users`,
> ownership records, role mapping, RLS policies — lives in **bases**.

This skill uses magic-links only as the verified-email JWT issuer for **end-users of your app**. For talking to bases-the-service itself, use bases-api's own auth flow.

---

## Authenticating against bases (the part the old skill got wrong)

```bash
BASES_API="https://bases-api.effortlessapi.com"
BASES="https://bases.effortlessapi.com"
DEV_EMAIL="you@example.com"

# 1. Email a 6-digit code (no auth required).
curl -sS -X POST "$BASES_API/auth/email-auth" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEV_EMAIL\"}"
#   → { "ok": true }

# 2. Verify the code → bases JWT (the user reads the code from email).
curl -sS -X POST "$BASES_API/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEV_EMAIL\",\"code\":\"123456\"}"
#   → { "ok": true, "jwt": "eyJhbGc..." }
```

The JWT returned by `/auth/magic-link` is what authorizes calls to **both**
`bases-api.effortlessapi.com` and `bases.effortlessapi.com`. Cache it at
`/tmp/bases-api-jwt-$DEV_EMAIL.txt`; it expires per the bases-api tenant's
`jwt_expires_in_seconds` (typically 1 hour).

**Do not confuse this with magic-links self-auth** (`POST {MAGICLINK}/auth/send-code` → `/auth/verify-code`). That flow is for mutating *magic-links tenants*. The JWTs it returns have a different `iss` and the bases servers reject them as "Unknown tenant".

---

## List, create, and read bases

```bash
JWT=$(cat /tmp/bases-api-jwt-$DEV_EMAIL.txt)

# List the user's bases — the .NET API is authoritative.
curl -sS "$BASES_API/api/bases" -H "Authorization: Bearer $JWT" | jq .
#  → [ { base_id, base_name, display_name, database_name, owner_email, ... }, ... ]

# Read one — public details (no creds).
curl -sS "$BASES/bases/$BASE_ID/details" -H "Authorization: Bearer $JWT" | jq .
#  → { base_id, database_name, key_shard, is_byod, db: { host, port, database, roles } }
```

### Create a new base

The Node server's `POST /bases/register` is the smart provisioning endpoint. As of the **deployed** code (May 2026), it accepts:

For a rulebook-direct project (the default), prefer `source:"empty"` or clone — use real Airtable + PAT only if the project explicitly syncs from a live Airtable base.

| Mode                 | Body                                                                                                                                  | Notes                                                                                                                                                                                                                                                                                                                       |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`source:"empty"`**       | `{"source":"empty","createERBTables":false,"displayName":"..."}`                                                                    | **DEPLOYED now (Jul 2026).** Skips Airtable entirely and provisions a blank base — no PAT, no `sourceBaseId`, no Airtable base id needed. Preferred path when you just want a Postgres base to apply your own generated SQL onto. (Older notes said local-only — stale; it ships.)                                                                                                                                                                             |
| **Clone an existing base** | `{"sourceBaseId":"<uuid>","displayName":"...","createERBTables":true}`                                                              | Inherits PAT + Airtable base ID from source. The new DB is independent (own `database_name`). Use this when you don't want to deal with Airtable — pick any existing base of yours as the template, then immediately apply your own SQL on top.                                                                              |
| **Real Airtable + PAT**    | `{"pat":"patXXX","baseId":"appXXX","displayName":"...","createERBTables":true}`                                                     | Only if the project explicitly syncs from a live Airtable base. The base name on bases mirrors the Airtable base ID, and `effortless build` will airtable-to-rulebook from there.                                                                                                                                                                                       |

```bash
RESP=$(curl -sS -X POST "$BASES/bases/register" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{\"sourceBaseId\":\"$SOURCE_BASE_ID\",
       \"displayName\":\"My New Demo\",
       \"createERBTables\":true}")
# → { message, base: { base_id, base_name, database_name, pat_configured }, erbTablesCreated: [...] }
BASE_ID=$(echo "$RESP" | jq -r .base.base_id)
DB_NAME=$(echo "$RESP" | jq -r .base.database_name)
```

---

## Get Postgres credentials

The bases-api stores encrypted role passwords, but credentials are not surfaced via `GET /credentials` until you've **applied the privilege template** at least once. The first apply both *creates* the admin/anon roles and *returns* their passwords.

```bash
curl -sS -X POST "$BASES/bases/$BASE_ID/auth/apply-privileges-template" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"force":false,"returnCredentials":true}'
# → {
#     message: "Privilege template applied successfully",
#     rolesCreated: true,
#     adminRole: "<dbname>_admin",
#     anonRole:  "<dbname>_anon",
#     credentials: {
#       admin: { username, password },
#       anon:  { username, password }
#     }
#   }
```

On subsequent calls (without `force:true`) the response omits the password — fetch it from the credentials endpoint:

```bash
curl -sS "$BASES/bases/$BASE_ID/auth/credentials" \
  -H "Authorization: Bearer $JWT"
# → { admin: { username, password }, anon: { username, password } }
```

Assemble the connection string:

```
postgresql://<adminRole>:<adminPassword>@bases.effortlessapi.com:5432/<database_name>
```

The bases Postgres on `:5432` does **not** currently terminate TLS — connect without `sslmode=require`. (Empirically verified May 2026; if you append `sslmode=require` psql returns `server does not support SSL, but SSL was required`.) In Node/pg this means `ssl: false`. Re-test before changing this assumption.

---

## Apply schema to a fresh base

For a **brand-new** base (clone or empty), apply your generated SQL directly once. The local-dev `init-db.sh` is the right shape but its bases-URL refusal block prevents pointing it at production. Two equivalent options:

```bash
# Option A — drive psql by hand.
ADMIN_URL="postgresql://<admin>:<pw>@bases.effortlessapi.com:5432/$DB_NAME"
for f in postgres/01-drop-and-create-tables.sql \
         postgres/01b-customize-schema.sql \
         postgres/02-create-functions.sql \
         postgres/02b-customize-functions.sql \
         postgres/03-create-views.sql \
         postgres/03b-customize-views.sql \
         postgres/05-insert-data.sql \
         postgres/05b-customize-data.sql ; do
    [ -f "$f" ] && psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -f "$f"
done

# Option B — `apply-migration.sh` wraps the same in a confirm prompt.
#   Use this once you have ongoing changes; for the very first apply,
#   Option A is fine.
```

For a base cloned from a template, the generated `01-drop-and-create-tables.sql` will replace whatever the template had — there's no need to manually wipe first.

**After the first apply, switch to the migration discipline** for any further schema changes:

- Hand-write idempotent forward migrations under `postgres/migrations/NNNN-*.sql`.
- Apply via `postgres/apply-migration.sh`. The wrapper applies to `$LOCAL_DATABASE_URL` first, prompts you to verify the app still works, then applies to `$BASES_DATABASE_URL` after you type the literal phrase `apply to bases`.
- Never run `effortless build` / `init-db.sh` against a bases base — both have safety refusals, but the discipline is yours to keep.

---

## End-user auth: magic-links tenant on top of the base

Once the base exists and has schema, the magic-links integration is for **your app's end users**, not for talking to bases. The flow:

1. **Mint a magic-links tenant** (this is where the original skill's `POST {MAGICLINK}/api/tenants` flow is actually correct — for *tenants*, the magic-links self-auth JWT is the right key).
2. **Register the trusted tenant on the base** — fetch `{MAGICLINK}/api/tenants/{tenant_id}/install.sql` and apply it via your migration wrapper (it inserts into `auth.trusted_tenants` and installs the `app.jwt_*` helpers).
3. **Generate RLS policies** for your tables via `POST {BASES}/bases/{baseId}/auth/generate-policy`.
4. **In your app**, send-code/verify-code through magic-links per-tenant endpoints; pass the resulting JWT as `Authorization: Bearer …` on every query against the base.

See the `effortless-magic-links` skill for the generic shape; the bases-side hooks (`trusted-tenants`, `apply-privileges-template`, `generate-policy`) are the same as before.

---

## ⭐ Basic email-RLS needs NO PAT, NO Airtable, NO AppUsers table — just `setup-trusted-tenants`

> **This is the fast path and the one to reach for.** `POST /bases/{baseId}/auth/setup-trusted-tenants` was FIXED and DEPLOYED (Jul 2026) so that basic magic-links RLS works on **ANY** base — including an empty-`source` base with nothing in it — **without a PAT, without Airtable, without an AppUsers table.** The whole two-part body is:

```bash
curl -sS -X POST "$BASES/bases/$BASE_ID/auth/setup-trusted-tenants" \
  -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
  -d "{\"tenantId\":\"$TENANT_ID\",\"publicKeyPem\":\"$PUBLIC_KEY_PEM\"}"
# (optionally add "enabled":true)
```

Get `publicKeyPem` first from the tenant: `GET {MAGICLINK}/api/tenants/{tenantId}` → `.public_key_pem`.

That one call, running as the operator **superuser** behind the endpoint, does everything:

- installs the **core JWT helpers** — the plpython3u RS256 verifier plus `auth.set_jwt(token)`, `app.jwt_email()`, `app.jwt_claims()`, `app.jwt_tenant_id()`, and `app.has_role(role)`;
- registers the trusted tenant in `auth.trusted_tenants`;
- grants the `magiclink_consumer` privilege bucket to the base's `<db>_admin` / `<db>_anon` roles.

So you do **not** hand-fetch `install.sql`, and you do **not** need app-side SQL to create the helpers.

> ⚠️ **The helper install MUST go through this endpoint** — not app-side SQL. The bases Postgres server already has `plpython3u` + `PyJWT` installed, but the base **ADMIN** role cannot `CREATE EXTENSION`; only the operator superuser (which is what this endpoint runs as) can. That is precisely why helper creation is an endpoint call, not something you psql in as the admin.

**What's now OPTIONAL (was wrongly required before):**

- **PAT / Airtable "integration record" upsert** — now only runs *if a PAT already exists* on the base. Previously the endpoint hard-failed without a PAT (`"PAT not configured for this base"`), which wrongly blocked empty bases from ever getting RLS. **That gate is removed.** Any prior note here saying "a PAT is required to set up magic-links / RLS on a base" is stale — it is not.
- **AppUsers-table integration** (`userTableName` / `emailField` / `roleField` / `isActiveField`) — only needed for **Tier-2 role-based RLS**. Basic per-email RLS (`owner`/`authenticated` policies keyed on `app.jwt_email()`) does NOT need it.

**Verify the whole thing with one transaction** (returns the verified email if the RS256 verifier, tenant registration, and helpers are all wired):

```sql
BEGIN;
  SELECT auth.set_jwt('<a-jwt-minted-by-that-tenant>');
  SELECT app.jwt_email();   -- → the verified email
COMMIT;
```

---

## End-to-end recipe — "create a base + deploy an app pointing at it"

```bash
BASES_API=https://bases-api.effortlessapi.com
BASES=https://bases.effortlessapi.com
DEV_EMAIL=you@example.com

# 1. Auth (one round-trip, user reads 6-digit code from email).
curl -sS -X POST "$BASES_API/auth/email-auth" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$DEV_EMAIL\"}" >/dev/null
read -rp "code: " CODE
JWT=$(curl -sS -X POST "$BASES_API/auth/magic-link" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$DEV_EMAIL\",\"code\":\"$CODE\"}" | jq -r .jwt)

# 2. Pick or create the base.
EXISTING=$(curl -sS "$BASES_API/api/bases" -H "Authorization: Bearer $JWT" \
  | jq -r ".[] | select(.display_name==\"My Demo\") | .base_id" | head -1)
if [ -z "$EXISTING" ]; then
  # Need a sourceBaseId to clone from — pick any other base of yours.
  SOURCE=$(curl -sS "$BASES_API/api/bases" -H "Authorization: Bearer $JWT" | jq -r '.[0].base_id')
  CREATE=$(curl -sS -X POST "$BASES/bases/register" -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
    -d "{\"sourceBaseId\":\"$SOURCE\",\"displayName\":\"My Demo\",\"createERBTables\":true}")
  BASE_ID=$(echo "$CREATE" | jq -r .base.base_id)
else
  BASE_ID=$EXISTING
fi

# 3. Provision Postgres roles + get admin credentials.
CREDS=$(curl -sS -X POST "$BASES/bases/$BASE_ID/auth/apply-privileges-template" \
  -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
  -d '{"force":false,"returnCredentials":true}')
ADMIN_USER=$(echo "$CREDS" | jq -r '.credentials.admin.username // empty')
ADMIN_PW=$(echo   "$CREDS" | jq -r '.credentials.admin.password // empty')
# If apply was a no-op (roles already existed), fetch from credentials endpoint.
if [ -z "$ADMIN_USER" ]; then
  CREDS=$(curl -sS "$BASES/bases/$BASE_ID/auth/credentials" -H "Authorization: Bearer $JWT")
  ADMIN_USER=$(echo "$CREDS" | jq -r '.admin.username')
  ADMIN_PW=$(echo   "$CREDS" | jq -r '.admin.password')
fi
DB_NAME=$(curl -sS "$BASES/bases/$BASE_ID/details" -H "Authorization: Bearer $JWT" | jq -r .database_name)

DATABASE_URL="postgresql://$ADMIN_USER:$ADMIN_PW@bases.effortlessapi.com:5432/$DB_NAME"

# 4. Apply schema (idempotent generated SQL — CREATE IF NOT EXISTS + INSERT ON CONFLICT).
for f in postgres/01-drop-and-create-tables.sql \
         postgres/01b-customize-schema.sql \
         postgres/02-create-functions.sql \
         postgres/02b-customize-functions.sql \
         postgres/03-create-views.sql \
         postgres/03b-customize-views.sql \
         postgres/05-insert-data.sql \
         postgres/05b-customize-data.sql ; do
  [ -f "$f" ] && psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done

# 5. Wire DATABASE_URL into your deploy target (e.g. a Control Plane secret)
#    and deploy. Done.
```

A complete deploy.sh that wraps this end-to-end (with `cpln image build` + `cpln apply`) lives in the project repo — keep it idempotent and re-runnable so subsequent rulebook edits redeploy with one command.

---

## RLS pattern (email DAG) — unchanged

Helpers installed in the base by `install.sql`:

```sql
app.jwt_email()       -- verified email or NULL
app.jwt_claims()      -- full claims jsonb or NULL
app.jwt_tenant_id()   -- iss tenant_id
```

Policy template (`policyType: "owner"` generates this):

```sql
CREATE POLICY "owner_access" ON documents
  FOR ALL
  USING (
    owner_id IN (
      SELECT app_user_id FROM app_users
      WHERE email_address = app.jwt_email()
        AND is_active = true
    )
  );
```

Policy types: `owner`, `role_based`, `authenticated`, `admin_only`. Changes take effect on the **next query** — no session priming, JWT is verified inline at every query.

---

## Sharing a tenant with a downstream consumer app — unchanged

Topology: a base lives on `bases.effortlessapi.com` **and** a separate downstream app (its own Postgres) reads/writes against a sibling DB. End-users sign in once and the JWT is honored on both.

**Share one tenant.** Don't mint a second tenant for the downstream app. Magic-links is issuer-only; trust lives consumer-side in `auth.trusted_tenants`.

1. Find the existing tenant for the base (registered in `auth.trusted_tenants`).
2. `GET {MAGICLINK}/api/tenants/{tenant_id}` to fetch its `public_key_pem`.
3. In the downstream app's Postgres, install the same `auth.trusted_tenants` table and insert the same `(tenant_id, public_key_pem)` row.
4. Install the same `app.jwt_email()` / `app.jwt_claims()` helpers.
5. The downstream app's middleware looks up `auth.trusted_tenants` by the JWT's `iss` tenant_id, RS256-verifies against that row's `public_key_pem`, opens a transaction, then `SELECT auth.set_jwt($1)` with the raw token. RLS reads `app.jwt_email()` / `app.has_role()` from there. **Never** `set_config(...)` or `SET LOCAL app.jwt_*` from app code.

JWTs minted at `/api/tenants/<shared>/verify-code` verify cleanly on both DBs. No cross-API plumbing, no key-rotation choreography.

---

## Cheat sheet

| You want to…                                  | Endpoint                                                                  |
|-----------------------------------------------|---------------------------------------------------------------------------|
| Get a bases JWT (talk to bases at all)        | `POST {BASES_API}/auth/email-auth` then `/auth/magic-link`                |
| List your bases                                | `GET {BASES_API}/api/bases`                                               |
| Read one base's public details                 | `GET {BASES}/bases/{baseId}/details`                                      |
| Create / clone a base                         | `POST {BASES}/bases/register`                                             |
| Provision Postgres roles + get credentials     | `POST {BASES}/bases/{baseId}/auth/apply-privileges-template`              |
| Fetch stored Postgres credentials             | `GET {BASES}/bases/{baseId}/auth/credentials`                              |
| Audit role privileges                         | `GET {BASES}/bases/{baseId}/auth/privileges`                              |
| Apply a forward migration (post first deploy) | `bash postgres/apply-migration.sh postgres/migrations/NNNN-*.sql`         |
|                                               |                                                                           |
| Mint a magic-links tenant (end-user auth)     | `POST {MAGICLINK}/api/tenants` (with magic-links self-auth Bearer)        |
| Look up a tenant's public key                 | `GET {MAGICLINK}/api/tenants/{id}`                                        |
| Register a trusted tenant on a base           | `POST {BASES}/bases/{baseId}/auth/setup-trusted-tenants`                  |
| Generate an RLS policy                        | `POST {BASES}/bases/{baseId}/auth/generate-policy`                        |
| Lint policies for legacy patterns             | `GET {BASES}/bases/{baseId}/auth/lint-policies`                           |
| Test RLS with a JWT                           | `POST {BASES}/bases/{baseId}/auth/test-rls`                               |

---

## Common mistakes

- **Using `{MAGICLINK}/auth/verify-code` JWTs against bases.** The bases servers don't trust that tenant. Use `{BASES_API}/auth/magic-link` to get a JWT bases will accept.
- **Looking for bases at `{BASES}/bases` (Node).** That endpoint exists but its underlying view is older than the .NET `{BASES_API}/api/bases`. List from the .NET service.
- **Believing `source:"empty"` is undeployed.** It shipped (Jul 2026). `{"source":"empty",...}` provisions a blank base with no PAT and no Airtable — use it directly; you no longer need to clone a template base.
- **Assuming `GET /bases/{baseId}/auth/credentials` works right after creation.** It returns 404 until you've applied the privilege template at least once. Apply it with `returnCredentials:true` to get the passwords on first call.
- **Treating magic-links as a user store.** It isn't. `app_users` lives in the base.
- **Asking magic-links for the private key.** Won't happen. `public_key_pem` only.
- **Reusing one tenant across *unrelated* apps.** One tenant per product surface.
- **Letting the anon role read `auth.trusted_tenants`.** Verify with `GET .../auth/privileges` — `securityCheck.anonCanReadTrustedTenants` must be `false`.
- **Running `effortless build` / `init-db.sh` against a bases URL.** The transpiler's generated `init-db.sh` greps for `bases.effortlessapi.com` in `$DATABASE_URL` and refuses with exit 2. No escape hatch.
- **Editing `04b-customize-policies.sql` and rebuilding to change RLS on bases.** That drops policies on the next rebuild. RLS for bases lives in migration files.

---

## When you're authoring bases.effortlessapi.com itself

The Node server's source-of-truth lives at `../bases.effortlessapi.com` in this repo. The deploy lag observed in May 2026 — `source:"empty"` in HEAD but not in production — is a real failure mode this skill should not hide. **If you change `src/routes/bases.js` and a recipe in this skill stops matching what's deployed, update both** (push + redeploy bases AND `git add` the corresponding skill change in the same PR).

The current production deploy is at or behind `origin/main`; check `git log -1 origin/main` against the deployed behaviour before claiming a feature is live. The deployed services are at `bases.effortlessapi.com` (Node), `bases-api.effortlessapi.com` (.NET, separate repo), and `bases.effortlessapi.com:5432` (Postgres). All three need to agree on the contract before the skill can.

---

## Magic-links refactor (v0.2)

> See [../../MAGIC_LINKS_REFACTOR.md](../../MAGIC_LINKS_REFACTOR.md) §4 + §11 for the canonical v0.2 magic-links contract.

**Changes to ANY BASES BASE NEEDS TO BE REALLY EXPLICITLY GATED!! DO NOT JUST GO MAKE CHANGES WITHOUT CONFIRMING EXACTLY WHAT CHANGES ARE GOING TO BE MADE.**

Before any change to a bases base: fetch `Stage` via `GET {BASES_API}/api/bases/{id}`.
- `Stage = prod`: state exact DDL/data/RLS diff, get explicit confirmation, run against dev/staging first, then use `confirm-prod-change: <summary>` header on the bases API call.
- `Stage = staging`: state changes, one confirmation, then proceed.
- `Stage = dev`: proceed normally; summarize at end of turn.

Never run `effortless build` / `init-db.sh` against a bases base. Never `DROP` without explicit `--i-mean-it`. Migrations only, via `postgres/apply-migration.sh` (per the bases repo's BASES_MIGRATION_GUIDE.md).

RLS policy lifecycle (§11): RLS changes for bases are MIGRATION FILES only. Never edit `04b-customize-policies.sql` and rebuild — that drops policies on bases.

---

## LOCALHOST MODE

Before any bases work, check whether `BASES_BASE_URL` is set to `http://localhost:*`. If so, follow [MAGIC_LINKS_REFACTOR.md §13](../../MAGIC_LINKS_REFACTOR.md#13-localhost-mode--opt-in-via-env-vars):

- magiclink server: `http://localhost:4787`
- bases server: `http://localhost:4788` (the Node + .NET shim run together locally)
- env file: `magic-links-refactor/test-env/dev/.env` — `source` it before any curl recipe; gives you `OWNER_JWT`, `MAGICLINK_BASE_URL`, `BASES_BASE_URL`, etc.

Up-check (run before assuming the stack is live):
```
curl -fsS http://localhost:4787/install-magic-links/v1.sql >/dev/null && echo "magiclink up" || echo "magiclink DOWN"
curl -fsS http://localhost:4788/health >/dev/null && echo "bases up" || echo "bases DOWN"
```
If down, run `bash magic-links-refactor/test-env/scripts/dev-stack-up.sh`.

---

## See also

- `effortless-magic-links` — the generic magic-links flow for any Postgres app (when the DB is NOT on bases.effortlessapi.com).
- `effortless-orchestrator` — for "AppUsers belongs in the rulebook, not in `app.app_users` by hand".
- `effortless-sql` — for placing `auth.trusted_tenants` and `app.jwt_*()` helpers in a customization (`ERBCustomizations` row preferred, `*b-customize-*` file also works).
- `effortless-setup-postgres` — if you're standing up a brand-new local Postgres ERB project first.
