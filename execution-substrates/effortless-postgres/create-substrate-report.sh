#!/bin/bash
# create-substrate-report.sh - Generate substrate-report.html for PostgreSQL substrate.
#
# The postgres transpiler emits eleven numbered SQL files in /postgres; this
# script gathers each one and renders it in its own tab with SQL syntax
# highlighting (Prism.js). Shape mirrors python/golang substrate reports.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

python3 << 'PYTHON_SCRIPT'
import html
import os
import re

SUBSTRATE_NAME = "effortless-postgres"
SUBSTRATE_TITLE = "Effortless-PostgreSQL Execution Substrate"
SUBSTRATE_ICON = "🐘"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))


def _default_postgres_dir():
    """Default ERB_POSTGRES_DIR: rulebook-examples/<ERB_DOMAIN>/postgres-bootstrap/.

    The rulebook-to-postgres transpiler emits the numbered SQL files into the
    active domain's postgres-bootstrap/ folder (see orchestration/shared.py,
    which maps folder 'postgres-bootstrap' -> substrate 'effortless-postgres').
    The default IS the right answer for the active domain; ERB_POSTGRES_DIR only
    overrides. There is no domain-agnostic location to fall back to.
    """
    domain = os.environ.get('ERB_DOMAIN', '').strip()
    if not domain:
        raise RuntimeError(
            "ERB_DOMAIN is not set and ERB_POSTGRES_DIR was not supplied; "
            "cannot resolve the postgres-bootstrap directory."
        )
    return os.path.join(REPO_ROOT, 'rulebook-examples', domain, 'postgres-bootstrap')


POSTGRES_DIR = os.environ.get('ERB_POSTGRES_DIR') or _default_postgres_dir()


def read_file(path, default=""):
    try:
        with open(path, 'r') as f:
            return f.read()
    except Exception:
        return default


def read_required_sql(path):
    """Read a generated SQL file that MUST exist. Raise on failure — never
    substitute a placeholder. A silent '-- (file not generated yet)' default
    would render the report green while showing nothing, masking a wrong path
    or a failed build (the exact anti-pattern CLAUDE.md forbids)."""
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Generated SQL not found at {path}. The rulebook-to-postgres "
            f"transpiler is supposed to emit it into POSTGRES_DIR "
            f"({POSTGRES_DIR}) before this report-generator runs. If you're "
            f"seeing this, either the build failed or POSTGRES_DIR is wrong "
            f"(set ERB_DOMAIN / ERB_POSTGRES_DIR correctly) — do not substitute "
            f"a default."
        )
    with open(path, 'r') as f:
        return f.read()


def _default_testing_dir():
    """Default ERB_TESTING_DIR: rulebook-examples/<ERB_DOMAIN>/testing/."""
    domain = os.environ.get('ERB_DOMAIN', '').strip()
    if not domain:
        raise RuntimeError(
            "ERB_DOMAIN is not set and ERB_TESTING_DIR was not supplied; "
            "cannot resolve the testing directory."
        )
    return os.path.join(REPO_ROOT, 'rulebook-examples', domain, 'testing')


def _resolve_test_results_path():
    erb_testing = os.environ.get('ERB_TESTING_DIR') or _default_testing_dir()
    path = os.path.join(erb_testing, SUBSTRATE_NAME, 'test-results.md')
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"test-results.md not found at {path}. "
            f"The grader (grade-and-record.py) is supposed to write it before "
            f"this report-generator runs. If you're seeing this, the grader "
            f"failed silently — investigate it, do not substitute defaults."
        )
    return path


# SQL files emitted by rulebook-to-postgres, in build order.
# Each tuple: (file, tab_id, label, group)
SQL_FILES = [
    ('00-bootstrap.sql',            'sql-bootstrap', '00 · Bootstrap',    'Schema'),
    ('01-drop-and-create-tables.sql','sql-tables',   '01 · Tables',       'Schema'),
    ('01b-customize-schema.sql',    'sql-tables-b', '01b · Customize',   'Schema'),
    ('02-create-functions.sql',     'sql-fns',      '02 · Functions',    'Functions'),
    ('02b-customize-functions.sql', 'sql-fns-b',    '02b · Customize',   'Functions'),
    ('03-create-views.sql',         'sql-views',    '03 · Views',        'Views'),
    ('03b-customize-views.sql',     'sql-views-b',  '03b · Customize',   'Views'),
    ('04-create-policies.sql',      'sql-policies', '04 · Policies',     'Policies'),
    ('04b-customize-policies.sql',  'sql-policies-b','04b · Customize',  'Policies'),
    ('05-insert-data.sql',          'sql-data',     '05 · Data',         'Data'),
    ('05b-customize-data.sql',      'sql-data-b',   '05b · Customize',   'Data'),
]

