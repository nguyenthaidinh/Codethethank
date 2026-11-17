"""Join the authored local narrator clips, trimming only the outer silence."""
import hashlib
import json
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
catalog = json.loads((ROOT / "src/speech/catalog.json").read_text(encoding="utf-8"))
temporary = ROOT / ".voice-build/continuous-opening"
temporary.mkdir(parents=True, exist_ok=True)
sample_rate = 24000
gap = .22
frames = bytearray(b"\0" * int(.25 * sample_rate) * 2)
clips = []
for key, entry in catalog.items():
    target = temporary / f"{key}.wav"
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-i", str(ROOT / "public" / entry["file"]),
        "-af", "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,areverse",
        "-ar", str(sample_rate), "-ac", "1", "-c:a", "pcm_s16le", str(target),
    ], check=True)
    with wave.open(str(target), "rb") as wav:
        sound = wav.readframes(wav.getnframes())
    start = len(frames) / (2 * sample_rate)
    frames.extend(sound)
    end = len(frames) / (2 * sample_rate)
    clips.append({"key": key, "start": start, "end": end, "sourceFile": entry["file"]})
    if len(clips) < len(catalog):
        frames.extend(b"\0" * int(gap * sample_rate) * 2)
frames.extend(b"\0" * int(.6 * sample_rate) * 2)
wav_path = temporary / "opening.wav"
with wave.open(str(wav_path), "wb") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sample_rate)
    wav.writeframes(frames)
relative_path = "voice/vi-hoaimy-calm/opening-continuous.mp3"
output = ROOT / "public" / relative_path
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav_path), "-b:a", "96k", str(output)], check=True)
manifest = {
    "file": relative_path, "seconds": len(frames) / (2 * sample_rate),
    "gap": gap, "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "clips": clips,
}
(ROOT / "src/speech/opening-track.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"seconds": manifest["seconds"], "clips": clips}, indent=2))
