# MASTER IMPLEMENTATION PLAN V2.0
## PROJECT 20:11 — THE UNWRITTEN LESSON
**Cuộc thi:** CODE THE THANKS 2026  
**Ngày áp dụng:** 16/11/2026  
**Trạng thái:** Locked narrative / UI design delegated to Codex / Ready to implement

---

## 1. Executive Summary

Một **Cinematic Interactive Narrative Web Game** (trải nghiệm 3–5 phút) kết hợp câu chuyện tri ân thầy cô, câu hỏi đạo đức về AI và các thao tác chơi thực sự. Người chơi khám phá một câu hỏi do nhà sáng lập của AI số một thế giới AION để lại năm 2046, đi qua ký ức sinh viên An và cô Vân lúc 17:05 năm 2026, rồi chứng kiến An trưởng thành thành người tạo AION.

**Lý do sản phẩm khác biệt:** Người chơi không chỉ nhìn một màn phim hay bấm Next, mà tự khám phá các bằng chứng, kiểm thử mô hình bằng hồ sơ của chính An, và thay cơ chế phán quyết cuối cùng bằng con đường hỗ trợ. Đoạn kết kết nối trải nghiệm với lời cảm ơn thật của người chơi.

**Đầu ra:** 01 website HTTPS trình duyệt, 01 trải nghiệm hoàn chỉnh 7 cảnh, 01 bản video demo dự phòng và bộ tài liệu/kiểm thử. Không phát triển app native, VR hay WebXR.

## 2. Product Goals / Non-goals

### 2.1 Goals (bắt buộc)
- Chạy toàn bộ **S00 → S06** mà không có lỗi chặn, không yêu cầu đăng nhập.
- Mở đầu 10 giây gây tò mò; S03 tạo cảm xúc; S04 tiết lộ đủ bất ngờ; S05 truyền thông điệp rõ; S06 có hành động tri ân.
- Có ít nhất 3 tương tác gameplay mang ý nghĩa đến cốt truyện, hoạt động bằng chuột và chạm.
- Bảo toàn các quyết định câu chuyện trong `STORY_CANON_V3.md`.
- Codex tự đề xuất một hệ thống UX/UI nhất quán, sử dụng thiết kế có chủ đích theo môi trường game và bối cảnh từng năm.
- Dùng tiếng Việt cho phần game chính; phụ đề đầy đủ, mute, skip phần thoại phụ, tiếp tục tiến trình.
- Chạy trên điện thoại phổ biến và laptop, mạng chậm hay audio/WebGL lỗi vẫn tiếp tục được.
- Có phiên bản release được cố định, kiểm thử và nộp trước hạn.

### 2.2 Non-goals (không triển khai trước hạn)
- VR, WebXR, kính thực tế ảo; thế giới mở; multiplayer đồng thời trong gameplay; hệ thống tài khoản;
- tự đào tạo mô hình AI, mô phỏng AI số một thế giới thật, real-time 3D nặng toàn màn;
- bảng điểm đạo đức, leaderboard lòng tốt, hàng chục nhánh truyện, 3D model chuyển động toàn thân phức tạp;
- các tính năng ngoài cốt truyện chỉ để trưng bày kỹ thuật.

## 3. Người dùng & trải nghiệm

**Đối tượng:** Giám khảo, sinh viên, thầy cô, khách Gala, người mở QR trên điện thoại.

**Một lượt chơi tiêu chuẩn:**
1. Mở URL → CTA “Bắt đầu”; có quyền bật/tắt âm trước khi chơi.
2. Thấy AION năm 2046 và bài toán người sáng lập để lại.
3. Trở về phòng thực hành sau giờ học năm 2026.
4. Tìm 3 dữ kiện về mô hình của An, sau đó thử bằng chính hồ sơ An.
5. Chọn góc nhìn để hiểu hạn chế của mô hình; làm một thay đổi có ý nghĩa trong giao diện.
6. Xem montage 20 năm và danh tính người sáng tạo AION được tiết lộ.
7. Tự hoàn thành thông điệp và viết lời tri ân; thấy ngôi sao của mình xuất hiện.

