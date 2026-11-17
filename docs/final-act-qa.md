# Sprint 05 — Final Act / Chapter 04: THE UNWRITTEN LESSON

Ngày kiểm chứng: 2026-11-16. Mục tiêu: hoàn tất từ FINALE_READY qua thư riêng tư, sao tri ân tới ending; giữ các chapter và menu đã có. Báo cáo này chỉ ghi PASS sau lệnh thực thi.

**Kết quả cuối: PASS** lint, typecheck, production build, **28 unit tests**, **21 gameplay E2E**, **11 menu E2E**. Game chơi được từ menu thật qua Chapters 00–04 tới ending và save completed. Full-game test trên build cuối mất khoảng 5.4 phút; thời gian này gồm chờ thao tác/ghi hình/kiểm tra, không phải nghiên cứu thời lượng với người chơi thật.

## Gate 1 — Audit / entry

Đã kiểm tra ChapterGame, RippleSave/story/controls, RippleWorld/Canvas fallback, nested VerdictSave, hai renderer, ChapterAudio/AudioDirector, CHAIR_MOTIF và các test. Đối chiếu canon V3/source extract S05–S06 và yêu cầu Sprint 05. Không có backend cộng đồng hoặc API đang dùng trong runtime.

Điểm vào thật: `VerdictSave.ripple.phase = finale`, đủ hai câu hỏi, ba mốc phát triển và ba ký ức; Stayed đã đọc hai note, viết dòng cuối, xem trang phác thảo. Reducer `begin-finale` kiểm tra lại prerequisite. Người chơi chạm tờ giấy trong lab để mở Final Act. Không thêm route nạp checkpoint vào sản phẩm.

## Gate 2 — Last memory

Giữ RippleWorld và renderer hiện có. FinaleVisual dựng trên scene lab, dùng chính tờ giấy cuối Chapter 03. Camera từ giấy kéo ra để thấy hồ sơ, sổ và ghế; có mưa rất nhỏ trở lại trên nền lab. Reduced motion loại chuyển động kéo dài ở shot mở. Không phát lại toàn cue ghế.

## Gate 3 — The lesson / question

Thoại AION tách trong `finale/story.ts`, có khoảng lặng. Ba shot callback hồ sơ → ghế → An và người trẻ, rồi về giấy để hỏi người chơi. Dự đoán không quyết định tương lai; cách cô Vân ngồi lại được nối với hành động của An, không hứa thành công và không gán cho AION cảm xúc như con người. Phụ đề là thoại chính, chưa có voice actor.

## Gate 4 — Letter

Tờ giấy là mesh trong lab, texture Canvas hiện nét chữ; UI ngữ cảnh có cùng màu giấy và dòng kẻ, không đổi sang trang contact form. Recipient/message đều tùy chọn; giới hạn 60/500 Unicode code points. IME được giữ nguyên trong composition, chỉ normalize giới hạn khi kết thúc composition. Enter trong textarea là xuống dòng, không tự gửi. Có ba gợi ý nguyên bản, bước đọc lại trước khi tạo sao, sửa và bỏ qua.

Bản nháp mặc định lưu riêng trên thiết bị, được ghi rõ cạnh checkbox và có thể bỏ chọn để chỉ giữ trong phiên. Không có nút đăng công khai. Nội dung nằm riêng ở `project2011.gratitude.v1`, không đặt trong FinaleSave, telemetry hoặc request mạng. React/Canvas hiển thị dạng text, không diễn giải HTML. Nút **Xóa nội dung đã lưu** xóa bản cục bộ và dữ liệu trong phiên; nếu không xóa được, runtime báo trung thực.

## Gate 5 — Ink to star

Chữ hiện trên giấy vật lý; 64 điểm sáng hội tụ rồi đi lên cùng một điểm sáng, camera theo ánh sáng trong scene hiện có. Lab tối dần và rời khung, sao xa xuất hiện có chiều sâu. Không page reload hoặc cut sang trang khác. Nhánh skip dùng ánh sáng cho bài học, không tạo thông điệp cá nhân giả. `starCue` lưu trước phát chime để không lặp khi Continue.

## Gate 6 — Gratitude Galaxy

