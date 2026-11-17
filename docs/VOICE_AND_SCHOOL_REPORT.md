<!-- OPENING_REFINEMENT:START -->
> **Đã được điều chỉnh theo yêu cầu tiếp theo:** production chỉ giữ 7 câu của người dẫn mở đầu, không đọc hội thoại. [Báo cáo hiện tại](OPENING_AND_CLASSROOM_REFINEMENT.md). Nội dung 106 clip bên dưới là lịch sử.
<!-- OPENING_REFINEMENT:END -->

<!-- VERIFIED:START -->
# Kết quả kiểm chứng — PASS chức năng

Typecheck, lint, **40 unit**, production build và **25 E2E** PASS: 14 gameplay/mute/pause/voice/school/IME/fallback/typography + 11 menu; zero skipped, flaky or unexpected. Chơi từ menu đến Credits với voice bật, không seed checkpoint trong bài kiểm tra toàn game: 74 câu bắt đầu, 43 câu hoàn tất; các câu còn lại có thể được ngắt bởi thao tác người chơi.

[Chơi game](http://127.0.0.1:4173/) · [Review có tiếng](http://127.0.0.1:5173/docs/voice-school-proof/review.html) · [Video runtime 31.2s](voice-school-proof/runtime/voice-scene.mp4) · [Kết quả máy đọc được](voice-school-proof/verification.json).

Đã kiểm tra desktop WebGL, touch/Canvas 390px, 360px khi mất audio/storage, reduced motion, mute, pause context thật, bật/tắt độc lập lời đọc/phụ đề, lỗi tải MP3, save cũ, reload, Unicode IME và malicious text. Test missing-clip chứng minh vẫn đi qua thoại/ghế khi toàn bộ MP3 bị chặn.

Lệnh đã chạy: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `node scripts/run-voice-qa.mjs`, `python scripts/report-voice-source.py`, `node scripts/record-voice-school.mjs`. Lệnh browser cụ thể/timestamp/hash build: [qa-execution.json](voice-school-proof/qa-execution.json); output trong cùng thư mục.

Snapshot 70 file nguồn: 55 giữ nguyên, 15 file tích hợp thay đổi, 4 file speech mới. Bộ xử lý các chương, motif ghế, nhân vật và mỹ thuật 2046 giữ nguyên theo SHA256. Yêu cầu thêm voice/tên trường của Product Owner là phạm vi mới, thay thế việc đóng băng đúng các file tích hợp này.

Bundle JS CinematicGame: 732,953 → 744,518 byte. MP3 thêm 2.863.453 byte, logo 459.960 byte, tải cục bộ theo nhu cầu; không thêm npm package vào game. Cảnh báo chunk >500 kB của Vite vẫn còn. Không đo lại hiệu năng trên thiết bị thật.

Video lấy frame CDP browser thật và âm trực tiếp từ master bus, H.264/AAC. Hình/subtitle/tiếng đọc/mưa/ghế thuộc cùng lượt chạy; không lồng giọng giả sau ghi hình. 936 frame thu được; 24 fps chỉ là nhịp mã hóa.

Lần dựng test đầu có selector phụ đề sai, snapshot trường đặt nhầm nhánh và checkpoint fixture không hợp lệ; đã sửa, lưu attempt-1/2 logs, rồi chạy lại bộ kiểm tra cuối trên cùng hash production. Không còn lỗi blocker trong các đường đã kiểm tra. Các bộ E2E khác của G2F.1 là lịch sử, không được tính vào 25 test lần này.

**Giới hạn:** một giọng đọc tổng hợp, chưa có dàn vai/thu diễn viên; chưa có đánh giá phát âm bởi người nghe, điện thoại thật hoặc Safari/iOS. Art vẫn chờ Product Owner; Gate 3 đóng. Không deploy/push/dùng dịch vụ trả phí.
<!-- VERIFIED:END -->

# Giọng đọc tiếng Việt và Trường Đại học Tây Nguyên

Ngày 17/11/2026. Phạm vi theo yêu cầu mới của Product Owner: thêm lời đọc, tùy chọn nghe/đọc và tên/logo trường trong phòng thực hành. Giữ nguyên nhân vật, camera, cốt truyện, các điều kiện tương tác và checkpoint; không mở Gate 3.

## Đã triển khai

- 106 đoạn MP3 tiếng Việt, tổng 347,83 giây, 2.863.453 byte. Chỉ tải câu đang cần đọc; không tải toàn bộ gói trước khi chơi.
- Đọc lời dẫn 2046, nội dung điều tra và thoại các chương đến kết thúc, cùng đường chơi cinematic cũ. Các chỉ dẫn môi trường trong ngoặc vuông giữ im lặng.
- Giọng đọc dùng cùng audio context và bus dialogue của game. Nhạc giảm khi có thoại, câu cũ dừng khi đổi tương tác; pause/mute dùng chung. Các nhịp tự chuyển chờ câu hiện tại kết thúc.
- Bật/tắt **Giọng đọc tiếng Việt** độc lập với **Phụ đề** trong Cài đặt/Tạm dừng. Lựa chọn được lưu trên thiết bị. Không tải được câu đọc vẫn tiếp tục chơi bằng phụ đề.
- Phụ đề khi vào phòng nói rõ **Phòng thực hành Trường Đại học Tây Nguyên · 2026 · 17:05**. Thêm biển tên và logo trên tường; bản Canvas có tên và logo riêng phù hợp khung hình hẹp.
- Credits có nguồn logo và giọng tổng hợp. Lời thư/tên người nhận không đưa vào hệ thống đọc hay dịch vụ bên ngoài.

Đây là **một giọng đọc tổng hợp** cho các vai, chưa phải bản thu diễn viên hay dàn giọng theo nhân vật. Phụ đề vẫn là lời thoại gốc; lớp đọc chuyển các nhãn tiếng Anh và năm/giờ sang cách đọc tiếng Việt.

## Nguồn asset

**Logo:** tải nguyên bản từ [ảnh trên website chính thức](https://www.ttn.edu.vn/images/Icon/logo.png), được trang chủ [Trường Đại học Tây Nguyên](https://www.ttn.edu.vn/) sử dụng. [Thông báo bộ nhận diện thương hiệu](https://www.ttn.edu.vn/index.php/thongbao/5981-1114112402) ngày 11/11/2024 là nguồn đối chiếu. PNG 1200×1200, 459.960 byte; không vẽ lại, không dùng AI sửa ảnh. Quyền sở hữu thuộc nhà trường; việc xuất hiện trong bối cảnh hư cấu không thể hiện trường bảo trợ game. Nguồn/hash: `public/school/PROVENANCE.txt`.

**Giọng:** [Piper vi_VN-vais1000-medium](https://huggingface.co/rhasspy/piper-voices/blob/main/vi/vi_VN/vais1000/medium/MODEL_CARD), do Michael Hansen/rhasspy phân phối; model card ghi dữ liệu VAIS-1000 theo CC BY 4.0. Game dùng MP3 được tạo offline bằng `piper-tts 1.8.0`, mono 22.050 Hz, 64 kbps, chuẩn hóa -18 LUFS. Có `MODEL_CARD.txt` nguyên bản và `ATTRIBUTION.txt` cạnh các clip. Không gửi thư cá nhân đi tổng hợp, không dùng API trả phí, không ship model/engine TTS vào browser.

## Source of truth / file thay đổi

| Phần | File |
|---|---|
| Chọn câu và cách phát âm | `src/speech/text.ts`, `catalog.json` |
| Phát/huỷ/tải câu, cache 12 buffer | `src/speech/VoicePlayer.ts`, `useNarration.ts` |
| Tích hợp nhịp game và settings | `src/chapter/ChapterGame.tsx`, `src/cinematic/CinematicGame.tsx` |
| Audio bus/duck nhạc | `src/cinematic/AudioDirector.ts`, `src/chapter/ChapterAudio.ts`, `src/menu/GameAudio.ts` |
| Tùy chọn và tương thích save | `src/cinematic/director.ts`, `src/menu/preferences.ts`, `saveBridge.ts`, `GameShell.tsx`, `MenuUI.tsx` |
| Tên trường / biển hiệu / fallback | `src/chapter/director.ts`, `src/art/ClassroomArt.ts`, `src/cinematic/WorldRenderer.ts`, `FallbackWorld.ts` |
| Nguồn asset trong Credits | `src/finale/FinaleControls.tsx` |
| Sinh asset offline | `scripts/collect-voice.ts`, `scripts/generate-voices.py` |

Snapshot trước thay đổi: `voice-school-proof/before-source.zip`, kèm hash. Báo cáo diff sau kiểm chứng: `voice-school-proof/source-verification.json`. Các bộ giảm trạng thái Verdict/Stayed/Ripple/Finale, motif ghế, tạo hình nhân vật và mỹ thuật tương lai không thuộc phạm vi sửa.

## Tạo lại lời đọc

Python venv `.voice-build/` là công cụ build cục bộ, được ignore. Cần Python, `piper-tts==1.8.0`, ffmpeg/ffprobe và ba file upstream trong thư mục này: `vi_VN-vais1000-medium.onnx`, `.onnx.json`, `MODEL_CARD`. URL nguồn/model SHA256 có trong `voice-school-proof/voice-manifest.json`.

```powershell
node --input-type=module -e "import {build} from 'esbuild';await build({entryPoints:['scripts/collect-voice.ts'],bundle:true,platform:'node',format:'esm',outfile:'.voice-build/collect.mjs'});"
node .voice-build/collect.mjs
.\.voice-build\Scripts\python.exe scripts/generate-voices.py
```

Script dùng cache espeak tại `%LOCALAPPDATA%/UnwrittenVoiceBuild` để tránh lỗi đường dẫn Unicode của thư viện native trên Windows. Khi đổi lời thoại, chạy lại collector/generator; không sửa catalog bằng tay. Giữ file ghi công khi đóng gói.

## Kiểm chứng

Browser QA trên bản production đã hoàn tất; kết quả cuối, lệnh và hash build nằm ở đầu báo cáo và trong `voice-school-proof/verification.json`. Không dùng kết quả G2F.1 cũ để chứng nhận thay đổi này. Chưa kiểm chứng trên điện thoại thật/Safari hoặc đánh giá chất lượng phát âm bởi người nghe.
