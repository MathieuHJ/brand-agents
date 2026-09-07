import { readFile } from 'node:fs/promises';

for (const filename of ['art_direction.json', 'naming_candidates.json']) {
  const file = new URL(`../brands/test_project/${filename}`, import.meta.url);
  JSON.parse(await readFile(file, 'utf8'));
  console.log(`Valid JSON: ${filename}`);
}
