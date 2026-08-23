#!/bin/bash
# create-substrate-report.sh - Generate substrate-report.html for the Airtable utility substrate.
#
# Airtable is the rulebook source-of-truth sync step, not a computation substrate.
# Its report shows: what it does, the current base, the last sync log, and the
# full effortless-rulebook.json rendered with JSON syntax highlighting.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

python3 << 'PYTHON_SCRIPT'
import html
import json
import os

SUBSTRATE_NAME = "airtable"
SUBSTRATE_TITLE = "Airtable Execution Substrate"
SUBSTRATE_ICON = "🗂️"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
_erb_rulebook = os.environ.get('ERB_RULEBOOK_PATH')
if not _erb_rulebook:
    raise RuntimeError(
        "ERB_RULEBOOK_PATH is not set. The airtable substrate report is "
        "per-project; the orchestrator must export ERB_RULEBOOK_PATH before "
        "calling create-substrate-report.sh."
    )
RULEBOOK_PATH = _erb_rulebook
if not os.path.exists(RULEBOOK_PATH):
    raise FileNotFoundError(f"Rulebook not found at ERB_RULEBOOK_PATH={RULEBOOK_PATH}.")


def read_file(path, default=""):
    """Read a file. A missing path returns the supplied default (legitimate
    "no log yet" / "no README" rendering). A file that EXISTS but cannot be
    opened raises — corruption is a bug, not a rendering edge case.
    """
    if not os.path.exists(path):
        return default
    with open(path, 'r') as f:
        return f.read()


def _project_config_path():
    return os.path.join(PROJECT_ROOT, 'effortless.json')


config_path = _project_config_path()
if not os.path.exists(config_path):
    raise FileNotFoundError(
        f"effortless.json missing at {config_path}. "
        "Run 'effortless -init' to initialize this project."
    )
with open(config_path, 'r') as f:
    config = json.load(f)  # JSONDecodeError MUST propagate — bad config is a bug

base_id = ''
for setting in config.get('ProjectSettings', []):
    if setting.get('Name') == 'baseId':
        base_id = setting.get('Value', '')
        break

with open(RULEBOOK_PATH, 'r') as f:
    rulebook = json.load(f)  # JSONDecodeError MUST propagate — bad rulebook is a bug

# The rulebook's own Name is canonical. If absent, use the domain folder name.
project_name = rulebook.get('Name') or os.path.basename(PROJECT_ROOT)

# Summarize the rulebook so the first tab isn't just the raw JSON dump.
entities = []
for key, value in rulebook.items():
    if isinstance(value, dict) and 'schema' in value:
        schema = value.get('schema', [])
        data = value.get('data', [])
        entities.append({
            'name': key,
            'fields': len(schema),
            'records': len(data),
            'description': (value.get('description') or '').strip()[:200],
        })

log_content = read_file('.last-run.log', 'No sync has been run yet in this session.')

bases_file = os.path.join(PROJECT_ROOT, 'orchestration', 'bases.json')
if os.path.exists(bases_file):
    with open(bases_file, 'r') as f:
        bases = json.load(f)  # JSONDecodeError MUST propagate
else:
    bases = []

rulebook_pretty = json.dumps(rulebook, indent=2, default=str, ensure_ascii=False)

base_rows = ''
for b in bases:
    marker = ' <strong>(active)</strong>' if b.get('id') == base_id else ''
    base_rows += (
        f'<tr><td><code>{html.escape(b.get("id", ""))}</code></td>'
        f'<td>{html.escape(b.get("name", ""))}{marker}</td></tr>'
    )
if not base_rows:
    base_rows = '<tr><td colspan="2"><em>No bases registered yet.</em></td></tr>'

entity_rows = ''
for e in entities:
    entity_rows += (
        f'<tr><td><code>{html.escape(e["name"])}</code></td>'
        f'<td>{e["fields"]}</td>'
        f'<td>{e["records"]}</td>'
        f'<td>{html.escape(e["description"])}</td></tr>'
    )
