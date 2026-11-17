# Cinematic Game Handoff — Final Act

Runtime hiện tại đi từ Main Menu qua Chapters 00–04 tới ending. `ChapterSave.verdict` giữ `stayed`, `ripple` và `finale`; `FinaleSave.completed` là trạng thái hoàn tất duy nhất. Thư nằm riêng ở `project2011.gratitude.v1`, không trong save tiến trình/telemetry. Không backend cộng đồng. `GameShell` xử lý callback menu/replay; không reload giữa chương. Báo cáo mới nhất: [Final Act QA](final-act-qa.md); hướng dẫn production: [production-final-act.md](production-final-act.md).

Các mục bên dưới là lịch sử từng sprint; giới hạn của chúng được thay thế bởi Sprint 05 ở cuối tài liệu.

## Sprint 02 history

Sprint 02 supersedes the old `NEXT_SCENE_READY` handoff described in the historical table below. That state now owns `ChapterSave.verdict` and keeps **the same room renderer, camera, canvas and audio context**. New path: investigate three physical evidence props → choose/run a sample → unlock/run AN → reaction/silence → connect two distinct pieces of evidence to the result → teacher entrance → Chapter 02 chair/first question. The latest user brief explicitly places An's test before the teacher's arrival. Legacy S02–S03 saves and QA route preserve their old flow.

`src/verdict/evidence.ts` owns evidence; `rules.ts` owns the deterministic fictional evaluation; `state.ts` owns gates/checkpoint validation; `story.ts` owns subtitles/hints/shot choices; `screen.ts` draws onto the physical laptop texture; `VerdictControls.tsx` owns minimal input UI. ChapterStage sequences timed cues and continues the existing renderer loop. `WorldRenderer.setEvaluation()` and FallbackWorld share the same screen data. Before the teacher gate, actor visibility is explicitly false even when the legacy `verdict` animation is used for An.

Continue preserves evidence/tested profiles/links. An interrupted processing phase restores selection without claiming a completed run. A completed An revelation restores investigation rather than replaying it. Repeated run/finish/link actions are guarded; two clicks on the same evidence cannot unlock the teacher. Chapter 02 currently contains its opening chair/first-question beat, not a full chapter. Current validation: `chapter-01-qa.md`.

## Sprint 01 history (superseded handoff)

`src/main.tsx` → `GameShell` → MainMenu → `ChapterGame`. A fresh launch runs Chapter 00; a legacy S02–S03 save runs `CinematicGame` directly. MainMenu's appearance and controls are unchanged. `/?qa=1` and `/?record=1` retain the legacy slice; `/?chapter=1` starts a fresh Chapter 00 for inspection.

## Runtime ownership

- `chapter/director.ts`: narrative text, validated checkpoint schema, action gates. No rendering or Web Audio here.
- `chapter/ChapterGame.tsx`: timeline, one-shot cues, visibility/pause, input, audio lifecycle, room preload, checkpoint and handoff. The renderer loop reads current state through a ref; beat-entry resets the cue set in a layout effect before the next animation frame.
- `chapter/SummitWorld.ts`: code-built 2.5D architecture/audience/terminal and camera projection. No image asset downloads.
- `chapter/ChapterAudio.ts`: original future ambience and signal motif on AudioDirector's buses. Menu music/effect levels are passed independently. Audio failure does not block the timeline.
- `cinematic/WorldRenderer.ts`: shared 2026 room, camera presets, object anchors, actor rigs and adaptive GPU render resolution.
- `cinematic/FallbackWorld.ts`: live Canvas room with camera focus when WebGL fails. Preserves tap/keyboard interactions and clues.

## State transitions and cleanup

