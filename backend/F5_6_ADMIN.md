# F5.6 — AION Admin: xem và kiểm duyệt lời nhắn

Ngày nghiệm thu local: 17/11/2026 (Asia/Saigon).

## Đã hoàn thành

Admin chạy cùng backend Laravel tại `/admin`, tách khỏi game React/Three.js. Giao diện Blade/CSS/JavaScript riêng, không thêm package, không đưa dependency vào game. Chọn Blade thay vì bổ sung Filament ở sprint này để làm màn đọc và kiểm duyệt AION chuyên biệt với stack hiện hữu; không có dashboard framework hoặc bundle build thứ hai.

- Đăng nhập/đăng xuất bằng session cookie, không sử dụng bearer token trong localStorage.
- Danh sách theo chờ duyệt / đã duyệt / từ chối / đã ẩn / đã rút / tất cả.
- Tìm theo người nhận, tên hiển thị hoặc nội dung; query được bind, escape `%`/`_`, phân trang 12 mục.
- Bản đọc đầy đủ với xuống dòng, tiếng Việt, tên người nhận/chữ ký và thời điểm đồng ý chia sẻ.
- Duyệt, từ chối có lý do, ẩn có lý do và đưa về chờ duyệt để xét lại.
- Lịch sử 20 sự kiện gần nhất: người xử lý, thời điểm, hành động và lý do dạng danh mục. Không ghi nguyên văn lời nhắn vào audit.
- Hộp xác nhận, trạng thái đang xử lý, thông báo kết quả, trạng thái rỗng và trang lỗi thân thiện.
- Mobile xếp danh sách và vùng đọc theo chiều dọc; điều khiển touch/keyboard, reduced motion. Luồng form vẫn hoạt động khi JavaScript bị tắt (không có hộp xác nhận JS).

Không có Live Wall, hàng chờ sân khấu, ưu tiên trình chiếu, realtime hoặc nút “chiếu ngay”. Duyệt chỉ đổi trạng thái trong database, không phát hành lên màn hình công cộng.

## Art direction

Midnight navy `#0B1422`, steel blue `#24384A`, cyan `#72B7C9`, amber `#D5A76B`, ivory `#F0EEE8`. Sidebar gọn, vùng danh sách sắc nét, vùng thư có khoảng thở. Amber dùng cho lời tri ân/chữ ký và trạng thái chờ. Không lạm dụng glassmorphism, không thêm 3D vào màn thao tác quản trị.

Font Noto Serif hỗ trợ tiếng Việt được sao chép từ asset hiện hữu của game sang phạm vi Admin, kèm giấy phép OFL. Không sửa font/asset gốc. Các hình quỹ đạo trang đăng nhập được tạo bằng CSS; không gọi CDN hoặc dịch vụ ảnh ngoài.

Ảnh kiểm tra cuối:

- `proof-f56/runtime/desktop-review.png`: bản duyệt thử cuối, desktop 1440×1000, trang cao khoảng 1264 px.
- `proof-f56/runtime/desktop-login.png`: đăng nhập.
- `proof-f56/runtime/mobile-inbox.png`, `mobile-long-letter.png`: Chromium emulation 390 px.
- `proof-f56/runtime/letter-detail.png`: bản đọc ở kích thước thực.
- `proof-f56/runtime/desktop-history.png`, `stale-decision.png`: lịch sử và xung đột quyết định.

Ảnh dùng lời nhắn minh họa, có dải nhãn bản duyệt thử. Một số ảnh QA có chuỗi `<script>` để kiểm tra escape, không phải nội dung thật. Không xem các ảnh lỗi từ lượt thử ban đầu là sản phẩm bàn giao.

## Quyền và bảo vệ dữ liệu

Chỉ tài khoản `admin` hoặc `moderator`, đang active, được đọc/kiểm duyệt. `operator` không được đọc thư qua Admin. Tài khoản vẫn được cấp qua `staff:create`; chưa xây UI quản lý tài khoản.

Cookie `uwl_admin_session` có HttpOnly, SameSite=Strict, path=/admin. Session được lưu và mã hóa phía server, timeout không hoạt động 60 phút, giới hạn tuyệt đối 8 giờ. Đăng nhập xoay session ID; đăng xuất hủy session và CSRF token. Mỗi request kiểm tra active, role và dấu kiểm tra hash mật khẩu, nên khóa tài khoản/đổi mật khẩu làm mất quyền phiên hiện tại ở request tiếp theo. Production phải dùng HTTPS và ADMIN_SECURE_COOKIE=true.

