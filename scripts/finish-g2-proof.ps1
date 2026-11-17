$ErrorActionPreference='Continue'
$proofRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $proofRoot
$proofStatus=Join-Path $proofRoot 'docs/art/proof/proof-status.json'
function Set-ProofStatus($state,$detail){@{status=$state;detail=$detail;updated=(Get-Date -Format o)} | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath $proofStatus}
Set-ProofStatus 'waiting' 'Wait for final regression, no concurrent GPU measurement'
do {
 Start-Sleep -Seconds 5
 $proofRegression=Get-Content -Raw 'docs/art/proof/after/status.json' | ConvertFrom-Json
 if($proofRegression.status -eq 'failed'){Set-ProofStatus 'failed' 'Regression failed';exit 1}
} while($proofRegression.current -ne 'complete' -or $proofRegression.status -ne 'passed')
$proofServers=@()
try {
 foreach($proofVariant in @(@{name='baseline';port=4188;build='docs/art/proof/baseline/build'},@{name='after';port=4189;build='dist'})){
  Set-ProofStatus 'running' $proofVariant.name
  $proofVite=Join-Path $proofRoot 'node_modules/vite/bin/vite.js'
  $proofBuild=Join-Path $proofRoot $proofVariant.build
  $proofArgs=@(('"{0}"' -f $proofVite),'preview','--host','127.0.0.1','--strictPort','--port',([string]$proofVariant.port),'--outDir',('"{0}"' -f $proofBuild))
  $proofServer=Start-Process node.exe -WindowStyle Hidden -WorkingDirectory $proofRoot -ArgumentList $proofArgs -RedirectStandardOutput (Join-Path $proofRoot ('docs/art/proof/'+$proofVariant.name+'/preview.log')) -RedirectStandardError (Join-Path $proofRoot ('docs/art/proof/'+$proofVariant.name+'/preview-error.log')) -PassThru
  $proofServers+=$proofServer
  $proofUrl='http://127.0.0.1:'+$proofVariant.port+'/'
  $proofReady=$false
  foreach($proofAttempt in 1..20){
   try {$response=Invoke-WebRequest -UseBasicParsing -Uri $proofUrl -TimeoutSec 2 -ErrorAction Stop;if($response.StatusCode -eq 200){$proofReady=$true;break}} catch {}
   Start-Sleep -Seconds 1
  }
  if(-not $proofReady){throw ('Preview unavailable: '+$proofVariant.name)}
  & node.exe scripts/capture-g2-pairs.mjs $proofVariant.name $proofUrl 2>&1 | Tee-Object -FilePath ('docs/art/proof/'+$proofVariant.name+'/matched.log')
  if($LASTEXITCODE -ne 0){throw ('Capture failed: '+$proofVariant.name)}
 }
 & node.exe scripts/report-g2.mjs 2>&1 | Tee-Object -FilePath 'docs/art/proof/comparison.log'
 if($LASTEXITCODE -ne 0){throw 'Comparison failed'}
 Set-ProofStatus 'passed' 'Both production builds hash-verified; matched cameras and warm probes complete'
} catch {
 Set-ProofStatus 'failed' ([string]$_)
 exit 1
} finally {
 foreach($proofServer in $proofServers){Stop-Process -Id $proofServer.Id -ErrorAction SilentlyContinue}
}
