# 📘 bit-calculator — RuleSpeak

_A 4-bit ripple-carry adder as pure rulebook data. 29 wires + 12 gate truth rows. Every result bit is a LOOKUP into a gate truth table keyed on the two driver wires' own computed bits. No arithmetic is stored and no bespoke function exists: ComputedBit is a plain Excel IF over two INDEX/MATCH lookups that recurse down the AWire/BWire self-FKs to the seeded inputs._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Gate Type** | A gate type is identified by its name. | — |
| **Gate Truth Row** | A gate truth row is identified by its name and is related to a gate type (its gate). | — |
| Name | The same as its truth row name. | _Name_ |
| **Wire** | A wire is identified by its name and is related to optionally a gate type (its gate); optionally another wire (its a wire); and optionally another wire (its b wire). | — |
| Name | The same as its wire name. | _Name_ |
| A Bit | The computed bit of the wire's a wire. | _The left driver wire's computed bit. Blank when this wire has no driver (a seeded input)._ |
| B Bit | The computed bit of the wire's b wire. | _The right driver wire's computed bit. Blank when this wire has no driver (a seeded input)._ |
| Truth Key | Determined by priority: the gate, followed by “|”, followed by the a bit, followed by “|”, followed by the b bit if the gate has a value; in all other cases, an empty string. | _Gate plus its two settled input bits; blank on a seeded input wire (no gate)._ |
| Gate Out | The out bit of the wire's truth key. | _The gate's output bit from the truth table; blank on a seeded input wire (no gate)._ |
| Computed Bit | Determined by priority: the seeded bit if the seeded bit has a value; in all other cases, the gate out. | _THE ANSWER for this wire: its seeded bit if an input, else its gate's output._ |
| A Depth | The depth of the wire's a wire if the a wire has a value, in all other cases 0. | _Left driver's depth; 0 when there is no driver._ |
| B Depth | The depth of the wire's b wire if the b wire has a value, in all other cases 0. | _Right driver's depth; 0 when there is no driver._ |
| Depth | Determined by priority: 0 if the seeded bit has a value; in all other cases, 1 plus the largest of the a depth and the b depth. | _Logic level: 0 for inputs, else one deeper than its deepest driver. The DAG computing its own depth._ |

## 2 Fact Types

- a **gate truth row** references exactly one **gate type**
- a **wire** may reference one **gate type**
- a **wire** may reference one **wire**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A gate truth row **must** reference exactly one gate type as its gate.
- A gate truth row **must** have an in0, an in1, and an out bit.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A gate truth row's name is the same as its truth row name. |
| **DR-2 Name** | A wire's name is the same as its wire name. |
| **DR-3 A Bit** | A wire's a bit is the computed bit of the wire's a wire. |
| **DR-4 B Bit** | A wire's b bit is the computed bit of the wire's b wire. |
| **DR-5 Truth Key** | The wire's truth key is determined by the following priority:<br>1. the gate, followed by “|”, followed by the a bit, followed by “|”, followed by the b bit, if the gate has a value;<br>2. in all other cases, an empty string. |
| **DR-6 Gate Out** | A wire's gate out is the out bit of the wire's truth key. |
| **DR-7 Computed Bit** | The wire's computed bit is determined by the following priority:<br>1. the seeded bit, if the seeded bit has a value;<br>2. in all other cases, the gate out. |
| **DR-8 A Depth** | A wire's a depth is the depth of the wire's a wire if the a wire has a value, in all other cases 0. |
| **DR-9 B Depth** | A wire's b depth is the depth of the wire's b wire if the b wire has a value, in all other cases 0. |
| **DR-10 Depth** | The wire's depth is determined by the following priority:<br>1. 0, if the seeded bit has a value;<br>2. in all other cases, 1 plus the largest of the a depth and the b depth. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **GateTruthRows.Name** | formula | `TruthRowName` |
| **Wires.Name** | formula | `WireName` |
| **Wires.ABit** | lookup | `If(AWire <> "", Lookup(Wires.ComputedBit via AWire), "")` |
| **Wires.BBit** | lookup | `If(BWire <> "", Lookup(Wires.ComputedBit via BWire), "")` |
| **Wires.TruthKey** | formula | `If(Gate <> "", Concat(Gate, "\|", ABit, "\|", BBit), "")` |
| **Wires.GateOut** | lookup | `If(Gate <> "", Lookup(GateTruthRows.OutBit via TruthKey), "")` |
| **Wires.ComputedBit** | formula | `If(SeededBit <> "", SeededBit, GateOut)` |
| **Wires.ADepth** | lookup | `If(AWire <> "", Lookup(Wires.Depth via AWire), 0)` |
| **Wires.BDepth** | lookup | `If(BWire <> "", Lookup(Wires.Depth via BWire), 0)` |
| **Wires.Depth** | formula | `If(SeededBit <> "", 0, 1 + Max(ADepth, BDepth))` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
