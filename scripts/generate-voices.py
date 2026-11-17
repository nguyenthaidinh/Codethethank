"""Offline build tool: generate local MP3s; no TTS service runs in the game."""
from pathlib import Path
from hashlib import sha256
import os,json,shutil,wave,subprocess,time
import onnxruntime
from piper import PiperVoice,SynthesisConfig
root=Path(__file__).resolve().parents[1];build=root/'.voice-build';out=root/'public/voice/vi';out.mkdir(parents=True,exist_ok=True)
source=build/'Lib/site-packages/piper/espeak-ng-data';cache=Path(os.environ['LOCALAPPDATA'])/'UnwrittenVoiceBuild/espeak-ng-data'
if not cache.exists():shutil.copytree(source,cache)
voice=PiperVoice.load(build/'vi_VN-vais1000-medium.onnx',espeak_data_dir=cache)
lines=json.loads((build/'lines.json').read_text(encoding='utf8'));manifest={};proof=[];started=time.time()
for index,(key,item) in enumerate(lines.items()):
    wav=build/(key+'.wav');mp3=out/(key+'.mp3')
    if not mp3.exists():
        with wave.open(str(wav),'wb') as f:voice.synthesize_wav(item['text'],f,syn_config=SynthesisConfig(length_scale=.9))
        subprocess.run(['ffmpeg.exe','-y','-v','error','-i',str(wav),'-af','loudnorm=I=-18:TP=-2:LRA=9','-ar','22050','-ac','1','-c:a','libmp3lame','-b:a','64k',str(mp3)],check=True)
    seconds=float(subprocess.check_output(['ffprobe.exe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(mp3)],text=True).strip())
    manifest[key]={'file':'voice/vi/'+key+'.mp3','seconds':seconds}
    proof.append({'key':key,**item,'seconds':seconds,'bytes':mp3.stat().st_size,'sha256':sha256(mp3.read_bytes()).hexdigest()})
    print(f'{index+1}/{len(lines)} {key} {seconds:.2f}s',flush=True)
(root/'src/speech/catalog.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
(root/'docs/opening-readability-proof/voice-manifest.json').write_text(json.dumps({'model':'vi_VN-vais1000-medium','modelSHA256':sha256((build/'vi_VN-vais1000-medium.onnx').read_bytes()).hexdigest(),'engine':'piper-tts 1.8.0 (offline build only)','modelSource':'https://huggingface.co/rhasspy/piper-voices/tree/main/vi/vi_VN/vais1000/medium','modelCardDatasetLicense':'CC-BY-4.0','scope':'Opening narrator only','lines':proof,'buildSeconds':time.time()-started},ensure_ascii=False,indent=2),encoding='utf8')
shutil.copy2(build/'MODEL_CARD',out/'MODEL_CARD.txt')
print('Complete:',len(manifest),'clips,',sum(p.stat().st_size for p in out.glob('*.mp3')),'bytes',flush=True)
