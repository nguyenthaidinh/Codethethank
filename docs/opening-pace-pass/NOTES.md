# Faster opening and new narrator — 2026-11-17

- Replaced the seven opening MP3s with Andrew Multilingual reading the existing Vietnamese narration at +18% rate, replacing Nam Minh at -3%. Generation parameters are now explicit arguments in `scripts/generate-opening-male.py`; no runtime service or new npm dependency. Provenance: `public/voice/vi-andrew-fast/PROVENANCE.md`; duration/hash manifest updated.
- Opening duration 60 → 41.5 seconds. City ends at 12 s, Nexus starts at 23.1 s, anomaly at 33 s, subtitle-only AION line at 37.5 s. Each narrator clip finishes before its caption changes. No story text was rewritten.
- Retimed existing camera keys along the same spatial route, aligned to narration boundaries. Updated reduced-motion representative timestamps. Position/target vectors, opacity blend, image quality and rendering optimizations retained.
- Menu laptop, classroom and letter left intact. New preview includes the laptop menu change.
- PASS: typecheck, scoped ESLint, Vite production build to `dist-opening-fast-review`, 11 opening-camera/speech tests. Existing bundle-size warning remains. Camera tests use the retimed entrance interval; angular-rate allowance scales with the explicitly requested faster playback.
- Browser command: `node scripts/smoke-opening-pace.mjs` checks opening → player control, all seven new voice clips completed, and no page errors. Evidence: `runtime.json`, `runtime.png`. No long full-game regression or physical-device voice-quality claim.

Preview: http://127.0.0.1:4227/ — Bắt đầu hành trình. No push/deploy.