**Thời lượng mục tiêu:** 4:45 (cho phép dao động 3–5 phút). Không dùng timer cứng ép người chơi; mọi cảnh có nhịp riêng và cho phép tiếp tục sau tương tác.

## 4. Functional Scene Specification — 7 cảnh

| Cảnh | Khoảng thời gian | Mục tiêu cảm xúc | Tương tác P0 | Điều kiện hoàn thành |
|---|---|---|---|---|
| S00 — The World of AION | 0:00–0:27 | WOW, thế giới 2046 | Chạm/nhấp vào lõi AION để mở Founder Protocol | Cho thấy AION #1 trong thế giới game; chưa tiết lộ tên founder |
| S01 — The Final Question | 0:27–0:55 | Đặt vấn đề “tối ưu cho ai?” | Chọn một trong hai góc nhìn kết quả (completion vs left-behind) | Lưu `protocolView`, kích hoạt hồi tưởng |
| S02 — The Verdict | 0:55–1:32 | Thấy thất bại của An | Tìm/nhấp 3 hotspot: mục tiêu, danh sách bị loại, giới hạn hỗ trợ | Đủ 3 bằng chứng hoặc dùng trợ giúp rõ ràng |
| S03 — 17:05 / The Empty Chair | 1:32–2:40 | Sự kiên nhẫn của cô giáo | Thử hồ sơ An vào mô hình bằng kéo thả **hoặc** tap-select; chọn câu hỏi | Hiện `NOT RECOMMENDED`, cô Vân giúp An hiểu giới hạn của dự báo |
| S04 — The Human Choice | 2:40–3:28 | Trao cơ hội + cú twist | Thay `FINAL JUDGMENT` bằng `NEXT SUPPORT STEP`; chạm mốc 2046 | Thấy montage nỗ lực 20 năm và founder reveal An |
| S05 — The Unwritten Lesson | 3:28–4:08 | Thấu hiểu ý nghĩa | Kết nối 3 nguyên tắc từ bằng chứng, hoặc chọn hoàn thiện một câu | Khóa bài học: prediction != verdict; teacher gave a chance |
| S06 — Your Next Star | 4:08–4:45 | Tri ân và lan tỏa | Nhập lời nhắn và tạo ngôi sao; có lựa chọn bỏ qua | Đoạn kết hoàn chỉnh + CTA Chơi lại/Chia sẻ |

### 4.1 S00/S01: Quy tắc mở đầu
- Cho người chơi cảm giác AION là AI đa năng hàng đầu bằng **bối cảnh, tính năng, tác động trong thế giới hư cấu**, không bằng các số liệu tác động có vẻ là dữ liệu thật.
- Được dùng bảng hư cấu “GLOBAL AI INDEX #1 — 2046”; không ngụ ý đây là bảng xếp hạng có thật.
- Nhà sáng lập chỉ là bóng người/biểu tượng/giọng nói ẩn danh; không hiển thị tên, thẻ ID, ảnh lộ mặt gắn tên An ở S00/S01.
- Một lựa chọn tương tác có hậu quả về góc thông tin, không phải chấm đúng-sai.

