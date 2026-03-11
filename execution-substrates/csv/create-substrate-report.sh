#!/bin/bash
# create-substrate-report.sh - Generate substrate-report.html for CSV substrate

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

python3 << 'PYTHON_SCRIPT'
import html
import os
import re
import csv

SUBSTRATE_NAME = "csv"
SUBSTRATE_TITLE = "CSV Execution Substrate"
SUBSTRATE_ICON = "📊"

def read_file(path, default=""):
    try:
        with open(path, 'r') as f:
            return f.read()
    except:
        return default

def read_csv_as_html_table(path, max_rows=50):
    try:
        with open(path, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
            if not rows:
                return "<p>Empty CSV</p>"
            html_out = '<table class="csv-table"><thead><tr>'
            for h in rows[0]:
                html_out += f'<th>{html.escape(str(h))}</th>'
            html_out += '</tr></thead><tbody>'
            for row in rows[1:max_rows+1]:
                html_out += '<tr>'
                for cell in row:
                    val = str(cell)
                    if val.lower() == 'true':
                        html_out += '<td class="bool-true">true</td>'
                    elif val.lower() == 'false':
                        html_out += '<td class="bool-false">false</td>'
                    else:
                        html_out += f'<td>{html.escape(val)}</td>'
                html_out += '</tr>'
            html_out += '</tbody></table>'
            if len(rows) > max_rows + 1:
                html_out += f'<p class="truncated">Showing {max_rows} of {len(rows)-1} rows</p>'
            return html_out
    except Exception as e:
        return f"<p>Error reading CSV: {e}</p>"

log_content = read_file('.last-run.log', 'No log available')
test_results = read_file('test-results.md', 'No test results available')

# Read CSVs
entities_table = read_csv_as_html_table('test-data/workflows.csv')
column_formulas_table = read_csv_as_html_table('test-data/column_formulas.csv')

score_match = re.search(r'(\d+\.?\d*)%', test_results)
score = score_match.group(0) if score_match else "N/A"
passed_match = re.search(r'\| Passed \| (\d+)', test_results)
passed = passed_match.group(1) if passed_match else "0"
failed_match = re.search(r'\| Failed \| (\d+)', test_results)
failed = failed_match.group(1) if failed_match else "0"
total_match = re.search(r'\| Total Fields Tested \| (\d+)', test_results)
total = total_match.group(1) if total_match else "0"

score_num = float(score.replace('%', '')) if '%' in score else 0
if score_num >= 100: score_class = "score-perfect"
elif score_num >= 80: score_class = "score-good"
elif score_num >= 60: score_class = "score-warning"
else: score_class = "score-danger"

log_escaped = html.escape(log_content)

html_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Substrate Report: {substrate_name}</title>
    <style>
:root {{
    --bg-primary: #ffffff; --bg-secondary: #f8f9fa; --bg-tertiary: #e9ecef;
    --text-primary: #212529; --text-secondary: #6c757d; --border-color: #dee2e6;
    --accent-color: #0d6efd; --success-color: #198754; --warning-color: #ffc107;
    --danger-color: #dc3545; --code-bg: #f6f8fa; --shadow: 0 2px 8px rgba(0,0,0,0.1); --radius: 6px;
}}
[data-theme="dark"] {{
    --bg-primary: #1a1a2e; --bg-secondary: #16213e; --bg-tertiary: #0f3460;
    --text-primary: #eaeaea; --text-secondary: #b0b0b0; --border-color: #3a3a5c;
    --accent-color: #4dabf7; --success-color: #51cf66; --warning-color: #fcc419;
    --danger-color: #ff6b6b; --code-bg: #0d1117; --shadow: 0 2px 8px rgba(0,0,0,0.3);
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
.score-perfect, .score-good {{ color: var(--success-color); }}
.score-warning {{ color: var(--warning-color); }}
.score-danger {{ color: var(--danger-color); }}
#theme-toggle {{ background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }}
#theme-toggle:hover {{ background: var(--accent-color); color: white; }}
#theme-toggle .moon {{ display: none; }}
[data-theme="dark"] #theme-toggle .sun {{ display: none; }}
[data-theme="dark"] #theme-toggle .moon {{ display: inline; }}
.tabs {{ display: flex; background: var(--bg-primary); border-bottom: 1px solid var(--border-color); overflow-x: auto; padding: 0 0.5rem; }}
.tab {{ background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.8rem; color: var(--text-secondary); border-bottom: 2px solid transparent; white-space: nowrap; }}
.tab:hover {{ color: var(--text-primary); }}
.tab.active {{ color: var(--accent-color); border-bottom-color: var(--accent-color); font-weight: 500; }}
main {{ padding: 1rem; }}
.tab-content {{ display: none; }}
.tab-content.active {{ display: block; animation: fadeIn 0.2s ease; }}
@keyframes fadeIn {{ from {{ opacity: 0; }} to {{ opacity: 1; }} }}
.card {{ background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1rem; margin-bottom: 1rem; box-shadow: var(--shadow); }}
.card h2 {{ font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }}
pre {{ background: var(--code-bg); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 0.75rem; overflow-x: auto; font-family: 'SF Mono', Monaco, monospace; font-size: 0.75rem; line-height: 1.4; max-height: 500px; overflow-y: auto; }}
.code-info {{ font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; }}
.markdown-content {{ line-height: 1.6; }}
.markdown-content p {{ margin-bottom: 0.75rem; }}
.markdown-content ul, .markdown-content ol {{ margin-left: 1.5rem; margin-bottom: 0.75rem; }}
.markdown-content li {{ margin-bottom: 0.25rem; }}
.markdown-content code {{ background: var(--code-bg); padding: 0.125rem 0.375rem; border-radius: 3px; font-size: 0.85em; }}
.results-summary {{ display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem; }}
.result-item {{ text-align: center; }}
.result-value {{ font-size: 1.5rem; font-weight: 700; }}
.result-label {{ font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; }}
.csv-table {{ width: 100%; border-collapse: collapse; font-size: 0.75rem; }}
.csv-table th, .csv-table td {{ border: 1px solid var(--border-color); padding: 0.35rem 0.5rem; text-align: left; white-space: nowrap; }}
.csv-table th {{ background: var(--bg-tertiary); font-weight: 600; position: sticky; top: 0; }}
.csv-table tbody tr:hover {{ background: var(--bg-secondary); }}
.bool-true {{ color: var(--success-color); font-weight: 500; }}
.bool-false {{ color: var(--danger-color); }}
.table-scroll {{ overflow-x: auto; max-height: 400px; overflow-y: auto; }}
.truncated {{ font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem; font-style: italic; }}
.download-link {{ display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: var(--accent-color); color: white; text-decoration: none; border-radius: var(--radius); font-size: 0.8rem; }}
.download-link:hover {{ opacity: 0.9; }}
    </style>
</head>
<body>
    <header>
        <div class="header-left">
            <span class="substrate-icon">{icon}</span>
            <h1>{title}</h1>
        </div>
        <div class="header-stats">
            <div class="stat"><span>Score:</span><span class="stat-value {score_class}">{score}</span></div>
            <div class="stat"><span>{passed}/{total} passed</span></div>
        </div>
        <button id="theme-toggle" title="Toggle theme"><span class="sun">☀️</span><span class="moon">🌙</span></button>
    </header>
    <nav class="tabs">
        <button class="tab active" data-tab="description">Description</button>
        <button class="tab" data-tab="log">Run Log</button>
        <button class="tab" data-tab="results">Test Results</button>
        <button class="tab" data-tab="candidates">Entities</button>
        <button class="tab" data-tab="formulas">Column Formulas</button>
    </nav>
    <main>
        <div id="description" class="tab-content active">
            <div class="card">
                <h2>What This Substrate Does</h2>
                <div class="markdown-content">
                    <p>The CSV substrate exports rulebook data and formulas to universal CSV format, enabling interoperability with spreadsheet applications and data analysis tools.</p>
                    <h3>Orchestration Pattern</h3>
                    <ol>
                        <li><strong>Export</strong>: <code>inject-into-csv.py</code> generates CSV files from rulebook JSON</li>
                        <li><strong>Data Files</strong>: Creates CSV files for each entity in the rulebook</li>
                        <li><strong>Formula Mapping</strong>: Creates <code>column_formulas.csv</code> with calculation definitions</li>
                        <li><strong>Test</strong>: Validates CSV output matches expected values</li>
                    </ol>
                </div>
            </div>
            <div class="card">
                <h2>Key Features</h2>
                <ul class="markdown-content">
                    <li><strong>Universal Format</strong>: CSV works with any spreadsheet or data tool</li>
                    <li><strong>Formula Documentation</strong>: Column formulas exported separately for reference</li>
                    <li><strong>Excel Export</strong>: Also generates <code>rulebook.xlsx</code> for Excel users</li>
                    <li><strong>Data Validation</strong>: Boolean and calculated fields properly formatted</li>
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
        <div id="candidates" class="tab-content">
            <div class="card">
                <h2>Entity Data (workflows.csv)</h2>
                <div class="table-scroll">{entities_table}</div>
            </div>
        </div>
        <div id="formulas" class="tab-content">
            <div class="card">
                <h2>column_formulas.csv</h2>
                <div class="table-scroll">{column_formulas_table}</div>
            </div>
        </div>
    </main>
    <script>
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
function getInitialTheme() {{ try {{ if (window.parent && window.parent.document.documentElement.dataset.theme) return window.parent.document.documentElement.dataset.theme; }} catch (e) {{}} return prefersDark ? 'dark' : 'light'; }}
document.documentElement.dataset.theme = getInitialTheme();
themeToggle.addEventListener('click', () => {{ document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; }});
window.addEventListener('message', (event) => {{ if (event.data.type === 'theme-change') document.documentElement.dataset.theme = event.data.theme; }});
document.querySelectorAll('.tab').forEach(tab => {{ tab.addEventListener('click', () => {{ document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); tab.classList.add('active'); document.getElementById(tab.dataset.tab).classList.add('active'); }}); }});
    </script>
</body>
</html>'''

output = html_template.format(
    substrate_name=SUBSTRATE_NAME, title=SUBSTRATE_TITLE, icon=SUBSTRATE_ICON,
    score=score, score_class=score_class, passed=passed, failed=failed, total=total,
    log_content=log_escaped,
    entities_table=entities_table, column_formulas_table=column_formulas_table
)

with open('substrate-report.html', 'w') as f:
    f.write(output)
print(f"Generated substrate-report.html for {SUBSTRATE_NAME}")
PYTHON_SCRIPT
