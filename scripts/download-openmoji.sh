#!/usr/bin/env bash
# Usage: Run from repo root: bash scripts/download-openmoji.sh
# Requires: curl
# License: OpenMoji CC BY-SA 4.0 — https://openmoji.org
set -euo pipefail

[[ -f package.json ]] || { echo "Error: Run from repo root" >&2; exit 1; }

BASE="https://raw.githubusercontent.com/hfg-gmuend/openmoji/15.1.0/color/svg"
OUT="public/img"

fetch() {
  local hex="$1" dest="$2"
  echo "Downloading $hex → $dest"
  curl -fsSL "$BASE/$hex.svg" -o "$dest"
}

mkdir -p "$OUT/flags" "$OUT/sports" "$OUT/animals" "$OUT/human-body" "$OUT/landmarks"

# Flags
fetch "1F1FA-1F1E6" "$OUT/flags/ua.svg"
fetch "1F1EF-1F1F5" "$OUT/flags/jp.svg"
fetch "1F1E7-1F1F7" "$OUT/flags/br.svg"
fetch "1F1E8-1F1E6" "$OUT/flags/ca.svg"
fetch "1F1EB-1F1F7" "$OUT/flags/fr.svg"
fetch "1F1E6-1F1FA" "$OUT/flags/au.svg"
fetch "1F1F0-1F1EA" "$OUT/flags/ke.svg"
fetch "1F1F2-1F1FD" "$OUT/flags/mx.svg"
fetch "1F1EE-1F1F3" "$OUT/flags/in.svg"
fetch "1F1E9-1F1EA" "$OUT/flags/de.svg"

# Sports
fetch "26BD"   "$OUT/sports/soccer.svg"
fetch "1F3C0"  "$OUT/sports/basketball.svg"
fetch "1F3BE"  "$OUT/sports/tennis.svg"
fetch "1F3CA"  "$OUT/sports/swimming.svg"
fetch "1F3BF"  "$OUT/sports/skiing.svg"
fetch "26BE"   "$OUT/sports/baseball.svg"
fetch "1F3D0"  "$OUT/sports/volleyball.svg"
fetch "1F94A"  "$OUT/sports/boxing.svg"
fetch "1F6B2"  "$OUT/sports/cycling.svg"
fetch "1F3C4"  "$OUT/sports/surfing.svg"

# Animals
fetch "1F981"  "$OUT/animals/lion.svg"
fetch "1F418"  "$OUT/animals/elephant.svg"
fetch "1F427"  "$OUT/animals/penguin.svg"
fetch "1F42C"  "$OUT/animals/dolphin.svg"
fetch "1F985"  "$OUT/animals/eagle.svg"
fetch "1F43C"  "$OUT/animals/panda.svg"
fetch "1F405"  "$OUT/animals/tiger.svg"
fetch "1F419"  "$OUT/animals/octopus.svg"
fetch "1F992"  "$OUT/animals/giraffe.svg"
fetch "1F428"  "$OUT/animals/koala.svg"

# Human Body
fetch "1FAC0"  "$OUT/human-body/heart.svg"
fetch "1F9E0"  "$OUT/human-body/brain.svg"
fetch "1FAC1"  "$OUT/human-body/lungs.svg"
fetch "E312"   "$OUT/human-body/liver.svg"
fetch "E316"   "$OUT/human-body/kidney.svg"
fetch "E313"   "$OUT/human-body/stomach.svg"
fetch "1F9B4"  "$OUT/human-body/bone.svg"
fetch "1F4AA"  "$OUT/human-body/muscle.svg"
fetch "1F441"  "$OUT/human-body/eye.svg"
fetch "1F442"  "$OUT/human-body/ear.svg"

# Landmarks
fetch "1F5FD"  "$OUT/landmarks/statue-of-liberty.svg"
fetch "1F5FB"  "$OUT/landmarks/mount-fuji.svg"
fetch "1F5FF"  "$OUT/landmarks/moai.svg"
fetch "1F5FC"  "$OUT/landmarks/tokyo-tower.svg"
fetch "1F3F0"  "$OUT/landmarks/european-castle.svg"
fetch "1F3EF"  "$OUT/landmarks/japanese-castle.svg"
fetch "E205"   "$OUT/landmarks/eiffel-tower.svg"
fetch "E20F"   "$OUT/landmarks/pyramid.svg"
fetch "E212"   "$OUT/landmarks/lighthouse.svg"
fetch "1F3DB"  "$OUT/landmarks/classical-building.svg"

echo "Done — 50 SVGs downloaded."
