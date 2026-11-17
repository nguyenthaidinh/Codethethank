# Hotfix dấu tiếng Việt — 16/11/2026

**Đã sửa lỗi hiển thị dấu sắc/huyền và các dấu Việt bị tách khỏi nguyên âm.** Không sửa lời thoại/canon, không đổi gameplay, checkpoint hoặc mở Gate 3.

## Nguyên nhân đã xác nhận

Chromium trên máy này dùng đồng thời Georgia (64 glyph) và Times New Roman (4 glyph) cho câu thử chỉ có 62 ký tự hiển thị. Georgia thiếu glyph/định vị dấu Việt phù hợp, nên trình duyệt phân rã một số chữ có hai dấu và lấy glyph từ font khác. Kết quả đúng lỗi “Đố ́i”, “Đề ̀”, “dự kiế ́n” người dùng báo. [Ảnh trước](before-fonts.png), [font thực tế trước](before-fonts.json).

## Sửa trong source

- Dùng **LessonSerif**, bản Noto Serif Latin + tiếng Việt đóng gói local, cho toàn bộ serif tiếng Việt ở UI, subtitle, tiêu đề, tab/nút, sổ, thư, Canvas và SVG. Giữ Georgia ở logo tiếng Anh của menu.
- Ba WOFF2 normal/bold/italic tổng 146,760 bytes; kiểm tra đủ các ký tự Việt U+1EA0–U+1EF9, ă/đ/ĩ/ũ/ơ/ư và các dấu tổ hợp, giữ GPOS/GSUB. Không gọi Google Fonts trong lúc chơi. Nguồn [Google Fonts/Noto Serif](https://github.com/google/fonts/tree/main/ofl/notoserif), license SIL OFL 1.1 kèm `public/fonts/OFL-NotoSerif.txt`; hash và nguồn trong `font-manifest.json`.
- Chờ font trước lần vẽ Canvas đầu để texture không giữ lại glyph fallback. Có timeout và local Times fallback khi font file không tải được.
- Chuẩn hóa NFC trước giới hạn độ dài thư, sau khi hoàn tất IME theo luồng hiện hữu. Chia grapheme cho wrap/reveal trong Canvas để không cắt giữa nguyên âm và dấu. Chuẩn hóa nhãn decomposed trong WorldRenderer; không đổi từ ngữ.
- Áp dụng font đúng cho cả trang review HTML. Ảnh/video Gate 2R cũ được giữ như lịch sử; ảnh hotfix mới lưu riêng ở đây.

File chính: `src/typography/{fonts.ts,text.ts}`, `src/main.tsx`, `public/fonts/*`; các khai báo serif trong `src/{art,menu,cinematic,stayed,ripple,finale}` và legacy `style.css`/`Environment.tsx`; `finale/letter.ts`, `finale/{FinaleVisual,Fallback}.ts`, `stayed/Notebook.ts`.

## Kiểm chứng mới trên hotfix

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 33 tests / 9 files |
| `npm run build` | PASS — warning chunk lớn hiện hữu |
| `npx playwright test tests/e2e/cinematic-typography.spec.ts --trace off` | PASS — 4/4 |
| `npx playwright test --config playwright.menu.config.ts --trace off` | PASS — 11/11 |
| `npx playwright test tests/e2e/cinematic-finale.spec.ts --grep "desktop private letter" --trace off` | PASS — 1/1, IME/resume/thư riêng/galaxy/menu/replay |

Tổng hotfix: **33 unit + 16 E2E tập trung**. Không tuyên bố đã chạy lại toàn bộ 39 E2E của bản Gate 2R trước hotfix.

Font thực dùng cho chữ thường, đậm và nghiêng: **một Noto Serif custom font cho mỗi dòng, 62 glyph**, không trộn Georgia/Times. NFC và NFD có chiều rộng Canvas bằng nhau: 857.6318359375 px cho câu thử. Canvas paint đều ghi nhận font ready. Đã test chữ trong scene thật ở desktop và mobile touch; không tràn ngang. Đã chặn tải WOFF2 để kiểm tra game vẫn vào menu với fallback đọc đúng dấu.

- [Ảnh sau — thường/đậm/nghiêng/Canvas](after-fonts.png), [font thực sau](after-fonts.json).
- [Trước/sau cùng browser, cỡ chữ và viewport](before-after-matched.png).
- [Desktop scene thật](desktop-notebook.png), [mobile scene thật](mobile-notebook.png).
- Dữ liệu runtime ở `desktop-runtime.json` và `mobile-runtime.json`.

Build production trong `dist` đã cập nhật. Cần tải lại tab đang mở (Ctrl+F5) để bỏ font/texture cũ trong phiên game. Hiệu năng/thiết bị thật và art approval giữ giới hạn của Gate 2R; không deploy/push.
