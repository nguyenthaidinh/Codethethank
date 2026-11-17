# Tài nguyên của cinematic slice

| Thành phần | Nguồn / quyền sử dụng |
|---|---|
| Phòng lab, bàn máy, nhân vật, cây, mưa, ánh sáng, texture chữ | Tự dựng bằng code trong `src/cinematic/WorldRenderer.ts` và `src/art/ClassroomArt.ts`; không ảnh AI/stock. G2 inventory chi tiết tại `art/ASSET_REGISTRY.md` |
| Bản 2D khi GPU lỗi | Canvas tự vẽ trong `FallbackWorld.ts` |
| Hội nghị 2046, khán giả, terminal, camera phối cảnh | Tự dựng bằng Canvas 2.5D trong `src/chapter/SummitWorld.ts`; không ảnh nền tĩnh, không ảnh AI |
| Hội trường, tiếng trò chuyện xa, hum, tín hiệu, motif Chapter 00 | Tổng hợp nguyên bản trong `src/chapter/ChapterAudio.ts`; tiếng trò chuyện là âm mô phỏng, không bản ghi giọng người |
| Mưa, quạt, chuông, cửa, bước chân, ghế, keyboard, piano thưa | Tổng hợp procedural bằng Web Audio trong `AudioDirector.ts`; không audio tải ngoài. Chair dùng cùng buffer có seed cố định, sẵn sàng tái dùng cho match-cut |
| Three.js | MIT; xem `node_modules/three/LICENSE` |
| React | MIT; xem `node_modules/react/LICENSE` |
| Chữ | Arial / Georgia hệ thống; không phân phối font |
| Kịch bản | Bộ tài liệu do chủ dự án cung cấp; V3 khóa canon |

Không có giọng diễn viên/voice-over trong slice này; lời thoại truyền đầy đủ bằng phụ đề. Video ghi âm môi trường và foley đang phát thật từ ứng dụng.
