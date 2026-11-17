# Dialogue script V4 — runtime source

Source: src/stayed/story.ts and src/verdict/story.ts. All dialogue subtitled; opening-only voice policy remains. No new speech synthesis. Chair duration stays 6 seconds. Player may advance spoken lines; the silence and chair use existing automatic cues.

## discussion

- 5s · an: An: “Em kiểm tra hết rồi. Chương trình đã chọn những trường hợp có khả năng cải thiện cao nhất.”
- 4s · teacher: Cô Vân: “Cô có nói mô hình của em sai đâu.”

## chair

- 6s · chair_insert: [Cô kéo chiếc ghế trống lại gần. Một khoảng lặng, rồi cô ngồi xuống.]

## question

- 4.5s · book: Cô Vân: “Đây là đề nghị đã ẩn danh của sinh viên 07, cô gửi để mình cùng xem xét.”
- 5s · faces: Cô Vân: “Bạn ấy thiếu thiết bị, nhưng vẫn xin thêm thời gian dùng phòng máy để tiếp tục học.”
- 5s · an: An: “Dữ liệu của em chưa có điều đó. Nhưng nguồn lực có hạn thì mình vẫn phải lựa chọn, cô ạ.”
- 4.5s · faces: Cô Vân: “Đúng. Không phải lúc nào mình cũng giúp được tất cả theo cùng một cách.”
- 5s · faces: Cô Vân: “Nhưng trước khi quyết định không giúp một người, mình đã thực sự hiểu họ chưa?”
- 4s · laptop: An: “Em đã thử cả hồ sơ của mình… cũng NOT RECOMMENDED.”
- 5s · an: An: “Nếu cô cũng dựa vào chương trình này... chắc cô chẳng chọn giúp em đâu.”
- 3s · faces: [Cô ở lại bên An. Một khoảng lặng, chỉ còn tiếng mưa.]
- 4s · faces: Cô Vân: “Vậy mà cô đang ngồi ở đây.”
- 3s · an: An: “Cô nghĩ em sẽ thành công sao?”
- 3s · faces: Cô Vân: “Cô không biết.”
- 3s · an: An: “Vậy tại sao cô vẫn giúp em?”
- 7s · faces: Cô Vân: “Vì em vẫn muốn học. Và cô chưa muốn một kết quả hôm nay quyết định hết những gì em có thể làm ngày mai.”

## second_chance

- 4.5s · an: An: “Vậy khi thiếu hoàn cảnh hoặc chưa đủ tin cậy, em cần để con người xem xét thêm.”
- 5s · faces: Cô Vân: “Xem xét thêm không phải tự động đồng ý hỗ trợ. Mình cần hiểu rõ rồi tìm bước phù hợp.”
- 4s · book: An: “Làm sao để không bỏ lại người đang cần cơ hội?”

## written

- 6s · book: Khi chưa hiểu đủ một con người, đừng vội xem một dự đoán là câu trả lời cuối cùng.

## closing

- 6s · window: [Mưa dịu dần. Nguyên tắc nằm trên trang giấy. Cô vẫn ngồi bên An.]

Notebook principle: Khi chưa hiểu đủ một con người, đừng vội xem một dự đoán là câu trả lời cuối cùng.

## Chapter 01 — event dialogue

- inspect(presentation): STUDENT 07 — đề nghị đã ẩn danh, cô Vân cung cấp cho bài học; thiếu thiết bị, vẫn cố làm bài và xin thêm thời gian phòng máy.
- inspect(notes): ưu tiên mức cải thiện dự đoán; thiếu bước xem xét dữ liệu chưa đầy đủ.
- inspect(data): lịch sử NOT RECOMMENDED; kết quả giảm, vắng học, bài tập không đều; hoàn cảnh thiết bị chưa ghi nhận.
- run(student07): cùng công thức định lượng cũ, kết quả NOT RECOMMENDED; dữ liệu giả lập.
- run(an): cùng công thức, NOT RECOMMENDED. An: “Ngay cả hệ thống của mình... cũng không chọn mình.”
- compare: hai vật chứng khác nhau làm rõ dự đoán lợi ích khác với nhu cầu và kết quả không chốt tương lai.
- teacher_enter 0–4s: mưa/bước chân; 4–6.5s Cô Vân: “Em đã ngồi đây lâu chưa?”; sau đó An: “Dạ… em đang cố tìm xem mình sai ở đâu.”

## Timing and staging

Chapter02 discussion: 9 seconds; chair: unchanged 6 seconds. Question: 56 seconds (including a 3-second rain-only pause), extended from the old 18 seconds. Notebook still waits for both pages. Second-chance: 13.5 seconds; written: 6 seconds; closing: 6 seconds. Existing subtitle advance remains available; no new voice in the past. All focus names route through the existing camera system.

The presentation prop remains bound to the existing “Đọc bản thuyết trình” interaction because it is the support-request attachment to the demonstration. Its physical page and subtitle now contain the anonymized request.
