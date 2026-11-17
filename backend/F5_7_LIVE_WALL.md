# F5.7 — AION Live Wall

Ngày thực hiện: 17/11/2026. Phạm vi: backend, sân khấu trình chiếu và trang gửi công khai riêng. Không push/deploy. Không thay đổi game, save/checkpoint/completion, thư riêng tư hay AudioDirector.

## Hành vi đã triển khai

- `/gratitude`: nhập lời chúc tối đa 500 ký tự, tên người nhận, tên hiển thị tùy chọn; xác nhận rõ nội dung có thể chiếu ngay. API dùng consent `public-wall-live-v2`, tạo `publication_mode=instant`, `status=approved` ngay. Trạng thái này nghĩa là đủ điều kiện hiển thị, không ngụ ý đã được người kiểm duyệt đọc.
- Consent cũ `public-wall-v1` vẫn tạo pending. Không tự công khai hàng chờ cũ. Những lời cũ đã được duyệt hợp lệ vẫn đủ điều kiện trình chiếu. Không đọc localStorage hoặc tự lấy thư riêng tư từ game.
- `/admin/stage`: Auto, Manual, lời tiếp theo, chọn riêng một lời, bật/tắt pháo hoa và Emergency Blank. Xem preview thực cùng renderer, ghép/thu hồi máy chiếu, heartbeat và revision đã nhận. Admin/operator được điều khiển; moderator chỉ quản lý lời nhắn.
- `/live-wall`: renderer riêng, không có dashboard. Midnight navy, steel blue, cyan tiết chế, amber và ivory; kiến trúc vòm, lưới phối cảnh, lồng đèn canvas, lời bay hai bên, pháo hoa amber/cyan và lời chính chuyển nhẹ. Không dùng ảnh tĩnh nền.
- Auto ưu tiên lời chưa từng chiếu, sau đó luân phiên theo lần chiếu cũ nhất. Manual giữ lời được chọn, không đưa lời mới vào luồng bay. Bản đọc chia 170 grapheme/trang, 12 giây/trang; chuẩn hóa khoảng trắng ở projection để lời có nhiều xuống dòng không phá bố cục. Nội dung gốc lưu trữ không đổi.
- Ban tổ chức vẫn có thể ẩn nội dung trong Admin; người gửi có thể gỡ lời vừa gửi bằng receipt trong sessionStorage. Không yêu cầu duyệt trước với consent mới.

## Kết nối và Emergency Blank

Polling mục tiêu 1 giây, không phải WebSocket/SSE. Mỗi máy chỉ có một request đang chạy. Dữ liệu hiển thị có lease tối đa 6,5 giây tính từ lúc bắt đầu request, không kéo dài bằng phản hồi đến muộn. Hết hạn, mất quyền, tab bị ẩn hoặc B/Esc tại máy chiếu: che đen và xóa chữ khỏi DOM. Tab hiện lại phải nhận dữ liệu mới. Không cache nội dung để chiếu offline.

Emergency Blank từ server được chấp nhận kể cả revision cũ, bỏ current selection và tăng revision. Các lệnh khác yêu cầu revision hiện tại, nên lệnh resume cũ không thể vô tình mở lại sau Blank. Phím R chỉ gỡ latch cục bộ; không vô hiệu hóa Blank từ server. F hoặc double-click vào toàn màn hình; trình duyệt vẫn yêu cầu thao tác người dùng.

Máy chiếu dùng token ngẫu nhiên 256-bit, hash trong DB, hết hạn sau 12 giờ. Link ghép chứa token ở fragment, JS xóa fragment khỏi URL và giữ token trong sessionStorage. Token chỉ đọc projection, không điều khiển Admin. Không đưa token vào query, screenshot hoặc báo cáo. Pair page dùng no-store và chỉ dành cho người vận hành. Mất kết nối không được báo như đã nhận lệnh; trạng thái heartbeat hiển thị riêng.

Mặc định DB mới ở trạng thái che. Bản demo có dữ liệu minh họa và được fixture mở Auto. Live Wall hiện im lặng để không tranh âm thanh MC; không sửa audio game. Video bằng chứng không có track âm thanh.

## Chạy thử trên máy này

Database riêng `gratitude_wall_review`; không trộn dữ liệu minh họa vào `gratitude`. PostgreSQL container hiện có, cổng loopback 55455. PHP mặc định máy là 8.2; script chọn PHP 8.3 riêng, không sửa cấu hình toàn máy.

Từ `backend`, chạy `powershell -File scripts/start-wall-review.ps1`. Nếu DB review chưa tồn tại, tạo một lần bằng `docker exec unwritten-f55-db-1 createdb -U gratitude gratitude_wall_review`. Không dùng migrate:fresh với DB đang sử dụng.

Sau đó `node scripts/wall-browser.mjs --open` mở phiên Admin và máy chiếu đã ghép, với dữ liệu giả. Script chỉ chấp nhận DB review, thông tin đăng nhập ngẫu nhiên giữ trong bộ nhớ; không ghi password/token vào proof. Chạy lại script sẽ đổi mật khẩu tài khoản demo và đặt sân khấu demo về Auto. Đóng browser demo kết thúc script.