sql_sources = {}
for fname, tab_id, _label, _group in SQL_FILES:
    sql_sources[tab_id] = read_required_sql(os.path.join(POSTGRES_DIR, fname))

log_content = read_file('.last-run.log', 'No log available')
test_results = read_file(_resolve_test_results_path(), 'No test results available')
readme = read_file(os.path.join(POSTGRES_DIR, 'README.md'), '')

# Metrics from test-results.md
score_match = re.search(r'(\d+\.?\d*)%', test_results)
score = score_match.group(0) if score_match else 'N/A'
passed_match = re.search(r'\| Passed \| (\d+)', test_results)
passed = passed_match.group(1) if passed_match else '0'
failed_match = re.search(r'\| Failed \| (\d+)', test_results)
failed = failed_match.group(1) if failed_match else '0'
total_match = re.search(r'\| Total Fields Tested \| (\d+)', test_results)
total = total_match.group(1) if total_match else '0'

try:
    score_num = float(score.replace('%', '')) if '%' in score else 0
except ValueError:
    score_num = 0
if score_num >= 100:
    score_class = 'score-perfect'
elif score_num >= 80:
    score_class = 'score-good'
elif score_num >= 60:
    score_class = 'score-warning'
else:
    score_class = 'score-danger'

log_escaped = html.escape(log_content)

