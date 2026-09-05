A Mechanical Kitchen Timer — 5 Moving Parts
1. The Winding Knob (input)
The dial on the front. The user rotates it clockwise (say, to "20 minutes"). Its shaft is fixed to the mainspring arbor, so turning the knob winds the spring. A printed scale 0–60 around its rim shows the set time against a fixed pointer on the case.

2. The Mainspring (energy store)
A flat coiled steel spring inside a drum. One end anchors to the arbor (driven by §1), the other to the case. Winding the knob stores torque; the spring then continuously tries to unwind, rotating the arbor counter-clockwise back toward zero. This unwinding torque is what drives everything else.

3. The Gear Train (speed reduction)
A short stack of three meshed gears between the mainspring arbor and the escapement. It steps the arbor's slow rotation down — or rather, steps the escapement's fast oscillation up — so that one full unwind of §2 takes exactly 60 minutes at the output shaft. The dial pointer is mounted on this output shaft, so the printed scale moves visibly back toward 0.

4. The Escapement Wheel + Pallet (the regulator)
A toothed wheel driven by §3, with a pivoting two-pronged pallet sitting across its teeth. The pallet rocks back and forth; each rock releases exactly one tooth of the wheel — tick … tick … tick. Without this, the mainspring would dump all its energy in a fraction of a second. The pallet's rocking rate (set by its mass and a small hairspring) is what defines "one minute equals one minute."

5. The Bell Hammer (output)
A spring-loaded arm with a small steel striker, held back by a cam on the arbor of §2. When the arbor rotates back to the 0 position, the cam's notch aligns with the hammer's catch, the catch releases, and the hammer's own little spring snaps it against the bell on top of the case — ding. The timer is now fully unwound; everything sits still until §1 is turned again.

How they couple: §1 winds §2 → §2 drives §3 → §3 drives §4, which paces the unwinding back through §3 to §2 → when §2 reaches zero it trips §5.

One input, one output, three parts in between doing the actual work. Want me to go deeper on any one of them (e.g. the escapement geometry, or the cam profile that releases the hammer)?
---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
