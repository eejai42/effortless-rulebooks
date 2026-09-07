# Test Results: effortless-entity-framework

## Summary

| Metric | Value |
|--------|-------|
| Total Fields Tested | 6 |
| Passed | 3 |
| Failed | 3 |
| Score | 50.0% |
| Duration | 1s |

## Score by Field Class

| Class | Passed | Tested | Score |
|-------|--------|--------|-------|
| Scalar (calculated) | 3 | 6 | 50.0% |
| Lookup (INDEX/MATCH) | — | 0 | n/a |
| Aggregation (COUNTIFS/SUMIFS) | — | 0 | n/a |

## Results by Entity

### customers

- Fields: 3/6 (50.0%)
- Computed columns: name, full_name

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| bob-gmail-com | full_name | Bobby Smith | Smith, Bobby |
| jimmy-gmail-com | full_name | Jimmy Doe | Doe, Jimmy |
| mary-gmail-com | full_name | Mary Jones | Jones, Mary |
