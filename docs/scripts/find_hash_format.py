"""
Empirically confirm the DataAssets filename scheme:
    filename = SHA256_UPPERHEX( <PREFIX_NAME> + songID )
by brute-matching candidate strings against the real hash-named files.
Run after you suspect the format from GlobalFunc.GetHashStr / HashPrefix.
"""
import hashlib, os, io, json

DA    = r"C:\Program Files (x86)\Steam\steamapps\common\PUMP IT UP RISE\PUMP IT UP RISE_Data\DataAssets"
SONGS = r"C:\piu_extract\songs.json"

allnames = set(f for f in os.listdir(DA) if not f.endswith('.meta'))
ids = [s['id'] for s in json.load(io.open(SONGS, encoding='utf-8'))['songs']]
PREFIXES = ["STEP", "AUDIO", "VIDEO", "PREVIEWAUDIO", "LIGHTMAP", "PLAYTYPE", "BGAEFFECTMAP"]

def H(s): return hashlib.sha256(s.encode('utf-8')).hexdigest().upper()

for prefix in PREFIXES:
    hit = sum(1 for sid in ids if H(prefix + sid) in allnames)
    print(f"  {prefix:14} prefix+id : {hit}/{len(ids)} match")
# sanity: the reverse order should NOT match
print("  (control) id+PREVIEWAUDIO:",
      sum(1 for sid in ids if H(sid + "PREVIEWAUDIO") in allnames), "/", len(ids))
