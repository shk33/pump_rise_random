"""
Extract per-song PREVIEW AUDIO from Pump It Up Rise.

DataAssets files are AES-256-CBC (PKCS7) encrypted; key/iv derived (once) via
.NET Rfc2898DeriveBytes(password, salt, 1000) inside Utility.SecurityPlayerPrefs.
Filename in DataAssets = SHA256_UPPERHEX( <PREFIX> + songID ), prefix from
GlobalFunc.HashPrefix: STEP/AUDIO/VIDEO/PREVIEWAUDIO/LIGHTMAP/...
(recovered from GameAssembly.dll via Il2CppDumper — see EXTRACTION_REPORT.md).

Output: preview_audio/<songID>.mp3  (one per song)
"""
import hashlib, os, io, json, sys
from Crypto.Cipher import AES

DA   = r"C:\Program Files (x86)\Steam\steamapps\common\PUMP IT UP RISE\PUMP IT UP RISE_Data\DataAssets"
SONGS= r"C:\piu_extract\songs.json"
OUT  = r"C:\piu_extract\preview_audio"

# --- crypto (Utility.SecurityPlayerPrefs) ---
PASSWORD = b"qoffbzleheocnd654.krerkxdmsrjsjgdjtj"
SALT     = bytes.fromhex("0c0d4d333a0e4b63")
_raw = hashlib.pbkdf2_hmac('sha1', PASSWORD, SALT, 1000, 48)
KEY, IV = _raw[:32], _raw[32:48]

def data_name(prefix, song_id):
    return hashlib.sha256((prefix + song_id).encode('utf-8')).hexdigest().upper()

def decrypt(raw):
    n = (len(raw)//16)*16
    pt = AES.new(KEY, AES.MODE_CBC, IV).decrypt(raw[:n])
    pad = pt[-1]
    if 1 <= pad <= 16 and all(b == pad for b in pt[-pad:]):
        pt = pt[:-pad]
    return pt

def main():
    os.makedirs(OUT, exist_ok=True)
    songs = json.load(io.open(SONGS, encoding='utf-8'))['songs']
    ok = miss = bad = 0
    for s in songs:
        sid = s['id']
        fn = os.path.join(DA, data_name("PREVIEWAUDIO", sid))
        if not os.path.exists(fn):
            print("  MISSING", sid); miss += 1; continue
        pt = decrypt(open(fn, 'rb').read())
        if pt[:3] != b'ID3' and pt[:2] != b'\xff\xfb' and pt[:2] != b'\xff\xf3':
            print("  NOT-MP3", sid, pt[:4].hex()); bad += 1; continue
        open(os.path.join(OUT, f"{sid}.mp3"), 'wb').write(pt)
        ok += 1
    print(f"\nwrote {ok} preview mp3s to {OUT}  (missing {miss}, bad {bad})")

if __name__ == "__main__":
    main()
