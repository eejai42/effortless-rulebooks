#!/bin/bash
# create-substrate-report.sh - Generate substrate-report.html for Python substrate

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

python3 << 'PYTHON_SCRIPT'
import html
import os
import re

SUBSTRATE_NAME = "python"
SUBSTRATE_TITLE = "Python Execution Substrate"
SUBSTRATE_ICON = "🐍"

# Read source files. A missing file legitimately renders as the supplied
# default ("No README available", etc) so the report still composes.
# A file that EXISTS but cannot be read is a bug — let the OSError raise
# rather than silently substituting the default and hiding the corruption.
def read_file(path, default=""):
    if not os.path.exists(path):
        return default
    with open(path, 'r') as f:
        return f.read()

def _resolve_test_results_path():
    erb_testing = os.environ.get('ERB_TESTING_DIR')
    if not erb_testing:
        raise RuntimeError(
            "ERB_TESTING_DIR is not set. create-substrate-report.sh must be invoked "
            "via take-test.sh -> grade-and-record.py (which inherits the env from "
            "orchestrate.sh). Do not run this script standalone."
        )
    path = os.path.join(erb_testing, SUBSTRATE_NAME, 'test-results.md')
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"test-results.md not found at {path}. "
            f"The grader (grade-and-record.py) is supposed to write it before "
            f"this report-generator runs. If you're seeing this, the grader "
            f"failed silently — investigate it, do not substitute defaults."
        )
    return path

readme = read_file('README.md', 'No README available')
log_content = read_file('.last-run.log', 'No log available')
test_results = read_file(_resolve_test_results_path(), 'No test results available')
erb_calc = read_file('python_only_erb_simulator.py', '# No generated code available')
erb_sdk = read_file('erb_sdk.py', '# No SDK code available')

# Extract metrics from test-results.md
score_match = re.search(r'(\d+\.?\d*)%', test_results)
score = score_match.group(0) if score_match else "N/A"

passed_match = re.search(r'\| Passed \| (\d+)', test_results)
passed = passed_match.group(1) if passed_match else "0"

failed_match = re.search(r'\| Failed \| (\d+)', test_results)
failed = failed_match.group(1) if failed_match else "0"

total_match = re.search(r'\| Total Fields Tested \| (\d+)', test_results)
total = total_match.group(1) if total_match else "0"

# Determine score class
score_num = float(score.replace('%', '')) if '%' in score else 0
if score_num >= 100:
    score_class = "score-perfect"
elif score_num >= 80:
    score_class = "score-good"
elif score_num >= 60:
    score_class = "score-warning"
else:
    score_class = "score-danger"

# Line counts
calc_lines = len(erb_calc.split('\n'))
sdk_lines = len(erb_sdk.split('\n'))

# Escape for HTML
log_escaped = html.escape(log_content)
erb_calc_escaped = html.escape(erb_calc)
erb_sdk_escaped = html.escape(erb_sdk)

html_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Substrate Report: {substrate_name}</title>
    <style>
:root {{
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e9ecef;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --border-color: #dee2e6;
    --accent-color: #0d6efd;
    --success-color: #198754;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    --code-bg: #f6f8fa;
    --shadow: 0 2px 8px rgba(0,0,0,0.1);
    --radius: 6px;
}}

[data-theme="dark"] {{
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-tertiary: #0f3460;
    --text-primary: #eaeaea;
    --text-secondary: #b0b0b0;
    --border-color: #3a3a5c;
    --accent-color: #4dabf7;
    --success-color: #51cf66;
    --warning-color: #fcc419;
    --danger-color: #ff6b6b;
    --code-bg: #0d1117;
    --shadow: 0 2px 8px rgba(0,0,0,0.3);
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-secondary);
    color: var(--text-primary);
    line-height: 1.5;
    min-height: 100vh;
}}

header {{
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}}

.header-left {{
    display: flex;
    align-items: center;
    gap: 0.75rem;
}}

.substrate-icon {{ font-size: 1.5rem; }}
h1 {{ font-size: 1.1rem; font-weight: 600; }}

.header-stats {{
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
}}

.stat {{ display: flex; align-items: center; gap: 0.25rem; }}
.stat-value {{ font-weight: 600; }}

.score-perfect {{ color: var(--success-color); }}
.score-good {{ color: var(--success-color); }}
.score-warning {{ color: var(--warning-color); }}
.score-danger {{ color: var(--danger-color); }}

