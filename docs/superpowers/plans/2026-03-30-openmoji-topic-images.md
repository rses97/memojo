# OpenMoji Topic Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 259-byte placeholder image files with real OpenMoji SVGs for all 5 topic packs (World Flags, Sports, Animals, Human Body, World Landmarks) and add OpenMoji attribution to the app footer.

**Architecture:** A one-time download script fetches all 50 SVGs from the OpenMoji GitHub repo by hex code, renaming them to human-readable filenames. No type, component, or composable changes needed — the existing `<img :src>` in `GameCard.vue` works with SVG paths as-is. Topic JSON files are updated to use `.svg` paths and 4 new topic JSONs are created.

**Tech Stack:** Bash (download script), OpenMoji (CC BY-SA 4.0, color SVGs from GitHub raw), Nuxt 4, Vue 3

---

### Task 1: Create download script and fetch all 50 SVGs

**Files:**

- Create: `scripts/download-openmoji.sh`
- Create: `public/img/flags/` (10 SVGs)
- Create: `public/img/sports/` (10 SVGs)
- Create: `public/img/animals/` (10 SVGs)
- Create: `public/img/human-body/` (10 SVGs)
- Create: `public/img/landmarks/` (10 SVGs)

- [ ] **Step 1: Create the download script**

Create `scripts/download-openmoji.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE="https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg"
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
```

- [ ] **Step 2: Make the script executable and run it**

```bash
chmod +x scripts/download-openmoji.sh
bash scripts/download-openmoji.sh
```

Expected output: 50 lines of `Downloading ... → ...` followed by `Done — 50 SVGs downloaded.`

- [ ] **Step 3: Verify all 50 SVGs downloaded and are real files (not placeholders)**

```bash
find public/img -name "*.svg" | grep -v placeholder | wc -l
```

Expected output: `50`

```bash
# Check a sample — a real SVG starts with <?xml or <svg
head -1 public/img/flags/jp.svg
head -1 public/img/sports/soccer.svg
head -1 public/img/animals/lion.svg
head -1 public/img/human-body/heart.svg
head -1 public/img/landmarks/mount-fuji.svg
```

Each should start with `<?xml` or `<svg`.

- [ ] **Step 4: Delete old placeholder .webp files and placeholder.svg**

```bash
rm public/img/flags/*.webp public/img/flags/placeholder.svg
```

Expected: no error. Verify:

```bash
ls public/img/flags/
```

Expected: 10 `.svg` files only (`au.svg br.svg ca.svg de.svg fr.svg in.svg jp.svg ke.svg mx.svg ua.svg`).

- [ ] **Step 5: Commit**

```bash
git add scripts/download-openmoji.sh public/img/
git commit -m "feat: download OpenMoji SVGs for all topic image assets"
```

---

### Task 2: Update world-flags.json to use .svg paths

**Files:**

- Modify: `public/topics/world-flags.json`

- [ ] **Step 1: Update world-flags.json**

Replace the entire contents of `public/topics/world-flags.json`:

```json
{
  "topic": "world-flags",
  "name": "World Flags",
  "description": "Match country flags to their names",
  "pairs": [
    {
      "id": "ua",
      "image": "/img/flags/ua.svg",
      "text": "Ukraine",
      "hint": "Eastern Europe"
    },
    {
      "id": "jp",
      "image": "/img/flags/jp.svg",
      "text": "Japan",
      "hint": "East Asia"
    },
    {
      "id": "br",
      "image": "/img/flags/br.svg",
      "text": "Brazil",
      "hint": "South America"
    },
    {
      "id": "ca",
      "image": "/img/flags/ca.svg",
      "text": "Canada",
      "hint": "North America"
    },
    {
      "id": "fr",
      "image": "/img/flags/fr.svg",
      "text": "France",
      "hint": "Western Europe"
    },
    {
      "id": "au",
      "image": "/img/flags/au.svg",
      "text": "Australia",
      "hint": "Oceania"
    },
    {
      "id": "ke",
      "image": "/img/flags/ke.svg",
      "text": "Kenya",
      "hint": "East Africa"
    },
    {
      "id": "mx",
      "image": "/img/flags/mx.svg",
      "text": "Mexico",
      "hint": "North America"
    },
    {
      "id": "in",
      "image": "/img/flags/in.svg",
      "text": "India",
      "hint": "South Asia"
    },
    {
      "id": "de",
      "image": "/img/flags/de.svg",
      "text": "Germany",
      "hint": "Central Europe"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add public/topics/world-flags.json
git commit -m "fix: update world-flags topic to use real OpenMoji SVG paths"
```

---

### Task 3: Create sports.json topic pack

**Files:**

- Create: `public/topics/sports.json`

- [ ] **Step 1: Create sports.json**

Create `public/topics/sports.json`:

