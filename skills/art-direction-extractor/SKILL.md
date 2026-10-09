---
name: art-direction-extractor
description: Turn a mood board or set of visual references into an evidence-backed art direction spec (style axes, colour, type, imagery, layout, motion, accessibility) that a logo designer, UI designer and content creator can each act on. Use when someone shares references, a mood board, screenshots or links and asks for art direction, a visual language, a "vibe", or what the references have in common.
metadata:
  version: 0.2.0
---

# Art direction extractor

Turn references into rules. The output should let three different people — a logo designer, a UI designer and a content creator — make consistent decisions without seeing the mood board.

## Inputs

Required:
- Reference images (attached) or links you can actually open. If you cannot see an image, say so; never describe a reference you have not seen.

Optional, ask only if the answer would change the result:
- Audience and the context where the brand will appear (product UI, packaging, social, print)
- 3–5 brand adjectives
- Competitors or categories to stand apart from
- A "must avoid" list
- An existing parent brand this must inherit from

## Method

1. **Inventory.** Number each reference (R1, R2…). One line each: what it is and the single strongest visual choice in it.
2. **Observe before you interpret.** List recurring patterns with the references that show them:
   composition and rhythm · geometry and corner radius · colour temperature, saturation and contrast · type classification, weight, case and spacing · texture and material · photography vs illustration, lighting, subject · motion cues (if any).
   An observation needs at least two references. A pattern in one reference is an outlier, not a rule.
3. **Check for disagreement.** If the references pull in clearly different directions (for example, calm editorial vs loud collage), do not average them into mush. Split them into 2–4 clusters, describe each, and say which audience or surface each fits best. Then either recommend one primary cluster with the others as controlled secondary layers (for example, "campaign moments only"), or ask the user to choose.
4. **Convert to rules.**
   - 3–5 style axes, each with a position from 0 (left pole) to 100 (right pole) and a one-line reason.
   - Do/don't pairs that are specific enough to fail a design against. "Use rounded corners" is weak; "corner radius 12–20px on cards, never sharp" is usable.
   - Name the cliché this direction is most likely to slide into, and the rule that prevents it.
5. **Colour.** Describe the mood first. Give hex values only when you sampled them from a reference (mark `sampled`) or are clearly proposing them (mark `proposed`). Assign roles: ground, text, one accent, semantic colours. Prefer one accent per surface; extra accents need a job.
6. **Accessibility pass.** Flag where the direction threatens legibility: low-contrast pastel text, thin type at small sizes, text over busy imagery, motion that cannot be reduced. Every proposed text/background pair should be checkable against WCAG 2.2 AA (4.5:1 body, 3:1 large text and UI).
7. **Hand-offs.** Three short lists of what each role should do first: logo, UI, content.
8. **Separate what you know from what you assumed.** Assumptions go in their own list.

## Rules

- Describe visual qualities, not people. Do not identify, name or speculate about anyone shown in a reference.
- Do not name a typeface you only think you recognise as fact. Say "a geometric sans in the spirit of…" or mark it as a guess.
- Do not copy a reference's logo, mascot or signature artwork into the rules. Extract the principle behind it.
- Keep the narrative under 300 words. Rules carry the detail.

## Output

Return two things:

**A. Narrative** (max 300 words): the direction in plain language, the main tension it holds, and the one thing it must never become.

**B. JSON** matching `schema.json` in this folder. Shape:

```json
{
  "summary": "One sentence a stakeholder can repeat.",
  "references": [{ "id": "R1", "description": "...", "key_choice": "..." }],
  "observations": [{ "pattern": "...", "evidence": ["R1", "R3"] }],
  "clusters": [{ "name": "...", "references": ["R1"], "best_for": "...", "role": "primary" }],
  "style_keywords": ["..."],
  "style_axes": [{ "axis": "minimal ↔ expressive", "position": 30, "target": "..." }],
  "color_mood": {
    "description": "...",
    "palette_candidates": [{ "hex": "#F6F5F1", "role": "ground", "source": "sampled" }],
    "avoid": ["..."]
  },
  "typography_mood": { "description": "...", "dos": ["..."], "donts": ["..."] },
  "imagery_rules": { "photography_or_illustration": "...", "dos": ["..."], "donts": ["..."] },
  "layout_rules": { "dos": ["..."], "donts": ["..."] },
  "motion_rules": { "description": "...", "dos": ["..."], "donts": ["..."] },
  "cliche_watch": { "risk": "...", "guardrail": "..." },
  "accessibility_watchouts": ["..."],
  "handoffs": { "logo": ["..."], "ui": ["..."], "content": ["..."] },
  "references_summary": ["..."],
  "assumptions": ["..."],
  "risks_or_watchouts": ["..."]
}
```

`clusters`, `palette_candidates` and `motion_rules` are optional. Omit `clusters` when the references agree.

## Next step

Offer to run `logo-identity-directions` with this JSON once a name is chosen, or `brand-naming-rubric` if there is no name yet.
