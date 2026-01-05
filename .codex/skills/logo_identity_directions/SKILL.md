---
name: logo_identity_directions
description: Generate multiple distinct logo and brand identity directions based on a selected name and art direction
version: 0.1.0
---

## Purpose
Create 3–5 clearly differentiated logo and identity directions that explore different strategic interpretations of the same brand name and art direction.

This is not final design. It is concept exploration.

## Inputs (required)
- Selected brand name
- Art direction JSON
- Optional: short rationale for why the name was chosen

## Method
1. Identify the core tension(s) in the art direction (e.g. calm vs expressive, technical vs human).
2. Generate 3–5 identity directions, each with:
   - A distinct strategic angle
   - A clear visual philosophy
   - A different logo construction approach
3. Ensure directions are meaningfully different, not cosmetic variations.

## For each direction, define:
- Direction name (short, evocative)
- Strategic intent (what this direction optimizes for)
- Logo concept:
  - Mark type (wordmark, symbol, combination)
  - Geometry (soft, sharp, modular, organic, etc.)
  - Motion or static bias
- Typography approach:
  - Serif / sans / custom / hybrid
  - Key characteristics
- Color logic:
  - Palette mood (not hex codes yet)
  - Contrast strategy
- Brand personality keywords
- Pros
- Risks / trade-offs
- Best use cases

## Constraints
- Do not invent colors, fonts, or logos yet
- No final decisions
- Avoid trendy clichés unless explicitly justified
- Keep directions mutually exclusive

## Output format
Return:
A) A short narrative introduction (max 200 words)
B) A JSON array exactly matching:

{
  "brand_name": "...",
  "directions": [
    {
      "direction_name": "...",
      "strategic_intent": "...",
      "logo_concept": {
        "mark_type": "...",
        "geometry": "...",
        "notes": "..."
      },
      "typography_approach": "...",
      "color_logic": "...",
      "personality_keywords": ["..."],
      "pros": ["..."],
      "risks": ["..."],
      "best_use_cases": ["..."]
    }
  ]
}
