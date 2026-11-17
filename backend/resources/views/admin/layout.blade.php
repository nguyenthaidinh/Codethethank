<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>@yield('title', 'Kiểm duyệt lời tri ân') · AION</title>
    <link rel="stylesheet" href="{{ route('admin.css') }}">
    <script src="{{ route('admin.js') }}" defer></script>
    @yield('head')
</head>
<body>
<a class="skip-link" href="#main">Đến nội dung chính</a>
@if(config('admin.review_mode'))<div class="review-mode">BẢN DUYỆT THỬ · DỮ LIỆU MINH HỌA · KHÔNG PHẢI LỜI NHẮN THẬT</div>@endif
@yield('content')
<dialog id="confirm-dialog" aria-labelledby="confirm-title">
    <span class="eyebrow">XÁC NHẬN QUYẾT ĐỊNH</span>
    <h2 id="confirm-title">Xác nhận thao tác</h2>
    <p id="confirm-copy">Quyết định sẽ được ghi vào lịch sử kiểm duyệt.</p>
    <div class="dialog-actions"><button type="button" class="button quiet" id="confirm-cancel">Quay lại</button><button type="button" class="button primary" id="confirm-submit">Xác nhận</button></div>
</dialog>
</body>
</html>
