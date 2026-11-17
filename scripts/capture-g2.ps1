param([ValidateSet('baseline','after')][string]$Phase='baseline',[switch]$WaitForRegression)
$ErrorActionPreference='Continue'
$captureRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $captureRoot
$captureFolder=Join-Path $captureRoot ('docs/art/proof/'+$Phase)
New-Item -ItemType Directory -Force -Path $captureFolder | Out-Null
if($WaitForRegression){
 do {
  Start-Sleep -Seconds 5
  $regression=Get-Content -Raw (Join-Path $captureFolder 'status.json') | ConvertFrom-Json
  if($regression.status -eq 'failed'){exit 1}
 } while($regression.current -ne 'complete')
}
$env:ART_CAPTURE_PHASE=$Phase
@{status='running';updated=(Get-Date -Format o)} | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $captureFolder 'capture-status.json')
& npx.cmd playwright test cinematic-g2-art.spec.ts --trace off 2>&1 | Tee-Object -FilePath (Join-Path $captureFolder 'capture.log')
$captureExit=$LASTEXITCODE
@{status=$(if($captureExit -eq 0){'passed'}else{'failed'});exitCode=$captureExit;updated=(Get-Date -Format o)} | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $captureFolder 'capture-status.json')
exit $captureExit
