# Decrypting Pump It Up Rise `DataAssets` (audio / charts / BGA video)

How the app's per-song **preview audio** (and, if wanted, full songs, charts and BGA
videos) were extracted from the game. This is the reverse-engineering writeup + the
scripts, so it can be redone after a game update. Companion to `EXTRACTION_REPORT.md`
(song metadata + banners).

> Everything here targets the **Steam** build: `PUMP IT UP RISE` — Unity 2022.3.62f2,
> IL2CPP, metadata v31. Nothing in the game install is modified (read-only).

---

## TL;DR

- Song audio is **not** in the Unity Addressables (`aa/`); those only hold the banner
  (`<id>_steam.png`) and a **silent** preview video (`<id>_steam.webm`, VP8, no audio).
- All audio/charts/video live **AES-encrypted** in
  `…/PUMP IT UP RISE_Data/DataAssets/` — 4804 hash-named files (~32 GB).
- Cipher recovered from `GameAssembly.dll`: **AES-256-CBC + PKCS7**, key/IV from
  `Rfc2898DeriveBytes(password, salt, 1000)` (PBKDF2-HMAC-SHA1).
- Filename = `SHA256_UPPERHEX(<PREFIX> + songID)`, prefix ∈ {STEP, AUDIO, VIDEO,
  **PREVIEWAUDIO**, LIGHTMAP, PLAYTYPE, BGAEFFECTMAP}.
- Decrypt `PREVIEWAUDIO`+id → **MP3** preview (≈10 s). 415/415 songs covered.

## The secrets (this build)

```
password (UTF-8) : qoffbzleheocnd654.krerkxdmsrjsjgdjtj
salt (8 bytes)   : 0c 0d 4d 33 3a 0e 4b 63
iterations       : 1000  (PBKDF2-HMAC-SHA1)
key = GetBytes(32): 15e871b4a8723ebb953764bc4978eb05445af8c3f6aa407cde3d7e12e4790bec
iv  = GetBytes(16): 480ba560cad32cd20acb8d0dda4e414e
cipher           : AES-256-CBC, PKCS7
```

> ⚠️ There are two hard-coded strings. The **other** one,
> `eocndzlaks123rkxdltntwksjgdjtj`, is only used to build `_saltForKey` for a
> PlayerPrefs hash — it is **not** the AES password. Using it gives garbage.

## Filenames

`GlobalFunc.GetHashStr(string id, GlobalFunc.HashPrefix prefix)` returns
`SHA256( string.Format("{0}{1}", prefixName, id) )` as **UPPERCASE hex** (`X2`).
The prefix enum is rendered by **name**, and comes **first**:

| prefix (int) | string hashed        | decrypted payload |
|--------------|----------------------|-------------------|
| STEP (1)     | `STEP<id>`           | `NX20` chart      |
| AUDIO (2)    | `AUDIO<id>`          | MP3 (full song)   |
| VIDEO (3)    | `VIDEO<id>`          | WebM (BGA video)  |
| PREVIEWAUDIO (4) | `PREVIEWAUDIO<id>` | MP3 (~10 s preview) |
| LIGHTMAP (5) | `LIGHTMAP<id>`       | `NX20`            |

e.g. the preview for song `1808` = `SHA256("PREVIEWAUDIO1808")` (uppercase hex) inside
`DataAssets/`. Decrypt with the key above.

## How the key was recovered (redo on a game update)

1. **Dump IL2CPP** with [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) on
   `GameAssembly.dll` + `…/il2cpp_data/Metadata/global-metadata.dat` (metadata v31).
   Gives `dump.cs`, `stringliteral.json`, `script.json`.
2. **Find the decryptor**: `dump.cs` → `Utility.SecurityPlayerPrefs.Decrypt(byte[])`
   uses `RijndaelManaged` (CBC/PKCS7). `AudioManager.LoadMusicSound` shows the flow:
   `GetHashStr` → `Path.Combine("…/DataAssets", hash)` → `File.ReadAllBytes` →
   `SecurityPlayerPrefs.Decrypt` → FMOD.
3. **Disassemble** the `.cctor` (key setup) with `capstone` (`scripts/disasm.py`).
   Resolve `mov/lea reg,[rip+disp]` string-literal loads against `stringliteral.json`.
   Key insight: the game code lives in the **`il2cpp`** PE section (RVA ≥ `0x4de000`),
   **not** `.text` — xref scans must target that section (`scripts/xref_strings.py`).
   The `.cctor` shows `Rfc2898DeriveBytes(password="qoff…", salt=<byte[8]>, 1000)`,
   `key = GetBytes(32)`, `iv = GetBytes(16)`.
4. **Recover the salt byte[]**: it's a compile-time array loaded via
   `RuntimeHelpers.InitializeArray`. Pull it from the IL2CPP metadata
   field-default-value blob (`scripts/get_salt.py`); verify by `SHA256(salt) ==` the
   Roslyn `<PrivateImplementationDetails>` field name.
5. **Recover the naming**: `GlobalFunc.HashPrefix` enum (`dump.cs`) + `GetHashStr`
   (`SHA256Managed`, UTF-8, `{0}{1}`, `X2`). Confirm empirically by brute-matching
   `SHA256(prefix+id)` against real filenames (`scripts/find_hash_format.py`).

## Reproduce the extraction

```bash
pip install pycryptodome            # decryption
# preview audio -> preview_audio/<id>.mp3   (415 songs)
python scripts/extract_preview_audio.py
# full songs -> Downloads\rise_complete_version\<id> - <title>.mp3
python scripts/extract_all_songs.py
# lighten previews for bundling (needs ffmpeg): mono 64 kbps
python scripts/transcode_previews.py preview_audio assets/previews
```

## In this app

- `assets/previews/<id>.mp3` — 415 previews, mono 64 kbps ~78 KB each (~33 MB total).
- `utils/audioLoader.ts` — `getPreviewAudio(songId)` (mirrors `imageLoader.ts`).
- Playback needs an audio lib (Expo SDK 54 → `expo-audio`), not yet added:
  `npx expo install expo-audio`, then `useAudioPlayer(getPreviewAudio(id)).play()`.
