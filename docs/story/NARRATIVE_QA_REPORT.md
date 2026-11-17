# N0 + N1 narrative production — 17/11/2026

Status: **technical PASS — 47 unit + 12 E2E**, typecheck/lint/build PASS. Product Owner narrative approval pending.

## Sources and scope
The approved attachment is preserved verbatim as STORY_REWORK_V4_APPROVED.txt. STORY_CANON_V4.md resolves sequencing precedence. Narrative changes are limited to Chapter01/02 modules and one physical evidence-text block in WorldRenderer; no geometry, camera, animation, menu or audio change. N2–N4 remain documented work, not implemented.

## Baseline
Typecheck/lint/build PASS; 44 unit PASS; 5 Chapter01/02 browser tests PASS (5.7 minutes). See proof/baseline-*.log and baseline-e2e.json. Source snapshot: proof/v3-source.zip, hashes: proof/baseline-hashes.json.

## Commands after implementation
```powershell
npm run typecheck
npm run lint
npm test
npm run build
$env:VERDICT_PROOF_OUT='docs/story/proof/chapter01'
$env:STAY_PROOF_OUT='docs/story/proof/chapter02'
$env:GAME_PROOF_OUT='docs/story/proof/journey'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE='docs/story/proof/e2e.json'
node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts cinematic-verdict.spec.ts cinematic-stayed.spec.ts cinematic-fullgame.spec.ts cinematic-laptop-first.spec.ts --reporter=list,json
```

47 unit tests PASS. Ten browser regression tests PASS (15.7 minutes), including menu → Credits in 5.7 minutes. Two additional final-build notebook tests PASS (15.7 seconds), after visual inspection found the old profile card obscuring the longer principle. Only notebook text placement changed after the ten-test suite; gameplay, camera and geometry did not change. The principle now occupies the right page. No failed/flaky/skipped tests in either browser report. Existing assertions remain; new journeys now expect Student07 instead of the formerly optional first sample. Dialogue wait limits increase to reflect the approved longer scene. The existing frozen-source test explicitly allows the newly authorized narrative modules, while all other source guards remain.

Additional final-build command:
```powershell
node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts cinematic-v4-notebook.spec.ts --reporter=list,json
```
Results: proof/e2e.json, proof/notebook-e2e.json and proof/final-verification.json. 68 protected source files unchanged. Ten source modules changed: Verdict rules/state/evidence/story/screen/controls, Stayed story/state/notebook, and WorldRenderer paper text. No camera or geometry edits.

The final cinematic chunk is approximately 742.69 kB (previous 742.71 kB); Vite’s existing >500 kB warning remains. This is not a performance benchmark.

## Save behavior
New journeys use narrativeRevision4 and require Student07; existing V3 progress keeps its validated original sample history. No Student07 evidence or evaluation is fabricated. In-progress V3 dialogue restarts at the current phase’s first new line; prior new lines are not marked seen. New journeys are needed for the complete V4 sequence.

## Evidence and limits
[Runtime review](proof/review.html). Chapter02 video captures the real canvas and live game audio; classroom dialogue is subtitled, not voiced. Mobile means browser touch emulation, not physical-device testing. This sprint does not migrate Chapter00’s older mystery or Chapter03/04 wording. Art direction is unchanged and no visual-quality claim is made. No deployment/push. Stop after N0/N1; Product Owner review required for narrative approval.

Video: 20.005 seconds, 1280×720 H.264 + AAC; live audio mean −38.0 dB, peak −23.2 dB. Original WebM retained. No private player letter was recorded in the Chapter02 video.