#theme-toggle {{
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    width: 28px; height: 28px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem;
}}
#theme-toggle:hover {{ background: var(--accent-color); color: white; }}
#theme-toggle .moon {{ display: none; }}
[data-theme="dark"] #theme-toggle .sun {{ display: none; }}
[data-theme="dark"] #theme-toggle .moon {{ display: inline; }}

.tabs {{
    display: flex;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    overflow-x: auto;
    padding: 0 0.5rem;
}}

.tab {{
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--text-secondary);
    border-bottom: 2px solid transparent;
    white-space: nowrap;
}}
.tab:hover {{ color: var(--text-primary); }}
.tab.active {{ color: var(--accent-color); border-bottom-color: var(--accent-color); font-weight: 500; }}

main {{ padding: 1rem; }}

.tab-content {{ display: none; }}
.tab-content.active {{ display: block; animation: fadeIn 0.2s ease; }}
@keyframes fadeIn {{ from {{ opacity: 0; }} to {{ opacity: 1; }} }}

.card {{
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: var(--shadow);
}}

.card h2 {{ font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }}
.card h3 {{ font-size: 0.85rem; font-weight: 500; margin: 1rem 0 0.5rem 0; color: var(--text-secondary); }}

pre {{
    background: var(--code-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 0.75rem;
    overflow-x: auto;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    max-height: 500px;
    overflow-y: auto;
}}

.code-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}}

.code-info {{ font-size: 0.75rem; color: var(--text-secondary); }}

.copy-btn {{
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    cursor: pointer;
}}
.copy-btn:hover {{ background: var(--accent-color); color: white; }}

.markdown-content {{ line-height: 1.6; }}
.markdown-content p {{ margin-bottom: 0.75rem; }}
.markdown-content ul, .markdown-content ol {{ margin-left: 1.5rem; margin-bottom: 0.75rem; }}
.markdown-content li {{ margin-bottom: 0.25rem; }}
.markdown-content code {{
    background: var(--code-bg);
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-size: 0.85em;
}}
.markdown-content table {{
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
}}
.markdown-content th, .markdown-content td {{
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    text-align: left;
}}
.markdown-content th {{ background: var(--bg-tertiary); }}

.results-summary {{
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}}
.result-item {{ text-align: center; }}
.result-value {{ font-size: 1.5rem; font-weight: 700; }}
.result-label {{ font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; }}
    </style>
</head>
<body>
    <header>
        <div class="header-left">
            <span class="substrate-icon">{icon}</span>
            <h1>{title}</h1>
        </div>
        <div class="header-stats">
            <div class="stat">
                <span>Score:</span>
                <span class="stat-value {score_class}">{score}</span>
            </div>
            <div class="stat">
                <span>{passed}/{total} passed</span>
            </div>
        </div>
        <button id="theme-toggle" title="Toggle theme">
            <span class="sun">☀️</span>
            <span class="moon">🌙</span>
        </button>
    </header>

    <nav class="tabs">
        <button class="tab active" data-tab="description">Description</button>
        <button class="tab" data-tab="log">Run Log</button>
        <button class="tab" data-tab="results">Test Results</button>
        <button class="tab" data-tab="calc">Generated Calculations</button>
        <button class="tab" data-tab="sdk">SDK Utilities</button>
    </nav>

    <main>
        <div id="description" class="tab-content active">
            <div class="card">
                <h2>What This Substrate Does</h2>
                <div class="markdown-content">
                    <p>The Python substrate compiles rulebook formulas into native Python functions, enabling formula evaluation without any external dependencies beyond Python's standard library.</p>
                    <h3>Orchestration Pattern</h3>
                    <ol>
                        <li><strong>Inject</strong>: <code>inject-into-python.py</code> parses Excel-dialect formulas from the rulebook JSON</li>
                        <li><strong>Generate</strong>: Builds dependency DAG and generates <code>erb_calc.py</code> with calc_* functions</li>
                        <li><strong>Execute</strong>: <code>take-test.py</code> loads data and computes all calculated fields</li>
                        <li><strong>Test</strong>: Compares computed values against expected answers</li>
                    </ol>
                </div>
            </div>
            <div class="card">
                <h2>Architecture</h2>
                <pre>
