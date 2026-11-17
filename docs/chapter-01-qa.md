# Gameplay Sprint 02 — Chapter 01: The Verdict

Ngày 16/11/2026, Asia/Saigon. Phạm vi: nối Chapter 00 → điều tra/kiểm thử/đối chiếu → cinematic cô Vân → mở đầu Chapter 02. Không chứng nhận toàn bộ game bảy cảnh.

## Gate 1 — Audit và điểm nối

Đã đọc Story Canon V3, Game Director Bible và Cinematic Game Handoff; kiểm tra scene controller, renderers, audio, save và các test đang chạy. Trước sprint, `NEXT_SCENE_READY` tháo ChapterStage rồi mở legacy CinematicGame tại `enter`, cô Vân đến trước thao tác thử An. Sprint 02 yêu cầu thứ tự mới: An chạy thử, người chơi điều tra, rồi cô Vân xuất hiện. **Yêu cầu Sprint 02 mới được ưu tiên cho tuyến gameplay này**; tài liệu canon gốc và đường legacy `/?qa=1` vẫn giữ để đối chiếu.

Điểm nối mới giữ nguyên ChapterStage, instance WorldRenderer/FallbackWorld, canvas, AudioContext và thời gian mưa. Không đổi URL/reload, không dựng lại menu. Trạng thái `ChapterSave.verdict` nằm trong save hiện có. Save S02–S03 cũ vẫn được Continue bằng runtime legacy.

## Gates 2–6 — Triển khai

| Gate | File thay đổi / hành vi | Kiểm chứng |
|---|---|---|
| 2: Ba vật chứng | `src/verdict/evidence.ts`; thêm sổ vật lý, camera/anchor `notes` trong WorldRenderer và fallback. Bản thuyết trình, sổ thiết kế, dữ liệu laptop đều focus camera và phát foley. | Browser chọn đủ ba vật, unit gate không cho mở mô hình khi thiếu vật chứng. |
| 3: Run the Evaluation | `rules.ts`, `state.ts`, `screen.ts`, `VerdictControls.tsx`, `verdict.css`. Chọn MAI/MINH/AN trên laptop; yếu tố đã dùng và nhu cầu chưa dùng được trình bày rõ; chạy 1.8 giây có progress/keyboard/animation. | Unit cùng luật cho mọi hồ sơ; browser dùng MAI trên desktop và MINH trên mobile, sau đó AN. |
| 4: An bị từ chối | `story.ts`, camera `an`, ChapterStage sequencing. Sau một hồ sơ mẫu và ba vật chứng mới mở AN. Màn hình ghi STUDENT: AN, YEAR: 2026, EVALUATION: NOT RECOMMENDED. Camera rời laptop, An cúi đầu, duck ambience, giữ im lặng trước thoại. | Assertion camera/teacher hidden/head tilt/mix 0.18, cue verdict đúng một lần. Góc camera đầu bị đèn che mặt, đã sửa sau xem ảnh browser. |
| 5: Missing Context | Chọn vật chứng vật lý rồi đối chiếu với kết quả trên laptop. Mỗi liên kết hiện ý nghĩa trong 4 giây; hai vật chứng **khác nhau** mở exit. Không điểm đạo đức, không phạt lựa chọn. Hint sau 10 giây không tiến triển hoặc nút `?`. | Unit chặn kết nối trùng; mobile reload sau một liên kết rồi dùng vật chứng khác, giữ tested/found/linked. |
| 6: Cô Vân / Chapter 02 | `ChapterGame.tsx` dùng lại actor/camera/audio: wide → bước chân/cửa → cô Vân hỏi “An, em vẫn chưa về sao?” → Chapter 02 bắt đầu bằng cô kéo ghế và câu hỏi canon. | Browser xác nhận teacher chỉ visible sau hai liên kết, chair cue một lần, cùng canvas/audio context. Không nút Next Chapter. |

## Luật giả lập có thể kiểm tra

Đây là quy tắc minh họa **của thế giới game**, không phải mô hình đánh giá giáo dục thực tế. Dự đoán cải thiện = làm tròn `0.65 × tiến bộ trước đây + 0.10 × mức học đều (%)`; ngưỡng ưu tiên là +12 điểm.

| Hồ sơ | Tiến bộ trước đây | Học đều ghi nhận | Dự đoán | Kết quả |
|---|---:|---:|---:|---|
| MAI | +14 | 90% | +18 | RECOMMENDED |
| MINH | +4 | 40% | +7 | NOT RECOMMENDED |
| AN | +3 | 35% | +5 | NOT RECOMMENDED |

