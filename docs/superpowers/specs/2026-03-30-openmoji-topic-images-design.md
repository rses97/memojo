# OpenMoji Topic Images Design

**Date:** 2026-03-30
**Status:** Draft

## Problem

All topic pack images in `public/img/` are 259-byte placeholder files — not real images. Cards show broken `<img>` tags in the browser. We need real images for the existing World Flags topic and for 4 upcoming topics (Sports, Animals, Human Body, World Landmarks).

## Decision

Use **OpenMoji** (open-source emoji, CC BY-SA 4.0) as the single image source for all topic packs. SVG files are downloaded from the OpenMoji GitHub repo and self-hosted in `public/img/<topic>/`.

### Why OpenMoji

- **One consistent visual style** across all topics — every card looks like it belongs in the same game
- **Full coverage** — all 50 icons across 5 topics are confirmed available
- **SVG** — crisp at any card size, tiny file size, no resolution concerns
- **Offline** — no CDN dependency, images ship with the app
- **No component changes needed** — existing `<img :src="card.content">` works with SVG paths
- **CC BY-SA 4.0 license** — free for commercial use with attribution

### Topics replaced from original plan

- **Solar System → Sports** — Unicode/OpenMoji lacks individual planet emojis; Sports has full coverage

## Architecture

### No schema changes

The existing `TopicPair.image` field stays as a path string (`"/img/flags/ua.svg"`). The `GameCard` component already renders `<img :src>` which works with SVGs. The only change is:

- Image file extension changes from `.webp` to `.svg`
- JSON files updated with new paths
- Real SVG files replace placeholder files

### File structure

```
public/img/
  flags/          # 10 country flag SVGs
    ua.svg
    jp.svg
    ...
  sports/         # 10 sport SVGs
    soccer.svg
    basketball.svg
    ...
  animals/        # 10 animal SVGs
    lion.svg
    elephant.svg
    ...
  human-body/     # 10 organ/body-part SVGs
    heart.svg
    brain.svg
    ...
  landmarks/      # 10 landmark SVGs
    statue-of-liberty.svg
    mount-fuji.svg
    ...
```

### Download script

A one-time shell script (`scripts/download-openmoji.sh`) fetches SVGs from the OpenMoji GitHub repo and renames them to human-readable filenames.

Source URL pattern:
```
https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/{HEXCODE}.svg
```

### OpenMoji icon mapping

#### World Flags (update existing `world-flags.json`)

| id | Hex Code | Filename |
|----|----------|----------|
| ua | `1F1FA-1F1E6` | `ua.svg` |
| jp | `1F1EF-1F1F5` | `jp.svg` |
| br | `1F1E7-1F1F7` | `br.svg` |
| ca | `1F1E8-1F1E6` | `ca.svg` |
| fr | `1F1EB-1F1F7` | `fr.svg` |
| au | `1F1E6-1F1FA` | `au.svg` |
| ke | `1F1F0-1F1EA` | `ke.svg` |
| mx | `1F1F2-1F1FD` | `mx.svg` |
| in | `1F1EE-1F1F3` | `in.svg` |
| de | `1F1E9-1F1EA` | `de.svg` |

#### Sports (new topic)

| id | Hex Code | Text | Hint | Filename |
|----|----------|------|------|----------|
| soccer | `26BD` | Soccer | The beautiful game | `soccer.svg` |
| basketball | `1F3C0` | Basketball | Slam dunk | `basketball.svg` |
| tennis | `1F3BE` | Tennis | Love means zero | `tennis.svg` |
| swimming | `1F3CA` | Swimming | Freestyle & backstroke | `swimming.svg` |
| skiing | `1F3BF` | Skiing | Winter sport | `skiing.svg` |
| baseball | `26BE` | Baseball | Home run | `baseball.svg` |
| volleyball | `1F3D0` | Volleyball | Spike and serve | `volleyball.svg` |
| boxing | `1F94A` | Boxing | Gloves on | `boxing.svg` |
| cycling | `1F6B2` | Cycling | Two wheels | `cycling.svg` |
| surfing | `1F3C4` | Surfing | Ride the wave | `surfing.svg` |

#### Animals (new topic)

