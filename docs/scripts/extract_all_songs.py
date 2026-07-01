"""
Extract ALL full-length song audio from Pump It Up Rise as MP3.

Same cipher + naming as extract_preview_audio.py, but prefix "AUDIO" (full song)
instead of "PREVIEWAUDIO". See docs/dataassets-decryption.md for the reverse-engineering.

Output: <OUT>/<songID> - <title>.mp3   (default OUT = Downloads\rise_complete_version)
"""
import hashlib, os, io, json, re, sys
from Crypto.Cipher import AES

DA    = r"C:\Program Files (x86)\Steam\steamapps\common\PUMP IT UP RISE\PUMP IT UP RISE_Data\DataAssets"
SONGS = r"C:\piu_extract\songs.json"
OUT   = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.expanduser("~"), "Downloads", "rise_complete_version")

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

def safe(s):
    return re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', s).strip() or "untitled"

def main():
    os.makedirs(OUT, exist_ok=True)
    songs = json.load(io.open(SONGS, encoding='utf-8'))['songs']
    ok = miss = bad = 0
    for s in songs:
        sid = s['id']
        fn = os.path.join(DA, data_name("AUDIO", sid))
        if not os.path.exists(fn):
            print("  MISSING", sid); miss += 1; continue
        pt = decrypt(open(fn, 'rb').read())
        if pt[:3] != b'ID3' and pt[:2] not in (b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'):
            print("  NOT-MP3", sid, pt[:4].hex()); bad += 1; continue
        title = safe(s.get('title', sid))
        open(os.path.join(OUT, f"{sid} - {title}.mp3"), 'wb').write(pt)
        ok += 1
    print(f"\nwrote {ok} full songs to {OUT}  (missing {miss}, bad {bad})")

if __name__ == "__main__":
    main()
