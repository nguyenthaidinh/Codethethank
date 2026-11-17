# N2 — AION investigates HUMAN REVIEW origins

Scope: Chapter00 narrative and terminal text only. The existing city, Citadel, Atrium, Nexus, camera paths, assets, sound bridge and seven opening narrator recordings/timestamps are preserved. AION’s unvoiced subtitle at 48–53s now states the principle works and its origin is the question.

## Runtime narrative

Terminal: AION / ARCHITECTURE AUDIT / 2046; HUMAN REVIEW; ORIGIN UNKNOWN. CORE PRINCIPLE: HUMAN REVIEW; FUNCTION: VERIFIED; DESIGN ORIGIN: INCOMPLETE; HISTORICAL TRACE: 2026. Red warnings indicate incomplete origin evidence, not broken AI functionality.

First investigation: **Kiểm tra nguyên tắc HUMAN REVIEW**. AION describes the verified human-review route when context is insufficient. Review does not imply automatic approval. The principle has affected many supported decisions; its historical origin is incompletely documented.

Second investigation: **Truy dấu nguồn gốc năm 2026**. Student07 received NOT RECOMMENDED from a separate student-support prototype. A support request was outside its recorded inputs. The mystery is the unrecorded decision made during an ordinary afternoon, not proof that future success disproved a prediction.

After both interactions the existing memory transition leads to the same 17:05 classroom and N1 Student07 investigation. No name-to-Founder link appears. Chapters01–04, MainMenu, AudioDirector, narration policy, checkpoint validation and input mechanics are unchanged.

## Files and compatibility

Changed runtime modules: future/direction.ts (narrative and shared originAudit data), FutureWorld.ts and FutureFallback.ts (existing terminal rendering reads shared data), terminalStyle.ts (ORIGIN UNKNOWN warning color). historicalAnalysis telemetry now describes verified function and incomplete origin, instead of contradictory future outcome.

Save schema and channel IDs source/limit are unchanged. Continue preserves visited channel IDs; it does not fabricate Student07 evidence or evaluations. A saved investigation can revisit either channel to read its new meaning. No reset or migration is necessary. New-game journey gives the full N2 introduction.

Tests retain the old action/scene/resume/fallback assertions with the new accessible labels. New unit assertions compare all seven narrator lines and timing to the pre-N2 snapshot, protect every other runtime module, and prohibit founder spoilers/old outcome-mystery language in the new evidence.

## Verification

Baseline: 47 unit PASS. Updated typecheck/lint and 50 unit PASS. Production build PASS. **7 E2E PASS**: six regression cases (8.0 minutes) plus opening narrator policy (1.4 minutes), zero skipped/flaky/unexpected. Real menu → Credits passed in 5.7 minutes. Desktop keyboard/reload, mobile touch/mute/reduced motion, lost-WebGL Canvas, missing assets and warning colors passed. The narrator test confirmed voice playback, pause, independent subtitles, and no AION/past voice. Build hashes remained unchanged across tests. See n2-proof/final-verification.json.

Four runtime modules changed; 74 other modules match the pre-N2 hashes. Cinematic bundle: 742.70 kB versus 742.69 kB before N2 (Vite rounded sizes); the existing >500 kB warning remains. No new performance benchmark is claimed.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
$env:GAME_PROOF_OUT='docs/story/n2-proof/journey'
$env:LAPTOP_PROOF_OUT='docs/story/n2-proof/terminal'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE='docs/story/n2-proof/e2e.json'
node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts cinematic-future.spec.ts cinematic-fullgame.spec.ts cinematic-laptop-first.spec.ts --grep 'G2F|Full game|Future Canvas' --reporter=list,json
$env:VOICE_PROOF_OUT='docs/story/n2-proof/voice'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE='docs/story/n2-proof/voice-e2e.json'
node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts cinematic-voice-school.spec.ts --grep 'Opening narrator only' --reporter=list,json
```

## Review and limits

[Real browser screenshots](n2-proof/review.html). Mobile testing is emulation; physical phones and Product Owner narrative review remain unverified. N3/N4 wording is still the earlier version, documented for a later sprint. No environment redesign, deployment, push, new voice generation or progression into N3.
