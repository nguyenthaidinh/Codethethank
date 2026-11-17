<!-- OPENING_REFINEMENT:START -->
# Đã kiểm chứng bản chỉnh sửa

**41 unit + 27 E2E PASS**: 16 gameplay/voice/camera/IME/fallback/typography + 11 menu; zero skipped/flaky/unexpected. Typecheck, lint và production build PASS. Menu → Credits chạy lại trên build mới; không dùng kết quả cũ.

Lời dẫn thực sự phát ở opening; từ câu AION cuối opening, điều tra, lớp học và mọi cuộc trò chuyện đều không phát giọng. Test quan sát request MP3 và audio state; cả desktop/touch có subtitles và đầu nhân vật nằm trong khung, phía trên vùng đọc.

[Chơi game](http://127.0.0.1:4173/) · [So sánh trước/sau](http://127.0.0.1:5173/docs/opening-readability-proof/review.html) · [Video runtime 30.8s](opening-readability-proof/runtime/voice-scene.mp4) · [Kết quả/hash build](opening-readability-proof/verification.json). Video phòng học có mưa/ghế nhưng **0 câu đọc**, thu trực tiếp từ audio bus.

Bảy MP3 còn 210,329 byte; giảm 2,653,124 byte asset tiếng nói. 99 file cũ được chuyển nguyên hash vào lịch sử, không còn trong production. CinematicGame JS 744,518 → 739,799 byte; cảnh báo chunk >500 kB của Vite còn tồn tại. PNG logo gốc, tạo hình, motif và reducers cốt truyện giữ nguyên hash.

Lệnh cụ thể và timestamp trong [qa-execution.json](opening-readability-proof/qa-execution.json). Đã chạy thêm `node scripts/record-opening-refinement.mjs` để ghi hình và `node scripts/finalize-opening-refinement.mjs` để đối chiếu hash/media. Không đo hiệu năng/duyệt art trên thiết bị thật; Safari/iOS và playtest người dùng chưa kiểm chứng. Không deploy/push hoặc mở Gate 3.
<!-- OPENING_REFINEMENT:END -->

# Chỉ đọc lời dẫn mở đầu · chỉnh logo, UI và góc quay

Yêu cầu Product Owner ngày 17/11/2026 thay thế phạm vi lồng tiếng trước đó. **Chỉ người dẫn trong phần giới thiệu 2046 có giọng đọc.** AION, An, cô Vân và các cuộc trò chuyện về sau dùng phụ đề. Mưa, quạt, chuông, bước chân và motif ghế giữ nguyên.

## Thay đổi trải nghiệm

- Chính sách `openingNarration` chỉ cho phép 7 câu có speaker `NGƯỜI DẪN`, từ đầu game đến trước mốc 48 giây. Câu AION cuối opening và mọi câu sau đó không được đọc. Bỏ qua opening cũng huỷ câu đang phát.
- Cài đặt đổi tên thành **Giọng dẫn mở đầu**, độc lập với phụ đề và mute. Không thay schema save.
- Bỏ 99 clip hội thoại/clip không dùng khỏi `public/`; chuyển vào `docs/voice-school-proof/retired-dialogue/` để giữ lịch sử và khả năng khôi phục. Production chỉ chứa 7 clip opening. Collector/generator theo cùng phạm vi.
- Logo PNG gốc được giữ nguyên byte. Thay mặt phẳng vuông bằng hình tròn theo mép xanh; Canvas dùng clip tròn tương đương. Nền trắng ở bốn góc không còn xuất hiện.
- Camera đối thoại từ góc 72° rất gần chuyển sang góc hai người 45° ở khoảng cách xa hơn, có foreground cuốn sổ/laptop. Góc cận An đứng phía trước mặt phẳng laptop để tránh mảng đen che nhân vật. Có preset riêng cho khung dọc.
- Tên người nói thành một dòng nhỏ, lời thoại thành khối đọc riêng phía dưới nhân vật. Thêm gradient nhẹ dưới khung hình, nút Tiếp lời tách khỏi phụ đề, icon âm thanh/pause dạng SVG. Font tiếng Việt vẫn dùng LessonSerif/Noto Serif.

Đây là chỉnh sửa phần trình bày trên runtime hiện có. Không sửa lời thoại/cốt truyện, tạo hình nhân vật, điều kiện tiến trình, motif ghế, Main Menu art hay kiến trúc AION. Không mở Gate 3.

## Source of truth

| Phần | Nguồn |
|---|---|
| Giới hạn lời đọc | `src/speech/policy.ts`, `src/speech/catalog.json`, `scripts/collect-voice.ts` |
| Tích hợp/tắt giọng ở quá khứ | `src/chapter/ChapterGame.tsx`, `src/cinematic/CinematicGame.tsx` |
| Khung thoại/icon | `src/cinematic/SceneChrome.tsx`, `src/art/narrative.css` |
| Góc máy desktop/mobile | `src/cinematic/WorldRenderer.ts` |
| Logo tròn | `src/art/ClassroomArt.ts`, `src/cinematic/FallbackWorld.ts` |
| Tên cài đặt/ghi công | `src/menu/MenuUI.tsx`, `src/finale/FinaleControls.tsx` |

Snapshot trước sửa: `opening-readability-proof/before-source-assets.zip`; ảnh trước ở thư mục `before/`. Asset ghi nguồn trong `public/school/PROVENANCE.txt` và `public/voice/vi/ATTRIBUTION.txt`.

## Kiểm chứng

Đã kiểm tra bản production mới bằng `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `node scripts/run-opening-refinement-qa.mjs`. Kết quả cuối và media nằm ở đầu báo cáo. Không tính kết quả bản có 106 câu đọc trước đây cho thay đổi này.