Nhu cầu hỗ trợ được hiển thị riêng và cố ý chưa đi vào quy tắc. Các thiếu sót về hoàn cảnh/nỗ lực được ghi trong vật chứng. Kết quả không kết luận giá trị hay tương lai của nhân vật. Không logo AION trên prototype 2026, không lộ danh tính An năm 2046.

## Gate 7 — Kết quả thực tế

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS 18 tests / 5 files |
| `npm run build` | PASS. Chunk cinematic ~574.5 kB, ~147.7 kB gzip; vẫn lazy load, có warning kích thước. |
| `npx playwright test cinematic-verdict.spec --trace off` — lượt đầu | PASS 3/3: desktop xuyên Chapter 00–01–02, mobile touch/mute/reduced motion/hint/reload, fallback WebGL/audio/storage. |
| Cùng suite trên build cuối sau sửa camera/chữ/hint | PASS 3/3, 3.5 phút; ảnh cuối đã xem lại desktop và mobile |
| `npx playwright test cinematic-chapter.spec cinematic-input.spec cinematic-mobile.spec cinematic.spec --trace off` | PASS 7/7, 5.9 phút trên build cuối: Chapter 00 → Chapter 01, Continue, drag/drop, keyboard/offline, mobile, no-audio/storage/WebGL và legacy slice đến complete |
| `npx playwright test --config playwright.menu.config.ts --trace off` | PASS 11/11, 21.4 giây: audio/autoplay, Start/Continue legacy, settings, fallback assets/storage/audio, năm viewport |

Hai lượt desktop đo nhánh chính Chapter 01 khoảng **57–67 giây** (lượt cuối 56.9 giây), bao gồm thao tác và chờ kiểm thử. Người chơi đọc/khám phá tự do có thể lâu hơn. Đây là thời gian lượt tự động, không phải nghiên cứu thời lượng trên người chơi thật; gần nhịp mục tiêu 60–90 giây.

## Chứng cứ

`docs/chapter-01-proof/`: ảnh browser thật `01-sample-result.png`, `02-an-reaction.png`, `03-comparison.png`, `04-teacher-arrival.png`, `05-mobile-reaction.png`, `06-mobile-chapter02.png`, `07-fallback.png`; `desktop-telemetry.json` lưu state, camera, actor visibility, cue/audio mix và thời lượng. Test desktop kiểm tra cùng một canvas và cùng AudioContext từ trước Chapter 01 đến Chapter 02; document chỉ navigation một lần.

Không dùng screenshot để thay thế test: reducer/model có unit tests; E2E thực hiện đầy đủ hành động đến checkpoint Chapter 02, kiểm tra cue/điều kiện unlock/resume và bắt pageerror.

**Kết luận Gate 7:** PASS chức năng trong phạm vi kiểm thử — 18 unit tests, 10 E2E gameplay (3 Chapter 01 + 7 hồi quy), 11 E2E menu. Không pageerror ở các playthrough có assertion bắt lỗi. Ảnh phản ứng cuối đã xác nhận mặt An không bị đèn che trên desktop/mobile. Không sửa source Main Menu trong sprint này. Preview `http://127.0.0.1:5173/` đã trả HTTP 200; chọn hành trình mới để trải nghiệm tuyến mới. Không thay code sau build và các lượt kiểm tra cuối, chỉ cập nhật tài liệu.

## Giới hạn bàn giao

- Chapter 02 đã có **phân cảnh mở đầu** (cô Vân tới/kéo ghế/hỏi), chưa phải toàn bộ Chapter 02 hoặc các chương sau.
- Art vẫn là procedural 3D/2D; chưa có diễn viên lồng tiếng. Âm thanh là tổng hợp hợp lệ, thoại qua phụ đề.
- Chưa chứng nhận FPS trên GPU/điện thoại thật hay Safari. Desktop/mobile là Chromium giả lập; hình và chữ trên mesh có thể mềm khi render tự hạ độ phân giải. Thông số cần đọc có thêm chữ rõ trong vùng điều khiển laptop, không bảng dashboard.
- Skip chỉ rút ngắn đoạn giữ cảm xúc sau ít nhất hai giây; không bỏ qua đánh giá hoặc tự tạo vật chứng/liên kết.
- Build nằm ở `dist/`; không deploy/push, không dịch vụ trả phí hoặc credential.
