#!/usr/bin/env python3
"""
ssotme-proxy — local transpiler server on localhost:4242

Each transpiler is a route.  POST to the route, get a fileset back.

    POST /rulebook-to-python
    POST /rulebook-to-postgres
    POST /airtable-to-rulebook

Request body (JSON):
    {
        "inputFile":  "<path to effortless-rulebook.json>",
        "outputDir":  "<path to project output folder>",
        "clean":      false
    }
    Paths are resolved relative to X-Working-Dir header (or server CWD).

Response (JSON):
    {
        "success": true,
        "output":  "...(stdout/stderr)...",
        "files":   { "filename.py": "...content..." }
    }

The injector script IS the body of the route handler — the proxy sets
ERB_RULEBOOK_PATH + ERB_OUTPUT_DIR and runs it.  No separate mechanism.

Install into a project:
    effortless -install http://localhost:4242/rulebook-to-python \\
        -i effortless-rulebook/<project>-rulebook.json \\
        -o python/
"""

import base64
import gzip
import json
import os
import subprocess
import sys
import traceback
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse


# Empty fileset that the ssotme/effortless CLI will happily parse, leaving the
# injector-written files on disk untouched. The CLI's SaveFileSet path requires
# a non-null TranspileRequest.ZippedOutputFileSet (it null-derefs otherwise).
_EMPTY_FILESET_XML = '<?xml version="1.0" encoding="utf-8"?><FileSet></FileSet>'
_EMPTY_ZIPPED_FILESET_B64 = base64.b64encode(gzip.compress(_EMPTY_FILESET_XML.encode("utf-8"))).decode("ascii")


def build_cli_payload(route: str, success: bool, output: str) -> dict:
    """Return a JSON payload shaped like what the ssotme/effortless CLI's
    SSOTMEPayload deserializer expects, so it doesn't crash trying to read
    Transpiler.Name or TranspileRequest.ZippedOutputFileSet.
    """
    return {
        "Transpiler": {
            "Name": route,
            "LowerHyphenName": route,
        },
        "TranspileRequest": {
            "ZippedOutputFileSet": _EMPTY_ZIPPED_FILESET_B64,
        },
        "Logs": [],
        # legacy/lowercase mirror — kept so manual curl-based use still works.
        "success": success,
        "output": output,
        "files": {},
    }

PORT = 4242
SCRIPT_DIR = Path(__file__).resolve().parent
PLATFORM_DIR = SCRIPT_DIR.parent  # repo root: ssotme-proxy/ lives directly under it
PROJECT_ROOT = PLATFORM_DIR

# ---------------------------------------------------------------------------
# Transpiler registry  —  route → injector script
# ---------------------------------------------------------------------------
TRANSPILERS = {
    # --- Airtable sync ---
    "airtable-to-rulebook": {
        "tool": "airtable-to-rulebook",
        "description": "Pull rulebook from Airtable base",
    },
    # --- Local inject-script substrates ---
    "rulebook-to-python": {
        "script": PLATFORM_DIR / "execution-substrates" / "python" / "inject-into-python.py",
        "description": "Generate Python dataclass + calc library from rulebook",
    },
    "rulebook-to-golang": {
        "script": PLATFORM_DIR / "execution-substrates" / "golang" / "inject-into-golang.py",
        "description": "Generate Go structs + business-logic from rulebook",
    },
    "rulebook-to-binary": {
        "script": PLATFORM_DIR / "execution-substrates" / "binary" / "inject-into-binary.py",
        "description": "Generate ARM64 assembly calculation stub from rulebook",
    },
    "rulebook-to-cobol": {
        "script": PLATFORM_DIR / "execution-substrates" / "cobol" / "inject-into-cobol.py",
        "description": "Generate COBOL computation program from rulebook",
    },
    "rulebook-to-csv": {
        "script": PLATFORM_DIR / "execution-substrates" / "csv" / "inject-into-csv.py",
        "description": "Generate CSV exports + rulebook.xlsx from rulebook",
    },
    "rulebook-to-xlsx": {
        "script": PLATFORM_DIR / "execution-substrates" / "xlsx" / "inject-into-xlsx.py",
        "description": "Generate Excel workbook with formulas from rulebook",
    },
    "rulebook-to-uml": {
        "script": PLATFORM_DIR / "execution-substrates" / "uml" / "inject-into-uml.py",
        "description": "Generate PlantUML class diagram + OCL constraints from rulebook",
    },
    "rulebook-to-owl": {
        "script": PLATFORM_DIR / "execution-substrates" / "owl" / "inject-into-owl.py",
        "description": "Generate RDF/OWL ontology from rulebook",
    },
    "rulebook-to-english": {
        "script": PLATFORM_DIR / "execution-substrates" / "english" / "inject-into-english.py",
        "description": "Generate plain-English business-rule narrative from rulebook",
    },
    "rulebook-to-explain-dag": {
        "script": PLATFORM_DIR / "execution-substrates" / "explain-dag" / "inject-into-explain-dag.py",
        "description": "Generate JSON derivation-tracing DAG spec from rulebook",
    },
    # --- Reverse spoke: refresh CALCULATED field VALUES in the rulebook from
    #     Postgres (the consistent-by-construction data objects — NOT the
    #     formulas themselves). Default mode writes derived values only; the
    #     opt-in ERB_ADOPT_RAWS mode also adopts raws/new rows. ---
    "postgres-calculated-to-rulebook": {
        "script": PLATFORM_DIR / "execution-substrates" / "postgres-calculated-to-rulebook" / "inject-into-postgres-calculated-to-rulebook.py",
        "description": "Refresh calculated/lookup/aggregation field values in the rulebook from the vw_* views (raws verified, never written)",
    },
}


