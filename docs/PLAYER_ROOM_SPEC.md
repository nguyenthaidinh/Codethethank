# PLAYER ROOM SPEC — F5.2

## Integration boundary

`FINALE_READY` remains the existing Chapter/ripple boundary. Existing Finale `memory` and `lesson` beats remain unchanged. The new room renders only for `question`, `paper`, `letter`, `review`. Existing `transform`, galaxy and ending remain the legacy compatibility path. No progression field, checkpoint version, story line, completion flag, public-sharing behavior or menu routing changed.

`FinaleVisual` creates a `PlayerRoom` once inside the existing Three.js scene. While active it hides the original research-scene children; on exit the legacy visual restores them. Room resources are owned and disposed by the room. There is no new render loop, WebGL context, global event listener, timer, audio context or save key.

## Interaction contract

| Beat | Input | Camera/visual response | Persistent effect |
|---|---|---|---|
| question | Existing timed beat | Seated establishing movement | Existing phase timing only |
| paper | Click/tap physical monitor; keyboard Enter/Space on native button | 1.8 s smooth push, screen clears, editor fades in | Existing `write` → `letter` |
| paper | Existing paper shortcut | Same push and editor | Same existing action |
| paper | Existing silent continuation | Legacy transform/galaxy | Existing skip choice |
| letter/review | Existing editor controls | Navy integration surface at close camera | Existing private letter rules |
| any | Pause, mute, Menu/Continue | Existing runtime lifecycle | Existing preferences/checkpoint |

The monitor button is a transparent native button whose bounds are projected each frame from the four edges of the actual monitor plane. Camera is fixed in orientation apart from the prescribed push, so the axis-aligned projected rectangle covers the screen. Keyboard focus/hover provides a cyan outline. This avoids duplicate pointer listeners and routes all activation through the pause-aware `finaleAct`. Minimum target is 44 CSS px. The older paper shortcut is intentionally retained for regression and accessibility compatibility.

## Camera

World coordinates use metres. Desktop eye `(0.2, 1.58, 2.15)` looks toward `(0.2, 1.38, -0.72)` with vertical FOV 44°. Portrait eye Z is 5.6, retaining context around the screen. Close eye is `(0.2, 1.66, 0.8)`, or Z 1.65 on portrait. A clamped smoothstep interpolates over 1.8 seconds. The existing game timeline owns pause and phase time. Reduced motion jumps to destination with no sway or entrance fade.

## Rendering/fallback

- Three.js geometry: room planes, desk/supports, monitor/stand, instanced keys, mouse, notebook/pages/pencil, cup and books.
- Static generated Canvas textures: window gradient and monitor artwork. They are textures on meshes, not full-screen environment images.
- Canvas fallback builds live layered geometry, window, props, dust and zoom with the same state/action contract. Works without WebGL and offline.
- Mobile uses native controls and an existing scrollable editor surface with 16px inputs. IME handling is unchanged. No new touch gestures or motion permissions.
- CSS is scoped to Finale attributes/classes; menu, AION 2046 and 2026 art are unaffected.

## Letter integration seam

This sprint wraps the current private editor; it does not implement the planned F5.3 authoring/preview/public consent flow. Existing local-storage opt-in, grapheme limits, IME composition, sanitization, private star and erase behavior are retained. There are no network calls, backend endpoints, public wall or new personal-data telemetry.

## QA and review

See `FINALE_V5_1_TECHNICAL_REPORT.md`, `finale-v5-1-proof/results.json`, `room-final-results.json` and the `before/after` folders. Browser mobile emulation is not a real-device certification. Performance samples are local Chromium RAF cadence, not GPU timing. Review URL uses isolated output at `http://127.0.0.1:4188/`; progress through Finale normally or use the checkpoint-driven Playwright proof. QA seeding runs only in isolated Playwright contexts, never in the user's browser profile.

Reproduce: `npm run build -- --outDir finale-review-dist`, start `npx vite preview --outDir finale-review-dist --host 127.0.0.1 --port 4188`, then `npx playwright test -c playwright.player-room.config.ts cinematic-player-room` and `node scripts/record-player-room.mjs`. Baseline comparison additionally uses `finale-baseline-dist` on port 4189 and `ROOM_BASELINE=1`.

**Stop after F5.2:** Product Owner must approve the room before work on F5.3 is started. No push or deploy is part of this task.
