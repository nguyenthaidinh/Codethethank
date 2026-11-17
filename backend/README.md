# F5.5 API + F5.6 Admin + F5.7 Live Wall — The Unwritten Lesson

**Cập nhật F5.8:** đã nối thao tác gửi có xác nhận từ game lên Live Wall và nâng cấp lồng đèn. Bản game tích hợp chạy riêng ở cổng 4198; xem [F5_8_GAME_LIVE_WALL.md](F5_8_GAME_LIVE_WALL.md) cho cách chạy, biên nhận/gỡ và kết quả QA. Các mô tả “chưa nối game” phía dưới ghi lại trạng thái trước F5.8.

Backend độc lập cho THE UNWRITTEN LESSON. Laravel 13 + PostgreSQL 17 + Sanctum. Admin tại `/admin`, điều khiển sân khấu tại `/admin/stage`, máy chiếu ghép quyền tại `/live-wall`, trang chủ động gửi lời chúc tại `/gratitude`. Xem [F5_7_LIVE_WALL.md](F5_7_LIVE_WALL.md) cho thay đổi chính sách chia sẻ ngay, vận hành và QA mới nhất; [F5_6_ADMIN.md](F5_6_ADMIN.md) ghi lại sprint Admin trước đó. Chưa nối hành động gửi từ game.

## Ranh giới với game và chat khác

- Chỉ thêm `backend/` và bằng chứng `backend-proof/`. Không sửa `src/`, dependencies/build/test config của game hoặc các bản dist cũ.
- Save/checkpoint/completion, audio và thư riêng tư vẫn dùng luồng cũ. Chọn `audience: public` trong F5.3 **không** tự gửi dữ liệu.
- Chỉ một hành động gửi có đồng ý chia sẻ rõ ràng trong sprint tích hợp sau mới được gọi API.
- Chưa push/deploy. Server phát triển chỉ bind `127.0.0.1:8055`; PostgreSQL chỉ bind `127.0.0.1:55455`.

## Khởi chạy cục bộ

Yêu cầu PHP >= 8.3 với intl, mbstring, PDO, pdo_pgsql, openssl, fileinfo, XML và curl; zip giúp Composer tải package. SQLite cần pdo_sqlite cho bộ test phụ. Composer 2 và Docker Compose để chạy PostgreSQL.

Trong thư mục `backend`:

1. `composer install` (lockfile đã khóa phiên bản).
2. Tạo `.env` từ `.env.example` nếu chưa có; đặt `DB_PASSWORD` ngẫu nhiên riêng. Không ghi đè `.env` đang dùng.
3. `php artisan key:generate` chỉ cho lần thiết lập mới. Giữ APP_KEY ổn định: đổi key làm thay đổi fingerprint/idempotency HMAC.
4. `docker compose up -d --wait`.
5. `php artisan migrate` (không dùng migrate:fresh với database hoạt động).
6. `php -S 127.0.0.1:8055 -t public public/index.php`.

Máy hiện tại đã cấu hình riêng và migrate. PHP mặc định là 8.2; dùng PHP 8.3 hiện hữu bằng PowerShell, không đổi PATH/php.ini toàn máy:

```powershell
$apiPhp = 'F:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe'
& $apiPhp -d extension=pdo_pgsql -S 127.0.0.1:8055 -t public public/index.php
```

Composer trên máy này: chạy `$apiPhp -d extension=zip C:\ProgramData\ComposerSetup\bin\composer.phar install` trong backend. Không chạy PHP 8.2 vào dự án này. PHP built-in server chỉ dùng phát triển cục bộ, không phải cấu hình production.

`GET /up` là liveness, không kiểm tra database. `GET /api/v1/sharing-policy` cung cấp nội dung đồng ý và giới hạn. CORS mặc định rỗng; khi tích hợp cần cấu hình đúng origin game, không dùng `*` cho mọi website. CORS không thay thế xác thực/rate limit.

## Hợp đồng API

