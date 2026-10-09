---
name: logo-identity-directions
description: Explore 3–5 genuinely different logo and identity directions for a chosen name, each with a strategic angle, mark construction, type, colour logic, lockup and small-size behaviour, plus a comparable scorecard. Concept exploration, not final artwork. Use when someone has a name (and ideally an art direction) and asks for logo ideas, identity routes, brand directions or a sub-brand that must sit beside a parent brand.
metadata:
  version: 0.2.0
---

# Logo and identity directions

Produce 3–5 directions that a team can choose between. Each must be a different strategic bet, not the same idea in another colour.

## Inputs

Required:
- The chosen name
- What it is and who it is for (one or two sentences)

Recommended:
- Art direction JSON from `art-direction-extractor`
- Why the name was chosen
- Parent brand, if this is a sub-brand: its mark, type families and colours
- Where the identity must work first (app icon, website, packaging, social avatar, signage)

## Method

1. **Find the tension.** Name the one or two tensions the identity has to hold (calm vs capable, technical vs human, premium vs approachable). Each direction resolves them differently.
2. **Set the relationship to a parent brand** if there is one:
   - `sibling`: clearly related, clearly its own. Inherit type, grounds and construction grammar; change one flex point (an accent, a motif, the wordmark case).
   - `endorsed`: own mark, small "by Parent" endorsement in a fixed place.
   - `independent`: no visible link.
   For a derived mark, reuse the parent's components (stroke weight, terminals, corner radius) and change only the composition. That keeps the family recognisable without sharing a letter.
3. **Generate 3–5 directions.** Vary the mark type and construction across directions, not just style. Useful spread: one wordmark-led, one symbol-led, one system-led (a pattern, motif or frame that does the work).
4. **Stress-test each direction on paper:**
   - **16px test:** what survives as a favicon or app icon? If it is only the first letter, say so.
   - **One-colour test:** does it work in a single colour on light and dark before any gradient or effect?
   - **Lockup budget:** at most two elements per placement (for example mark + wordmark, or wordmark + accent dot, never all three). Decide which placement gets which pair.
   - **Motion:** how it enters or behaves in product, and its reduced-motion fallback (the final state, instantly).
   - **Cliché check:** which category trope it risks (padlocks for security, leaves for wellness, neural nets for AI) and how it avoids it.
5. **Score every direction** 1–5 on the same five criteria so the comparison is honest:
   distinctiveness · strategic fit · scalability across surfaces · legibility and accessibility · production effort (5 = cheapest to produce and maintain).
6. **Recommend which direction to explore first** and why, without declaring a winner. The choice belongs to the team.

## Rules

- Concept exploration only. Do not present a direction as finished artwork.
- Describe colour as mood and contrast strategy. Use hex values only if they come from the art direction input; otherwise say "to be defined".
- Name type by classification and characteristics. A specific family is allowed only when it comes from the parent brand or the art direction input, and must be marked as a suggestion.
- Keep directions mutually exclusive. If two directions would produce similar sketches, merge them and write a new one.
- Do not imitate an existing logo. If a direction is close to a known mark, say which and change it.

## Output

Return two things:

**A. Narrative** (max 200 words): the tension, how the directions spread across it, and which to explore first.

**B. JSON object** matching `schema.json` in this folder:

```json
{
  "brand_name": "...",
  "core_tension": "...",
  "parent_relationship": "none",
  "directions": [
    {
      "direction_name": "...",
      "strategic_intent": "...",
      "logo_concept": {
        "mark_type": "wordmark",
        "geometry": "...",
        "notes": "..."
      },
      "typography_approach": "...",
      "color_logic": "...",
      "lockups": "...",
      "small_size_behavior": "...",
      "motion_behavior": "...",
      "personality_keywords": ["..."],
      "pros": ["..."],
      "risks": ["..."],
      "cliche_to_avoid": "...",
      "best_use_cases": ["..."],
      "scorecard": {
        "distinctiveness": 4,
        "strategic_fit": 4,
        "scalability": 3,
        "legibility": 5,
        "production_effort": 4
      }
    }
  ],
  "explore_first": { "direction_name": "...", "reason": "..." },
  "open_questions": ["..."]
}
```

`mark_type` is one of `wordmark`, `lettermark`, `symbol`, `combination`, `emblem`, `system`. `parent_relationship` is one of `none`, `sibling`, `endorsed`, `independent`.

## Next step

Offer to turn the chosen direction into a one-page brief for a designer, or into prompts for sketching marks.
