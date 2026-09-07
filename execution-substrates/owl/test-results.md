# Test Results: owl

## Summary

| Metric | Value |
|--------|-------|
| Total Fields Tested | 40 |
| Passed | 8 |
| Failed | 32 |
| Score | 20.0% |
| Duration | < 1s |

## Score by Field Class

| Class | Passed | Tested | Score |
|-------|--------|--------|-------|
| Scalar (calculated) | 3 | 3 | 100.0% |
| Lookup (INDEX/MATCH) | 4 | 30 | 13.3% |
| Aggregation (COUNTIFS/SUMIFS) | 1 | 7 | 14.3% |

## Results by Entity

### roles

- Fields: 0/3 (0.0%)
- Computed columns: count_of_employees

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| analyst | count_of_employees | 1 | None |
| developer | count_of_employees | 1 | None |
| projectmanager | count_of_employees | 1 | None |

### projects

- Fields: 3/21 (14.3%)
- Computed columns: project_type_name, project_type_description, project_type_requires_manager_approval, approved_by_role_is_manager, approved_by_name, approved_by_email_address, approved_by_phone_number

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| customer-portal-redesign | project_type_name | ClientFacing | None |
| customer-portal-redesign | project_type_description | Open, public facing communicat | None |
| customer-portal-redesign | project_type_requires_manager_approval | True | None |
| customer-portal-redesign | approved_by_name | Priya Patel | None |
| customer-portal-redesign | approved_by_email_address | priya.patel@acmecorp.example | None |
| customer-portal-redesign | approved_by_phone_number | 555-0103 | None |
| gdpr-compliance-audit | project_type_name | Compliance | None |
| gdpr-compliance-audit | project_type_requires_manager_approval | True | None |
| gdpr-compliance-audit | approved_by_role_is_manager | True | None |
| gdpr-compliance-audit | approved_by_name | Mike Johnson | None |
| gdpr-compliance-audit | approved_by_email_address | mike.johnson@acmecorp.example | None |
| gdpr-compliance-audit | approved_by_phone_number | 555-0102 | None |
| internal-tools-dashboard | project_type_name | Internal | None |
| internal-tools-dashboard | project_type_description | An internal project that is no | None |
| internal-tools-dashboard | approved_by_role_is_manager | True | None |
| internal-tools-dashboard | approved_by_name | Sarah Chen | None |
| internal-tools-dashboard | approved_by_email_address | sarah.chen@acmecorp.example | None |
| internal-tools-dashboard | approved_by_phone_number | 555-0101 | None |

### types_of_project

- Fields: 1/4 (25.0%)
- Computed columns: count_of_projects

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| clientfacing | count_of_projects | 1 | None |
| compliance | count_of_projects | 1 | None |
| internal | count_of_projects | 1 | None |

### employees

- Fields: 1/9 (11.1%)
- Computed columns: role_name, role_description, role_is_manager

| PK | Field | Expected | Actual |
|-----|-------|----------|--------|
| mike-johnson | role_name | Developer | None |
| mike-johnson | role_description | Developers handle the implemen | None |
| mike-johnson | role_is_manager | True | None |
| priya-patel | role_name | Analyst | None |
| priya-patel | role_description | The business analysis know wha | None |
| sarah-chen | role_name | ProjectManager | None |
| sarah-chen | role_description | The project Manager makes sure | None |
| sarah-chen | role_is_manager | True | None |

### client

- Fields: 3/3 (100.0%)
- Computed columns: full_name
