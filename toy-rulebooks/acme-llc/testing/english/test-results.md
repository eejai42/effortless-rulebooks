# Test Results: english

## Summary

| Metric | Value |
|--------|-------|
| Total Fields Tested | 6 |
| Passed | 0 |
| Failed | 6 |
| Score | 0.0% |
| Duration | 5s |

## Score by Field Class

| Class | Passed | Tested | Score |
|-------|--------|--------|-------|
| Scalar (calculated) | 0 | 6 | 0.0% |
| Lookup (INDEX/MATCH) | — | 0 | n/a |
| Aggregation (COUNTIFS/SUMIFS) | — | 0 | n/a |

## Results by Entity

### customers

- Fields: 0/6 (0.0%)
- Computed columns: name, full_name

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| bob-gmail-com | name | bob-gmail.com | None |
| bob-gmail-com | full_name | Bobby Smith | None |
| jimmy-gmail-com | name | jimmy-gmail.com | None |
| jimmy-gmail-com | full_name | Jimmy Doe | None |
| mary-gmail-com | name | mary-gmail.com | None |
| mary-gmail-com | full_name | Mary Jones | None |