┌─────────────────────────────────────────────────────────────┐
│                   inject-into-python.py                      │
├─────────────────────────────────────────────────────────────┤
│   1. Load rulebook JSON (structured data)                    │
│                          ↓                                   │
│   2. Parse Excel-dialect formulas into expression tree       │
│                          ↓                                   │
│   3. Build dependency DAG for calculation ordering           │
│                          ↓                                   │
│   4. Compile formulas to Python expressions                  │
│                          ↓                                   │
│   5. Generate calc_* functions with proper signatures        │
│                          ↓                                   │
│   6. Output: erb_calc.py with compute_all_calculated_fields  │
└─────────────────────────────────────────────────────────────┘</pre>
            </div>
            <div class="card">
                <h2>Key Features</h2>
                <ul class="markdown-content">
                    <li><strong>DAG-Ordered Evaluation</strong>: Calculated fields computed in dependency order</li>
                    <li><strong>Individual calc_* Functions</strong>: Mirrors the PostgreSQL calc_* pattern</li>
                    <li><strong>compute_all_calculated_fields()</strong>: Convenience function for all fields</li>
                    <li><strong>Domain-Agnostic</strong>: Works with any rulebook schema</li>
                    <li><strong>Shared Code</strong>: erb_calc.py also used by GraphQL and YAML substrates</li>
                </ul>
            </div>
            <div class="card">
                <h2>Generated Files</h2>
                <table class="markdown-content">
                    <tr><th>File</th><th>Description</th></tr>
                    <tr><td><code>erb_calc.py</code></td><td>Python calculation functions compiled from rulebook formulas</td></tr>
                    <tr><td><code>test-answers/</code></td><td>Test execution results for grading</td></tr>
                    <tr><td><code>test-results.md</code></td><td>Human-readable test report</td></tr>
                </table>
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
                    <div class="result-item">
                        <div class="result-value {score_class}">{score}</div>
                        <div class="result-label">Score</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value score-perfect">{passed}</div>
                        <div class="result-label">Passed</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">{failed}</div>
                        <div class="result-label">Failed</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">{total}</div>
                        <div class="result-label">Total</div>
                    </div>
                </div>
            </div>
            <div class="card">
                <h2>Results by Entity</h2>
                <div class="markdown-content">
                    <h3>language_candidates</h3>
                    <ul>
                        <li>Fields: {passed}/{total} ({score})</li>
                        <li>Computed columns: has_grammar, question, predicted_answer, prediction_predicates, prediction_fail, is_description_of, is_open_closed_world_conflicted, relationship_to_concept</li>
                    </ul>
                </div>
            </div>
        </div>

        <div id="calc" class="tab-content">
            <div class="card">
                <div class="code-header">
                    <h2>erb_calc.py</h2>
                    <div>
                        <span class="code-info">{calc_lines} lines</span>
                        <button class="copy-btn" onclick="copyCode('calc-code')">Copy</button>
                    </div>
                </div>
                <pre id="calc-code">{erb_calc}</pre>
            </div>
        </div>

        <div id="sdk" class="tab-content">
            <div class="card">
                <div class="code-header">
                    <h2>erb_sdk.py</h2>
                    <div>
                        <span class="code-info">{sdk_lines} lines</span>
                        <button class="copy-btn" onclick="copyCode('sdk-code')">Copy</button>
                    </div>
                </div>
                <pre id="sdk-code">{erb_sdk}</pre>
            </div>
        </div>
    </main>

    <script>
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function getInitialTheme() {{
    try {{
        if (window.parent && window.parent.document.documentElement.dataset.theme) {{
            return window.parent.document.documentElement.dataset.theme;
        }}
    }} catch (e) {{}}
    return prefersDark ? 'dark' : 'light';
}}

document.documentElement.dataset.theme = getInitialTheme();

themeToggle.addEventListener('click', () => {{
    const current = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = current === 'dark' ? 'light' : 'dark';
}});

window.addEventListener('message', (event) => {{
    if (event.data.type === 'theme-change') {{
        document.documentElement.dataset.theme = event.data.theme;
    }}
}});

document.querySelectorAll('.tab').forEach(tab => {{
    tab.addEventListener('click', () => {{
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    }});
}});

function copyCode(elementId) {{
    const code = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(code).then(() => {{
        const btn = event.target;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    }});
}}
    </script>
</body>
</html>'''

output = html_template.format(
    substrate_name=SUBSTRATE_NAME,
    title=SUBSTRATE_TITLE,
    icon=SUBSTRATE_ICON,
    score=score,
    score_class=score_class,
    passed=passed,
    failed=failed,
    total=total,
    log_content=log_escaped,
    erb_calc=erb_calc_escaped,
    erb_sdk=erb_sdk_escaped,
    calc_lines=calc_lines,
    sdk_lines=sdk_lines
)

with open('substrate-report.html', 'w') as f:
    f.write(output)

print(f"Generated substrate-report.html for {SUBSTRATE_NAME}")
PYTHON_SCRIPT