### 4.2 S02/S03: Trọng tâm cảm xúc và mechanic
- **2026 là phòng thực hành đại học**, không phải THPT; các màn hình trong phòng là thiết bị/sản phẩm hợp thời điểm 2026. Không dán logo AION vào máy tính hoặc bài báo cáo 2026.
- Prototype của An là mô hình ưu tiên hỗ trợ học tập. Nó tối ưu xác suất hoàn thành, dẫn đến hệ quả bỏ qua một số người cần hỗ trợ nhất.
- Gameplay S02 có 3 hotspot thực sự cần tương tác. Mỗi điểm cung cấp một bằng chứng/hội thoại ngắn; có phản hồi khi mở.
- S03 ánh chiều 17:05, lớp đã tan, cô Vân kéo ghế đến ngồi. Cô không giải hộ hay hứa chắc chắn An thành công.
- Người chơi **chọn hồ sơ An → đưa vào mô hình**. Máy trả `NOT RECOMMENDED`; giữ một nhịp tĩnh để người chơi nhận ý nghĩa, sau đó cô Vân đặt câu hỏi.
- Tương tác bằng drag-and-drop *luôn* có đường thay thế `chạm hồ sơ` → `chạm vùng thử` cho mobile và người khó thao tác.

### 4.3 S04/S05: Twist và thông điệp
- Người chơi không "gian lận" để cho An kết quả đẹp hơn: họ phải thay đổi **chức năng sử dụng dự báo**, từ `FINAL JUDGMENT` sang `NEXT SUPPORT STEP`.
- Montage có mốc thất bại, thử lại, cộng sự/đội nhóm và quá trình trưởng thành; không ám chỉ một câu nói tạo thành công ngay lập tức.
- Cú reveal An là founder chỉ xuất hiện **sau khi gameplay S04 hoàn thành**.
- Hành động “kéo chiếc ghế” lặp lại ở 2046: An ngồi bên một người đang gặp khó khăn; biểu tượng truyền tiếp lòng tin.
- Thông điệp S05: AI giỏi cần biết giới hạn của dự báo và giúp mở rộng lựa chọn, không xóa đi cơ hội của con người.

### 4.4 S06: Gratitude Galaxy
- Nhập tối đa 200–300 ký tự, hỗ trợ tiếng Việt, hiển thị người nhận có thể để trống; không hỏi dữ liệu nhạy cảm.
- Khi hoàn thành, một ngôi sao (hoặc điểm sáng) xuất hiện trên client ngay cả khi backend không khả dụng. **Ghi rõ “Chỉ hiển thị trên thiết bị này”** khi chưa gửi lên server.
- Có trường hợp `pending_review`, `approved`, `rejected`, `failed` và thông báo phù hợp. Không tuyên bố “đã chia sẻ cộng đồng” khi chỉ lưu cục bộ.
- Nếu có gallery thật, chỉ load lời nhắn `approved` và API quản trị/kiểm duyệt trước khi công khai.
- Cho phép skip việc gửi và vẫn xem ending; không ép mọi người chia sẻ.

## 5. Gameplay Systems

### 5.1 Scene Engine
- Cảnh có ID S00..S06, precondition và event/transition minh bạch.
- Điều hướng Next/Back hợp lý; key scene không bị nhảy mất lần chơi đầu.
- Transition 200–600ms là gợi ý, tự điều chỉnh theo giảm chuyển động và test hiệu năng.
- Save `sceneId`, `evidence`, `choices`, `settings`, `gratitudeDraft` vào storage có version. Khi nâng schema có migration/reset an toàn.
- Reload trong S03/S04 phải phục hồi cảnh và dữ liệu đúng.

### 5.2 Empathy Checksum
Ba mảnh ghép:
- `accuracy`: kết quả dự báo có thể đúng theo chỉ số đã chọn.
- `blindSpot`: hồ sơ con người có bối cảnh và tương lai chưa được mô hình nắm đủ.
- `humanChoice`: thay vì loại bỏ, mô hình gợi ý bước hỗ trợ tiếp theo.

**Không có điểm thiện ác.** Không chấm người chơi tốt/xấu từ các lựa chọn. Những lựa chọn bổ sung có thể thay giải thích, nhưng vẫn hội tụ về một kết thúc chính.

