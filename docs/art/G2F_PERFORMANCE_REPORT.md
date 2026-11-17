# G2F Performance Report

Measurements below are from final browser verification. No real-device FPS claim is made.

## Baseline and measurement plan

Pre-G2F production bundle data: `g2f-proof/baseline/bundles.json`. The cinematic shared chunk was **676,937 bytes**; ChapterGame **46,063 bytes**. The old opening was Canvas 2D, so zero WebGL draw calls is not a like-for-like GPU workload.

Baseline browser: 1280×720 Chromium, recorded user-agent and the last 100 animation-frame intervals in `baseline/runtime.json`, at the signal-investigation stage. The after probe uses the same viewport and stage, after warm-up, with no recording or other browser automation running concurrently. The final primary probe explicitly selects Intel D3D11; baseline Canvas used default headless. Report this renderer difference and compare frame intervals as observed scheduling/render cost, not a controlled GPU A/B or certified phone FPS.

## Bounded cost

- Local external assets: approximately 2.86 MB before HTTP compression, including downloaded but unused low-detail alternatives. The city uses five model types, one palette texture, instancing and shared materials.
- Static architecture is batched by parent and material. Computation leaves and transit use instancing. There are no shadow maps, full scene reflection passes, bloom or depth of field.
- Direct ACES/sRGB output uses context MSAA, with no float render target or FXAA post pass. The GPU path starts at .75 scale in portrait and 1 in landscape, with .6/.75 under load. Software starts at .65/.75 and may use .45/.5. The drawing buffer is bounded to 1440 pixels across, with CSS keeping the viewport size.
- Software WebGL (SwiftShader/llvmpipe) keeps the same geometry, textures and composition but uses Lambert vertex lighting. The hardware path retains PBR and HDR image-based lighting. On software the downloaded HDR is released without generating an unused PMREM. Diagnostics identify the active lighting tier; software captures do not certify hardware PBR appearance.
- The hardware floor has three 1K material maps. HDR lighting is 1K converted once; the original HDR and PMREM generator are released after conversion. Software uses the same diffuse floor map with the cheaper lighting model.
- Data texture updates are bounded. Paused/reduced-motion rendering does not advance visual time.
- A resumed classroom/later checkpoint does not import FutureWorld or request its environment files. Opening resources/context are disposed at the 2026 hand-off.

## Limits

Software WebGL measurements expose regressions but do not replace an actual phone or GPU profile. There is no measured GPU-memory byte figure; renderer geometry/texture counts are resource counts. City instancing saves draw calls but still draws its triangles; asset fidelity and render scale remain art/performance tradeoffs for Product Owner review.

## Measured result — 17 November 2026

| Scenario | rAF P50 | rAF P90 | WebGL draw calls | Triangles | Internal scale |
|---|---:|---:|---:|---:|---:|
| Baseline, 1280×720 Canvas signal | 16.7 ms | 16.7 ms | 0 | n/a | Canvas |
| desktop viewport 1280×720 | 16.7 ms | 33.4 ms | 24 | 20,758 | 1 |
| touch emulation 390×844 | 16.7 ms | 16.7 ms | 23 | 20,756 | 0.75 |

Renderer reported by the actual probe: **ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)**. The before/after probes use the Chapter 00 signal checkpoint with audio enabled and the same desktop viewport, but this is not a GPU-controlled A/B: the baseline is Canvas2D/default headless and the final PBR run explicitly selects Intel D3D11. The new scene is a different and heavier 3D workload. Touch is viewport/input emulation on this host, not a phone measurement. Source data: [performance.json](g2f-proof/performance.json).

Shared cinematic chunk: **676,937 → 732,962 bytes**, +56,025 bytes / **8.28%**. Opening-only FutureWorld chunk: **70,908 bytes**. The shared Three.js support grows even on later checkpoints; environment assets and the FutureWorld module itself are excluded from later-checkpoint requests by E2E. Vite's >500 kB chunk warning remains a disclosed limit, not a build failure.

A definitive 2026 frame-time A/B was not performed in this gate. The protected source equality, completed story regression and observed future-context disposal support the narrower claim that its art/logic were preserved and the opening does not remain rendering behind it. Headless automation on the accessible Intel desktop GPU is measured; no physical phone or human playtest certification is made.

## Software WebGL compatibility

SwiftShader after optimization: desktop P50 **116.6 ms**, P90 **133.4 ms**, scale 0.5; touch emulation P50 **33.4 ms**, P90 **116.6 ms**, scale 0.45. Both probes completed source/limit inspection and returned to the unchanged classroom. [Raw results](g2f-proof/performance-software.json).

**LIMIT:** CPU-only rendering is functional but is not a smooth desktop cinematic profile; the desktop median remains over 100 ms. This is not certified 30/60 fps performance. No phone/GPU-independent guarantee is made. The Intel PBR result and software tier are intentionally reported separately.
