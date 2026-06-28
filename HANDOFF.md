# HANDOFF — Pump It Up Rise data overhaul (continue on Linux)

This folder contains the **complete extracted dataset** from the game plus a ready-to-apply
migration for your React Native app. Nothing in your repo was modified — apply it yourself on Linux.

## What's in this folder
```
piu_rise_extract/
├── songs.json            # 415 songs, final schema (the new source of truth)
├── banners/              # 415 JPEGs, 512px wide, ~12.4 MB total, named <songId>.jpg
├── report.md             # full extraction methodology + field mapping + confidence notes
├── migration/
│   ├── data.ts           # NEW data/data.ts  (typed loader for songs.json)
│   └── imageLoader.ts    # NEW utils/imageLoader.ts (JPEG version)
└── scripts/              # regeneration scripts (Windows-only dump step — see report.md)
```

## The new schema (one song)
```jsonc
{
  "id": "10001",                      // game's internal ID — STABLE KEY + banner filename
  "title": "Cynical",
  "artist": "RiraN ft. Negoto Bunnyla",
  "titleKor": "시니컬",
  "artistKor": "RiraN ft. Negoto Bunnyla",
  "bpm": { "min": 155, "max": 155, "display": "155" },   // ranges: min!=max, e.g. "140-169"
  "version": "Rise",                  // Rise|Phoenix|XX|Prime 2|Prime|Fiesta 2|Fiesta EX|Fiesta|Legacy
  "generation": 27,                   // raw game version index
  "channel": 1,                       // 1 normal, 3 remix/special, 5 special
  "lengthType": 2,                    // 2 standard, 3 full/remix
  "isRemix": false,
  "charts": [ { "mode": "S", "level": 8 }, { "mode": "D", "level": 14 }, ... ],  // CANONICAL
  "banner": "10001"                   // -> banners/10001.jpg
}
```
`mode`: `"S"` = Single, `"D"` = Double (only modes present in this build).
`migration/data.ts` also derives a convenience `levels: { single: number[]; double: number[] }`
from `charts`, so your existing generator/detail code keeps working unchanged.

## Apply the migration (on Linux, in the repo root)
```bash
# 1. Data + loader
cp /path/to/piu_rise_extract/songs.json          data/songs.json
cp /path/to/piu_rise_extract/migration/data.ts   data/data.ts          # overwrites old (back it up first)
cp /path/to/piu_rise_extract/migration/imageLoader.ts utils/imageLoader.ts

# 2. Banners — replace the old category-subfolder PNGs with flat JPEGs
rm -rf assets/songs && mkdir -p assets/songs
cp /path/to/piu_rise_extract/banners/*.jpg assets/songs/

# 3. Two one-line edits (old field `category` -> new field `version`):
#    components/ListItem.tsx   line ~73:  {item.category}  ->  {item.version}
#    app/song/[songId].tsx     line ~161: {song.category}  ->  {song.version}
```
Then:
```bash
npx tsc --noEmit       # type-check (expo/tsconfig.base already has resolveJsonModule)
npx expo start -c      # -c clears the Metro cache so the new require.context is picked up
```

### Notes / gotchas
- **`utils/generator.ts` needs NO change** — it reads `song.levels.single/double`, which `data.ts` still provides (derived from `charts`).
- `import { songs, Song } from '@/data/data'` keeps working; `Song` now also exposes
  `charts`, `version`, `titleKor`, `bpm`, etc. New helper: `levelsForMode(song, 'S'|'D')`.
- If you'd rather filter on structured charts directly, use `song.charts` (mode + level) instead of `levels`.
- The old IDs (`rise-1`, `leg-74`…) are gone — IDs are now the game's real IDs (`10001`, `1001`, `13a3`…).
  Anything that hard-coded old IDs must be updated (nothing in the current app does).
- `app.json`/EAS: no asset-pattern changes needed; flat JPEGs in `assets/songs` are bundled via `require.context`.

## Suggested improvements you may want (optional)
- `data/data.ts` map currently sorts levels ascending; fine as-is.
- The old level-pick bias ("pick first matching level") still exists in `generator.ts` line ~162.
  If you want true randomization, change `const pickedLevel = matchingLevels[0];` to a random pick.
- `version` for `generation` 2–17 is bucketed as "Legacy" (matches your old app). Raw `generation`
  is in the data if you ever want a finer split (1st/NX/NXA/etc.).

## Regenerating after a future game update
The metadata is AES-encrypted on disk, so regeneration needs the **Windows machine with the game
installed** (the dump step reads the decrypted table from the running game's RAM). Full recipe is in
`report.md` → "How to regenerate". Scripts are in `scripts/`. Output (`songs.json` + `banners/`) is
then synced back here and re-applied with the steps above. **No more hand-editing JSON.**
```
launch game → procdump64 -ma <PID> piu_dump.dmp → extract_nrbf.py → Deserialize.exe
→ build_songs.py → extract_banners.py → make_jpeg_and_package.py
```
```
```
