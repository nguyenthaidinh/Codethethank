# G2F Asset Registry

Assets are served locally from `public/future/`. No runtime requests to asset providers, paid service, account or API are required. Exact paths, byte counts and SHA256 hashes are recorded in [acquisition/manifest.json](g2f-proof/acquisition/manifest.json).

| Asset | Author / primary source | License | Use / optimization |
|---|---|---|---|
| City Kit Commercial 2.1: building-a/b and skyscraper-a/b/c | [Kenney](https://kenney.nl/assets/city-kit-commercial) | CC0 1.0; archive license copied to `public/future/KENNEY-LICENSE.txt` | Original authored GLBs with their relative `Textures/colormap.png`. Shared geometry/materials, 36 instances per type in G2F.1 (24 in G2F); opening only. Recolored material factors suit the blue city palette. No animation/skeleton claimed. |
| Low-detail building-a/b | Same archive | CC0 1.0 | Downloaded low-detail alternatives; current runtime does not request them. |
| Floor Tiles 06 diffuse, roughness, OpenGL normal | [Poly Haven](https://polyhaven.com/a/floor_tiles_06) | [CC0 asset license](https://polyhaven.com/license) | Three 1K JPEG maps; sRGB diffuse, linear data maps, low normal strength, repeated on the atrium floor. No displacement or 8K textures. |
| Studio Small 09 | [Poly Haven](https://polyhaven.com/a/studio_small_09) | CC0 1.0 | 1K HDRI → PMREM for controlled reflection. Source HDR texture and generator released after conversion; PMREM disposed on exit. It is lighting, not a fake city background. |
| Split-arch headquarters / research galleries / Loom | Project source: `src/future/FutureWorld.ts` and `GrandArchitecture.ts` | Original project code; no third-party art ownership claim | Extruded curved architecture, static geometry batching, instanced compute leaves and traffic. Not a professionally commissioned environment. |
| Anonymous staff | Same source | Original project code | Distant low-detail silhouettes only; no named character or founder. |
| Contact occlusion / terminal / research traces | Same source | Original Canvas-generated surfaces | Shared textures; terminal updates on state change, research visualization at a bounded cadence. No AI-generated screenshot or background. |
| Three.js + addons | Existing dependency | MIT | GLTFLoader, RGBELoader, geometry utilities; direct ACES output and context MSAA. No new npm dependency. |
| Room / cast / Main Menu / chair / later chapters | Existing source and asset registry | Inherited, unchanged | Out of G2F scope. Existing menu provenance gaps are neither resolved nor expanded here. |

Acquisition script: `python scripts/acquire-future-assets.py`. It downloads a bounded set, preserves the provider license, and writes a manifest; it does not obtain credentials or install tools. Acquisition metadata/ZIPs stay in the documentation, outside the production `public` tree.

Lifecycle: the future module is imported only for opening checkpoints. City/lighting/maps finish loading before the unskipped opening clock advances. A resumed classroom/later checkpoint requests no future assets. Crossing into 2026 disposes opening geometry, materials, textures, PMREM and WebGL context. Hardware/context failure has a playable Canvas route. Missing asset errors are exposed in non-personal runtime diagnostics, not reported as a successful asset load.

Software WebGL downloads the same local files but uses diffuse maps and vertex lighting. It releases the HDR immediately, without creating a reflection environment; roughness/normal maps remain part of the hardware material path. This is a disclosed compatibility tier, not an assertion of equivalent material fidelity.
