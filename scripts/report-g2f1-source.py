from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile
import json,difflib
root=Path(__file__).resolve().parents[1];proof=root/'docs/art/g2f1-proof'
manifest=json.loads((proof/'before/source-hashes.json').read_text(encoding='utf8'))
allowed={'src/chapter/ChapterGame.tsx','src/chapter/ChapterAudio.ts','src/future/FutureWorld.ts','src/future/FutureFallback.ts','src/future/direction.ts','src/future/future.css'}
changed=[name for name,item in manifest.items() if not (root/name).exists() or sha256((root/name).read_bytes()).hexdigest()!=item['sha256']]
unexpected=sorted(set(changed)-allowed)
if unexpected:raise RuntimeError('Protected G2F.1 source changed: '+str(unexpected))
diff=[]
with ZipFile(proof/'before/source-before.zip') as z:
 if z.testzip():raise RuntimeError('Baseline source archive CRC failed')
 for name in changed:diff.extend(difflib.unified_diff(z.read(name).decode('utf8').splitlines(keepends=True),(root/name).read_text(encoding='utf8').splitlines(keepends=True),fromfile='before/'+name,tofile='after/'+name))
(proof/'integration-diff.patch').write_text(''.join(diff),encoding='utf8')
files=[p for p in (root/'src').rglob('*') if p.is_file()]+[p for p in (root/'public').rglob('*') if p.is_file()]
result={'compared':len(manifest),'preserved':len(manifest)-len(changed),'changed':changed,'unexpected':unexpected,'runtimeHashes':{p.relative_to(root).as_posix():sha256(p.read_bytes()).hexdigest() for p in files}}
(proof/'source-verification.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in result.items() if k!='runtimeHashes'}))
