# Cross-substrate conformance tests

These tests prove that a derivation computed in the Postgres substrate and the
**same** derivation computed by an independent reasoner over the OWL substrate
**agree** — the receipt that the rulebook's reasoning is one object, projected,
not re-implemented. (This is the in-repo, domain-specific instance of the
multi-substrate conformance the framework demonstrates at breadth in
`effortless-rulebooks`; see the repo README "On portability".)

## `progression_closure_conformance.py`

The disease-progression machines (`lupus-nephritis-progression`,
`diagnosis-lifecycle`) store progression as sparsely-asserted `FromState →
ToState` edges on `StateTransitionRules`. A single `closure` field on that table
drives two independent derivations of the full reachability ordering:

- **Postgres** — `vw_state_transition_rules_closure`, a cycle-safe
  `WITH RECURSIVE` CTE (`from_id, to_id, hop_distance, is_inferred`).
- **OWL** — `progression a owl:TransitiveProperty` plus the asserted ABox edges,
  closed by an OWL-RL reasoner (`owlrl.DeductiveClosure`). The closure is
  *computed by the reasoner*, not seeded.

The test asserts the two closures are **identical** (32 pairs), and that the
headline never-asserted inference — `PresymptomaticAutoimmunity →
BiopsyIndicated`, a 4-hop pair nobody wrote down — appears in **both**. This is
the autoimmune analogue of the Talisman `precedesStep` (step-1 → step-5) receipt.

**Scope (honest conformance).** This covers the ordering/reachability sublayer
only, where cross-substrate agreement is *exact* (edges + booleans, no
floating-point). The numeric keystone fields (Z-stats, `CalibratedUncertainty`,
SLEDAI, coverage counts) are deliberately **not** projected here — they conform
only on the shared deterministic subset (100%\*). Do not read this as full OWL
equivalence of the whole model.

### Run

```bash
# Prereqs: local DB seeded (cd postgres && ./reset-rulebook-db.sh); python3 with
# rdflib + owlrl + pyshacl; curl on PATH.
python3 admin-app/tests/conformance/progression_closure_conformance.py
```

Exit 0 + `CONFORMANCE PASS` on agreement; non-zero + the diverging pairs on any
divergence. Projects the rulebook to OWL via the published `rulebook-to-owl`
workload (override with `RULEBOOK_TO_OWL_URL`); reads `DATABASE_URL` (defaults to
the local `causal_autoimmune` DB).
