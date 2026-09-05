#!/usr/bin/env python3
"""
Generate Test Data from SSoT

Creates the test-data/ directory with:
- base-data.json: Base iterations with all values (for platform initialization)
- test-input.json: Test iterations (4-7) with only raw facts (for testing)
- answer-key.json: ALL iterations (0-7) with all computed values rounded to 6dp (for validation)

The answer-key.json is the CANONICAL reference that all platforms must match.
All numeric values are rounded to 6 decimal places for consistent cross-platform comparison.

Supports configurable iteration counts via command line:
  python generate-test-data.py --iterations 1000
"""

import json
import math
import argparse
from pathlib import Path
from datetime import datetime, timezone

# Paths
SCRIPT_DIR = Path(__file__).parent
SSOT_PATH = SCRIPT_DIR / 'effortless-rulebook' / 'effortless-rulebook.json'
TEST_DATA_DIR = SCRIPT_DIR / 'test-data'
TEST_RESULTS_DIR = SCRIPT_DIR / 'test-results'

# Default iteration split
DEFAULT_BASE_ITERATIONS = 4  # 0-3 are base/actual
DEFAULT_TOTAL_ITERATIONS = 8  # Total iterations per system

# Raw fact fields (what platforms receive in test input)
RAW_SCALE_FIELDS = ['ScaleID', 'System', 'Iteration', 'Measure', 'IsProjected']

# All fields for scales (for base data and answer key)
ALL_SCALE_FIELDS = [
    'ScaleID', 'System', 'Iteration', 'Measure', 'BaseScale', 'ScaleFactor',
    'ScaleFactorPower', 'Scale', 'LogScale', 'LogMeasure', 'IsProjected'
]


def load_ssot():
    """Load the SSoT JSON file"""
    with open(SSOT_PATH, 'r') as f:
        return json.load(f)


def round_numeric(value, decimals=2):
    """Round a numeric value to specified decimal places, handling special cases"""
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return round(value, decimals)
    return value


def round_scale_record(scale: dict, decimals: int = 2) -> dict:
    """Round all numeric values in a scale record to specified decimal places"""
    result = {}
    for key, value in scale.items():
        result[key] = round_numeric(value, decimals)
    return result


def calculate_scale_values(system: dict, iteration: int, measure: float) -> dict:
    """Calculate all derived values for a scale given system parameters"""
    base_scale = system['BaseScale']
    scale_factor = system['ScaleFactor']
    
    # Use log arithmetic to avoid overflow for large iterations
    log_scale_factor = math.log10(scale_factor) if scale_factor > 0 else 0
    log_scale_factor_power = iteration * log_scale_factor
    log_base_scale = math.log10(base_scale) if base_scale > 0 else 0
    log_scale = log_base_scale + log_scale_factor_power
    
    # Clamp to prevent overflow
    log_scale_factor_power = max(-300, min(300, log_scale_factor_power))
    log_scale = max(-300, min(300, log_scale))
    
    try:
        scale_factor_power = math.pow(10, log_scale_factor_power)
        scale = math.pow(10, log_scale)
    except (OverflowError, ValueError):
        scale_factor_power = 0.0
        scale = 0.0
    
    log_measure = math.log10(measure) if measure > 0 else 0
    
    return {
        'BaseScale': base_scale,
        'ScaleFactor': scale_factor,
        'ScaleFactorPower': scale_factor_power,
        'Scale': scale,
        'LogScale': log_scale,
        'LogMeasure': log_measure
    }


