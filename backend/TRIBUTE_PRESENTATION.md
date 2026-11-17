# AION — Trình chiếu lời cảm ơn

## Phạm vi

Chế độ tri ân trong `/admin/stage`, sử dụng máy chiếu `/live-wall` đã ghép. Không sửa game, save/checkpoint, completion hoặc thư riêng tư. Không push/deploy.

Thứ tự: 13 lượt thầy cô trong `config/tribute.php` → danh sách bổ sung → danh sách người chơi nhập bởi người vận hành. Hai lượt **Thầy Tuấn** có ID khác nhau, giữ đúng yêu cầu. Chưa có danh sách bổ sung/người chơi thực tế; không tự thêm tên hoặc suy ra toàn bộ người chơi từ người gửi lời công khai.

## Vận hành

1. Mở bảng sân khấu và ghép máy chiếu. Mở màn hình nếu đang Emergency Blank.
2. Nhập mỗi tên một dòng vào hai ô tương ứng; tên trùng giữ nguyên. Tối đa 1.000 tên bổ sung/người chơi, mỗi tên 80 ký tự. Chỉ nhập tên được phép trình chiếu công khai.
3. Chọn 4–12 giây/tên; mặc định 4 giây. Thời lượng dự kiến cập nhật ngay.
4. Bấm **Bắt đầu tri ân từ đầu**. Máy chủ chốt danh sách hữu hạn; sửa ô nhập không tác động lượt đã chạy. Bấm bắt đầu lần nữa thay thế lượt đang chạy và chạy lại từ đầu.
5. Tại máy chiếu bấm **Bật âm thanh** hoặc **M**. Đây là thao tác mở âm thanh theo chính sách trình duyệt; preview Admin luôn im lặng. **F** toàn màn hình.
6. Hết tên cuối: giữ màn kết, giảm nhạc trong 5 giây rồi dừng. Bấm **Kết thúc tri ân · trở lại lời chúc** để về Live Wall.

**Emergency Blank** hủy lượt tri ân và dừng âm thanh khi máy chiếu nhận lệnh. B/Escape che và tắt nhạc ngay tại máy chiếu; R bỏ che cục bộ. Mất kết nối quá lease 6,5 giây hoặc chuyển tab cũng tắt nhạc và che nội dung. Kết nối trở lại tiếp tục theo đồng hồ máy chủ; không có chức năng tạm dừng danh sách ở sprint này.

## Nhạc và hình ảnh

Âm thanh AAC được tách nguyên luồng từ video người dùng cung cấp `F:\Dự Án Chung\1794926150961_189217728750279461_1924226268465583921.mp4`; không hiển thị video/lời bài hát. Bản phục vụ là `public/wall/thank-you.m4a` (~914 KB), dài khoảng 60 giây. Nhạc lặp bằng HTMLAudioElement; không cam kết crossfade liền mạch tại điểm nối. Chỉ bắt đầu phát khi người vận hành cho phép; fade đầu/cuối điều chỉnh volume.

Danh sách tên màu ivory cỡ 48px tại 1920px, cuộn một lượt dài ở giữa; nhãn nhóm xuất hiện theo đúng thứ tự. Nền navy/steel, nhãn cyan tiết chế, chỉ số amber. Hai cột lời chúc công khai vẫn bay hai bên, kể cả khi trước đó sân khấu ở Manual. Dùng lại lồng đèn canvas và pháo hoa có giới hạn hạt; không tạo thêm renderer. Bố cục 16:9 và mobile; reduced motion chuyển sang từng nhóm bốn tên đứng yên, chữ DOM vẫn hoạt động khi canvas không khả dụng.

## Kỹ thuật và kiểm thử

- Migration cộng thêm duy nhất cột JSON nullable `wall_states.tribute`. Không sửa submissions, saves hoặc game API.
- Start yêu cầu session staff/control-stage, CSRF, revision hiện tại và màn hình đã mở. Blank chấp nhận revision cũ như trước. Lệnh điều khiển lời chúc không chen ngang lượt tri ân.
- Đồng hồ máy chủ quyết định vị trí danh sách cuộn; không tự kéo dài danh sách với người mới. Mỗi máy chiếu tự mở âm thanh; không đồng bộ sample âm thanh giữa nhiều máy.
- Nội dung được Blade escape/textContent; audit chỉ lưu loại hành động, không ghi danh sách tên.
- PHP/Pint và JS syntax được kiểm tra. Backend PostgreSQL: 47 tests / 349 assertions PASS; sau bổ sung guard chạy lại Tribute + LiveWall: 13 tests / 65 assertions PASS.
- QA trình duyệt: `node scripts/qa-tribute.mjs`; dữ liệu/ảnh kết quả trong `proof-tribute/`. Script chỉ tạo tài khoản thử ở DB `gratitude_wall_review`, không xuất mật khẩu/token; dùng trình duyệt riêng.
- Kết quả QA runtime PASS: phát âm thanh thực và quay vòng qua cuối file; tên cuối là lượt Thầy Tuấn thứ hai; màn kết dừng âm thanh; B/R, Emergency Blank, mất kết nối đều xử lý âm thanh đúng; mobile 390×844 và reduced motion không tràn ngang. `proof-tribute/qa.json` không có page errors. Mốc thời gian cuối danh sách được tăng tốc ở lớp kiểm thử; audio loop được kiểm tra bằng seek gần cuối media thực.
- Không chạy lại build game vì thay đổi chỉ nằm ở backend, Blade và asset trình chiếu. Các lỗi baseline game từ công việc song song vẫn được ghi riêng ở báo cáo F5.8.

