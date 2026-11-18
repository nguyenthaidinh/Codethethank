"""Bake the fictional AION's authored lines into local game audio."""

import asyncio
import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
VOICE = "vi-VN-NamMinhNeural"
TRIM = (
    "silenceremove=start_periods=1:start_duration=0.025:"
    "start_threshold=-48dB:start_silence=0.055"
)
ROOM_TONE = (
    f"{TRIM},areverse,{TRIM},areverse,"
    "highpass=f=75,equalizer=f=2500:t=q:w=1.2:g=1.3,"
    "aecho=0.9:0.95:47:0.11,loudnorm=I=-17:TP=-2:LRA=8"
)


async def main():
    cues = json.loads((ROOT / "src/speech/aion-2046.json").read_text(encoding="utf-8"))
    with TemporaryDirectory(prefix="aion-2046-") as scratch:
        for phase in sys.argv[1:] or cues:
            for cue in cues[phase]:
                target = ROOT / "public" / cue["file"]
                target.parent.mkdir(parents=True, exist_ok=True)
                raw = Path(scratch) / target.name
                rendered = Path(scratch) / f"final-{target.name}"
                words = cue["text"].replace("AION", "Ai-on")
                for attempt in range(6):
                    try:
                        await edge_tts.Communicate(
                            words, VOICE, rate="-10%", pitch="-7Hz"
                        ).save(str(raw))
                        break
                    except edge_tts.exceptions.NoAudioReceived:
                        if attempt == 5:
                            raise
                        await asyncio.sleep(1)
                subprocess.run(
                    ["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", ROOM_TONE,
                     "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k", str(rendered)],
                    check=True,
                )
                seconds = float(subprocess.check_output(
                    ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                     "-of", "default=nw=1:nk=1", str(rendered)]
                ))
                window = cue["end"] - cue["start"]
                if seconds > window - 0.15:
                    raise ValueError(f"{target.name} lasts {seconds:.2f}s in a {window:.2f}s window")
                target.write_bytes(rendered.read_bytes())
                print(f"{target.name}: {seconds:.2f}s / {window:.2f}s", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
