---
name: brand-naming-rubric
description: Generate, screen and rank brand, product, studio or app names with a transparent 1–5 rubric, linguistic checks and a clearance to-do list. Also decides whether something needs its own name at all. Use when someone asks for a name, a name list, feedback on a shortlist, or whether a product or feature should be named.
metadata:
  version: 0.2.0
---

# Brand naming rubric

Generate names that are memorable, sayable and ownable, rank them honestly, and hand back a clear list of checks a human still has to do. Scores are judgement, not clearance.

## Inputs (ask only if missing and essential)

- Idea in 1–3 sentences, and who it is for
- Category and the competitors it must not sound like
- 3–10 tone adjectives
- Languages and markets where the name must work
- Constraints: length, forbidden words or themes, whether initials are allowed
- Architecture: is this a standalone brand, a product under a parent brand, or a feature?

If something is missing, proceed with stated assumptions rather than stalling.

## Step 0 — Does this need a name?

Before generating, check the architecture. A new product deserves its own name only when all three hold:
1. It targets people who do not know or care about the parent brand.
2. It needs its own acquisition channel (app store listing, standalone domain, paid campaigns).
3. It has a team that will look after the name.

Otherwise recommend a descriptive name (`Parent + plain function word`, e.g. "Acme Notes") and say why. Features inside a product are described, never branded ("the model picker", not "Acme Lens"). Naming sprawl costs more than a plain name. If the user still wants invented names, continue and note the recommendation in `assumptions`.

## Method

1. **Generate 30–60 candidates** across at least six strategies and tag each one:
   `invented` · `compound` · `metaphor` · `real-word` · `foreign-root` · `altered-spelling` · `initialism` (only if allowed)
2. **Kill screen.** Drop a candidate outright if it:
   - is a well-known person's name, a famous character, or an existing major brand in any category
   - has a negative, rude or awkward meaning in a target language (check slang, not just dictionaries)
   - cannot be spelled after hearing it once (the "radio test"), or said after reading it once
   - is a category cliché: suffixes like -ly, -ify, -hub, -labs, -io, -ai, or a dropped vowel, unless the brief justifies it
   - is a generic descriptor that could not be protected
3. **Score the top 15**, 1–5 on each criterion (max 25):

   | Criterion | 5 means | 1 means |
   |---|---|---|
   | Memorability | Sticks after one hearing | Forgotten by the next sentence |
   | Pronounceability | One obvious pronunciation in every target language | Several plausible pronunciations |
   | Distinctiveness | Nothing similar in the category | Close to a competitor pattern |
   | Semantic fit | Evokes the idea without describing it | Unrelated or misleading |
   | Visual potential | Strong letterforms, works as a wordmark and at app-icon size | Awkward letters, too long |

   `score_total` must equal the sum of the five scores. Break ties on distinctiveness.
4. **Linguistic notes.** For each top-10 name, give a respelled pronunciation (e.g. "NOO-moh") and note meanings or sound-alikes in each target language. Say plainly when you are not confident about a language.
5. **Sort the shortlist:**
   - Top 10, ranked, with rationale and honest risks
   - Safe 5: lowest risk, easiest to clear and explain
   - Wildcard 5: highest originality, more risk
   Safe and wildcard picks may overlap with the top 10.
6. **Clearance to-do list** in `next_steps`, in this order: trademark search in the relevant classes and markets, company-name registry, app stores, social handles, domains (.com plus one relevant TLD). Only suggest TLDs anyone can register; restricted ones like .edu or .gov are not options for a brand.

## Rules

- Never claim a name, domain or handle is available or "clear". You have not checked.
- Do not present a name as invented if you know it exists.
- Say what you assumed about audience and markets.

## Output

Return two things:

**A. Readable summary:** your top 3 with one line each, the main trade-off between safe and wildcard, and the first check to run.

**B. JSON** matching `schema.json` in this folder:

```json
{
  "idea": "...",
  "assumptions": ["..."],
  "architecture_recommendation": "standalone name | descriptive name | feature, do not name — with one-line reason",
  "top_10": [
    {
      "name": "...",
      "strategy": "invented",
      "pronunciation": "NOO-moh",
      "score_total": 22,
      "scores": {
        "memorability": 4,
        "pronounceability": 5,
        "distinctiveness": 4,
        "semantic_fit": 4,
        "visual_potential": 5
      },
      "rationale": "...",
      "linguistic_notes": ["..."],
      "risks": ["..."],
      "recommended_domain_checks": [".com", ".io"]
    }
  ],
  "safe_5": ["..."],
  "wildcard_5": ["..."],
  "filtered_out": [{ "name": "...", "reason": "..." }],
  "next_steps": ["..."]
}
```

`architecture_recommendation`, `linguistic_notes` and `filtered_out` are optional but recommended. Include a few `filtered_out` entries so the user can see the kill screen working.

## Next step

When the user picks a name, offer `logo-identity-directions` (with an art direction JSON from `art-direction-extractor` if one exists).
