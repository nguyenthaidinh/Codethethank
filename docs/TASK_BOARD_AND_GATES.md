# TASK BOARD AND QUALITY GATES

## Working rules
- Chỉ một việc ở trạng thái `in_progress` cho người/agent đang triển khai; khi team nhiều người có thể phân lớp UI/game/QA song song.
- P0 gồm gameplay và story end-to-end. Mỗi task phải có mã, đầu ra và phép thử; không đánh dấu Done chỉ vì đã tạo file.
- **Gate Fail → fix** trước khi vào hạng mục trang trí kế tiếp. Không tự deploy hoặc push.

## Epic 0 — Foundation
| ID | P | Task | Acceptance |
|---|---|---|---|
| F-01 | P0 | Audit repo, detect framework, scripts, assets and deploy situation | Báo cáo trạng thái thật + không phá code cũ |
| F-02 | P0 | Tạo/Vận dụng project React TS Vite hoặc stack hiện có | Dev server chạy, build sạch |
| F-03 | P0 | Story data S00..S06; thoại tiếng Việt tách content | Đọc được config từng scene và thứ tự đúng |
| F-04 | P0 | SceneController + save/load/restart | Reload ở S03 không mất scene state |
| F-05 | P0 | UI shell chung, settings, subtitle/audio | UI hoạt động ở desktop/mobile |

**Gate G1:** 7 scene có placeholder hợp lệ, S00→S06 chạy được; lưu tiến trình, mute, Next và Restart; E2E smoke đầu tiên xanh.

## Epic 1 — Game mechanics
| ID | P | Task | Acceptance |
|---|---|---|---|
| G-01 | P0 | S01 lựa chọn hai góc nhìn | Không chấm thiện ác; lưu lựa chọn |
| G-02 | P0 | S02 3 interactive hotspots | Người chơi phải xác nhận 3 evidence |
| G-03 | P0 | S03 test hồ sơ An với drag **và tap alternative** | Hiển thị NOT RECOMMENDED; mobile dùng được |
| G-04 | P0 | S03 thoại cô Vân + cinematic pause + chiếc ghế | Lời thoại theo V3; không diễn văn |
| G-05 | P0 | S04 thay Final Judgment → Next Support Step | Logic đổi chức năng, không sửa số liệu gian lận |
| G-06 | P0 | 20-year montage + identity reveal | Founder AN chỉ lộ **sau** G-05 |
| G-07 | P0 | S05 connect principles + closing | 3 evidence cho một kết luận sâu sắc |
| G-08 | P0 | S06 message composer + local star | Luôn hoạt động offline, không giả báo thành công public |

**Gate G2:** Chạy từ S01 đến S06 có ba thao tác gameplay chính; chủ đề rõ; không thay story canon.

## Epic 2 — Design ownership (Codex)
| ID | P | Task | Acceptance |
|---|---|---|---|
| D-01 | P0 | Design exploration + tự lựa chọn hướng | 2+ phương án mô tả ngắn, chấm tiêu chí, lý do chọn |
| D-02 | P0 | UI kit và môi trường 2026/2046 | Hệ thống nhất quán, không dùng lại ảnh demo cũ |
| D-03 | P0 | Visual slice S02–S03 | Ảnh chụp browser thực tế desktop/mobile, gameplay chạy |
| D-04 | P0 | Extend các cảnh khác + UI responsive | 7 cảnh đồng bộ, dễ chạm/đọc |
| D-05 | P1 | Camera motion, SFX, cinematic transition | Không gây motion sickness; có reduced motion |
| D-06 | P2 | 3D procedural polish / premium effects | Có 2D fallback và measured perf |

**Gate G3:** Screenshot audit 360×800, 390×844 và 1280×720; có layout chất lượng như game, không collage poster.

## Epic 3 — Community & Operations
| ID | P | Task | Acceptance |
|---|---|---|---|
| C-01 | P0 | Local star / gratitude ending | Hiển thị minh bạch local vs server |
| C-02 | P1 | POST API + validation/rate limit + pending queue | Không publish dữ liệu ngay |
| C-03 | P1 | Approval admin + approved-only feed | Chỉ approved hiển thị public |
| C-04 | P1 | Share screenshot/link & legal asset credits | Hoạt động đúng và có nguồn asset |
| C-05 | P2 | Realtime feed cho Gala | Backpressure + moderation + reconnect fallback |

**Gate G4:** Local ending không phụ thuộc mạng; nếu backend chưa xong thì feature public phải bị ẩn/ghi trạng thái thực.

## Epic 4 — Test, optimize, release
| ID | P | Task | Acceptance |
|---|---|---|---|
| R-01 | P0 | Unit tests scene transitions, evidence rules, save version | Test pass |
| R-02 | P0 | E2E default path, alternate path, refresh | E2E pass trên browser |
| R-03 | P0 | UX review desktop/mobile, iOS Safari when available | Không scroll overflow/dialog offscreen/touch-only block |
| R-04 | P0 | A11y, fonts tiếng Việt, reduced motion, captions | Các toggle hoạt động |
| R-05 | P0 | Production build, asset license inventory, no client secrets | Build pass, không có secrets/log lỗi |
| R-06 | P0 | Record fallback video and release notes | Video end-to-end đúng canon |
| R-07 | P0 | Deploy + verify public URL (chỉ với quyền người dùng) | HTTPS + smoke trên mạng độc lập; nhận được URL |
| R-08 | P0 | Submission confirmation (do user phối hợp) | Có chứng cứ nộp trước deadline |

**Gate G5:** P0 pass, không còn blocker và có video dự phòng. Candidate đóng băng trước 17:00 ngày 17/11.

## Mốc làm việc
1. 16/11, khởi động ngay: F-01..F-05 + G1.
2. 16/11 trong ngày: D-01..D-03 + G-01..G-04 + G2 partial.
3. 16/11 tối: G-05..G-08 + G2 complete.
4. 17/11 sáng: D-04, R-01..R-04 + G3.
5. 17/11 chiều: R-05..R-08 + G4/G5; **nộp trước 20:00**.
6. 18–19/11: tập dượt trình diễn, không sửa Production vô kiểm soát.

## Chính sách cắt scope nếu chậm
- Ưu tiên giữ: cốt truyện, S03, S04, gameplay 3 mechanic, phụ đề, local ending, QA.
- Cắt đầu tiên: realtime, hội thoại LLM, voice, nhạc cao cấp, 3D toàn cảnh, cinematic dài.
- Nếu chưa có community server duyệt nội dung, chọn local star được ghi rõ trạng thái thay vì một hệ thống public không an toàn.