Xem `openapi.yaml`. Tất cả POST yêu cầu một JSON object, tối đa 8192 bytes. Text được chuẩn hóa NFC/line ending; giới hạn sau chuẩn hóa là 60/500/40 Unicode code points, khớp game hiện tại. Tên không chứa xuống dòng; chặn ký tự điều khiển/bidi nguy hiểm. Nội dung là plain text: HTML được giữ như văn bản, UI tương lai bắt buộc escape, tuyệt đối không innerHTML.

| Endpoint | Hành vi |
|---|---|
| GET `/api/v1/sharing-policy` | Nội dung/version consent và giới hạn |
| POST `/api/v1/submissions` | Tạo `pending` nếu có consent rõ ràng |
| GET `/api/v1/submissions/{id}` | Chỉ trả trạng thái cho người giữ receipt token |
| DELETE `/api/v1/submissions/{id}` | Rút lời nhắn và xóa nội dung khỏi database hoạt động |
| POST `/api/v1/auth/token` | Đăng nhập tài khoản staff đã cấp bằng CLI |
| GET `/api/v1/auth/me` | Danh tính/role tối thiểu, cần bearer token còn hiệu lực |
| DELETE `/api/v1/auth/token` | Thu hồi token hiện tại |

Ví dụ body gửi (không gửi các trường save, local, audience hoặc status):

```json
{
  "recipient": "Cô Vân",
  "message": "Cảm ơn cô đã ở lại cùng em.",
  "display_name": "Minh",
  "consent": {"accepted": true, "version": "public-wall-v1"}
}
```

Trước khi gửi, client phải tạo và giữ hai giá trị:

- `Idempotency-Key`: UUID v4 ngẫu nhiên, lowercase.
- `X-Receipt-Token`: 32 random bytes từ CSPRNG, encode thành 64 ký tự hex lowercase. Đây là bí mật để đọc trạng thái/rút lại, không đặt trong URL, log, analytics hoặc save game.

Gửi lại cùng body đã chuẩn hóa + hai key → 200 và cùng ID; lần đầu → 201. Cùng key khác nội dung/token, hoặc receipt dùng với key khác → 409, không ghi đè. Unique constraint và transaction bảo đảm chống trùng giữa nhiều worker. Client phải giữ keys **trước** request để retry được khi mất response; không tạo keys mới mỗi lần lỗi.

Thiếu/sai consent → 422. Preference public đơn lẻ không đủ. Chưa có endpoint đọc danh sách công khai. Response không chứa thư, recipient, chữ ký hoặc token. Sai/mất receipt trả cùng 404 như không tồn tại. Khi hết hạn rate limit, đọc Retry-After; database lỗi trả 503, không đưa bindings vào response/log kể cả APP_DEBUG=true.

Xóa riêng thư trên máy và rút lời nhắn trên server là hai hành động khác nhau. DELETE server không đụng localStorage. Rút lại giữ tombstone (ID, trạng thái, fingerprint HMAC, hash receipt, timestamp/version consent) để retry cũ không tạo lại lời nhắn; xóa recipient/message/display_name. Không tuyên bố xóa các backup độc lập. Mất receipt chưa có luồng khôi phục tự phục vụ ở F5.5; chính sách lưu giữ/backup và hỗ trợ ban tổ chức cần khóa trước sự kiện.

## Database và xác thực

`submissions`: enum pending/approved/rejected/hidden/withdrawn, consent timestamp phía server, version consent, unique hashes. Public API không có quyền kiểm duyệt. Các thao tác duyệt/từ chối/ẩn/xét lại đi qua session Admin và revision check trong F5.6.

`audit_events`: loại thao tác, actor ID/submission ID, thời điểm. Không chứa nội dung lời nhắn, raw IP, request body hay credentials. `personal_access_tokens`: Sanctum lưu hash, scope hiện chỉ staff:identity, hết hạn mặc định 8 giờ; kiểm tra active ở mỗi request. Mật khẩu hash, tối đa 72 UTF-8 bytes để tránh bcrypt cắt ngầm.

Không seed user hoặc mật khẩu mặc định, không public registration. Cấp tài khoản bằng terminal tương tác:

