<!-- G2F1:START -->
# G2F.1 — measured performance

Chromium on the accessible Intel Iris Xe / D3D11. Probes were collected after browser tests and recording, with no other automated browser running. rAF intervals are observed frame scheduling/render cost, not a GPU timer query or phone FPS certification. Baseline is the immediately preceding G2F build on the same host/driver/viewport, with audio enabled.

| Signal checkpoint | rAF P50 ms | P90 ms | Draw calls | Triangles | Scale |
|---|---:|---:|---:|---:|---:|
| G2F desktop before | 16.7 | 66.6 | 24 | 20758 | 1 |
| G2F.1 desktop | 16.7 | 50.0 | 31 | 40712 | 1 |
| G2F.1 touch emulation | 16.7 | 33.3 | 31 | 40712 | 0.75 |

The complete unskipped desktop opening was also sampled while its camera moved:

| Place | Samples | P50 ms | P90 ms | Maximum draw calls | Maximum triangles |
|---|---:|---:|---:|---:|---:|
| city | 604 | 16.7 | 16.8 | 42 | 302882 |
| headquarters | 760 | 16.7 | 16.8 | 28 | 40832 |
| core | 710 | 16.7 | 33.3 | 22 | 39470 |
| anomaly | 471 | 16.7 | 50.0 | 32 | 41000 |

| JS chunk | Before bytes | After bytes | Difference |
|---|---:|---:|---:|
| CinematicGame- | 732962 | 732953 | -9 |
| FutureWorld- | 70908 | 71216 | 308 |
| ChapterGame- | 49880 | 52872 | 2992 |

There are no new npm dependencies or downloaded environment files. The instanced city uses 36 instances/type versus 24 before; only the opening loads its GLBs and HDR/maps. Geometry is batched; computation/traffic are instanced; direct ACES/sRGB and native context antialiasing avoid full-screen postprocessing. Resource counts are not a VRAM byte measurement. The existing Vite >500 kB shared-chunk warning remains.

## Software compatibility and limits

SwiftShader uses the disclosed vertex-lighting tier, with no HDR reflections. Desktop P50/P90: **83.3 / 133.4 ms**, scale 0.5. Emulated touch: **16.7 / 49.9 ms**, scale 0.45. Both profiles completed the two inspections and handed off to the original classroom. CPU rendering is a compatibility path; it is not certified smooth cinematic performance.

Physical mobile, Safari/iOS and a human first-play readability/art assessment remain unverified. The baseline 2026 frame-time A/B is outside this opening-only gate; source equality and full story regression support preservation of its code/behavior.

Sources: [hardware profile](g2f1-proof/performance.json), [software profile](g2f1-proof/performance-software.json), [before](g2f1-proof/before/performance.json), [verification](g2f1-proof/verification.json).
<!-- G2F1:END -->
