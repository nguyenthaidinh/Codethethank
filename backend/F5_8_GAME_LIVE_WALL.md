# F5.8 — Gửi lời chúc từ game và nâng cấp lồng đèn

Ngày: 17/11/2026. Không push/deploy. Bản thử riêng: game `http://127.0.0.1:4198`, backend/Live Wall `http://127.0.0.1:8057`.

## Luồng người chơi

1. Soạn lời nhắn như trước. Mặc định vẫn riêng tư. Chọn “Muốn chia sẻ công khai” chưa gửi gì.
2. Ở bước đọc lại, tải chính sách `public-wall-live-v2`, xác nhận nội dung sẽ công khai ngay và bấm **Gửi lên Live Wall**.
3. Backend ghi nhận trạng thái approved ngay, không cần duyệt. Máy chiếu Auto nhận lời mới ở nhịp polling tiếp theo. Manual và Emergency Blank vẫn được tôn trọng; không lén mở lại màn hình khi có người gửi.
4. Người chơi có thể tạo ngôi sao riêng tư và hoàn thành game dù không gửi hoặc mất mạng. HTTP không điều khiển state machine/completion.
5. Có thể xem và gỡ bản đã gửi ở bước đọc lại hoặc mở “Bản gửi Live Wall · Xem / gỡ” trong cảnh kết. Gỡ công khai không xóa bản nháp hay checkpoint. Xóa bản nháp không tự gỡ một bài đã gửi: giao diện giải thích và cung cấp nút gỡ riêng.

## Bảo toàn riêng tư và retry

- Không đổi `letter.ts`, `state.ts`, save key hay schema checkpoint. Chỉ payload trắng gồm `recipient`, `message`, `display_name`, `consent` được POST. Không gửi local/audience/save, lịch sử hoặc telemetry.
- Không đọc nội dung từ localStorage trong client mạng. Component chỉ truyền đúng lời người chơi đang xác nhận.
- Không gửi khi mount, reload, Continue, tạo sao hoặc hoàn thành. Checkbox gắn với nội dung, không được khôi phục như quyền tự gửi.
- Trước một POST chủ động, tạo UUID idempotency và receipt 256-bit. Giữ bản sao đã **chủ động gửi công khai** cùng biên nhận trong sessionStorage riêng `project2011.public-wall.receipt.v1`; không đưa vào bản nháp hoặc save game.
- Nếu phản hồi mất, giữ nguyên payload/keys cho nút “Thử lại cùng lời chúc”. Hiển thị lại chính xác lời cũ và yêu cầu tick xác nhận mới; không thay bằng bản nháp đã sửa. Retry trả cùng ID, không tạo bài trùng.
- Một bản công khai còn hoạt động phải được gỡ trước khi gửi bản mới từ cùng phiên. Sau gỡ, xóa nội dung khỏi biên nhận; lượt gửi mới có keys mới. Chống double-click bằng khóa thao tác đồng bộ trong module.
- Không lưu được sessionStorage: vẫn thao tác trong bộ nhớ; giao diện nói rõ phải gỡ/thử lại trước khi đóng hoặc reload. Gửi mạng cần secure context cho random UUID; báo rõ nếu không có HTTPS/localhost, vẫn cho hoàn thành riêng tư.
- Dịch vụ chưa sẵn sàng, chính sách thay đổi, timeout, 422 và rate limit có phản hồi riêng. Nút thử kết nối lại không gửi thư. Không dùng session Admin để gửi: fetch dùng `credentials: omit`.

## Lồng đèn

Thay thân đèn hình khối đơn giản bằng silhouette giấy cong, nan uốn theo thể tích, sợi giấy mảnh, viền tre, quai và tua đèn. Ánh sáng ấm từ tâm, highlight lệch nhẹ, chuyển động nghiêng và nhấp nhô chậm. Phân bố gần–xa không còn thành các cặp lặp đều; giảm sáng trong vùng chữ chính và tiêu đề.

`lantern-art.js` tạo sprite canvas 384×448 một lần (~0,66 MiB RGBA). Frame sau tái sử dụng bằng drawImage, thay việc dựng gradients/path cho từng đèn mỗi khung. Vẫn giới hạn 22 đèn, DPR ≤1,5, ≤168 hạt pháo hoa. Không thêm thư viện, asset tải ngoài hoặc ảnh tĩnh toàn màn hình. Reduced motion và fallback không canvas vẫn đi theo cơ chế F5.7. Đây là art procedural trong runtime, không gọi là asset 3D final production.

## Chạy thử, không đụng server chat khác

Trong `backend`: `powershell -File scripts/start-wall-review.ps1` (database demo riêng `gratitude_wall_review`).

Ở thư mục dự án:

```sh
node node_modules/vite/bin/vite.js build --config vite.f58.config.ts
node node_modules/vite/bin/vite.js preview --config vite.f58.config.ts
node scripts/qa-f58.mjs --open
```

Script mở phiên demo riêng, ghép máy chiếu và đưa game tới Player Room bằng checkpoint giả; không chạm hồ sơ trình duyệt người dùng. Mật khẩu fixture chỉ giữ trong bộ nhớ. `--open` không tự gửi lời. Các liên kết ghép máy chiếu test cũ có thể được thu hồi bằng `backend/scripts/f58-cleanup.php`, có guard DB demo và chỉ dọn nội dung/màn hình do QA F5.8 tạo.

`vite.f58.config.ts` dùng build output riêng `backend/proof-f58/game-build`, proxy riêng `/api/v1` → localhost:8057. Không sửa `vite.config.ts`, dist hay cổng của chat khác. Dùng preview build để tránh các build của chat khác gây hot reload giữa QA.

