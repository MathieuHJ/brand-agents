# Brand Agents

Agent skills for brand work, from the first fuzzy brief to the asset that ships: writing the brief, turning references into art direction, finding a name, exploring identity directions, keeping claims honest and reviewing the result. Each skill returns a readable summary plus JSON that matches a published schema, so outputs can be checked, compared and passed to the next step.

The skills are plain Markdown in the [Agent Skills](https://agentskills.io) format. They work in Claude Code, Codex and any assistant you can paste instructions into. There is no service to run.

## Skills

| Skill | Bring | Get back |
| --- | --- | --- |
| [Brand brief intake](skills/brand-brief-intake/SKILL.md) | Whatever you have: notes, a deck, a website, or nothing | A structured brief with a persona test, unknowns left blank with an owner, and which skill can run next |
| [Art direction extractor](skills/art-direction-extractor/SKILL.md) | Mood-board images; optionally audience, adjectives, competitors, things to avoid | Evidence-backed rules for colour, type, imagery, layout and motion, an accessibility pass, and hand-offs for logo, UI and content |
| [Brand naming rubric](skills/brand-naming-rubric/SKILL.md) | The idea, audience, tone, markets and constraints | A check on whether it needs a name at all, ranked names with pronunciation and linguistic notes, a kill screen, and a clearance to-do list |
| [Logo and identity directions](skills/logo-identity-directions/SKILL.md) | A chosen name, ideally with an art direction JSON | 3–5 distinct directions with lockup, 16px and motion behaviour, clichés to avoid, and a comparable scorecard |
| [Direction to tokens](skills/direction-to-tokens/SKILL.md) | An art direction JSON, a brief or existing brand colours | Design tokens with a reason per value, CSS custom properties, and a contrast report for every text and background pair |
| [Voice and tone](skills/voice-and-tone/SKILL.md) | A brief, existing copy samples, category copy to avoid | Voice principles with before/after rewrites, tone by context, words to prefer and avoid, mechanics, and a linter that checks copy against them |
| [Claims register](skills/claims-register/SKILL.md) | Product facts and their release state; later, the copy to check | A register of what you may claim (Shipped, Beta, Planned, Proposed, Retired), and a script that flags copy running ahead of the product |
| [Asset QA scorecard](skills/asset-qa-scorecard/SKILL.md) | A finished asset, where it runs, and the brand rules | A weighted 100-point review with hard failures, evidence and fixes; a script computes the total and the pass, revise or reject verdict |

They chain: **brief → art direction → tokens → name → identity directions → voice → claims → QA**. The brief says which skill is ready to run next. Each can also run alone.

## Install

**Claude Code** (as a plugin):

```sh
/plugin marketplace add MathieuHJ/brand-agents
/plugin install brand-agents@brand-agents
```

**Inside this repo:** `.claude/skills` and `.codex/skills` are links to `skills/`, so Claude Code (and Codex, where it reads repo-level skills from `.codex/skills`) picks them up without copying. On Windows, Git may check these links out as plain files; copy the folders instead.

**Anywhere else:** copy a skill folder into your tool's skills directory, or paste its `SKILL.md` into the conversation. Use an image-capable model for mood boards.

## Use

Ask naturally; the skill descriptions tell the agent when to load them.

> Here are my notes and our pitch deck for a daily devotional app. Turn them into a brief and tell me what's missing.

> Name a tool that turns lectures into live polls and quizzes. It's for educators, English first, and it should feel clear and warm. Avoid anything that sounds like Kahoot or Mentimeter.

> Here are eight references for a meditation journal. Pull out the art direction, and tell me if they disagree with each other.

> We picked "Aurel". Using this art direction JSON, give me identity directions. It's an app first.

Only share references and briefs you are allowed to send to your assistant's provider.

## Check copy against the register

The claims register ships with a small checker. No dependencies:

```sh
node skills/claims-register/scripts/check-copy.mjs brands/test_project/claims_register.json brands/test_project/launch_copy.md
```

```text
P0  line 9 C4  Works offline, so a bad connection never stops a class.
    Planned claim written as if it already works. Use future tense, or cut it.

P1  line 7 C3  Results sync straight to Canvas and Moodle.
    Beta claim without a qualifier such as "in beta" or "early access".

3 P0 · 6 P1 · 1 P2 · claims used: C1, C2, C3, C4, C5
```

It exits with code 1 on any P0, so it can run in CI. It matches words, so treat it as a screen, not a verdict.

## Score an asset

The QA scorecard's script does the arithmetic, so the verdict always follows from the numbers:

```sh
node skills/asset-qa-scorecard/scripts/score.mjs brands/test_project/qa_scorecard.json
```

```text
Legibility and accessibility  ██████····     6/10  below floor
Crops and formats             ██████····     3/5  below floor

REVISE  84/100 (threshold 85)
```

Any hard failure rejects the asset; a total under the threshold, or any dimension under 70% of its weight, means revise.

## Examples

[`brands/test_project/`](brands/test_project/) holds an output from every skill for two fictional products: Aurel, a devotional app taken from brief to QA, and Numo, a lecture-quiz tool used for naming and claims. Its [index](brands/test_project/README.md) shows which file is which. Names are illustrative and have not been cleared.

## Validate

With Node.js 18 or later, and no dependencies:

```sh
node scripts/validate-examples.mjs
```

This checks every skill's frontmatter and every example against its skill's `schema.json`, plus rules a schema cannot express: naming totals add up and rank correctly, observations cite real references, proposed text colours pass WCAG AA on the ground colour. Pass a path to check one of your own outputs:

```sh
node scripts/validate-examples.mjs path/to/naming_candidates.json
```

The filename decides which schema applies (`art_direction.json`, `naming_candidates.json`, `logo_directions.json`, `claims_register.json`, `qa_scorecard.json`, `brief.json`, `tokens.json`, `voice.json`).

## How the skills think

[docs/principles.md](docs/principles.md) collects the lessons behind them: observe before interpreting, split contradictory references, inherit rather than fork, a two-element lockup budget, ask whether something needs a name, and keep every claim tied to what has actually shipped.

## Boundaries

- Scores are judgement, not clearance. Nothing here checks trademarks, company names, handles or domains.
- The skills produce direction and concepts, not finished artwork.
- What you share with an assistant is subject to that provider's data handling.
- No license file is included yet. Do not assume an open-source license because the repository is public.

Changes are listed in [CHANGELOG.md](CHANGELOG.md).
