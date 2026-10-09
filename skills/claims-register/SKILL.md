---
name: claims-register
description: Build a register of what a product may honestly claim, each claim tagged Shipped, Beta, Planned, Proposed or Retired with a source, then check marketing copy against it with a bundled script that flags unreleased features in the present tense, universal promises, banned phrases and numbers with no source. Use when writing or reviewing launch copy, landing pages, app store text, ads, decks or social posts, or when someone asks "can we say this?".
metadata:
  version: 0.1.0
---

# Claims register

Copy drifts ahead of the product. A register is one list of what is true today, with a status and a source for each claim, so writers and reviewers argue with the list instead of each other.

## Statuses

| Status | Meaning | Where it may appear |
|---|---|---|
| `shipped` | In the current public build | Anywhere, present tense |
| `beta` | Built, limited to testers or early access | Only with a qualifier ("in beta", "early access") |
| `planned` | Decided, not built | Future tense only, and only on surfaces listed in `surfaces` |
| `proposed` | Under discussion | Nowhere public |
| `retired` | Was true, no longer is | Nowhere; rewrite any copy that still says it |

## Mode 1: build the register

1. Collect sources: release notes, the live product, docs, a changelog, the team's answers. A claim with no source is not a claim yet.
2. Write each claim as one plain sentence about what the product does. Prefer **capability framing** ("lets you export to PDF") over **universal framing** ("every report is export-ready").
3. Split compound claims. "Fast, private and free" is three claims with three sources.
4. For each claim, list the words that signal it in copy (`match`), phrasings the team has approved, and phrasings that overreach.
5. Add banned phrases that apply everywhere (guarantees, unproven outcomes, competitor attacks), each with a reason and a safer rewrite.
6. List unknowns. If nobody knows whether something shipped, it is not `shipped`. Give the question an owner.

## Mode 2: check copy

1. Save the copy to a file (Markdown or plain text).
2. Run the bundled checker against the register:

```sh
node scripts/check-copy.mjs path/to/claims_register.json path/to/copy.md
```

Resolve `scripts/` relative to this `SKILL.md`. Add `--json` for machine-readable output. The script exits with code 1 when it finds a P0.

3. Read every sentence yourself as well. The checker matches words; it cannot tell that "not yet available offline" is fine while "works offline" is not if both sit in one sentence. A clean run does not mean the copy is safe.
4. Report findings by severity, then give rewrites:
   - **P0** blocks publishing: proposed, retired or banned claims; planned claims in the present tense.
   - **P1** should change: beta without a qualifier, universal words on a claim, a known overreach phrasing.
   - **P2** worth a look: numbers that appear in no claim, planned claims on surfaces that may not name them.
5. If the copy needs a claim that is not in the register, do not invent one. Add it to `unknowns` with an owner.

## Output

**A. Summary:** for a register, the count per status and the unknowns that block launch copy; for a review, findings grouped P0/P1/P2 with a rewrite for each.

**B. JSON register** matching `schema.json` in this folder:

```json
{
  "product": "...",
  "as_of": "2026-10-09",
  "owner": "...",
  "claims": [
    {
      "id": "C1",
      "statement": "Turns a lecture recording into a quiz.",
      "status": "shipped",
      "source": "Release notes 1.4",
      "match": ["quiz", "recording"],
      "approved_phrasings": ["Turn a recording into a quiz"],
      "overreach_phrasings": ["instantly"],
      "surfaces": []
    }
  ],
  "banned": [{ "phrase": "guaranteed", "reason": "...", "rewrite": "..." }],
  "unknowns": [{ "question": "...", "owner": "..." }]
}
```

`id` is `C` plus a number. `surfaces` lists where a `planned` claim may be named (for example `roadmap page`); leave it empty for other statuses. `as_of` is the date the register was last checked against the product.

## Next step

Offer to rewrite the flagged lines, or to run `asset-qa-scorecard` on the finished asset with this register as its truth source.
