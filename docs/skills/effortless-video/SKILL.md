<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-video/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-video
description: >
  Use whenever the user asks to make, create, produce, storyboard, script, or
  render a VIDEO — almost always an explainer about a rulebook in the
  effortless-rulebooks repo (rulebook-examples/* or toy-rulebooks/*) or an
  Effortless concept. Triggers: "make a video about X", "create a video for the
  <domain> demo", "storyboard a video", "record the VO", "render the MP4", "add
  a new video", "do another video like the closure one", "explainer video",
  "add scene N", "change the narration". The producer repo is
  effortless-vid-01-full-name; the reference-quality example is
  videos/03-closure. ALWAYS load this before writing a storyboard, a scene, an
  animation spec, or touching any render code.

  **Scope (load gate):** Loads only on explicit user request to make/edit a video. Does not require a marked Effortless project — it operates against the separate `effortless-vid-01-full-name` producer repo and the sibling `effortless-rulebooks` repo.
audience: general
---

# Effortless Video Producer

Videos in this ecosystem are **Effortless projects like any other**. The video
is not a script file plus some ffmpeg — it is a rulebook (`Storyboards → Acts →
Scenes → Clips → Assets`) that is *rendered*. The whole point of these videos is
that one rulebook drives everything, so of course the video producer is driven
by one rulebook. Practice what the video preaches.

## Where everything lives

```
~/…/my-projects/effortless-vid-01-full-name/          ← THE PRODUCER REPO
  server/  app/  start.sh                             ← shared, video-aware tooling
  videos/
    01-fullname/        02-talismans/
    03-closure/   ← ★ THE REFERENCE-QUALITY EXAMPLE. Read it before writing anything.
    04-witnesses/
```

Each `videos/<slug>/` is a self-contained project:

```
videos/<slug>/
  effortless-rulebook/effortless-rulebook.json   ← THE SSoT
  effortless.json          ← rulebooktorulespeak + JsonHbarsTransform
  ANIMATION-SPEC.md        ← HAND-WRITTEN. Teaching intent + visual plan (see §4)
  STORYBOARD.md            ← GENERATED view. Never hand-edit.
  rulespeak/               ← GENERATED
  storyboard-doc/          ← storyboard.hbars (the template) + output.txt
  assets/vo/*.wav          ← voiceovers (recorded from Scene.Script)
  assets/screencasts/*.mp4 ← per-scene visuals
  acts/NN-slug/{src,final}.mp4, vo.wav, poster.png
  renders/<name>.final.mp4 ← THE DELIVERABLE
  demo-build/              ← the REAL live app being filmed (gitignored)
```

The active video is chosen by **`VIDEO_SLUG`** (else the first folder in
`videos/`). `server/videos.mjs` is the ONE resolver — never hardcode the repo
root.

## 📚 What a video is ABOUT — always a rulebook in `effortless-rulebooks`

**When the user says "make a video about X," X is almost always a rulebook in the
sibling repo** — read its rulebook/CLAUDE.md/README before storyboarding:

```
../effortless-rulebooks/          ← sibling of the producer repo (verified relative path)
  rulebook-examples/<domain>/     ← full ontologies (domain DEPTH) — the usual subject
  toy-rulebooks/<domain>/         ← minimal domains (substrate BREADTH) — quick explainers
```

Every subject has a `CLAUDE.md`, an `effortless-rulebook/effortless-rulebook.json`,
and usually a `README.md` and a runnable app (its own `./start.sh`). **Step 1 of
any new video is to read those three files** and find the ONE idea that domain
proves. If the domain is ambiguous or the user didn't name one, **ask which**
before writing anything (`AskUserQuestion`).

Current subject catalog (as of 2026-07-20 — re-`ls` these two dirs to refresh):

- **`rulebook-examples/`** (deep ontologies): `simpsons-paradox` (the crown jewel —
  a famous paradox falling out of the DAG), `effortless-banking`,
  `veritasium-power-laws-and-fractals`, `talismans-special-solutions` (Postgres +
  OWL agree), `traffic-ticket-contest`, `effortless-math` (+ `fermats-last-theorem`,
  `natural-number-arithmetic`), `naive-set-theory`, `tiling-the-plane`,
  `causal-autoimmune-architecture`, `intelligence-taxonomy`, `is-everything-a-language`,
  `planar-unit-discovery`, `procedural-knowledge-ontology`, `ross-style-business-rules`,
  `effortless-banking`, `effortless-math`.
- **`toy-rulebooks/`** (minimal, one-idea): `star-trek`, `customer-fullname`,
  `expense-approval`, `guessing-game`, `wedding-seating-optimizer`,
  `volunteer-shift-scheduler`, `fantasy-football`, `product-inventory`,
  `gym-trainer-invoicing`, `mechanical-kitchen-timer`, `lazr-coulombs-law`,
  `job-search-rag`, `customer-crm`, `therapist-helper-portal`, and the
  `nakedclaude-v1…v4` / `naked-claude-vs-effortless-claude` comparison set.

(The existing producer videos map to these: `03-closure` → transitive closure in
`talismans-special-solutions`, `02-talismans` → same, `04-witnesses` /
`06-rulespeak` → their own subjects. Follow that "one producer video ⇄ one subject
rulebook" pattern.)

## 🟥 The one rule that has already been broken once

**Every change to the video's content goes into the rulebook, then
`effortless build`.** Add/remove/reorder scenes, change narration, swap what a
scene shows → **edit `effortless-rulebook.json`**.

Never edit `STORYBOARD.md`, `rulespeak/*`, or `storyboard-doc/output.txt` to
change the story — they are generated views. Never reach into `server/*.mjs` to
fake a story change. Rendering code *renders*; the **rulebook decides what gets
rendered**. Editing a `.mjs` instead of the rulebook is the single worst mistake
in this repo: it looks like work, changes nothing the user asked for, and wastes
their time. It has already happened once.

`server/gen-screencasts.mjs` and `gen-real-footage.mjs` are **asset factories** —
they change how a clip *looks*, never which scenes exist or what they say.

## The rulebook shape

| Table | Role |
|---|---|
| `Storyboards` | 1 row. Title, WorkingTitle, Logline, TargetLength, Voice, RunningExample, HowToUse, OutputFileName, Status. Aggregates SceneCount + TotalDurationSeconds. |
| `Acts` | The 3-act spine. ActId, ActOrder, ActNumeral, ActTitle, Timecode, Tagline. |
| `Scenes` | **The unit the viewer perceives.** SceneOrder, SceneTitle, **Purpose** (on-screen/shot intent), **Script** (the VO — editing it re-records audio and re-times the scene), Act FK, Timecode. |
| `Clips` | Places an Asset on a Scene's track. ClipOrder, TrimIn/Out, Transition. |
| `Assets` | The media pool. AssetKey, Kind (`Voiceover`/`ScreenRecording`/`Image`/`Music`), FilePath, **IsReady**, NativeDurationSeconds. |
| `MusicCues` | Scene ♪ Asset, GainDb, fades. |
| `__meta__` | `render.fps` 30, `render.width` 1280, `render.height` 720, `vo.words_per_minute` 150, `vo.voice`, `story.version`, `story.assets_mode`, `story.structure`. |

Key derivations already in the rulebook — **do not recompute these by hand**:
`Scenes.VoiceoverAsset = "vo-" & TEXT(SceneOrder,"00")`,
`Scenes.DurationSeconds` from Clips/VO, `Scenes.WordCount = COUNTWORDS(Script)`,
`Clips.DurationSeconds = COALESCE(TrimOut, Asset.NativeDuration)`,
`Assets.UsageCount = COUNTIFS(Clips.Asset, …)`.

**Timing is driven by the real recorded VO length**, not by a guess. `vo-record.mjs`
writes `NativeDurationSeconds` back to the Asset from `ffprobe`; the renderer
frame-locks each scene to its VO. Never hand-tune a duration to "make it fit."

### 🗣️ Scene.Script is spoken words ONLY — and it goes straight to a TTS engine
`Script` gets fed to ElevenLabs/`say` verbatim, so anything in it that isn't
meant to be heard out loud (speaker labels, parenthetical SFX/camera notes,
director's notes) gets read aloud by mistake — that belongs in `Purpose` or
`ShotBrief` instead, never in `Script`.

**Known TTS mispronunciations — write these phonetically in `Script` every
time, even though it looks like a typo:**

| Written normally | Write in `Script` as | Why |
|---|---|---|
| "row" (a database row) | **"roe"** | The TTS engine reads "row" ambiguously/wrong often enough that this repo has standardized on the phonetic spelling everywhere it appears in narration. |
| "effortlessAPI" / "effortlessapi.com" | **"effortless A P I"** (spaced, capitalized as three letters) | Run together, the engine tends to read it as one blended word ("effortless-uh-pee") instead of the three letters A-P-I. Spacing/capitalizing them as their own token makes the engine say the letters. |
| em dash (—) or en dash (–) | never — use a period, comma, or "and" | The ElevenLabs voice reads a bare dash as a stray Japanese syllable, 100% reproducible (see the project CLAUDE.md's own NO EM DASHES rule). |

This list grows whenever a new mispronunciation is caught — **add the finding
here** (the shared, checked-in skill) rather than only noting it in a private
memory, so every future video benefits, not just the session that found it.
**Always listen back to a scene that introduces a new proper noun, acronym, or
one of the words above before treating it as final** — a rendered take is the
only reliable way to catch a misread.

## Commands

```bash
cd .../effortless-vid-01-full-name

./start.sh list                     # what videos exist
./start.sh <slug>                   # API :30001 + SPA :30002 (kills ports first)
./start.sh <slug> build             # = cd videos/<slug> && effortless build

cd videos/<slug> && effortless build          # regenerate STORYBOARD.md + rulespeak/
node server/render-cli.mjs <slug>             # assemble renders/<name>.final.mp4
node server/gen-screencasts.mjs [assetKey…]   # (re)build synthetic visuals
```

`start.sh` is the restart story — it always frees :30001/:30002 first. Never ask
the user to `kill` a PID. Prefer `render-cli.mjs` over the app's Build button
(avoids the dev-server `.render-tmp` wipe race).

## What made the closure video good — the bar to clear

Read `videos/03-closure/ANIMATION-SPEC.md` and `STORYBOARD.md` in full before
authoring. The craft is real and reproducible:

1. **One idea, stated in one sentence.** Closure's was: *"You describe a shape
   once; the consequences fill themselves in."* Write that sentence first. Every
   scene serves it or gets cut.
2. **Land it in the body before naming it.** Act I used Anna/Ben/Cara ages — the
   viewer *feels* the inference before hearing "transitive closure." Concrete →
   iconic → symbolic (Bruner). Earn the jargon; never open with it.
2b. **Assume the viewer has never heard of a rulebook.** Every video in this
   series gets watched cold — there is no "watch the earlier ones first"
   guarantee, and even a numbered part-N-of-N sequel needs its own on-ramp.
   Before the video leans on "the rulebook" to explain anything, it must first
   show, briefly, what a rulebook *is* and *why reading one beats reading code*
   — a sentence or a short beat is enough, this is not a lecture. **Asserting an
   advantage ("one query, deterministic, done") without ever grounding what's
   being queried and why that's different from code is the single most common
   failure mode in this repo's scripts.** A viewer who doesn't already buy the
   premise will read the whole video as a magic trick, not a demonstration. If a
   scene name-drops "the rulebook" and a first-time viewer wouldn't yet know
   what that word refers to, that's the gap to fix, before polishing anything
   else.
3. **Make the abstraction manipulable.** Act II is one continuous live page the
   viewer watches get poked. Assert 4 → get 10 is the payoff beat.
4. **Counter-examples do the real teaching (variation theory).** Closure had
   three: pull an edge (it shrinks), branch it (it changes shape), turn the rule
   off (it collapses to 4). **The rule becomes visible by its absence.** A video
   without counter-examples is a demo, not an explainer.
5. **Show, don't lecture, in Act III.** Reveal the actual generated
   `WITH RECURSIVE` view and the actual `owl:TransitiveProperty` triple. Real
   artifacts from the real substrate.
6. **Convergence as the aha.** Two very different engines, same answer — "not
   two closures, the same shape built twice." This is the ERB thesis landing
   without being preached.
7. **Hand it back to the viewer.** *"If you've ever modeled an ordering, a
   hierarchy, a chain of approvals — this is what you were doing."* Speak to the
   domain author so they recognize their own work rather than being taught.
8. **End with a runnable CTA.** Three literal steps + the localhost URL.
9. **Dual-audience voice**, recorded in `Storyboards.Voice`: plain enough for a
   smart friend, precise enough that the ontologist sees their work honored.
10. **A semantic color law held for the whole video.** Closure: *asserted = solid
    blue, inferred = hollow mauve*; five steps keep fixed identities in the DAG,
    the matrix, the SQL, and the triples. Establish it once; never flip it.

Structure that worked: **16 scenes / 3 acts / ~3:00**, scenes 7–17s each.

## Visual system (shared default)

1280×720 @ 30fps, Catppuccin Mocha: bg `#1e1e2e`, surface `#181825`, panel
`#11111b`, text `#cdd6f4`, muted `#a6adc8`. Accents: mauve `#cba6f7`, blue
`#89b4fa`, green `#a6e3a1`, red `#f38ba8`, yellow `#f9e2af`, teal `#94e2d5`,
peach `#fab387`. Smoothstep easing; new truth **draws in** (a line extends, a dot
blooms) rather than cutting.

Four shot methodologies — pick one per scene and record it in the spec:
`diagram` (schematic that animates itself in) · `card` (kinetic typography) ·
`site` (simulated live UI with a moving cursor) · `code` (macOS window typing
real SQL/Turtle line-by-line).

Visuals are **synthesized deterministically** — Python/PIL draws `frame%05d.png`,
ffmpeg encodes — so any shot is re-renderable and can later be swapped for a real
screen capture without touching the story. See `server/closure/gen*.py` for the
per-scene generator pattern and `closure_kit.py` for the shared kit.

## Workflow for a NEW video

0. **Read the reference first.** Open `videos/03-closure/ANIMATION-SPEC.md` and
   `STORYBOARD.md` in full — that is the bar to clear (see "What made the closure
   video good" below). Do this before you storyboard anything, every time.
1. **Identify the subject rulebook** in `../effortless-rulebooks` — see the
   subject catalog under "What a video is ABOUT" above. It's `rulebook-examples/<domain>/`
   (deep) or `toy-rulebooks/<domain>/` (minimal). Read its `CLAUDE.md`, its
   rulebook, and its `README.md`. Find the ONE idea that domain proves. If the
   user didn't name a domain or it's ambiguous, `AskUserQuestion` before writing.
2. **Get the real app running** if there is one (`demo-build/`, or the domain's
   own `./start.sh`) — real footage beats synthetic, and you cannot honestly show
   a substrate you haven't run.
3. `mkdir videos/<NN-slug>/`, copy `03-closure`'s `effortless.json` +
   `effortless-rulebook.json` as the template, then **rewrite the rulebook** for
   the new subject. Update `effortless.json`'s `Name`/`project-name`. It appears
   in `./start.sh list` and the app picker automatically — no code changes.
4. **Write `ANIMATION-SPEC.md` first** — the one idea, the pedagogical arc, the
   color law, then per-scene *Teach* + *Visual*. It is the influence, not the
   SSoT; it keeps shots deliberate instead of decorated at random.
5. **Author Scenes in the rulebook** (Purpose + Script), Acts, Assets
   (`IsReady:false`), and one Clip per Scene.
6. Record VO → `Assets.NativeDurationSeconds` populates and drives timing.
7. Generate visuals → flip each Asset to real `FilePath` + `IsReady:true`.
8. `cd videos/<slug> && effortless build`
9. `node server/render-cli.mjs <slug>` → `renders/<name>.final.mp4`

## Guardrails

- **Never fabricate a substrate result.** If a scene claims Postgres and OWL
  agree, run both and show the real output. A video is a claim in public.
- Prefer real captured footage; synthetic clips are a *placeholder stage*
  (`story.assets_mode`), not the goal. Both are hot-swappable — overwrite the
  file at `FilePath` and re-run.
- Don't invent a length. `TotalDurationSeconds` aggregates from real VO.
- Respect the subject domain's own CLAUDE.md (branch rules, concurrent-write
  rules, the `indent=1` rule in procedural-knowledge-ontology, etc.).
- Keep attribution/neutrality obligations from the subject domain (e.g. PKO's
  `NOTICE.md` — align, don't imply endorsement).
- **Every demo app or screenshot filmed for a video — except the rulebook
  editor itself — must be colorful and mobile-friendly.** Frame it for a BIG
  mobile device (a large phone or tablet is fine), never a desktop-targeted
  layout. The rulebook editor is the one exception because it's a dev tool,
  not something being demoed to an end user.
