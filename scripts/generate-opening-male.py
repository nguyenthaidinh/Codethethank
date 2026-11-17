"""Build local opening narration only; requires edge-tts and ffmpeg on PATH."""
import asyncio
import json
import subprocess
from hashlib import sha256
from pathlib import Path
import edge_tts
import argparse
import re

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--voice', default='vi-VN-NamMinhNeural')
parser.add_argument('--rate', default='-3%')
parser.add_argument('--folder', default='vi-namminh')
parser.add_argument('--reuse-existing', action='store_true')
parser.add_argument('--fit-opening', action='store_true')
args = parser.parse_args()

async def main():
    catalog_path = ROOT / 'src/speech/catalog.json'
    catalog = json.loads(catalog_path.read_text(encoding='utf-8-sig'))
    lines = json.loads((ROOT / '.voice-build/lines.json').read_text(encoding='utf-8-sig'))
    output = ROOT / 'public/voice' / args.folder
    output.mkdir(parents=True, exist_ok=True)
    proof = []
    windows = re.findall(r'start: ([\d.]+),\s+end: ([\d.]+)', (ROOT / 'src/future/direction.ts').read_text(encoding='utf-8'))
    for index, key in enumerate(catalog):
        raw = ROOT / '.voice-build' / f'{key}-{args.folder}.mp3'
        target = output / f'{key}.mp3'
        if not (args.reuse_existing and target.exists()):
            for attempt in range(12):
                try:
                    await edge_tts.Communicate(lines[key]['text'], args.voice, rate=args.rate).save(str(raw))
                    break
                except edge_tts.exceptions.NoAudioReceived:
                    if attempt == 11:
                        raise
                    await asyncio.sleep(1)
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(raw), '-af', 'loudnorm=I=-18:TP=-2:LRA=9', '-ar', '24000', '-ac', '1', '-b:a', '96k', str(target)], check=True)
        seconds = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(target)]))
        tempo = 1.0
        if args.fit_opening:
            start, end = map(float, windows[index])
            limit = end - start - .5
            if seconds > limit:
                tempo = seconds / limit
                fitted = raw.with_name(raw.stem + '-fitted.mp3')
                subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(target), '-af', f'atempo={tempo:.6f}', '-ar', '24000', '-ac', '1', '-b:a', '96k', str(fitted)], check=True)
                fitted.replace(target)
                seconds = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(target)]))
        catalog[key] = {'file': f'voice/{args.folder}/{key}.mp3', 'seconds': seconds}
        proof.append({'key': key, **lines[key], 'seconds': seconds, 'tempoCorrection': tempo, 'bytes': target.stat().st_size, 'sha256': sha256(target.read_bytes()).hexdigest()})
        print(key, seconds, flush=True)
    catalog_path.write_text(json.dumps(catalog, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'docs/opening-readability-proof/voice-manifest.json').write_text(json.dumps({
        'model': args.voice, 'engine': 'edge-tts 7.3.1 (build only)',
        'modelSource': 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support',
        'scope': 'Opening narrator only; seven pre-generated local clips; no user text sent at runtime.',
        'rate': args.rate, 'lines': proof,
        'rights': 'Microsoft service-generated audio; not covered by the previous Piper model license.'
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

asyncio.run(main())
