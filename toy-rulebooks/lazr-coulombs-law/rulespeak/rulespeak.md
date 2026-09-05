# 📘 lazr-coulombs-law — RuleSpeak®

_Digital mirror of Coulomb's Law of electrostatics. Entities: Charges, ChargeInteractions, ForceComponents, ElectricFields. Force magnitude, direction, attraction/repulsion, electric field strength, and field superposition all fall out of the DAG as derived facts — never modeled directly._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **Loop** | A loop is identified by its name. | — |
| Name | The same as its loop ID. | _Display label._ |
| Title | A defined attribute. | _Short title for what this loop adds._ |
| Status | A defined attribute. | _planned \| in-progress \| complete_ |
| New Concept | A defined attribute. | _The new first-class domain concept introduced this loop._ |
| Domain Question | A defined attribute. | _The natural-language question this loop's concept answers._ |
| Mock Data Note | A defined attribute. | _What the seed data is designed to show._ |
| Next Suggestion | A defined attribute. | _Suggestion for the next loop._ |
| Commit Hash | A defined attribute. | _Git SHA where this loop first landed._ |
| Commit Date | A defined attribute. | _ISO date of the commit._ |
| **Physics Constant** | A physics constant is identified by its name. | — |
| Name | A defined attribute. | _Human-readable name_ |
| Symbol | A defined attribute. | _Physics symbol (k, e, a₀, …)_ |
| Value | A defined attribute. | _Numeric value in SI units_ |
| Units | A defined attribute. | _SI unit string_ |
| Description | A defined attribute. | _What this constant represents_ |
| **Particle** | A particle is identified by its name. | — |
| Name | A defined attribute. | _Common name (Proton, Electron, …)_ |
| Canonical Charge | A defined attribute. | _Charge in Coulombs (positive or negative)_ |
| Canonical Mass | A defined attribute. | _Rest mass in kg_ |
| Charge Sign | Determined by priority: “positive” if the canonical charge is greater than 0; “negative” if the canonical charge is less than 0; in all other cases, “neutral”. | _positive \| negative \| neutral_ |
| Description | A defined attribute. | _Physical description_ |
| **Charge** | A charge is identified by its name. | — |
| Name | A defined attribute. | _Human-readable label (Proton A, Electron B, …)_ |
| System ID | A defined attribute. | _FK → Systems.SystemId — which physical system this charge belongs to_ |
| Particle ID | A defined attribute. | _FK → Particles.ParticleId — archetype (optional)_ |
| Charge Value | A defined attribute. | _Charge in Coulombs (signed: positive or negative)_ |
| Position X | A defined attribute. | _X coordinate in meters_ |
| Position Y | A defined attribute. | _Y coordinate in meters_ |
| Position Z | A defined attribute. | _Z coordinate in meters_ |
| Mass | A defined attribute. | _Mass in kg (null = massless / not tracked)_ |
| Charge Sign | Determined by priority: “positive” if the charge value is greater than 0; “negative” if the charge value is less than 0; in all other cases, “neutral”. | _positive \| negative \| neutral_ |
| Charge Magnitude | Computed as the absolute value of the charge value. | _Absolute value of ChargeValue in Coulombs_ |
| System Name | The value of LOOKUP(SystemId, Systems[SystemId], Systems[Name]). | _Lookup: Systems.Name via SystemId._ |
| Particle Name | The value of LOOKUP(ParticleId, Particles[ParticleId], Particles[Name]). | _Lookup: Particles.Name via ParticleId._ |
| Interaction Count | The number of charge interactions related to the charge. | _Count of ChargeInteractions that reference this charge as Charge1 or Charge2._ |
| **System** | A system is identified by its name. | — |
| Name | A defined attribute. | _Human-readable name_ |
| Description | A defined attribute. | _What physical situation this represents_ |
| Is Synthetic | True when an empty string. | _True if this is a constructed example; false if from real measurements_ |
| Charge Count | The number of charges related to the system. | _Number of charges in this system._ |
| Interaction Count | The number of charge interactions related to the system. | _Number of pairwise interactions in this system._ |
| Attractive Count | The number of the system's charge interactions that are attractive. | _Count of attractive interactions in this system._ |
| Repulsive Count | The number of the system's charge interactions that are repulsive. | _Count of repulsive interactions in this system._ |
| Total Charge | The total charge value across the charges related to the system. | _Algebraic sum of all charges in the system (net charge)._ |
| Is Neutral | True when the value of ABS(TotalCharge) < 1e-30. | _True when net charge is effectively zero._ |
| Max Force Magnitude | The largest force magnitude across the charge interactions related to the system. | _Strongest pairwise interaction in this system._ |
| **Charge Interaction** | A charge interaction is identified by its name. | — |
| Name | The same as its interaction ID. | _Display label._ |
| System ID | A defined attribute. | _FK → Systems.SystemId_ |
| Charge1 ID | A defined attribute. | _FK → Charges.ChargeId (first particle)_ |
| Charge2 ID | A defined attribute. | _FK → Charges.ChargeId (second particle)_ |
| Charge1 Label | A defined attribute. | _Human label copied from Charges.Name at seed time_ |
| Charge2 Label | A defined attribute. | _Human label copied from Charges.Name at seed time_ |
| Q1 | A defined attribute. | _Charge value of Charge1 in Coulombs (copied from Charges.ChargeValue)_ |
| Q2 | A defined attribute. | _Charge value of Charge2 in Coulombs (copied from Charges.ChargeValue)_ |
| X1 | A defined attribute. | _X position of Charge1 in meters (copied from Charges.PositionX)_ |
| Y1 | A defined attribute. | _Y position of Charge1 in meters (copied from Charges.PositionY)_ |
| Z1 | A defined attribute. | _Z position of Charge1 in meters (copied from Charges.PositionZ)_ |
| X2 | A defined attribute. | _X position of Charge2 in meters (copied from Charges.PositionX)_ |
| Y2 | A defined attribute. | _Y position of Charge2 in meters (copied from Charges.PositionY)_ |
| Z2 | A defined attribute. | _Z position of Charge2 in meters (copied from Charges.PositionZ)_ |
| Coulomb K | A defined attribute. | _Coulomb's constant: 8.99×10⁹ N·m²·C⁻². Stored per-row so the formula is self-contained._ |
| Delta X | Computed as the x2 minus the x1. | _X2 − X1: displacement in X from Charge1 to Charge2 in meters._ |
| Delta Y | Computed as the y2 minus the y1. | _Y2 − Y1: displacement in Y from Charge1 to Charge2 in meters._ |
| Delta Z | Computed as the z2 minus the z1. | _Z2 − Z1: displacement in Z from Charge1 to Charge2 in meters._ |
| Distance Squared | Computed as the delta x times the delta x plus the delta y times the delta y plus the delta z times the delta z. | _r² = ΔX² + ΔY² + ΔZ² in m². Intermediate value for Coulomb's Law._ |
| Distance Meters | Computed as the square root of the distance squared. | _r = √(r²): charge separation in meters._ |
| Distance Picometers | Computed as the distance meters times 1000000000000. | _Distance expressed in picometers (r × 10¹²). Human-readable at atomic scale._ |
| Charge Product | Computed as the q1 times the q2. | _q₁ · q₂ (signed). Positive → same-sign charges (repulsive). Negative → opposite-sign (attractive)._ |
| Force Magnitude | Computed as the coulomb k times the absolute value of the charge product divided by the distance squared. | _F = k · \|q₁ · q₂\| / r² in Newtons. This is Coulomb's Law._ |
| Is Attractive | True when the charge product is less than 0. | _True when charges have opposite signs (ChargeProduct < 0). Force pulls the particles together._ |
| Is Repulsive | True when the charge product is greater than 0. | _True when charges have the same sign (ChargeProduct > 0). Force pushes the particles apart._ |
| Interaction Type | Determined by priority: “attractive” if the attractive flag is set; “repulsive” if the repulsive flag is set; in all other cases, “neutral”. | _attractive \| repulsive \| neutral — derived from sign of ChargeProduct._ |
| Force in Atto Newtons | Computed as the force magnitude times 1000000000000000000. | _ForceMagnitude expressed in attonewtons (F × 10¹⁸). Human-readable at atomic scale._ |
| **Force Vector** | A force vector is identified by its name. | — |
| Name | The same as its force vector ID. | _Display label._ |
| Interaction ID | A defined attribute. | _FK → ChargeInteractions.InteractionId_ |
| Force Magnitude Raw | A defined attribute. | _Scalar force magnitude in Newtons (copied from ChargeInteractions.ForceMagnitude)_ |
| DX | A defined attribute. | _ΔX = X2 − X1 in meters (copied from ChargeInteractions.DeltaX)_ |
| DY | A defined attribute. | _ΔY = Y2 − Y1 in meters (copied from ChargeInteractions.DeltaY)_ |
| DZ | A defined attribute. | _ΔZ = Z2 − Z1 in meters (copied from ChargeInteractions.DeltaZ)_ |
| Dist Raw | A defined attribute. | _Separation distance r in meters (copied from ChargeInteractions.DistanceMeters)_ |
| Is Attractive Raw | True when an empty string. | _Attraction flag (copied from ChargeInteractions.IsAttractive)_ |
| Unit X | Determined by priority: 0 if the dist raw is 0; in all other cases, the DX divided by the dist raw. | _X component of the displacement unit vector r̂ = ΔX/r._ |
| Unit Y | Determined by priority: 0 if the dist raw is 0; in all other cases, the DY divided by the dist raw. | _Y component of the displacement unit vector ΔY/r._ |
| Unit Z | Determined by priority: 0 if the dist raw is 0; in all other cases, the DZ divided by the dist raw. | _Z component of the displacement unit vector ΔZ/r._ |
| Sign Factor | Determined by priority: the negative of 1 if the attractive raw flag is set; in all other cases, 1. | _+1 if repulsive (C1 pushed away from C2); −1 if attractive (C1 pulled toward C2)._ |
| FX | Computed as the force magnitude raw times the sign factor times the unit x. | _X component of force on Charge1 in Newtons. Positive = net force in +X direction._ |
| FY | Computed as the force magnitude raw times the sign factor times the unit y. | _Y component of force on Charge1 in Newtons._ |
| FZ | Computed as the force magnitude raw times the sign factor times the unit z. | _Z component of force on Charge1 in Newtons._ |
| Force Dir Description | Determined by priority: “towards” if the attractive raw flag is set; in all other cases, “away-from”. | _towards (attractive) \| away-from (repulsive)._ |
| **Electric Field Point** | An electric field point is identified by its name. | — |
| Name | The same as its field point ID. | _Display label._ |
| System ID | A defined attribute. | _FK → Systems.SystemId_ |
| Source Charge ID | A defined attribute. | _FK → Charges.ChargeId — the charge creating this field contribution_ |
| Source Charge Name | A defined attribute. | _Human label of source charge (copied from Charges.Name)_ |
| Observation Label | A defined attribute. | _Human label for the observation point (midpoint, centroid, etc.)_ |
| Obs X | A defined attribute. | _Observation point X coordinate in meters_ |
| Obs Y | A defined attribute. | _Observation point Y coordinate in meters_ |
| Obs Z | A defined attribute. | _Observation point Z coordinate in meters_ |
| Coulomb K | A defined attribute. | _Coulomb's constant per-row (8.99×10⁹ N·m²·C⁻²)_ |
| Source Q | A defined attribute. | _Charge value of source charge in Coulombs (copied from Charges.ChargeValue)_ |
| Src X | A defined attribute. | _X position of source charge in meters (copied from Charges.PositionX)_ |
| Src Y | A defined attribute. | _Y position of source charge in meters (copied from Charges.PositionY)_ |
| Src Z | A defined attribute. | _Z position of source charge in meters (copied from Charges.PositionZ)_ |
| d X | Computed as the obs x minus the src x. | _ObsX − SrcX: displacement from source to observation point._ |
| d Y | Computed as the obs y minus the src y. | _ObsY − SrcY: displacement in Y._ |
| d Z | Computed as the obs z minus the src z. | _ObsZ − SrcZ: displacement in Z._ |
| Distance Squared | Computed as the d x times the d x plus the d y times the d y plus the d z times the d z. | _r² = dX² + dY² + dZ²._ |
| Distance | Computed as the square root of the distance squared. | _r = √(r²): distance from source charge to observation point._ |
| E Field Magnitude | Computed as the coulomb k times the absolute value of the source q divided by the distance squared. | _E = k·\|q\|/r²: electric field strength at observation point due to this source charge in N/C._ |
| Q Sign | Determined by priority: 1 if the source q is greater than 0; in all other cases, the negative of 1. | _Sign of source charge: +1 for positive, −1 for negative. Field points away from positive, toward negative._ |
| EX | Computed as the e field magnitude times the q sign times the d x divided by the distance. | _X component of electric field contribution at observation point (N/C). Positive = points in +X direction._ |
| EY | Computed as the e field magnitude times the q sign times the d y divided by the distance. | _Y component of electric field contribution._ |
| EZ | Computed as the e field magnitude times the q sign times the d z divided by the distance. | _Z component of electric field contribution._ |
| **Invariant Check** | An invariant check is identified by its name. | — |
| Name | The same as its invariant ID. | _Display label._ |
| Algebraic Statement | A defined attribute. | _The mathematical identity being checked_ |
| Natural Language | A defined attribute. | _Plain English: what must be true?_ |
| Physics Law | A defined attribute. | _Which physics principle this invariant encodes_ |
| Severity | A defined attribute. | _critical \| warning \| informational_ |
| **System Summary** | A system summary is identified by its name. | — |
| Name | The same as its summary ID. | _Display label._ |
| System ID | A defined attribute. | _FK → Systems.SystemId_ |
| System Name | The value of LOOKUP(SystemId, Systems[SystemId], Systems[Name]). | _Lookup: Systems.Name._ |
| Charge Count | The number of charges related to the system summary. | _Total charges in this system._ |
| Interaction Count | The number of charge interactions related to the system summary. | _Total pairwise interactions._ |
| Attractive Count | The number of the system summary's charge interactions that are attractive. | _Count of attractive interactions._ |
| Repulsive Count | The number of the system summary's charge interactions that are repulsive. | _Count of repulsive interactions._ |
| Total Charge | The total charge value across the charges related to the system summary. | _Net algebraic charge across all charges in the system._ |
| Is Neutral | True when the value of ABS(TotalCharge) < 1e-30. | _True when \|TotalCharge\| < 1e-30._ |
| Max Force Magnitude | The largest force magnitude across the charge interactions related to the system summary. | _Strongest pairwise interaction in Newtons._ |
| Min Distance Meters | The smallest distance meters across the charge interactions related to the system summary. | _Closest pair separation in meters._ |
| All Attractive | True when the attractive count is the interaction count. | _True when every interaction in the system is attractive._ |
| All Repulsive | True when the repulsive count is the interaction count. | _True when every interaction in the system is repulsive._ |
| Has Mixed Interactions | True when all of the following hold: the attractive count is greater than 0 and the repulsive count is greater than 0. | _True when the system has both attractive and repulsive interactions._ |

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A loop **must** have a title and a status.
- A physics constant **must** have a name, a symbol, a value, and an units.
- A particle **must** have a name, a canonical charge, and a canonical mass.
- A charge **must** have a name, a system ID, a charge value, a position x, a position y, and a position z.
- A system **must** have a name, and record whether it is synthetic.
- A charge interaction **must** have a system ID, a charge1 ID, a charge2 ID, a q1, a q2, a x1, a y1, a z1, a x2, a y2, a z2, and a coulomb k.
- A force vector **must** have an interaction ID, a force magnitude raw, a DX, a DY, a DZ, and a dist raw, and record whether it is an attractive raw.
- An electric field point **must** have a system ID, a source charge ID, an observation label, an obs x, an obs y, an obs z, a coulomb k, a source q, a src x, a src y, and a src z.
- An invariant check **must** have an algebraic statement, a natural language, and a severity.
- A system summary **must** have a system ID.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Name** | A loop's name is the same as its loop ID. |
| **DR-2 Charge Sign** | The particle's charge sign is determined by the following priority:<br>1. “positive”, if the canonical charge is greater than 0;<br>2. “negative”, if the canonical charge is less than 0;<br>3. in all other cases, “neutral”. |
| **DR-3 Charge Sign** | The charge's charge sign is determined by the following priority:<br>1. “positive”, if the charge value is greater than 0;<br>2. “negative”, if the charge value is less than 0;<br>3. in all other cases, “neutral”. |
| **DR-4 Charge Magnitude** | A charge's charge magnitude is computed as the absolute value of the charge value. |
| **DR-5 System Name** | A charge's system name is the value of LOOKUP(SystemId, Systems[SystemId], Systems[Name]). |
| **DR-6 Particle Name** | A charge's particle name is the value of LOOKUP(ParticleId, Particles[ParticleId], Particles[Name]). |
| **DR-7 Interaction Count** | A charge's interaction count is the number of charge interactions related to the charge. |
| **DR-8 Charge Count** | A system's charge count is the number of charges related to the system. |
| **DR-9 Interaction Count** | A system's interaction count is the number of charge interactions related to the system. |
| **DR-10 Attractive Count** | A system's attractive count is the number of the system's charge interactions that are attractive. |
| **DR-11 Repulsive Count** | A system's repulsive count is the number of the system's charge interactions that are repulsive. |
| **DR-12 Total Charge** | A system's total charge is the total charge value across the charges related to the system. |
| **DR-13 Is Neutral** | A system is considered a neutral if the value of ABS(TotalCharge) < 1e-30. |
| **DR-14 Max Force Magnitude** | A system's max force magnitude is the largest force magnitude across the charge interactions related to the system. |
| **DR-15 Name** | A charge interaction's name is the same as its interaction ID. |
| **DR-16 Delta X** | A charge interaction's delta x is computed as the x2 minus the x1. |
| **DR-17 Delta Y** | A charge interaction's delta y is computed as the y2 minus the y1. |
| **DR-18 Delta Z** | A charge interaction's delta z is computed as the z2 minus the z1. |
| **DR-19 Distance Squared** | A charge interaction's distance squared is computed as the delta x times the delta x plus the delta y times the delta y plus the delta z times the delta z. |
| **DR-20 Distance Meters** | A charge interaction's distance meters is computed as the square root of the distance squared. |
| **DR-21 Distance Picometers** | A charge interaction's distance picometers is computed as the distance meters times 1000000000000. |
| **DR-22 Charge Product** | A charge interaction's charge product is computed as the q1 times the q2. |
| **DR-23 Force Magnitude** | A charge interaction's force magnitude is computed as the coulomb k times the absolute value of the charge product divided by the distance squared. |
| **DR-24 Is Attractive** | A charge interaction is considered attractive if the charge product is less than 0. |
| **DR-25 Is Repulsive** | A charge interaction is considered repulsive if the charge product is greater than 0. |
| **DR-26 Interaction Type** | The charge interaction's interaction type is determined by the following priority:<br>1. “attractive”, if the attractive flag is set;<br>2. “repulsive”, if the repulsive flag is set;<br>3. in all other cases, “neutral”. |
| **DR-27 Force in Atto Newtons** | A charge interaction's force in atto newtons is computed as the force magnitude times 1000000000000000000. |
| **DR-28 Name** | A force vector's name is the same as its force vector ID. |
| **DR-29 Unit X** | The force vector's unit x is determined by the following priority:<br>1. 0, if the dist raw is 0;<br>2. in all other cases, the DX divided by the dist raw. |
| **DR-30 Unit Y** | The force vector's unit y is determined by the following priority:<br>1. 0, if the dist raw is 0;<br>2. in all other cases, the DY divided by the dist raw. |
| **DR-31 Unit Z** | The force vector's unit z is determined by the following priority:<br>1. 0, if the dist raw is 0;<br>2. in all other cases, the DZ divided by the dist raw. |
| **DR-32 Sign Factor** | The force vector's sign factor is determined by the following priority:<br>1. the negative of 1, if the attractive raw flag is set;<br>2. in all other cases, 1. |
| **DR-33 FX** | A force vector's FX is computed as the force magnitude raw times the sign factor times the unit x. |
| **DR-34 FY** | A force vector's FY is computed as the force magnitude raw times the sign factor times the unit y. |
| **DR-35 FZ** | A force vector's FZ is computed as the force magnitude raw times the sign factor times the unit z. |
| **DR-36 Force Dir Description** | The force vector's force dir description is determined by the following priority:<br>1. “towards”, if the attractive raw flag is set;<br>2. in all other cases, “away-from”. |
| **DR-37 Name** | An electric field point's name is the same as its field point ID. |
| **DR-38 d X** | An electric field point's d x is computed as the obs x minus the src x. |
| **DR-39 d Y** | An electric field point's d y is computed as the obs y minus the src y. |
| **DR-40 d Z** | An electric field point's d z is computed as the obs z minus the src z. |
| **DR-41 Distance Squared** | An electric field point's distance squared is computed as the d x times the d x plus the d y times the d y plus the d z times the d z. |
| **DR-42 Distance** | An electric field point's distance is computed as the square root of the distance squared. |
| **DR-43 E Field Magnitude** | An electric field point's e field magnitude is computed as the coulomb k times the absolute value of the source q divided by the distance squared. |
| **DR-44 Q Sign** | The electric field point's q sign is determined by the following priority:<br>1. 1, if the source q is greater than 0;<br>2. in all other cases, the negative of 1. |
| **DR-45 EX** | An electric field point's EX is computed as the e field magnitude times the q sign times the d x divided by the distance. |
| **DR-46 EY** | An electric field point's EY is computed as the e field magnitude times the q sign times the d y divided by the distance. |
| **DR-47 EZ** | An electric field point's EZ is computed as the e field magnitude times the q sign times the d z divided by the distance. |
| **DR-48 Name** | An invariant check's name is the same as its invariant ID. |
| **DR-49 Name** | A system summary's name is the same as its summary ID. |
| **DR-50 System Name** | A system summary's system name is the value of LOOKUP(SystemId, Systems[SystemId], Systems[Name]). |
| **DR-51 Charge Count** | A system summary's charge count is the number of charges related to the system summary. |
| **DR-52 Interaction Count** | A system summary's interaction count is the number of charge interactions related to the system summary. |
| **DR-53 Attractive Count** | A system summary's attractive count is the number of the system summary's charge interactions that are attractive. |
| **DR-54 Repulsive Count** | A system summary's repulsive count is the number of the system summary's charge interactions that are repulsive. |
| **DR-55 Total Charge** | A system summary's total charge is the total charge value across the charges related to the system summary. |
| **DR-56 Is Neutral** | A system summary is considered a neutral if the value of ABS(TotalCharge) < 1e-30. |
| **DR-57 Max Force Magnitude** | A system summary's max force magnitude is the largest force magnitude across the charge interactions related to the system summary. |
| **DR-58 Min Distance Meters** | A system summary's min distance meters is the smallest distance meters across the charge interactions related to the system summary. |
| **DR-59 All Attractive** | A system summary is flagged all attractive if the attractive count is the interaction count. |
| **DR-60 All Repulsive** | A system summary is flagged all repulsive if the repulsive count is the interaction count. |
| **DR-61 Has Mixed Interactions** | A system summary is considered to have a mixed interactions if all of the following hold: the attractive count is greater than 0 and the repulsive count is greater than 0. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **Loops.Name** | formula | `LoopId` |
| **Particles.ChargeSign** | formula | `If(CanonicalCharge > 0, "positive", If(CanonicalCharge < 0, "negative", "neutral"))` |
| **Charges.ChargeSign** | formula | `If(ChargeValue > 0, "positive", If(ChargeValue < 0, "negative", "neutral"))` |
| **Charges.ChargeMagnitude** | formula | `Abs(ChargeValue)` |
| **Charges.SystemName** | lookup | `LOOKUP(SystemId, Systems[SystemId], Systems[Name])` |
| **Charges.ParticleName** | lookup | `LOOKUP(ParticleId, Particles[ParticleId], Particles[Name])` |
| **Charges.InteractionCount** | rollup | `Count(ChargeInteractions via Charge1Id)` |
| **Systems.ChargeCount** | rollup | `Count(Charges via SystemId)` |
| **Systems.InteractionCount** | rollup | `Count(ChargeInteractions via SystemId)` |
| **Systems.AttractiveCount** | rollup | `Count(ChargeInteractions via SystemId)` |
| **Systems.RepulsiveCount** | rollup | `Count(ChargeInteractions via SystemId)` |
| **Systems.TotalCharge** | rollup | `Sum(Charges.ChargeValue via SystemId)` |
| **Systems.IsNeutral** | formula | `ABS(TotalCharge) < 1e-30` |
| **Systems.MaxForceMagnitude** | rollup | `Max(ChargeInteractions.ForceMagnitude via SystemId)` |
| **ChargeInteractions.Name** | formula | `InteractionId` |
| **ChargeInteractions.DeltaX** | formula | `X2 - X1` |
| **ChargeInteractions.DeltaY** | formula | `Y2 - Y1` |
| **ChargeInteractions.DeltaZ** | formula | `Z2 - Z1` |
| **ChargeInteractions.DistanceSquared** | formula | `DeltaX * DeltaX + DeltaY * DeltaY + DeltaZ * DeltaZ` |
| **ChargeInteractions.DistanceMeters** | formula | `Sqrt(DistanceSquared)` |
| **ChargeInteractions.DistancePicometers** | formula | `DistanceMeters * 1000000000000` |
| **ChargeInteractions.ChargeProduct** | formula | `Q1 * Q2` |
| **ChargeInteractions.ForceMagnitude** | formula | `CoulombK * Abs(ChargeProduct) / DistanceSquared` |
| **ChargeInteractions.IsAttractive** | formula | `ChargeProduct < 0` |
| **ChargeInteractions.IsRepulsive** | formula | `ChargeProduct > 0` |
| **ChargeInteractions.InteractionType** | formula | `If(IsAttractive, "attractive", If(IsRepulsive, "repulsive", "neutral"))` |
| **ChargeInteractions.ForceInAttoNewtons** | formula | `ForceMagnitude * 1000000000000000000` |
| **ForceVectors.Name** | formula | `ForceVectorId` |
| **ForceVectors.UnitX** | formula | `If(DistRaw = 0, 0, DX / DistRaw)` |
| **ForceVectors.UnitY** | formula | `If(DistRaw = 0, 0, DY / DistRaw)` |
| **ForceVectors.UnitZ** | formula | `If(DistRaw = 0, 0, DZ / DistRaw)` |
| **ForceVectors.SignFactor** | formula | `If(IsAttractiveRaw, -1, 1)` |
| **ForceVectors.FX** | formula | `ForceMagnitudeRaw * SignFactor * UnitX` |
| **ForceVectors.FY** | formula | `ForceMagnitudeRaw * SignFactor * UnitY` |
| **ForceVectors.FZ** | formula | `ForceMagnitudeRaw * SignFactor * UnitZ` |
| **ForceVectors.ForceDirDescription** | formula | `If(IsAttractiveRaw, "towards", "away-from")` |
| **ElectricFieldPoints.Name** | formula | `FieldPointId` |
| **ElectricFieldPoints.dX** | formula | `ObsX - SrcX` |
| **ElectricFieldPoints.dY** | formula | `ObsY - SrcY` |
| **ElectricFieldPoints.dZ** | formula | `ObsZ - SrcZ` |
| **ElectricFieldPoints.DistanceSquared** | formula | `dX * dX + dY * dY + dZ * dZ` |
| **ElectricFieldPoints.Distance** | formula | `Sqrt(DistanceSquared)` |
| **ElectricFieldPoints.EFieldMagnitude** | formula | `CoulombK * Abs(SourceQ) / DistanceSquared` |
| **ElectricFieldPoints.QSign** | formula | `If(SourceQ > 0, 1, -1)` |
| **ElectricFieldPoints.EX** | formula | `EFieldMagnitude * QSign * dX / Distance` |
| **ElectricFieldPoints.EY** | formula | `EFieldMagnitude * QSign * dY / Distance` |
| **ElectricFieldPoints.EZ** | formula | `EFieldMagnitude * QSign * dZ / Distance` |
| **InvariantChecks.Name** | formula | `InvariantId` |
| **SystemSummary.Name** | formula | `SummaryId` |
| **SystemSummary.SystemName** | lookup | `LOOKUP(SystemId, Systems[SystemId], Systems[Name])` |
| **SystemSummary.ChargeCount** | rollup | `Count(Charges via SystemId)` |
| **SystemSummary.InteractionCount** | rollup | `Count(ChargeInteractions via SystemId)` |
| **SystemSummary.AttractiveCount** | rollup | `Count(ChargeInteractions via SystemId)` |
| **SystemSummary.RepulsiveCount** | rollup | `Count(ChargeInteractions via SystemId)` |
| **SystemSummary.TotalCharge** | rollup | `Sum(Charges.ChargeValue via SystemId)` |
| **SystemSummary.IsNeutral** | formula | `ABS(TotalCharge) < 1e-30` |
| **SystemSummary.MaxForceMagnitude** | rollup | `Max(ChargeInteractions.ForceMagnitude via SystemId)` |
| **SystemSummary.MinDistanceMeters** | rollup | `Min(ChargeInteractions.DistanceMeters via SystemId)` |
| **SystemSummary.AllAttractive** | formula | `AttractiveCount = InteractionCount` |
| **SystemSummary.AllRepulsive** | formula | `RepulsiveCount = InteractionCount` |
| **SystemSummary.HasMixedInteractions** | formula | `And(AttractiveCount > 0, RepulsiveCount > 0)` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
