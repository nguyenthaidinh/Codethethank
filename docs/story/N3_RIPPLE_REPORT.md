# N3 — HUMAN REVIEW and the inherited chair gesture

## Narrative result
Chapter03 now carries the design question into HUMAN REVIEW: missing context or low confidence → REVIEW REQUIRED → a person verifies context and decides a suitable next step. This does not automatically approve support or replace An’s historical NOT RECOMMENDED result.

2029 shows another failed experiment and a verification step. 2035 foregrounds research, colleagues and critique. 2045 shows pre-release AION testing and the ability to reconsider consequential decisions. Success follows twenty years of work, not a promise from the teacher.

The old align screen named An immediately before reveal. Its display now says DANH TÍNH ẨN; alignment dialogue contains no named-founder link. The actual AN — FOUNDER OF AION title remains at the unchanged reveal state, after all three milestones and record interaction. The same title is retained in the completed reveal record afterward.

After reveal the young researcher says: “Các mô hình đều dự đoán khả năng thành công của hướng này rất thấp.” The existing 2026 chair echo and 2046 An sit-down follow. An responds: “Vậy thì chúng ta xem điều gì mình vẫn chưa hiểu.” After the player reconnects the evaluation, chair and notebook, AION concludes: “Tôi đã tìm thấy nguồn gốc của nguyên tắc ấy.” / “Nó không bắt đầu bằng một dòng mã.” / “Nó bắt đầu khi một người quyết định ở lại.”

The notebook contains a written principle. Staying, listening and giving an opportunity is the unwritten lesson. This resolves N2’s historical-origin investigation without claiming that AION was malfunctioning.

## Exact scope
Six runtime modules: ripple/story.ts, ripple/RippleControls.tsx, ripple/RippleWorld.ts, ripple/Fallback.ts, cinematic/WorldRenderer.ts and cinematic/FallbackWorld.ts. The four renderer files have only string-content changes; a TypeScript AST comparison verifies all other structure against the pre-N3 snapshot. No camera, geometry, animation, material, environment, phase duration or audio edit. Existing Finale presentation changes already present in the repository are preserved.

Opening narration/N2, Chapter01/02, MainMenu, Finale and all reducers/validators are unchanged. CTA renamed to “Khôi phục HUMAN REVIEW”; question IDs/actions remain prediction/opportunity/reframe. The visible revision result is REVIEW REQUIRED; archived 2026 assessment remains NOT RECOMMENDED.

## Timing and saves
All phase durations remain identical. Echo chair = 6s; 2046 chair = 6s. The researcher line occupies the first 5s of the existing 7s approach, leaving 2s of silent action. Principle uses three captions within the existing 9s window (0–3, 3–5.5, 5.5–9). No additional chair audio cue is introduced.

Save version, elapsed time, reveal gate, milestone/question/memory prerequisites and played-cue IDs are unchanged. Existing saves resume the same phase at the saved elapsed time, with updated subtitles. No migration, fabricated evidence, progress reset or new mandatory interaction is needed. Finale entry remains FINALE_READY with all three memories.

## Verification
Baseline 50 unit PASS. Updated typecheck/lint and 53 unit PASS. The initial new source-comparison helper misread a template string; it was replaced by TypeScript AST parsing. The original failing log is retained as unit-first-attempt.log. Application behavior did not change in that correction.

**Final technical result: typecheck/lint/build PASS; 53 unit PASS; all 5 unique E2E cases verified.** The first suite passed 4 cases and timed out in the artifact-heavy desktop recording case after reaching the ending (also leaving an interrupted trace ZIP). Capture was reduced to 12 fps/1 Mbps, byte-array transport replaced with base64, and the desktop-only overall artifact budget set to 300s. All gameplay deadlines/assertions stayed unchanged. The desktop-only recheck passed in 1.8 minutes. Original failure and successful recheck remain in e2e.json and desktop-recheck.json; final-verification.json combines the unique cases transparently. The real-menu-to-Credits run passed in 6.3 minutes.

75 source files outside the six authorized narrative/text modules remain byte-identical. Production build hashes are unchanged across the initial browser suite and recheck. Current cinematic bundle: 750.82 kB; existing >500 kB warning remains. No new performance claim is made; the repository already contained Finale presentation work before this sprint.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
$env:RIPPLE_PROOF_OUT='docs/story/n3-proof/runtime'
$env:GAME_PROOF_OUT='docs/story/n3-proof/journey'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE='docs/story/n3-proof/e2e.json'
node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts cinematic-ripple.spec.ts cinematic-fullgame.spec.ts --reporter=list,json
```

Browser coverage: real menu → Credits, Chapter03 desktop with live-audio recording, mobile WebGL, mobile Canvas, muted/reduced motion, keyboard, reload during chair/reconstruction/finale, cue idempotence, exact reveal timing and V4 reflection/conclusion subtitles. Existing assertions remain, with the new CTA wording.

## Review
[Runtime screenshots and video](n3-proof/review.html). Mobile means browser emulation; no physical-device or human narrative review claim. Existing art and camera are intentionally retained. N4 narrative remains pending. No deployment/push or automatic scope expansion.

## Runtime media and visible limitation

Video: 33.167 seconds, real 1280×720 canvas with H.264/AAC; live audio mean −47.3 dB, peak −29.8 dB. The recording contains the scene and game audio; screenshots separately include HTML subtitles. Original WebM retained.

The existing chair-to-reflection camera transition crops characters, and the subsequent angle can be substantially occluded by the desk. This was observed in runtime review and preserved under the explicit instruction to keep scene/camera unchanged. Technical PASS is not art approval. A camera/occlusion pass is separate work, not silently included in N3.
