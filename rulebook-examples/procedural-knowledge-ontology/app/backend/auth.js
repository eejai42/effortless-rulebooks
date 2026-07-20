// ---------------------------------------------------------------------------
// Identity for the PKO Procedure Register.
//
// Tokens are REAL RS256 JWTs signed with a real keypair. The only thing the
// dev minter skips is the email round-trip -- everything downstream (claim
// shape, signature verification, issuer pinning, expiry) is identical to what
// magic-links issues in production, so swapping the issuer changes no other
// code.
//
// The load-bearing property: a token's claims are JOINED FROM THE DATABASE at
// mint time, never accepted from the client. The client says "I want to sign
// in as principal X"; the server checks PrincipalAssignments to see whether
// that user may act as X, and derives organization / role / admin-ness from
// the rulebook's own tables. A forged claim in a request body changes nothing.
//
// Change what a principal may see, sign in again, and the new token carries
// new claims -- which is exactly how "make someone an admin and they see the
// admin schema" works with no code change.
// ---------------------------------------------------------------------------
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KEY_DIR = process.env.PKO_KEY_DIR || path.join(HERE, ".keys");
const PRIV = path.join(KEY_DIR, "dev-signing-key.pem");
const PUB = path.join(KEY_DIR, "dev-signing-key.pub.pem");

export const ISSUER = process.env.PKO_JWT_ISSUER || "dev-mint";
export const TOKEN_TTL_SECONDS = Number(process.env.PKO_JWT_TTL || 3600);

// --- keypair ---------------------------------------------------------------
// Generated once and persisted, so tokens survive a restart. In production
// this is replaced by the magic-links tenant's public key and the private key
// never exists here at all.
function ensureKeypair() {
  if (fs.existsSync(PRIV) && fs.existsSync(PUB)) {
    return { privateKey: fs.readFileSync(PRIV, "utf8"),
             publicKey: fs.readFileSync(PUB, "utf8") };
  }
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  fs.mkdirSync(KEY_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(PRIV, privateKey, { mode: 0o600 });
  fs.writeFileSync(PUB, publicKey, { mode: 0o644 });
  return { privateKey, publicKey };
}

const { privateKey, publicKey } = ensureKeypair();
export const PUBLIC_KEY_PEM = publicKey;

// --- who may sign in, and as what -----------------------------------------
// Read live from the views. This is the whole point: the answer changes when
// the rulebook changes, with no redeploy.
export async function listSignIns(pool) {
  const { rows } = await pool.query(`
    SELECT pa.principal_assignment_id,
           pa.app_user            AS app_user_id,
           pa.principal           AS principal_id,
           pa.is_default,
           u.display_name,
           u.email_address,
           u.organization,
           u.agent_kind,
           p.label                AS principal_label,
           p.is_administrator,
           p.domain_role,
           p.pg_role_name,
           p.schema_name,
           r.responsibility
      FROM vw_principal_assignments pa
      JOIN vw_app_users         u ON u.app_user_id        = pa.app_user
      JOIN vw_access_principals p ON p.access_principal_id = pa.principal
      LEFT JOIN vw_roles        r ON r.role_id             = p.domain_role
     WHERE u.is_enabled
     ORDER BY p.is_administrator DESC, u.display_name, p.label
  `);
  return rows;
}

// --- mint ------------------------------------------------------------------
// appUserId + principalId -> a signed token whose claims came from the DB.
export async function mintToken(pool, appUserId, principalId) {
  const { rows } = await pool.query(
    `SELECT pa.app_user, pa.principal,
            u.email_address, u.display_name, u.organization, u.is_enabled,
            p.is_administrator, p.domain_role, p.pg_role_name, p.schema_name,
            p.label AS principal_label
       FROM vw_principal_assignments pa
       JOIN vw_app_users         u ON u.app_user_id        = pa.app_user
       JOIN vw_access_principals p ON p.access_principal_id = pa.principal
      WHERE pa.app_user = $1 AND pa.principal = $2`,
    [appUserId, principalId],
  );

  // No assignment => this user may not act as this principal. Refuse. This is
  // the check that makes the principal claim trustworthy downstream.
  if (rows.length === 0) {
    const err = new Error(
      `${appUserId} is not assigned to ${principalId}`);
    err.status = 403;
    throw err;
  }
  const a = rows[0];
  if (!a.is_enabled) {
    const err = new Error(`${appUserId} is disabled`);
    err.status = 403;
    throw err;
  }

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: a.app_user,
    email: a.email_address,
    principal: a.principal,
    organization: a.organization,
    role: a.domain_role,
    is_admin: a.is_administrator === true,
    pg_role: a.pg_role_name,
    schema: a.schema_name,
    name: a.display_name,
    principal_label: a.principal_label,
    iss: ISSUER,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const token = jwt.sign(claims, privateKey, { algorithm: "RS256" });

  // Audit: what was minted, for whom, with which claims.
  await pool.query(
    `INSERT INTO issued_tokens
       (issued_token_id, app_user, principal, issued_at, expires_at,
        issuer, subject_claim, claims_snapshot, semantic_type_iri)
     VALUES ($1,$2,$3,to_timestamp($4),to_timestamp($5),$6,$7,$8,$9)`,
    [`tok-${a.app_user}-${now}`, a.app_user, a.principal, now,
     now + TOKEN_TTL_SECONDS, ISSUER, a.app_user,
     JSON.stringify(claims), "urn:effortless:pko-extension#IssuedToken"],
  ).catch(() => { /* audit must never block sign-in */ });

  return { token, claims, expires_in: TOKEN_TTL_SECONDS };
}

// --- verify ----------------------------------------------------------------
export function verifyToken(token) {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer: ISSUER,
  });
}

// Express middleware: verify the bearer token and attach req.claims.
export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  if (!hdr.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing_token" });
  }
  try {
    req.claims = verifyToken(hdr.slice(7));
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid_token", detail: e.message });
  }
}
