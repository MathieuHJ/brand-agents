---
name: direction-to-tokens
description: Turn an art direction (or a brief, a mood description or existing brand colours) into a design token set (colour roles, type, spacing, radius, motion) in Design Tokens format, then export CSS custom properties and check every text and background pair against WCAG with a bundled script. Use when someone wants tokens, a palette, CSS variables or a starter design system from a brand direction, or asks whether brand colours are accessible.
metadata:
  version: 0.1.0
---

# Direction to tokens

An art direction says "soft pastel, rounded, calm". A developer needs `--color-text: #2F3442`. This skill makes that translation, keeps a reason next to each value, and proves the colours are readable before anyone builds with them.

## Inputs

- An art direction JSON from `art-direction-extractor` (best), or a brief, a description, or existing brand colours
- Optional: a parent brand's tokens to inherit, required modes (light, dark), the surfaces to design for

## Method

1. **Start from roles, not swatches.** Every colour gets a `role`:
   - `background`: grounds and surfaces that text sits on
   - `text`: anything read, including links and button labels
   - `fill`: colour areas such as buttons, tags and illustration
   - `border`: dividers, outlines and focus rings
   At minimum: one ground, one surface, one text colour, a muted text colour, one accent, a focus colour.
2. **Use colours from the direction first.** Take sampled or proposed hex values from the art direction. Where a role is missing, derive it from an existing colour (darken, lighten, desaturate) and say so in `$description`.
3. **Fix accessibility in the tokens, not later.** Brand accents are often too light to carry text. Keep the brand colour as a decorative `fill` and derive a deeper `accent-text` for links and buttons. Never weaken a contrast minimum to keep a colour.
4. **Declare the pairs that will actually be used** in `contrast_pairs`, with a minimum: 4.5 for body text and labels, 3 for large text (24px+, or 19px+ bold), icons, focus rings and input edges.
5. **Alias instead of repeating.** If the button fill is the accent text colour, write `"$value": "{color.accent-text}"` so one change updates both.
6. **Type, space, radius, motion.** Carry the art direction's rules into numbers: body size, line height, a 4- or 8-based spacing scale, corner radii, durations and an easing curve. Name font families only when the direction or parent brand names them; otherwise use platform stacks (`ui-rounded`, `system-ui`, `ui-serif`, `ui-monospace`) and say a licensed family is still to choose.
7. **Run the script** to check contrast and export CSS:

```sh
node scripts/tokens.mjs path/to/tokens.json          # contrast report
node scripts/tokens.mjs path/to/tokens.json --css    # CSS custom properties
```

Resolve `scripts/` relative to this `SKILL.md`. The report lists every declared pair and a matrix of every text colour on every background. It exits with code 1 if a declared pair fails. Fix the tokens and run it again; do not hand back a failing set.

8. **Dark mode** is a separate token file with its own pairs (`meta.mode: "dark"`). Do not invert the light set and assume it passes.

## Rules

- A hex value without a reason is a guess. Every non-obvious token gets a `$description`.
- Do not present tokens as final brand colours. They are a tested starting point for a designer to tune.
- Keep names semantic (`text-muted`, `action`), not visual (`grey-500`, `purple`), so a palette change doesn't rename everything.

## Output

**A. Summary:** the colour roles in one short table, which brand colours had to be adjusted and why, and the script's contrast result.

**B. JSON** matching `schema.json` in this folder (Design Tokens Community Group style: `$type`, `$value`, `$description`, aliases in `{group.name}` form):

```json
{
  "meta": { "name": "...", "source": "art_direction.json", "mode": "light", "as_of": "2026-10-09" },
  "color": {
    "ground": { "$type": "color", "$value": "#F4F6FA", "role": "background" },
    "text": { "$type": "color", "$value": "#2F3442", "role": "text" },
    "accent": { "$type": "color", "$value": "#8C84C7", "role": "fill", "$description": "Decorative only" },
    "accent-text": { "$type": "color", "$value": "#5B5299", "role": "text", "$description": "Accent darkened to pass AA" },
    "action": { "$type": "color", "$value": "{color.accent-text}", "role": "fill" }
  },
  "font": { "body": { "$type": "fontFamily", "$value": ["ui-rounded", "system-ui", "sans-serif"] } },
  "font-size": { "body": { "$type": "dimension", "$value": "17px" } },
  "radius": { "card": { "$type": "dimension", "$value": "20px" } },
  "space": { "1": { "$type": "dimension", "$value": "4px" } },
  "duration": { "settle": { "$type": "duration", "$value": "400ms" } },
  "easing": { "settle": { "$type": "cubicBezier", "$value": [0.16, 1, 0.3, 1] } },
  "contrast_pairs": [
    { "text": "{color.text}", "background": "{color.ground}", "min": 4.5, "use": "body text" }
  ],
  "assumptions": ["..."]
}
```

Optional groups: `line-height` (`number`), `font-weight` (`fontWeight`). Colour values are six-digit hex or an alias.

## Next step

Offer the CSS output for a quick styleframe, or `asset-qa-scorecard` once real screens use the tokens.
