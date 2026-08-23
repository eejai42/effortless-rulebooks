# ERB Schema - Binary Format Specification

*Mirrors the PostgreSQL functions from postgres/02-create-functions.sql*
*Source: effortless-rulebook/effortless-rulebook.json*

## Binary Wire Format

This document specifies a compact binary representation of the ERB schema.

### Header (16 bytes)

```
Offset  Size  Field
------  ----  -----
0x00    4     Magic number: 0x45524253 ("ERBS")
0x04    2     Version: 0x0001
0x06    2     Flags: 0x0000
0x08    4     Entity count
0x0C    4     Reserved
```

### Entity Types

```
0x01 = Workflow
0x02 = WorkflowStep
0x03 = Role
```

### Field Types

```
0x00 = null
0x01 = boolean (1 byte: 0x00=false, 0x01=true)
0x02 = integer (4 bytes, big-endian)
0x03 = string (2-byte length prefix + UTF-8 bytes)
```

### Workflow Record Layout

```
Offset  Size     Field                        Type      DAG Level
------  -------  ---------------------------  --------  ---------
0x00    1        entity_type                  byte      -
0x01    2+N      workflow_id                  string    0 (raw)
...     2+N      display_name                 string    0 (raw)
...     2+N      title                        string    0 (raw)
...     2+N      description                  string    0 (raw)
...     4        count_of_steps               integer   1 (aggregation)
```

### Calculated Fields (Optional Extension)

When the `INCLUDE_CALC` flag (0x0001) is set:

```
...     2+N      name                         string    1 (calc)
...     1        has_more_than_1_step         boolean   2 (calc)
```

### DAG Execution Order for Calculations

When deserializing and computing calculated fields:

```
Level 0: Read all raw fields
Level 1: Compute in any order:
         - name = SUBSTITUTE(LOWER(display_name), " ", "-")
         - count_of_steps = aggregation from WorkflowSteps
Level 2: Compute (requires Level 1):
         - has_more_than_1_step = count_of_steps > 1
```

### Calculation Functions (Pseudocode)

```
// Level 1
calc_name(display_name):
    IF display_name IS NULL: RETURN ""
    RETURN REPLACE(LOWERCASE(display_name), " ", "-")

// Level 2
calc_has_more_than_1_step(count_of_steps):
    IF count_of_steps IS NULL: RETURN false
    RETURN count_of_steps > 1
```

### Example Binary (Hex)

```
45 52 42 53  # Magic: "ERBS"
00 01        # Version: 1
00 01        # Flags: INCLUDE_CALC
00 00 00 01  # Entity count: 1
00 00 00 00  # Reserved

01           # Entity type: Workflow
00 0A 6F 6E 62 6F 61 72 64 69 6E 67  # ID: "onboarding"
00 0A 4F 6E 62 6F 61 72 64 69 6E 67  # DisplayName: "Onboarding"
00 12 45 6D 70 6C 6F 79 65 65 20 4F 6E 62 6F 61 72 64 69 6E 67  # Title: "Employee Onboarding"
00 00 00 01  # count_of_steps: 1

# Calculated fields (with INCLUDE_CALC flag)
00 0A 6F 6E 62 6F 61 72 64 69 6E 67  # name: "onboarding"
00           # has_more_than_1_step: false
```
