# G2F Implementation Report

Status: **technical QA passed / visual approval pending**. Scope ends at Gate 2F; no Gate 3, deployment or push.

## Observed baseline

Chapter 00 used `src/chapter/SummitWorld.ts`, a Canvas 2.5D conference stage. It had no loaded 3D environment asset and offered a signal click followed by an open-record click. The existing chapter state machine, audio bridge and classroom hand-off were functional.

Before changes: typecheck, lint and **33 unit tests PASS**; **3 Chapter 00 browser tests PASS** (desktop, mobile/reduced motion, and 360px without WebGL/audio/storage). The source ZIP, hashes, bundle sizes, actual screenshots and frame samples are under `g2f-proof/baseline/`.

## Implemented

- `src/future/FutureWorld.ts`: opening-only Three.js environment, authored GLB city instances, bespoke split-arch headquarters, occupied research galleries, Loom, terminal, camera path, resource lifecycle, adaptive scale, direct ACES/sRGB output and a software WebGL lighting tier.
- `src/future/FutureFallback.ts`: Canvas alternative with the same signal and source/limit investigation path.
- `src/future/direction.ts`: opening shot/identity/caption data; no founder reveal or 2026 model identity change.
- `src/future/inspection.ts`: strict validation for an optional two-channel inspection sidecar. The existing nested chapter save and reducer are unchanged.
- `src/future/future.css`: contextual opening-only UI styling; no style rule targets 2026 or Main Menu.
- `src/chapter/ChapterGame.tsx`: opening integration, optional research look, two-channel physical investigation, lazy import, future disposal at the existing classroom hand-off. Existing Verdict/Stayed/Ripple/Finale branches are retained.
- `src/chapter/ChapterAudio.ts`: future-only location mix using the existing context. Existing school/transition/chair paths retained.
- `public/future/` and `scripts/acquire-future-assets.py`: locally served, provenance-recorded assets.

## Protected source

`tests/future.test.ts` compares the pre-G2F SHA256 manifest. All pre-existing `src` files except `ChapterGame.tsx` and `ChapterAudio.ts` must match. This includes `WorldRenderer`, `ClassroomArt`, `NarrativeActors`, palettes, camera/motif data, all narrative reducers, the menu, typography and Finale. No character download, Blender tool, G2S branch or past-art change is reintroduced.

The two integrated chapter files can be compared against `g2f-proof/baseline/source-before.zip`; changes are confined to future rendering, captions, UI, optional inspection state and location audio. The chapter schema/version and reducer preconditions remain unchanged.

## Verification and evidence

Current unit suite: **36 PASS**, including protected source equality and inspection validation. Final browser QA, production media, performance and exact commands/results are recorded below.

## Art review limits

The candidate materially changes the opening world; it is not certified as AAA or production character art. Kenney modules are stylized; background people are simplified; reflections and soft occlusion are bounded approximations. Automated Intel desktop GPU and emulated-touch measurements are recorded below; a physical phone and external first-time-player playtest remain unverified. Product Owner visual review must use final runtime media, not this document or technical test results.

## Verification corrections and remaining limits

The first default-headless regression attempt was interrupted after timing failures: the old cinematic test sampled its clock before new assets were ready, and slow software WebGL exhausted mobile teardown/replay budgets. Its partial console and traces are retained in `g2f-proof/interrupted-*`; it is not a PASS result. The cinematic test now waits for readiness, and Chapter 00/Finale include cold-3D setup in their total test budgets without removing interaction assertions.

An intermediate float-target FXAA pipeline measured 800 ms P50 on SwiftShader and was rejected. The final renderer uses direct ACES/sRGB output, context MSAA, adaptive scale, and a disclosed software vertex-lighting tier. Explicit Windows D3D11 exposes the actual Intel Iris Xe for the final PBR run. Earlier software measurements remain in `hdr-performance-rejected.json` and `direct-ibl-performance.json`; final results are separate.

The first video-script attempt waited for hidden diagnostic output to become visible and timed out. It now waits for DOM attachment. The successful recording is real browser footage with the live chapter audio bus, not replacement frames or a substituted soundtrack. Its render timing is not the isolated performance sample.