if not entity_rows:
    entity_rows = '<tr><td colspan="4"><em>Rulebook is empty or not yet synced.</em></td></tr>'

rulebook_size_kb = max(1, len(rulebook_pretty.encode('utf-8')) // 1024)

HTML = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Substrate Report: {sub_name}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css">
    <style>
:root {{
    --bg-primary: #ffffff; --bg-secondary: #f8f9fa; --bg-tertiary: #e9ecef;
    --text-primary: #212529; --text-secondary: #6c757d; --border-color: #dee2e6;
    --accent-color: #0d6efd; --success-color: #198754; --code-bg: #f6f8fa; --radius: 6px;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg-secondary); color: var(--text-primary); line-height: 1.5; min-height: 100vh; }}
header {{ background: var(--bg-primary); border-bottom: 1px solid var(--border-color); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; }}
.header-left {{ display: flex; align-items: center; gap: 0.75rem; }}
.substrate-icon {{ font-size: 1.5rem; }}
h1 {{ font-size: 1.1rem; font-weight: 600; }}
.header-stats {{ display: flex; gap: 1rem; font-size: 0.8rem; }}
.stat {{ display: flex; align-items: center; gap: 0.25rem; }}
.stat-value {{ font-weight: 600; }}
.score-perfect {{ color: var(--success-color); }}
main {{ max-width: 1300px; margin: 0 auto; padding: 1rem; }}
.tabs {{ display: flex; gap: 0.25rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; flex-wrap: wrap; }}
.tab {{ background: none; border: none; padding: 0.5rem 0.9rem; font-size: 0.85rem; cursor: pointer; color: var(--text-secondary); border-bottom: 2px solid transparent; }}
.tab:hover {{ color: var(--text-primary); }}
.tab.active {{ color: var(--accent-color); border-bottom-color: var(--accent-color); font-weight: 600; }}
.tab-content {{ display: none; }}
.tab-content.active {{ display: block; }}
.card {{ background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1rem; margin-bottom: 1rem; }}
.card h2 {{ font-size: 1rem; margin-bottom: 0.75rem; }}
.card pre {{ background: #1e1e1e; color: #d4d4d4; padding: 0.75rem; border-radius: var(--radius); overflow-x: auto; font-family: 'SF Mono', Monaco, monospace; font-size: 0.75rem; line-height: 1.4; max-height: 640px; overflow-y: auto; }}
table {{ width: 100%; border-collapse: collapse; font-size: 0.85rem; }}
th, td {{ border: 1px solid var(--border-color); padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }}
th {{ background: var(--bg-tertiary); font-weight: 600; }}
code {{ background: var(--code-bg); padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.85em; }}
.code-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }}
.code-info {{ font-size: 0.75rem; color: var(--text-secondary); }}
ul {{ margin-left: 1.25rem; }} li {{ margin-bottom: 0.25rem; }}
    </style>
</head>
<body>
    <header>
        <div class="header-left">
            <span class="substrate-icon">{icon}</span>
            <h1>{title}</h1>
        </div>
        <div class="header-stats">
            <div class="stat"><span>Score:</span> <span class="stat-value score-perfect">100%</span></div>
            <div class="stat"><span>Base:</span> <span class="stat-value"><code>{base_id}</code></span></div>
        </div>
    </header>

    <main>
        <nav class="tabs">
            <button class="tab active" data-tab="description">Description</button>
            <button class="tab" data-tab="current">Current Base</button>
            <button class="tab" data-tab="rulebook">Rulebook (JSON)</button>
            <button class="tab" data-tab="entities">Entities</button>
            <button class="tab" data-tab="log">Last Sync Log</button>
        </nav>

        <div id="description" class="tab-content active">
            <div class="card">
                <h2>What This Substrate Does</h2>
                <p>Airtable is the <strong>oracle</strong>: the rulebook it pulls
                <em>is</em> the answer key that every other substrate is graded against.
                Its own test-answers are, by construction, exactly the answer keys &mdash;
                so it always scores 100%. A failing score here would mean the pipeline
                itself is broken, not the substrate.</p>
                <p>Running <code>[A]</code> executes Airtable first as <em>Step 0</em> so
                answer keys are generated from a freshly-pulled rulebook. Running
                <code>[01]</code> alone pulls without re-running the computation substrates.</p>
            </div>
            <div class="card">
                <h2>Interactive Flow</h2>
                <ul>
                    <li>Shows the currently active base and every known base in <code>orchestration/bases.json</code>.</li>
                    <li><strong>Enter</strong> pulls from the active base.</li>
                    <li><strong>A number</strong> switches to that base and pulls.</li>
                    <li><strong>S</strong> skips the pull entirely &mdash; subsequent substrates run against the existing rulebook.</li>
                    <li><strong>N</strong> adds a new base ID and pulls from it.</li>
                </ul>
                <p>In CI / Docker mode it is non-interactive: keeps the current base and
                performs an offline sync from the cache.</p>
            </div>
        </div>

        <div id="current" class="tab-content">
            <div class="card">
                <h2>Active Base</h2>
                <table>
                    <tr><th style="width: 140px;">Project</th><td>{project_name}</td></tr>
                    <tr><th>Base ID</th><td><code>{base_id}</code></td></tr>
                    <tr><th>Rulebook path</th><td><code>effortless-rulebook/{project_name}-rulebook.json</code></td></tr>
                    <tr><th>Rulebook size</th><td>{rulebook_size_kb} KB</td></tr>
                </table>
            </div>
            <div class="card">
                <h2>Known Bases</h2>
                <table>
                    <tr><th style="width: 240px;">Base ID</th><th>Name</th></tr>
                    {base_rows}
                </table>
            </div>
        </div>

        <div id="entities" class="tab-content">
            <div class="card">
                <h2>Rulebook Entities</h2>
                <p>Synthesized from <code>effortless-rulebook.json</code>. Record counts
                reflect the seed data embedded in the rulebook.</p>
                <table>
                    <tr><th>Entity</th><th>Fields</th><th>Records</th><th>Description</th></tr>
                    {entity_rows}
                </table>
            </div>
        </div>

        <div id="rulebook" class="tab-content">
            <div class="card">
                <div class="code-header">
                    <h2>effortless-rulebook.json</h2>
                    <span class="code-info">{rulebook_size_kb} KB</span>
                </div>
                <pre class="line-numbers"><code class="language-json">{rulebook_json}</code></pre>
            </div>
        </div>

        <div id="log" class="tab-content">
            <div class="card">
                <h2>Last Sync Log</h2>
                <pre>{log_content}</pre>
            </div>
        </div>
    </main>

    <script>
        document.querySelectorAll('.tab').forEach(function (btn) {{
            btn.addEventListener('click', function () {{
                var target = btn.getAttribute('data-tab');
                document.querySelectorAll('.tab').forEach(function (b) {{ b.classList.remove('active'); }});
                document.querySelectorAll('.tab-content').forEach(function (c) {{ c.classList.remove('active'); }});
                btn.classList.add('active');
                var el = document.getElementById(target);
                if (el) el.classList.add('active');
            }});
        }});
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
</body>
</html>'''

output = HTML.format(
    sub_name=SUBSTRATE_NAME,
    icon=SUBSTRATE_ICON,
    title=SUBSTRATE_TITLE,
    project_name=html.escape(project_name),
    base_id=html.escape(base_id),
    rulebook_size_kb=rulebook_size_kb,
    base_rows=base_rows,
    entity_rows=entity_rows,
    rulebook_json=html.escape(rulebook_pretty),
    log_content=html.escape(log_content),
)

with open('substrate-report.html', 'w') as f:
    f.write(output)

print(f"Generated: substrate-report.html ({len(output)} bytes)")
PYTHON_SCRIPT
