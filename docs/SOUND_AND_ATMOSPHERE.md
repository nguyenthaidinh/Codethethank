# SOUND & ATMOSPHERE DESIGN — AUDIO DIRECTOR V1

**Mục tiêu:** Âm thanh dẫn dắt sự chú ý và nhịp cảm xúc, không chỉ là playlist phát dưới mọi màn. Thời tiết và vị trí trong không gian có thể nghe được. Mọi âm thanh phải có subtitle/visual tương ứng khi cần hiểu câu chuyện.

## Sound cue library (có thể synth + foley hợp pháp)
| Cue ID | Nguồn trong thế giới | Cách dùng | Quy tắc mixing |
|---|---|---|---|
| `amb.city2046` | tiếng thành phố xa | S00/S01 | nhỏ, rộng, không che thoại |
| `amb.core` | hum máy AION | S00/S01, S04 | tăng dần theo camera đến gần |
| `sfx.protocol` | âm thanh terminal | S00/S01 | click+low confirmation, ngắn |
| `amb.classroom` | quạt máy, lớp vắng | S02/S03 | nền tự nhiên, không loop quá lộ |
| `amb.rain.window` | giọt mưa lên kính | S02/S03 | **rõ hơn khi camera focus vào cửa sổ**, giảm khi focus laptop |
| `sfx.bell` | chuông tan học | đầu S02 | phát một lần, có tail tự nhiên |
| `sfx.steps.depart` | bước chân xa dần | S02 | spatial pan/distance hoặc âm lượng giảm dần |
| `sfx.door.close` | đóng cửa lớp | S02 | 1 lần, không dồn dập |
| `sfx.keyboard.stop` | An ngừng gõ | S02 | là nhịp cắt âm giàu ý nghĩa |
| `sfx.teacher.steps` | cô Vân trở lại | đầu S03 | tiếng gần từ hành lang |
| `sfx.chair.drag` | chân ghế kéo | S03 và S04 | **reuse chính một recording** ở 2 thời điểm để match-cut |
| `sfx.laptop.eval` | mô hình 2026 chạy | S03 | click/processing nhỏ, không hù dọa |
| `sfx.verdict` | kết quả NOT RECOMMENDED | S03 | một nhịp thấp rất ngắn; rồi tắt music 1–2s |
| `sfx.enter2046` | bấm Enter/commit | S04 | lặp motif từ 2026 để kết nối thời gian |
| `music.memory` | piano thưa, hơi thở | S03/S05 | vào rất muộn, không ép khóc |
| `music.reveal` | vài nốt mở rộng | S04 | tiết chế, sau match-cut mới tăng |
| `sfx.star` | note biến thành sao | S06 | ánh sáng ấm nhẹ, không fanfare |

## Audio narrative timeline
- S00–S01: âm điện tử lạnh, khoảng trống, mở một nhịp tò mò.
- S02: tiếng đời thường chiếm vai chính (chuông/giày/quạt/mưa); nhạc gần như mất.
- S03: sự hiện diện cô Vân gắn với **tiếng ghế**, không nhạc lớn; sau kết quả mô hình, **duck gần hết nhạc**, giữ ambience để thấy sự cô đơn.
- S04: tiếng Enter chuyển thành nốt cao; 20 năm montage bằng nhịp âm hành động; **replay chair cue** đúng lúc.
- S05: lặng một nhịp sau câu then chốt rồi piano trở lại; tránh phát thoại triết lý liên tục.
- S06: tiếng gió nhẹ/âm không gian, một tiếng 'ngôi sao' rất nhỏ khi gửi lời nhắn.

## Implementation contract
- AudioContext chỉ `resume()` sau CTA người dùng click/tap; hỗ trợ browsers chặn autoplay.
- Phân bus `master / ambience / foley / music / dialogue`. `ambience` duck dưới thoại, `music` mute xuống khi verdict.
- Crossfade khi đổi cảnh; dừng loop cũ đúng lúc, không gây rò rỉ/trùng audio. Không sử dụng autoplay nhạc trước tương tác.
- Settings: Master volume, Music, SFX, Mute; captions mặc định ON; save locally.
- Soundscape có `audioFallback`: nếu thiếu asset thì chạy bản procedural Web Audio nhẹ + phụ đề/visual; không tải nhạc không rõ bản quyền; không để demo hỏng vì asset 404.
- Responsive audio: không phụ thuộc headphones/định vị stereo; người dùng nghe loa điện thoại vẫn hiểu.
- QA cần quay 20–30s màn hình **có âm thực**, không chỉ screenshot tĩnh.
