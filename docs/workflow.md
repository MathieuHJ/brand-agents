# Workflow: from brief to shipped asset

One project, step by step, using the skills in order. Each step shows what to ask, what comes back, what to check, and what to save. The example is Aurel, a fictional devotional app; its real outputs are in [`brands/test_project/`](../brands/test_project/).

You don't need every step. See [Shorter paths](#shorter-paths) for common jobs.

```text
brief → art direction → tokens → naming → name in context → identity directions → voice → claims → QA
```

Keep everything in one folder, for example `aurel/`, and save each output under the filename given below. [Getting started](getting-started.md#save-outputs-with-the-standard-filenames) explains why.

---

## 1. Write the brief

**Skill:** `brand-brief-intake`

> Help me write a brand brief. Here are my notes: [paste notes, deck text or a link].

**You get:** a one-page brief, at most six questions (each with a default), and a list of which skill is ready next.

**Check:** the persona test is about one specific person; unknowns are `null` with an owner rather than guessed; any contradictions in your notes are listed as open questions.

**Save:** `aurel/brief.json`

## 2. Pull art direction from references

**Skill:** `art-direction-extractor`. Use a model that can see images.

> Here's my brief.json and eight reference images. Extract the art direction. Tell me if the references disagree.

**You get:** a short narrative, then rules for colour, type, imagery, layout and motion. Each observation cites the references that show it (R1, R3). You also get a cliché to watch, accessibility risks, and first steps for the logo, UI and content people.

**Check:** each rule is specific enough to fail a design against; hex values are marked `sampled` or `proposed`; if the references pulled in different directions, they were split into clusters, not averaged.

**Save:** `aurel/art_direction.json`

## 3. Turn the direction into tokens

**Skill:** `direction-to-tokens`

> Turn art_direction.json into design tokens and check the contrast.

**You get:** colour roles (background, text, fill, border), type sizes, spacing, radii and motion, each with a reason, and a contrast report.

**Check:** run the report yourself and confirm every declared pair passes:

```sh
node skills/direction-to-tokens/scripts/tokens.mjs aurel/tokens.json
node skills/direction-to-tokens/scripts/tokens.mjs aurel/tokens.json --css > aurel/tokens.css
```

In the Aurel example, the brand lavender only reached 3.37:1 under white text, so it stayed decorative and a deeper shade took over links and buttons.

**Save:** `aurel/tokens.json` (and `tokens.css` if you want it)

## 4. Find a name

**Skill:** `brand-naming-rubric`. Skip this if the name is settled.

> Name this product. Here's brief.json. English first, US and UK. Avoid anything that sounds like [competitors].

**You get:** first, a check on whether it needs its own name at all. Then a ranked top 10 with pronunciation, language notes and risks, five safe and five wildcard picks, the names it rejected and why, and a list of checks to run.

**Check:** totals add up and the ranking follows them (the validator checks both); nothing claims a domain or trademark is available.

**Save:** `aurel/naming_candidates.json`

## 5. See the names in context

**Skill:** `name-in-context`

> Show me the shortlist in context.

Or run it yourself:

```sh
node skills/name-in-context/scripts/preview.mjs aurel/naming_candidates.json --out aurel/name-preview.html
```

**You get:** an offline page showing each name as a wordmark, an app icon at three sizes, a browser tab, a handle and in sentences, with a Say it button. Flags cover shared first letters (identical 16px icons), awkward possessives, long names and letters that blur together.

**Check:** open the page. Can you tell the icons apart at 16px? Can you spell each name after hearing it? Drop names that fail, then run trademark and domain checks on the ones left. That last step is yours; nothing here checks availability.

**Save:** `aurel/name-preview.html`

## 6. Explore identity directions

**Skill:** `logo-identity-directions`

> We picked "Aurel". Using art_direction.json, give me identity directions. The app icon is the first surface.

**You get:** 3–5 directions that differ in strategy, not just style. Each covers lockups (at most two elements per placement), how it holds up at 16px, motion with a reduced-motion fallback, the cliché to avoid, and a scorecard. You also get a recommendation on which to explore first.

**Check:** two directions that would lead to similar sketches should have been merged; colours and fonts are mood unless they came from your inputs.

**Save:** `aurel/logo_directions.json`

## 7. Write the voice

**Skill:** `voice-and-tone`

> Write Aurel's voice guide. Here's brief.json and some copy we already have: [paste].

**You get:** 3–5 principles written as "this, not that", each with a before/after rewrite. Plus tone by context (onboarding, errors, reminders…), words to prefer and avoid, and mechanics such as case, contractions and emoji.

**Check:** run your existing copy through the linter:

```sh
node skills/voice-and-tone/scripts/lint-voice.mjs aurel/voice.json aurel/onboarding.md
```

**Save:** `aurel/voice.json`

## 8. Keep claims honest

**Skill:** `claims-register`

> Build a claims register from these release notes: [paste]. Then check homepage.md against it.

**You get:** every product claim with a status (shipped, beta, planned, proposed, retired) and a source. A copy check then flags features written as live before they ship, beta features without a label, universal promises and unsourced numbers.

**Check:**

```sh
node skills/claims-register/scripts/check-copy.mjs aurel/claims_register.json aurel/homepage.md
```

Fix every P0 before publishing. Run the voice linter on the same file: copy can be on-voice and still untrue.

**Save:** `aurel/claims_register.json`

## 9. Review what ships

**Skill:** `asset-qa-scorecard`. Ideally run it in a fresh conversation or by someone who didn't make the asset.

> Review this app store screenshot. It runs in the app store listing and is seen at about 120px wide in search. Use voice.json and claims_register.json as the rules.

**You get:** seven hard-failure checks, eight weighted scores out of 100, each with evidence and a fix, the three biggest fixes, and a verdict computed by the script.

**Check:**

```sh
node skills/asset-qa-scorecard/scripts/score.mjs aurel/qa_scorecard.json --write
```

Any hard failure rejects the asset. A total under 85, or any criterion under 70% of its weight, means revise.

**Save:** `aurel/qa_scorecard.json`

---

## Shorter paths

| You want to… | Run |
|---|---|
| Name something | brief (optional) → `brand-naming-rubric` → `name-in-context` |
| Turn a mood board into a usable system | `art-direction-extractor` → `direction-to-tokens` |
| Check launch copy before it goes out | `claims-register` (+ `voice-and-tone` if you have a voice) |
| Review a design before it ships | `asset-qa-scorecard` |
| Refresh an existing brand | `brand-brief-intake` (stage: refresh) → `art-direction-extractor` on current and target references → `direction-to-tokens` |
| Add a product under an existing brand | `brand-brief-intake` (stage: sub-brand) → `brand-naming-rubric`, which checks first whether it needs a name → `logo-identity-directions` with the sibling or endorsed relationship |

## Check everything at once

```sh
node scripts/validate-examples.mjs aurel/*.json
```

Each file is checked against the schema its filename points to.
