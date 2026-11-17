from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile
import json,difflib
root=Path(__file__).resolve().parents[1];proof=root/'docs/art/g2f-proof'
manifest=json.loads((proof/'baseline/source-hashes.json').read_text(encoding='utf8'))
changed=[]
for name,record in manifest.items():
 p=root/name
 if not p.exists() or sha256(p.read_bytes()).hexdigest()!=record['sha256']:changed.append(name)
allowed=['src/chapter/ChapterGame.tsx','src/chapter/ChapterAudio.ts']
unexpected=[name for name in changed if name not in allowed]
if unexpected:raise RuntimeError('Protected source changed: '+str(unexpected))
diff=[]
with ZipFile(proof/'baseline/source-before.zip') as z:
 if z.testzip():raise RuntimeError('Source archive CRC failed')
 for name in changed:
  before=z.read(name).decode('utf8').splitlines(keepends=True)
  after=(root/name).read_text(encoding='utf8').splitlines(keepends=True)
  diff.extend(difflib.unified_diff(before,after,fromfile='before/'+name,tofile='after/'+name))
(proof/'integration-diff.patch').write_text(''.join(diff),encoding='utf8')
files=list((root/'src/future').rglob('*'))+list((root/'public/future').rglob('*'))+[root/n for n in allowed]
hashes={str(p.relative_to(root)).replace('\\','/'):{'sha256':sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in files if p.is_file()}
result={'protectedFilesCompared':len(manifest),'changedExistingFiles':changed,'unexpectedChanges':unexpected,'sourceAndAssetHashes':hashes}
(proof/'source-verification.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps({'compared':len(manifest),'changedExisting':changed,'unexpected':unexpected}))
