$ErrorActionPreference = 'Continue'
# Resume cached groups only for this same production build.
# For a fresh build, use npm run test:e2e instead of cached runner-status.json.
$qaProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $qaProjectRoot
$qaProofRoot = Join-Path $qaProjectRoot 'docs/final-act-proof'
$qaStatusPath = Join-Path $qaProofRoot 'runner-status.json'
$qaDone = @()
if (Test-Path -LiteralPath $qaStatusPath) {
  $qaPrior = Get-Content -Raw -LiteralPath $qaStatusPath | ConvertFrom-Json
  $qaDone = @($qaPrior.completed)
}
function Save-QaStatus($qaCurrent, $qaResult, $qaExit) {
  @{ completed=$script:qaDone; current=$qaCurrent; status=$qaResult; exitCode=$qaExit; updated=(Get-Date -Format o) } | ConvertTo-Json | Set-Content -Encoding utf8 -LiteralPath $qaStatusPath
}
$qaJobs = @(
 @{name='finale-touch-and-fallback'; args=@('playwright','test','cinematic-finale.spec.ts','--grep','mobile fallback|360px','--trace','off')},
 @{name='full-game'; args=@('playwright','test','cinematic-fullgame.spec.ts','--trace','off')},
 @{name='legacy-input'; args=@('playwright','test','cinematic-input.spec.ts','--trace','off')},
 @{name='legacy-mobile'; args=@('playwright','test','cinematic-mobile.spec.ts','--trace','off')},
 @{name='ripple'; args=@('playwright','test','cinematic-ripple.spec.ts','--trace','off')},
 @{name='stayed'; args=@('playwright','test','cinematic-stayed.spec.ts','cinematic-stayed-fallback.spec.ts','--trace','off')},
 @{name='verdict'; args=@('playwright','test','cinematic-verdict.spec.ts','--trace','off')},
 @{name='legacy-recording'; args=@('playwright','test','cinematic.spec.ts','--trace','off')},
 @{name='menu'; args=@('playwright','test','--config','playwright.menu.config.ts','--trace','off')}
)
foreach ($qaJob in $qaJobs) {
 if ($qaDone -contains $qaJob.name) { continue }
 Save-QaStatus $qaJob.name 'running' 0
 $qaArguments = $qaJob.args
 & npx.cmd @qaArguments 2>&1 | Tee-Object -FilePath (Join-Path $qaProofRoot ($qaJob.name + '.log'))
 $qaCode = $LASTEXITCODE
 if ($qaCode -ne 0) { Save-QaStatus $qaJob.name 'failed' $qaCode; exit $qaCode }
 $qaDone += $qaJob.name
 Save-QaStatus $qaJob.name 'passed' 0
}
Save-QaStatus 'complete' 'passed' 0
