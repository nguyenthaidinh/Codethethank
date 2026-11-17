"""Create a calmer local narration, preserving pitch and the original audio."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
catalog_path = ROOT / "src/speech/catalog.json"
catalog = json.loads(catalog_path.read_text(encoding="utf-8-sig"))
tempo = 0.88
for key, entry in catalog.items():
    source_file = entry.get("sourceFile", entry["file"])
    source = ROOT / "public" / source_file
    destination_file = f"voice/vi-hoaimy-calm/{key}.mp3"
    destination = ROOT / "public" / destination_file
    destination.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-i", str(source),
        "-af", f"atempo={tempo}", "-ar", "24000", "-ac", "1",
        "-b:a", "96k", str(destination),
    ], check=True)
    duration = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(destination),
    ]))
    catalog[key] = {
        "file": destination_file,
        "seconds": duration,
        "sourceFile": source_file,
        "tempo": tempo,
        "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
    }
    print(key, round(duration, 3))
catalog_path.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
