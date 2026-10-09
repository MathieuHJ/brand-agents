---
name: brand-brief-intake
description: Turn a messy starting point (a chat, a deck, a few notes, a website) into a structured brand brief, asking only the questions that change the work and leaving unknowns visibly blank with an owner. Ends with which brand skill can run next and what each is still missing. Use when starting any brand, rebrand, sub-brand, naming, campaign or asset project, or when someone says "help me write a brief" or "where do I start".
metadata:
  version: 0.1.0
---

# Brand brief intake

A brief is the cheapest place to find out you disagree. This skill gets one written fast, without inventing anything, and tells you what is still missing before design starts.

## Inputs

Anything the user has: notes, a pitch deck, a product page, a competitor list, an old brief, a voice memo transcript. If they have nothing, start from the questions.

## Method

1. **Extract first.** Read everything provided and fill what you can. Quote or point to where each fact came from when it is not obvious.
2. **Ask one round of questions, at most six.** Choose the questions whose answers would change the work most. Usually:
   - What is this, in one sentence, and who is it for first?
   - What should someone believe after five seconds with it?
   - What must it never look or sound like?
   - Where will people meet it first (app icon, website, packaging, social)?
   - Is there a parent brand, and how close should this sit to it?
   - What is fixed already: name, colours, logo, deadline, budget?
   Give a suggested default for each, so the user can reply "defaults are fine".
3. **Unknown stays blank.** Never fill a fact by guessing: a price, a date, a market, a product capability, a legal constraint. Set it to `null` and add an open question with an owner. Assumptions you do make go in `assumptions`, labelled as such.
4. **Write the persona test.** One sentence about one specific person that will settle later arguments. "Would a sceptical secondary-school teacher trust this in five seconds?" beats "appeals to educators".
5. **Separate the stage.** A new brand, a refresh, a sub-brand, a campaign and a single asset need different briefs. Say which this is; for a sub-brand, list what it inherits from the parent and the one or two things it may change.
6. **Readiness check.** For each next skill, say whether the brief is ready and what is missing:
   - `brand-naming-rubric`: needs the idea, audience, tone, markets and constraints.
   - `art-direction-extractor`: needs references (or permission to propose some), audience and things to avoid.
   - `logo-identity-directions`: needs a chosen name and first surfaces; ideally an art direction.
   - `claims-register`: needs the list of product facts and their release state.
   - `asset-qa-scorecard`: needs the asset, its channel and format.

## Rules

- Keep the brief to what changes decisions. Company history, mission statements and long competitor essays belong elsewhere.
- Use the user's words for the product and audience. Do not upgrade them into marketing language.
- If two inputs contradict each other (for example, a deck says "premium" and the pricing says "free"), list the conflict as an open question. Do not pick a side silently.

## Output

Return two things:

**A. One-page brief** in plain language: what it is, for whom, the belief to create, the persona test, must-haves and must-nots, surfaces, deliverables, and the open questions at the top if any block the work.

**B. JSON** matching `schema.json` in this folder:

```json
{
  "project": {
    "working_name": "Aurel",
    "name_status": "chosen",
    "one_liner": "...",
    "category": "..."
  },
  "stage": "new-brand",
  "objective": "...",
  "audiences": [
    { "name": "...", "priority": "primary", "context": "...", "must_believe": "..." }
  ],
  "positioning": {
    "problem": "...",
    "promise": "...",
    "proof": ["..."],
    "differentiator": "...",
    "competitors": ["..."]
  },
  "persona_test": "...",
  "personality": { "is": ["..."], "is_not": ["..."] },
  "parent_brand": null,
  "surfaces": [{ "name": "App icon", "priority": 1 }],
  "constraints": {
    "must_include": ["..."],
    "must_avoid": ["..."],
    "languages": ["en"],
    "markets": ["..."],
    "accessibility": "WCAG 2.2 AA",
    "fixed": ["..."]
  },
  "deliverables": [{ "item": "...", "format": "...", "due": null }],
  "budget": null,
  "assumptions": ["..."],
  "open_questions": [{ "question": "...", "owner": "...", "blocks": ["logo-identity-directions"] }],
  "next_skills": [{ "skill": "art-direction-extractor", "ready": true, "missing": [] }]
}
```

`name_status` is `needed`, `chosen` or `existing`. `stage` is `new-brand`, `refresh`, `sub-brand`, `campaign` or `asset`. When there is a parent brand, `parent_brand` is `{ "name": "...", "relationship": "sibling", "inherit": ["..."], "may_change": ["..."] }`, with `relationship` one of `sibling`, `endorsed` or `independent`. Any value you do not know is `null`, with a matching open question.

## Next step

Offer to run the first skill marked `ready`, passing this brief as its context.
