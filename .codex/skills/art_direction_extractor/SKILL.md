---
name: art_direction_extractor
description: Extract structured, actionable art direction from mood boards and visual references
version: 0.1.0
---

# Skill: art_direction_extractor

## Purpose
Turn a mood board (images/links) into a clear, actionable art direction specification that can drive logo, brand identity, and UI design.

## When to use
Use whenever the user provides a mood board, visual references, or asks for art direction.

## Inputs
- Mood board images (required)
- Optional: brand adjectives, audience, competitors, “must avoid” list

## Method
1. Describe patterns observed:
   - Composition, geometry, rhythm
   - Color tendencies and contrast style
   - Typography vibe and spacing
   - Texture/material cues
   - Photography/illustration style
2. Convert subjective observations into rules:
   - Do/Don’t statements
   - 3–5 “style axes” (e.g., minimal ↔ expressive, soft ↔ sharp)
3. Produce a spec that is usable by:
   - Logo designer
   - UI designer
   - Content creator

## Output format
Return in two formats:
A) A concise narrative (max 300 words)
B) A JSON block exactly matching:

{
  "style_keywords": ["..."],
  "style_axes": [
    { "axis": "minimal ↔ expressive", "target": "..." }
  ],
  "color_mood": {
    "description": "...",
    "avoid": ["..."]
  },
  "typography_mood": {
    "description": "...",
    "dos": ["..."],
    "donts": ["..."]
  },
  "imagery_rules": {
    "photography_or_illustration": "...",
    "dos": ["..."],
    "donts": ["..."]
  },
  "layout_rules": {
    "dos": ["..."],
    "donts": ["..."]
  },
  "references_summary": ["..."],
  "risks_or_watchouts": ["..."]
}
