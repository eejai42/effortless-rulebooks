#!/usr/bin/env python3
"""
create-substrate-report.py
==============================================================================
Generates an HTML report for a specific execution substrate.
Called from each substrate's take-test.sh after test completion.

Usage: python3 create-substrate-report.py <substrate_name> [--log <log_file>]

Arguments:
    substrate_name - Name of the substrate (e.g., "python", "english")
    --log          - Optional path to captured output log

Reads:
    - README.md in substrate folder (explains how the substrate works)
    - test-results.md (test results summary)
    - Output log file (if provided)

Writes:
    - substrate-report.html in substrate folder
==============================================================================
"""

import argparse
import os
import sys
from html import escape
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent
SUBSTRATES_DIR = PROJECT_ROOT / "execution-substrates"


def read_file_safe(filepath: Path) -> str:
    """Read file contents, return empty string if not found."""
    if filepath.exists():
        try:
            return filepath.read_text(encoding='utf-8')
        except Exception as e:
            return f"(Error reading file: {e})"
    return ""


def generate_html(substrate_name: str, readme: str, results: str, log: str) -> str:
    """Generate the HTML report content."""
    # Escape HTML in content
    readme_escaped = escape(readme) if readme else "(No README.md found)"
    results_escaped = escape(results) if results else "(No test-results.md found)"
    log_escaped = escape(log) if log else "(No execution log captured for this run)"

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(substrate_name)} - Substrate Report</title>
    <style>
        :root {{
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --bg-code: #1e1e1e;
            --text-primary: #212529;
            --text-secondary: #6c757d;
            --text-code: #d4d4d4;
            --border-color: #dee2e6;
            --accent-color: #0d6efd;
            --success-color: #198754;
            --warning-color: #ffc107;
            --danger-color: #dc3545;
            --radius: 6px;
        }}

        [data-theme="dark"] {{
            --bg-primary: #1a1a2e;
            --bg-secondary: #16213e;
            --bg-code: #0d1117;
            --text-primary: #eaeaea;
            --text-secondary: #b0b0b0;
            --text-code: #c9d1d9;
            --border-color: #3a3a5c;
        }}

        * {{ margin: 0; padding: 0; box-sizing: border-box; }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-secondary);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 1rem;
        }}

        header {{
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        header h1 {{
            font-size: 1.5rem;
            color: var(--accent-color);
        }}

        header .meta {{
            font-size: 0.85rem;
            color: var(--text-secondary);
        }}

        .tabs {{
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }}

        .tab {{
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            background: var(--bg-primary);
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }}

        .tab:hover {{
            border-color: var(--accent-color);
        }}

        .tab.active {{
            background: var(--accent-color);
            color: white;
            border-color: var(--accent-color);
        }}

        .tab-content {{
            display: none;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 1.5rem;
        }}

        .tab-content.active {{
            display: block;
        }}

        .section {{
            margin-bottom: 1.5rem;
        }}

        .section h2 {{
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 0.25rem;
        }}

        pre {{
            background: var(--bg-code);
            color: var(--text-code);
            padding: 1rem;
            border-radius: var(--radius);
            overflow-x: auto;
            font-family: 'SF Mono', Monaco, Consolas, monospace;
            font-size: 0.85rem;
            line-height: 1.5;
            max-height: 600px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }}

        footer {{
            text-align: center;
            margin-top: 2rem;
            color: var(--text-secondary);
            font-size: 0.8rem;
        }}

        #theme-toggle {{
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 1rem;
        }}
    </style>
</head>
<body>
    <header>
        <div>
            <h1>{escape(substrate_name)}</h1>
            <div class="meta">Execution Substrate Report</div>
        </div>
        <div>
            <button id="theme-toggle" onclick="toggleTheme()">&#127769;</button>
        </div>
    </header>

    <div class="tabs">
        <button class="tab active" onclick="showTab('overview')">Overview</button>
        <button class="tab" onclick="showTab('results')">Test Results</button>
        <button class="tab" onclick="showTab('log')">Execution Log</button>
    </div>

    <div id="overview" class="tab-content active">
        <div class="section">
            <h2>How This Substrate Works</h2>
            <pre>{readme_escaped}</pre>
        </div>
    </div>

    <div id="results" class="tab-content">
        <div class="section">
            <h2>Test Results Summary</h2>
            <pre>{results_escaped}</pre>
        </div>
    </div>

    <div id="log" class="tab-content">
        <div class="section">
            <h2>Execution Log</h2>
            <pre>{log_escaped}</pre>
        </div>
    </div>

    <footer>
        Generated by ERB Substrate Report Generator
    </footer>

    <script>
        function showTab(tabName) {{
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }}

        function toggleTheme() {{
            const body = document.body;
            const isDark = body.getAttribute('data-theme') === 'dark';
            body.setAttribute('data-theme', isDark ? '' : 'dark');
            document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
        }}
    </script>
</body>
</html>'''


def main():
    parser = argparse.ArgumentParser(description='Generate substrate HTML report')
    parser.add_argument('substrate_name', help='Name of the substrate')
    parser.add_argument('--log', help='Path to execution log file')
    args = parser.parse_args()

    substrate_dir = SUBSTRATES_DIR / args.substrate_name

    if not substrate_dir.is_dir():
        print(f"Error: Substrate directory not found: {substrate_dir}")
        sys.exit(1)

    # Read source files
    readme = read_file_safe(substrate_dir / "README.md")
    results = read_file_safe(substrate_dir / "test-results.md")

    log = ""
    if args.log:
        log = read_file_safe(Path(args.log))

    # Generate HTML
    html_content = generate_html(args.substrate_name, readme, results, log)

    # Write output
    output_path = substrate_dir / "substrate-report.html"
    output_path.write_text(html_content, encoding='utf-8')

    print(f"Generated: {output_path}")


if __name__ == "__main__":
    main()
