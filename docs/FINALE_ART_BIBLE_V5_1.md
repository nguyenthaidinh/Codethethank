# FINALE ART BIBLE V5.1

**Scope:** F5.1 Design Foundation + F5.2 Player Room. Review candidate, 17/11/2026. Direction: **AION Cinematic × Human Warmth**. Requires Product Owner visual approval; this is procedural runtime art, not approved final production art.

## Visual contract

| Token | Value | Use |
|---|---|---|
| Midnight navy | `#0B1422` | Negative space, monitor, UI foundation |
| Steel blue | `#24384A` | Walls, architectural recesses, borders |
| Restrained cyan | `#72B7C9` | Monitor affordance, keyboard focus, technology |
| Warm amber | `#D5A76B` | Late-day window, pencil, restrained sunlight |
| Ivory | `#F0EEE8` | Main text, dust highlights |

The room borrows AION's quiet architecture, framed light and restrained signals. Everyday materials introduce warmth: muted wood, a worn blue notebook, a pencil and a cup. No AION brand signage is placed in the present-day room. No hotel furniture, flowers, golden stage, decorative glass cards, dashboard or full-screen concept image.

## Composition and cinematography

- First-person seated eye height: 1.58 m; desk surface at 0.84 m. There is no avatar or disembodied floating third-person camera.
- The physical monitor is the focal subject. Window and restrained skyline occupy camera-left; books and cup balance camera-right. Keyboard and notebook establish the foreground.
- `question`: editorial return to the present with a slow 0.35 m settling movement. Existing story captions and timing remain intact; this is not literal time travel.
- `paper`: hold the desk composition indefinitely. Dust and curtain motion are subtle and time-driven. No forced interaction timeout.
- Activating the monitor causes the existing `write` action, inherited sound cue, a 1.8 s smooth camera push and a late fade of the existing private editor.
- Reduced motion uses the destination camera immediately, stationary dust/curtain and no editor entrance animation.
- Portrait pulls the camera back to retain desk/window context. Native touch target is projected from the monitor geometry, rather than a hardcoded desktop coordinate.

## Typography and surfaces

Retain the installed LessonSerif for emotional text and Arial for operational labels, matching the existing game. Canvas screen artwork uses a system serif and Arial so it does not depend on asynchronous font loading. Main interactive labels remain native DOM text. Ivory on navy is primary; cyan is an affordance, never a decorative glow wash. Editor surface is opaque, bounded and minimal. There are no new F5.3 fields or sharing UI.

## Light and motion

A cool hemisphere fill, warm directional source from the window and short-range monitor light define the room. There is no bloom dependency or additional postprocessing pipeline. A restrained shaft on the desk and 48 dust points imply late afternoon. Keyboard keys use instancing. All canvas textures are generated once, not redrawn per frame. No external stock or generated image assets were added.

## Sound

Reuse ChapterAudio's Finale mix, ambient machinery/room tone, and the existing write-action cue. This keeps gesture unlock, mute, pause, volume, audio failure and disposal in the established lifecycle. No second AudioContext or parallel music loop is introduced. The retained cue is the existing paper sound, a bridge to the notebook/letter motif; bespoke computer-key foley is deferred pending art/audio approval.

## Known art limits and review criteria

This build is a playable procedural scene. It lacks authored PBR textures, baked contact shadows, detailed prop meshes and recorded room foley. Those are polish candidates after visual approval, not grounds to label the current asset set final production art. Canvas fallback intentionally uses simplified live layers.

PO should review the actual desktop/mobile screenshots and audio video in `finale-v5-1-proof`, especially room framing, cyan/amber balance, first-person scale and transition pacing. F5.3/F5.4, backend, Admin and Live Wall are explicitly outside this delivery.
