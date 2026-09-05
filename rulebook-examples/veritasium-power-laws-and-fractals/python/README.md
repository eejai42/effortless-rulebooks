# Python SDK - Power Laws & Fractals

A Python implementation of the Power Laws and Fractals analysis engine.

## Quick Start

```bash
cd python
python demo.py
```

That's it! You'll see all 7 systems validated with their log-log slopes.

## Interactive Exploration

```python
from rulebook import *

# Load everything
data = load_sample_data()
systems = data['systems']
scales = data['scales']
stats = data['system_stats']

# Calculate derived fields
systems_dict = build_systems_dict(systems)
calculate_all_scales(scales, systems_dict)
calculate_all_system_stats(stats, systems_dict, scales)

# Explore Sierpinski Triangle
sierpinski = [s for s in scales if s.system == 'Sierpinski']
for s in sierpinski:
    print(f"Iteration {s.iteration}: scale={s._scale:.4f}, measure={s.measure}")

# Check validation
for st in stats:
    valid = validate_system(st)
    print(f"{st._system_display_name}: {'✓' if valid else '✗'}")
```

## What's Inside

### Systems (7 total)

| System | Type | Theoretical Slope |
|--------|------|-------------------|
| Sierpinski Triangle | fractal | -1.585 |
| Koch Snowflake | fractal | -0.262 |
| Zipf word frequencies | power_law | -1.0 |
| Scale-free network | power_law | -2.5 |
| Sandpile avalanches | power_law | -1.0 |
| Earthquake energies | power_law | -1.0 |
| Forest fire sizes | power_law | -1.3 |

### Package Structure

```
python/
├── demo.py              # Run this first!
├── README.md            # You are here
└── rulebook/            # The generated package
    ├── __init__.py      # Exports everything
    ├── models.py        # System, Scale, SystemStats dataclasses
    ├── data.py          # Sample data from ssot.json
    └── utils.py         # Calculation helpers
```

## Regenerating the Code

If you modify `effortless-rulebook/effortless-rulebook.json`, regenerate:

```bash
python rulebook-to-python.py
```

## Key Concepts

- **Systems**: Fractal or power-law systems with theoretical parameters
- **Scales**: Measurement points at different iterations/scales
- **SystemStats**: Statistical validation comparing empirical vs theoretical slopes
- **Log-Log Slope**: The relationship between log(scale) and log(measure)

All 7 systems validate within 0.001 tolerance - the empirical data matches theory!
