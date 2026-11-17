# F5.3 — LETTER EXPERIENCE

Ngày: 17/11/2026. Phạm vi: soạn lời tri ân, xem trước, chỉnh sửa, lưu riêng tư và xác nhận lựa chọn công khai. Không triển khai F5.4–F5.8, backend, Admin hay Live Wall.

## Trải nghiệm đã xây

- Máy tính Player Room dẫn vào giao diện soạn thư. Camera/âm thanh giữ vòng đời hiện có; focus nhập liệu đợi camera tiến xong, hoặc tức thì khi bật reduced motion.
- Desktop: form và bản xem trước cạnh nhau, cuộn độc lập để không mất preview khi chỉnh các trường cuối.
- Mobile: Soạn lời nhắn / Xem trước; vùng nội dung cuộn, thanh hành động cuối luôn nhìn thấy, bố cục theo dynamic viewport.
- Người nhận tối đa 60 code points, lời nhắn 500, tên hiển thị 40. Giữ cơ chế NFC và không cắt surrogate pair của phiên bản trước. IME không bị cắt trong lúc composition; review/ghi nháp/gợi ý bị khóa tạm thời khi đang ghép chữ.
- Tên hiển thị hoặc bút danh là tùy chọn. Preview dùng tên trung tính khi bỏ trống; tên đã nhập xuất hiện trong ngôi sao riêng tư.
- Có lưu nháp riêng tư, tắt lưu trên thiết bị, xóa nội dung và tiếp tục phiên chơi không cần storage.
- Chọn công khai dẫn tới bước đọc lại và checkbox xác nhận theo nội dung hiện tại. Thiếu người nhận/lời nhắn không thể xác nhận công khai. Có thể quay lại sửa hoặc đổi sang riêng tư.

## Giới hạn công khai phải hiểu đúng

Dịch vụ gửi công khai chưa mở. Xác nhận trong F5.3 chỉ xác nhận lựa chọn ở giao diện, **không gửi dữ liệu, không tạo bài đăng, không tạo trạng thái PENDING/APPROVED và không tự gửi về sau**. UI nêu rõ điều này. Người chơi vẫn có thể tạo ngôi sao riêng tư và hoàn thành game.

`audience` được lưu như một sở thích cùng bản nháp khi bật lưu cục bộ. Checkbox và xác nhận theo nội dung chỉ sống trong component: mất khi sửa, reload hoặc pause/unmount. Không có consent token lưu trên thiết bị. Khi F5.5 có API, phải lấy xác nhận gửi mới; không được xem `audience: public` là quyền tự động đăng.

## Kiến trúc và tương thích

- `src/finale/LetterExperience.tsx`: form, live preview, review, lựa chọn/confirmation. Không có fetch, XHR hay side effect mạng.
- `src/finale/letter-experience.css`: giao diện navy/steel/cyan/ivory; không ghi đè menu, các chương hay renderer chung.
- `src/finale/letter.ts`: thêm hai field optional `displayName`, `audience`; giữ nguyên key `project2011.gratitude.v1` và version 1. Bản nháp cũ đọc được với tên trống và audience private. Normalizer chỉ xuất các field được phép, loại bỏ consent/submitted giả trong storage.
- `src/finale/FinaleControls.tsx`: thay hai nhánh letter/review bằng component mới; bổ sung chữ ký ở ngôi sao. Giữ nguyên progression actions, completion, menu, credits và nhánh bỏ qua.
- Không chỉnh `state.ts`, game save/checkpoint, ChapterAudio, AudioDirector, camera/geometry Player Room hay Chapters 00–04.

## Bảo vệ công việc đồng thời

Trước sửa đã lưu source hash và bản đối chiếu tại `finale-f5-3-proof/baseline`. Khi phát hiện câu ending trong `FinaleControls.tsx` được chat khác sửa, phần sửa đó được giữ nguyên và áp dụng patch trên bản mới nhất. Phần `story.ts` do chat khác cập nhật cũng được giữ nguyên.

