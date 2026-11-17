# Sprint 04 — Chapter 03: THE RIPPLE

Ngày: 2026-11-16. Phạm vi: Chapter 03 nối Chapter 02 tới checkpoint FINALE_READY; chưa xây Gratitude Galaxy/chương cuối. Các năm 2029/2035/2045 và vị thế AION thuộc thế giới hư cấu của game.

## Gate 1 — Audit và kết nối

Đã đọc README_FIRST, canon V3, director bible, shotlist, âm thanh, kiến trúc/quality gates và đối chiếu văn bản DOCX. `docs/AGENTS.md` có trong repo, root không có AGENTS.md. Repo không có metadata Git. Không thay source menu.

Đã kiểm tra thực tế ChapterGame, nested VerdictSave/Stayed, motif ghế, director, hai renderer, audio và tests. Exit hợp lệ: `phase: chapter02`, Stayed `next`, hai note đã đọc, `written: true`, `nextInspected: true`. Nút **Nối hai câu hỏi** chỉ xuất hiện sau trang phác thảo. Reducer kiểm tra lại điều kiện, không có route/shortcut bỏ qua tương tác. Cùng canvas, renderer và AudioContext tiếp tục chạy; không reload khi chuyển chương.

## Gate 2 — The first change

Cuốn sổ và laptop vẫn trong lớp 2026. Người chơi chạm hai dấu bút, rồi khôi phục `FINAL JUDGMENT → NEXT SUPPORT STEP`. Màn hình laptop vật lý thay đầu ra: dự đoán +5 vẫn còn, thêm xem nhu cầu, giải thích giới hạn và trao đổi cùng giảng viên. Bản Canvas fallback cũng thay nội dung màn hình. Đây là khôi phục lựa chọn thiết kế của An, không đổi kết quả lịch sử hoặc biến prototype thành AION năm 2026.

## Gate 3 — The years between

Ba lần quan sát vật thể, mỗi lần mở một nhịp cinematic và checkpoint:

| Năm | Vật thể / diễn tiến | Hình và âm |
|---|---|---|
| 2029 | Nhật ký thử nghiệm 07 chưa đạt; ghi giới hạn và thử tiếp | Xưởng ít thiết bị, giấy cũ, tiếng giấy và room tone |
| 2035 | Bàn nghiên cứu nhóm, kiểm tra nguyên tắc qua hệ thống rộng hơn | Thêm đồng đội, bàn thí nghiệm và mô phỏng quay chậm; room tone nghiên cứu |
| 2045 | Sổ kiểm thử trước ra mắt AION | Biển dự án xuất hiện, kiểm thử đa lĩnh vực; vài nốt nhạc nhỏ |

Cùng một cuốn sổ lặp lại trên bàn, không timeline web hay dãy card toàn màn. Bản WebGL dựng bằng Three.js sẵn có; fallback dựng bằng Canvas với chuyển động thiết bị/camera tương đương đơn giản hơn.

## Gate 4 — AION 2046

Lab có cửa kính nhìn thành phố, bàn nghiên cứu, đồng đội, thiết bị mô phỏng và thương hiệu Summit từ Chapter 00. AION được giới thiệu là AI đa năng #1 của thế giới hư cấu, có phạm vi khoa học/y tế/giáo dục. Nhân vật founder chưa hiển thị trước reveal. Không API, hologram HUD hay dependency 3D mới.

## Gate 5 — Founder reveal

Chạm hồ sơ trên bàn → đối chiếu hồ sơ An 2026 → khoảng lặng → reveal. Camera xem hồ sơ vật lý rồi chuyển sang An trưởng thành có cùng hình học khuôn mặt và tóc điểm bạc. Thẻ và màn hình đổi thành AN — FOUNDER OF AION đúng phase `reveal`; phụ đề AION xác nhận. Founder state được suy ra từ phase có validation, không dùng local flag rời rạc.

## Gate 6 — The same chair