```sh
php artisan staff:create moderator@school.example --name="Điều phối" --role=moderator
php artisan staff:disable moderator@school.example
```

Mật khẩu nhập ở prompt ẩn, tối thiểu 12 ký tự, có chữ hoa/thường và số; không truyền password trên command line. Role admin/moderator được vào màn hình kiểm duyệt F5.6; operator không có quyền đọc thư trong Admin. Chưa có giao diện quản lý tài khoản hoặc điều khiển sân khấu. Disable khóa account và thu hồi mọi token trong transaction; session Admin cũng kiểm tra active ở mỗi request.

API bearer phục vụ nền xác thực. Admin browser F5.6 dùng session cookie HttpOnly, SameSite=Strict, path=/admin và CSRF; không lưu bearer vào localStorage. Session Admin không xác thực được API bearer. Scheduler có lệnh dọn token hết hạn; chưa chạy scheduler/service production.

Rate limits mặc định: gửi 120/phút và 3000/giờ mỗi IP + 5/phút mỗi receipt; đọc/rút 30/phút mỗi IP; login 20/phút/IP + 5/phút/account. Cache database dùng chung giữa worker. IP/email trong limiter được HMAC. Giới hạn IP là lớp thô, cần diễn tập/tune cho NAT dùng chung của trường; không coi đây là giải pháp chống spam hoàn chỉnh. Chưa thêm CAPTCHA hoặc dịch vụ trả phí.

## Kiểm thử

Không chạy test phá database đang dùng. `tests/TestCase.php` từ chối mọi database ngoài SQLite :memory: hoặc `gratitude_test` trong APP_ENV=testing.

```sh
php vendor/phpunit/phpunit/phpunit --log-junit proof/phpunit-sqlite.xml
php vendor/bin/pint --test
composer validate --strict
composer audit --locked
```

PostgreSQL: tạo database test riêng bằng `docker compose exec -T db createdb -U gratitude gratitude_test` một lần; tạo `.env.testing` riêng từ cấu hình kết nối local, APP_ENV=testing, DB_DATABASE=gratitude_test. Không commit file này.

```powershell
& $apiPhp -d extension=pdo_pgsql vendor/phpunit/phpunit/phpunit --configuration phpunit.pgsql.xml --log-junit proof/phpunit-postgres.xml
& $apiPhp -d extension=pdo_pgsql scripts/concurrency.php
node scripts/http-smoke.mjs
```

Gọi PHPUnit trực tiếp trên máy này: `artisan test` tạo subprocess không kế thừa tùy chọn `-d extension=pdo_pgsql`. Script concurrency chỉ chạy với database PostgreSQL test, 8 tiến trình submit và 8 withdrawal; tự dọn đúng fixture của nó. HTTP smoke chỉ chấp nhận localhost, dùng dữ liệu giả và rút thư trong finally, không ghi receipt token vào proof. Nó để lại tombstone/audit của dữ liệu giả trong database local.

Xem `proof/` và `F5_5_REPORT.md` cho kết quả thực chạy. Không cần chạy lại build game để dùng backend. Không sửa regression tests game nhằm cho qua kết quả.

## Trước khi triển khai thật (ngoài F5.5)

F5.7 đã có Live Wall cập nhật qua polling và trang gửi công khai riêng. Chưa có hosting/TLS/domain, tích hợp nút gửi trong game hoặc vận hành backup/restore. Khi có yêu cầu triển khai: document root chỉ public/, TLS, APP_DEBUG=false, ADMIN_SECURE_COOKIE=true, DB user quyền tối thiểu, giới hạn body tại reverse proxy, trusted proxies cụ thể, không log Authorization/X-Receipt-Token/X-Wall-Token/request bodies; kiểm tra chính sách lưu giữ và khôi phục. Không expose Docker Postgres ra mạng trường.

Nguồn framework: https://laravel.com/docs/13.x/installation và https://laravel.com/docs/13.x/sanctum. Lockfile thực tế và Composer audit là căn cứ dependency của bản này.
