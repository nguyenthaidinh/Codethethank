<!-- CHAIR_CINEMATIC:START -->
# Đã kiểm chứng — classroom cinematic pass

Typecheck, lint, production build, **43 unit PASS; 30 kịch bản E2E đạt ở kết quả cuối**: 19 gameplay/chair/voice/resume/typography/mobile + 11 menu. Hai kiểm tra ban đầu sai thời điểm chờ (cut thay dolly, tải lazy lạnh ở menu) được chỉnh và chạy lại phần liên quan trên cùng build; giữ nguyên log lần đầu. Không có case lỗi chưa xử lý. Có lượt menu → Credits trên bản build mới.

[Chơi game](http://127.0.0.1:4173/) · [Review trước/sau](http://127.0.0.1:5173/docs/chair-cinematic-proof/review.html) · [Video runtime 31.1s](chair-cinematic-proof/runtime/chair-cinematic.mp4) · [Kết quả/hash build](chair-cinematic-proof/verification.json).

Kiểm tra mới ghi lại insert → động tác ngồi → khung thoại trên desktop WebGL, mobile touch/reduced motion và Canvas. Đo vị trí đầu, silhouette laptop và vùng đọc; kiểm tra ghế phát một lần, bàn phím Enter/tap tiếp lời và không có request giọng trong lớp học. Hồi quy gồm hoàn tất Chapter 02, notebook/reload/replay, hành trình đầy đủ, giới hạn narrator 7 câu và font tiếng Việt.

71/76 file nguồn trước sửa giữ nguyên, 5 file tích hợp đổi, thêm một module camera. Các file speech, toàn bộ MP3 opening, tạo hình, story/reducers, logo và `CHAIR_MOTIF` giữ nguyên hash. Bản renderer chỉ đổi góc/nhịp camera và diễn xuất bằng rig cũ.

CinematicGame JS 739,799 → 742,498 byte; cảnh báo chunk >500 kB của Vite vẫn còn. Có một đèn hắt không đổ bóng; không thêm model/texture/dependency. Chưa đo lại hiệu năng thiết bị thật.

Video H.264/AAC lấy trực tiếp frame CDP và master audio bus, có tiếng mưa/ghế và **0 câu đọc**; 872 frame thu được. 24 fps là nhịp mã hóa, không phải cam kết tốc độ render. Lệnh/timestamp/hash trong [qa-execution.json](chair-cinematic-proof/qa-execution.json), output logs cùng thư mục.

Chưa kiểm chứng Safari/iOS, điện thoại thật hoặc playtest người dùng; art vẫn cần Product Owner đánh giá. Không deploy/push hoặc mở Gate 3.
<!-- CHAIR_CINEMATIC:END -->

# Classroom cinematic pass — cô Vân ngồi cạnh An

Phạm vi: camera, chuyển động tay/đầu trên rig hiện hữu và UI đọc trong lớp học. Cốt truyện, thời lượng, tiến trình và checkpoint giữ nguyên. Giọng đọc vẫn chỉ có 7 câu người dẫn đầu game.

| Mốc trong beat ghế | Khung hình / diễn xuất |
|---|---|
| 0–1,25 s | Cắt ngay vào góc thấp `CHAIR_MOTIF`, ghế di chuyển cùng tiếng kéo. |
| 1,25–2,6 s | Giữ góc thấp và khoảng lặng sau đuôi âm thanh. |
| 2,6–3,9 s | Cắt sang khung hai người, camera đứng yên để thấy cô hạ người xuống ghế. Tay rời lưng ghế về bàn; An bớt giữ tư thế gõ. |
| 3,9–5,7 s | Tiến nhẹ sau khi đã ngồi vững; ánh hắt ấm tăng nhẹ, cô nhìn sang An. |
| 6 s → câu hỏi | Nối vào khung thoại; dùng cut khi đổi người nói, giữ máy khi nghe. |

Mốc kéo ghế, tiếng ghế, camera insert và motif 2046 không đổi. Camera mới áp dụng cho classroom chính; cảnh echo giữ renderer riêng. Reduced motion dùng khung tĩnh/cut; Canvas cũng chuyển khỏi góc thấp để thấy hai người.

UI giữ lời thoại, thu nhỏ chỉ dẫn âm thanh trong ngoặc vuông, giảm độ nổi của controls trong nhịp ghế nhưng vẫn bấm/focus được. Câu mới fade ngắn, tắt khi reduced motion. Enter/Space tiếp lời nếu không focus nút/ô nhập; nút Tiếp lời và tap được giữ lại.

Nguồn thay đổi: `ClassroomCinematography.ts`, `WorldRenderer.ts`, `FallbackWorld.ts`, `SceneChrome.tsx`, `src/art/narrative.css`, `ChapterGame.tsx`. Không tạo hay sửa model nhân vật; đây là đạo diễn và diễn xuất bằng rig đang có.

Snapshot: `chair-cinematic-proof/before-source.zip`, `before-hashes.json`; ảnh trước ở `before/`, ảnh/video sau ở `runtime/`. Ảnh đều lấy từ browser thật. Lần xem runtime đầu phát hiện laptop che mặt An dù đầu nằm trong viewport; đã đổi góc và thêm kiểm tra silhouette laptop.

Đã kiểm chứng production bằng `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `node scripts/run-chair-qa.mjs`, và ghi hình bằng `node scripts/record-chair-cinematic.mjs`. Hai kiểm tra cần chỉnh cách chờ được chạy lại qua `continue-chair-qa.mjs` và `finish-chair-menu-qa.mjs`; log gốc được giữ nguyên. Kết quả cuối nằm ở đầu báo cáo và `chair-cinematic-proof/coverage.json`. Điện thoại thật, Safari và playtest người dùng chưa được kiểm chứng.
