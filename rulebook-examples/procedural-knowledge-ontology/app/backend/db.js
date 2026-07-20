// ---------------------------------------------------------------------------
// Two ways to reach Postgres, and the difference is the whole security model.
//
//   adminQuery()  -- connects as the owner. For sign-in (reading who may log
//                    in, before anyone is authenticated) and for admin tooling
//                    that edits the rulebook. Bypasses RLS; use deliberately.
//
//   asPrincipal() -- opens a transaction, sets the verified claims as
//                    transaction-local GUCs, SET LOCAL ROLE to the caller's
//                    Postgres role, and runs the query. RLS and the role's
//                    schema decide what comes back. The API adds no filtering
//                    of its own -- it cannot see more than the role can.
//
// Everything a signed-in user touches goes through asPrincipal(). That is what
// makes the API a proxy rather than a policy engine: delete the API and the
// same guarantees still hold for anything else that connects.
//
// GUCs are set with set_config(..., true) = transaction-local, so a pooled
// connection cannot leak one request's identity into the next.
// ---------------------------------------------------------------------------
import pg from "pg";

const ERB_DOMAIN = process.env.ERB_DOMAIN || "procedural-knowledge-ontology";
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://postgres@localhost:5432/erb_${ERB_DOMAIN.replace(/-/g, "_")}`;

export const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 10 });

/** Owner-level query. Bypasses RLS. Sign-in and admin tooling only. */
export function adminQuery(text, params) {
  return pool.query(text, params);
}

/**
 * Run `fn` inside a transaction scoped to the caller's principal.
 *
 * `claims` must come from a VERIFIED token (see auth.verifyToken). The role
 * name is taken from the claims, but it is not blindly trusted: it is checked
 * against vw_access_principals inside the same transaction, so a token minted
 * before a principal was renamed or removed fails closed rather than silently
 * running as something unexpected.
 */
export async function asPrincipal(claims, fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT pg_role_name, schema_name, is_administrator, domain_role
         FROM vw_access_principals
        WHERE access_principal_id = $1`,
      [claims.principal],
    );
    if (rows.length === 0) {
      const err = new Error(`unknown principal: ${claims.principal}`);
      err.status = 403;
      throw err;
    }
    const p = rows[0];

    // Identity, as the database sees it. Policies read these via app.jwt_*().
    await client.query(
      `SELECT set_config('app.jwt_email',        $1, true),
              set_config('app.jwt_principal',    $2, true),
              set_config('app.jwt_organization', $3, true),
              set_config('app.jwt_role',         $4, true),
              set_config('app.jwt_user',         $5, true),
              set_config('app.jwt_is_admin',     $6, true)`,
      [claims.email || "", claims.principal || "", claims.organization || "",
       p.domain_role || "", claims.sub || "",
       p.is_administrator ? "true" : "false"],
    );

    // From here on the connection has only the principal's rights.
    await client.query(`SET LOCAL ROLE ${quoteIdent(p.pg_role_name)}`);

    const out = await fn(client, p);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Quote a Postgres identifier. The role name comes from the database, but
 *  quoting it keeps this safe even if a principal is ever named oddly. */
function quoteIdent(s) {
  return '"' + String(s).replace(/"/g, '""') + '"';
}
