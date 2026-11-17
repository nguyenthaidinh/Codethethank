# Cinematic ending refresh — 18 November 2026

**Fireworks / Credits polish:** removed the vertical firework mask that hid the lower launch path. Rockets now rise for 2.2 seconds with bright heads, curved trajectories and longer fading spark trails before bursting. The text-column mask and reduced-motion toggle remain. Credits now use a separate native dialog (`EndingCredits.tsx`, `ending-credits.css`) with grouped editorial sections, expandable technology/license sources, Escape/backdrop dismissal and restored keyboard focus. No contributor identities were invented. Typecheck/build and scoped ESLint passed; all 6 ending E2E tests passed on production in 59 seconds, including Credits details, mobile layout and Escape focus restoration. Credits captures: `ending-artifacts/credits-desktop.png`, `credits-mobile.png`.

**School-photo revision:** the current ending uses the user's photograph, edited/outpainted with built-in ImageGen into `public/ending/school-twilight.webp`. `ending-school.css` places the interface in the left garden margin and keeps the school facade/sign clear on the right. Portrait layouts show the school above the interface. Fireworks now occupy the upper-right sky. Exact prompt and provenance: `SCHOOL-ART-DIRECTION.txt`. Earlier campus-night artwork is retained but no longer used.

School revision validation: typecheck/build PASS; scoped ESLint PASS; all 6 ending E2E tests PASS against the production build (1.4 minutes). Desktop, mobile, small portrait and landscape screenshots visually reviewed. An initial development-server run was interrupted by a hot reload reopening the existing tribute modal; the complete test suite was rerun against the stable production build without changing assertions.

The ending now fills the viewport with an original night-campus environment, warm lamps and a dark sky. The existing game title becomes a restrained serif wordmark, with the original closing sentence retained. A primary tribute action sits above the existing menu/replay/letter/credits controls. The old blank 3D display remains part of the underlying renderer but is completely covered during the ending; earlier phases are unchanged.

Fireworks are real Canvas animation: rockets rise from the horizon, bloom at staggered times, and leave falling embers. Gold, muted cyan and warm rose remain outside the title's reading area. Rendering is capped at 30 FPS and 1.5 device pixel ratio, with fewer rays on narrow screens. The effect stops on unmount, hidden tabs, either reduced-motion setting, or the explicit fireworks toggle. No new audio is played. The existing teacher tribute retains its original opening behavior and all original actions.

## Scope

- Added `EndingScreen.tsx`, `EndingFireworks.tsx`, `ending-screen.css` under `src/finale/`.
- `FinaleControls.tsx`: replaces only the ending presentation wrapper with `EndingScreen`, retaining action handlers and TeacherTribute.
- `src/chapter/ChapterGame.tsx`: adds one prop carrying the existing reduced-motion setting.
- Added `public/ending/campus-night.webp` (269,466 bytes), with original PNG preserved in `ending-artifacts/sources/`.
- Added isolated `playwright.ending.config.ts`, `tests/ending-e2e/ending.spec.ts` and `scripts/encode-ending-asset.mjs`.
- No edits to story/reducers, letter storage, public sharing, classroom renderer/camera, audio or other chats' preview outputs.

## Validation

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build -- --outDir dist-ending-review`: PASS. Existing JSON-import-attribute and large gameplay-chunk warnings remain outside this change.
- `npx vitest run tests/finale.test.ts`: 6/6 PASS.
- `npx playwright test --config playwright.ending.config.ts`: 6/6 PASS. Covers actual saved ending, active fireworks/toggle, credits, inspecting the letter, return to menu, replay, OS/in-game reduced motion, missing-image fallback, 390×844, 360×640 and 844×390 layouts.
- Screenshots visually inspected: `ending-artifacts/desktop.png`, `mobile.png`, `small.png`, `landscape.png`.
- The desktop artwork/actions test also passed against the isolated production build on port 4247 (1/1, 23.3 seconds).
- Full `npm test`: **137 passed / 11 failed** at the time of the run. This is not a globally green repository. Failures include historic source/hash/layout locks (`future`, `story-n2/n3/n4`, `classroom-lighting`, `classroom-performance`) and story/timing expectations (`an-setback`, `story-v4`, `ripple`). The N4 ending-layout lock expects the old ending markup, which this authorized redesign deliberately replaces. Other failures involve shared ongoing camera/story work. These tests and unrelated implementations were not changed to conceal failures.

## Preview

```powershell
npm run dev -- --port 4246 --strictPort
npm run build -- --outDir dist-ending-review
npm run preview -- --port 4247 --strictPort --outDir dist-ending-review
$env:ENDING_TEST_URL = 'http://127.0.0.1:4247'
npx playwright test --config playwright.ending.config.ts --grep 'ending artwork'
```

The original game server also picks up the source change when using Vite. The preview begins at the normal menu; this change adds no public cheat/checkpoint route. Tests use a valid isolated browser checkpoint to inspect the ending without touching a player's save. No deployment or external publishing was performed.

## Asset provenance and final prompt

Generated with the built-in `image_gen` tool (not CLI). Transparent background: false. No supplied image was used as an edit target. PNG→WebP conversion only, preserving the original generated artwork. Final game asset: `public/ending/campus-night.webp`.

> Use case: photorealistic-natural. Asset type: cinematic ending environment for Vietnamese narrative game THE UNWRITTEN LESSON, wide 16:9 landscape. Original highly detailed physically realistic film still of a peaceful Vietnamese university campus at blue hour, after a celebration of teachers. Broad dark midnight blue sky fills the upper 65 percent of the frame, intentionally uncluttered with a wide clean dark central space reserved for overlay typography. Elegant cream university buildings and covered walkways sit low along the left and right lower edges, warm amber light in windows, mature trees framing the far edges. A long courtyard path leads toward the horizon at the center bottom with subtle reflections on smooth stone from earlier rain, sparse tiny golden fairy lights along campus trees, a few warm glowing lanterns at ground level. Poetic, nostalgic, hopeful, premium cinematic realism. Deep indigo, muted teal, champagne gold. Natural photographic depth and real architectural detail, no cartoon, no vector look. Soft haze near the distant buildings, a small handful of subtle stars in the sky. IMPORTANT no fireworks drawn in the image (the game adds real animated fireworks), no people in foreground, no text or lettering, no logos, no interface, no signboards, no giant moon, no neon, no confetti, no photo collage. Keep the center sky especially dark and clean for readable white and gold title text.
