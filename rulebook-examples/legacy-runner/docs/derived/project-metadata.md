<!-- GENERATED FILE — DO NOT EDIT. -->
<!-- Source: effortless-platform/effortless-rulebook/effortless-rulebook.json (table: `ProjectMetadata`) -->
<!-- Regenerate with: cd effortless-platform && effortless build -->

# Project Metadata

Project overview

## Effortlessly Invariant Rulesbooks

- **ProjectId**: erb-001
- **Name**: Effortlessly Invariant Rulesbooks
- **Purpose**: Host a catalog of independent Effortless projects under rulebook-examples/, each a self-contained rulebook that fully captures one domain and selects the subset of platform substrates it needs. A rulebook alone is sufficient for any frontier LLM to answer any question about the domain or produce a faithful implementation in any language / platform.
- **Architecture**: rulebook-examples/<project>/ — every subdirectory that contains a <project>-rulebook.json is an independent Effortless project. The filesystem is authoritative; there is no curated partial "canonical" subset. Each project's rulebook JSON is its own hub / durable SSoT; each picks the subset of the platform's substrates it needs (some exercise all of them; most use a handful). Builds are convergent: downstream artifacts mirror the current rulebook (additions appear, removals disappear). Two subdirs deliberately carry no rulebook file — naked-claude-vs-effortless-claude/ (experiment tree) and volunteer-shift-scheduler-demo/ (demo-app scaffold that consumes its sibling's rulebook); these are not demos and are not in any "demos" denominator. The platform itself (effortless-platform/) is one such project, describing ERB.
- **EntryPoint**: ./start.sh
- **PortalUrl**: http://localhost:7777
- **ProxyUrl**: http://localhost:4242
- **RepositoryRoot**: effortlessly-invariant-rulesbooks/

