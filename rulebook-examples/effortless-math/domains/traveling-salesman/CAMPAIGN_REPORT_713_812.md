# TSP loops 713–812 — external search and cut ladder

This report is generated from the content-addressed campaign evidence. Ten named TSPLIB instances were preregistered before execution; the active semantic vocabulary remained frozen.

## Aggregate

```text
instances                         10
value closed                      9
feasible optimum witnessed        10
basic path-state proofs           6
path-state caps preserved         4
one-tree value closures           7
SEC integral root closures        7
simple-comb integral closures     8
fractional but value-closed       1
value branches still required     1
new active semantic terms         0
```

## Per instance

| Instance | n | Opt | Constructive | Best feasible | Path status | Quotient states | % HK states | 1-tree ceil | SEC | Comb | Value |
|---|---:|---:|---:|---:|---|---:|---:|---:|---|---|---|
| burma14 | 14 | 3323 | 3323 | 3323 | PROVED | 2,498 | 4.69126% | 3323 | 3323 integral | 3323 integral | closed |
| ulysses16 | 16 | 6859 | 6859 | 6859 | PROVED | 60,421 | 24.5854% | 6859 | 6859 integral | 6859 integral | closed |
| gr17 | 17 | 2085 | 2085 | 2085 | PROVED | 21,353 | 4.07276% | 2085 | 2085 integral | 2085 integral | closed |
| gr21 | 21 | 2707 | 2707 | 2707 | PROVED | 4,352 | 0.0415039% | 2707 | 2707 integral | 2707 integral | closed |
| ulysses22 | 22 | 7013 | 7013 | 7013 | STATE_CAP | 212,768 | 0.966245% | 7013 | 7013 integral | 7013 integral | closed |
| gr24 | 24 | 1272 | 1272 | 1272 | PROVED | 22,398 | 0.0232178% | 1272 | 1272 integral | 1272 integral | closed |
| fri26 | 26 | 937 | 937 | 937 | PROVED | 20,038 | 0.00477743% | 937 | 937 integral | 937 integral | closed |
| bayg29 | 29 | 1610 | 1610 | 1610 | TIME_CAP | 62,005 | 0.0016499% | 1608 | 1608 fractional | 1610 integral | closed |
| bays29 | 29 | 2020 | 2020 | 2020 | STATE_CAP | 86,043 | 0.00228954% | 2014 | 2013.5 fractional | 2019.33 fractional | closed |
| dantzig42 | 42 | 699 | 699 | 699 | TIME_CAP | 19,472 | 4.31943e-08% | 697 | 697 fractional | 697.667 fractional | open |

## Interpretation

The basic MST-envelope path-state engine remains useful but does not dominate the ladder. Standard subtour-elimination cuts close more root relaxations, and the witnessed simple 2-matching comb family closes an additional integral case while tightening another fractional case enough for an integer value sandwich. A fractional LP witness may therefore coexist with a closed optimum value.

The campaign does not claim superiority over Concorde or mature branch-and-cut implementations. It measures which obligations close under a small, explicit, replayable method portfolio and preserves every cap or fractional residue.

## Remaining frontier

- larger TSPLIB instances requiring genuine branching after cut closure
- independent exact verification of numerical LP dual certificates
- wall-clock and memory comparison with mature branch-and-cut solvers
- stronger general comb and blossom separation beyond the witnessed simple family