- Điều khiển: `http://127.0.0.1:8057/admin/stage` (cần phiên đăng nhập).
- Trang gửi thử: `http://127.0.0.1:8057/gratitude`.
- Máy chiếu: mở link được ghép từ bàn điều khiển, không mở `/live-wall` trống quyền.

Server chỉ bind localhost: điện thoại khác chưa thể truy cập. Đây là bản chạy thử cục bộ; chưa có domain/TLS hoặc triển khai cho hội trường. PHP built-in server không dùng cho sự kiện thật. Caches review có tên riêng, không thay config DB của server 8055/8056. OPcache local tắt kiểm tra timestamp để giảm I/O trên Windows: khởi động lại script sau khi sửa PHP/template.

## QA và bằng chứng

- PHPUnit SQLite: **42 tests / 339 assertions PASS**.
- PHPUnit PostgreSQL: **42 tests / 339 assertions PASS**.
- Race PostgreSQL: 8 worker/2 operator đồng thời gửi Blank và resume cùng revision. 4 Blank đều thành công; 3 resume cũ bị 409; trạng thái cuối che đen. `proof-f57/concurrency.json`.
- Pint PASS. Game typecheck/lint PASS, Vitest **77 tests / 22 files PASS**. Vite build PASS ở `proof-f57/game-build` riêng, không ghi đè dist chat khác. Có cảnh báo chunk CinematicGame ~777 KB của build game hiện tại; sprint này không sửa bundle đó.
- Playwright **12 nhóm kiểm tra PASS**, không có lỗi JS/CSP: ghép token, CSRF, gửi tức thời, XSS thành chữ thuần, Manual giữ, người gửi gỡ, remote/local Blank, mất mạng/hồi phục, reduced motion và mobile, fallback không canvas, form sân khấu không JavaScript và thu hồi máy chiếu. Kết quả ở `proof-f57/runtime/qa.json`.
- Ảnh: `live-wall-desktop.png`, `stage-desktop.png`, `stage-mobile.png`, `share-mobile.png`, `reduced-motion.png`, `emergency-blank.png`; video runtime WebM trong cùng thư mục.
- Đã so 91 file `src/` với snapshot đầu sprint. Hai file thay đổi bởi luồng làm việc khác: `src/art/NarrativeActors.ts`, `src/cinematic/ClassroomPerformance.ts`. Không sửa/hoàn nguyên hai file này. `proof-f57/game-preservation.json` ghi nhận; phần Finale/save/letter giữ nguyên.

## Hiệu năng và giới hạn

Hai lần QA sau tối ưu local: gửi → xuất hiện **2.921 ms**, rồi **1.308 ms** ở lần cuối; RAF median **16,7 ms**, p95 **33,4 ms** ở 1920×1080; canvas 2.073.600 pixel, 50 DOM nodes trong mẫu đo cuối. RAF là nhịp trình duyệt, không phải cam kết FPS render. Số liệu cuối ở `qa.json`.

Canvas giới hạn tối đa 40 nhịp/giây (tùy refresh thực tế), DPR ≤1,5, 22 lồng đèn, 95 điểm sao, ≤168 hạt pháo hoa và ≤8 lời bay. Snapshot tối đa 30 lời mới, bản đọc chính luân phiên toàn bộ queue hợp lệ. Không tải Three.js hay thư viện mới cho Live Wall; bundle game tăng 0 byte do F5.7.

Trước tối ưu, server thử nghiệm một worker bị chậm khi đồng thời phục vụ preview và projection, dẫn tới tự che đúng lease. Đã dùng config/routes/views cache riêng và OPcache cho bản review; giữ nguyên lease 6,5 giây. Kết quả là đo cục bộ trên máy đang chạy công việc khác, chưa phải benchmark hội trường hoặc kiểm thử tải đông người. Mobile QA là Chromium emulation, chưa phải máy chiếu/điện thoại vật lý. Khi không có canvas, typography và cập nhật lời vẫn hoạt động trên nền CSS. Reduced motion tắt bay và pháo hoa.

## File và dữ liệu thay đổi

- Migration bổ sung `publication_mode`, `wall_presented_at`; thêm `wall_states`, `wall_displays`. Additive, không đổi schema save game hoặc xóa thư. Đã migrate DB local và hai DB review do các sprint backend tạo.
- `LiveWallService`, `WallState`, `WallDisplay`, `LiveWallController`, `StageController`, `WallDisplayAccess`, `WallHeaders`: queue, quyền máy chiếu, trạng thái và điều khiển.
- `routes/wall.php`, routes Admin/API, bootstrap, rate limiters: tách projection/public opt-in khỏi Admin session.
- `resources/views/wall/*`, `public/wall/*`: trình chiếu, stage, pair và share; không có asset mạng ngoài.
- Consent config/request/submission service: phân biệt chia sẻ ngay và legacy pending; audit `submission.published` không chứa nội dung.
- Admin layout/index/login/labels/access/auth/headers: link stage, quyền operator, preview same-origin, nhãn chính xác với chính sách mới.
- Tests mới và cập nhật kỳ vọng sprint cũ về route Live Wall/role operator/consent. Không sửa regression tests game để làm kết quả xanh.
- Scripts fixture/browser/concurrency/start-review và tài liệu sprint. Evidence/caches/secrets ở các đường dẫn đã ignore.

F5.8 nối nút gửi trong game, hosting, TLS, backup và vận hành sự kiện chưa triển khai trong F5.7 này.
