from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile, ZIP_DEFLATED
import json
root=Path(__file__).resolve().parents[1]
out=root/'docs/art/g2f-proof/baseline';out.mkdir(parents=True,exist_ok=True)
paths=list((root/'src').rglob('*'))+list((root/'public').rglob('*'))
paths += [root/n for n in ['package.json','package-lock.json','vite.config.ts','index.html','.gitignore']]
files=[p for p in paths if p.is_file()]
manifest={str(p.relative_to(root)).replace('\\','/'):{'sha256':sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in files}
(out/'source-hashes.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
with ZipFile(out/'source-before.zip','w',ZIP_DEFLATED) as z:
 for p in files:z.write(p,str(p.relative_to(root)))
bundles={p.name:p.stat().st_size for p in (root/'dist/assets').glob('*') if p.is_file()}
(out/'bundles.json').write_text(json.dumps(bundles,indent=2),encoding='utf8')
print('Sealed',len(files),'files',bundles)
