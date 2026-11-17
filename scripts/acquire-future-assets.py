"""Fetch bounded CC0 assets; no credentials or runtime third-party requests."""
from pathlib import Path
from urllib.request import Request,urlopen
from hashlib import sha256
from zipfile import ZipFile
import json,re
root=Path(__file__).resolve().parents[1]
proof=root/'docs/art/g2f-proof/acquisition';dest=root/'public/future';dest.mkdir(parents=True,exist_ok=True)
def fetch(url):
 return urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://kenney.nl/assets/city-kit-commercial','X-Requested-With':'XMLHttpRequest'}),timeout=60).read()
manifest=[]
def save(name,data,source,license='CC0-1.0'):
 p=dest/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 manifest.append({'path':'public/future/'+name,'source':source,'license':license,'bytes':len(data),'sha256':sha256(data).hexdigest()})
page=(proof/'kenney-page.html').read_text(encoding='utf8')
id=re.search(r'data-download-id=\'([^\']+)',page).group(1)
link=json.loads(fetch('https://kenney.nl/download-link/'+id))
print('Download response keys',list(link),flush=True)
url=link.get('url') or link.get('download') or link.get('link')
if not url:raise ValueError('Download URL missing')
archive=proof/'kenney-city.zip';archive.write_bytes(fetch(url))
with ZipFile(archive) as z:
 names=z.namelist();print('GLB candidates',[n for n in names if n.lower().endswith('.glb')][:18],flush=True)
 chosen=[n for n in names if n.lower().endswith('.glb') and any(k in n.lower() for k in ['skyscraper-a','skyscraper-b','skyscraper-c','building-a','building-b'])]
 for n in chosen:save('city/'+Path(n).name,z.read(n),'https://kenney.nl/assets/city-kit-commercial')
 for n in names:
  if n.endswith('colormap.png') and 'GLB format' in n:save('city/Textures/colormap.png',z.read(n),'https://kenney.nl/assets/city-kit-commercial')
 licenses=[n for n in names if 'license' in n.lower() and n.lower().endswith('.txt')]
 for n in licenses:(dest/'KENNEY-LICENSE.txt').write_bytes(z.read(n))
for asset in ['floor_tiles_06','studio_small_09']:
 metadata=json.loads((proof/(asset+'.json')).read_text(encoding='utf8'))
 if asset.startswith('floor'):
  for kind,api_name in [('diff','Diffuse'),('rough','Rough'),('nor_gl','nor_gl')]:
   if api_name not in metadata:
    api_name=next(k for k in metadata if kind in k.lower() or (kind=='rough' and 'rough' in k.lower()) or (kind=='nor_gl' and 'normal' in k.lower()))
   entry=metadata[api_name]['1k']['jpg'];save('materials/'+asset+'_'+kind+'.jpg',fetch(entry['url']),'https://polyhaven.com/a/'+asset)
 else:
  entry=metadata['hdri']['1k']['hdr'];save('lighting/'+asset+'.hdr',fetch(entry['url']),'https://polyhaven.com/a/'+asset)
(proof/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print('Saved',len(manifest),'assets',sum(x['bytes'] for x in manifest),flush=True)
