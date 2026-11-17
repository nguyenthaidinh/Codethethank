# ARCHITECTURE & ASSETS — PHƯƠNG ÁN LÀM GAME TRONG THỜI GIAN NGẮN

## Stack khuyến nghị (Codex được quyền chọn sau audit)
- React + TypeScript + Vite cho shell, asset loading và giao diện phụ, không dùng route-per-scene.
- Canvas 2D / PixiJS / CSS layered scenes hoặc Three.js/R3F **chỉ khi cần**, không xây 3D nặng cho mọi scene. Ưu tiên runtime 2.5D theo shot với props có thể tương tác và chiều sâu giả lập.
- GSAP / animation timeline hoặc engine tự viết đơn giản cho camera/transition; logic state machine typed riêng (`scene`, `beat`, `interactionGate`, `visitedProps`, `audioEnabled`).
- Web Audio API/Howler cho sound buses/crossfades; tất cả âm thanh local hoặc có giấy phép.
- Backend cho Gratitude Galaxy là **P1**, phiên bản local phải hoạt động độc lập. Nếu có public: endpoint có rate limit/moderation/XSS protection, không phơi secrets.

## Component boundaries
- `GameRuntime`: xử lý player input, scene state, pause/resume, save progress.
- `SceneDirector`: load scene, camera preset/track, beat/event timeline, condition gates.
- `WorldRenderer`: background layers/parallax, props, lighting, particles tối thiểu.
- `CameraDirector`: establish, push, hold, rack-focus, pan; responsive presets.
- `HotspotSystem`: interactive targets có affordance thị giác, keyboard/touch fallback.
- `DialogueDirector`: câu ngắn, phụ đề, portrait optional, log/skip controls.
- `AudioDirector`: bus, cue event, sound gating, fallback, spatial volume.
- `StoryRules`: canon & gating S00..S06, evidence state, An model run, reveal lock.
- `Accessibility`: caption, reduced-motion, high contrast option, keyboard focus, subtitles readable.
- `GalaxyLocal`: local persistent star ending, server integration only when available.

### Data-driven structure example
```
Scene { id, setting, worldAssets, shots[], interactiveProps[], transitions[], captions[] }
Shot { key, type: establish|push|rack|hold|matchcut, cameraFrom, cameraTo, durationMs, soundCues[], waitForInteraction? }
Hotspot { id, boundsResponsive, hint, onFocus[], onActivate[], nextBeat?, keyboardLabel }
GameSave { version, sceneId, beatId, evidenceFlags, soundPrefs, completedScenes }
```
Implementation can adapt this, but all actions should have real consequences in world.

## Asset strategy and quality
- **Bước 1 (proof)**: background môi trường tự dựng đơn giản từ geometry/layers có ánh sáng chuyển động, sprites/props SVG/canvas, mưa particles trước cửa kính, nhân vật simplified silhouettes / poses; ưu tiên âm và camera thật trước photoreal assets.
- **Bước 2 (polish)**: chất liệu 2026 vs 2046 rõ khác biệt, consistent silhouettes, lighting contrast, rain effect, chair action; dùng assets do đội có quyền sử dụng hoặc tự tạo bằng code. Không lấy screenshot ảnh AI được sinh làm scene chạy thật, không cắt ảnh web trái phép.
- Có thể dùng video cutscene ngắn do team tự dựng từ môi trường game nếu scene nặng; không tạo đoạn phim dài bắt người chơi ngồi xem.
- Fallback: WebGL/Canvas không chạy thì bản layered 2D có camera CSS và clickable props; âm thanh lỗi vẫn chơi được.

## Performance budget gợi ý để Codex đo (mục tiêu, không khẳng định đã đạt)
- Scene đầu tiên tương tác được trong khoảng 5 giây trên máy mục tiêu khi asset tải bình thường; prefetch scene kế.
- Target 60 fps desktop, 30 fps mobile; giảm particle/blur theo device preference.
- Không blocking CPU / shader compile tại thời điểm teacher enters.
- Tắt audio, tắt particle, reduced motion, reload mid-game đều giữ nội dung/trạng thái.
- Buttons/hotspots đủ lớn cho chạm; portrait mobile không crop dữ kiện quan trọng hoặc dòng subtitle.

## Không làm
- Landing page thay game; UI navbar/header footer kiểu website; 7 route React trình bày câu chuyện; table reconstruction dashboard chiếm full screen; lấy text làm toàn bộ gameplay.
- Overlay chữ trên 1 ảnh tĩnh, gọi đó là cinematic game.
- Một đoạn phim chạy tự động không tương tác hoặc tự chấm điểm đạo đức; chơi 3D WASD nếu không có thời gian làm polish.
