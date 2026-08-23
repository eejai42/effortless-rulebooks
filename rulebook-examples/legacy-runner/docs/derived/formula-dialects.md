<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `FormulaDialects`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Formula Dialects

Catalog of formula dialects that a rulebook can declare. Per-rulebook formula dialect is headline feature #6: each demo rulebook names which dialect it speaks (in _meta.formulaDialect), and substrates honor that declaration. The platform rulebook does not enumerate which functions a dialect supports — that lives in each demo rulebook's own formula definitions. This catalog only registers the dialects themselves.

## Excel

_Status: active_

- **Origin**: Microsoft Excel formula language
- **Field reference syntax**: `{FieldName}`
- **String concatenation**: & operator
- **Case sensitive**: no
- **Primary substrates**: xlsx, csv, postgres, python, golang

```
SUBSTITUTE(LOWER({DisplayName}), " ", "-")
```

Default dialect for rulebooks without an explicit declaration. Covered by IF, AND, OR, CONCAT, LOWER, UPPER, SUBSTITUTE, LEFT, RIGHT, arithmetic, comparison.

## Airtable

_Status: active_

- **Origin**: Airtable formula field language
- **Field reference syntax**: `{FieldName}`
- **String concatenation**: & operator OR CONCATENATE()
- **Case sensitive**: no
- **Primary substrates**: airtable, xlsx, postgres

```
IF({Status} = "Open", "yes", "no")
```

Near-superset of Excel for the functions this project uses. Airtable-specific extensions (e.g. DATETIME_FORMAT) are honored when present.