POST sử dụng bảo vệ CSRF/origin của Laravel và token trong form. Rate limit đăng nhập kế thừa giới hạn F5.5. CSP chỉ cho tài nguyên cùng origin, không inline script, không iframe; HTML chứa thư có no-store. Blade escape toàn bộ nội dung người dùng; không dùng innerHTML. Mã receipt, payload hash và idempotency hash không xuất hiện trong HTML Admin.

Admin session không cấp quyền cho các API bearer F5.5. Admin chỉ đọc dữ liệu đã được tự nguyện gửi vào backend; không đọc localStorage hay bản nháp riêng tư trên máy người chơi. Chưa nối nút gửi trong game.

## Chuyển trạng thái và xử lý đồng thời

| Từ | Hành động | Đến |
|---|---|---|
| pending | Duyệt | approved |
| pending | Từ chối + lý do | rejected |
| approved | Ẩn + lý do | hidden |
| rejected / hidden | Đưa về xét lại | pending |
| withdrawn | Không cho thao tác | Giữ withdrawn |

Migration chỉ thêm `moderation_version` và metadata audit, không thay nội dung thư hiện hữu. Mỗi form mang revision đã đọc. Transaction khóa tài khoản rồi khóa submission, kiểm tra lại quyền, revision và trạng thái trước khi ghi. Mỗi quyết định tăng revision một lần và ghi một audit trong cùng transaction.

Hai người quyết định cùng revision: chỉ một người thành công, người còn lại nhận HTTP 409 và hướng dẫn tải lại. Việc đưa về pending không cho phép form cũ ghi đè vì revision đã tăng. Withdrawal dùng cùng row lock hiện có của F5.5; withdrawn là trạng thái kết thúc, không thể duyệt hoặc hồi sinh nội dung đã xóa.

Giao diện hiện cập nhật khi mở trang/chuyển bộ lọc hoặc bấm Cập nhật, chưa polling realtime. Nếu người gửi rút thư khi kiểm duyệt viên đang đọc, bản đọc trong tab cũ còn đến lần tải lại; thao tác ghi sau withdrawal bị server chặn. Không tuyên bố đây là cơ chế thu hồi tức thì trên màn hình trình chiếu.

## Chạy Admin thật và bản duyệt thử

Database local chính `gratitude` đã được migrate thêm F5.6. Dữ liệu minh họa không được seed vào database chính.

- Admin thật: `http://127.0.0.1:8055/admin` (server F5.5 hiện hữu). Cần tài khoản staff do người quản lý cấp bằng CLI; không có mật khẩu mặc định.
- Bản duyệt thử: `http://127.0.0.1:8056/admin`, database riêng `gratitude_admin_review`, dải nhãn minh họa luôn hiện trong cấu hình review.
- Đã mở cửa sổ Chromium riêng và đăng nhập sẵn bản minh họa. Không dùng profile hoặc credentials cá nhân.

Trong thư mục backend, dùng PHP 8.3 hiện hữu, không đổi PHP/PATH toàn máy:

```powershell
$apiPhp = 'F:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe'
& $apiPhp -d extension=pdo_pgsql artisan migrate
& $apiPhp -d extension=pdo_pgsql artisan staff:create ten@truong.example --name='Kiểm duyệt viên' --role=moderator
# Password được nhập qua prompt ẩn, không truyền bằng tham số.
```

Khởi chạy review khi cần (database review đã tạo trong lần triển khai này):

```powershell
$env:DB_DATABASE='gratitude_admin_review'
$env:ADMIN_REVIEW_MODE='true'
& $apiPhp -d extension=pdo_pgsql -S 127.0.0.1:8056 -t public dev-router.php
```

Ở terminal khác trong backend:

```sh
node scripts/admin-browser.mjs --open
```

Helper tạo/đặt lại đúng fixture do nó sở hữu trong database review, tạo password ngẫu nhiên chỉ giữ trong bộ nhớ rồi đăng nhập browser. Không ghi password vào file, stdout hay screenshot. Chạy lại helper làm các phiên review cũ cần đăng nhập lại; không đụng tài khoản/database chính. dev-router.php chỉ là router local cho asset whitelist để tránh mở session DB khi đọc CSS/font; không phải cấu hình deploy.

