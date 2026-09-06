import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EDITOR_API = "http://localhost:42441";

// Server-side reachability probe for modeled localhost services.
// The browser cannot probe other localhost ports itself (CORS), so the explorer
// asks its own dev server to try. Only http://localhost / 127.0.0.1 URLs are
// accepted; anything else is refused rather than guessed at.
function healthProbePlugin() {
  return {
    name: "erb-health-probe",
    configureServer(server) {
      server.middlewares.use("/__probe", async (req, res) => {
        const url = new URL(req.url, "http://localhost").searchParams.get("url");
        res.setHeader("Content-Type", "application/json");
        let target;
        try {
          target = new URL(url);
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: "missing or malformed url" }));
          return;
        }
        if (target.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(target.hostname)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: "only http://localhost URLs may be probed" }));
          return;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        try {
          const response = await fetch(target, { method: "GET", signal: controller.signal, redirect: "manual" });
          res.end(JSON.stringify({ ok: response.status < 500, status: response.status, url: target.href }));
        } catch (error) {
          res.end(JSON.stringify({ ok: false, error: error.name === "AbortError" ? "timeout" : String(error.message || error), url: target.href }));
        } finally {
          clearTimeout(timer);
        }
      });
    },
  };
}

// Serve the root's generated documents (progress report, RuleSpeak) read-only from
// the repository so the explorer can link to them without copying them.
const GENERATED = {
  "/generated/progress-report/": path.resolve(__dirname, "../progress-report/progress-report"),
  "/generated/rulespeak/": path.resolve(__dirname, "../rulespeak"),
};
const MIME = { ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".json": "application/json", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };

function generatedFilesPlugin() {
  return {
    name: "erb-generated-files",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url, "http://localhost").pathname;
        const prefix = Object.keys(GENERATED).find((p) => pathname.startsWith(p));
        if (!prefix) return next();
        const relative = decodeURIComponent(pathname.slice(prefix.length));
        const file = path.resolve(GENERATED[prefix], relative);
        if (!file.startsWith(GENERATED[prefix] + path.sep)) {
          res.statusCode = 400;
          res.end("path escapes the generated directory");
          return;
        }
        try {
          const data = await fs.readFile(file);
          res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
          res.end(data);
        } catch (error) {
          res.statusCode = error.code === "ENOENT" ? 404 : 500;
          res.setHeader("Content-Type", "text/plain");
          res.end(`${error.code === "ENOENT" ? "generated file not found" : "could not read generated file"}: ${file}\nRun 'effortless build' at the repository root to regenerate it.`);
        }
      });
    },
  };
}

// Close a consistency finding from the work queue (US-036).
// The rulebook JSON is HEAD, so the write goes through scripts/mark-finding-fixed.py
// (the same diff-minimal path the CLI uses; it refuses non-open and scanner-derived
// findings). The editor's base table is then PATCHed so the live views recompute at
// once; the editor's own save-changes is NOT used because it rewrites the whole
// file (finding cr-21-01).
const REPO_ROOT = path.resolve(__dirname, "..");
const RULEBOOK = "effortless-rulebook/effortless-rulebook.json";
const FINDING_STATUSES = new Set(["fixed", "accepted-exception"]);

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function markFindingInRulebook(id, status) {
  return new Promise((resolve, reject) => {
    execFile(
      "python3",
      ["scripts/mark-finding-fixed.py", RULEBOOK, "--status", status, id],
      { cwd: REPO_ROOT },
      (error, stdout, stderr) => (error ? reject(new Error((stderr || stdout || error.message).trim())) : resolve(stdout.trim())),
    );
  });
}

function findingStatusPlugin() {
  return {
    name: "erb-finding-status",
    configureServer(server) {
      server.middlewares.use("/__findings", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        const match = /^\/([A-Za-z0-9-]+)\/status$/.exec(new URL(req.url, "http://localhost").pathname);
        if (req.method !== "POST" || !match) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: "POST /__findings/<id>/status" }));
          return;
        }
        const id = match[1];
        let status;
        try {
          ({ status } = await readJsonBody(req));
        } catch (error) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: `malformed JSON body: ${error.message}` }));
          return;
        }
        if (!FINDING_STATUSES.has(status)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: `status must be one of ${[...FINDING_STATUSES].join(", ")}` }));
          return;
        }
        try {
          await markFindingInRulebook(id, status);
        } catch (error) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: error.message }));
          return;
        }
        const patch = await fetch(`${EDITOR_API}/api/tables/ConsistencyFindings/rows/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Status: status }),
        }).catch((error) => ({ ok: false, status: 0, text: async () => String(error.message || error) }));
        if (!patch.ok) {
          res.statusCode = 502;
          res.end(JSON.stringify({ ok: false, error: `${RULEBOOK} now says ${id} is ${status}, but the editor API refused the base-table write (HTTP ${patch.status}): ${await patch.text()}` }));
          return;
        }
        res.end(JSON.stringify({ ok: true, id, status }));
      });
    },
  };
}

// Trigger a conformance harness run (cap-conformance-harness, promoted to a
// first-class explorer feature). Same shape as findingStatusPlugin: the write
// path is a repo script, not a route bolted onto the generated API. Runs
// scripts/run-conformance.py <slug>, which shells out to the EXISTING harness
// (rulebook-examples/legacy-runner/orchestration/test-orchestrator.py — not
// reimplemented here), records ConformanceRuns/ConformanceResults rows in the
// rulebook JSON, then runs `effortless build` so the views pick them up.
// This can run for a while (every registered substrate), so no artificial
// timeout is imposed beyond Node's default.
const SLUG_RE = /^[A-Za-z0-9-]+$/;

function runConformanceScript(slug) {
  return new Promise((resolve, reject) => {
    execFile(
      "python3",
      ["scripts/run-conformance.py", slug],
      { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 * 16 },
      (error, stdout, stderr) => (error ? reject(new Error((stderr || stdout || error.message).trim())) : resolve(stdout.trim())),
    );
  });
}

function conformanceRunPlugin() {
  return {
    name: "erb-conformance-run",
    configureServer(server) {
      server.middlewares.use("/__conformance", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        const match = /^\/([A-Za-z0-9-]+)\/run$/.exec(new URL(req.url, "http://localhost").pathname);
        if (req.method !== "POST" || !match) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: "POST /__conformance/<slug>/run" }));
          return;
        }
        const slug = match[1];
        if (!SLUG_RE.test(slug)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: "slug must match [A-Za-z0-9-]+" }));
          return;
        }
        try {
          const output = await runConformanceScript(slug);
          res.end(JSON.stringify({ ok: true, slug, output }));
        } catch (error) {
          res.statusCode = 502;
          res.end(JSON.stringify({ ok: false, error: error.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [healthProbePlugin(), generatedFilesPlugin(), findingStatusPlugin(), conformanceRunPlugin()],
  server: {
    proxy: {
      "/api": { target: EDITOR_API, changeOrigin: true },
    },
  },
});
