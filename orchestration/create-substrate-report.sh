#!/bin/bash
# =============================================================================
# create-substrate-report.sh
# =============================================================================
# Generates an HTML report for a specific execution substrate.
# Called from each substrate's take-test.sh after test completion.
#
# Usage: create-substrate-report.sh <substrate_name> [log_file]
#
# Arguments:
#   substrate_name - Name of the substrate (e.g., "python", "english")
#   log_file      - Optional path to captured output log
#
# Reads:
#   - README.md in substrate folder (explains how the substrate works)
#   - test-results.md (test results summary)
#   - Output log file (if provided)
#
# Writes:
#   - substrate-report.html in substrate folder
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SUBSTRATES_DIR="$PROJECT_ROOT/execution-substrates"

# Arguments
SUBSTRATE_NAME="${1:-}"
LOG_FILE="${2:-}"

if [[ -z "$SUBSTRATE_NAME" ]]; then
    echo "Usage: create-substrate-report.sh <substrate_name> [log_file]"
    exit 1
fi

SUBSTRATE_DIR="$SUBSTRATES_DIR/$SUBSTRATE_NAME"
README_FILE="$SUBSTRATE_DIR/README.md"
RESULTS_FILE="$SUBSTRATE_DIR/test-results.md"
OUTPUT_FILE="$SUBSTRATE_DIR/substrate-report.html"

# Read README.md content (escape for HTML)
README_CONTENT=""
if [[ -f "$README_FILE" ]]; then
    README_CONTENT=$(cat "$README_FILE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')
fi

# Read test-results.md content
RESULTS_CONTENT=""
if [[ -f "$RESULTS_FILE" ]]; then
    RESULTS_CONTENT=$(cat "$RESULTS_FILE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')
fi

# Read log file if provided
LOG_CONTENT=""
if [[ -n "$LOG_FILE" && -f "$LOG_FILE" ]]; then
    LOG_CONTENT=$(cat "$LOG_FILE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')
fi

# Generate HTML report
cat > "$OUTPUT_FILE" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SUBSTRATE_NAME_PLACEHOLDER - Substrate Report</title>
    <style>
        :root {
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
        }

        [data-theme="dark"] {
            --bg-primary: #1a1a2e;
            --bg-secondary: #16213e;
            --bg-code: #0d1117;
            --text-primary: #eaeaea;
            --text-secondary: #b0b0b0;
            --text-code: #c9d1d9;
            --border-color: #3a3a5c;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-secondary);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 1rem;
        }

        header {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        header h1 {
            font-size: 1.5rem;
            color: var(--accent-color);
        }

        header .meta {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .tab {
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            background: var(--bg-primary);
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }

        .tab:hover {
            border-color: var(--accent-color);
        }

        .tab.active {
            background: var(--accent-color);
            color: white;
            border-color: var(--accent-color);
        }

        .tab-content {
            display: none;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 1.5rem;
        }

        .tab-content.active {
            display: block;
        }

        .section {
            margin-bottom: 1.5rem;
        }

        .section h2 {
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 0.25rem;
        }

        pre {
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
        }

        .markdown-content {
            line-height: 1.7;
        }

        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .markdown-content p {
            margin-bottom: 1rem;
        }

        .markdown-content ul, .markdown-content ol {
            margin: 0.5rem 0 1rem 1.5rem;
        }

        .markdown-content code {
            background: var(--bg-secondary);
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, Consolas, monospace;
            font-size: 0.9em;
        }

        #theme-toggle {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 1rem;
        }

        footer {
            text-align: center;
            margin-top: 2rem;
            color: var(--text-secondary);
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>SUBSTRATE_NAME_PLACEHOLDER</h1>
            <div class="meta">Execution Substrate Report</div>
        </div>
        <div>
            <button id="theme-toggle" onclick="toggleTheme()">🌙</button>
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
            <div class="markdown-content">
                <pre>README_CONTENT_PLACEHOLDER</pre>
            </div>
        </div>
    </div>

    <div id="results" class="tab-content">
        <div class="section">
            <h2>Test Results Summary</h2>
            <pre>RESULTS_CONTENT_PLACEHOLDER</pre>
        </div>
    </div>

    <div id="log" class="tab-content">
        <div class="section">
            <h2>Execution Log</h2>
            <pre>LOG_CONTENT_PLACEHOLDER</pre>
        </div>
    </div>

    <footer>
        Generated by ERB Substrate Report Generator
    </footer>

    <script>
        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        function toggleTheme() {
            const body = document.body;
            const isDark = body.getAttribute('data-theme') === 'dark';
            body.setAttribute('data-theme', isDark ? '' : 'dark');
            document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
        }
    </script>
</body>
</html>
HTMLEOF

# Replace placeholders
sed -i '' "s/SUBSTRATE_NAME_PLACEHOLDER/$SUBSTRATE_NAME/g" "$OUTPUT_FILE"

# Replace content placeholders using Python for proper escaping
python3 << PYEOF
import sys

with open("$OUTPUT_FILE", 'r') as f:
    content = f.read()

readme = '''$README_CONTENT'''
results = '''$RESULTS_CONTENT'''
log = '''$LOG_CONTENT'''

if not log.strip():
    log = "(No execution log captured for this run)"

content = content.replace('README_CONTENT_PLACEHOLDER', readme)
content = content.replace('RESULTS_CONTENT_PLACEHOLDER', results)
content = content.replace('LOG_CONTENT_PLACEHOLDER', log)

with open("$OUTPUT_FILE", 'w') as f:
    f.write(content)
PYEOF

echo "Generated: $OUTPUT_FILE"
