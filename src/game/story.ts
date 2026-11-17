export const scenes = [
  {id:'S00', title:'Một câu hỏi còn lại', place:'HỘI TRƯỜNG AION / 2046', task:'Chạm vào lõi AION để mở giao thức.'},
  {id:'S01', title:'Tối ưu cho ai?', place:'FOUNDER PROTOCOL / 20:11', task:'Chọn một góc nhìn để điều tra.'},
  {id:'S02', title:'Những người bị bỏ lại', place:'PHÒNG THỰC HÀNH ĐẠI HỌC / 2026', task:'Tìm 3 bằng chứng trên bàn của An.'},
  {id:'S03', title:'Chiếc ghế bên cạnh', place:'SAU GIỜ HỌC / 17:05 / 2026', task:'Chọn hồ sơ An, rồi chạm vùng kiểm thử.'},
  {id:'S04', title:'Một câu hỏi khác', place:'TỜ GIẤY TRẮNG / 2026 → 2046', task:'Thay chức năng của dự báo. Giữ lại cơ hội.'},
  {id:'S05', title:'Bài học chưa được viết', place:'LỄ CÔNG BỐ AION / 2046', task:'Kết nối ba nguyên tắc từ những gì bạn đã thấy.'},
  {id:'S06', title:'Ngôi sao tiếp theo', place:'20:11 / MỘT LỜI TRI ÂN NGÀY 20/11', task:'Viết tiếp bằng một lời cảm ơn của bạn.'},
] as const;
export type SceneId = typeof scenes[number]['id'];
export const evidence = [
  { title:'Mục tiêu mô hình', label:'01 · Màn hình', text:'Prototype hỗ trợ học tập do An tự viết xếp ưu tiên theo xác suất hoàn thành. Nó chọn người dễ đạt kết quả nhất, không đo ai cần được giúp nhất.', quote:'Em đã tối ưu theo dữ liệu. Em tưởng nó công bằng.' },
  { title:'Danh sách bị loại', label:'02 · Bản báo cáo', text:'Những hồ sơ có điểm thấp và lịch sử gián đoạn bị gạt ra. Hoàn cảnh khó khăn trở thành lý do mất suất hỗ trợ — ngay khi họ cần cơ hội nhất.', quote:'Nếu người khó khăn nhất bị loại ngay từ đầu… thì chương trình này đang giúp ai?' },
  { title:'Giới hạn hỗ trợ', label:'03 · Ghi chú', text:'Số suất có giới hạn. Nhưng mô hình chưa hỏi về thời gian, người hướng dẫn hay điều kiện để một người có thể thử lại. Vấn đề nằm ở mục tiêu tối ưu, không phải lỗi cú pháp.', quote:'Hay là… em không đủ giỏi để làm điều này?' },
] as const;
export const dialogue = {
  opening:'Tôi là AION. Tôi có thể giải quyết những bài toán từng vượt ngoài khả năng tính toán của nhân loại. Nhưng người tạo ra tôi đã để lại một câu hỏi mà tôi không được phép trả lời chỉ bằng một con số.',
  protocol:'Nếu tối ưu một chỉ số, tôi có thể cho ra đáp án rất chính xác. Nhưng chính xác cho một chỉ số… chưa chắc đã đúng cho một con người.',
  chair:'Em đang muốn chọn người dễ thành công nhất, hay muốn giúp người cần một cơ hội nhất?',
  test:'Mình thử một hồ sơ nữa nhé. Chính em.',
  result:'Với những gì em đã nhập, kết quả đó có thể hợp lý. Nhưng dữ liệu của hôm nay đâu kể hết được ngày mai.',
  stay:'Cô không thể hứa em sẽ thành công. Nhưng cô thấy em còn muốn tìm cách làm tốt hơn. Nếu em muốn thử lại, cô ngồi đây cùng em.',
  change:'Vậy em không nên để máy quyết định ai hết cơ hội. Em phải làm nó chỉ ra cần giúp họ bằng cách nào.',
  reveal:'Sinh viên bị mô hình của chính mình loại khỏi danh sách năm 2026… là người đã sáng tạo ra tôi. Nhà sáng lập An.',
  lesson:'Tôi có thể dự báo cơ hội hoàn thành một mục tiêu. Tôi không thể biến dự báo ấy thành phán quyết về giá trị của bạn.',
  pride:'Nhưng thứ tôi tự hào nhất không phải là số bài toán nó giải được. Mà là những cánh cửa nó giúp con người giữ mở.',
  star:'Trong cuộc đời bạn… ai đã từng nhìn thấy điều mà điểm số không thể nói hết?',
  ending:'Tương lai của một người không nên bị viết xong bởi một khoảnh khắc.',
};
export const montage = [
  {year:2026,title:'Bắt đầu lại',text:'Một tờ giấy trắng. An viết lại mục tiêu: người dùng cần được giúp điều gì?'},
  {year:2029,title:'Thất bại không phải dấu chấm',text:'Nguyên mẫu đầu tiên chưa hiệu quả. An thử, ghi lại giới hạn, rồi thử tiếp.'},
  {year:2033,title:'Không đi một mình',text:'Một nhóm nghiên cứu nhỏ cùng kiểm chứng, phản biện và xây lại những gì chưa đúng.'},
  {year:2037,title:'Một bước được công nhận',text:'Công trình đầu tiên được ghi nhận sau nhiều năm cộng tác và sửa đổi.'},
  {year:2042,title:'Mở rộng trách nhiệm',text:'Đội ngũ đưa nghiên cứu tới y tế, khoa học và giáo dục. Mỗi bước mở rộng là một lần đánh giá lại.'},
  {year:2046,title:'Hai mươi năm sau',text:'Một nguyên tắc vẫn còn: dự báo để hỗ trợ, không kết luận thay tương lai con người.'},
] as const;
export const principles = [
  {title:'Đừng chỉ nhìn điểm số',text:'Từ mục tiêu mô hình: một chỉ số không bao trùm mọi giá trị.'},
  {title:'Đừng khép cơ hội',text:'Từ hồ sơ An: dữ liệu hôm nay chưa kể hết ngày mai.'},
  {title:'Hãy hỏi cách giúp',text:'Từ quy tắc mới: đề xuất hỗ trợ và để con người tự quyết.'},
] as const;