Additional QA files: `tests/future.test.ts`, `tests/e2e/cinematic-future.spec.ts`, the existing Chapter 00/full-game/art/Verdict interaction paths, Finale setup budget, `playwright.g2f.config.ts`, and the acquisition/capture/profile/verification scripts. Existing Playwright configs and all protected 2026/menu/narrative source remain unchanged.

## Final technical result — 17 November 2026

**Typecheck PASS · lint PASS · 36 unit tests PASS · 36 gameplay E2E PASS · 11 menu E2E PASS · production build PASS.** The main run has 34 PASS and 2 baseline-mode SKIP. Both skipped art checks were then executed separately with ART_CAPTURE_PHASE=after and passed, giving 36 distinct gameplay checks plus 11 menu checks. No skipped/flaky/unexpected result is promoted to PASS.

Commands actually executed:

```text
npm run typecheck
npm run lint
npm test
npm run build
node scripts/run-g2f-qa.mjs
# G2F_SUITE=e2e / menu: node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts --reporter=list,json
# ART_CAPTURE_PHASE=after, ART_CAPTURE_OUT=docs/art/g2f-proof/preserved-classroom
node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts tests/e2e/cinematic-g2-art.spec.ts --grep "narrative direction|renderer budget" --reporter=list,json
python scripts/report-g2f-source.py
node scripts/inspect-future.mjs http://127.0.0.1:4173
node scripts/record-future.mjs
node scripts/probe-future.mjs
# G2F_SOFTWARE_WEBGL=1: node scripts/probe-future.mjs
node scripts/finalize-g2f.mjs
```

Full gameplay regression includes the real menu→Credits path, Verdict, Stayed/notebook/chair, Ripple/reveal, Finale/local star, mute/no-audio, touch, keyboard, reduced motion, save/reload and malicious/Unicode letter tests. New G2F checks cover two-channel access, inspection resume, graphics loss/missing assets, and zero future asset/module requests from later checkpoints. The protected pre-existing app/public/config manifest has **77 files**; only the two chapter integration files differ. Full diff: [integration-diff.patch](g2f-proof/integration-diff.patch).

Runtime evidence:

- [Local review gallery](G2F_REVIEW.html): city, headquarters, Core, interaction, touch and unchanged classroom.
- [Actual browser video with live audio](g2f-proof/runtime/opening-runtime-with-audio.mp4): 64.1 seconds, h264 / aac. No generated images, substituted soundtrack or concept footage.
- [Recording metadata](g2f-proof/runtime/recording.json): live UI/scene, both inspection steps, silence/rain transition snapshots and return to 2026. No private letter content.
- [Verification manifest](g2f-proof/verification.json), [gameplay results](g2f-proof/e2e-results.json), [menu results](g2f-proof/menu-results.json), [two classroom follow-up checks](g2f-proof/classroom-results.json).

Recording uses actual Chromium CDP frames including UI/subtitles, with the live chapter master bus. 24 fps is the encoding cadence; repeated frames retain observed timing and do not claim 24 rendered frames/sec. The diagnostic frame timings were collected separately after automated tests/recording, so capture load is not reported as normal rendering cost.

| Gate | Delivered | Acceptance |
|---|---|---|
| G2F.1 | Source/quality baseline, Future Art Bible, identity | Technical evidence complete |
| G2F.2 | Authored city modules and bespoke AION exterior | Runtime delivered; visual review pending |
| G2F.3 | Atrium, research layers, player-selected gallery look | Playable; simplified background staff disclosed |
| G2F.4 | Loom, physical simulation surfaces, reactive channel alignment | Playable; illustrative visualization, not a real AI backend |
| G2F.5 | Source + limit investigation, optional inspection save | Desktop/touch/keyboard/reload verified |
| G2F.6 | Existing audio silence/rain/bell and classroom hand-off | Regression and video evidence |
| G2F.7 | 47 browser tests, unit/build checks, runtime media, profile | Functional checks PASS; art approval, phone and human playtest pending |

No deployment, Git push, credential change, paid service or Gate 3 work was performed. **STOPPED after G2F for Product Owner visual review.**
