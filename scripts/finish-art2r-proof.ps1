$ErrorActionPreference='Stop'
$proofWorkspace=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $proofWorkspace
$proofFolder=Join-Path $proofWorkspace 'docs/art2r/proof/after'
$proofStatusFile=Join-Path $proofFolder 'proof-status.json'
function Save-ProofStatus($state,$detail){@{status=$state;detail=$detail;updated=(Get-Date -Format o)} | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath $proofStatusFile}
Save-ProofStatus 'waiting' 'Wait for regression; capture without concurrent browser workload'
try {
 do {
  $proofRun=Get-Content -Raw (Join-Path $proofFolder 'status.json') | ConvertFrom-Json
  if($proofRun.status -eq 'failed'){throw ('QA failed at '+$proofRun.current)}
  if($proofRun.current -eq 'complete' -and $proofRun.status -eq 'passed'){break}
  Start-Sleep -Seconds 5
 } while($true)
 Save-ProofStatus 'running' 'Production capture and integrity checks'
 $proofServerAvailable=$false
 try {$proofResponse=Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/' -TimeoutSec 2;$proofServerAvailable=$proofResponse.StatusCode -eq 200} catch {}
 if(-not $proofServerAvailable){
  $proofVite=Join-Path $proofWorkspace 'node_modules/vite/bin/vite.js'
  $proofServer=Start-Process node.exe -WindowStyle Hidden -WorkingDirectory $proofWorkspace -ArgumentList @(('"{0}"' -f $proofVite),'preview','--host','127.0.0.1','--port','4173','--strictPort') -RedirectStandardOutput (Join-Path $proofFolder 'preview.log') -RedirectStandardError (Join-Path $proofFolder 'preview-error.log') -PassThru
  $proofServer.Id | Set-Content -LiteralPath (Join-Path $proofFolder 'preview.pid')
  Start-Sleep -Seconds 2
 }
 & node.exe scripts/inspect-2r.mjs 'http://127.0.0.1:4173/' 2>&1 | Tee-Object -FilePath (Join-Path $proofFolder 'capture.log')
 if($LASTEXITCODE -ne 0){throw 'Runtime capture failed'}
 & node.exe scripts/probe-art2r.mjs 2>&1 | Tee-Object -FilePath (Join-Path $proofFolder 'performance.log')
 if($LASTEXITCODE -ne 0){throw 'Performance probe failed'}
 $proofRaw=Join-Path $proofFolder 'runtime/teacher-chair-notebook-live-audio.webm'
 $proofMovie=Join-Path $proofFolder 'runtime/hero-demo.webm'
 & ffmpeg.exe -y -v error -i $proofRaw -c copy $proofMovie
 if($LASTEXITCODE -ne 0){throw 'Video remux failed'}
 & ffprobe.exe -v quiet -show_streams -show_format -of json $proofMovie | Set-Content -Encoding utf8 -LiteralPath (Join-Path $proofFolder 'runtime/demo-tracks.json')
 & node.exe scripts/report-art2r.mjs 2>&1 | Tee-Object -FilePath (Join-Path $proofFolder 'integrity.log')
 if($LASTEXITCODE -ne 0){throw 'Source integrity failed'}
 & node.exe scripts/package-art2r.mjs
 if($LASTEXITCODE -ne 0){throw 'Build archive failed'}
 Save-ProofStatus 'passed' 'Runtime PNGs, real videos, source integrity and build archive complete'
} catch {Save-ProofStatus 'failed' ([string]$_);exit 1}