Mặc định production client gọi `/api/v1` cùng origin. Khi triển khai sau này, cần reverse proxy API tương ứng, hoặc cấu hình `VITE_GRATITUDE_API_BASE` và CORS đúng origin. Sprint này không mở cổng LAN, không thay CORS toàn cục, không triển khai hosting/TLS. Hai địa chỉ localhost chưa dùng được từ điện thoại khác trong trường.

## Kiểm chứng thực chạy

- Typecheck, ESLint và Pint PASS; build riêng PASS. Cảnh báo chunk CinematicGame ~780 KB vẫn có; không sửa bundling của chat khác.
- Test riêng sharing/letter/Finale: **16 PASS**. Bao phủ không gửi khi riêng tư/không consent; payload giới hạn; receipt; double-click; retry qua reload; 422/429; gỡ không chạm localStorage.
- PHPUnit PostgreSQL: **42 tests / 339 assertions PASS** (`proof-f58/phpunit-postgres.xml`).
- Trình duyệt thật đã xác nhận trên desktop, mobile emulation và WebGL fallback: riêng tư không POST; gửi lên Auto không duyệt; reload không gửi lại; gỡ trong reveal; draft không đổi; completion=true.
- Đã mô phỏng server nhận POST nhưng chặn phản hồi: reload không POST; tick và thử lại dùng cùng idempotency key, nhận cùng submission ID; gỡ thành công.
- Đã phát hiện và sửa bảng biên nhận đè nút đi tiếp trên mobile; bảng nay nằm trên vùng action, không chặn completion.
- Regression trình duyệt cũ: **9/9 tình huống PASS qua hai lượt** — 6 test Finale/Player Room qua ở lượt đầu, 3 test editor qua lượt chạy lại sau khi đổi kỳ vọng câu “Chỉ lưu trên thiết bị” thành “Bản nháp lưu riêng trên thiết bị này.” để phân biệt bản nháp với bản công khai. Giữ nguyên kiểm tra IME, reload, storage, private/no POST, keyboard/touch và completion. Bằng chứng: `regression-first-run.json`, `regression.json`.
- Ảnh runtime ở `proof-f58/runtime`: `desktop-sent.png`, `mobile-sent.png`, `fallback-sent.png`, `lanterns-desktop.png`.
- Lượt harness tích hợp cuối **F58_QA_PASS**, không có lỗi JS/CSP; `runtime/qa.json` lưu kết quả. Gửi từ game → xuất hiện: desktop **3.467 ms**, mobile **2.188 ms**, fallback **2.012 ms** trong môi trường thử cục bộ. Đây là polling 1 giây cộng thời gian request/render, không phải cam kết độ trễ trên hosting thật.
- Đã ghi video thực `runtime/live-wall-f58.webm` (18 giây cảnh, không track âm thanh). Đo RAF tại 1920×1080: median/p95 **16,7 ms**, canvas 2.073.600 pixel. F5.7 từng đo p95 33,4 ms trên cùng máy nhưng tải nền khác; không coi hai mẫu là benchmark tăng FPS. Lợi ích xác định được ở code là thay gradients/path mỗi frame bằng sprite cache.

**Không tuyên bố toàn bộ suite xanh.** Lần chạy suite chung gần nhất: **83 PASS / 5 FAIL** (`unit-all.json`, `unit-summary.json`). Các failure đang dừng ở hash `ChapterGame.tsx` và timing narrator đã thay đổi trong luồng làm việc khác. Trước đó guard khóa toàn bộ Finale cũng phát hiện các UI được F5.8 sửa có chủ đích. Không cập nhật baseline lịch sử hoặc sửa test của chat khác để che failure. Cần chốt baseline liên sprint sau khi các chat hoàn tất.

Các lượt đầu bị gián đoạn do OutOfMemory, ERR_INSUFFICIENT_RESOURCES và browser Target crashed; một tiến trình công cụ điều khiển máy được ghi nhận ~40 GiB private memory. Đã đóng demo cũ do task này mở, không dừng tiến trình có thể thuộc chat khác. Sau khi bộ nhớ khả dụng trở lại, khởi động lại Docker/backend/preview và hoàn tất lượt tích hợp cùng video. `runtime/qa.json` là kết quả lượt hoàn tất; `last-run.json` chỉ ghi tiến độ của lần chạy gần nhất, không tự nó đồng nghĩa toàn bộ harness PASS.

## Ranh giới thay đổi

- Thêm `src/finale/public-sharing.ts`, `PublicSharing.tsx`, `public-sharing.css`.
- Sửa ba UI Finale: `LetterExperience.tsx` nối gửi; `RevealControls.tsx` đặt biên nhận/gỡ; `FinaleControls.tsx` cập nhật thông tin Credits.
- Backend chỉ sửa renderer Live Wall, thêm `lantern-art.js`, cho phép serve module và đổi script renderer thành ES module; không đổi schema hay logic completion/moderation.
- Thêm tests sharing, điều chỉnh kỳ vọng E2E editor từ xác nhận chưa gửi của F5.3 sang consent gửi ngay F5.8, vẫn kiểm tra không tự POST. Thêm config/QA/report scripts riêng.
- Hash 93 file đầu sprint và kiểm tra lại: `state.ts`, `letter.ts`, `reveal.ts`, `PlayerRoom.ts`, `FinaleVisual.ts`, `CinematicReveal.ts` giữ nguyên. `preservation.json` tách ba UI sửa có chủ đích và các file thay đổi đồng thời bởi chat khác. Không hoàn nguyên hay ghi đè các file của chat khác.

Không deploy/push; không tự chuyển Manual sang Auto, không tự lấy thư riêng tư đưa lên màn hình.
