# F5.4 — CINEMATIC REVEAL

Ngày 17/11/2026. Phạm vi: Cinematic Reveal + màn hình tri ân cá nhân + camera rời cảnh về ending. Không triển khai backend, Admin hay Public Live Wall. Đây là art procedural có thể chơi, chờ duyệt hình ảnh; không gọi là final production art.

## Đường đi trải nghiệm

1. Từ màn hình review F5.3, người chơi xác nhận bằng action `commit` hiện có. Nhánh giữ im lặng vẫn dùng `skip`.
2. 0–2,4 giây: lời nhắn hiện trên màn hình vật lý; các điểm lấy mẫu từ nét chữ rời màn hình và hội tụ vào dải sáng.
3. 2,4–4,5 giây: camera đi theo hướng dải sáng qua một khoảng tối navy ngắn, chuyển từ căn phòng sang không gian tri ân. Không mô tả đây là du hành thời gian.
4. Đúng giây 5: điểm sáng đến màn hình kiến trúc, đồng bộ với cue `finale.star` có sẵn. Ánh amber tiết chế đi cùng kiến trúc steel/navy/cyan. Không tạo audio context hay cue loop mới.
5. Phần còn lại của 10 giây: camera ổn định, chữ hiện trên màn hình. Sang phase `galaxy`, chữ native DOM bám theo màn hình 3D để đọc rõ trên desktop và mobile.
6. Người chơi có thể đến gần, đọc từng trang, xóa nội dung riêng tư hoặc tiếp tục. Mỗi trang phân theo grapheme, khoảng 4 dòng với ngân sách 28 ký tự/dòng; mọi ký tự và newline được bảo toàn. Không tự chuyển trang. Nếu dùng font/phóng to khiến nội dung dài hơn vùng đọc, vùng chữ vẫn cuộn được.
7. Phase `closing` kéo camera lùi trong đúng 9 giây cũ, chữ lắng xuống; phase `ending` và completion giữ nguyên.

`star`, `galaxy` và các accessible button names cũ được giữ để tương thích. Ngôi sao là điểm sáng của lời tri ân cá nhân trên kiến trúc mới, không còn là toàn bộ cảnh kết thúc.

## Giới hạn quyền riêng tư

Toàn bộ reveal là cục bộ. `audience: public` của F5.3 không làm lời nhắn được đăng hay truyền đi. Màn hình luôn ghi “Chưa công khai”; cảnh sao xa chỉ là môi trường trang trí. Không có trạng thái gửi/duyệt giả, không request POST và không đưa nội dung người chơi vào telemetry/checkpoint.

Khi `choice: skip`, dữ liệu đưa vào cả texture, hạt chữ và DOM được thay bằng thông điệp trung tính; bản nháp cũ dù có trên thiết bị cũng không bị chiếu ra. Xóa thư cập nhật cả nội dung native và texture ở frame tiếp theo. Các trang đọc chỉ là trạng thái UI tạm, không thêm trường vào save.

## Cấu trúc kỹ thuật

Module mới:

- `src/finale/reveal.ts`: timing thuần theo clock hiện có, phân trang không mất dữ liệu, chọn nội dung riêng tư/skip, cập nhật bounds DOM.
- `src/finale/CinematicReveal.ts`: geometry kiến trúc, màn hình, tube/line ribbon, hạt lấy mẫu từ chữ, điểm sáng, camera, chuyển cảnh; sở hữu và dispose tài nguyên riêng.
- `src/finale/RevealFallback.ts`: cảnh Canvas sống với đường sáng, phối cảnh sàn, kiến trúc và cùng trình đọc native.
- `src/finale/RevealControls.tsx`: đọc/trang/inspect/erase/finish qua các action có sẵn.
- `src/finale/cinematic-reveal.css`: style chỉ trong Finale; tách phụ đề và controls ở gallery, giữ palette V5.1.

Ba file source có sẵn được tích hợp bằng patch hẹp: `FinaleVisual.ts`, `Fallback.ts`, `FinaleControls.tsx`. Memory/lesson, Player Room và Letter Experience vẫn dùng đường cũ. Các nhánh memory/paper/ending/credits được guard AST hiện hữu bảo vệ.

Không sửa `state.ts`, `letter.ts`, story/captions, duration, completion flags, ChapterGame, ChapterAudio, AudioDirector, menu/save bridge. Không thêm timer hay render loop. Visual chỉ nhận phase clock từ runtime nên pause, checkpoint resume và reduced motion dùng cùng nguồn thời gian.

Reduced motion giữ camera cố định trong chuyến reveal, bỏ ribbon/hạt bay và màn che chuyển cảnh; chỉ fade chữ/ánh sáng. Khi inspect, camera dùng vị trí đích tức thì. Closing không dolly ở reduced motion. WebGL loss vẫn đi qua cơ chế thay Canvas hiện hữu.

## Kiểm soát thay đổi đồng thời

Workspace không có Git metadata. Trước sửa đã chụp hash tất cả source và lưu nguyên bản Finale tại `finale-f5-4-proof/baseline`; từng file tích hợp được đối chiếu bytes trước khi ghi.

