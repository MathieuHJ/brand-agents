# Getting started

This guide takes you from nothing installed to your first saved output. For a full project walkthrough, read [the workflow](workflow.md) next.

## What you need

- **An AI assistant.** Claude Code, Codex and Claude.ai load skills directly. Any other assistant works if you paste the instructions in.
- **An image-capable model** for mood boards (`art-direction-extractor`).
- **Node.js 18 or later**, only if you want to run the scripts yourself. Check with `node --version`; install from [nodejs.org](https://nodejs.org) if needed. The skills work without it.

## Install

Pick the one that matches how you work.

### Claude Code: install as a plugin (recommended)

In Claude Code, run:

```text
/plugin marketplace add MathieuHJ/brand-agents
/plugin install brand-agents@brand-agents
```

Or from a terminal:

```sh
claude plugin marketplace add MathieuHJ/brand-agents
claude plugin install brand-agents@brand-agents
```

Check it worked with `claude plugin list`: you should see `brand-agents@brand-agents` with status enabled. The skills are then available in every project. You can call one directly by name, for example `/brand-agents:brand-brief-intake`, or just describe the task and let Claude pick the skill.

Installed skills are light: each adds roughly 100 tokens to a session (its name and description), and the full instructions load only when a skill is used.

**Update** when a new version is out:

```sh
claude plugin marketplace update brand-agents
claude plugin update brand-agents@brand-agents
```

Restart Claude Code after updating.

**Remove** with `claude plugin uninstall brand-agents@brand-agents`.

### Claude Code or Codex: work inside this repository

```sh
git clone https://github.com/MathieuHJ/brand-agents.git
cd brand-agents
```

Open the folder in your tool. The skills load automatically, because `skills/` is linked from the folders each tool reads:

| Tool | Reads skills from |
|---|---|
| Claude Code | `.claude/skills` |
| Codex | `.agents/skills` (current), `.codex/skills` (older versions) |

This is the best setup if you also want to run the scripts and validator, since everything is already in place.

To use the skills in other projects without the plugin, copy the folders from `skills/` into your personal skills folder: `~/.claude/skills/` for Claude Code, `~/.agents/skills/` for Codex. The release page also has `brand-agents-all-skills.zip` with every skill folder, if you'd rather not clone.

On Windows, Git may check the links out as plain files. If the skills don't appear, copy `skills/` into those folders instead.

### Claude.ai and the Claude desktop app

1. Download the ZIP for the skill you want from the [latest release](https://github.com/MathieuHJ/brand-agents/releases/latest). Each skill is a separate ZIP.
2. In Claude, open **Settings → Capabilities** and make sure **code execution** is on. Custom skills need it. They are available on paid plans.
3. Upload the ZIP. The skill appears in your list, where you can switch it on or off.

Menu names in Claude change from time to time. If you can't find the upload button, search the Claude Help Center for "using skills in Claude".

### Any other assistant

Open a skill's `SKILL.md` on GitHub, copy all of it into the conversation, then add your request. Run the scripts on your own computer (see [Run the scripts](#run-the-scripts)).

## Your first run

Start with the brief. It tells you which skill to run next.

> Help me write a brand brief. It's a daily devotional app: one short reading and one question a day, about five minutes. It's for adults with a faith practice, on their phone, early morning.

You get back:

- **A one-page brief** in plain language, with open questions at the top if any block the work.
- **A JSON block** with the same content in a fixed structure. Unknown facts are left as `null` with an owner, not guessed.
- **A next-skill list**, such as "art-direction-extractor: ready" or "claims-register: not ready, needs your feature list".

Answer the questions it asks, or reply "defaults are fine". Then save the JSON (next section) and ask for the next skill it suggests.

## Save outputs with the standard filenames

Keep one folder per project and save each skill's JSON under its standard name. The next skill can read the file, and the validator uses the filename to pick the right schema.

| Skill | Save as | Script |
|---|---|---|
| `brand-brief-intake` | `brief.json` | |
| `art-direction-extractor` | `art_direction.json` | |
| `direction-to-tokens` | `tokens.json` | `tokens.mjs`: contrast report, CSS |
| `brand-naming-rubric` | `naming_candidates.json` | |
| `name-in-context` | `name-preview.html` (made by the script) | `preview.mjs`: preview page |
| `logo-identity-directions` | `logo_directions.json` | |
| `voice-and-tone` | `voice.json` | `lint-voice.mjs`: copy linter |
| `claims-register` | `claims_register.json` | `check-copy.mjs`: claim checker |
| `asset-qa-scorecard` | `qa_scorecard.json` | `score.mjs`: total and verdict |

For example: `my-brand/brief.json`, `my-brand/art_direction.json`, and so on. In Claude Code or Codex, ask the agent to save the file for you: "Save the JSON as my-brand/brief.json."

## Run the scripts

The scripts need Node.js 18+ and nothing else. No `npm install`. From the repository root:

```sh
# Contrast report for your tokens, and CSS custom properties
node skills/direction-to-tokens/scripts/tokens.mjs my-brand/tokens.json
node skills/direction-to-tokens/scripts/tokens.mjs my-brand/tokens.json --css > tokens.css

# Preview shortlisted names in context (opens offline in any browser)
node skills/name-in-context/scripts/preview.mjs my-brand/naming_candidates.json --out my-brand/name-preview.html

# Check copy against your voice guide and your claims register
node skills/voice-and-tone/scripts/lint-voice.mjs my-brand/voice.json my-brand/homepage.md
node skills/claims-register/scripts/check-copy.mjs my-brand/claims_register.json my-brand/homepage.md

# Compute a QA scorecard's total and verdict, and write them into the file
node skills/asset-qa-scorecard/scripts/score.mjs my-brand/qa_scorecard.json --write
```

What the results mean:

| Script | Exit code 1 means | Severity labels |
|---|---|---|
| `tokens.mjs` | A declared contrast pair misses its minimum | pass / FAIL per pair |
| `check-copy.mjs` | At least one P0 (blocks publishing) | P0 block · P1 should change · P2 worth a look |
| `lint-voice.mjs` | At least one P1 (breaks a voice rule) | P1 breaks a rule · P2 suggestion |
| `score.mjs` | The scorecard's input is inconsistent | verdict: pass / revise / reject |

Exit codes let you run the checkers in CI. Copy files can be Markdown or plain text.

If you installed the plugin, the agent can run these for you: ask "check this copy against my claims register" and it will find the script inside the plugin. To run them by hand, clone the repository.

## Check your outputs

The validator checks any output against its schema, plus rules a schema can't express: score totals, ranking order, references cited in art direction, contrast in tokens, the scorecard verdict, and voice examples that break their own rules.

```sh
node scripts/validate-examples.mjs my-brand/naming_candidates.json
```

If it reports problems, paste them back to the assistant and ask it to fix the JSON. Run it with no arguments to check every skill and example in the repository.

## Tips

- **Name the skill if it doesn't kick in.** "Use the brand-naming-rubric skill to…" always works.
- **Pass earlier outputs along.** "Here's my brief.json and art_direction.json, now give me tokens." Each skill gets better with the previous step's file.
- **Ask for both parts.** Every JSON-producing skill returns a readable summary and JSON. If you only got one, ask for the other.
- **Treat scores as judgement.** Naming scores, QA scores and flags are a structured opinion. Nothing here checks trademarks, domains or handles.

## Troubleshooting

**The skills don't show up in Claude Code.** Run `claude plugin list`. If `brand-agents` is missing, repeat the install. If it's disabled, run `claude plugin enable brand-agents@brand-agents`. Restart Claude Code after installing.

**Codex doesn't list the skills.** Make sure you opened the repository folder itself. Newer Codex versions read `.agents/skills`, older ones `.codex/skills`; both are linked. Restart Codex if it was already open.

**The JSON doesn't validate.** Save it under its standard filename, run the validator, and paste the errors back to the assistant. The usual causes are a missing field or a total that doesn't add up.

**`node: command not found`.** Install Node.js 18 or later from [nodejs.org](https://nodejs.org). The skills still work without it; only the scripts need it.

**The "Say it" button is silent** in the name preview. It uses your browser's built-in voices. Check the system volume, or try another browser.

## Privacy

The skills are text files and the scripts run locally with no network calls. What you paste or upload into an assistant goes to that assistant's provider under their terms. Only share references and briefs you're allowed to share.
