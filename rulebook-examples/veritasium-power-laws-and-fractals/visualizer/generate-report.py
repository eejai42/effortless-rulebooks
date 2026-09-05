#!/usr/bin/env python3
"""
Power Laws & Fractals - Consolidated HTML Report Generator

Generates a single comprehensive HTML report that includes:
1. All 8 iterations per system (actual + projected with color coding)
2. Interactive charts per system with log-log plots
3. Theoretical slope lines
4. Cross-platform comparison (Python, PostgreSQL, Go)
5. System stats with slope analysis
6. Validation results

This consolidates all visualization into a single, polished report.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
SSOT_DIR = PROJECT_ROOT / 'effortless-rulebook'
TEST_DATA_DIR = PROJECT_ROOT / 'test-data'
TEST_RESULTS_DIR = PROJECT_ROOT / 'test-results'

# Platforms to compare
PLATFORMS = ['python', 'postgres', 'golang']

# Tolerance for comparisons
TOLERANCE = 0.0001

# ANSI colors for console
GREEN = '\033[92m'
CYAN = '\033[96m'
RED = '\033[91m'
RESET = '\033[0m'
BOLD = '\033[1m'


def load_json(path: Path) -> Optional[Dict]:
    """Load JSON file"""
    if not path.exists():
        return None
    with open(path, 'r') as f:
        return json.load(f)


def compare_values(expected, actual, tolerance: float = TOLERANCE) -> bool:
    """Compare two values with tolerance for floats"""
    if expected is None and actual is None:
        return True
    if expected is None or actual is None:
        return False
    if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
        return abs(expected - actual) < tolerance
    return expected == actual


def load_all_data() -> Dict:
    """Load all required data"""
    data = {}
    
    # Load SSoT
    ssot_path = SSOT_DIR / 'effortless-rulebook.json'
    data['ssot'] = load_json(ssot_path)
    
    # Load test data
    data['base_data'] = load_json(TEST_DATA_DIR / 'base-data.json')
    data['test_input'] = load_json(TEST_DATA_DIR / 'test-input.json')
    data['answer_key'] = load_json(TEST_DATA_DIR / 'answer-key.json')
    
    # Load platform results
    data['results'] = {}
    for platform in PLATFORMS:
        results_path = TEST_RESULTS_DIR / f'{platform}-results.json'
        data['results'][platform] = load_json(results_path)
    
    return data


def validate_platform(platform_results: Dict, answer_key: Dict) -> Dict:
    """Validate platform results against answer key"""
    if platform_results is None:
        return {'status': 'not_run', 'pass_count': 0, 'fail_count': 0, 'failures': []}
    
    expected_by_id = {s['ScaleID']: s for s in answer_key.get('scales', [])}
    actual_by_id = {s['ScaleID']: s for s in platform_results.get('scales', [])}
    
    computed_fields = ['BaseScale', 'ScaleFactor', 'ScaleFactorPower', 'Scale', 'LogScale', 'LogMeasure']
    
    pass_count = 0
    fail_count = 0
    failures = []
    
    for scale_id, expected in expected_by_id.items():
        actual = actual_by_id.get(scale_id)
        
        if actual is None:
            fail_count += 1
            failures.append({'ScaleID': scale_id, 'error': 'missing'})
            continue
        
        mismatches = []
        for field in computed_fields:
            if not compare_values(expected.get(field), actual.get(field)):
                mismatches.append({
                    'field': field,
                    'expected': expected.get(field),
                    'actual': actual.get(field)
                })
        
        if mismatches:
            fail_count += 1
            failures.append({'ScaleID': scale_id, 'mismatches': mismatches})
        else:
            pass_count += 1
    
    return {
        'status': 'passed' if fail_count == 0 else 'failed',
        'pass_count': pass_count,
        'fail_count': fail_count,
        'failures': failures
    }


def generate_html_report(data: Dict) -> str:
    """Generate comprehensive HTML report"""
    
    ssot = data.get('ssot', {})
    systems = ssot.get('systems', {}).get('data', [])
    scales = ssot.get('scales', {}).get('data', [])
    system_stats = ssot.get('system_stats', {}).get('data', [])
    answer_key = data.get('answer_key', {})
    
    # Validate all platforms
    validations = {}
    for platform in PLATFORMS:
        validations[platform] = validate_platform(data['results'].get(platform), answer_key)
    
    # Group scales by system
    scales_by_system = {}
    for scale in scales:
        sys_id = scale.get('System')
        if sys_id not in scales_by_system:
            scales_by_system[sys_id] = []
        scales_by_system[sys_id].append(scale)
    
    # Build systems lookup
    systems_lookup = {s['SystemID']: s for s in systems}
    stats_lookup = {s['System']: s for s in system_stats}
    
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Power Laws & Fractals - Comprehensive Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@300;400;600;700&display=swap');
        
        :root {{
            --bg-void: #08090a;
            --bg-primary: #0d1117;
            --bg-elevated: #161b22;
            --bg-surface: #1c2128;
            --border-subtle: #21262d;
            --border-default: #30363d;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --text-muted: #6e7681;
            --accent-blue: #58a6ff;
            --accent-cyan: #56d4dd;
            --accent-green: #3fb950;
            --accent-yellow: #d29922;
            --accent-orange: #db6d28;
            --accent-red: #f85149;
            --accent-purple: #a371f7;
            --accent-magenta: #f778ba;
            --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.4);
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        html {{
            scroll-behavior: smooth;
        }}
        
        body {{
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-void);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem;
        }}
        
        /* Header */
        header {{
            text-align: center;
            padding: 4rem 2rem;
            background: var(--gradient-hero);
            position: relative;
            overflow: hidden;
            margin-bottom: 3rem;
        }}
        
        header::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.1;
        }}
        
        header h1 {{
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }}
        
        header h1 span {{
            display: inline-block;
            animation: float 3s ease-in-out infinite;
        }}
        
        @keyframes float {{
            0%, 100% {{ transform: translateY(0px); }}
            50% {{ transform: translateY(-8px); }}
        }}
        
        .subtitle {{
            font-size: 1.4rem;
            font-weight: 300;
            opacity: 0.9;
            position: relative;
        }}
        
        .timestamp {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            opacity: 0.7;
            margin-top: 1.5rem;
            position: relative;
        }}
        
        /* Navigation */
        nav {{
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 3rem;
            padding: 1rem;
            background: var(--bg-elevated);
            border-radius: 16px;
            border: 1px solid var(--border-subtle);
        }}
        
        nav a {{
            color: var(--text-secondary);
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s;
        }}
        
        nav a:hover {{
            background: var(--bg-surface);
            color: var(--text-primary);
        }}
        
        /* Platform Summary */
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }}
        
        .platform-card {{
            background: var(--bg-elevated);
            border: 1px solid var(--border-subtle);
            border-radius: 16px;
            padding: 2rem;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }}
        
        .platform-card:hover {{
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }}
        
        .platform-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }}
        
        .platform-card.passed::before {{ background: var(--accent-green); }}
        .platform-card.failed::before {{ background: var(--accent-yellow); }}
        .platform-card.not-run::before {{ background: var(--text-muted); }}
        
        .platform-icon {{
            font-size: 3rem;
            margin-bottom: 1rem;
        }}
        
        .platform-name {{
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }}
        
        .platform-stats {{
            display: flex;
            gap: 2rem;
            margin-top: 1.5rem;
        }}
        
        .stat {{
            text-align: center;
        }}
        
        .stat-value {{
            font-size: 2.5rem;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
        }}
        
        .stat-value.pass {{ color: var(--accent-green); }}
        .stat-value.fail {{ color: var(--accent-yellow); }}
        
        .stat-label {{
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
        }}
        
        .status-badge {{
            display: inline-block;
            padding: 0.375rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }}
        
        .status-badge.passed {{
            background: rgba(63, 185, 80, 0.15);
            color: var(--accent-green);
        }}
        
        .status-badge.failed {{
            background: rgba(210, 153, 34, 0.15);
            color: var(--accent-yellow);
        }}
        
        .status-badge.not-run {{
            background: rgba(110, 118, 129, 0.15);
            color: var(--text-muted);
        }}
        
        /* Section Headers */
        .section-header {{
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-subtle);
        }}
        
        .section-header h2 {{
            font-size: 1.75rem;
            font-weight: 600;
        }}
        
        /* System Cards */
        .system-card {{
            background: var(--bg-elevated);
            border: 1px solid var(--border-subtle);
            border-radius: 16px;
            margin-bottom: 2rem;
            overflow: hidden;
        }}
        
        .system-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem 2rem;
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border-subtle);
        }}
        
        .system-title {{
            display: flex;
            align-items: center;
            gap: 1rem;
        }}
        
        .system-icon {{
            font-size: 2rem;
        }}
        
        .system-name {{
            font-size: 1.5rem;
            font-weight: 600;
        }}
        
        .system-badges {{
            display: flex;
            gap: 0.75rem;
        }}
        
        .badge {{
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        .badge.fractal {{
            background: rgba(163, 113, 247, 0.15);
            color: var(--accent-purple);
        }}
        
        .badge.power-law {{
            background: rgba(86, 212, 221, 0.15);
            color: var(--accent-cyan);
        }}
        
        .system-body {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
        }}
        
        @media (max-width: 1200px) {{
            .system-body {{
                grid-template-columns: 1fr;
            }}
        }}
        
        .chart-container {{
            padding: 2rem;
            border-right: 1px solid var(--border-subtle);
            min-height: 350px;
        }}
        
        @media (max-width: 1200px) {{
            .chart-container {{
                border-right: none;
                border-bottom: 1px solid var(--border-subtle);
            }}
        }}
        
        .data-container {{
            padding: 1.5rem;
            overflow-x: auto;
        }}
        
        /* Tables */
        table {{
            width: 100%;
            border-collapse: collapse;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
        }}
        
        th, td {{
            padding: 0.75rem 1rem;
            text-align: right;
            border-bottom: 1px solid var(--border-subtle);
        }}
        
        th {{
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 0.7rem;
            letter-spacing: 0.05em;
        }}
        
        th:first-child, td:first-child {{
            text-align: left;
        }}
        
        tr:hover {{
            background: var(--bg-surface);
        }}
        
        .row-actual {{
            color: var(--accent-green);
        }}
        
        .row-projected {{
            color: var(--accent-magenta);
        }}
        
        .type-indicator {{
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 0.5rem;
        }}
        
        .type-indicator.actual {{
            background: var(--accent-green);
        }}
        
        .type-indicator.projected {{
            background: var(--accent-magenta);
            border: 2px solid var(--accent-magenta);
            background: transparent;
        }}
        
        /* Stats Panel */
        .stats-panel {{
            background: var(--bg-surface);
            padding: 1.5rem;
            border-top: 1px solid var(--border-subtle);
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1.5rem;
        }}
        
        .stat-item {{
            text-align: center;
        }}
        
        .stat-item-value {{
            font-size: 1.5rem;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
            color: var(--accent-blue);
        }}
        
        .stat-item-label {{
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }}
        
        /* Legend */
        .legend {{
            display: flex;
            justify-content: center;
            gap: 2rem;
            padding: 1rem;
            background: var(--bg-surface);
            border-radius: 8px;
            margin-bottom: 2rem;
        }}
        
        .legend-item {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }}
        
        .legend-dot {{
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }}
        
        .legend-dot.actual {{ background: var(--accent-green); }}
        .legend-dot.projected {{ 
            background: transparent;
            border: 3px solid var(--accent-magenta);
        }}
        .legend-dot.theoretical {{ 
            width: 24px;
            height: 3px;
            border-radius: 0;
            background: repeating-linear-gradient(90deg, var(--text-muted), var(--text-muted) 4px, transparent 4px, transparent 8px);
        }}
        
        /* Footer */
        footer {{
            text-align: center;
            padding: 3rem 2rem;
            color: var(--text-muted);
            border-top: 1px solid var(--border-subtle);
            margin-top: 3rem;
        }}
        
        footer p {{
            margin: 0.5rem 0;
        }}
    </style>
</head>
<body>
    <header>
        <h1><span>🔺</span> Power Laws & Fractals</h1>
        <p class="subtitle">Comprehensive Cross-Platform Testing Report</p>
        <p class="timestamp">Generated: {timestamp}</p>
    </header>
    
    <div class="container">
        <nav>
            <a href="#platforms">Platform Summary</a>
            <a href="#systems">Systems Analysis</a>
        </nav>
        
        <!-- Platform Summary Section -->
        <section id="platforms">
            <div class="section-header">
                <h2>🧪 Platform Validation Summary</h2>
            </div>
            
            <div class="summary-grid">
'''
    
    platform_icons = {'python': '🐍', 'postgres': '🐘', 'golang': '🐹'}
    platform_names = {'python': 'Python', 'postgres': 'PostgreSQL', 'golang': 'Go'}
    
    for platform in PLATFORMS:
        val = validations.get(platform, {})
        status = val.get('status', 'not_run')
        pass_count = val.get('pass_count', 0)
        fail_count = val.get('fail_count', 0)
        status_class = status.replace('_', '-')
        status_text = status.upper().replace('_', ' ')
        
        html += f'''
                <div class="platform-card {status_class}">
                    <div class="platform-icon">{platform_icons.get(platform, '⚙️')}</div>
                    <div class="platform-name">{platform_names.get(platform, platform)}</div>
                    <span class="status-badge {status_class}">{status_text}</span>
                    <div class="platform-stats">
                        <div class="stat">
                            <div class="stat-value pass">{pass_count}</div>
                            <div class="stat-label">Passed</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value fail">{fail_count}</div>
                            <div class="stat-label">Failed</div>
                        </div>
                    </div>
                </div>
'''
    
    html += '''
            </div>
        </section>
        
        <!-- Systems Analysis Section -->
        <section id="systems">
            <div class="section-header">
                <h2>📊 Systems Analysis</h2>
            </div>
            
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-dot actual"></div>
                    <span>Actual Data (iterations 0-3)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-dot projected"></div>
                    <span>Projected Data (iterations 4-7)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-dot theoretical"></div>
                    <span>Theoretical Slope</span>
                </div>
            </div>
'''
    
    # Generate system cards
    for system in systems:
        sys_id = system['SystemID']
        sys_scales = scales_by_system.get(sys_id, [])
        sys_stats = stats_lookup.get(sys_id, {})
        
        icon = '🔺' if system.get('Class') == 'fractal' else '📈'
        type_badge = 'fractal' if system.get('Class') == 'fractal' else 'power-law'
        type_label = 'Fractal' if system.get('Class') == 'fractal' else 'Power Law'
        
        # Get chart data
        actual_points = [(s['LogScale'], s['LogMeasure']) for s in sys_scales if not s.get('IsProjected', False)]
        projected_points = [(s['LogScale'], s['LogMeasure']) for s in sys_scales if s.get('IsProjected', False)]
        
        # Calculate theoretical line
        slope = system.get('TheoreticalLogLogSlope', 0)
        all_points = actual_points + projected_points
        if all_points:
            x_min = min(p[0] for p in all_points)
            x_max = max(p[0] for p in all_points)
            x0, y0 = all_points[0]
            theoretical_start = (x_min, y0 + slope * (x_min - x0))
            theoretical_end = (x_max, y0 + slope * (x_max - x0))
        else:
            theoretical_start = (0, 0)
            theoretical_end = (1, slope)
        
        html += f'''
            <div class="system-card" id="system-{sys_id}">
                <div class="system-header">
                    <div class="system-title">
                        <span class="system-icon">{icon}</span>
                        <span class="system-name">{system.get('DisplayName', sys_id)}</span>
                    </div>
                    <div class="system-badges">
                        <span class="badge {type_badge}">{type_label}</span>
                    </div>
                </div>
                
                <div class="system-body">
                    <div class="chart-container">
                        <canvas id="chart-{sys_id}"></canvas>
                    </div>
                    
                    <div class="data-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Iter</th>
                                    <th>Type</th>
                                    <th>Measure</th>
                                    <th>Scale</th>
                                    <th>log(Scale)</th>
                                    <th>log(Measure)</th>
                                </tr>
                            </thead>
                            <tbody>
'''
        
        for scale in sorted(sys_scales, key=lambda x: x.get('Iteration', 0)):
            is_proj = scale.get('IsProjected', False)
            row_class = 'row-projected' if is_proj else 'row-actual'
            type_class = 'projected' if is_proj else 'actual'
            type_label = 'Proj' if is_proj else 'Actual'
            
            html += f'''
                                <tr class="{row_class}">
                                    <td>{scale.get('Iteration', 0)}</td>
                                    <td><span class="type-indicator {type_class}"></span>{type_label}</td>
                                    <td>{scale.get('Measure', 0):.6g}</td>
                                    <td>{scale.get('Scale', 0):.6g}</td>
                                    <td>{scale.get('LogScale', 0):.5f}</td>
                                    <td>{scale.get('LogMeasure', 0):.5f}</td>
                                </tr>
'''
        
        html += f'''
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="stats-panel">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-item-value">{system.get('TheoreticalLogLogSlope', 'N/A')}</div>
                            <div class="stat-item-label">Theoretical Slope</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-item-value">{sys_stats.get('EmpiricalLogLogSlope', 'N/A')}</div>
                            <div class="stat-item-label">Empirical Slope</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-item-value">{sys_stats.get('SlopeError', 'N/A')}</div>
                            <div class="stat-item-label">Slope Error</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-item-value">{sys_stats.get('PointCount', len(sys_scales))}</div>
                            <div class="stat-item-label">Data Points</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-item-value">{system.get('ScaleFactor', 'N/A')}</div>
                            <div class="stat-item-label">Scale Factor</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-item-value">{system.get('FractalDimension') or '—'}</div>
                            <div class="stat-item-label">Fractal Dimension</div>
                        </div>
                    </div>
                </div>
            </div>
'''
    
    html += '''
        </section>
        
        <footer>
            <p><strong>ERB Testing Protocol</strong> • Power Laws & Fractals • Veritasium Edition</p>
            <p>Single Source of Truth: effortless-rulebook/effortless-rulebook.json</p>
        </footer>
    </div>
    
    <script>
'''
    
    # Generate Chart.js initialization for each system
    for system in systems:
        sys_id = system['SystemID']
        sys_scales = scales_by_system.get(sys_id, [])
        
        actual_points = [{'x': s['LogScale'], 'y': s['LogMeasure']} for s in sys_scales if not s.get('IsProjected', False)]
        projected_points = [{'x': s['LogScale'], 'y': s['LogMeasure']} for s in sys_scales if s.get('IsProjected', False)]
        
        # Theoretical line
        all_points = actual_points + projected_points
        if all_points:
            x_vals = [p['x'] for p in all_points]
            x_min, x_max = min(x_vals), max(x_vals)
            x0, y0 = all_points[0]['x'], all_points[0]['y']
            slope = system.get('TheoreticalLogLogSlope', 0)
            theoretical_line = [
                {'x': x_min, 'y': y0 + slope * (x_min - x0)},
                {'x': x_max, 'y': y0 + slope * (x_max - x0)}
            ]
        else:
            theoretical_line = []
        
        html += f'''
        new Chart(document.getElementById('chart-{sys_id}'), {{
            type: 'scatter',
            data: {{
                datasets: [
                    {{
                        label: 'Actual Data',
                        data: {json.dumps(actual_points)},
                        backgroundColor: '#3fb950',
                        borderColor: '#3fb950',
                        pointRadius: 8,
                        pointHoverRadius: 10
                    }},
                    {{
                        label: 'Projected Data',
                        data: {json.dumps(projected_points)},
                        backgroundColor: 'transparent',
                        borderColor: '#f778ba',
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        pointStyle: 'circle',
                        borderWidth: 3
                    }},
                    {{
                        label: 'Theoretical Slope ({slope})',
                        data: {json.dumps(theoretical_line)},
                        type: 'line',
                        borderColor: '#6e7681',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{
                        position: 'bottom',
                        labels: {{
                            color: '#8b949e',
                            padding: 20,
                            usePointStyle: true
                        }}
                    }},
                    tooltip: {{
                        backgroundColor: '#161b22',
                        titleColor: '#e6edf3',
                        bodyColor: '#8b949e',
                        borderColor: '#30363d',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {{
                            label: function(context) {{
                                return 'log(Scale): ' + context.parsed.x.toFixed(4) + ', log(Measure): ' + context.parsed.y.toFixed(4);
                            }}
                        }}
                    }}
                }},
                scales: {{
                    x: {{
                        title: {{
                            display: true,
                            text: 'log₁₀(Scale)',
                            color: '#8b949e'
                        }},
                        grid: {{
                            color: '#21262d'
                        }},
                        ticks: {{
                            color: '#6e7681'
                        }}
                    }},
                    y: {{
                        title: {{
                            display: true,
                            text: 'log₁₀(Measure)',
                            color: '#8b949e'
                        }},
                        grid: {{
                            color: '#21262d'
                        }},
                        ticks: {{
                            color: '#6e7681'
                        }}
                    }}
                }}
            }}
        }});
'''
    
    html += '''
    </script>
</body>
</html>
'''
    
    return html


def main():
    print(f"\n{CYAN}Loading data...{RESET}")
    
    data = load_all_data()
    
    if not data.get('ssot'):
        print(f"{RED}Error: SSoT not found.{RESET}")
        return 1
    
    print(f"  Loaded SSoT with {len(data['ssot'].get('systems', {}).get('data', []))} systems")
    print(f"  Loaded {len(data['ssot'].get('scales', {}).get('data', []))} scales")
    
    print(f"\n{CYAN}Generating comprehensive HTML report...{RESET}")
    
    html = generate_html_report(data)
    
    # Write report
    report_path = SCRIPT_DIR / 'report.html'
    with open(report_path, 'w') as f:
        f.write(html)
    
    print(f"  {GREEN}✓ Report generated: {report_path}{RESET}")
    print(f"  Open in browser to view interactive charts and data.\n")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())