## Kết quả QA thực chạy

| Kiểm tra | Kết quả |
|---|---|
| PHPUnit SQLite | 34 tests, 282 assertions PASS |
| PHPUnit PostgreSQL | Cùng 34 tests, 282 assertions PASS |
| Race thật trên PostgreSQL | 8 worker / 2 moderator: 1 thành công, 7 conflict; revision=1, 1 audit quyết định |
| Browser | 11 nhóm kiểm tra PASS: desktop/mobile/no-JS, đăng nhập/đăng xuất, CSRF, cookie, pagination/search, XSS, quyết định/lịch sử, stale tab, withdrawal |
| Mobile/reduced motion | 390×844 và kiểm tra overflow 320×780 PASS; thiết bị mô phỏng, chưa QA điện thoại thật |
| Pint | PASS |
| Laravel config/route/view cache | PASS, đường dẫn cache kiểm thử riêng; đã clear config/route cache thử |
| Regression game | finale.test.ts + letter-experience.test.ts: 10 tests / 2 files PASS |

Bằng chứng: `proof-f56/phpunit-sqlite.xml`, `phpunit-postgres.xml`, `concurrency.json`, `runtime/browser-results.json`, `runtime/layout.json`, `routes.json`.

Ca mới kiểm tra session-only access, role/active/password/expiry, nội dung escape, không lộ hash, lọc/tìm kiếm/phân trang, audit, invalid transition/missing reason, revision cũ, withdrawn không hồi sinh, CSRF thực qua HTTP và MIME assets dưới nosniff. Các test F5.5 vẫn chạy; chỉ cập nhật assertion `/admin` từ chưa tồn tại sang chuyển hướng đăng nhập, đúng phạm vi mới.

Lệnh tái lập:

```powershell
& $apiPhp vendor/phpunit/phpunit/phpunit --log-junit proof-f56/phpunit-sqlite.xml
& $apiPhp -d extension=pdo_pgsql vendor/phpunit/phpunit/phpunit --configuration phpunit.pgsql.xml --log-junit proof-f56/phpunit-postgres.xml
& $apiPhp -d extension=pdo_pgsql scripts/admin-concurrency.php
& $apiPhp vendor/bin/pint --test
node scripts/admin-browser.mjs
```

Test PostgreSQL vẫn bị khóa vào database `gratitude_test`; fixture browser chỉ cho database `gratitude_admin_review`. Không dùng migrate:fresh trên database hoạt động. Không thêm package nên không thay composer.lock hoặc dependencies game. Không chạy lại full build/E2E game vì không thay game; không gán kết quả QA cho sửa đổi của chat khác.

## File thay đổi và phối hợp

File backend cũ được sửa hẹp: bootstrap/app.php (web routes/middleware/error rendering), app/Models/Submission.php (cast revision), tests/TestCase.php (session test), tests/Feature/ExampleTest.php (route mới), .env.example, .gitignore, README.md. Không thay state/save/completion/letter logic, public API controller hay SubmissionService của F5.5.

File mới tập trung ở:

- app/Http/Controllers/Admin*.php, app/Http/Middleware/Admin*.php.
- app/Services/ModerationService.php, config/admin.php, routes/admin.php.
- database/migrations/2026_11_17_000002_add_moderation_revision.php.
- resources/views/admin/, public/admin/ (CSS, JS, font và giấy phép).
- tests/Feature/AdminTest.php, scripts/admin-{fixture,browser,concurrency}.*, dev-router.php.
- Tài liệu này và proof-f56/ (được ignore).

Snapshot source trước sửa: proof-f56/game-before.json và backend-before.json. Trong lúc triển khai, chat khác sửa src/art/NarrativeActors.ts; giữ nguyên, không ghi đè. Danh sách khác biệt ghi ở game-concurrent-changes.json. Tất cả source game do task này sở hữu: **0 file chỉnh sửa**.

Dừng ở F5.6 để Product Owner duyệt giao diện. Chưa Live Wall, chưa quản trị tài khoản bằng UI, chưa push/deploy. Tham khảo framework: [Laravel authentication](https://laravel.com/docs/13.x/authentication); hành vi CSRF/origin được đối chiếu trực tiếp với middleware Laravel đã khóa trong vendor và kiểm thử HTTP.
