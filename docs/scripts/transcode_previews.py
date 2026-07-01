"""
Transcode extracted preview MP3s to lightweight app assets.
Source previews are 192 kbps stereo (~233 KB each). We downmix to mono 64 kbps
(~80 KB each) which is plenty for a song-select preview button.

Usage: python transcode_previews.py <src_dir> <dst_dir>
"""
import os, sys, subprocess, shutil

FFMPEG = shutil.which("ffmpeg") or \
    r"C:\Users\mcoro\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"

def main(src, dst, bitrate="64k"):
    os.makedirs(dst, exist_ok=True)
    files = sorted(f for f in os.listdir(src) if f.endswith(".mp3"))
    ok = fail = 0
    for f in files:
        i = os.path.join(src, f); o = os.path.join(dst, f)
        r = subprocess.run(
            [FFMPEG, "-y", "-loglevel", "error", "-i", i,
             "-ac", "1", "-b:a", bitrate, "-map_metadata", "-1", o],
            capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(o):
            ok += 1
        else:
            fail += 1; print("FAIL", f, r.stderr[:120])
    insz = sum(os.path.getsize(os.path.join(src, f)) for f in files)
    outsz = sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst) if f.endswith(".mp3"))
    print(f"\ntranscoded {ok} files ({fail} failed): {insz/1e6:.1f}MB -> {outsz/1e6:.1f}MB")

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else r"C:\piu_extract\preview_audio"
    dst = sys.argv[2] if len(sys.argv) > 2 else r"C:\piu_extract\preview_audio_app"
    main(src, dst)
