# Character performance pass — 17/11/2026

User feedback: animation and imagery still look like a prototype. This is a bounded improvement of the existing classroom performance, not a claim that professional character art has been completed.

## Actual implementation

- `src/cinematic/ClassroomPerformance.ts`: timed gaze changes between paper, laptop and the other person; a short, non-looping listening response; torso anticipation before sitting with compensating leg rotations to preserve planted feet; chair grip maintained through settling, then a raised hand-release arc; the free hand rests on the lap.
- `src/cinematic/WorldRenderer.ts`: one classroom-only performance call after the existing pose solver, gated out of Ripple/Finale. Original camera, state, animation durations and chair sound are untouched.
- `src/art/NarrativeActors.ts`: continuous skin-shading ramp on the face while keeping clothing shading; cached half-closed eyelid textures between open and closed states; a more restrained teacher mouth expression. No mesh replacement or new geometry. The source comment now honestly describes these as procedural characters rather than authored assets.

Performance is sampled from the saved phase/line and elapsed time, not accumulated frame deltas. Reduced motion removes the extra anticipation/nods and uses immediate gaze changes. Essential existing chair movement remains. The old renderer's placement/leg solver, geometry, camera, story and audio stay guarded by AST comparison; only the explicitly gated performance hook is allowed by the historical guards.

## Verification

**Final result: typecheck/lint/build PASS, 69 unit tests PASS, 4 E2E cases PASS.** The production recording captures 1,380 real browser frames over 53.78 seconds and reaches question line10, including “Vậy mà cô đang ngồi ở đây.” The browser video includes live environmental audio and UI; it is not a concept render.

`source-and-runtime-scope.json` confirms no source change outside the three owned modules. Desktop/mobile camera position, target and FOV match the prior lighting review exactly. The new skin ramp and two half-blink maps allocate three additional cached textures. GPU uploads are lazy: the matched comparison reports one additional uploaded texture. No geometry was added. Desktop draw calls are 102→103 because the new arm pose changes visible parts; mobile remains110. No FPS claim is made.

Typecheck/build/lint and unit results are saved here. The initial typecheck caught nullable StaySave at the new hook; fixed by accepting null and returning early. The first unit run caught the newly created performance file in a snapshot written while its initial creation was in progress; the guard now explicitly lists all three authorized runtime files and still hashes every other existing source.

Unit coverage includes deterministic samples, continuous head movement, grip held until settling, and unchanged world-space foot positions during torso anticipation. E2E covers desktop chair/keyboard, mobile touch/reduced motion, Canvas fallback, and the full Chapter02 mobile silent/save-resume path. No weakened visibility, dialogue or single-chair-cue assertion.

Port4193 was already owned by another local preview. That attempt was interrupted; its log is retained as `port-collision-attempt.log` and is not counted as verification. The tested production preview is port4215, built separately into `dist-performance-review`.

Commands:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src tests
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build --outDir dist-performance-review
node node_modules/@playwright/test/cli.js test --config=playwright.performance-review.config.ts cinematic-chair.spec.ts cinematic-stayed.spec.ts --grep 'Chair:|mobile silent reduced resume' --reporter=list,json
node scripts/record-classroom-performance.mjs
node scripts/preview-classroom-lighting.mjs
```

`review.html` compares actual before/after frames and videos. The new video includes the longer exchange around “Vậy mà cô đang ngồi ở đây.” Video captures real browser UI and shared audio; no character speech has been added. Encoding cadence is not a rendering FPS claim. Mobile is emulation, not a physical phone.

## What remains below the requested art standard

Hair remains a procedural shell; hands and clothing still have simple silhouettes and there is no finger rig. The mouth does not perform speech animation. This pass improves the existing rig's acting and facial presentation, but does not solve authored-character quality or produce a release-quality art approval.

The next substantial character-art step needs a consistent pair of authored, licensed models: An as a Vietnamese young adult and cô Vân as a mature teacher; designed hair/clothing rather than primitive substitutes; skinning, useful hand/finger joints and facial blink/gaze/brow controls; authored sitting and chair-contact clips validated in this same camera. The imported pair must be reviewed in runtime before replacing existing characters. No asset download, character replacement or paid service was performed in this pass.

Camera, lighting, UI, canon, saves, Main Menu and the letter/Finale files remain outside this pass. No deployment or push.
