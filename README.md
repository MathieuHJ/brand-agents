# Brand Agents

Nine agent skills for brand work, from the first fuzzy brief to the asset that ships. They write the brief, turn references into art direction and tokens, find and stress-test a name, explore identity directions, define the voice, keep claims honest, and review the result.

Each skill returns a readable summary plus JSON in a fixed format, so you can check outputs, compare them and pass them to the next step. Five small scripts handle the things a model shouldn't be trusted with: contrast ratios, score totals, copy checks and a name preview page. Everything is plain Markdown and dependency-free Node, in the [Agent Skills](https://agentskills.io) format. There is no service to run.

**New here?** Read [Getting started](docs/getting-started.md) (install, first run, saving outputs), then [the workflow](docs/workflow.md) (a full project, step by step).

## Quick start

In Claude Code:

```text
/plugin marketplace add MathieuHJ/brand-agents
/plugin install brand-agents@brand-agents
```

Then describe the job:

> Help me write a brand brief for a daily devotional app: one short reading and one question a day, for adults with a faith practice.

The brief ends by telling you which skill to run next. For Codex, Claude.ai or other assistants, see [Install](docs/getting-started.md#install).

## The skills

| Stage | Skill | Use it when | You get |
|---|---|---|---|
| Define | [Brand brief intake](skills/brand-brief-intake/SKILL.md) | Starting anything | A brief with a persona test, unknowns left blank with an owner, and the next skill to run |
| Look | [Art direction extractor](skills/art-direction-extractor/SKILL.md) | You have a mood board or references | Rules for colour, type, imagery, layout and motion, each backed by the references, plus an accessibility pass |
| Look | [Direction to tokens](skills/direction-to-tokens/SKILL.md) | You need a usable palette and type system | Design tokens with a reason per value, CSS variables, and a contrast report ⚙ |
| Name | [Brand naming rubric](skills/brand-naming-rubric/SKILL.md) | You need a name, or aren't sure you need one | A "does it need a name?" check, a ranked shortlist with pronunciation and risks, rejected names, and a clearance list |
| Name | [Name in context](skills/name-in-context/SKILL.md) | You have a shortlist to compare | An offline page with each name as icon, wordmark, URL, handle and in sentences, read aloud, with flags ⚙ |
| Identity | [Logo and identity directions](skills/logo-identity-directions/SKILL.md) | A name is chosen | 3–5 distinct directions with lockups, 16px behaviour, motion and a scorecard |
| Words | [Voice and tone](skills/voice-and-tone/SKILL.md) | You need writing rules | "This, not that" principles with rewrites, tone by context, vocabulary, and a copy linter ⚙ |
| Words | [Claims register](skills/claims-register/SKILL.md) | Copy describes the product | Every claim with a status and source, and a checker that blocks copy running ahead of the product ⚙ |
| Ship | [Asset QA scorecard](skills/asset-qa-scorecard/SKILL.md) | Something is about to ship | A 100-point review with evidence, hard failures, and a verdict computed by script ⚙ |

⚙ ships with a script. Run them with Node.js 18+, no install step:

| Script | What it does |
|---|---|
| `skills/direction-to-tokens/scripts/tokens.mjs` | Contrast report for every text and background pair; `--css` exports CSS variables |
| `skills/name-in-context/scripts/preview.mjs` | Builds the offline name preview page |
| `skills/voice-and-tone/scripts/lint-voice.mjs` | Flags copy that breaks the voice guide |
| `skills/claims-register/scripts/check-copy.mjs` | Flags claims the product can't back yet |
| `skills/asset-qa-scorecard/scripts/score.mjs` | Computes the QA total, floors and verdict |

Usage, flags and exit codes are in [Getting started](docs/getting-started.md#run-the-scripts).

## How a project flows

```text
brief → art direction → tokens → naming → name in context → identity directions → voice → claims → QA
```

Save each output in one project folder under its standard filename (`brief.json`, `art_direction.json`, `tokens.json`…), and hand it to the next skill. Most jobs need only part of the chain. [The workflow](docs/workflow.md) covers each step and some shorter paths ("just name it", "just check this copy").

Here is a real result from the claims checker on the example copy:

```text
P0  line 9 C4  Works offline, so a bad connection never stops a class.
    Planned claim written as if it already works. Use future tense, or cut it.

P1  line 7 C3  Results sync straight to Canvas and Moodle.
    Beta claim without a qualifier such as "in beta" or "early access".

3 P0 · 6 P1 · 1 P2 · claims used: C1, C2, C3, C4, C5
```

## Examples

[`brands/test_project/`](brands/test_project/) has an output from every skill for two fictional products. Aurel, a devotional app, goes through the chain from brief to QA. Numo, a lecture-quiz tool, is used for naming and claims. The [index](brands/test_project/README.md) lists each file. Open [`name_preview.html`](brands/test_project/name_preview.html) in a browser to see the name preview. Names are illustrative and have not been cleared.

## Check outputs

```sh
node scripts/validate-examples.mjs                         # every skill and example
node scripts/validate-examples.mjs my-brand/*.json         # your own outputs
```

The validator checks each file against the schema its filename points to. It also checks rules a schema can't express: totals add up and rank correctly, observations cite real references, colour pairs pass their contrast minimums, verdicts match scores, and voice examples follow their own rules. CI runs it, and every script, on each pull request.

## Docs

- [Getting started](docs/getting-started.md): install for each tool, first run, filenames, scripts, troubleshooting
- [Workflow](docs/workflow.md): a full project, step by step, and shorter paths
- [Principles](docs/principles.md): the lessons from real brand projects behind the skills
- [Changelog](CHANGELOG.md)

## Boundaries

- Scores and flags are judgement, not clearance. Nothing here checks trademarks, company names, handles or domains.
- The skills produce direction, systems and concepts, not finished artwork.
- What you share with an assistant is subject to that provider's data handling. The scripts run locally and make no network calls.
- No license file is included yet. Do not assume an open-source license because the repository is public.
