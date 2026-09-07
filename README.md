# Brand Agents

Reusable AI instructions for turning visual references and early product ideas into structured brand decisions.

This repository contains Markdown skills and example JSON outputs. It is not a running application or a hosted service, and there is no package to install.

## What is included

| Skill | Bring | Get back |
| --- | --- | --- |
| [Art direction extractor](skills/art_direction_extractor/SKILL.md) | Mood-board images, with optional audience, brand adjectives, competitors, and things to avoid | A short narrative and structured rules for typography, colour, imagery, and layout |
| [Brand naming rubric](skills/brand_naming_rubric/SKILL.md) | An idea, industry, tone, language, and naming constraints | Ranked names, scoring rationale, risks, and checks to carry out next |

## Try a skill

1. Open the relevant `SKILL.md` and provide its instructions to your AI assistant. Use an image-capable assistant for mood boards.
2. Supply the inputs listed in that file. Use only references you have permission to share with your chosen provider.
3. Ask for both the readable summary and the JSON output defined by the skill.
4. Review the result against the original brief. Treat scores and style judgments as a starting point, not an objective verdict.

Example naming brief:

> Follow the brand naming rubric. The idea is a tool that turns lectures into interactive polls and quizzes. The audience is educators. Aim for clear, warm, memorable names suitable for an English-speaking audience. Avoid names that sound like an existing competitor. State assumptions and do not claim domain availability.

For art direction, attach your mood-board images and add:

> Follow the art direction extractor. Identify the recurring visual choices in these references, then turn them into practical rules. Separate observations from assumptions and include accessibility watchouts.

## Example outputs

- [Art direction JSON](brands/test_project/art_direction.json)
- [Naming candidates JSON](brands/test_project/naming_candidates.json)

These are two separate illustrative briefs, not one complete brand identity. The names are examples, not cleared recommendations.

With Node.js installed, validate that both examples are parseable:

```sh
node scripts/validate-examples.mjs
```

## Boundaries

- Naming scores do not establish trademark, company-name, or domain availability. Perform independent checks before adopting a name.
- The repository does not generate finished logo artwork or run searches automatically.
- Sharing a brief or image with an assistant is subject to that provider's data handling. These text files do not provide a private execution environment.
- No license file is currently included. Do not assume an open-source license from the repository being public.