### 5.3 Dialogue & Audio
- Tách lời thoại khỏi component; hỗ trợ tên, portrait (nếu có), subtitles, event `onComplete`.
- Audio phải là opt-in từ thao tác người dùng; có mute, điều chỉnh âm lượng nếu thuận tiện, phụ đề đầy đủ.
- Không tự động phát audio trước tương tác; nội dung vẫn hiểu được khi tắt tiếng.
- Nhấn Skip chỉ bỏ phần thoại/cinematic tùy chọn, không tự động hoàn thành câu đố P0.

### 5.4 Interaction Accessibility
- Touch targets tối thiểu khoảng 44 × 44 CSS px, focus visible, điều khiển bằng bàn phím cho thao tác quan trọng.
- Nếu browser không hỗ trợ WebGL, hiển thị bản 2D/Web/CSS thay thế nhưng vẫn hoàn tất câu chuyện.
- Không dùng cursor-only hotspot; có văn bản/hint.
- `prefers-reduced-motion` được hỗ trợ, có tắt hiệu ứng nếu cần.

## 6. Quyền tự chủ UX/UI của Codex

Codex **được quyền thiết kế và quyết định**: camera/góc game, hình học môi trường, bối cảnh scene, bảng màu, vật liệu, typography, bố cục HUD, panel dialog, transitions, iconography, animation, microinteractions và cách chuyển từ 2046 sang 2026.

Codex **không được quyền thay**: 7 cảnh, canon nhân vật, nhiệm vụ từng cảnh, ba hành động gameplay bắt buộc, điều kiện twist, quy tắc cộng đồng và giới hạn không VR.

Quy trình UI/UX đề xuất:
1. **Experience map** 7 cảnh → xác định user action và feedback.
2. **Creative exploration:** lập 2–3 hướng UI/UX ngắn dạng mô tả + prototype bằng code/wireframe; tự so sánh độ game-like, dễ đọc, khả thi.
3. **Chọn một hướng tốt nhất và dựng UI kit**: tokens, layout, typography, state hover/focus/touch, transitions.
4. **Dựng vertical slice S02→S03** có hình nền/scene, dialog, hotspot, drag/tap, trạng thái và kết thúc đoạn.
5. **Review screenshot desktop/mobile**, phát hiện lỗi, tinh chỉnh; chỉ khi chấp nhận được mới lan sang các cảnh khác.

Mục tiêu thiết kế: **trông như game tương tác có không gian thật**, tránh như infographic/trailer/poster hoặc dashboard doanh nghiệp. Hạn chế những xu hướng dễ thành hình AI đại trà: nền tím phát sáng phủ mọi scene, vô số ảnh chân dung lơ lửng, hạt sáng rối, bảng số giả và hiệu ứng kính liên tục.

Không bắt buộc dùng assets từ bộ ảnh minh họa cũ. Chỉ dùng hình/nhạc/font tự tạo hợp lệ hoặc được cấp phép; đưa bảng nguồn asset vào `docs/assets-license.md`.

## 7. Công nghệ và nguyên tắc kiến trúc

**Default stack (nếu repo trống):** React + TypeScript + Vite; CSS Modules/Tailwind (Codex chọn nhất quán); GSAP hoặc CSS animation khi cần; Three.js/R3F chỉ cho scene có lợi ích thực; Vitest cho unit, Playwright cho E2E. Không khóa version thư viện tại đây — xác nhận phiên bản tương thích tại lúc setup.

**Được thay stack** nếu repo hiện có đã có phương án tốt hơn và Codex chứng minh được lý do, rủi ro, compatibility. Không thay để chạy theo trend.

Architecture:
```text
AppBootstrap
 ├─ GameSessionStore / versioned save
 ├─ SceneRouter (S00..S06 + transitions)
 ├─ StoryContent (Vietnamese canon, dialogues, scene configs)
 ├─ InteractionEngine (hotspots, profile test, choice swap)
 ├─ CinematicStage (scene environments, audio, camera, 2D fallback)
 ├─ AccessibilityControls (subtitle, mute, reduceMotion)
 └─ GratitudeGateway (local ending / optional moderated server)
```

