<?php

return [
    'consent_version' => 'public-wall-live-v2',
    'consent_versions' => ['public-wall-v1', 'public-wall-live-v2'],
    'consent_text' => 'Tôi đồng ý công khai lời chúc, tên người nhận và tên hiển thị trên Live Wall của sự kiện, bao gồm phần lời chúc trực tiếp ở đoạn kết trong game. Nội dung có thể xuất hiện ngay, không chờ duyệt trước. Ban tổ chức có thể ẩn nội dung; tôi có thể rút lời chúc bằng mã riêng trên thiết bị này.',
    'submit_per_minute' => (int) env('SUBMIT_PER_MINUTE', 120),
    'submit_per_hour' => (int) env('SUBMIT_PER_HOUR', 3000),
    'receipt_per_minute' => (int) env('RECEIPT_PER_MINUTE', 30),
    'token_minutes' => (int) env('STAFF_TOKEN_MINUTES', 480),
];
