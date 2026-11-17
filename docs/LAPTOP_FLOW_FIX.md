# Laptop-first flow and terminal warnings — 17/11/2026

Source of truth: `src/chapter/director.ts`, `src/chapter/ChapterGame.tsx`, `src/verdict/VerdictControls.tsx`, `src/art/narrative.css`, and `src/future/terminalStyle.ts`. Runtime evidence: [review](laptop-flow-proof/review.html).

## Reported problem and observed cause

Selecting the laptop immediately after entering the classroom displayed its description, but the continue action was hidden until three orientation objects had been observed. The screen did not explain that prerequisite. A second restriction hid the investigation's prepare action whenever the final clue left the camera focused away from the laptop. Browser testing also exposed evidence labels intercepting clicks on a neighboring hotspot.

## Resulting behavior

- Inspecting the laptop now reveals **Chạm laptop · Chuẩn bị kiểm thử** immediately. Looking at the room's clock, window and presentation remains optional orientation.
- The actual Verdict investigation still requires the presentation, design notebook and test data. The objective and unread labels are visible immediately; the prepare action remains available after all three clues, in any order.
- Labels no longer intercept mouse/touch input. Keyboard operation uses the existing semantic buttons.
- A laptop-only checkpoint can resume in the investigation. No clues, profile evaluations or story actions are automatically awarded; the save schema remains unchanged.
- Historical `UNRESOLVED`, `NOT RECOMMENDED`, `CONTRADICTS FORECAST` and `INCOMPLETE` use red `#ff6b75` and monospace terminal typography. Non-warning information keeps its normal color. The same treatment is implemented for WebGL and Canvas; the prototype's negative evaluation is also red.

These warnings describe an incomplete historical explanation. AION is not presented as malfunctioning. The 2026 model remains An's separate prototype.

## Scope and preservation

Nine existing application files changed; one shared terminal-style module was added. [Machine-readable source comparison](laptop-flow-proof/source-check.json) compares the source with the [pre-change hashes](laptop-flow-proof/before-hashes.json) and [snapshot](laptop-flow-proof/before-source.zip).

The Verdict rules/reducer, Stayed/Ripple/Finale logic, narrative, character assets, classroom cinematography, chair motif, menu and audio/voice modules remain unchanged. Narration is still limited to the opening. No deployment, push or service integration was performed.

## Verification

Final frozen-build result: **typecheck, lint, build PASS; 44/44 unit tests and 5/5 E2E tests PASS**, zero skipped/flaky/unexpected. Browser suite duration: 6.4 minutes; the real-menu-to-Credits journey passed in 4.9 minutes. [Final machine verification](laptop-flow-proof/final-verification.json), [E2E JSON](laptop-flow-proof/final-e2e.json), [console log](laptop-flow-proof/final-e2e.log). All 45 checked protected source files match the pre-change hashes.

Commands:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
$env:GAME_PROOF_OUT='docs/laptop-flow-proof/runtime/journey'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE='docs/laptop-flow-proof/final-e2e.json'
node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts cinematic-laptop-first.spec.ts cinematic-fullgame.spec.ts --reporter=list,json
```

The new browser tests select the laptop first, reload its checkpoint, inspect clues in different orders ending away from the laptop, evaluate a sample profile, unlock/evaluate An and verify actual red text paint. They cover desktop WebGL, touch Canvas with mute/reduced motion, keyboard input, and the future terminal's Canvas rendering. The existing full-game test starts at the real menu and reaches the private-star ending and Credits without checkpoint injection or page reload between chapters.

Initial debugging found a label-interception failure; `flow-attempt-1.log` preserves that interrupted attempt. After correcting the labels, the four new browser tests passed in `flow-results.json`. Final results below supersede this iteration.

## Limits

Touch/mobile checks use browser emulation, not a physical phone. This change does not establish visual approval, AAA quality or release readiness. The existing large-bundle warning remains. Gate 3 remains closed.

Production bundle, compared with the immediately preceding chair-cinematic build: cinematic JS **742.50 → 742.71 kB**, ChapterGame JS **55.79 → 56.22 kB**, FutureWorld JS **71.22 → 71.31 kB** (Vite's rounded decimal sizes). The cinematic chunk is 742,706 bytes; its SHA-256 is `49586E8C7F0491B79875180126EBDABAD054848E642B79DDF7037E4C1824035B`. Preview and review URLs returned HTTP 200; the served build hash matches the build used for testing.
