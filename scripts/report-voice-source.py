from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile
import json,difflib
root=Path(__file__).resolve().parents[1];proof=root/'docs/voice-school-proof'
baseline=json.loads((proof/'before-source-hashes.json').read_text(encoding='utf-8-sig'))
changed=[name for name,digest in baseline.items() if not (root/name).exists() or sha256((root/name).read_bytes()).hexdigest()!=digest.lower()]
protected=['src/art/NarrativeActors.ts','src/art/NarrativePalette.ts','src/cinematic/motifs.ts','src/verdict/state.ts','src/stayed/state.ts','src/ripple/state.ts','src/finale/state.ts','src/future/FutureWorld.ts','src/future/GrandArchitecture.ts']
if set(protected)&set(changed):raise RuntimeError('Protected gameplay/art changed')
diff=[]
with ZipFile(proof/'before-source.zip') as archive:
    if archive.testzip():raise RuntimeError('Snapshot CRC failed')
    for name in changed:
        diff.extend(difflib.unified_diff(archive.read(name).decode('utf-8-sig').splitlines(keepends=True),(root/name).read_text(encoding='utf-8-sig').splitlines(keepends=True),fromfile='before/'+name,tofile='after/'+name))
(proof/'integration-diff.patch').write_text(''.join(diff),encoding='utf8')
runtime={p.relative_to(root).as_posix():sha256(p.read_bytes()).hexdigest() for folder in ['src','public'] for p in (root/folder).rglob('*') if p.is_file()}
result={'compared':len(baseline),'preserved':len(baseline)-len(changed),'changed':changed,'newSource':[name for name in runtime if name.startswith('src/') and name not in baseline],'protectedUnchanged':protected,'runtimeHashes':runtime}
(proof/'source-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in result.items() if k!='runtimeHashes'},ensure_ascii=False))

