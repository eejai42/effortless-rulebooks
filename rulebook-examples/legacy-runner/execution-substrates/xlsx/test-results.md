# Test Results: xlsx

## Summary

| Metric | Value |
|--------|-------|
| Total Fields Tested | 40 |
| Passed | 40 |
| Failed | 0 |
| Score | 100.0% |
| Duration | < 1s |

## Score by Field Class

| Class | Passed | Tested | Score |
|-------|--------|--------|-------|
| Scalar (calculated) | 3 | 3 | 100.0% |
| Lookup (INDEX/MATCH) | 30 | 30 | 100.0% |
| Aggregation (COUNTIFS/SUMIFS) | 7 | 7 | 100.0% |

## Results by Entity

### roles

- Fields: 3/3 (100.0%)
- Computed columns: count_of_employees

### projects

- Fields: 21/21 (100.0%)
- Computed columns: project_type_name, project_type_description, project_type_requires_manager_approval, approved_by_role_is_manager, approved_by_name, approved_by_email_address, approved_by_phone_number

### types_of_project

- Fields: 4/4 (100.0%)
- Computed columns: count_of_projects

### employees

- Fields: 9/9 (100.0%)
- Computed columns: role_name, role_description, role_is_manager

### client

- Fields: 3/3 (100.0%)
- Computed columns: full_name
