---
name: asset-qa-scorecard
description: Review a finished design asset (social post, ad, app store screenshot, landing hero, deck slide, packaging) against a weighted 100-point rubric with hard failures, a pass threshold and a per-dimension floor, naming concrete evidence and fixes instead of "looks good". A bundled script does the arithmetic and the verdict. Use when someone asks to review, QA, critique, sign off or score an asset or a batch of assets before it ships.
metadata:
  version: 0.1.0
---

# Asset QA scorecard

"Looks good" is not a review. This skill scores an asset against named criteria, records the evidence behind each score, and lets a script decide pass, revise or reject so the verdict cannot drift from the numbers.

## Inputs

- The asset (image, screenshot, link or file) and where it will run: channel, format, the smallest size it will be seen at
- The brand rules it must follow: an art direction JSON, guidelines, or a brief
- The claims register, if the asset makes product claims
- Optional: a custom rubric or threshold

## Default rubric

| ID | Dimension | Weight | Full marks means |
|---|---|---:|---|
| `message` | Message clarity | 20 | One message, understood in about three seconds |
| `brand_fit` | Brand fit | 18 | Unmistakably this brand; follows the art direction |
| `distinctiveness` | Distinctiveness | 15 | Would stop a scroll; not a category template |
| `truth` | Product truth | 15 | Every claim, screen and label matches what has shipped |
| `composition` | Hierarchy and composition | 12 | The eye lands in the intended order |
| `accessibility` | Legibility and accessibility | 10 | Readable at the smallest size; WCAG AA contrast; alt text possible |
| `craft` | Craft | 5 | Clean edges, spacing, type and image quality |
| `resilience` | Crops and formats | 5 | Survives every required crop and placement |

Weights add up to 100. Default threshold: **85** for everyday assets, **92** for campaign hero assets. Floor: no dimension may score below **70%** of its weight.

## Hard failures

Any one of these rejects the asset, whatever the score:

- `HF1` A claim that is unsupported, or a wrong release state (beta shown as shipped)
- `HF2` Invented UI, product, data or logo presented as real
- `HF3` Key text unreadable at the smallest size, or below WCAG AA contrast
- `HF4` Key information lost in a required crop
- `HF5` Retired or off-brand colours, type or logo versions
- `HF6` People shown as stereotypes, distorted, or without the rights to use them
- `HF7` Polished but without a job: nobody can say what it is for

## Method

1. **Check independence.** If you made this asset in this conversation, you are not an independent reviewer. Set `reviewer.independent` to `false` and recommend a second review by someone else.
2. **View it at its real size.** Judge legibility at the smallest placement (for example 360px wide for a phone feed), not zoomed in.
3. **Hard failures first.** Check each rule and record the evidence, triggered or not.
4. **Score each dimension** from 0 to its weight. Each score needs `evidence`: what you saw, specifically ("headline is 14px on a mid-grey photo, about 2.8:1"). Any score below full marks needs a `fix`.
5. **Run the script** to compute the total and verdict. Do not add up the numbers yourself:

```sh
node scripts/score.mjs path/to/qa_scorecard.json --write
```

Resolve `scripts/` relative to this `SKILL.md`. Without `--write` it prints the result and leaves the file alone.

6. **Top fixes.** List the three changes that would move the score most, biggest first.

### Batch review

For a set of assets, score each one, then check the set: does it read as one brand without repeating itself? Does every label and claim have a source? A strong single asset can still be cut if it starts a second visual language.

## Output

**A. Verdict line** (for example "Revise: 81/100, accessibility below floor"), the triggered hard failures, and the top three fixes.

**B. JSON** matching `schema.json` in this folder. `total`, `verdict` and each dimension's `below_floor` are written by the script:

```json
{
  "asset": { "name": "...", "channel": "...", "format": "1080×1920", "smallest_view": "360px wide" },
  "reviewer": { "name": "...", "independent": true },
  "threshold": 85,
  "floor_ratio": 0.7,
  "dimensions": [
    { "id": "message", "label": "Message clarity", "weight": 20, "score": 17, "evidence": "...", "fix": "...", "below_floor": false }
  ],
  "hard_failures": [
    { "id": "HF1", "rule": "Unsupported claim or wrong release state", "triggered": false, "evidence": "..." }
  ],
  "total": 0,
  "verdict": "revise",
  "top_fixes": ["..."]
}
```

`verdict` is `pass`, `revise` or `reject`: any triggered hard failure rejects; a total under the threshold or any dimension below its floor means revise; otherwise pass.

## Next step

Offer to rewrite or redesign against the top fixes, then score the new version as a fresh review.