Trong lúc làm, chat khác thay đổi `src/cinematic/ClassroomCinematography.ts` và `src/stayed/stayed.css`. Các thay đổi đó được giữ nguyên. Chúng không phải phần sửa của F5.4. Xem `changed-existing-source.json` và `source-tested-build.json` để phân biệt snapshot. Build dùng thư mục riêng `finale-f5-4-dist`, preview port 4194; không ghi đè dist/build của chat khác.

Guard hash N3/N4 chỉ mở ngoại lệ cho `FinaleVisual.ts` và `Fallback.ts` vì F5.4 được phép thay render. Các assertion camera/geometry của chương khác và state/audio vẫn giữ. Không xóa, skip hoặc hạ assertion cốt truyện. Test F5.3 chỉ bổ sung biến môi trường cho thư mục output để không ghi đè bằng chứng sprint trước.

## QA và bằng chứng

- Typecheck, lint và production build: PASS trên source đã chụp snapshot.
- Unit: 64 tests / 18 files PASS với `npm test -- --maxWorkers=1 --no-file-parallelism`. Một lần chạy mặc định có test AST N3 vượt 5 giây do tải máy; chạy một worker giữ nguyên test và assertion đã qua.
- Reveal tests: pause giữa transform, reload sau cue, không phát cue trùng, đọc/ghép đủ mọi trang, HTML hiện như văn bản, không rò nội dung telemetry, skip không lộ draft, forced WebGL context loss, erase, completion, Menu/Continue và inspect ending.
- Các regression Finale, F5.3, Player Room và reveal chạy trên cùng build cuối: **13/13 PASS**, 0 skipped, 0 flaky, 0 unexpected (6,1 phút). Kết quả chi tiết: `finale-f5-4-proof/final-results.json`.
- Lượt đầu reveal: mobile/fallback/reduced motion pass; desktop vượt tổng budget 90 giây sau khi đã qua context-loss, trong lúc chụp closing. Budget cho bài kiểm tra nhiều lần khởi tạo được đổi thành 180 giây; không đổi assertion. Giữ log đầu ở `reveal-first.json`.
- Ảnh runtime: `runtime/`; video có master audio bus thật: `video/`; phép đo so sánh riêng: `performance.json`.

Mobile là Chromium emulation, chưa phải chứng nhận thiết bị iOS/Android thật. Một số ảnh QA cố ý chứa chuỗi HTML để chứng minh không thực thi; ảnh/video dùng thử riêng dùng lời nhắn minh họa bình thường. Không sinh ảnh concept thay gameplay.

Video `video/cinematic-reveal-with-audio.mp4`: 43,87 giây, 1280×720, H.264/AAC; 1.117 frame runtime đã thu, không thay soundtrack. FFprobe xác nhận cả video/audio; volumedetect xác nhận audio không im lặng (mean −55,8 dB, peak −23,5 dB). Âm lượng giữ nguyên master bus hiện hữu. 24 fps là nhịp xuất video, không phải kết quả benchmark.

Phép đo riêng, tuần tự, không chạy đồng thời với test hoặc ghi hình: desktop Chromium 1280×720, DPR 1, reduced motion, cùng checkpoint gallery, 179 khoảng RAF sau warm-up. F5.3: median 16,7 ms / p95 16,8 ms / 8 draw calls. F5.4: median 16,7 ms / p95 16,7 ms / 26 draw calls. Kiến trúc mới tăng 18 draw calls; cadence vẫn ở khoảng 60 Hz trong mẫu này. Đây là một lần đo RAF bị giới hạn bởi refresh, không chứng minh GPU headroom, không đo cả chuyến transform và không đại diện điện thoại thật. Dữ liệu renderer và telemetry nằm trong `performance.json`.

Sau snapshot build đã kiểm thử, chat khác tiếp tục sửa `src/art/ClassroomArt.ts` và `src/cinematic/WorldRenderer.ts`. Các sửa đó không bị đụng tới và chưa nằm trong build/proof F5.4 này. `changes-after-tested-build.json` ghi nhận khác biệt. Các file Finale vẫn khớp snapshot đã kiểm thử; không tuyên bố QA cho những thay đổi phát sinh sau snapshot.

## Tái lập và duyệt

Build: `npm run build -- --outDir finale-f5-4-dist`.

Preview: `npx vite preview --outDir finale-f5-4-dist --host 127.0.0.1 --port 4194 --strictPort`.

QA: `npx playwright test -c playwright.reveal.config.ts cinematic-reveal cinematic-finale cinematic-letter-experience cinematic-player-room` (đặt các biến output nếu muốn giữ bằng chứng các sprint cũ).

Video: `node scripts/record-cinematic-reveal.mjs`.

Đo cùng checkpoint gallery F5.3/F5.4: `node scripts/measure-cinematic-reveal.mjs` với preview F5.3 ở 4193 và F5.4 ở 4194. Đo RAF cadence, không phải GPU timing hay FPS encode.

Mở browser context dùng thử độc lập: `node scripts/open-reveal-review.mjs`. Không dùng profile/save cá nhân. Từ Player Room, mở máy tính, soạn/xem lại và chọn tạo ngôi sao riêng tư để xem trọn reveal.

Dừng sau F5.4. Không push/deploy; chưa làm backend, Admin hoặc Live Wall. Vật liệu/đạo cụ vẫn là procedural, chưa có authored PBR set hoặc bespoke foley mới. Chờ Product Owner duyệt camera, nhịp chuyển và khả năng đọc.
