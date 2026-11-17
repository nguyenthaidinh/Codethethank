# Gate 2R — QA thực tế

**PASS chức năng trên bản khóa: 30 unit + 39 E2E, lint/typecheck/build. Art chờ Product Owner; Gate 3 đóng.** Product Owner đã đánh FAIL art bản Gate 2 cũ; không kế thừa art PASS từ kiểm tra kỹ thuật. Hiệu năng thiết bị thật chưa được xác nhận.

## Phạm vi

Đổi sáu source: `src/art/ClassroomArt.ts`, `src/art/NarrativeActors.ts` (mới), `src/art/NarrativePalette.ts` (mới), `src/art/narrative.css` (mới), `src/cinematic/WorldRenderer.ts`, `src/chapter/ChapterGame.tsx` (chỉ import CSS và class scope). Thêm runner/capture/report và cấu hình video riêng. Test option art cũ `grounded` được cập nhật thành `blue-ink`, không bỏ assertion gameplay hoặc nới budget.

SHA-256 trước reset lưu trong `proof/before/all-source-hashes.json`. `scripts/report-art2r.mjs` đối chiếu toàn bộ source, các reducer/motif bảo vệ, source đã build và bundle. Không có Git metadata để cung cấp commit/diff Git; danh sách hash là bằng chứng phạm vi thực tế.

## Lệnh và kết quả

Runner: `powershell -NoProfile -File scripts/run-art2r-qa.ps1`.

| Lệnh | Kết quả bản cuối |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 30 tests / 8 files |
| `npm run build` | PASS — có warning chunk lớn 500 kB của Vite |
| `npx playwright test --config playwright.art2r.config.ts --trace off` | PASS — 5/5 trên source khóa, 5.9 phút; native video off, canvas/audio vẫn ghi thật |
| `npx playwright test --trace off --grep-invert "G2 hero"` | PASS — 23/23, 31.0 phút |
| `npx playwright test --config playwright.menu.config.ts --trace off` | PASS — 11/11, 21.6 giây |
| `node scripts/inspect-2r.mjs http://127.0.0.1:4173/` | PASS — 10/10 ảnh production, kiểm tra hash index và đúng camera/line |
| `node scripts/report-art2r.mjs` | PASS — source/hash, bundle, video/audio và số đo host |
| `node scripts/package-art2r.mjs` | PASS — 13 file trong ZIP khớp byte với dist |
| `node scripts/inspect-art2r-review.mjs` | PASS — 15 ảnh, video phát thật, desktop/mobile không tràn ngang |
| `node scripts/finalize-art2r-status.mjs` | PASS — đối chiếu source đã test, ảnh production, review và archive |

Log lệnh và status máy đọc: `proof/after/*.log`, `proof/after/status.json`. Không suy ra PASS cho việc chưa chạy xong.

Lượt **Start từ menu → hoàn tất kết thúc tri ân** trên source khóa đã PASS, không seed checkpoint; thời gian test 5.7 phút gồm thao tác/chờ của automation, không dùng làm cam kết thời lượng hoặc FPS thiết bị thật. Hai nhánh mobile 390 tap/mute/reduced motion/resume và 360 lỗi audio/storage/GPU fallback cũng đã PASS.

## Lỗi tìm được và đã sửa

1. Lint phát hiện tham số roughness còn lại sau chuyển vật liệu minh họa. Xóa tham số/API dư; lint chạy lại PASS. Giữ `lint-initial-failure.log`.
2. Hero lần đầu: 4/5 PASS; diagnostics bắt `mergeGeometries` không đồng nhất UV ở tóc tự dựng. Thêm UV thật vào shell tóc; không lọc console error hoặc nới assertion. Giữ `hero-initial-failure.log` và `renderer-initial-failure.json`.
3. Khi xem ảnh runtime: tóc kiểu polygon bị thủng, laptop che mặt An, đầu cô Vân che trang sổ. Đổi shell tóc liền khối, đặt lại camera và mở vùng sáng mặt; không thay bằng ảnh minh họa.
4. FXAA toàn màn hình trên software renderer làm tăng chi phí. Tier chậm sau warm-up giảm render scale và bỏ FXAA; hình học/input không đổi, UI/subtitle HTML giữ độ phân giải viewport. Cần đo lại bằng chứng bản cuối, không suy ra FPS thiết bị thật.
5. Rà thêm shot hai người phát hiện laptop che mặt, góc portrait nhìn sau đầu. Đặt camera giữa màn hình và người; mobile dùng cận cô Vân. Chủ động dừng lượt QA trước khi khóa source cuối, giữ log tại `interrupted-before-final-framing/`; lượt đó có 7 bài PASS, gồm Start→Credits 5.7 phút, không được tính là cả bộ PASS trên bản cuối.
6. Native Playwright video bị treo teardown trên host sau khi desktop đã viết `desktop-complete.json`; chờ nhiều phút vẫn chưa trả kết quả test. Dừng riêng process test/recording của tác vụ, giữ log và completion snapshot tại `native-video-teardown-hang/`. Chạy lại với native video off; vẫn ghi canvas + audio MediaRecorder thật, không bỏ assertion gameplay, không nới timeout hoặc budget. Không đưa bản toàn-browser chưa hoàn tất vào gallery.
7. `Compress-Archive` của Windows gặp khóa file `dist/menu/canopy.webp`. Đổi sang đọc file bằng Node/fflate đã có trong Three.js; giải nén lại và đối chiếu từng file. Không thay đổi game hoặc asset. Giữ lỗi tại `archive-initial-failure.json`.