Nhà nghiên cứu trẻ thất vọng; An đi tới, nhìn ghế. Cut về lớp 2026, cô Vân kéo ghế trong 6 giây, rồi cut sang lab 2046 cùng insert ghế và cử chỉ 6 giây. Cả hai gọi chính `playChairMotif()` của AudioDirector hiện có, cùng buffer có seed 2011. `CHAIR_MOTIF` giữ camera, fov 43, tọa độ từ [2.3,0,.6] tới [1.1,0,.25], drag 1.25s, hold tới 2.6s, sit 1.3s. Âm ghế là foley tổng hợp deterministic, không phải bản thu ngoài đời.

Save ghi `echo.chair` / `chair.chair` trước phát cue. Resume giữ elapsed theo giây và không phát lại cue đã đánh dấu. Nhạc tắt ở insert; mưa chỉ có trong echo 2026, lab dùng âm thiết bị. An chỉ nói “Vậy thì chúng ta xem lại từ đầu.”

## Gate 7 — Human principle

Ba vật thể: hồ sơ đánh giá, chiếc ghế, cuốn sổ. Chạm từng vật làm camera tập trung, đổi phụ đề, phát phản hồi và lưu dấu đã xem. Đủ ba vật mới khớp ký ức; các đường nối hiện trong không gian, AION phân biệt dự đoán với quyền quyết định tương lai con người. Không điểm số đạo đức, không thứ tự đúng/sai.

## Gate 8 — Finale checkpoint

Tờ giấy trắng được đưa ra cạnh sổ. `ripple.phase = finale` là checkpoint FINALE_READY; Chapter 03 hoàn tất về chức năng, lời cảm ơn/chòm sao để sprint cuối. Không tuyên bố game bảy cảnh hoàn chỉnh.

## State và save

`VerdictSave.ripple?: RippleSave` giữ nguyên nested Stayed đã hoàn thành. Các phase: sketch → change → years/milestone ×3 → world → record → align → reveal → approach → echo → chair → reflection → reconstruct → principle → finale. `questions`, `milestones`, `memories`, `selected`, `elapsed`, `played` đều được kiểm tra khi đọc save. Bắt đầu không hợp lệ bị chặn; checkpoint founder/finále thiếu prerequisite bị từ chối. Timed checkpoint tiếp tục từ phần đã qua, không tự cấp vật chứng.

## Gate 9 — Lệnh và kết quả thực tế

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS 24 tests / 7 files |
| `npm run build` | PASS; còn warning chunk >500 kB |
| E2E mới lượt đầu | FAIL ở nút nối chương do chuỗi tiếng Việt bị mã hóa sai; đã sửa source |
| E2E mới lượt tiếp | Desktop PASS toàn chương và recording. Mobile WebGL/fallback đi hết tương tác nhưng FAIL assertion cùng canvas: test lấy tham chiếu trước khi lazy component mount sau reload. Đã thêm chờ canvas render, giữ assertion. Phần kết cũng được cố định left:0; chưa có bằng chứng lỗi tràn ngang thực tế. |
| `npx playwright test tests/e2e/cinematic-ripple.spec.ts --grep 'claimed chair' --trace off` | PASS 1/1: Continue giữa ghế có âm, không phát lại chair cue, hoàn tất bằng bàn phím |
| Bộ E2E mới trên build cuối | PASS 4/4 qua hai lượt: desktop 1/1; mobile WebGL/fallback và audio resume 3/3. Chi tiết ở cuối báo cáo. |
| `npx playwright test --grep-invert Ripple --trace off` | PASS 13/13, 11.2 phút: Chapters 00–02 và legacy/input/mobile/fallback/recording |
| `npx playwright test --config playwright.menu.config.ts --trace off` | PASS 11/11, 22.3 giây: năm viewport, audio, settings, keyboard, Start/Continue và lỗi storage/audio |

## Bundle

So với build cuối Sprint 03: cinematic **579.57 → 597.58 kB** (+18.01 kB, ~3.1%), gzip **149.37 → 155.50 kB** (+6.13 kB). ChapterGame **30.11 → 34.14 kB**, gzip 11.22 → 12.35 kB. Không thêm dependency, asset tải ngoài hoặc dịch vụ. Future scene chỉ dựng khi cần, dùng lại WebGLRenderer/render target/adaptive resolution và dispose cùng runtime. Chưa chứng nhận FPS trên điện thoại thật; browser QA có chi phí render/recording, không coi FPS headless là benchmark thiết bị.

## Files

