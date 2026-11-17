# Research environment and adult An — 2026-11-17

The supplied screenshot was the 2035 milestone. This pass upgrades both 2029 and 2035 while preserving state/checkpoint/story, the 2026 set, opening and letter source.

- `ResearchStudio.ts`: original Three.js furniture and equipment: dual research displays, tower/vents, rear bench and compute rack, storage and service-light layers. Adult-scale ergonomic chair with head/lumbar support, arms, pedestal and five casters. Static furniture is merged by material/parent; resources are explicitly disposed.
- `RippleWorld.ts`: isolated research hero rig, scaled 1.12× horizontally and 1.14× vertically with slightly smaller head and broader torso. Replaces the old simple foreground actor only in 2029/2035. Original chair callback, 2046 reveal and later actors retain their previous behavior. Research camera/portrait framing keeps chair, adult An and equipment visible. Old spare classroom chairs and outdated lab props are hidden in these two scenes.
- `WorldRenderer.ts`: researcher factory uses existing detailed NarrativeActors geometry/rig (hair, face, clothing and articulated hands) rather than the old demo actor. An isolated posing callback sets seated posture, breathing, blinking and arm IK to the near keyboard. It does not modify classroom actor code or camera/lighting. All character assets remain project procedural models; no claim of professionally authored external character assets.
- `RippleControls.tsx` and scoped `ripple.css`: 2035 era typography/object prompt matches the journal; headline repositioned to avoid the foreground character.

Checks: final typecheck PASS, scoped ESLint PASS, Vite build PASS (existing large-bundle warning), four existing Ripple tests PASS. Desktop and touch browser walkthrough 2029 desk → notebook → 2035 PASS, zero page errors. Screenshots and JSON in this directory. Test initially timed out because the new button's secondary caption changed its accessible name; restored the exact accessible label and reran successfully. A concurrent Chapter 02 edit briefly caused missing-export/type errors outside this scope; subsequent typecheck passed without modifying those files.

No full later-chapter regression, physical mobile benchmark or measured FPS claim. Canvas fallback keeps its prior simpler representation. The latest rebuild after visual checks changes only an anachronistic background display label to the era-neutral RESEARCH / CONTEXT.

Preview: http://127.0.0.1:4230/_research-review.html — choose 2029 or 2035, then Tiếp tục. Isolated review checkpoint/origin; existing preview saves unaffected. No push/deploy.