460 sao xa procedural, bảng màu xanh tối/vàng nhạt, một sao riêng làm trọng tâm. Người chơi focus sao, xem thư riêng tư đã lưu hoặc thông báo nhánh bỏ qua, rồi tiếp tục ending. Sao nền được ghi rõ là cảnh nền, không phải hoạt động cộng đồng. Canvas fallback giữ giấy/ánh sáng/sao và tương tác tương ứng.

**Community status:** LOCAL ONLY. Không backend, không moderation/public feed, không realtime, không API tự đặt, không đăng tự động. Nếu storage không ghi được, lời nhắn chỉ ở phiên hiện tại và UI nói đúng trạng thái. Không cần đăng nhập/credential/mạng.

## Gate 7 — Ending / credits

Camera lùi, khung cửa sổ gợi lại lớp 2026, hai câu kết có khoảng lặng; title chính **THE UNWRITTEN LESSON**. Return to Menu unmount runtime và dispose audio/renderer; Replay tạo lượt mới qua Chapter 00, giữ lựa chọn menu và không tự xóa lời tri ân riêng. Xem lời cảm ơn trở lại sao; Credits có dialog, focus trap và Escape đóng/khôi phục focus.

Credits nêu procedural art/audio, không giả diễn viên; React/Three.js/Vite MIT đã đối chiếu license local. Không thay bố cục menu; chỉ thêm callback từ ChapterGame vào GameShell.

## Gate 8 — State / resume

`VerdictSave.finale?: FinaleSave` là nguồn sự thật duy nhất cho tiến trình đoạn kết. Phase: memory → lesson → question → paper → letter/review hoặc skip → transform → galaxy → closing → ending. `elapsed` checkpoint timed theo giây, `choice`, `starSeen`, `starCue`, `completed` được validate. `completed` chỉ được đặt sau closing, hoặc giữ khi xem lại sao từ ending. Save cũ không có FinaleSave tiếp tục tại tờ giấy.

Thư được đọc/lưu riêng, không nhúng trong main save hoặc telemetry. Bỏ chọn lưu giữ dữ liệu trong phiên; reload vẫn ở đúng letter nhưng nội dung chưa lưu không được hứa sẽ tồn tại. Save completed Continue mở ending, không chạy lại transformation/chime. Replay là hành động rõ ràng tại ending. Xóa thư không xóa tiến trình game.

## Gate 9 — Lệnh thực tế

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | Ban đầu FAIL prefer-const/unused import; đã sửa, lượt sau PASS |
| `npm test` | PASS 28 tests / 8 files |
| `npm run build` | PASS; còn Vite warning chunk >500 kB |
| `npx playwright test tests/e2e/cinematic-finale.spec.ts --trace off` — lượt đầu | PASS 2/2: desktop letter/IME/resume/erase/credits/menu/replay và mobile fallback skip/offline |
| Build cuối + Finale/Fullgame suite | PASS: desktop thư/IME/resume; mobile fallback skip; mobile touch 360px với storage/audio bị chặn; full game từ menu thật tới ending 5.4 phút. Không seed checkpoint trong full-game test. |
| Hồi quy Chapters 00–03 | PASS toàn bộ. Tổng gameplay **21/21** trên cùng build cuối, gồm 4 kết quả giữ từ lượt bị ngắt và 17 test được runner hoàn tất theo nhóm. |
| `npx playwright test --config playwright.menu.config.ts --trace off` | PASS **11/11**, 21.6 giây, gồm 5 viewport, Start/Continue, audio, settings, focus và lỗi storage/audio. |

Unit mới kiểm tra entry thiếu prerequisite, review trước commit, nhánh skip, completion, cue checkpoint/idempotence, bỏ field cá nhân khỏi save và giới hạn Unicode không cắt surrogate pair.

## Build / hiệu năng

Không thêm dependency. So Sprint 04: cinematic **597.58 → 605.98 kB** (+8.40 kB, ~1.4%), gzip **155.50 → 157.81 kB** (+2.31 kB). ChapterGame **34.14 → 44.98 kB**, gzip **12.35 → 15.64 kB**. Stars/particles dùng Points ít draw calls; sky ẩn lab. Renderer/render target, audio buses, adaptive resolution và disposal được giữ. Chưa chứng nhận FPS trên điện thoại thật.

## Files

