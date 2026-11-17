# Giọng dẫn Hoài My

Theo lựa chọn của Product Owner: thay bảy câu dẫn mở đầu bằng vi-VN-HoaiMyNeural (+18%). Giữ nguyên lời dẫn, timeline 41,5 giây, camera, menu laptop, phòng học và phần thư. Chỉ phát giọng dẫn đầu game; các lời thoại sau vẫn có phụ đề.

Build tool: scripts/generate-opening-male.py --voice vi-VN-HoaiMyNeural --rate=+18% --folder vi-hoaimy-fast. Asset: public/voice/vi-hoaimy-fast/*.mp3. Manifest và catalog dùng đường dẫn mới để tránh cache giọng cũ.
Kiểm tra nhanh: typecheck, production build và 11 tests về lời dẫn/camera PASS. Preview: http://127.0.0.1:4228/ . Không chạy full regression; không deploy/push.
