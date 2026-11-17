# F5.5 — Báo cáo kỹ thuật và nghiệm thu

Ngày: 17/11/2026, Asia/Saigon. Phạm vi: backend/database/xác thực/giới hạn gửi. Không Admin UI, Live Wall hoặc nối API vào game. Không push/deploy.

## Kết quả triển khai

- Laravel 13.42.0, Sanctum 4.4.0, PHP 8.3.30 và PostgreSQL 17.11; dependency được khóa trong composer.lock.
- API version /api/v1, JSON, schema consent nghiêm ngặt, NFC tiếng Việt và giới hạn khớp editor.
- Mọi submission mới là pending. Không public listing và không nhận client-selected status/save/local/audience.
- Transaction + unique constraint chống trùng; receipt token 256-bit chỉ lưu hash. Retry không tự phát sinh lời nhắn khác.
- Người giữ receipt có thể đọc trạng thái và rút lại. Rút lại scrub 3 trường nội dung; giữ tombstone để không bị retry khôi phục.
- Staff provisioning bằng CLI, password ẩn, roles/gates riêng, token hash/expiry/revocation, inactive account bị chặn. Không user hoặc password mặc định.
- Database-backed throttling, CORS allowlist, no-store, audit không chứa nội dung/credentials; lỗi database không lộ SQL bindings.
- PostgreSQL local dùng project/volume Compose unwritten-f55 riêng; cổng DB 55455 và API 8055 chỉ ở loopback. Không đổi PHP mặc định của máy.

## Kiểm chứng thực chạy

| Kiểm tra | Kết quả |
|---|---|
| PHPUnit SQLite in-memory | 21 tests, 158 assertions PASS |
| PHPUnit PostgreSQL gratitude_test | 21 tests, 158 assertions PASS |
| Đồng thời PostgreSQL | 8 submit workers → 1 creation, 1 ID; 8 withdrawal workers → nội dung null, tổng 2 audit events |
| HTTP thật | 9 requests PASS: policy, reject consent false, create, retry, deny missing receipt, read status, deny anonymous staff, withdraw, replay withdrawn |
| Laravel config:cache / route:cache | PASS; HTTP smoke cũng chạy trên config/routes cache, sau đó clear cache phát triển |
| Pint | PASS |
| composer validate --strict | PASS |
| composer audit --locked | Không advisory, không dependency abandoned tại thời điểm chạy |
| OpenAPI | YAML parse PASS, 5 paths / 7 operations; chưa dùng validator OpenAPI độc lập |
| Game regression không sửa | finale.test.ts + letter-experience.test.ts: 10 tests / 2 files PASS |
| Hash 21 file Finale/save/audio được chọn bảo vệ | 0 thay đổi |

Bằng chứng ở proof/phpunit-sqlite.xml, phpunit-postgres.xml, concurrency.json, http-smoke.json, composer-audit.json và routes.json. Các XML là cùng 21 ca chạy trên hai database, không tính thành 42 ca chức năng khác nhau. Script concurrency tự dọn fixture trong database test. HTTP smoke dùng thư QA giả và rút lại; chỉ còn tombstone/audit cục bộ.

Lượt kiểm tra đầu phát hiện assertion CORS chưa đúng cơ chế single-origin của thư viện: thư viện trả origin được phép cố định, browser từ origin khác vẫn bị chặn. Đã sửa test kiểm tra đúng header và thêm trường hợp nhiều origin, không mở rộng CORS. Một lần gọi artisan test bị mất PDO pgsql trong subprocess; đã chuyển sang gọi PHPUnit trực tiếp với extension ở tiến trình test. Kết quả PostgreSQL nêu trên là lượt chạy thật sau sửa lệnh, không phải SQLite thay thế.

## Thay đổi và phối hợp workspace

Toàn bộ code triển khai ở backend/. Các nhóm chính:

- app/Http/{Controllers,Requests,Middleware}: API boundary, consent validation, auth và receipt.
- app/{Models,Enums,Services,Rules}: dữ liệu, trạng thái, transaction và giới hạn password.
- app/Console/Commands: tạo/khóa staff cục bộ.
- database/migrations, config, bootstrap/app.php, routes: schema, kết nối và route độc lập.
- tests/Feature, scripts, phpunit*.xml: QA, concurrency và HTTP smoke.
- composer.json/lock, compose.yaml, .env.example: dependency/môi trường riêng.
- README.md và openapi.yaml: vận hành và hợp đồng tích hợp.

Không sửa src/, package.json/package-lock.json, regression tests hoặc cấu hình build của game. Trong khi thực hiện, chat khác thay đổi src/cinematic/WorldRenderer.ts; đã giữ nguyên. Hash trước làm và kiểm tra sau ở ../backend-proof/source-before.json, concurrent-source-changes.json và protected-source-check.json. Các bản build/art/video F5.4 không bị ghi đè. Không chạy full build/E2E game trong F5.5 và không tuyên bố chúng đã được kiểm thử lại cho thay đổi của chat khác.

Composer lần đầu thiếu zip extension nên chuyển sang clone rồi bị gián đoạn. Thao tác dọn thư mục bị bộ xét duyệt tự động chặn; không cố xóa lại. Đã dùng archive ở thư mục tạm khác, chuyển phần .git khởi tạo gián đoạn sang backend-proof, và chỉ bật extension zip cho tiến trình PHP đang dùng. Backend không có .git lồng bên trong. Các file AGENTS/CLAUDE hướng dẫn cài thêm công cụ do template tải về sinh ra đã được bỏ khỏi backend; không sửa AGENTS hiện hữu của workspace.

## Giới hạn / điểm bàn giao F5.6–F5.8

- Backend local hoạt động; chưa triển khai hosting, TLS, backup/restore hoặc giám sát production.
- Chưa có API kiểm duyệt, UI Admin, realtime hay feed Live Wall. Status approved/rejected/hidden và gates chỉ là nền schema/quyền.
- Chưa có nút gửi server trong game. Thư riêng tư và trạng thái completion vẫn hoàn toàn theo cơ chế hiện tại.
- Nội dung đã tự nguyện gửi được lưu trong database; không mã hóa từng trường. Trước production cần quyền DB tối thiểu, bảo vệ ổ đĩa/backup và chính sách lưu giữ. Rút lại không được mô tả là xóa mọi backup.
- Rate limits cần tune theo số người dùng chung Internet trường; CORS và IP limit không phải hệ thống chống spam toàn diện.
- Với browser Admin, thiết kế session/CSRF riêng ở F5.6; không đưa bearer token vào localStorage.
- Chưa có tự phục hồi receipt bị mất, MFA, password reset UI hoặc quy trình thu hồi nội dung đang trình chiếu. Không giả lập các tính năng chưa làm.

Dừng ở F5.5. Tài liệu chạy và API trong README.md/openapi.yaml đủ để tiếp tục F5.6 sau khi được yêu cầu.
