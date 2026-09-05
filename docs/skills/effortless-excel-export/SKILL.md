<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-excel-export/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-excel-export
description: >
  Use when adding Excel export to any Effortless project backed by a Postgres
  database. Covers: building a rulebook-export.json from live DB data, running
  the rulebook-to-xlsx transpiler, wiring a server endpoint, and adding a
  download link to the React app.

  **Scope (load gate):** Effortless projects with a Postgres DB and a running
  Express server. Requires `effortless.json` + CLAUDE.md identifying project as
  ERB methodology.
audience: customer
---

# Effortless Excel Export

> **Do NOT use ExcelJS or any other npm xlsx library.** The correct approach is the `effortless rulebook-to-xlsx` effortless transpiler — it reads a populated `rulebook-export.json` and produces the workbook. No npm dependency, no in-process spreadsheet logic.

> **Do NOT use `execSync`.** It blocks the Node event loop. Always use `spawn`
> (async) to invoke the transpiler.

Any Effortless project can export its current state as a full Excel workbook
— one sheet per entity, all calculated and aggregated columns included.

## How it works

1. Load `effortless-rulebook.json` and clear all `data` arrays (schema stays).
2. Query each `vw_*` view in Postgres and populate the corresponding table's
   `data` array with the live rows. Map snake_case column names back to PascalCase
   field names (views use snake_case; the rulebook uses PascalCase).
3. Write the result to `rulebook-export.json` in the project root.
4. Run `effortless rulebook-to-xlsx -i ./rulebook-export.json -o {project-name}-rulebook.xlsx`
   from the directory where `rulebook-export.json` was written, using `spawn` (async).
5. Stream `{project-name}-rulebook.xlsx` back to the browser as a download, then
   delete both temp files.

## Server endpoint

Add to `server/src/index.ts`:

```typescript
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

app.get('/api/export/xlsx', requireAuth, async (req, res) => {
  try {
    // 1. Load rulebook and strip data
    const projectRoot = path.join(__dirname, '../..')
    const rulebookPath = path.join(projectRoot, 'effortless-rulebook/effortless-rulebook.json')
    const rulebook = JSON.parse(fs.readFileSync(rulebookPath, 'utf8'))

    const reservedKeys = new Set(['$schema', 'Name', 'Description', '_meta'])
    const tableNames = Object.keys(rulebook).filter(k => !reservedKeys.has(k))

    for (const table of tableNames) {
      rulebook[table].data = []
    }

    // 2. Populate from vw_* views (columns are snake_case from Postgres)
    for (const table of tableNames) {
      const viewName = `vw_${table.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')}`
      try {
        const { rows } = await pool.query(`SELECT * FROM ${viewName}`)
        const schema: Array<{ name: string }> = rulebook[table].schema
        rulebook[table].data = rows.map((row: Record<string, unknown>) => {
          const mapped: Record<string, unknown> = {}
          for (const field of schema) {
            const snakeKey = field.name
              .replace(/([A-Z])/g, '_$1')
              .toLowerCase()
              .replace(/^_/, '')
            if (snakeKey in row) mapped[field.name] = row[snakeKey]
          }
          return mapped
        })
      } catch (e) {
        console.warn(`skipping view ${viewName}:`, e)
      }
    }

    // 3. Write rulebook-export.json into project root
    const exportPath = path.join(projectRoot, 'rulebook-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(rulebook, null, 2))

    // 4. Run transpiler asynchronously from projectRoot
    const projectName = process.env.PROJECT_NAME ?? 'export'
    const xlsxFilename = `${projectName}-rulebook.xlsx`
    const xlsxPath = path.join(projectRoot, xlsxFilename)

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(
        'effortless',
        ['rulebook-to-xlsx', '-i', './rulebook-export.json', '-o', xlsxFilename],
        { cwd: projectRoot }
      )
      proc.stderr.on('data', d => console.error('[rulebook-to-xlsx]', d.toString()))
      proc.on('close', code => code === 0 ? resolve() : reject(new Error(`rulebook-to-xlsx exited ${code}`)))
      proc.on('error', reject)
    })

    // 5. Stream download then clean up
    res.download(xlsxPath, xlsxFilename, () => {
      try { fs.unlinkSync(xlsxPath) } catch { /* ignore */ }
      try { fs.unlinkSync(exportPath) } catch { /* ignore */ }
    })
  } catch (err) {
    console.error('Export failed:', err)
    res.status(500).json({ error: 'Export failed' })
  }
})
```

Set `PROJECT_NAME` in `start.sh`:

```bash
export PROJECT_NAME="expense-approval-demo"
```

## React download link

Use a button that fetches with auth headers and triggers a blob download:

```tsx
function handleExport() {
  const url = `/api/export/xlsx`
  fetch(url, { headers: { 'X-User-Email': getEmail() } })
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement('a')
      const blobUrl = URL.createObjectURL(blob)
      a.href = blobUrl
      a.download = 'export.xlsx'
      a.click()
      URL.revokeObjectURL(blobUrl)
    })
}

<button className="btn btn-secondary" onClick={handleExport}>
  ⬇ Export to Excel
</button>
```

## Column name mapping

The `vw_*` views expose columns in `snake_case` (Postgres convention). The
rulebook field names are `PascalCase`. The endpoint above maps them by
converting each schema field name to snake_case before looking it up in the
row. If a column doesn't resolve, it's logged and skipped — check the schema
field names against `\d vw_<table>` in psql if columns are missing.

## Pitfalls

- **`effortless` must be on the server's PATH.** If `spawn` throws `ENOENT`,
  add the effortless binary directory to `PATH` in `start.sh` before starting
  the server.
- **Never use `execSync`.** It blocks the Node event loop. Always use `spawn`.
- **Never use ExcelJS or any other in-process xlsx library.** The transpiler
  is the correct tool.
- **Output filename is `{PROJECT_NAME}-rulebook.xlsx`.** Set `PROJECT_NAME` in
  the environment.
- **Calculated fields are automatic.** Because the export reads from `vw_*`
  views, every calculated, lookup, and aggregation column is included.

## Installing the transpiler

```bash
effortless -install rulebook-to-xlsx
```
