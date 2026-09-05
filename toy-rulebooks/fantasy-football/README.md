# Fantasy Football

An Effortless Rulebook (ERB) demo app showcasing a **4-hop calculated-field DAG** where schema-first business rules drive a fully derived league standings system.

## The Demo

Manage the **"Gridiron Syndicate"** — a 6-team competitive fantasy league with 18 carefully seeded players and a complete 6-week schedule:

- **Players** (18 total, 3 per team): Raw NFL season stats (passing yards, touchdowns, interceptions, rushing, receiving)
- **Rosters** (6 teams): Aggregate player stats into team totals, each with a distinct projected score
- **Matchups** (18 total, 3 per week, weeks 1–6): Two teams pit their scores against each other
- **Standings**: W-L records, playoff seeding, championship paths — **all derived from raw stats**

Change a single player's stat line and watch the entire chain recompute: **player stats → roster totals → matchup scores → standings → playoff eligibility.**

## The Six Teams

| Team | Key Players | Strength | Story |
|------|-------------|----------|-------|
| **Mahomes' Mob** | Patrick Mahomes (QB), Christian McCaffrey (RB), Travis Kelce (TE) | Elite, balanced offense | Reigning champs defending title — Mahomes' INTs are a vulnerability |
| **Hurts' Hustlers** | Jalen Hurts (QB), Saquon Barkley (RB), Ja'Marr Chase (WR) | Dual-threat QB, ground game | Hungry challenger with balanced attack; 2nd strongest roster |
| **Allen's Arsenal** | Josh Allen (QB), Derrick Henry (RB), Tyreek Hill (WR) | Explosive WR, rushing power | The sleeper team; Henry has most rushing TDs; potential dark horse |
| **Davante's Dynasty** | Lamar Jackson (QB), Davante Adams (WR), A.J. Brown (WR) | Elite WR corps, weak QB | Two top receivers but mediocre QB situation; hoping new acquisition saves season |
| **Hurts to the Limit** | Bryce Young (QB), De'Aaron Henry (RB), CeeDee Lamb (WR) | One elite player | Weakest team; Young struggles with interceptions; basically eliminated |
| **Defense Wins Championships** | Russell Wilson (QB), Miles Sanders (RB), Stefon Diggs (WR) | Balanced, no superstars | Game manager roster; hoping sum exceeds parts; surprising strength |

## Game Flow & Weekly Progression

### The Cascade: How Stats Flow Through the System

1. **Player Stats (Ground Truth)**
   - Each player has raw season statistics: passing yards, rushing yards, touchdowns, interceptions, receptions, and receiving yards.
   - Example: Mahomes has 5250 passing yards, 41 passing TDs, 12 interceptions.

2. **Each Player's Score (1st Hop)**
   - The system calculates each player's **Projected Score** using the fantasy scoring formula:
     - (Passing Yards ÷ 25) + (Rushing Yards ÷ 10) + (Receiving Yards ÷ 10) + (Touchdowns × 6) − (Interceptions × 2)
   - Example: Mahomes = (5250÷25) + (0÷10) + (0÷10) + (44×6) − (12×2) = 210 + 0 + 0 + 264 − 24 = **450 points**

3. **Roster Totals (2nd Hop: Aggregation)**
   - Each team's score rolls up from its players:
     - Sum all QB passing yards for that team
     - Sum all RB/WR/TE rushing yards
     - Sum all WR/TE/RB receiving yards
     - Sum all touchdowns (all positions)
     - Sum all interceptions (QB only)
   - Then apply the same fantasy formula to the team totals
   - Example: **Team Alpha's Projected Score = 3,245 points** (sum of all its players)

