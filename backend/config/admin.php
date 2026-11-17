<?php

return [
    'review_mode' => env('ADMIN_REVIEW_MODE', false),
    'session_driver' => env('ADMIN_SESSION_DRIVER', 'database'),
    'secure_cookie' => env('ADMIN_SECURE_COOKIE', env('APP_ENV') === 'production'),
    'labels' => ['pending' => 'Chờ duyệt', 'approved' => 'Sẵn sàng hiển thị', 'rejected' => 'Từ chối', 'hidden' => 'Đã ẩn', 'withdrawn' => 'Đã rút'],
    'reasons' => ['personal_data' => 'Thông tin cá nhân nhạy cảm', 'inappropriate' => 'Nội dung không phù hợp', 'spam' => 'Spam hoặc trùng lặp', 'off_topic' => 'Không đúng chủ đề', 'other' => 'Lý do khác'],
];
