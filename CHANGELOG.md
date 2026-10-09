# Changelog

## Unreleased

### Added
- **Direction to tokens** skill: colour roles, type, space, radius and motion tokens with a reason per value, in Design Tokens format with aliases. `scripts/tokens.mjs` exports CSS custom properties and reports contrast for declared pairs plus a full text-on-background matrix. Example `tokens.json` for Aurel.

### Changed
- The validator reports a missing `SKILL.md` instead of crashing, supports token groups, and only requires `schema.json` for skills that return JSON.

## 0.3.0 — 2026-10-09

### Added
- **Brand brief intake** skill: extracts what it can, asks at most six questions with defaults, leaves unknowns blank with an owner, writes a persona test, and says which skill is ready to run next. Example brief in `brands/test_project/`.
- **Claims register** skill: tag every product claim Shipped, Beta, Planned, Proposed or Retired with a source, then screen copy with `scripts/check-copy.mjs` (unreleased features in the present tense, unqualified beta claims, universal promises, banned phrases, unsourced numbers). Example register and launch copy in `brands/test_project/`.
- **Asset QA scorecard** skill: a weighted 100-point rubric with seven hard failures, a threshold and a 70% per-dimension floor. `scripts/score.mjs` computes the total and verdict. Example scorecard in `brands/test_project/`.
- The validator accepts nullable fields and checks briefs, claims registers and scorecard arithmetic.

## 0.2.0 — 2026-10-09

### Changed
- One source of truth: skills live in `skills/` with kebab-case folder names, as the Agent Skills format requires. `.claude/skills` and `.codex/skills` are links to it, replacing the duplicated `.codex` copies.
- Renamed folders: `art_direction_extractor` → `art-direction-extractor`, `brand_naming_rubric` → `brand-naming-rubric`, `logo_identity_directions` → `logo-identity-directions`. Update any links to the old paths.
- **Art direction extractor:** evidence-cited observations, splitting contradictory references into clusters, numeric style axes, sampled vs proposed colours, a cliché watch, an accessibility pass and hand-offs for logo, UI and content.
- **Brand naming rubric:** a "does this need a name?" step, a kill screen, a scoring table with anchors, tagged strategies, pronunciation and linguistic notes, and an ordered clearance list. Restricted TLDs such as .edu are no longer suggested.
- **Logo and identity directions:** now in `skills/` and documented in the README. Adds parent-brand relationship, lockup budget, 16px and one-colour tests, motion with reduced-motion fallback, cliché check and a comparable scorecard. Output is described as a JSON object (it was mislabelled as an array).

### Added
- `schema.json` next to each skill.
- `scripts/validate-examples.mjs` now validates skill frontmatter and every example against its schema, plus score totals, ranking order, reference citations and WCAG text contrast. It accepts a path to check your own output.
- `brands/test_project/logo_directions.json` example.
- Claude Code plugin and marketplace manifests in `.claude-plugin/`.
- `docs/principles.md`: lessons from past brand projects behind the skills.

### Fixed
- Naming example: removed a candidate that is a well-known actor's surname, replaced a restricted `.edu` domain suggestion, corrected a typo in a risk note, and fixed the tie-break order.

## 0.1.0

- Art direction extractor, brand naming rubric and logo identity directions skills, with example outputs.
