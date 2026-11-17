$ErrorActionPreference='Continue'
$artWorkspace=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $artWorkspace
$artEvidence=Join-Path $artWorkspace 'docs/art2r/proof/after'
New-Item -ItemType Directory -Force -Path $artEvidence | Out-Null
$env:ART_CAPTURE_PHASE='after'
$env:ART_CAPTURE_OUT='docs/art2r/proof/after/runtime'
$artCompleted=@()
function Save-ArtRunStatus($job,$status,$code){
 @{current=$job;status=$status;exitCode=$code;completed=$script:artCompleted;updated=(Get-Date -Format o)} | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath (Join-Path $artEvidence 'status.json')
}
$artCommands=@(
 @{name='typecheck';exe='npm.cmd';args=@('run','typecheck')},
 @{name='lint';exe='npm.cmd';args=@('run','lint')},
 @{name='unit';exe='npm.cmd';args=@('test')},
 @{name='build';exe='npm.cmd';args=@('run','build')},
 @{name='hero';exe='npx.cmd';args=@('playwright','test','--config','playwright.art2r.config.ts','--trace','off')},
 @{name='gameplay';exe='npx.cmd';args=@('playwright','test','--trace','off','--grep-invert','G2 hero')},
 @{name='menu';exe='npx.cmd';args=@('playwright','test','--config','playwright.menu.config.ts','--trace','off')}
)
foreach($artCommand in $artCommands){
 Save-ArtRunStatus $artCommand.name 'running' 0
 $artArguments=$artCommand.args
 & $artCommand.exe @artArguments 2>&1 | Tee-Object -FilePath (Join-Path $artEvidence ($artCommand.name+'.log'))
 $artCode=$LASTEXITCODE
 if($artCode -ne 0){Save-ArtRunStatus $artCommand.name 'failed' $artCode;exit $artCode}
 $artCompleted+=$artCommand.name
 if($artCommand.name -eq 'build'){
  Get-ChildItem dist/assets -File | Select-Object Name,Length | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath (Join-Path $artEvidence 'bundle.json')
  Get-FileHash -Algorithm SHA256 dist/index.html | Select-Object Path,Hash | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath (Join-Path $artEvidence 'production-hash.json')
  Get-ChildItem src -Recurse -File | Get-FileHash -Algorithm SHA256 | Select-Object Path,Hash | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath (Join-Path $artEvidence 'tested-source-hashes.json')
 }
 Save-ArtRunStatus $artCommand.name 'passed' 0
}
Save-ArtRunStatus 'complete' 'passed' 0
