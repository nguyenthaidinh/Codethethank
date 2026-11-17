# GAME QUALITY GATE SCORECARD — V4.0

## Hướng dẫn dùng
Mỗi Gate có hai cột đánh giá độc lập: **Technical PASS** và **Experience APPROVED**. Tích hợp code thành công không tự động cho phép đánh dấu game đẹp/hấp dẫn. Mỗi quyết định có ghi lại người đánh giá, link video runtime và vấn đề tồn đọng.

| Gate | Technical PASS khi | Experience APPROVED khi | Evidence |
|---|---|---|---|
| G0 Baseline | Scripts chạy, gameplay 00–03 và checkpoint xác thực | Các điểm yếu/hẫng được liệt kê từ playthrough | Test report + buglist + video |
| G1 Finale | Full-flow E2E, local save, skip, UTF-8/IME, offline, fallback | Kết cảm xúc, lời cảm ơn không giống form website | Recording 00–04 + cross-device |
| G2 Hero Art | Scene gameplay giữ input/hitboxes, render, FPS | Classroom chân thật, ánh sáng/props/nhân vật đồng nhất | Side-by-side runtime review |
| G3 Character/Cinematic | Rig/state/camera không hỏng save, chair motif sync | Cử chỉ và match-cut tự kể được câu chuyện | Clip không phụ đề + reviewer notes |
| G4 Sound | Audio lifecycle, buses, mute, subtitle, license | Mưa/ghế/nhạc tự nhiên, khoảng lặng tạo cảm xúc | Audio capture + cue sheet |
| G5 Gameplay | Không softlock, hint, mobile/keyboard input | Người mới hiểu mechanic, không thấy đang click slideshow | Novice playtest recordings |
| G6 Full polish | Build/perf/regression pass | Các chương có một visual direction nhất quán | Full game playthrough |
| G7 Device QA | Safari/Android/desktop, GPU fallback, store | Người chơi không gặp rào cản sử dụng | Device matrix + bug severity |
| G8 RC | License/credits/build/rollback đầy đủ | Product Owner ký duyệt kết quả cuối | RC tag + final report |

## Bugs severity
- **Blocker:** mất save, crash, chapter không thể hoàn thành, public share sai quyền.
- **Major:** camera mất focus, lỗi thoại/cue phá tình tiết, mobile interaction không dùng được, FPS tụt làm không chơi được.
- **Minor:** lỗi bố cục nhỏ, animation không liền, audio level chưa mượt.
- **Polish:** cải thiện phụ đề, hạt ánh sáng, chuyển động tinh tế.

**Gate chỉ PASS khi không có Blocker/Major chưa giải quyết** trong phạm vi của gate; Minor có thể nhận với kế hoạch khắc phục và người duyệt đồng ý.