```json
{
  "topic": "sports",
  "name": "Sports",
  "description": "Match sports equipment and activities to their names",
  "pairs": [
    {
      "id": "soccer",
      "image": "/img/sports/soccer.svg",
      "text": "Soccer",
      "hint": "The beautiful game"
    },
    {
      "id": "basketball",
      "image": "/img/sports/basketball.svg",
      "text": "Basketball",
      "hint": "Slam dunk"
    },
    {
      "id": "tennis",
      "image": "/img/sports/tennis.svg",
      "text": "Tennis",
      "hint": "Love means zero"
    },
    {
      "id": "swimming",
      "image": "/img/sports/swimming.svg",
      "text": "Swimming",
      "hint": "Freestyle & backstroke"
    },
    {
      "id": "skiing",
      "image": "/img/sports/skiing.svg",
      "text": "Skiing",
      "hint": "Winter sport"
    },
    {
      "id": "baseball",
      "image": "/img/sports/baseball.svg",
      "text": "Baseball",
      "hint": "Home run"
    },
    {
      "id": "volleyball",
      "image": "/img/sports/volleyball.svg",
      "text": "Volleyball",
      "hint": "Spike and serve"
    },
    {
      "id": "boxing",
      "image": "/img/sports/boxing.svg",
      "text": "Boxing",
      "hint": "Gloves on"
    },
    {
      "id": "cycling",
      "image": "/img/sports/cycling.svg",
      "text": "Cycling",
      "hint": "Two wheels"
    },
    {
      "id": "surfing",
      "image": "/img/sports/surfing.svg",
      "text": "Surfing",
      "hint": "Ride the wave"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add public/topics/sports.json
git commit -m "feat: add sports topic pack with OpenMoji SVGs"
```

---

### Task 4: Create animals.json topic pack

**Files:**

- Create: `public/topics/animals.json`

- [ ] **Step 1: Create animals.json**

Create `public/topics/animals.json`:

```json
{
  "topic": "animals",
  "name": "Animals",
  "description": "Match animals to their names",
  "pairs": [
    {
      "id": "lion",
      "image": "/img/animals/lion.svg",
      "text": "Lion",
      "hint": "King of the jungle"
    },
    {
      "id": "elephant",
      "image": "/img/animals/elephant.svg",
      "text": "Elephant",
      "hint": "Largest land animal"
    },
    {
      "id": "penguin",
      "image": "/img/animals/penguin.svg",
      "text": "Penguin",
      "hint": "Flightless bird"
    },
    {
      "id": "dolphin",
      "image": "/img/animals/dolphin.svg",
      "text": "Dolphin",
      "hint": "Intelligent marine mammal"
    },
    {
      "id": "eagle",
      "image": "/img/animals/eagle.svg",
      "text": "Eagle",
      "hint": "Bird of prey"
    },
    {
      "id": "panda",
      "image": "/img/animals/panda.svg",
      "text": "Giant Panda",
      "hint": "Eats bamboo"
    },
    {
      "id": "tiger",
      "image": "/img/animals/tiger.svg",
      "text": "Tiger",
      "hint": "Largest wild cat"
    },
    {
      "id": "octopus",
      "image": "/img/animals/octopus.svg",
      "text": "Octopus",
      "hint": "Eight arms"
    },
    {
      "id": "giraffe",
      "image": "/img/animals/giraffe.svg",
      "text": "Giraffe",
      "hint": "Tallest animal"
    },
    {
      "id": "koala",
      "image": "/img/animals/koala.svg",
      "text": "Koala",
      "hint": "Australian marsupial"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add public/topics/animals.json
git commit -m "feat: add animals topic pack with OpenMoji SVGs"
```

---

### Task 5: Create human-body.json topic pack

**Files:**

- Create: `public/topics/human-body.json`

- [ ] **Step 1: Create human-body.json**

Create `public/topics/human-body.json`:

```json
{
  "topic": "human-body",
  "name": "Human Body",
  "description": "Match organs and body parts to their names",
  "pairs": [
    {
      "id": "heart",
      "image": "/img/human-body/heart.svg",
      "text": "Heart",
      "hint": "Pumps blood"
    },
    {
      "id": "brain",
      "image": "/img/human-body/brain.svg",
      "text": "Brain",
      "hint": "Control center"
    },
    {
      "id": "lungs",
      "image": "/img/human-body/lungs.svg",
      "text": "Lungs",
      "hint": "Breathing organs"
    },
    {
      "id": "liver",
      "image": "/img/human-body/liver.svg",
      "text": "Liver",
      "hint": "Detoxification"
    },
    {
      "id": "kidney",
      "image": "/img/human-body/kidney.svg",
      "text": "Kidneys",
      "hint": "Filter blood"
    },
    {
      "id": "stomach",
      "image": "/img/human-body/stomach.svg",
      "text": "Stomach",
      "hint": "Digests food"
    },
    {
      "id": "bone",
      "image": "/img/human-body/bone.svg",
      "text": "Skeletal System",
      "hint": "206 bones"
    },
    {
      "id": "muscle",
      "image": "/img/human-body/muscle.svg",
      "text": "Muscular System",
      "hint": "Over 600 muscles"
    },
    {
      "id": "eye",
      "image": "/img/human-body/eye.svg",
      "text": "Eye",
      "hint": "Window to the world"
    },
    {
      "id": "ear",
      "image": "/img/human-body/ear.svg",
      "text": "Ear",
      "hint": "Sound receptor"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add public/topics/human-body.json
git commit -m "feat: add human-body topic pack with OpenMoji SVGs"
```

