import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

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

export default defineConfig({
  plugins: [healthProbePlugin(), generatedFilesPlugin()],
  server: {
    proxy: {
      "/api": { target: EDITOR_API, changeOrigin: true },
    },
  },
});