| State | Entry / camera / sound | Exit condition |
|---|---|---|
| OPENING_CINEMATIC | Fade, establishing/dolly, hall + AION motif; input camera locked | 30 s or explicit Skip |
| PLAYER_CONTROL_ENABLED | Limited free look, reactive physical signal | Select signal by tap/mouse/keyboard |
| SIGNAL_INVESTIGATION | Dolly into terminal, crowd duck, case text | Activate case on terminal |
| MEMORY_TRANSITION | Fade hall to black, silence, rain/bell/departing steps; preload room | 8 s |
| CLASSROOM_ESTABLISHING | Window focus → wide room; school ambience, An alone | 7 s |
| CLASSROOM_EXPLORATION | Object focus/return, evidence, directional rain and foley | Inspect laptop |
| LAPTOP_INVESTIGATION | Physical prototype screen; no test result yet | Return or activate laptop when ≥3 evidence including notebook/laptop |
| NEXT_SCENE_READY | Save legacy-compatible S03 `enter` checkpoint | Unmount chapter, dispose render/audio, mount existing CinematicGame |

Each scene transition clears its one-shot cue registry. Pause and hidden tabs stop the narrative clock; unmount cancels RAF, disconnects ResizeObserver, closes AudioContext and disposes renderers. No route navigation is used inside gameplay. Reduced motion uses fixed camera cuts instead of camera drift/character sway.

## Persistence

Key remains `project2011.cinematic.v3`. Optional `SliceSave.chapter` uses its own version 1 and validated evidence list. Menu save bridge keeps its existing signature. Continue during an activated memory transition restores classroom exploration instead of replaying the conference. A completed handoff removes the chapter field and writes the existing S03 `enter` save with laptop/notebook evidence. Storage failures use in-memory state and a visible notice.

## Remaining scope

This sprint ends at the existing S03 flow. S04 founder reveal, rule change, montage and S05/S06 remain future work. Never expose the founder before S04 or rename the 2026 prototype AION. `20:11` is a gratitude motif, not the classroom clock. See `chapter-00-qa.md` for actual validation and current limits.

## Sprint 03 handoff — The One Who Stayed

Runtime mới nằm trong `src/stayed/`, được lồng vào `VerdictSave.stayed` và chạy bởi ChapterGame hiện có. Không tạo router hay canvas riêng cho Chapter 02. `src/cinematic/motifs.ts` là nguồn chung cho insert ghế và sound seed; callback 2046 phải dùng lại motif này. Giữ `StaySave.seen` khi replay để skip các cue đã xem, nhưng không tự điền hai ghi chú/dòng viết.

Checkpoint `phase: next, nextInspected: true` là trang phác thảo mở sang phần thiết kế công nghệ; chưa phải Chapter 03 hoàn chỉnh. Chương kế tiếp cần tiếp tục từ checkpoint này và giữ founder reveal đúng S04. QA và các giới hạn: `docs/chapter-02-qa.md`.

## Sprint 04 — Chapter 03

Nested state mới: `VerdictSave.ripple`. Bắt đầu từ Stayed next/written/read hai note/nextInspected hợp lệ. Tái dựng nguyên tắc → montage ba mốc → hồ sơ 2046 → founder reveal → echo 2026/chair 2046 → ba ký ức → finale. `elapsed` lưu theo giây cho các đoạn timed, `played` chặn phát lại audio khi Continue. Không reset Stayed hoặc tạo shortcut vào chương. `ripple.phase: finale` là FINALE_READY cho sprint cuối; không tự đổi sang Gratitude Galaxy chưa xây. Báo cáo: `docs/chapter-03-qa.md`.

## Sprint 05 — Final Act

`VerdictSave.finale` nhận entry từ Ripple finale đã hợp lệ, qua memory/lesson/question/paper/letter/review/transform/galaxy/closing/ending. `completed` chỉ đặt sau closing. Thư nằm riêng trong `project2011.gratitude.v1`; không thêm vào telemetry/save tiến trình. Mọi public/community feature hiện chưa có. GameShell chỉ được nối callback onMenu/onReplay, không thay thiết kế menu. Camera/audio/renderers dùng lại; FinaleVisual dựng thêm giấy/điểm sáng trên chính scene lab. QA: `docs/final-act-qa.md`.
