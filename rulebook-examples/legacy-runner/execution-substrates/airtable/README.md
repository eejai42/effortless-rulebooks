# Airtable Substrate (01)

The airtable entry is a **utility substrate**, not a computation substrate.
It behaves differently from substrates 02–13:

- It does **not** generate code from the rulebook.
- It does **not** take the conformance test.
- It **refreshes the rulebook** that all other substrates consume.

When selected alone, it prompts you to choose a base
(Enter keeps the current base) and then pulls the latest
rulebook from Airtable. When "Run ALL" is chosen, the orchestrator runs
airtable first so that the remaining substrates generate against a fresh
rulebook.

In CI / Docker mode it runs non-interactively, keeping the current base
and syncing offline from the cache.

This substrate replaces the old `[P]` (Pull & Inject) and `[B]`
(Change Base ID) menu options.