## Bằng chứng

- Before: bản Gate 2 liền trước reset trong `proof/before/runtime/`; build lưu zip riêng. Không ghi đè bằng ảnh G1.
- After: `proof/after/runtime/`; snapshot telemetry không chứa thư riêng. Các checkpoint dùng cho ảnh cận là save hợp lệ đi qua Continue; video hero và E2E desktop thực sự đi từ menu qua điều tra/chạy hồ sơ/kéo ghế/viết sổ.
- PNG của browser có HUD/subtitle. Capture script dùng debugger freeze để ổn định camera; đây là ảnh composited browser, không chỉnh pixel. Preset ảnh không đại diện mọi frame của chuyển động.
- `teacher-chair-notebook-live-audio.webm`: MediaRecorder từ canvas game + stream audio đang phát; HTML HUD/subtitle không nằm trong canvas.
- `hero-demo.webm`: remux từ bản canvas có audio, không thêm nhạc, đổi tốc độ hoặc đổi âm lượng. Native toàn-browser video không hoàn tất trên host; PNG là bằng chứng overlay. Không ghép âm vào bản hình khác hoặc dùng video cũ cho build cuối.

Video cuối **55.701 giây, 1280×720 VP8 + Opus 48 kHz**, 2,785,030 bytes. Âm trung bình -36.9 dB, đỉnh -19.2 dB; có âm thật, không tăng âm lượng hậu kỳ. Frame pace phụ thuộc host, không suy ra 24 FPS ổn định từ yêu cầu `captureStream(24)`.

## Bundle, source và chi phí render

| Mục | Trước reset | Bản khóa |
|---|---:|---:|
| Cinematic JS | 638,427 bytes | 676,701 bytes |
| Chênh lệch | — | +38,274 bytes / +5.995% |
| gzip cinematic | 167.73 kB | 180.58 kB |
| Host warm wide rAF p50 | 66.7 ms | 116.6 ms |
| Host warm wide rAF p90 | 83.4 ms | 116.7 ms |
| Render scale khi đo | 0.65 | 0.65 |

**Số đo trên SwiftShader chậm hơn bản trước.** Cùng logical scene, audio bật, warm-up 10 giây và không chạy browser automation khác khi đo; camera/art đã đổi và các ứng dụng khác trên host không được kiểm soát. Đây không phải GPU timer, phép đo nhân quả tách biệt hoặc cam kết FPS. Không ghi performance PASS cho điện thoại/native GPU; cần đo thiết bị thật trước bước mở rộng.

SHA-256 `dist/index.html`: `20728C143C0B97912AEFEA406A35C8F6A4792FE49BBBCB6E9B211AD68666A729`. `integrity-and-bundle.json` xác nhận đúng **6 source thay đổi**, reducer/motif bảo vệ giữ nguyên và toàn bộ source còn khớp bản đã test. Story, audio, menu và fallback source không đổi. Build ZIP 968,440 bytes; 13 entry đã giải nén/đối chiếu byte. Không deploy/push.

## Giới hạn và bước kế tiếp

Desktop Chromium và touch emulation không thay thế thử điện thoại thật, màn hình thật hoặc người chơi độc lập. Headless dùng SwiftShader; interval rAF là thời gian host, không phải GPU timer hay cam kết FPS. Fallback 2D giữ chức năng, chưa đạt chi tiết như WebGL.

Chỉ duyệt art hero slice sau khi xem ảnh và chuyển động. Không mở Gate 3, không deploy/push, không tích hợp community backend. Không tuyên bố “AAA” hoặc đã hoàn tất phát hành.