def generate_measure_for_iteration(system: dict, iteration: int, base_measure: float = 1.0) -> float:
    """
    Generate a synthetic Measure value for a given iteration.
    
    Uses the power law relationship: Measure ∝ Scale^slope
    Where slope is the TheoreticalLogLogSlope.
    
    This means: log(Measure) = slope * log(Scale) + constant
    At iteration 0, Scale = BaseScale, Measure = base_measure
    """
    base_scale = system['BaseScale']
    scale_factor = system['ScaleFactor']
    slope = system['TheoreticalLogLogSlope']
    
    # Calculate log of scale factor power directly to avoid overflow
    log_scale_factor = math.log10(scale_factor) if scale_factor > 0 else 0
    log_scale_factor_power = iteration * log_scale_factor
    
    # log(Scale) = log(BaseScale) + log(ScaleFactorPower)
    log_base_scale = math.log10(base_scale) if base_scale > 0 else 0
    log_scale = log_base_scale + log_scale_factor_power
    
    # At iteration 0: log(base_measure) = slope * log(base_scale) + C
    # Therefore: C = log(base_measure) - slope * log(base_scale)
    log_base_measure = math.log10(base_measure) if base_measure > 0 else 0
    constant = log_base_measure - slope * log_base_scale
    
    # log(Measure) = slope * log(Scale) + C
    log_measure = slope * log_scale + constant
    
    # Clamp to prevent overflow (range of float64 is roughly 10^±308)
    log_measure = max(-300, min(300, log_measure))
    
    try:
        measure = math.pow(10, log_measure)
        return round(measure, 15)
    except (OverflowError, ValueError):
        return 0.0


def generate_scales_for_system(system: dict, total_iterations: int, base_iterations: int) -> list:
    """Generate all scale records for a system"""
    scales = []
    system_id = system['SystemID']
    
    for iteration in range(total_iterations):
        is_projected = iteration >= base_iterations
        
        # Generate measure using power law relationship
        measure = generate_measure_for_iteration(system, iteration)
        
        # Calculate all derived values
        derived = calculate_scale_values(system, iteration, measure)
        
        scale = {
            'ScaleID': f"{system_id}_{iteration}",
            'System': system_id,
            'Iteration': iteration,
            'Measure': measure,
            'IsProjected': is_projected,
            **derived
        }
        
        scales.append(scale)
    
    return scales


def extract_raw_facts(scale, round_decimals: int = 6):
    """Extract only raw fact fields from a scale record, with rounding"""
    result = {k: scale.get(k) for k in RAW_SCALE_FIELDS}
    return round_scale_record(result, round_decimals)


def extract_all_fields(scale, round_decimals: int = 6):
    """
    Extract all fields from a scale record, with rounding.
    
    IMPORTANT: LogMeasure is recomputed from the ROUNDED Measure value
    to ensure consistency with platforms that compute from rounded inputs.
    """
    result = {}
    for k in ALL_SCALE_FIELDS:
        result[k] = scale.get(k)
    
    # Round all values first
    result = round_scale_record(result, round_decimals)
    
    # Recompute LogMeasure from the ROUNDED Measure value for consistency
    # This ensures answer-key matches what platforms compute from test-input
    rounded_measure = result.get('Measure', 0)
    if rounded_measure and rounded_measure > 0:
        result['LogMeasure'] = round(math.log10(rounded_measure), round_decimals)
    
    return result