Suggested repo paths (adapt to existing code):
```text
src/app/
src/game/state/         scene/events/save
src/game/content/       story.v3.ts, dialogue.vi.ts, copy.vi.ts
src/game/interactions/  evidence, drag/tap, rule-switch
src/scenes/             S00..S06
src/ui/                 Dialogue, HUD, Choice, Hint, Navigation
src/visual/             environments, transitions, fallback
src/services/           gratitude client, moderation api types
tests/unit/ tests/e2e/
public/assets/
docs/                  screenshots, credits, QA evidence
```

## 8. Backend / API

**Ưu tiên không tạo phụ thuộc online cho gameplay chính.** Không đưa LLM vào tuyến bắt buộc của câu chuyện. AION trong game có thoại scripted: điều này là **nhân vật hư cấu**, không phải tuyên bố có một mô hình AI #1 vận hành thật.

Tầng Gratitude Galaxy:
- P0: nhập và hiển thị sao cục bộ, có nhãn trạng thái rõ ràng.
- P1: POST `/api/gratitude` qua server function: trim/sanitize, giới hạn ký tự, rate limit, anti-spam, trạng thái `pending_review`.
- P1: GET `/api/gratitude/approved` trả danh sách giới hạn và phân trang, không để lộ thông tin nhạy cảm.
- P1: admin duyệt/từ chối có authentication và audit, chỉ dùng nếu tích hợp thực sự.
- P2: Realtime feed Gala và moderation dashboard — chỉ triển khai khi P0+P1 an toàn.

**Security:** không đưa secret vào client, không inject HTML lời nhắn, không dùng `dangerouslySetInnerHTML` cho text người dùng, rate-limit endpoint, giới hạn độ dài/trùng lặp, không để người dùng lấy endpoint admin công khai.

## 9. Chất lượng, hiệu năng, quan sát

- Responsive: test ít nhất 360×800, 390×844, 768×1024, 1280×720, 1440×900. Test thực tế Chrome desktop, Safari iOS hoặc mô phỏng phù hợp, Chrome Android khi có thiết bị.
- Mục tiêu trải nghiệm: điều hướng không giật lớn, có progress/loading hợp lý; đối với 3D ưu tiên ≥30 FPS trên thiết bị thử trung bình, fallback nếu không đạt.
- Nén hình và audio; lazy-load asset theo scene kế tiếp; không download tất cả assets nặng ngay màn Start.
- Hiển thị rõ loading và hành vi khi lỗi; không khóa nút Start quá lâu; mạng không ổn định vẫn chạy được S00..S05.
- Log lỗi client và có chế độ demo/replay để trình diễn (không ghi dữ liệu cá nhân tùy tiện).

## 10. Phân lớp công việc & giảm rủi ro

### P0 — must ship
- S00..S06 đầy đủ, đúng canon và đủ 3 gameplay.
- UI/UX do Codex thiết kế, responsive, phụ đề, mute/skip, progress save/restart.
- Story ending có local star và trạng thái gửi minh bạch.
- Build production, HTTPS URL sau khi được phép deploy, video dự phòng, kiểm thử smoke.

### P1 — nếu P0 đã đạt
- Giọng đọc AION/cô Vân, polish animation, SFX, nhạc nền hợp lệ.
- Backend gratitude thật có kiểm duyệt và trang quản trị tối thiểu.
- Share card, accessibility sâu hơn, optimization theo đo đạc.

### P2 — chỉ sau nộp/hoặc không có rủi ro
- Realtime Galaxy, hiệu ứng 3D nâng cao, thêm góc camera, gala presentation mode.
- Hội thoại AI tạo sinh (nếu có use case rõ và fallback an toàn).

**Quy tắc cắt:** Không giảm chất lượng logic S03, S04, S05; nếu thiếu thời gian thì cắt thành phố 3D, cinematic dài, realtime và social animation trước.

## 11. Roadmap theo checkpoint (16–17/11)

