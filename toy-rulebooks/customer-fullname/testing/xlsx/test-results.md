# Test Results: xlsx

## Summary

| Metric | Value |
|--------|-------|
| Total Fields Tested | 8 |
| Passed | 4 |
| Failed | 4 |
| Score | 50.0% |
| Duration | < 1s |

## Score by Field Class

| Class | Passed | Tested | Score |
|-------|--------|--------|-------|
| Scalar (calculated) | 4 | 8 | 50.0% |
| Lookup (INDEX/MATCH) | — | 0 | n/a |
| Aggregation (COUNTIFS/SUMIFS) | — | 0 | n/a |

## Results by Entity

### customers

- Fields: 4/8 (50.0%)
- Computed columns: name, initials

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| emily-jones | initials | EJ | None |
| jane-smith | initials | JS | None |
| john-doe | initials | JD | None |
| mary-gutknecht | initials | MG | None |
