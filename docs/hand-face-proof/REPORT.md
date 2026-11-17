# Classroom hand and facial acting — 17/11/2026

## Authorized scope

Improve hand movement and facial expressions, particularly cô Vân pulling the chair and sitting beside An. Preserve approved camera/lighting and the other session’s letter work.

Only two existing runtime modules changed: `src/art/NarrativeActors.ts`, `src/cinematic/ClassroomPerformance.ts`. Added `src/art/CharacterActing.ts`. `scope.json` hashes every pre-existing source file: camera, lighting, UI, dialogue, audio, state/checkpoint, Main Menu, character body/hair/clothes geometry, and Finale/letter are unchanged.

## Implementation

- Each hand now uses a single SkinnedMesh with11bones: a root and two joints for each of five digits. Skinning weights are normalized. Articulated meshes are excluded from the old static geometry merge. GPU skeleton textures, merged geometry and face textures all participate in disposal.
- Fingers close at contact, maintain grip through the sit, and open over0.32s after the existing3.9s settling point. The hand continues travelling until4.9s. The final path starts at the outer upper edge of the chair and arcs outside the teacher’s torso before returning to the existing desk rest target. The first recording exposed the original path crossing too close to the chest; that motivated this final correction.
- Forearm IK, foot placement, chair drag/hold/sit timing and the chair sound cue remain unchanged. The free hand remains on the lap. An’s hand tension responds to the current dialogue state instead of repeatedly waving.
- Eyes: pupils move inside fixed eyelids; an asymmetric smooth blink closes over70ms and reopens over160ms with irregularly spaced deterministic blink times. Reduced motion disables spontaneous blinking and the additional chair gaze shift.
- Facial expression: a small UV deformation moves inner brows and mouth corners gradually according to concern/warmth. An remains tense around his evaluation and relaxes slightly after cô Vân stays. The teacher’s response remains restrained. No mouth-flapping loop or new dialogue audio.
- CPU face textures are cached. Each frame updates small uniforms/bone rotations, not Canvas redraws or new materials. All poses are sampled from state and time, without accumulating rotation, so reload/seek remains deterministic.

## Validation and evidence

The final77-test suite consists of the existing72tests plus5new checks for actual skinned vertex motion, normalized weights/palm stability, no accumulated pose drift, chair grip/release ordering, continuous blink/reduced motion, state-dependent facial response and the release path clear of the torso. Tests also retain the original planted-foot and source-preservation assertions.

The first targeted rerun hit the unit test’s5s budget because the blink sweep performed over70,000 individual matcher calls under load. The same18,000samples/thresholds are now aggregated and asserted once; no sampled interval, tolerance or behavior was removed.

Screenshot capture initially timed out waiting for the two-shot: the unchanged preceding notebook shot lasts4.5s, leaving too little margin in a5s automation wait. Capture now enters through the preceding discussion, waits for actual camera/state and quality calibration, and checks console/shader errors on desktop and mobile. The game camera/timing was not altered.

The first recording also exposed a CDP acknowledgment racing browser shutdown. The recorder now handles expected session closure and indexes capture moments from in-page telemetry timestamps, rather than relying on several fragile cross-process screenshots within short shots. Images are actual frames from the runtime recording, not concept images.

`review.html`: before/after images and video with live shared game audio. Separate production artifact: `dist-acting-review`, preview4217. Its checkpoint launcher only writes4217’s localStorage. Original progress on5173/4173 remains separate. Only a valid Chapter02 checkpoint is seeded, with no private letter data.

## Limits

Hands have a compact two-joint digit rig rather than a full anatomical hand rig. Grip/release is authored kinematics, not physical collision simulation. Facial expressions use texture deformation, not facial blendshapes or phoneme lip sync. The existing procedural art style remains. Mobile means touch emulation on the desktop machine; no physical-phone or stable-frame-time claim. Technical PASS is not Product Owner art approval.

No push/deploy or paid assets.

## Final results

- Typecheck/lint/build PASS. Final sequential unit run:77/77PASS across22files,19.53s. The two original source/AST guard tests had previously exceeded their5s budget during concurrent browser work; their final sequential run passed with the same assertions and timeouts.
- Initial integrated browser run: desktop, Canvas fallback and full Chapter02 mobile mute/reduced-motion/save-resume PASS. Mobile chair case exceeded90s while awaiting context.close; trace confirms its interaction/visibility/audio assertions had already passed. This failed run is retained in e2e.json and runner-traces.
- Final chair correction tested again on desktop/keyboard and mobile/tap/reduced motion:2/2PASS,41.3s total. No assertions, waits or test timeouts were weakened. The dedicated review config now retains API/DOM/source traces without continuous trace screenshots; the separate runtime video provides moving-image evidence without duplicate screencast I/O.
- Review page: video metadata and every image load; checkpoint launcher reaches the expected Chapter02 state; no browser errors (review-check.json).
- Console/shader errors:zero in both desktop and mobile captures, and zero in the final recording. Voice counters remain started0/completed0 during the past scene.
- Source audit: only NarrativeActors.ts and ClassroomPerformance.ts changed among existing runtime files. CharacterActing.ts is the new module. No source outside the authorized actor/performance scope changed.

### Rendering samples

Both comparison frames report adaptive resolution1 and exactly the same camera position/target/FOV as the model baseline.

| Metric | Before | After |
|---|---:|---:|
| Desktop draw calls |109|111|
| Desktop triangles |96,618|99,498|
| Touch-emulated draw calls |116|118|
| Touch-emulated triangles |105,612|108,492|
| Desktop uploaded textures |18|29|
| Touch-emulated uploaded textures |17|28|

Extra resources include four small skeleton bone textures, two pupil atlases, and closed-eye maps now used by the shader; other scene textures are uploaded lazily, so the total texture delta is a scene sample rather than an isolated allocation benchmark. Hands use a conservative bounding sphere verified over the full curl range and remain cullable when off screen. Geometry/CPU textures are not rebuilt each frame.

Cinematic chunk:772.34→777.04kB, gzip210.66kB. Existing large-chunk warning remains. Capture hardware: Intel Iris Xe / ANGLE D3D11 on Windows. No physical-phone or fixed-FPS claim.

Final recording:1,647 real browser frames over55seconds, encoded24fps with H.264/AAC. The24fps encoding is not a render benchmark. capture-moments.json maps the actual chair/settling frames to in-page timestamps. The current Canvas fallback retains its simpler2D figures; finger skinning and facial UV motion apply to WebGL.

### Commands executed

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src tests
node node_modules/vitest/vitest.mjs run --maxWorkers=1
node node_modules/vite/bin/vite.js build --outDir dist-acting-review
node scripts/record-classroom-acting.mjs
node scripts/preview-classroom-acting.mjs
node node_modules/@playwright/test/cli.js test --config=playwright.acting-review.config.ts cinematic-chair.spec.ts cinematic-stayed.spec.ts --grep 'Chair:|mobile silent reduced resume' --trace=retain-on-failure --reporter=list,json
node node_modules/@playwright/test/cli.js test --config=playwright.acting-review.config.ts cinematic-chair.spec.ts --grep 'two-shot (desktop|mobile)$' --output=docs/hand-face-proof/final-traces --reporter=list,json
node scripts/verify-acting-review.mjs
```

Narrative/art approval remains with the Product Owner. No changes to other chapters are included.