4. **Weekly Matchups (3rd Hop: Lookup + Comparison)**
   - Each week, two teams face off in a matchup.
   - The system looks up each team's Projected Score from the Rosters table.
   - **Margin** = Team1Score − Team2Score
   - If Margin > 0: Team1 wins
   - If Margin < 0: Team2 wins
   - If Margin = 0: Tie (counts toward both teams' records)
   - Example: **Week 1: Team Alpha (3245) vs Team Bravo (3567) → Team Bravo wins by 322 points**

5. **League Standings (4th Hop: Aggregation + Ranking)**
   - After each matchup, the Standings table updates:
     - **Wins** = Count of matchups where this team won
     - **Losses** = Count of matchups where this team lost
     - **Ties** = Count of tied matchups
     - **Win %** = Wins ÷ (Wins + Losses) — this is a 3rd-order calculation
     - **Points For** = Sum of all this team's scores across matchups
     - **Points Against** = Sum of all opponent scores against this team
     - **Seed Rank** = Ranked by Win% (descending), then Points For (descending) — a 4th-order calculated field
     - **Playoff Bound** = True if Seed Rank ≤ 6
     - **Championship Path** = If playoff-bound, "Seed N → Finals", else null
   - Example: **After Week 1: Team Alpha is 0-1, Team Bravo is 1-0**

### A Complete Week Example

**Week 1 Matchups:**
- **Matchup 1:** Team Alpha (Mahomes, McCaffrey, etc.) vs Team Bravo (Hurts, Henry, etc.)
  - Team Alpha Score: (5250÷25) + (1387÷10) + (564÷10) + (41×6) − (0×2) = **210 + 138.7 + 56.4 + 246 = 651**
  - Team Bravo Score: (3824÷25) + (1524÷10) + (243÷10) + (50×6) − (6×2) = **152.96 + 152.4 + 24.3 + 300 − 12 = 617.66**
  - **Winner:** Team Alpha by 33.34 points

- **Matchup 2:** Team Bravo vs Team Charlie (Chase, Adams, Kelce)
  - Team Bravo Score: 617.66
  - Team Charlie Score: (0÷25) + (100÷10) + (1216÷10) + (15×6) − (0×2) = **0 + 10 + 121.6 + 90 = 221.6**
  - **Winner:** Team Bravo by 396.06 points

**After Week 1 Standings:**
- Team Bravo: 2W–0L–0T (wins both matchups)
- Team Alpha: 1W–0L (wins first, loses second in Week 2)
- Team Charlie: 0W–1L (loses to Bravo, wins/loses against Alpha in Week 2)

**The Chain is Live:**
- Edit Mahomes' passing yards from 5250 → 4250
- Team Alpha's score drops (immediately recalculated in Rosters)
- Week 1 matchup Margin updates (immediately in Matchups)
- Team Alpha's record and win% update (immediately in Standings)
- Team Alpha may drop in playoff seeding
- **All from one edit, all automatically cascading through the DAG**

## The DAG (What Makes This a Demo)

This is a **witnessed 4-hop inference graph**. Every cell in the UI shows a formula explainer — click any value to see exactly how it was derived:

```
Raw Stats (Players) — 1st Hop
  ├─ PassingYards, PassingTouchdowns, Interceptions
  ├─ RushingYards, RushingTouchdowns
  └─ Receptions, ReceivedYards, ReceivedTouchdowns

Calculated Stats (per Player)
  ├─ TotalTouchdowns = PassingTD + RushingTD + ReceivedTD
  └─ ProjectedScore = (PassYards/25) + (TDs×6) − (INTs×2)

RosterAssignments (Join table with lookups)
  ├─ Roster FK, Player FK
  └─ All player stats pulled via lookup (PlayerName, Position, all stats)

Aggregations (Rosters) — 2nd Hop: Aggregation
  ├─ TotalPassingYards = SUMIFS(RosterAssignments where Roster = ThisRoster)
  ├─ TotalTouchdowns = SUMIFS(RosterAssignments where Roster = ThisRoster)
  ├─ TotalInterceptions = SUMIFS(RosterAssignments where Roster = ThisRoster)
  └─ ProjectedScore = (PassYds/25) + (RushYds/10) + (RecYds/10) + (TDs×6) − (INTs×2)

Matchups (3rd Hop: Lookup + Calculation)
  ├─ Team1Score = LOOKUP(Rosters.ProjectedScore where Team1)
  ├─ Team2Score = LOOKUP(Rosters.ProjectedScore where Team2)
  ├─ Margin = Team1Score − Team2Score
  ├─ Winner = IF Margin > 0 THEN Team1 ELSE Team2
  └─ IsTieGame = IF Margin = 0 THEN true

Standings (4th Hop: Aggregation + Ranking)
  ├─ Wins = COUNT(Matchups where Winner = ThisRoster)
  ├─ Losses = COUNT(Matchups where Loser = ThisRoster)
  ├─ WinPct = Wins / (Wins + Losses) — 3rd-order calc
  ├─ PointsFor = SUM(Matchup scores for this roster)
  ├─ PointsAgainst = SUM(opponent scores against this roster)
  ├─ SeedRank = RANK() OVER (ORDER BY WinPct DESC, PointsFor DESC) — 4th-order calc
  ├─ PlayoffBound = IF SeedRank ≤ 6 THEN true
  └─ ChampsPath = IF PlayoffBound THEN "Seed N → Finals" ELSE null
```

## Stack

- **Postgres DB**: `fantasy_football_league` (rulebook-first, Path B, no Airtable)
- **Server**: Express + pg + tsx on port **3045**
- **Web**: Vite + React + React Router on port **5188** (proxies `/api` → 3045)
- **Auth**: Dev login (no OAuth) — pick any seeded identity from the login page
- **DAG UI**: `<DagCell>` component wraps every calculated value with formula popovers

## Directory Structure

```
fantasy-football/
├── README.md                           (this file)
├── CLAUDE.md                           (project conventions)
├── LEAGUE_STORY.md                     (narrative: teams, weeks 1-6, story arcs)
├── effortless-rulebook/
│   └── effortless-rulebook.json        (single source of truth — 6 entities, 4-hop DAG)
├── postgres/
│   ├── init-db.sh                      (drop + recreate DB from scratch)
│   ├── 00-bootstrap.sql                (auth setup)
│   ├── 01-drop-and-create-tables.sql   (base tables for all 6 entities)
│   ├── 02-create-functions.sql         (52 calc/lookup functions)
│   ├── 03-create-views.sql             (vw_* views with all calculated fields)
│   ├── 04-create-policies.sql          (RLS — enabled but no policies)
│   └── 05-insert-data.sql              (seed: 18 players, 6 rosters, 18 matchups, 6 weeks)
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts                    (Express server, auth, CRUD endpoints)
├── web/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                     (router, Shell nav, role-guarded routes)
│       ├── index.css
│       ├── lib/
│       │   ├── api.ts                  (fetch helpers)
│       │   └── useApi.ts               (React hook for data + reload)
│       ├── components/
│       │   ├── DagCell.tsx             (clickable cell with formula popup)
│       │   └── DagCell.css
│       └── pages/
│           ├── Login.tsx               (dev user picker)
│           ├── Standings.tsx           (primary view: fully wired)
│           ├── Players.tsx             (editable raw stats)
│           ├── Rosters.tsx             (aggregated stats)
│           ├── Matchups.tsx            (weekly match-ups)
│           └── PlaceholderRole.tsx     (stubs for non-commissioner roles)
└── start.sh                            (launcher with subcommands: all|server|web|db|build)
```

## Quick Start

### Option 1: Run everything at once
```bash
cd fantasy-football
./start.sh all
```

Opens:
- **Server**: http://localhost:3045
- **Web**: http://localhost:5188 (proxy `/api` → 3045)

### Option 2: Run separately
```bash
# Terminal 1: Database
./start.sh db

# Terminal 2: Server
./start.sh server

# Terminal 3: Web
./start.sh web
```

## Try This

1. Open http://localhost:5188
2. **Login** as `commissioner@league.local`
3. Go to **Standings** — see the playoff bracket and championship paths
4. Go to **Players** — click any player's **Projected Score** to see the formula
5. Click **Edit Stats** on any player and change their passing yards
6. Submit the edit
7. Go back to **Standings** — watch the entire league standings recompute instantly

The entire chain is visible: player raw stat → total touchdowns → roster total → matchup scores → standing record → playoff seeding → championship path.

## Dev Login

| Email | Role | Notes |
|-------|------|-------|
| commissioner@league.local | Commissioner | Full access to all pages |
| owner@league.local | Team Owner | Placeholder (not wired) |
| spectator@league.local | Spectator | Placeholder (not wired) |

## Talking Points

- **"Single source of truth"**: The rulebook is the only place business logic lives. 6 entities, 52 calculated/lookup functions, zero hand-written SQL, zero app-layer math. Edit the rulebook once; the DB auto-regenerates.
- **"Change one cell, watch it all light up"**: Edit any player's passing yards → team totals recompute → matchup scores change → standings shift → playoff seeding updates → championship path changes. One edit cascades through 4 hops.
- **"The DAG is visible"**: Click any cell in the UI and see the exact formula, inputs, and chain. No hidden logic. This is transparency in the data layer. The React Explainer reads the rulebook directly.
- **"Join tables done right"**: RosterAssignments uses the canonical FK/lookup pattern. Every aggregation on Rosters pulls from RosterAssignments, not from Players directly. This keeps the model composable and the data normalized.

## The Leopold Loop

To modify the rulebook and watch the app auto-update:

1. Edit `effortless-rulebook/effortless-rulebook.json` (add fields, change formulas, add entities)
2. Run `./start.sh build` (or just `effortless build`)
   - Regenerates `postgres/*.sql` files
   - Drops and recreates the database
   - Re-seeds the mock data
3. Vite HMR picks up web changes automatically; restart the server if needed (`pkill tsx`)
4. Commit all changes (rulebook + regenerated postgres/ + any UI updates) as a single commit

Example: to add a "PointSpread" field to Matchups:
```json
{
  "name": "PointSpread",
  "datatype": "number",
  "type": "raw",
  "nullable": false,
  "Description": "Vegas point spread"
}
```

Then `./start.sh build`, and the DB is ready with the new column.

## Next 10 Leopold Loops

Pick any of these to extend the demo:

1. **Add a "BonusPoints" entity with team performance bonuses** — rulebook + UI. New entity with a lookup to Rosters and an aggregation back to Standings. [rulebook + UI]

2. **Flag rosters as "InjuryRidden" if their ProjectedScore drops below 2000** — rulebook-only. Add a boolean calculated field to Rosters. [rulebook-only]

3. **Calculate a "DraftPick" sequence number for playoff seeding** — rulebook-only. New calculated field on Standings ranked by SeedRank. [rulebook-only]

4. **Add a "PointSpread" raw field to Matchups and a "CoverSpread" boolean** — rulebook + UI. New fields on Matchups table, UI editor for PointSpread. [rulebook + UI]

5. **Create a "Playoffs" entity with bracket logic** — rulebook + UI. New entity linking Standings to playoff rounds. [rulebook + UI]

6. **Show a "StreakLength" (consecutive wins/losses) on Standings** — rulebook-only. Add a COALESCE lookup chain to find the longest win streak from Matchups. [rulebook-only]

7. **Add team "Colors" and a "ThemeColor" lookup to the UI** — rulebook + UI. New field on Rosters, render with CSS variables. [rulebook + UI]

8. **Flag any Matchup with MarginOfVictory > 50 as "Blowout"** — rulebook-only. Boolean calculated field. [rulebook-only]

9. **Show "AvgPointsPerGame" on Standings** — rulebook-only. PointsFor / (Wins + Losses). [rulebook-only]

10. **Add a "Trades" entity logging roster swaps and a "TradeHistory" view** — rulebook + UI. New entity with RelatedTo on Rosters, date field, summary. [rulebook + UI]

## Known Limitations

- **No persistent auth**: Dev login picker is stateless (localStorage email); closes browser = login again.
- **No RLS**: Server connects as superuser (postgres role); all users see all data. RLS is enabled in Postgres but no policies are active.
- **Placeholder roles**: Owner and Spectator roles show a stub page. Use commissioner to see the full UI.
- **No real-time**: Edits require a page refresh to see upstream changes. No WebSocket or polling.
- **No mobile**: Layout assumes desktop viewport (250px sidebar).

## Files You'll Touch

| Task | File |
|------|------|
| Add a new field or calculation | `effortless-rulebook/effortless-rulebook.json` |
| Change a page layout | `web/src/pages/*.tsx` |
| Add a new aggregation | `effortless-rulebook/effortless-rulebook.json` |
| Update mock data | `postgres/05-customize-data.sql` (or re-seed in the rulebook) |
| Change the schema | `effortless-rulebook/effortless-rulebook.json` + `./start.sh build` |
| Add a new API endpoint | `server/src/index.ts` |

---

**Next step**: Pick a loop from the "Next 10" list and run it.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `rulebook-examples/legacy-runner/ssotme-proxy/` (it is being
> separated into its own project; see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
