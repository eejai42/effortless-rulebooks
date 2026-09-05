<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-claude-updates/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-claude-updates
description: >
  Use for anything about the effortless-claude **skill set** itself — both
  CHECKING for updates and APPLYING them. Triggers: "are my effortless skills
  up to date", "check for effortless skill updates", "update effortless
  skills", "reinstall effortless skills", "refresh effortless skills",
  "what's new in effortless-claude", "add a new effortless skill", "edit a
  skill". NOT for the CLI binary — for that, use effortless-cli.

  **Scope (load gate):** Loads only on explicit user request about the skill set itself. Does NOT require an Effortless-marked project (skill maintenance is project-independent).
audience: customer
---

# Effortless Skill Set — Check, Update, Author

The effortless-claude skill set lives in two places:

| Location | Role |
|---|---|
| `<clone>/skills/` (a git clone of `effortlessapi/effortless-claude`) | **SSoT** — all edits happen here |
| `~/.claude/skills/effortless-*` | **Installed copies** — what Claude Code loads at runtime |

**Never edit installed copies directly.** Edit in the SSoT clone, then run `install.sh`.

## Check: is my local clone behind upstream?

This is read-only. Don't `git pull` or `git fetch` — just compare.

### 1. Locate the clone

```bash
for d in ~/effortless-claude ~/src/effortless-claude ~/code/effortless-claude \
         ~/projects/effortless-claude ./effortless-claude; do
  if [ -d "$d/.git" ]; then
    remote=$(git -C "$d" remote get-url origin 2>/dev/null)
    case "$remote" in *effortlessapi/effortless-claude*) echo "$d";; esac
  fi
done
```

If none found, ask the user. No clone → no update path; recommend cloning.

### 2. Compare local HEAD to upstream

```bash
LOCAL=$(git -C <clone> rev-parse HEAD)
gh api "repos/effortlessapi/effortless-claude/compare/$LOCAL...main" \
  --jq '{ahead: .ahead_by, behind: .behind_by, commits: [.commits[] | {sha: .sha[0:7], msg: .commit.message | split("\n")[0]}]}'
```

Fallback if `gh` is missing:

```bash
curl -s 'https://api.github.com/repos/effortlessapi/effortless-claude/commits?per_page=20' \
  | python3 -c "import sys,json; [print(c['sha'][:7], c['commit']['author']['date'], c['commit']['message'].split(chr(10))[0]) for c in json.load(sys.stdin)]"
```

If `behind: 0` — current. Done.
If `behind: N > 0` — list the messages. Don't summarize as "minor" / "safe to skip"; the user reads and decides.

### 3. Recommend a re-check cadence

From the last 20 upstream commits, compute median gap in days:

| Median gap | Recommended cadence |
|---|---|
| < 2 days | Daily, or each session start |
| 2–7 days | Weekly |
| 7–30 days | Monthly |
| > 30 days | On demand only |

## Update: apply the latest

**Per the read-only-git memory: ASK before running git commands.** The user authorizes each step.

```bash
cd <clone>
git status                  # confirm clean tree first
git pull
bash install.sh --yes       # copies skills/* into ~/.claude/skills/
ls ~/.claude/skills/effortless-*  # verify
```

`install.sh` dynamically discovers all `skills/*/` directories and also cleans up entries listed in `DEPRECATED_SKILLS.md`.

### Install modes

```bash
bash install.sh              # interactive — asks per skill
bash install.sh --yes        # non-interactive
bash install.sh --symlink    # symlink instead of copy (contributor / dev mode)
bash install.sh --uninstall  # remove all installed effortless-* skills
```

Use `--symlink` if you're actively editing skills — changes take effect immediately without reinstall.

## Author: add or edit a skill

### Add a new skill

```
<clone>/skills/effortless-myskill/SKILL.md
```

Frontmatter is what Claude Code uses to decide when to load the skill — write the description as a **trigger specification**, not a summary:

```yaml
---
name: effortless-myskill
description: >
  Use when ... (include exact phrases users will say, file/directory names that
  indicate relevance, and what NOT to use it for).
audience: customer
---
```

Then `bash install.sh --yes`. Discovery is automatic.

### Edit an existing skill

1. Edit `<clone>/skills/<skill-name>/SKILL.md`
2. `bash install.sh --yes` (skip if you're using `--symlink` mode)
3. Next Claude Code conversation picks it up.

### Skill-writing principles

- Concise — these are for Claude, not human onboarding. Target ~150 lines.
- Lead with rules/axioms; skip tutorial framing.
- Link to other effortless-* skills instead of restating their content.
- Tables and code blocks beat prose paraphrases.
- The `description` is the load-decision; be explicit about triggers AND non-triggers.

### Deprecating a skill

Add an entry to `<clone>/DEPRECATED_SKILLS.md` (the installer parses this table to clean up users' installed copies). Optionally leave a shim `SKILL.md` in `skills/<old-name>/` pointing to the replacement until the target removal date.

## See also

- `effortless-cli` — for the CLI **binary** (different artifact entirely).
- `effortless-orchestrator` — top-level ERB framing; routes here for skill-set work.
