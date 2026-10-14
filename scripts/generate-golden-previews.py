#!/usr/bin/env python3
"""Generate short public Golden Rama previews, never publish full masters."""
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

def generate(source, target):
    target = pathlib.Path(target)
    target.mkdir(parents=True, exist_ok=True)
    tracks = []
    with zipfile.ZipFile(source) as archive:
        for info in archive.infolist():
            path = pathlib.PurePosixPath(info.filename.replace("\\", "/"))
            if (info.is_dir() or "__MACOSX" in path.parts or path.name.startswith("._")
                    or path.suffix.lower() != ".mp3" or info.file_size < 1024):
                continue
            if "Plaqes & Racks Mix Tape Singles" in path.parts:
                collection = "Singles"
            elif "Plaqes & Racks Mix Tape Collabs" in path.parts:
                collection = "Collaborations"
            else:
                continue
            title = re.sub(r"^\d{1,3}\s+", "", path.stem).strip()
            if not title:
                continue
            slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:50]
            suffix = hashlib.sha256(info.filename.encode()).hexdigest()[:10]
            name = slug + "-" + suffix + ".mp3"
            output = target / name
            with tempfile.TemporaryDirectory() as folder:
                master = pathlib.Path(folder) / "source.mp3"
                with archive.open(info) as src, master.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
                subprocess.run([
                    "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
                    "-y", "-ss", "15", "-i", str(master), "-t", "30",
                    "-vn", "-ac", "2", "-ar", "44100", "-b:a", "96k",
                    str(output)
                ], check=True, timeout=120)
            if output.stat().st_size < 4096:
                raise RuntimeError("Preview was empty: " + title)
            tracks.append({"title": title, "collection": collection,
                           "preview": "previews/" + name, "seconds": 30})
    if len(tracks) != 51:
        raise RuntimeError("Expected 51 real Golden Rama tracks; found " + str(len(tracks)))
    manifest = {"site": "goldenrama440", "tracks": tracks}
    pathlib.Path("golden-preview-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Generated", len(tracks), "short previews; no full masters exported.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 scripts/generate-golden-previews.py approved.zip previews")
    generate(sys.argv[1], sys.argv[2])