## Nhóm file

Mới: `config/tribute.php`, migration `000004`, `TributeService`, `TributeTest`, `tribute-controls.blade.php`, `public/wall/tribute.js`, `tribute.css`, `thank-you.m4a`, `scripts/tribute-fixture.php`, script QA ở root `scripts/qa-tribute.mjs`.

Tích hợp nhỏ: `WallState`, `LiveWallService`, `StageController`, routes admin/wall, views stage/screen, `wall.js`, `stage.js`, CSS form và `.gitignore` proof. File ở `src/` không được chỉnh sửa trong phần tri ân này.

## Điều chỉnh theo duyệt — danh sách cuộn

Danh sách cuộn liên tục bằng Web Animations, thời gian tổng vẫn bằng số tên × nhịp giây/tên. Đồng hồ máy chủ đồng bộ vị trí; resize đo lại chiều cao, không tạo thêm lượt hoặc lặp danh sách. Tên trùng giữ nguyên. Nhạc và Emergency Blank giữ nguyên lifecycle. Ở chế độ thường, nhiều tên hiện cùng lúc trong vùng giữa, hai bên dành riêng cho lời chúc.

## Duyệt tốc độ và tiêu đề

Tốc độ mặc định tăng gấp đôi: 4 thay vì 8 giây/tên; 13 tên cuộn trong 52 giây, cộng 5 giây giảm âm ở cuối. Trên cùng giữ tiêu đề cố định “Cảm ơn” màu amber, serif nghiêng, cùng dòng “Vì đã cùng viết nên câu chuyện này.” Hai bên tiếp tục lời chúc. Admin vẫn có thể chọn nhịp 4–12 giây/tên.

## Bản tri ân trong game — hiệu ứng hai bên

TeacherTribute dùng TributeCelebration: 16 lồng đèn canvas từ art Live Wall, pháo hoa giới hạn bốn cụm × 28 tia, DPR tối đa 1,5, khoảng 30 fps. Sáu lời chúc biên soạn được ghi nhãn là nội dung chương trình, không giả làm lời gửi của người chơi và không đọc thư riêng tư. Chưa nối feed lời nhắn sự kiện vào game.

Nhạc từ video người dùng ở public/audio/tribute/thank-you.m4a, mở bằng nút Bật nhạc tri ân; lặp, giảm âm năm giây cuối, dừng tại giây 57. Đóng dialog hoặc chuyển tab dừng âm thanh. Reduced motion giữ cảnh tĩnh, không pháo hoa. Kiểm tra Playwright desktop/mobile, phát audio thực và pause sau unmount PASS; typecheck/lint PASS. Cổng game giữ 4198, tải lại để nhận thay đổi.

## Live Wall trong game

Đã thay sáu lời biên soạn bằng GET /api/v1/wall/game-feed: chỉ đọc tối đa sáu lời công khai mới nhất từ cùng điều kiện eligible của LiveWallService. Không cần token máy chiếu, không có quyền Admin, không tick đồng hồ sân khấu, không trả receipt/hash hoặc dữ liệu cá nhân ngoài các trường đã công khai. Game poll tuần tự 1,5 giây, timeout 3,5 giây; mất kết nối/ẩn tab/unmount xóa nội dung hoặc hủy request. Không lưu feed vào storage. Hidden/withdrawn bị loại ở lần poll kế tiếp; Emergency Blank trả danh sách rỗng. Màn hình tri ân và nhạc vẫn chạy khi phần lời chúc bị che.

Không gửi tự động từ game, không đọc thư riêng tư, không đổi reducer/save/completion. Consent hiển thị giải thích rõ phần lời chúc trực tiếp trong game. Rate limit riêng 6.000 request/phút/IP để hỗ trợ nhiều thiết bị chung Wi-Fi; đây là polling gần realtime, không phải push/SSE. Không hứa mỗi lời được chiếu trọn khi hơn sáu lời đến cùng lúc. Không push/deploy.

## Nhạc thay ngày 18/11 — yêu cầu mới thay thế giới hạn cũ

Nguồn mới: F:\Dự Án Chung\1794936859859_189217728750279461_1924226268465583921.mp4, AAC khoảng 41,4 giây, tách nguyên luồng. Game và Live Wall dùng cùng bản nhạc; URL có phiên bản tránh cache cũ. Bỏ dừng ở giây 57 và bỏ fade cuối danh sách: nhạc lặp khi cảnh tri ân còn mở, kể cả màn kết. Tắt nhạc, đóng cảnh, Emergency Blank hoặc ẩn tab vẫn dừng.

## Tự phát nhạc trong game

Theo yêu cầu mới: khi TributeCelebration mở, thử phát ngay và lặp liên tục. Không cần bấm bật nhạc nếu trình duyệt cho phép (người chơi đã tương tác với game). Nút Tắt nhạc vẫn hoạt động; đóng cảnh/unmount hoặc ẩn tab dừng nhạc. Trình duyệt chặn autoplay thì hiển thị thông báo và nút bật, không giả báo đang phát. Không thay đổi save/completion hoặc thư riêng tư.

## Live Wall tự phát nhạc

Máy chiếu thử phát ngay khi nhận ID lượt tri ân mới, loop liên tục. Poll cùng lượt không ghi đè thao tác tắt nhạc. Preview Admin không phát. Khi trình duyệt chưa cho phép autoplay, nút yêu cầu thao tác trực tiếp tại máy chiếu; thao tác trong Admin không cấp quyền âm thanh cho cửa sổ khác. Emergency Blank, local blank, hết lease và đóng trang vẫn pause.
