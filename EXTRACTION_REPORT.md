# Pump It Up Rise — Data Extraction Report

**Date:** 2026-06-27
**Game build:** PUMP IT UP RISE — Unity 2022.3.62f2, IL2CPP, Addressables 1.22.3
**Install path:** `C:\Program Files (x86)\Steam\steamapps\common\Pump It Up Rise`
**Working dir:** `C:\piu_extract` (game folder was read-only throughout; nothing in the install was modified)

---

## TL;DR

- **415 songs** fully extracted into the agreed schema (`songs.json`), plus **415 banner images** named by the game's internal song ID.
- Song metadata is **AES-encrypted** in the game's Addressables bundles, so it was recovered via a **runtime memory dump** of the game process (the game decrypts the table into RAM at load).
- Banner/jacket images are **not** encrypted and were extracted directly from the Unity bundles.
- The data is fully **regenerable** from the game on future updates (see "How to regenerate").

---

## What the game files look like

| Asset | Where | Format | Outcome |
|---|---|---|---|
| Banner / preview art | `…/StreamingAssets/aa/StandaloneWindows64/preview_assets_<ID>/preview_*.bundle` | Unity `Texture2D`/`Sprite` (1920×1080), unencrypted | ✅ Extracted directly (415) |
| Preview videos | `…/preview_assets_<ID>/previewvideo_*.bundle` | Unity `VideoClip` | Not needed (available if wanted) |
| Song metadata | `…/defaultlocalgroup_assets_db_*.bundle` → `db` & `tables` TextAssets | **AES/Rijndael + Xor (.NET CryptoStream)**; key inside `GameAssembly.dll` | 🔒 Encrypted on disk → recovered from memory |
| Charts / audio / video | `…/PUMP IT UP RISE_Data/DataAssets/` (4804 hash-named files) | Same encryption | Not needed for this project |

Why not decrypt the files directly: the bundles are encrypted with a per-file keystream (entropy ≈ 8.0; a statistical known-plaintext attack failed), and the key lives in compiled IL2CPP native code. The game itself holds the key, so the pragmatic route was to let the game decrypt and read it back from RAM.

## How the metadata was recovered (runtime memory dump)

1. The game was launched (it decrypts the song table at startup into a managed `Dictionary<String, Data.Song>`).
2. A full process dump was captured with Sysinternals ProcDump (`procdump64 -ma`).
3. The dump contained a **.NET `BinaryFormatter` (NRBF) stream** of `Dictionary<String, Data.Song>`. The exact in-game type is:
   ```
   Data.Song { ParentID, ID, Bpm, ArtistEng, TitleEng, ArtistKor, TitleKor,
               Channel, LockValue, LengthType, Generation, IcathImgPath,
               Levels:  Dictionary<STEP, List<Int32>>,
               Hiddens: Dictionary<STEP, List<Int32>> }
   ```
4. The NRBF blob was deserialized with a tiny .NET Framework program (`Deserialize.exe`) using stub types + a `SerializationBinder`, producing `songs_raw.json` (416 entries).
5. `songs_raw.json` was normalized into the agreed schema → `songs.json` (415; `tuto03`, the tutorial entry with no banner, was dropped).

## Field mapping (game → our schema)

| Game field | Our field | Notes |
|---|---|---|
| `ID` | `id` | **Stable key.** Matches banner folder/filename. Mostly numeric (`1001`, `10001`), some version-coded (`a01`, `13a3`…). |
| `TitleEng` / `TitleKor` | `title` / `titleKor` | English used as primary; Korean kept as bonus. |
| `ArtistEng` / `ArtistKor` | `artist` / `artistKor` | |
| `Bpm` | `bpm.{min,max,display}` | 30 songs are ranges; game uses both `-` and `~` separators (preserved in `display`). |
| `Levels` (`Dictionary<STEP,List<int>>`) | `charts[{mode,level}]` | **STEP 0 = Single ("S"), STEP 2 = Double ("D").** Only S/D exist in this build. |
| `Generation` | `version` (+ raw `generation`) | See mapping below. |
| `Channel` | `channel` | 1 = normal (371), 3 = remix/special (44), 5 = special (1). |
| `LengthType` | `lengthType` | 2 = standard (379), 3 = full/remix (37). |
| (`Channel==3 \|\| LengthType==3`) | `isRemix` | Derived convenience flag. |
| `IcathImgPath` | — | Empty in this build; banners come from the preview bundles instead. |
| `LockValue` | — | All 0 in this build (kept out; easy to add back). |
| `Hiddens` | — | Empty for every song. |

### Generation → version mapping (validated against your old app's categories)
Joining 273 songs by title to your existing `data.ts` categories confirmed this mapping (your own labels matched exactly for everything except Phoenix, which your app had lumped under "Variety"):

| gen | version | gen | version |
|---|---|---|---|
| 2–17 | Legacy | 23 | Prime 2 |
| 18 | Fiesta | 24 | XX |
| 19 | Fiesta EX | 26 | Phoenix |
| 21 | Fiesta 2 | 27 | Rise |
| 22 | Prime | | |

Counts: Legacy 114, Rise 63, Phoenix 62, XX 46, Prime 44, Prime 2 29, Fiesta 23, Fiesta 2 18, Fiesta EX 16 = **415**.

## Confidence

**High confidence (straight from the game):** `id`, `title`/`titleKor`, `artist`/`artistKor`, `bpm`, `charts` (S/D + levels), `generation`, `channel`, `lengthType`. Spot-checked against your old hand-data (e.g. Cynical S `[8,12,16,18,21]` / D `[14,19,23]`) — exact match.

**Lower confidence / worth a glance:**
- `version` names for `generation` 2–17 are bucketed as a single "Legacy" (matches your old app). Raw `generation` is always present if you want a finer split later.
- `channel` / `lengthType` numeric meanings are inferred from the data, not from labels in the game.
- A handful of titles contain non-Latin glyphs that render fine as UTF-8 but are worth eyeballing (e.g. `10033` "Reincarnate in …").

## How to regenerate after a future game update

1. Launch the updated game so it loads the song select.
2. `procdump64 -ma "<PID>" piu_dump.dmp`
3. `python extract_nrbf.py` (locates the `Dictionary<String,Data.Song>` NRBF blob in the dump and writes `songdb_raw1200k.bin`).
4. `Deserialize.exe songdb_raw1200k.bin songs_raw.json`
5. `python build_songs.py` → `songs.json`
6. `python extract_banners.py` then `python resize_banners.py` → refreshed banners by ID.

All scripts are in `C:\piu_extract`. No hand-editing required — the game is the source of truth.

## Output inventory (in `C:\piu_extract`)

- `songs.json` — all 415 songs, agreed schema.
- `banners\` — 415 full-res PNGs (1920×1080), named `<id>.png`.
- `banners_app\` — 415 resized PNGs (width 512, ~75 MB) for app bundling.
- `report.md` — this file.
- Scripts: `extract_nrbf.py`, `Deserialize.cs`/`.exe`, `build_songs.py`, `extract_banners.py`, `resize_banners.py`, plus recon/analysis helpers.
- `piu_dump.dmp` — the raw process dump (4.26 GB; can be deleted once satisfied).
