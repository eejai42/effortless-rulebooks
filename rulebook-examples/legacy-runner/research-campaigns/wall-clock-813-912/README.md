# TSP wall-clock campaign — loops 813–912

## Status

- **Loops:** 100, contiguous from 813 through 912
- **Focus:** shorten exact-solver wall clock under the frozen semantic basis
- **External exact benchmarks:** 13/13
- **Largest exact benchmark:** `kroA100`, 100 cities, optimum 21,282
- **New semantic atoms/operators/active terms:** 0 / 0 / 0
- **Independent replay:** PASS

Primary timings are warm, in-process `perf_counter_ns` medians with numerical thread counts fixed to one. Fresh-process measurements are reported separately because Python, NumPy, SciPy, and HiGHS imports dominate small command-line runs. These are machine-local measurements, not a solver leaderboard.

## Main change

The earlier engine searched the exact quotient state

```text
(last city, unvisited set)
```

using an endpoint-plus-MST completion bound. The campaign retained and micro-optimized that engine, but also internalized a small standard integer subtour cutting plane:

```text
binary minimum degree-2 factor
→ find disconnected cycle components
→ add canonical subtour-elimination constraints
→ repeat until the optimum binary solution is one connected cycle
```

Every intermediate MILP is a relaxation of TSP. When its optimum binary solution is connected and 2-regular, its lower-bound value equals the feasible-tour value, proving optimality. This is established DFJ/branch-and-cut machinery, not a claimed new TSP algorithm.

## Headline wall-clock result

On the original six external benchmarks:

```text
prior MST-envelope median/capped total   20.0364 s
lower-object-traffic state search        15.3286 s
integer SEC cutting plane                 0.0961 s
```

The observed warm elapsed ratio is **208.5× shorter** than the capped prior total on this host. The prior engine failed to complete GR24 and FRI26 within five seconds each, while the integer SEC method proved both. The large gain therefore comes primarily from changing the exact proof method, not merely optimizing Python object traffic.

## External exact results

| Instance | n | Optimum | Warm median | MILP solves | SEC cuts |
|---|---:|---:|---:|---:|---:|
| burma14 | 14 | 3,323 | 0.00779 s | 2 | 3 |
| ulysses16 | 16 | 6,859 | 0.01775 s | 4 | 6 |
| gr17 | 17 | 2,085 | 0.01679 s | 4 | 11 |
| gr21 | 21 | 2,707 | 0.00511 s | 1 | 0 |
| gr24 | 24 | 1,272 | 0.01903 s | 2 | 3 |
| fri26 | 26 | 937 | 0.02963 s | 3 | 8 |
| ulysses22 | 22 | 7,013 | 0.02807 s | 5 | 13 |
| bayg29 | 29 | 1,610 | 0.04519 s | 3 | 6 |
| bays29 | 29 | 2,020 | 0.04734 s | 4 | 8 |
| att48 | 48 | 10,628 | 0.50079 s | 7 | 20 |
| berlin52 | 52 | 7,542 | 0.05679 s | 2 | 7 |
| st70 | 70 | 675 | 0.54311 s | 5 | 24 |
| kroA100 | 100 | 21,282 | 2.90174 s | 8 | 44 |

All objectives and reconstructed tours were independently replayed against the declared benchmark optima.

## Comb closure

The two fractional SEC residuals from loops 713–812 each close with one standard odd edge-comb inequality:

```text
clustered-2301: value 82, 8 fractional edges → integral optimum 82
euclidean-1302: value 326.749, 6 fractional edges → integral optimum 327.627
```

But the finite exhaustive comb separator was slower than the integer SEC cutting plane on both cases. Thus:

```text
deterministic structural closure exists
≠
that separator is the fastest exact route
```

## Method routing falsification

A preregistered warm crossover selected:

```text
n <= 9  → fast MST state search
n >= 10 → integer SEC cutting plane
```

On a fresh 16-instance holdout:

```text
always-fast total       0.43463 s
always-integer total    0.08579 s
frozen portfolio total  0.08836 s
```

The portfolio was correct but 2.99% slower than always using integer SEC. That non-win is retained. Current machine-local recommendation: use integer SEC by default; reserve the state search for the tiniest warm instances.

## City / neighborhood / address contribution

Ten preregistered 60-address cities contained six declared neighborhoods of ten addresses. Preseeding the valid cuts

```text
x(delta(neighborhood)) >= 2
```

produced:

```text
unseeded total median        2.37173 s
seeded total median          1.75679 s
aggregate ratio                 1.350×
MILP solve-count reduction          13
per-instance wins                  6/10
```

The cuts do not assume contiguous neighborhood visitation. Four instances slowed down, so neighborhood seeding is a useful exact-cut prior in some cases, not a universal accelerator.

## Cold-start boundary

Fresh-process medians were approximately:

```text
gr21       3.227 s
berlin52   3.229 s
kroA100    5.941 s
```

For these sizes, one-shot CLI latency is dominated by imports. Warm service and Postgres-backed execution therefore have a materially different profile.

## Claims not made

```text
P = NP                                  false
polynomial TSP normalization            false
state-of-the-art TSP solver             false
Concorde superiority                    false
universal neighborhood acceleration    false
cross-machine timing comparability      false
new semantic primitive required        false
```

## Next edge

The next useful campaign should target larger or harder instances where integer SEC no longer closes quickly, profile the first genuine internal branch nodes, and preregister a selector for semantic neighborhood cuts.
