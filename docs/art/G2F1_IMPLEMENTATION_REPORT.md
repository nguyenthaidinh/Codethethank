# G2F.1 — AION Grand Opening V2

Status: runtime candidate; functional checks passed; Product Owner art approval pending. Scope: Chapter 00 / 2046 only. No deployment, push, new dependency or Gate 3.

## Observed problem and implemented response

The previous opening had a low three-level research hall and a small Loom. AION was introduced through a field list, and the historical hook lacked a causal question. This build adds a distinct Citadel silhouette, an occupied five-level atrium and a separate monumental Nexus.

| Sequence | Runtime construction / direction |
|---|---|
| 0–12 s | Deep instanced city; central hexagonal tower with paired structural crowns, terraced research wings and connections. A wide camera approaches the campus. |
| 12–27 s | Five galleries, staggered suspended walkways, tall structural ribs, moving glass lift cars, small staff silhouettes and research surfaces. The camera physically crosses the atrium. |
| 27–42 s | Six vertical compute pylons, service levels and a 144-leaf suspended intelligence structure. Status channels activate in sequence as the music rises. |
| 42–53 s | Camera leaves the monumental view for the physical analysis terminal. Music recedes; narration introduces THE UNEXPLAINED VARIABLE. |
| Player investigation | Two original IDs/save conditions; new prediction/outcome presentation and bounded AION dialogue. No separate dashboard or new mandatory puzzle. |
| Memory opened | Existing silence → rain → bell → footsteps → unchanged 2026 window/classroom, with no route reload. |

`GrandArchitecture.ts` is original code geometry and composition, not a commissioned art asset. Existing Kenney authored GLBs, CC0 material/HDR assets, loading/disposal and software/Canvas routes are retained. Staff remain anonymous distant silhouettes, not new production character portraits.

## Protected source and narrative

The baseline archive contains 101 app/public/config files. Six existing opening/integration files may change; all other baseline files are compared by SHA256. Main Menu, the 2026 cast/art/camera, all chapter reducers, save versions, chair motif and Chapters 01–04 remain unchanged. The new `GrandArchitecture.ts` is opening-only. Exact diff/hash evidence is under `g2f1-proof/`.

The founder reveal remains in Chapter 03. The mystery is an incomplete causal record of a later outcome that differs from the original forecast; the old student prototype is not AION. Narrator captions establish AION's fictional world-leading capability without self-congratulation or fake real-world ranking metrics.

## Verification

Typecheck, lint, 36 unit tests and production build passed before the browser run. Final E2E, recording, measured performance and exact commands are recorded below. Tests are functional evidence, not visual approval.

## Art/direction reasoning for review

The scale cue is the relationship between a roughly human-height background silhouette, eight-metre gallery spacing, long bridges and thirty-five-metre compute pylons. Near railings, middle-distance service floors and a far focal structure give the moving camera several depth layers. Lifts and sequential status channels show that the space operates independently of the player. The wide Nexus shot is kept free of a foreground crosswalk that obscured its upper silhouette in the first runtime check.

The city remains bounded: existing licensed modules are instanced, not replaced by a large new download. The new tower/crowns, connected wings and deep atrium form one recognizable campus. The camera proceeds from that city-scale view to one physical analysis surface; the mystery narrows the question at the same time the music recedes. It does not shut AION down or present a technical error.

These are design intentions supported by runtime images, not a declaration that the visual quality is approved. Background people remain simplified and the new architectural geometry remains code-authored. The Product Owner should assess the full moving sequence, mobile readability and whether the scale/focus change works emotionally.


<!-- G2F1:START -->
## Final functional verification

**Typecheck, lint, 36 unit tests, production build, 36 gameplay E2E and 11 menu E2E PASS.** No skipped, flaky or unexpected result is counted as PASS. Full menu→Credits without loading checkpoints passed; founder reveal, Verdict, chair/notebook, Ripple, Finale, Unicode/IME, mute, touch, reduced motion, WebGL/storage/audio failure and resume are covered. The two legacy art checks run with ART_CAPTURE_PHASE=after rather than being skipped.

Commands executed:

```text
npm run typecheck
npm run lint
npm test
npm run build
node scripts/run-g2f1-qa.mjs
# G2F_SUITE=e2e/menu, ART_CAPTURE_PHASE=after
# node node_modules/@playwright/test/cli.js test --config=playwright.g2f.config.ts --reporter=list,json
python scripts/report-g2f1-source.py
node scripts/inspect-g2f1.mjs http://127.0.0.1:4173
node scripts/record-g2f1.mjs
node scripts/probe-g2f1.mjs
# G2F_SOFTWARE_WEBGL=1: node scripts/probe-g2f1.mjs
node scripts/finalize-g2f1.mjs
```

The source archive compares 101 files: 95 unchanged and six opening/integration files changed. The new architecture module is opening-only. [Exact diff](g2f1-proof/integration-diff.patch), [hashes](g2f1-proof/source-verification.json).

Actual browser video: **96.8 seconds**, H.264/AAC with the live chapter master audio bus; 2675 observed frames. Encoding at 24 fps does not claim that as the renderer rate. The recording includes UI/subtitles, both channels and the silence/rain/classroom transition. No private letter content. [Review gallery](G2F1_REVIEW.html), [video](g2f1-proof/runtime/opening-runtime-with-audio.mp4), [recording metadata](g2f1-proof/runtime/recording.json), [QA results](g2f1-proof/e2e-results.json), [menu](g2f1-proof/menu-results.json).

The camera/frame arrangement is deliberately different in before/after images; this is an art comparison, not a pixel A/B from identical cameras. The revised opening takes 53 seconds before control, then player-controlled investigation. Its roughly 90-second outline is not a forced reading schedule. No production voice acting is claimed.

**Art approval remains pending.** Physical phones, Safari/iOS and human first-play review remain unverified; software performance is reported separately with its limits. This gate does not approve 2026 art, open Gate 3 or certify a release. No deploy/push/paid service/credential change. STOP at G2F.1 for Product Owner review.
<!-- G2F1:END -->