Thêm `src/ripple/{state.ts,story.ts,RippleControls.tsx,ripple.css,RippleWorld.ts,Fallback.ts}`. Sửa `src/verdict/state.ts`, `src/chapter/{ChapterGame.tsx,ChapterAudio.ts}`, `src/cinematic/{WorldRenderer.ts,FallbackWorld.ts}`. Thêm `tests/ripple.test.ts`, `tests/e2e/cinematic-ripple.spec.ts`. `cinematic/motifs.ts` và AudioDirector được tái sử dụng, không tạo bản sao cue. Docs: báo cáo này, README, qa-report và CINEMATIC_GAME_HANDOFF.

## Chứng cứ và giới hạn

`chapter-03-proof/` chứa ảnh runtime desktop/mobile/fallback và telemetry của lượt cuối. `desktop-live-audio.webm` ghi canvas thật cùng master output của AudioContext; không ảnh AI, không clip dựng. `ffprobe` đã xác nhận VP8 video + Opus audio. Video raw canvas không chứa HUD/phụ đề HTML; ảnh browser có cả UI/subtitle.

Nhân vật procedural low-poly với animation giới hạn, chưa lồng tiếng. Camera và hành động thay lời diễn thuyết; thoại qua phụ đề. Text trên mesh có thể mềm do adaptive resolution. Mobile kiểm bằng Chromium giả lập cảm ứng; chưa Safari/thiết bị thật. Không deploy/push/DNS/credential/chi phí dịch vụ.

### Kết quả Chapter 03 trên build cuối

- Desktop toàn chương + video: PASS (2.2 phút chạy E2E).
- `npx playwright test tests/e2e/cinematic-ripple.spec.ts --grep 'mobile|fallback|claimed chair' --trace off`: **PASS 3/3, 3.5 phút**. Gồm mobile WebGL, mobile không WebGL và Continue giữa ghế có âm/bàn phím. Tổng cộng **4 E2E mới PASS**.
- Lượt mobile cuối xác nhận viewport/scrollWidth 390/390, không overflow. Canvas được giữ trong mỗi phiên giữa các reload chủ động; test đợi canvas mount/render trước khi lấy mốc. Lỗi lượt trước thuộc phép đo canvas, không phải mất checkpoint hay lỗi layout.
- Desktop ghi hai chair cue (echo 2026 và callback 2046), motif ID cùng nhau. Resume giữa callback có `played` và elapsed hợp lệ không ghi thêm chair cue. Hai ký ức đã xem cũng tồn tại sau reload, founder reveal và finale giữ đúng khi Continue.
- `npm run lint` / `npm test` chạy lại sau chỉnh test: PASS, vẫn 24 unit tests.
- Video raw canvas cuối **33.03 giây**, có VP8+Opus, max audio -29.7 dB và mean -47.2 dB qua ffmpeg volumedetect; không silent track. `audio-analysis.txt` ghi số đo. Đã xem frame An trưởng thành ở giây 6 (`video-adult-an-frame.png`, trích từ video, không gọi là screenshot browser).
- Snapshot cuối desktop: 161 draw calls, adaptive resolution .9, chair [1.1,0,.25], motif `chair.the-one-who-stayed`; không phải cam kết FPS trên thiết bị thật.
- Preview dev được mở lại tại port 5173 sau khi kiểm tra server cũ đã dừng. Hồi quy đã chạy trên production preview 4173. Game và video qua HTTP đều trả 200.

### Kết luận Gate 9

**PASS trong phạm vi đã kiểm chứng:** lint, typecheck, production build, **24 unit tests**, **17 gameplay E2E** (4 mới + 13 hồi quy) và **11 menu E2E**. Không phát hiện blocker trong các playthrough có bắt pageerror. Chapter 03 thực sự chơi được từ điều kiện kết Chapter 02 tới FINALE_READY, có hành động, camera, âm thanh, save/resume và fallback. Source runtime không thay đổi sau build và các lượt test cuối; thay đổi còn lại là test/tài liệu.

Menu và Chapters 00–02 được giữ, đã kiểm tra lại các luồng liên quan. `dist/` là build production hiện tại. Chưa xây chương tri ân cuối, chưa kiểm chứng thiết bị thật/Safari và chưa deploy/push.