| Gate | Mốc mục tiêu (VN) | Đầu ra / bằng chứng |
|---|---|---|
| G0 | 16/11, càng sớm càng tốt | Repo được audit, game skeleton tạo được, chạy local; tài liệu canon được import |
| G1 | 16/11, trong ngày | Đã dựng S00→S06 tối giản, state machine/Next/Save hoạt động; full flow chưa cần hình đẹp |
| G2 | 16/11, cuối ngày | S02→S03 visual slice + 2 gameplay chính đã chơi được trên desktop/mobile |
| G3 | 17/11, buổi sáng | S04 reveal, S05 lesson, S06 star, polish thiết kế nhất quán; test đầu cuối |
| G4 | 17/11, đầu giờ chiều | Fix lỗi P0, audit responsive/perf, video demo, fallback độc lập backend |
| G5 | **17/11, 17:00** | Release candidate được xác nhận, sẵn sàng nộp; còn buffer tới 20:00 |
| G6 | 18–19/11 | Chỉ tập dượt Gala, giữ nguyên bản nộp, nâng cấp bản demo riêng nếu cần |

Nếu bắt đầu muộn hơn mốc dự kiến, Codex không được "đuổi tiến độ" bằng cách tạo hời hợt cả UI; hãy giữ P0 narrative hoàn chỉnh + gameplay và cắt P1/P2.

## 12. Nghiệm thu & release

**Done means tested, not merely coded.** Cần có ít nhất:
- `npm run build` và `npm run lint` / typecheck thành công (lệnh tùy repo).
- E2E đường đi chuẩn S00→S06 và một nhánh lựa chọn thay thế.
- Refresh ở S03 rồi Resume không mất evidence.
- S03 drag/tap alternative hoạt động trên mobile.
- Reveal không lộ trước S04.
- Test không âm thanh và reduced motion.
- Không có client secret, lỗi XSS, lỗi UI gây không thể chạm, hoặc chữ tiếng Việt bị lỗi.
- Bản video demo và source commit/tag release (nếu người dùng cho phép), deploy production chỉ sau duyệt.

**Release URL:** dùng HTTPS và kiểm tra trên hai mạng/thiết bị độc lập nếu có. Lưu bản build offline/record để demo nếu mạng Gala không ổn định. Không đồng nhất "đã build" với "đã deploy" hay "đã nộp".

## 13. Kịch bản demo 3 phút cho BGK

1. **0:00–0:30:** AION hư cấu số một thế giới 2046; mở Founder Protocol; không tiết lộ An.
2. **0:30–1:05:** Điều tra kết quả tối ưu sai mục tiêu của mô hình 2026.
3. **1:05–1:55:** Cảnh 17:05, kéo hồ sơ An vào kiểm thử; cô Vân đặt câu hỏi quan trọng.
4. **1:55–2:30:** Người chơi đổi nhãn phán quyết → bước hỗ trợ; reveal người sáng tạo AION.
5. **2:30–3:00:** Bài học và lời cảm ơn biến thành ngôi sao (cục bộ hoặc đã gửi thật — mô tả đúng trạng thái).

Demo phải có điều khiển chủ động hoặc auto-advance an toàn cho người trình bày. Có clip dự phòng nếu mạng hoặc trình duyệt gặp sự cố.

## 14. Final implementation policy

- Codex chủ động thực thi theo milestone nhưng phải báo cáo rủi ro thực tế và bằng chứng, không chỉ viết kế hoạch rồi dừng.
- Người sở hữu dự án duyệt việc mở kết nối dịch vụ, sử dụng API mất phí, chia sẻ public, deploy, thay đổi DNS và quyền truy cập.
- Giữ nguyên code phiên bản đã QA; mọi nâng cấp sau nộp ở nhánh/môi trường riêng.
- Sau khi đạt P0, việc nào không phục vụ trực tiếp tiêu chí cuộc thi phải hoãn.
