param([ValidateSet('Baseline','After')][string]$Phase='Baseline',[switch]$WaitForCapture)
$ErrorActionPreference='Continue'
$artRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $artRoot
$artFolder=Join-Path $artRoot ('docs/art/proof/'+$Phase.ToLower())
New-Item -ItemType Directory -Force -Path $artFolder | Out-Null
if($WaitForCapture){
 do {
  Start-Sleep -Seconds 5
  $artCapture=Get-Content -Raw (Join-Path $artFolder 'capture-status.json') | ConvertFrom-Json
  if($artCapture.status -eq 'failed'){exit 1}
 } while($artCapture.status -ne 'passed')
}
$artStatus=Join-Path $artFolder 'status.json'
$artDone=@()
function Write-ArtStatus($job,$state,$code){
 @{phase=$Phase;completed=$script:artDone;current=$job;status=$state;exitCode=$code;updated=(Get-Date -Format o)} | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath $artStatus
}
$artJobs=@(
 @{name='typecheck';exe='npm.cmd';args=@('run','typecheck')},
 @{name='lint';exe='npm.cmd';args=@('run','lint')},
 @{name='unit';exe='npm.cmd';args=@('test')},
 @{name='build';exe='npm.cmd';args=@('run','build')},
 @{name='gameplay';exe='npx.cmd';args=@('playwright','test','--trace','off','--grep-invert','G2 hero')},
 @{name='menu';exe='npx.cmd';args=@('playwright','test','--config','playwright.menu.config.ts','--trace','off')}
)
foreach($artJob in $artJobs){
 Write-ArtStatus $artJob.name 'running' 0
 $artArgs=$artJob.args
 & $artJob.exe @artArgs 2>&1 | Tee-Object -FilePath (Join-Path $artFolder ($artJob.name+'.log'))
 $artExit=$LASTEXITCODE
 if($artExit -ne 0){Write-ArtStatus $artJob.name 'failed' $artExit;exit $artExit}
 $artDone+=$artJob.name
 if($artJob.name -eq 'build'){
  Get-ChildItem dist/assets -File | Select-Object Name,Length | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $artFolder 'bundle.json')
  Get-FileHash -Algorithm SHA256 dist/index.html,src/cinematic/WorldRenderer.ts,src/cinematic/FallbackWorld.ts,src/chapter/ChapterGame.tsx | Select-Object Path,Hash | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $artFolder 'source-hashes.json')
 }
 Write-ArtStatus $artJob.name 'passed' 0
}
Write-ArtStatus 'complete' 'passed' 0
