---
name: brand_naming_rubric
description: Generate and rank brand names using a structured, non-obvious naming rubric
version: 0.1.0
---

# Skill: brand_naming_rubric

## Purpose
Generate and rank brand names from an idea. Prioritize non-obvious names that are memorable, pronounceable, and brandable, while avoiding clichés and high collision risk.

## When to use
Use this skill whenever the user asks for a brand/product/studio/app name or name list.

## Inputs (ask if missing)
- Idea summary (1–3 sentences)
- Industry / domain
- Brand vibe (3–10 adjectives)
- Constraints:
  - Length preference (short/medium/any)
  - Language(s)
  - Forbidden words / themes
  - If initials/abbreviations allowed
  - Competitors to avoid sounding like
  - Geographic scope

## Method
1. Clarify constraints ONLY if essential; otherwise proceed with reasonable assumptions and note them.
2. Generate 30–60 candidates across at least 6 strategies:
   - Invented/phonetic
   - Compound (but avoid obvious clichés)
   - Metaphor/evocative
   - Foreign-root (check for awkwardness)
   - Abbreviation/initialism (only if allowed)
   - Misspelling/altered spelling (sparingly)
3. Filter out:
   - Hard-to-pronounce or ambiguous spellings
   - Obvious clichés (e.g., “ly”, “ify”, “hub”, “labs” unless justified)
   - Names that are too generic, too descriptive, or too close to competitor patterns
4. Score the top 15 with a 1–5 rubric:
   - Memorability
   - Pronounceability
   - Distinctiveness (low collision risk)
   - Semantic fit
   - Visual/typographic potential
5. Return:
   - A ranked top 10 with rationale
   - 5 “wildcard” options (high originality)
   - 5 “safe” options (lower risk)
6. Include “search/domain checks needed” notes:
   - Suggest checking .com + one relevant TLD (do not claim availability)

## Output format
Return in two formats:
A) A readable summary
B) A JSON block exactly matching:

{
  "idea": "...",
  "assumptions": ["..."],
  "top_10": [
    {
      "name": "...",
      "score_total": 0,
      "scores": {
        "memorability": 0,
        "pronounceability": 0,
        "distinctiveness": 0,
        "semantic_fit": 0,
        "visual_potential": 0
      },
      "rationale": "...",
      "risks": ["..."],
      "recommended_domain_checks": [".com", "..."]
    }
  ],
  "safe_5": ["..."],
  "wildcard_5": ["..."],
  "next_steps": ["..."]
}
