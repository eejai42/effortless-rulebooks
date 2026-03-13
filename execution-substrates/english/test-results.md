# Test Results: english

## Summary

| Metric | Value |
|--------|-------|
| Total Fields Tested | 122 |
| Passed | 106 |
| Failed | 16 |
| Score | 86.9% |
| Duration | 3m 49s |

## Results by Entity

### roles

- Fields: 15/15 (100.0%)
- Computed columns: name

### workflow_steps

- Fields: 20/20 (100.0%)
- Computed columns: name

### workflows

- Fields: 45/45 (100.0%)
- Computed columns: name, count_of_non_proposed_steps, has_more_than1_step

### precedes_steps

- Fields: 0/16 (0.0%)
- Computed columns: display_name

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| assign-task-to-team | display_name | Step-16 | Assign Task to Team |
| step-1 | display_name | Step-1 | Submit Request |
| step-10 | display_name | Step-10 | Customer Feedback Collection |
| step-11 | display_name | Step-11 | Legal Compliance Check |
| step-12 | display_name | Step-12 | Assign Task to Team |
| step-13 | display_name | Step-13 | Team Lead Review |
| step-14 | display_name | Step-14 | Generate Report |
| step-15 | display_name | Step-15 | Close Workflow |
| step-2 | display_name | Step-2 | Manager Review |
| step-3 | display_name | Step-3 | Automated Eligibility Check |
| step-4 | display_name | Step-4 | Finance Approval |
| step-5 | display_name | Step-5 | Document Verification |
| step-6 | display_name | Step-6 | Quality Assurance Review |
| step-7 | display_name | Step-7 | System Notification Sent |
| step-8 | display_name | Step-8 | Final Approval |
| step-9 | display_name | Step-9 | Archive Request |

### departments

- Fields: 15/15 (100.0%)
- Computed columns: name

### approval_gates

- Fields: 11/11 (100.0%)
- Computed columns: name
