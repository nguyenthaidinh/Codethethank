# Current direction — G2F.1 / Grand Opening V2

The civic research direction now uses a Citadel tower/crowns and connected wings, a five-level Grand Atrium with suspended bridges and lifts, and the Nexus with six pylons and 144 addressable leaves. Human silhouettes, gallery spacing, near/middle/far architecture and a six-shot camera create scale. The complete sequence and narration are in [G2F1_IMPLEMENTATION_REPORT.md](G2F1_IMPLEMENTATION_REPORT.md) and [G2F1_OPENING_SCRIPT.md](G2F1_OPENING_SCRIPT.md). Runtime art approval remains pending. The 2026 environment is frozen.

The preceding G2F direction is preserved below as history and in `g2f1-proof/before/FUTURE_ART_BIBLE.md`.

---

# G2F — Future Art Bible

Scope: opening 2046 only. This is a visual review candidate, not an art approval or a release certification. Product Owner review remains required. Do not open Gate 3.

## Direction decision

Two directions were considered: **Civic Precision**, an open research institution with legible engineering and controlled daylight; and **Dark Monolith**, a closed, black-metal facility with theatrical illumination. Civic Precision was selected: it communicates a useful, established general-purpose AI and makes the eventual quiet classroom contrast clearer. Dark Monolith risks implying an adversarial AI and makes mobile navigation harder.

The architectural signature is a split silver arch enclosing a three-level research atrium. The opening travels through a city of authored modular buildings into this same atrium and its computation floor. The **Loom** uses layered addressable compute leaves and physical research surfaces; AION is an operating environment, not a glowing ball or a memory storage product.

| Element | Rule |
|---|---|
| Palette | Midnight `#071423`, graphite `#182936`, silver `#a6bac7`, cool white `#e3edf0`, cyan `#91d9e1`. Amber `#e1b97b` identifies the unmatched record. |
| Architecture | Curved load-bearing arch, occupied research wings, floors around an actual void, recessed light channels, mounted signage. |
| Materials | CC0 tile surface maps and studio image-based lighting; matte graphite, restrained metal and limited architectural glazing. No bloom or purple fog. |
| Scale | Metres; three research levels, anonymous distant staff for scale. No founder or named character in this opening. |
| Camera | City dolly → entrance → research gallery → computation floor. Player can inspect the research wing, return to the desk, and focus the record. |
| UI | Only context-specific physical-system targets. No permanent debug panel, navbar, cards, score or fake live metrics. |
| Motion | Transit and computation are slow; choosing a data channel changes the Loom and its terminal. Reduced motion uses fixed shots and static computation geometry. |
| Sound | Existing audio context, location-dependent machinery/conversation balance, restrained AION motif. Existing silence → rain → bell bridge remains. No synthesized speech is represented as recorded voice acting. |

## Shot and interaction order

1. Fade from black; establish skyline and AION arch.
2. Approach the entrance and occupied research galleries.
3. Reveal the Loom. An unmatched 2026 record requests attention.
4. Return control. Observe research or touch the desk signal.
5. Inspect **source data** and **prediction limits** on the physical desk. Both have readable feedback; the selected path changes the computation leaves.
6. Open the original record. Machines recede, a brief silence precedes rain and the school bell; the existing classroom window appears.

The original chapter reducer, save version, evidence conditions and later narrative remain the source of truth. The optional inspection sidecar records only the two channel IDs, without a name, letter or personal data.

## Fidelity and limits

Kenney city meshes are stylized authored modules used for city depth, not presented as photoreal scans. The headquarters and Loom are original runtime geometry, including extruded curved surfaces; they are not represented as commissioned, hand-authored environment assets. Background staff are anonymous simplified silhouettes, not production character portraits. Reflections use a licensed HDRI, not a full real-time reflection of the room. These are explicit limits for visual review.

On software WebGL the same composition/assets use a cheaper vertex-lighting path without HDR reflections. Runtime metadata identifies this tier. Captures from SwiftShader are evidence of that compatibility path; the final D3D11 captures show the hardware PBR path. Product Owner visual approval and physical-phone validation remain pending.

The 2026 classroom, An, cô Vân, lighting, camera, chair motif, notebook, Verdict, Stayed, Ripple, Finale and Main Menu are frozen. `g2f-proof/baseline/source-before.zip` and its SHA256 manifest preserve the pre-G2F source. The unit suite verifies every pre-existing `src` file except the two explicitly integrated chapter files remains byte-identical.
