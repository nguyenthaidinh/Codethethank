# Classroom character model pass — 17/11/2026

## Scope

User: improve An and cô Vân hair, face, clothing and hands while retaining the existing camera, lighting, gameplay and the other session’s letter work.

Runtime changes are restricted to `src/art/NarrativeActors.ts` and the new `src/art/CharacterGeometry.ts`. `scope.json` compares SHA256 of every existing source file against the pre-edit snapshot. No changes to camera, lighting, performance timing, audio, dialogue, save validation, Main Menu or Finale. The existing actor factory is used only for the classroom heroes; later chapter human geometry is unchanged.

## What changed

- Hair: charcoal scalp with separately shaped swept locks; distinct student fringe and teacher swept-back silhouette/bun. Smooth tonal ramp reduces isolated bright patches. Meshes follow the animated head joint.
- Face: differentiated jaw width, integrated nose bridge/tip and cheek volume; smaller head scale, restrained eyes, mature lower lids for cô Vân, softened face-texture edges. Existing cached blink/half-blink expressions remain.
- Clothing: muted beige teacher outfit, blue student overshirt; fitted waist, smaller chest-conforming collar pieces, placket/buttons, smaller pocket, rounded shoulders and tapered sleeves. Wrist cuff moved to the teacher’s wrist.
- Hands: palm, four tapered fingers and an opposed thumb replace the mitten shapes. Forearm anchors, reach solver and animation are unchanged. Static fingers are not a new finger rig.
- Geometry goes through existing material/joint batching and geometry disposal. No external asset downloads, AI images or new dependencies.

## Evidence

`review.html` provides actual browser screenshots, before/after comparison and gameplay video. Production preview uses a separate `dist-model-review` and port4216. Its checkpoint launcher only writes that origin’s localStorage and does not replace progress on5173/4173. The recording captures actual browser frames and the shared live audio bus, including subtitles, rain and chair sound. No past-scene voice is added. Encoding at24fps is not a measured game FPS claim.

## Verification history

First unit run:71 PASS,1 timeout in the existing N3 AST/source preservation test under concurrent load. Rerun with one worker:72/72 PASS, without changing assertions or timeouts. The added geometry tests verify finite geometry/UVs/normals, hand bounds at the existing forearm anchor, and outward-facing hair surfaces.

Final commands/results are recorded in the associated logs and E2E JSON. Desktop, touch/reduced motion, keyboard, Canvas fallback and Chapter02 save/resume are covered. No full-game playthrough or physical phone measurement is claimed for this bounded model change.

## Art limitations

These are custom procedural meshes and painted textures, not professionally authored imported characters. There is no facial blendshape rig, lip sync, independent finger articulation or authored cloth deformation. The original simple art style remains visible, particularly in full-body silhouettes. Visual approval remains with the Product Owner; automated PASS does not certify finished character art.

No deployment or push.

## Measured runtime / bundle

At the identical conversation.master camera and final adaptive resolution1:

| Sample | Before | After |
| --- | ---: | ---: |
| Desktop draw calls |103|109|
| Desktop triangles |86,346|96,618|
| Desktop geometries uploaded |128|134|
| Desktop textures |18|18|
| Touch-emulated draw calls |110|116|
| Touch-emulated triangles |95,340|105,612|
| Touch-emulated textures |17|17|

Camera position, target and FOV match before/after for desktop and mobile. The first new screenshot was captured during the existing0.75 warm-up resolution; the final comparison waits for adaptive calibration and both captures report resolution1. The renderer and its quality policy were not changed. Resource counts are scene samples, not a benchmark of frame times. Capture machine: Windows, Intel Iris Xe via ANGLE/D3D11. Mobile is viewport/touch emulation on this machine.

Cinematic chunk:768,558→772,340 bytes (approximately+3.78kB; final console772.34kB, gzip208.89kB). The existing large-chunk warning remains; there are no added packages.

Final runtime video:1,486 CDP frames across53.40 seconds, H.264+AAC. No browser errors. Past-scene voice counters:started0/completed0. Chair motif observed once. Actual frame cadence varies; encoding24fps does not assert real-time performance.

## Executed commands

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src tests
node node_modules/vitest/vitest.mjs run --maxWorkers=1
node node_modules/vite/bin/vite.js build --outDir dist-model-review
node node_modules/@playwright/test/cli.js test --config=playwright.model-review.config.ts cinematic-chair.spec.ts cinematic-stayed.spec.ts --grep 'Chair:|mobile silent reduced resume' --reporter=list,json
node scripts/preview-classroom-models.mjs
node scripts/record-classroom-models.mjs
node node_modules/@playwright/test/cli.js test --config=playwright.model-review.config.ts cinematic-chair.spec.ts --reporter=list,json
node scripts/verify-model-review.mjs
```

Typecheck/lint/build PASS.72unit tests PASS. Initial integrated4E2E cases PASS in8minutes, no retries/skips. Small final head-scale/collar/texture-edge corrections were made after that production build; the final3chair cases are run again against the refreshed production artifact. The earlier complete Chapter02 mobile save/resume regression remains recorded separately in e2e.json.

## Final validation outcome

- Typecheck, lint, production build: PASS. Unit:72/72 PASS (21files).
- Initial integrated regression:4/4PASS (desktop keyboard, touch/reduced motion, Canvas fallback, full Chapter02 mobile mute/save/resume).
- Final artifact rerun: mobile and CanvasPASS; desktop initially exceeded its unchanged90s timeout. The last DOM snapshot had reached the notebook, and trace export additionally reported a truncated ZIP. This attempt remains recorded as FAIL in e2e-final.json; a definitive cause was not established from that incomplete trace.
- Isolated desktop recheck on the same final build:PASS in27s, unchanged assertions and90s limit. Separate output directory; trace retained on failure. No gameplay or test assertions were edited to obtain this result.

```powershell
node node_modules/@playwright/test/cli.js test --config=playwright.model-review.config.ts cinematic-chair.spec.ts --grep 'two-shot desktop' --output=docs/model-polish-proof/desktop-recheck-traces --trace=retain-on-failure --reporter=list,json
```

Playback artifact:1280x720 H.264, AAC stereo48kHz, duration53.415s. Audio inspection: mean−38.6dB, peak−22.6dB (quiet environmental mix; not silent). No private letter data in recordings or test checkpoints.

Review page verification: video metadata loads, every image loads, checkpoint launcher reaches Chapter02, zero browser errors. The review page heading uses the system font to avoid the Vietnamese combining-mark spacing defect in Georgia. This does not alter any game UI.