| id | Hex Code | Text | Hint | Filename |
|----|----------|------|------|----------|
| lion | `1F981` | Lion | King of the jungle | `lion.svg` |
| elephant | `1F418` | Elephant | Largest land animal | `elephant.svg` |
| penguin | `1F427` | Penguin | Flightless bird | `penguin.svg` |
| dolphin | `1F42C` | Dolphin | Intelligent marine mammal | `dolphin.svg` |
| eagle | `1F985` | Eagle | Bird of prey | `eagle.svg` |
| panda | `1F43C` | Giant Panda | Eats bamboo | `panda.svg` |
| tiger | `1F405` | Tiger | Largest wild cat | `tiger.svg` |
| octopus | `1F419` | Octopus | Eight arms | `octopus.svg` |
| giraffe | `1F992` | Giraffe | Tallest animal | `giraffe.svg` |
| koala | `1F428` | Koala | Australian marsupial | `koala.svg` |

#### Human Body (new topic)

| id | Hex Code | Text | Hint | Filename |
|----|----------|------|------|----------|
| heart | `1FAC0` | Heart | Pumps blood | `heart.svg` |
| brain | `1F9E0` | Brain | Control center | `brain.svg` |
| lungs | `1FAC1` | Lungs | Breathing organs | `lungs.svg` |
| liver | `E312` | Liver | Detoxification | `liver.svg` |
| kidney | `E316` | Kidneys | Filter blood | `kidney.svg` |
| stomach | `E313` | Stomach | Digests food | `stomach.svg` |
| bone | `1F9B4` | Skeletal System | 206 bones | `bone.svg` |
| muscle | `1F4AA` | Muscular System | Over 600 muscles | `muscle.svg` |
| eye | `1F441` | Eye | Window to the world | `eye.svg` |
| ear | `1F442` | Ear | Sound receptor | `ear.svg` |

#### World Landmarks (new topic)

| id | Hex Code | Text | Hint | Filename |
|----|----------|------|------|----------|
| statue-of-liberty | `1F5FD` | Statue of Liberty | New York, USA | `statue-of-liberty.svg` |
| mount-fuji | `1F5FB` | Mount Fuji | Japan's tallest peak | `mount-fuji.svg` |
| moai | `1F5FF` | Moai | Easter Island, Chile | `moai.svg` |
| tokyo-tower | `1F5FC` | Tokyo Tower | Tokyo, Japan | `tokyo-tower.svg` |
| european-castle | `1F3F0` | European Castle | Medieval fortress | `european-castle.svg` |
| japanese-castle | `1F3EF` | Japanese Castle | Feudal Japan | `japanese-castle.svg` |
| eiffel-tower | `E205` | Eiffel Tower | Paris, France | `eiffel-tower.svg` |
| pyramid | `E20F` | Great Pyramid | Giza, Egypt | `pyramid.svg` |
| lighthouse | `E212` | Lighthouse of Alexandria | Ancient wonder | `lighthouse.svg` |
| classical-building | `1F3DB` | Classical Building | Greco-Roman architecture | `classical-building.svg` |

### Attribution

OpenMoji requires CC BY-SA 4.0 attribution. Add to `app.vue` footer or a dedicated credits page:

> Emoji graphics by [OpenMoji](https://openmoji.org/) — CC BY-SA 4.0

### Changes to existing files

1. **`public/topics/world-flags.json`** — update `image` paths from `.webp` to `.svg`
2. **`public/img/flags/`** — delete placeholder `.webp` files, add real `.svg` files
3. **`public/img/flags/placeholder.svg`** — delete (no longer needed)

### New files

1. **`scripts/download-openmoji.sh`** — download script
2. **`public/topics/sports.json`** — new topic pack
3. **`public/topics/animals.json`** — new topic pack
4. **`public/topics/human-body.json`** — new topic pack
5. **`public/topics/world-landmarks.json`** — new topic pack
6. **50 SVG files** across `public/img/` subdirectories

### What does NOT change

- `TopicPair` / `GameCard` types — no schema changes
- `GameCard.vue` component — `<img :src>` works with SVGs
- `useGame.ts` composable — no changes
- `[slug].vue` page — no changes

## Testing

- Visual: verify each topic renders correct images on flipped cards
- Check SVG sizing within the card's `object-cover` CSS
- Confirm all 50 SVGs load without 404s in dev tools