def _client_pid_from_port(client_port: int):
    """Find the PID of the process on the other end of the TCP connection
    that has source port == client_port (i.e. the CLI that POSTed to us).
    """
    try:
        out = subprocess.run(
            ["lsof", "-nP", "-iTCP:" + str(client_port), "-sTCP:ESTABLISHED"],
            capture_output=True, text=True, timeout=2,
        ).stdout
        for line in out.splitlines()[1:]:
            parts = line.split()
            if len(parts) < 9:
                continue
            # Format: COMMAND PID USER ... NAME(127.0.0.1:CLIENT->127.0.0.1:4242)
            # We want the row where client_port appears BEFORE the "->" (source side).
            name = parts[-2]
            if f":{client_port}->" in name:
                return int(parts[1])
    except Exception as e:
        print(f"[ssotme-proxy]   client pid lookup failed: {e}", flush=True)
    return None


def _client_cwd_from_pid(pid: int):
    """Return the cwd of pid via lsof -d cwd, or None."""
    try:
        cwd_out = subprocess.run(
            ["lsof", "-a", "-p", str(pid), "-d", "cwd", "-Fn"],
            capture_output=True, text=True, timeout=2,
        ).stdout
        for cwd_line in cwd_out.splitlines():
            if cwd_line.startswith("n"):
                return Path(cwd_line[1:])
    except Exception:
        pass
    return None


def resolve_request(route: str, client_port):
    """
    Resolve (input_file, output_dir) for the proxy request. ONE deterministic
    path, no alternates: read the CLI process's argv via lsof+ps, parse
    `-i <rulebook>`, resolve relative to the CLI's cwd. Anything missing
    raises — we never guess a different path.

    Why this is the one path: the `effortless` CLI sends an empty POST body
    and the X-Working-Dir header is set to the repo root (not the project),
    so the only signal that tells us which project the user is building is
    the CLI process's own argv + cwd. The working_dir header is unreliable
    (CLI overwrites it); the body is empty.
    """
    if client_port is None:
        raise RuntimeError("Request has no client_port — cannot identify CLI process.")

    socket_pid = _client_pid_from_port(client_port)
    if socket_pid is None:
        raise RuntimeError(
            f"No PID found for client TCP port {client_port}. The CLI process "
            f"must be alive and ESTABLISHED on that port when we look."
        )

    # The socket-talking process's cwd IS the substrate folder. The effortless
    # CLI runs each transpiler from its substrate dir (e.g. customer-fullname/xlsx/)
    # before POSTing to us. That single fact pins down everything:
    #   - domain     = <socket_cwd>.parent.name (it's rulebook-examples/<domain>/<sub>/)
    #   - output_dir = <socket_cwd>
    #   - input_file = <socket_cwd>.parent / 'effortless-rulebook' / '<domain>-rulebook.json'
    socket_cwd = _client_cwd_from_pid(socket_pid)
    if socket_cwd is None:
        raise RuntimeError(f"Could not read cwd of socket pid {socket_pid}.")
    socket_cwd = socket_cwd.resolve()

    # rulebook-examples/ and toy-rulebooks/ are two folders for one concept (root
    # CLAUDE.md); a governed project may live in either.
    area_roots = [(PROJECT_ROOT / area).resolve() for area in ("rulebook-examples", "toy-rulebooks")]
    rel = None
    area_root = None
    for candidate in area_roots:
        try:
            rel = socket_cwd.relative_to(candidate)
            area_root = candidate
            break
        except ValueError:
            continue
    if rel is None:
        raise RuntimeError(
            f"CLI cwd is not under any project area ({', '.join(str(a) for a in area_roots)}): {socket_cwd}. "
            f"`effortless build` must be invoked from inside a "
            f"<area>/<domain>/<substrate>/ directory."
        )

    if len(rel.parts) < 2:
        raise RuntimeError(
            f"CLI cwd {socket_cwd} is at the domain root, not a substrate folder. "
            f"Each transpiler must run from <area>/<domain>/<substrate>/. "
            f"rel parts: {rel.parts}"
        )

    domain = rel.parts[0]
    domain_dir = (area_root / domain).resolve()
    output_dir = socket_cwd

    # The hub is named either <slug>-rulebook.json or effortless-rulebook.json;
    # exactly one must exist (ProjectLayoutSlots slot-rulebook-file).
    hub_dir = domain_dir / "effortless-rulebook"
    hub_candidates = [hub_dir / f"{domain}-rulebook.json", hub_dir / "effortless-rulebook.json"]
    hubs = [h for h in hub_candidates if h.is_file()]
    if len(hubs) != 1:
        raise FileNotFoundError(
            f"Expected exactly one rulebook hub for domain '{domain}' at one of "
            f"{[str(h) for h in hub_candidates]}, found {len(hubs)}."
        )
    input_file = hubs[0].resolve()

    print(f"[ssotme-proxy]   resolved: socket_pid={socket_pid} domain={domain} input={input_file} output={output_dir}", flush=True)
    return input_file, output_dir