# Build SQL tab content blocks
def build_sql_tab(tab_id: str, label: str, source: str) -> str:
    line_count = len(source.split('\n'))
    size_kb = max(1, len(source.encode('utf-8')) // 1024)
    escaped = html.escape(source)
    return f'''        <div id="{tab_id}" class="tab-content">
            <div class="card">
                <div class="code-header">
                    <h2>{html.escape(label)}</h2>
                    <div>
                        <span class="code-info">{line_count} lines · {size_kb} KB</span>
                    </div>
                </div>
                <pre class="line-numbers"><code class="language-sql">{escaped}</code></pre>
            </div>
        </div>'''


sql_tab_buttons = '\n            '.join(
    f'<button class="tab" data-tab="{tab_id}">{html.escape(label)}</button>'
    for _fname, tab_id, label, _group in SQL_FILES
)

sql_tab_contents = '\n'.join(
    build_sql_tab(tab_id, label, sql_sources[tab_id])
    for _fname, tab_id, label, _group in SQL_FILES
)

# -- HTML template -----------------------------------------------------------
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
    --accent-color: #0d6efd; --success-color: #198754; --warning-color: #ffc107;
    --danger-color: #dc3545; --code-bg: #f6f8fa; --radius: 6px;
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
.score-good {{ color: #66bb6a; }}
.score-warning {{ color: var(--warning-color); }}
.score-danger {{ color: var(--danger-color); }}
main {{ max-width: 1300px; margin: 0 auto; padding: 1rem; }}
.tabs {{ display: flex; flex-wrap: wrap; gap: 0.25rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; }}
.tab {{ background: none; border: none; padding: 0.5rem 0.9rem; font-size: 0.85rem; cursor: pointer; color: var(--text-secondary); border-bottom: 2px solid transparent; }}
.tab:hover {{ color: var(--text-primary); }}
.tab.active {{ color: var(--accent-color); border-bottom-color: var(--accent-color); font-weight: 600; }}
.tab-content {{ display: none; }}
.tab-content.active {{ display: block; }}
.card {{ background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1rem; margin-bottom: 1rem; }}
.card h2 {{ font-size: 1rem; margin-bottom: 0.75rem; }}
.card h3 {{ font-size: 0.9rem; margin: 0.75rem 0 0.5rem; }}
.card pre {{ background: #1e1e1e; color: #d4d4d4; padding: 0.75rem; border-radius: var(--radius); overflow-x: auto; font-family: 'SF Mono', Monaco, monospace; font-size: 0.75rem; line-height: 1.4; max-height: 560px; overflow-y: auto; }}
.code-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }}
.code-info {{ font-size: 0.75rem; color: var(--text-secondary); }}
.section-label {{ font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); padding: 0 0.5rem; align-self: center; letter-spacing: 0.05em; }}
.results-summary {{ display: flex; gap: 1.5rem; flex-wrap: wrap; }}
.result-item {{ text-align: center; }}
.result-value {{ font-size: 1.5rem; font-weight: 700; }}
.result-label {{ font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; }}
.arch-diagram {{ font-family: 'SF Mono', Monaco, monospace; font-size: 0.75rem; line-height: 1.25; white-space: pre; background: var(--code-bg); padding: 0.75rem; border-radius: var(--radius); overflow-x: auto; }}
ul, ol {{ margin-left: 1.25rem; }}
li {{ margin-bottom: 0.25rem; }}
    </style>
</head>
<body>
    <header>
        <div class="header-left">
            <span class="substrate-icon">{icon}</span>
            <h1>{title}</h1>
        </div>
        <div class="header-stats">
            <div class="stat"><span>Score:</span> <span class="stat-value {score_class}">{score}</span></div>
            <div class="stat"><span>{passed}/{total} passed</span></div>
        </div>
    </header>

    <main>
        <nav class="tabs">
            <button class="tab active" data-tab="description">Description</button>
            <button class="tab" data-tab="log">Run Log</button>
            <button class="tab" data-tab="results">Test Results</button>
            <span class="section-label">SQL</span>
            {sql_tab_buttons}
        </nav>

        <div id="description" class="tab-content active">
            <div class="card">
                <h2>What This Substrate Does</h2>
                <p>PostgreSQL is the reference substrate. The <code>rulebook-to-postgres</code>
                transpiler emits a complete schema &mdash; tables, type-safe
                <code>calc_*</code> and <code>get_*</code> functions, aggregating views, RLS
                policies and seed data &mdash; so the database itself enforces every
                rule in the rulebook. Unlike the other substrates, PostgreSQL has <strong>no
                expressive gaps</strong>: full joins, aggregations, recursive queries, all
                formula types.</p>
            </div>
            <div class="card">
                <h2>Architecture</h2>
                <div class="arch-diagram">┌─────────────────────────────────────────────────────────────┐
│               effortless-rulebook.json                       │
└─────────────────────────────┬───────────────────────────────┘
                              │  rulebook-to-postgres
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  postgres/                                                   │
│    00-bootstrap.sql          ← extensions, schemas, roles    │
│    01-drop-and-create-tables.sql                             │
│    01b-customize-schema.sql  ← hand edits survive rebuilds   │
│    02-create-functions.sql   ← calc_*() per computed field   │
│    02b-customize-functions.sql                               │
│    03-create-views.sql       ← vw_* with full joins + aggs   │
│    03b-customize-views.sql                                   │
│    04-create-policies.sql    ← row-level security            │
│    04b-customize-policies.sql                                │
│    05-insert-data.sql        ← seed records                  │
│    05b-customize-data.sql                                    │
└─────────────────────────────────────────────────────────────┘</div>
            </div>
            <div class="card">
                <h2>Key Features</h2>
                <ul>
                    <li><strong>Reference implementation</strong> — the other substrates are graded against the same behaviour PostgreSQL produces.</li>
                    <li><strong><code>calc_*</code> functions</strong> — every calculated field becomes a SQL function with the right types.</li>
                    <li><strong><code>vw_*</code> views</strong> — application code reads views, never base tables, so derived values stay consistent.</li>
                    <li><strong><code>*b-customize-*</code> files</strong> — hand edits live in sibling files that survive regeneration.</li>
                    <li><strong>Row-level security</strong> — tenant isolation and role gating generated from rulebook metadata.</li>
                </ul>
            </div>
            <div class="card">
                <h2>Generated Files</h2>
                <ul>
                    <li><code>00-bootstrap.sql</code> — extensions, schema, utility functions</li>
                    <li><code>01-drop-and-create-tables.sql</code> — base tables with FKs</li>
                    <li><code>02-create-functions.sql</code> — <code>calc_*</code> functions for every computed field</li>
                    <li><code>03-create-views.sql</code> — <code>vw_*</code> views joining raw+computed</li>
                    <li><code>04-create-policies.sql</code> — RLS and role-based policies</li>
                    <li><code>05-insert-data.sql</code> — seed records from the rulebook</li>
                    <li><code>*b-customize-*.sql</code> — hand-edit companion files that survive regeneration</li>
                </ul>
            </div>
        </div>

        <div id="log" class="tab-content">
            <div class="card">
                <h2>Execution Log</h2>
                <pre>{log_content}</pre>
            </div>
        </div>

        <div id="results" class="tab-content">
            <div class="card">
                <h2>Test Summary</h2>
                <div class="results-summary">
                    <div class="result-item"><div class="result-value {score_class}">{score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value score-perfect">{passed}</div><div class="result-label">Passed</div></div>
                    <div class="result-item"><div class="result-value">{failed}</div><div class="result-label">Failed</div></div>
                    <div class="result-item"><div class="result-value">{total}</div><div class="result-label">Total</div></div>
                </div>
            </div>
        </div>

{sql_tab_contents}
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-sql.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
</body>
</html>'''

output = HTML.format(
    sub_name=SUBSTRATE_NAME,
    icon=SUBSTRATE_ICON,
    title=SUBSTRATE_TITLE,
    score=score,
    score_class=score_class,
    passed=passed,
    failed=failed,
    total=total,
    log_content=log_escaped,
    sql_tab_buttons=sql_tab_buttons,
    sql_tab_contents=sql_tab_contents,
)

with open('substrate-report.html', 'w') as f:
    f.write(output)

print(f"Generated: substrate-report.html ({len(output)} bytes)")
PYTHON_SCRIPT
