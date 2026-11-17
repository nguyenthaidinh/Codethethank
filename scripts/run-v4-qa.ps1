param([ValidateSet('Baseline','Gate1','Title')][string]$Mode='Gate1')
$ErrorActionPreference='Continue'
$qaRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $qaRoot
$qaFolder=Join-Path $qaRoot ('docs/v4-proof/'+$Mode.ToLower())
New-Item -ItemType Directory -Force -Path $qaFolder | Out-Null
$qaHash=(Get-FileHash -LiteralPath dist/index.html -Algorithm SHA256).Hash
$qaStatus=Join-Path $qaFolder 'status.json'
$qaDone=@()
if(Test-Path -LiteralPath $qaStatus){$prior=Get-Content -Raw -LiteralPath $qaStatus | ConvertFrom-Json;if($prior.build -eq $qaHash){$qaDone=@($prior.completed)}}
function Write-QaStatus($job,$state,$code){@{mode=$Mode;build=$qaHash;completed=$script:qaDone;current=$job;status=$state;exitCode=$code;updated=(Get-Date -Format o)}|ConvertTo-Json|Set-Content -Encoding utf8 -LiteralPath $qaStatus}
$qaJobs=if($Mode -eq 'Baseline'){@(@{name='full-game';args=@('playwright','test','cinematic-fullgame.spec.ts','--trace','off')})}elseif($Mode -eq 'Title'){@(@{name='legacy-title';args=@('playwright','test','cinematic.spec.ts','--trace','off')})}else{@(
 @{name='v4-focus-resume';args=@('playwright','test','cinematic-v4.spec.ts','--trace','off')},
 @{name='finale';args=@('playwright','test','cinematic-finale.spec.ts','--trace','off')},
 @{name='full-game';args=@('playwright','test','cinematic-fullgame.spec.ts','--trace','off')},
 @{name='chapter00';args=@('playwright','test','cinematic-chapter.spec.ts','--trace','off')},
 @{name='legacy-input-mobile';args=@('playwright','test','cinematic-input.spec.ts','cinematic-mobile.spec.ts','--trace','off')},
 @{name='ripple';args=@('playwright','test','cinematic-ripple.spec.ts','--trace','off')},
 @{name='stayed';args=@('playwright','test','cinematic-stayed.spec.ts','cinematic-stayed-fallback.spec.ts','--trace','off')},
 @{name='verdict';args=@('playwright','test','cinematic-verdict.spec.ts','--trace','off')},
 @{name='legacy';args=@('playwright','test','cinematic.spec.ts','--trace','off')},
 @{name='menu';args=@('playwright','test','--config','playwright.menu.config.ts','--trace','off')}
)}
foreach($job in $qaJobs){
 if($qaDone -contains $job.name){continue}
 Write-QaStatus $job.name 'running' 0
 $qaArgs=$job.args
 & npx.cmd @qaArgs 2>&1 | Tee-Object -FilePath (Join-Path $qaFolder ($job.name+'.log'))
 $qaExit=$LASTEXITCODE
 if($qaExit -ne 0){Write-QaStatus $job.name 'failed' $qaExit;exit $qaExit}
 $qaDone+=$job.name
 Write-QaStatus $job.name 'passed' 0
}
Write-QaStatus 'complete' 'passed' 0
