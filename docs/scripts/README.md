# DataAssets extraction / RE scripts

Tooling behind `docs/dataassets-decryption.md`. Windows-only (needs the installed
Steam game). Paths inside the scripts point at the default Steam install and a working
dir `C:\piu_extract` — edit the constants at the top if yours differ.

Requires: `pip install pycryptodome capstone pefile mutagen` and, for transcoding,
`ffmpeg` on PATH. RE step also needs
[Il2CppDumper](https://github.com/Perfare/Il2CppDumper).

## Extraction (uses the recovered key — just run these)
| script | output |
|--------|--------|
| `extract_preview_audio.py` | `preview_audio/<id>.mp3` — 415 song-select previews (~10 s) |
| `extract_all_songs.py`     | `Downloads\rise_complete_version\<id> - <title>.mp3` — full songs |
| `transcode_previews.py <src> <dst>` | mono 64 kbps copies for app bundling |

## Reverse-engineering (how the key/naming were found — for a game update)
| script | purpose |
|--------|---------|
| `disasm.py`         | capstone disassembly of `SecurityPlayerPrefs..cctor`/`Decrypt`, resolving string-literal loads |
| `xref_strings.py`   | byte-pattern xref of `mov/lea reg,[rip+disp]` into the **`il2cpp`** PE section → find who references `previewAudio`, `/DataAssets/`, etc. |
| `get_salt.py`       | pull the 8-byte PBKDF2 salt from IL2CPP metadata field-default-values (v31) |
| `find_hash_format.py` | confirm `SHA256(prefix+id)` filename scheme against real files |

First run Il2CppDumper to produce `dump.cs` / `stringliteral.json` / `script.json`
(the RE scripts read those from `C:\piu_extract\il2cpp_out`).
