# Classroom UI and chair framing — 17 November 2026

Scope: the user authorized a small playable classroom polish pass, explicitly excluding the other session's letter work. Only two runtime files were edited by this pass:

- `src/cinematic/ClassroomCinematography.ts`: lower, more frontal seated two-shot; a separate portrait composition; revised start/end poses for the existing quiet camera push.
- `src/stayed/stayed.css`: conversation-only subtitle sizing/spacing, lighter advance control, explicit keyboard focus and touch target, quieter utility controls. Selectors require an empty Ripple state, so a persisted StaySave cannot style Finale.

Character meshes, lighting, classroom objects, renderer, state machines, dialogue, save validation, audio and all files under `src/finale` were not edited by this pass. Chair insert, sound cue, 2.6-second hold and 1.3-second seating animation remain intact. Reduced motion still keeps a stationary seating camera. The opening narrator remains the only spoken voice.

## Evidence

- `review.html`: video and visual comparison, with a link to the dedicated playable preview on port 4191.
- `before/`: old camera/CSS sources plus desktop/mobile screenshots and telemetry.
- `iteration-1` through `iteration-4`: actual browser framing iterations. The sideways camera hid the teacher's face; the initial portrait camera clipped a character. Those alternatives were rejected before the final build.
- `runtime/`: final browser screenshots, audio/video recording and choreography samples.
- `stayed/`: full Chapter02 desktop/mobile regression evidence, including dialogue and save/resume.

Preview is built separately into `dist-chair-review`, leaving the other session's default production directory alone. The dedicated checkpoint launcher writes only port4191 storage; normal game progress on ports5173/4173 is separate. No deploy or push.

## Validation and concurrent work

Baseline: 60 unit tests passed before edits. Typecheck and lint first encountered concurrent Finale work in progress (a missing RevealFallback import and irregular whitespace). Their rechecks passed without editing those files. The full unit run during that work reported 58 PASS / 2 FAIL: N3/N4 frozen-source guards detected the other session's changes to `src/finale/Fallback.ts`. Those logs remain available; this pass did not add exceptions for that unrelated work or claim that run passed.

The classroom-targeted suite passed 22 tests across cinematography, Stay, StoryV4, cinematic/checkpoint, Chapter00, Verdict and typography. The production bundle built successfully, with the existing >500kB warning.

The first six-case browser run passed the two complete Chapter02 desktop/mobile paths, the Canvas keyboard path and the Canvas chair path. Desktop/mobile chair sampling initially failed because cross-process polling arrived after a short shot. Sampling was moved into a browser MutationObserver, then correlated with the actual world shot as well as time (render telemetry can trail the UI clock). No gameplay prerequisite, phase duration, numeric visibility threshold or chair cue assertion was removed. Intermediate failed logs are retained. Trace output now has its own directory outside the shared test-results cleanup path.

**Final chair recheck: 3/3 PASS (desktop, touch/reduced-motion mobile, Canvas). Together with the first run’s complete desktop/mobile and fallback keyboard paths, all six unique relevant E2E cases have been verified. Recording: 453 real browser frames over 28.67 seconds, with live game audio and no character voice playback.**

Final chair recheck and recording results are recorded in `chair-final.json`, `chair-final.log` and `runtime/recording.json`. See those files for actual run status; the first run is not presented as a clean PASS.

Commands used:

```powershell
npm test
npm run typecheck
npm run lint
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src tests
node node_modules/vitest/vitest.mjs run tests/classroom-cinematography.test.ts tests/stayed.test.ts tests/story-v4.test.ts tests/cinematic.test.ts tests/chapter.test.ts tests/verdict.test.ts tests/typography.test.ts
npx vite build --outDir dist-chair-review
node node_modules/@playwright/test/cli.js test --config=playwright.chair-review.config.ts cinematic-chair.spec.ts cinematic-stayed.spec.ts cinematic-stayed-fallback.spec.ts --reporter=list,json
node node_modules/@playwright/test/cli.js test --config=playwright.chair-review.config.ts cinematic-chair.spec.ts --reporter=list,json
node scripts/record-chair-polish.mjs
```

## Limits

This is a camera/UI pass on existing models, not an authored-character or lighting pass. Full-body silhouettes and procedural face/hair quality remain limitations. Visual approval belongs to the Product Owner.

Mobile is Chromium touch emulation, not a real phone test. No general FPS claim: concurrent browser work and adaptive resolution make timing comparison unreliable. Representative desktop framing telemetry changed from 104 calls / 90,292 triangles to 102 calls / 83,402 triangles due to the new view; no geometry was added. Video encoding cadence is not rendering FPS.

No full 00→04 regression or Finale integration approval is claimed in this pass. The relevant complete Chapter02 and fallback paths were exercised; the other session owns the changing Finale surface. `protected-source.json` and `concurrent-changes.json` distinguish those concurrent changes from this pass.
