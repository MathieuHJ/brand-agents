---
name: name-in-context
description: Put shortlisted names where people will actually meet them (wordmark, app icon at 60, 29 and 16px, browser tab and address bar, social handle, everyday sentences) on a single offline HTML page, with a button that speaks each name and flags for shared monograms, awkward possessives, long names and letters that blur at small sizes. Use when a naming shortlist needs comparing, or when someone asks to preview, mock up or sanity-check names.
metadata:
  version: 0.1.0
---

# Name in context

A name that scores well in a table can still fail on a home screen, in a sentence or out loud. This skill builds a page that shows every shortlisted name in the places it will live, so the team can judge them side by side.

## Inputs

- A `naming_candidates.json` from `brand-naming-rubric` (uses its top 10, pronunciations and scores), or a plain list of names

## Method

1. **Build the page.** Run the bundled script:

```sh
node scripts/preview.mjs path/to/naming_candidates.json --out name-preview.html
node scripts/preview.mjs Numo Verveo Lumor --out name-preview.html
```

Resolve `scripts/` relative to this `SKILL.md`. The script prints the flags for each name and writes one HTML file with no external requests. Open it in any browser.

2. **Read the flags.** The script checks:
   - two names sharing a first letter, so their monogram icons look identical at 16px
   - possessives that trip ("Pollis's")
   - names over 10 letters, which crowd an app icon label
   - letter pairs that blur at small sizes ("rn" reads as "m")
   - spaces, accents or symbols that change once the name becomes a handle or a URL
3. **Look at the page,** or ask the user to. If you can view or screenshot it, describe what you see; otherwise, report the script's flags and say the visual check is still the user's.
   - The 16px strip: which names can you tell apart?
   - The sentences: does the name sound natural mid-sentence, and in the possessive?
   - **Say it**: play each name. Can you spell what you hear? (The speech uses the browser's built-in voice, so treat accents as a rough guide.)
   - The wordmark controls: try sans, serif, rounded and mono, and lowercase.
4. **Recommend.** Name what the page changed: which names moved up, which dropped, and why. Flags are prompts, not verdicts; a shared monogram doesn't matter if only one of the two names survives.

## Rules

- Everything on the page is a mock. The address bar and handle are labelled "not checked". Never describe a domain or handle as available.
- The page uses system fonts only. It shows letter shapes, not a finished logo.

## Output

**A. The HTML file** (`name-preview.html`, or the path you chose).

**B. A short read:** for each name worth keeping, one line on how it held up in context; then the names to drop and why; then the next check (usually trademark and domain searches on the survivors, as in `brand-naming-rubric`).

## Next step

Offer `logo-identity-directions` for the name the team picks.