Các guard hash lịch sử N2/N3/Opening được mở ngoại lệ hẹp cho `letter.ts` đúng phạm vi F5.3. Guard N4 được cập nhật để tiếp tục so sánh AST của 4 nhánh không thuộc editor: memory, paper, ending và credits; xác nhận đủ 4 nhánh được trích xuất. Không xóa test cốt truyện, timing, camera hoặc completion. Không dùng ngoại lệ cả thư mục Finale.

## Kiểm thử và bằng chứng

Typecheck, lint, production build và 60 unit tests (17 files) đã PASS. Bộ browser có 9 tests cho Finale, Letter Experience và Player Room; kết quả bản cuối lưu ở JSON bên dưới. Video 24,3 giây xuất H.264 1280×720 + AAC từ frame Chromium và master audio bus thật, không ghép nhạc thay thế.


- Unit mới: migration v1, Unicode NFC/surrogate bounds, field không hợp lệ, storage hỏng/bị chặn, không lưu consent/submitted, tắt lưu/xóa.
- E2E mới: desktop, mobile touch, Canvas fallback; IME, live preview, literal HTML/XSS, xác nhận công khai, reload yêu cầu xác nhận lại, tên hiển thị lưu/Continue, xóa nháp, không POST và không đưa tên vào telemetry.
- E2E hiện hữu: Finale IME/save/galaxy/completion/Menu/replay; offline/storage/audio failure; Player Room camera và keyboard/touch.
- Kết quả chi tiết: `finale-f5-3-proof/results.json` và `player-room-recheck.json`. Lần chạy bản cuối: 6/6 ca Finale + Letter Experience pass; một ca Room desktop timeout ở màn loading do assertion nội dung chỉ chờ 5 giây. Test đã được sửa để chờ đúng scene `letter` (tối đa 30 giây), rồi mới giữ nguyên assertion nội dung. Nhóm Room chạy lại PASS 3/3 (66 giây); giữ log trước sửa ở `results-before-readiness-fix.json`. Ảnh: `runtime/`. Video gameplay/audio: `video/`.

Mobile đã kiểm tra bằng Chromium emulation, chưa thay thế nghiệm thu bàn phím tiếng Việt và Safari trên thiết bị thật. Kiểm tra IME dùng browser composition events; cần QA Telex/VNI thực tế trước release. Build vẫn có cảnh báo chunk lớn từ cấu trúc Three.js hiện có.

## Chạy và duyệt

Build riêng: `npm run build -- --outDir finale-f5-3-dist`.
Preview: `npx vite preview --outDir finale-f5-3-dist --host 127.0.0.1 --port 4193`.
QA: `npx playwright test -c playwright.letter-experience.config.ts`.
Video: `node scripts/record-letter-experience.mjs` khi preview đang chạy.

Mở thẳng Player Room trong cửa sổ dùng thử độc lập: `node scripts/open-letter-review.mjs`. Launcher chỉ tạo checkpoint trong browser context tạm của riêng nó, bật âm thanh và dừng ở máy tính để người chơi tự thao tác. Không dùng profile hay save của trình duyệt cá nhân.

Các bài kiểm tra dùng browser context riêng và checkpoint mẫu, không sửa save trong trình duyệt người dùng. Build không ghi đè thư mục dist chung. Không push hoặc deploy. Dừng sau F5.3.

## Chi phí và giới hạn kiểm chứng

Không thêm asset ảnh/font, render loop hay AudioContext. So với build F5.2 tích hợp, Chapter JS tăng từ 56,94 kB lên 62,31 kB (gzip 19,29 → 20,71 kB), Chapter CSS 21,71 → 26,94 kB (gzip 5,23 → 6,31 kB). Đây là dung lượng build, không phải benchmark FPS. Bộ test lưu số đo RAF của Room vào `player-room/`; không dùng chúng để khẳng định hiệu năng nhập liệu trên điện thoại thật.
