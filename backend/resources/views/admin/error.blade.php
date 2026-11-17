@extends('admin.layout')
@section('title', 'Chưa thể hoàn tất thao tác')
@section('content')
<main class="error-page" id="main">@include('admin.brand')<div class="error-content"><span class="eyebrow">KHÔNG GIAN QUẢN TRỊ / {{ $code }}</span><h1>Một nhịp dừng<br>để kiểm tra lại.</h1><p role="alert">{{ $message }}</p><a class="button primary" href="{{ route('admin.index') }}">Tải lại kho lời nhắn ↗</a><a class="error-login" href="{{ route('admin.login') }}">Về trang đăng nhập</a></div></main>
@endsection
