---
name: voice-and-tone
description: Define a brand's verbal identity (3–5 voice principles with before/after examples, tone by context, words to prefer and avoid, writing mechanics) as a guide people and agents can follow, then screen copy against it with a bundled linter. Use when someone asks for a voice, tone of voice, writing guidelines, a style guide or brand copy rules, or wants copy checked or rewritten in a brand's voice.
metadata:
  version: 0.1.0
---

# Voice and tone

Voice is who the brand is and stays the same everywhere. Tone is how that voice adjusts to the moment: an error message and a launch post are the same person in different rooms. This skill writes both down specifically enough that a new writer, or an agent, can follow them.

## Inputs

- A brief (from `brand-brief-intake`) or a description of the brand, audience and personality
- 3–10 samples of existing copy, good and bad, if any exist
- Copy from competitors or the category, to know what to stand apart from
- Optional: words the team already loves or hates

## Mode 1: write the voice

1. **Listen first.** If there is existing copy, sort it into "sounds like us" and "doesn't", and say what separates the two piles. That difference is usually the voice.
2. **Write 3–5 principles.** Each one is a pair: what it means and what it is not ("Warm, not sugary"). A principle without a "not" is a value statement nobody can apply. Each gets a real before/after rewrite.
3. **Tone by context.** Cover at least the contexts this brand will meet first: onboarding, empty states, errors, reminders or notifications, marketing, support. For each, give up to three tone words, one line of guidance and one example line.
4. **Vocabulary.** `prefer`: the brand's word and the words it replaces. `avoid`: phrases that break the voice, with why and what to say instead. Include the category clichés.
5. **Mechanics.** Case for headings and buttons, contractions, exclamation marks, emoji, numbers, maximum sentence length. These are what the linter checks.
6. **Persona test.** One sentence about one reader that settles arguments, reused from the brief if there is one.
7. **Rewrites.** At least one real line taken from the brand's own copy, rewritten, with the reason.

## Mode 2: check or rewrite copy

1. Save the copy to a file and run the linter:

```sh
node scripts/lint-voice.mjs path/to/voice.json path/to/copy.md
```

Resolve `scripts/` relative to this `SKILL.md`. Add `--json` for machine-readable output. It exits with code 1 on any P1.

2. **P1** breaks a rule (an avoided phrase, a banned exclamation mark or emoji). **P2** is a suggestion (a preferred word, contractions, case, sentence length).
3. Read the copy aloud as well. The linter can't hear tone: "We're thrilled to remind you" passes every rule and still sounds wrong.
4. Rewrite flagged lines and run the linter again. If the copy makes product claims, run `claims-register` too: on-voice and untrue is still untrue.

## Rules

- Principles must be specific to this brand. "Clear, friendly, human" fits every company and guides no one.
- Examples beat adjectives. When in doubt, add another before/after.
- Don't invent the brand's history or values to make the voice sound richer.

## Output

**A. One-page voice guide:** the summary sentence, the principles with examples, the tone table and the top words to avoid.

**B. JSON** matching `schema.json` in this folder:

```json
{
  "brand": "...",
  "voice_summary": "...",
  "persona_test": "...",
  "principles": [
    { "name": "Warm, not sugary", "means": "...", "not": "...", "before": "Amazing! You're on a 7-day streak!", "after": "That's seven mornings this week." }
  ],
  "tone_by_context": [
    { "context": "Errors", "tone": ["plain", "practical"], "guidance": "...", "example": "..." }
  ],
  "vocabulary": {
    "prefer": [{ "word": "reading", "instead_of": ["content"] }],
    "avoid": [{ "phrase": "journey", "why": "...", "instead": "..." }]
  },
  "mechanics": {
    "case": "sentence",
    "contractions": true,
    "exclamation_marks": "never",
    "emoji": "never",
    "max_sentence_words": 20,
    "numbers": "..."
  },
  "rewrites": [{ "before": "...", "after": "...", "why": "..." }]
}
```

`case` is `sentence` or `title`. `exclamation_marks` and `emoji` are `never`, `rare` (at most one per piece) or `allowed`.

## Next step

Offer to rewrite a real page in the new voice, or to check launch copy with both this linter and `claims-register`.
