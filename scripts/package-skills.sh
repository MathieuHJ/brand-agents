#!/bin/sh
# Builds release ZIPs in dist/: one per skill, with the skill folder at the ZIP's
# root (the layout Claude.ai expects), plus one ZIP with every skill.
# Run from anywhere: sh scripts/package-skills.sh
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
cd skills
for dir in */; do
  name=${dir%/}
  zip -qr "../dist/$name.zip" "$name" -x '*.DS_Store'
done
zip -qr ../dist/brand-agents-all-skills.zip . -x '*.DS_Store'
cd ..
ls -1 dist