def generate_test_data(total_iterations: int = DEFAULT_TOTAL_ITERATIONS, 
                       base_iterations: int = DEFAULT_BASE_ITERATIONS):
    """Generate all test data files"""
    print(f"Generating test data with {total_iterations} iterations per system...")
    print(f"  Base iterations (actual): 0-{base_iterations - 1}")
    print(f"  Test iterations (projected): {base_iterations}-{total_iterations - 1}")
    
    # Load SSoT
    ssot = load_ssot()
    
    # Create output directories
    TEST_DATA_DIR.mkdir(exist_ok=True)
    TEST_RESULTS_DIR.mkdir(exist_ok=True)
    
    # Extract systems
    systems = ssot['systems']['data']
    
    # Generate all scales for each system
    all_scales = []
    for system in systems:
        system_scales = generate_scales_for_system(system, total_iterations, base_iterations)
        all_scales.extend(system_scales)
        print(f"  Generated {len(system_scales)} scales for {system['DisplayName']}")
    
    # Separate base data from test data
    base_scales = [s for s in all_scales if not s.get('IsProjected', False)]
    test_scales = [s for s in all_scales if s.get('IsProjected', False)]
    
    print(f"\n  Total base scales: {len(base_scales)}")
    print(f"  Total test scales: {len(test_scales)}")
    print(f"  Total scales: {len(all_scales)}")
    
    # Generate base-data.json (with rounding for consistency)
    base_data = {
        'description': f'Base data for platform initialization (iterations 0-{base_iterations - 1})',
        'generated': datetime.now(timezone.utc).isoformat(),
        'source': 'effortless-rulebook/effortless-rulebook.json',
        'total_iterations': total_iterations,
        'base_iterations': base_iterations,
        'systems': systems,
        'scales': [extract_all_fields(s) for s in base_scales]
    }
    
    base_data_path = TEST_DATA_DIR / 'base-data.json'
    with open(base_data_path, 'w') as f:
        json.dump(base_data, f, indent=2)
    print(f"\n  ✓ Generated {base_data_path}")
    
    # Generate test-input.json (only raw facts for iterations 4-7, with rounding)
    test_input = {
        'description': f'Test input with only raw facts for iterations {base_iterations}-{total_iterations-1} (platforms must compute derived values)',
        'source': 'effortless-rulebook/effortless-rulebook.json',
        'total_iterations': total_iterations,
        'base_iterations': base_iterations,
        'scales': [extract_raw_facts(s) for s in test_scales]
    }
    
    test_input_path = TEST_DATA_DIR / 'test-input.json'
    with open(test_input_path, 'w') as f:
        json.dump(test_input, f, indent=2)
    print(f"  ✓ Generated {test_input_path}")
    
    # Generate answer-key.json (ALL 8 iterations with all computed values, rounded to 6dp)
    # This is the CANONICAL reference that all platforms must match
    answer_key = {
        'description': f'CANONICAL answer key - ALL {total_iterations} iterations with computed values (rounded to 6dp)',
        'generated': datetime.now(timezone.utc).isoformat(),
        'source': 'effortless-rulebook/effortless-rulebook.json',
        'total_iterations': total_iterations,
        'base_iterations': base_iterations,
        'note': 'This file contains ALL iterations (0-7). Platforms should match these values exactly.',
        'scales': [extract_all_fields(s) for s in all_scales]  # ALL scales, not just test_scales
    }
    
    answer_key_path = TEST_DATA_DIR / 'answer-key.json'
    with open(answer_key_path, 'w') as f:
        json.dump(answer_key, f, indent=2)
    print(f"  ✓ Generated {answer_key_path}")
    
    # Create empty .gitkeep for test-results
    gitkeep_path = TEST_RESULTS_DIR / '.gitkeep'
    gitkeep_path.touch()
    
    print("\n✓ Test data generation complete!")
    print(f"\nTest data structure:")
    print(f"  test-data/base-data.json   - {len(base_scales)} scales (init platforms, iterations 0-{base_iterations-1})")
    print(f"  test-data/test-input.json  - {len(test_scales)} scales (raw facts only, iterations {base_iterations}-{total_iterations-1})")
    print(f"  test-data/answer-key.json  - {len(all_scales)} scales (ALL iterations 0-{total_iterations-1}, rounded to 6dp)")
    print(f"\nTotal: {len(all_scales)} scales across {len(systems)} systems")
    print(f"\n📌 All numeric values rounded to 6 decimal places for cross-platform consistency.")


def main():
    parser = argparse.ArgumentParser(description='Generate test data from SSoT')
    parser.add_argument('--iterations', '-n', type=int, default=DEFAULT_TOTAL_ITERATIONS,
                        help=f'Total iterations per system (default: {DEFAULT_TOTAL_ITERATIONS})')
    parser.add_argument('--base', '-b', type=int, default=DEFAULT_BASE_ITERATIONS,
                        help=f'Base/actual iterations (default: {DEFAULT_BASE_ITERATIONS})')
    args = parser.parse_args()
    
    if args.base >= args.iterations:
        print(f"Error: base iterations ({args.base}) must be less than total iterations ({args.iterations})")
        return 1
    
    generate_test_data(total_iterations=args.iterations, base_iterations=args.base)
    return 0


if __name__ == '__main__':
    exit(main())