Thêm `src/finale/{state.ts,story.ts,letter.ts,FinaleControls.tsx,finale.css,FinaleVisual.ts,Fallback.ts}`. Sửa `src/verdict/state.ts`, `src/chapter/{ChapterGame.tsx,ChapterAudio.ts}`, `src/ripple/RippleWorld.ts`, `src/cinematic/{WorldRenderer.ts,FallbackWorld.ts}`, `src/menu/GameShell.tsx`. Thêm `tests/finale.test.ts`, `tests/e2e/{cinematic-finale.spec.ts,cinematic-fullgame.spec.ts}`, `scripts/resume-final-qa.ps1`. Tài liệu: báo cáo này, README, QA report, handoff và `production-final-act.md`.

## Chứng cứ / giới hạn

`docs/final-act-proof/`: ảnh browser desktop/mobile/fallback, telemetry đã loại nội dung thư và video raw canvas/audio của lượt toàn game cuối. Chuỗi `<script>` trong một số ảnh là payload QA có chủ đích, không phải lời nhắn người dùng; được hiển thị như văn bản. Video fullgame dùng gợi ý sạch, không chứa dữ liệu cá nhân thật.

Chứng cứ xem nhanh: [ending desktop](final-act-proof/full-game-ending.png), [ngôi sao và thư riêng tư](final-act-proof/full-game-galaxy.png), [ending mobile fallback](final-act-proof/fallback-05-ending.png), [mobile 360px khi lỗi storage/audio](final-act-proof/360-storage-audio-failure.png), [video có âm](final-act-proof/finale-live-audio.webm), [tổng kết máy đọc được](final-act-proof/qa-summary.json).

Art procedural low-poly, cử động nhân vật giới hạn, chưa lồng tiếng. Mobile/IME được kiểm bằng Chromium emulation và composition events; chưa chứng nhận bàn phím IME hệ điều hành/Safari/điện thoại thật. Không có backend công khai. Dữ liệu cục bộ bị mất khi xóa dữ liệu trình duyệt; người chơi có thể chọn không lưu. Build ở dist/, không deploy/push/DNS hay dịch vụ trả phí.

### Cập nhật kiểm thử sau khi tiếp tục

Bộ test nền trước đó bị dừng khi phiên công cụ kết thúc, nên không dùng lượt hồi quy dở dang để kết luận PASS. Đã chạy lại lint/typecheck/28 unit/build thành công. Phụ đề lesson được chia thành hai nhịp cuối và tăng thời gian đọc (lesson 20s, question 8s); camera callback đồng bộ. ChapterGame cuối 45.00 kB, gzip 15.64 kB.

Lượt bị ngắt giữ được 4 PASS trong `gameplay-regression.log` (3 Chapter 00 + desktop Final Act). `scripts/resume-final-qa.ps1` hoàn tất 17 gameplay test còn lại và 11 menu test theo nhóm, với `runner-status.json` ở trạng thái **complete / passed / exitCode 0**. Các log: `finale-touch-and-fallback.log` (2), `full-game.log` (1), `legacy-input.log` (1), `legacy-mobile.log` (2), `ripple.log` (4), `stayed.log` (3), `verdict.log` (3), `legacy-recording.log` (1), `menu.log` (11). Tổng gameplay 4 + 17 = 21, không tính lặp các lượt trước.

Video cuối `finale-live-audio.webm`: **25.23 giây**, VP8 + Opus, âm thanh có tín hiệu (max -23.4 dB, mean -55.9 dB), đã kiểm bằng ffprobe/ffmpeg. Video ghi canvas/master bus thật, không chứa subtitle/HUD HTML; ảnh browser có UI/phụ đề. Full-game test xác nhận cùng canvas từ đoạn điều tra tới ending, một navigation, một cue sao và không có pageerror. Các test riêng xác nhận IME composition, khôi phục bản nháp, không đưa message vào telemetry, không thực thi HTML, xóa local, skip/offline và resume completed không phát lại cue.

Đã xem ảnh desktop/mobile/fallback và video/frame của ending; preview game/video trả HTTP 200 tại port 5173. `dist/` là build production đã kiểm tra. Không còn blocker trong phạm vi đã test; các giới hạn thiết bị/voice/community ở trên vẫn áp dụng. Không deploy/push hoặc thay hạ tầng.