def run_injector(cfg: dict, input_file: Path, output_dir: Path, clean: bool) -> dict:
    script = cfg.get("script")
    tool = cfg.get("tool")

    if script:
        if not script.exists():
            return {"success": False, "output": f"Injector not found: {script}", "files": {}}
        cmd = [sys.executable, str(script)]
    elif tool:
        cmd = [tool, "-o", str(output_dir / "effortless-rulebook.json"),
               "-account", "airtable", "-p", "view=Grid view"]
    else:
        return {"success": False, "output": "No script or tool configured", "files": {}}

    if clean:
        cmd.append("--clean")

    output_dir.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["ERB_RULEBOOK_PATH"] = str(input_file)
    env["ERB_OUTPUT_DIR"] = str(output_dir)

    result = subprocess.run(cmd, cwd=str(output_dir), env=env,
                            capture_output=True, text=True)

    # The injector already wrote every output file directly to output_dir on
    # disk — there's nothing for the CLI to re-write. The CLI still requires
    # a Transpiler + TranspileRequest.ZippedOutputFileSet in the JSON response
    # (otherwise it null-derefs in SaveFileSet). build_cli_payload supplies an
    # EMPTY zipped fileset so the CLI iterates zero files and writes nothing,
    # leaving the injector's on-disk output intact.
    return {
        "success": result.returncode == 0,
        "output": result.stdout + result.stderr,
        "files": {},
        "returncode": result.returncode,
    }


class ProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[ssotme-proxy] {fmt % args}")

    def send_json(self, status: int, body: dict):
        data = json.dumps(body, indent=2).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(data))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/ping"):
            self.send_json(200, {
                "status": "ok",
                "server": "ssotme-proxy",
                "port": PORT,
                "transpilers": {k: v["description"] for k, v in TRANSPILERS.items()},
            })
        else:
            self.send_json(404, {"error": "Not found"})

    def do_POST(self):
        route = urlparse(self.path).path.lstrip("/")

        if route not in TRANSPILERS:
            self.send_json(404, {
                "error": f"Unknown transpiler '{route}'",
                "available": list(TRANSPILERS.keys()),
            })
            return

        # Consume request body (we don't use it — the effortless CLI sends an
        # empty body anyway). Resolution comes ONLY from inspecting the CLI
        # process's argv + cwd. No body parsing, no working_dir header —
        # one path, fail loudly if it doesn't work.
        length = int(self.headers.get("Content-Length", 0))
        if length:
            self.rfile.read(length)

        client_port = self.client_address[1] if self.client_address else None
        print(f"[ssotme-proxy] POST /{route} from client_port={client_port}", flush=True)

        try:
            input_file, output_dir = resolve_request(route, client_port)
        except Exception as e:
            self.send_json(400, {
                "success": False,
                "error": f"resolve_request failed for /{route}: {e}",
                "files": {},
            })
            return

        try:
            result = run_injector(TRANSPILERS[route], input_file, output_dir, clean=False)
        except Exception:
            result = {"success": False, "output": traceback.format_exc(), "files": {}}

        cli_payload = build_cli_payload(route, result.get("success", False), result.get("output", ""))
        cli_payload["files"] = result.get("files", {})
        status = 200 if result.get("success") else 500
        self.send_json(status, cli_payload)


def main():
    for name, cfg in TRANSPILERS.items():
        script = cfg.get("script")
        if script and not script.exists():
            print(f"[warn] {name}: injector not found at {script}")

    server = HTTPServer(("localhost", PORT), ProxyHandler)
    print(f"ssotme-proxy  http://localhost:{PORT}")
    for name, cfg in TRANSPILERS.items():
        print(f"  POST /{name}  —  {cfg['description']}")
    print("  GET  /ping")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nssotme-proxy stopped.")


if __name__ == "__main__":
    main()