---

### Task 6: Create world-landmarks.json topic pack

**Files:**

- Create: `public/topics/world-landmarks.json`

- [ ] **Step 1: Create world-landmarks.json**

Create `public/topics/world-landmarks.json`:

```json
{
  "topic": "world-landmarks",
  "name": "World Landmarks",
  "description": "Match famous landmarks to their names",
  "pairs": [
    {
      "id": "statue-of-liberty",
      "image": "/img/landmarks/statue-of-liberty.svg",
      "text": "Statue of Liberty",
      "hint": "New York, USA"
    },
    {
      "id": "mount-fuji",
      "image": "/img/landmarks/mount-fuji.svg",
      "text": "Mount Fuji",
      "hint": "Japan's tallest peak"
    },
    {
      "id": "moai",
      "image": "/img/landmarks/moai.svg",
      "text": "Moai",
      "hint": "Easter Island, Chile"
    },
    {
      "id": "tokyo-tower",
      "image": "/img/landmarks/tokyo-tower.svg",
      "text": "Tokyo Tower",
      "hint": "Tokyo, Japan"
    },
    {
      "id": "european-castle",
      "image": "/img/landmarks/european-castle.svg",
      "text": "European Castle",
      "hint": "Medieval fortress"
    },
    {
      "id": "japanese-castle",
      "image": "/img/landmarks/japanese-castle.svg",
      "text": "Japanese Castle",
      "hint": "Feudal Japan"
    },
    {
      "id": "eiffel-tower",
      "image": "/img/landmarks/eiffel-tower.svg",
      "text": "Eiffel Tower",
      "hint": "Paris, France"
    },
    {
      "id": "pyramid",
      "image": "/img/landmarks/pyramid.svg",
      "text": "Great Pyramid",
      "hint": "Giza, Egypt"
    },
    {
      "id": "lighthouse",
      "image": "/img/landmarks/lighthouse.svg",
      "text": "Lighthouse of Alexandria",
      "hint": "Ancient wonder"
    },
    {
      "id": "classical-building",
      "image": "/img/landmarks/classical-building.svg",
      "text": "Classical Building",
      "hint": "Greco-Roman architecture"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add public/topics/world-landmarks.json
git commit -m "feat: add world-landmarks topic pack with OpenMoji SVGs"
```

---

### Task 7: Add OpenMoji attribution to the layout footer

**Files:**

- Modify: `app/layouts/default.vue`

OpenMoji requires CC BY-SA 4.0 attribution. The current layout has a header but no footer. Add a minimal footer with the attribution.

- [ ] **Step 1: Add footer with attribution to default.vue**

Replace the entire contents of `app/layouts/default.vue`:

```vue
<template>
  <div class="min-h-screen bg-surface-50 text-surface-900 flex flex-col">
    <header class="border-b border-surface-200 px-6 py-4">
      <div class="mx-auto flex max-w-4xl items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary-600"> Memojo </NuxtLink>
      </div>
    </header>
    <main class="mx-auto max-w-4xl w-full px-6 py-8 flex-1">
      <slot />
    </main>
    <footer class="border-t border-surface-200 px-6 py-4 text-center text-xs text-surface-500">
      Emoji graphics by
      <a
        href="https://openmoji.org/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-surface-700"
        >OpenMoji</a
      >
      — CC BY-SA 4.0
    </footer>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/layouts/default.vue
git commit -m "feat: add OpenMoji CC BY-SA 4.0 attribution to footer"
```

---

### Task 8: Manual visual verification

No automated tests exist for image rendering — verify visually in the browser.

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Verify world-flags topic**

Open `http://localhost:3000/play/world-flags`.

- Flip a card — the image card should show a country flag SVG (not broken `[jp` text)
- Flip its matching text card — should show the country name
- Match a pair — both cards should show the matched state (green border)

- [ ] **Step 3: Verify new topics load without 404**

Open each URL and confirm the game board renders with emoji images:

- `http://localhost:3000/play/sports`
- `http://localhost:3000/play/animals`
- `http://localhost:3000/play/human-body`
- `http://localhost:3000/play/world-landmarks`

- [ ] **Step 4: Check browser DevTools for 404s**

Open DevTools → Network tab → filter by `img`. Reload each topic page. No request should show a 404 status.

- [ ] **Step 5: Verify attribution footer is visible**

On any page, scroll to the bottom. Should see: `Emoji graphics by OpenMoji — CC BY-SA 4.0` with a working link.
