@extends('admin.layout')
@section('title', 'Đăng nhập quản trị')
@section('content')
<main class="login-shell" id="main">
    <section class="login-art" aria-label="Không gian tri ân AION">
        @include('admin.brand')
        <div class="art-orbit" aria-hidden="true"><div class="orbit one"></div><div class="orbit two"></div><div class="orbit three"></div><div class="light-core"></div><span class="orbit-dot"></span></div>
        <div class="art-message"><span class="eyebrow">THE FINAL GIFT / 20.11</span><h1>Một lời cảm ơn.<br>Một điều còn mãi.</h1><p>Gìn giữ những lời tri ân trước khi<br>chúng được sẻ chia.</p></div>
        <div class="art-foot"><span>AION CINEMATIC × HUMAN WARMTH</span><span>01 — ACCESS</span></div>
    </section>
    <section class="login-panel">
        <div class="login-content">
            <span class="eyebrow"><i class="signal-dot"></i> KHÔNG GIAN QUẢN TRỊ</span>
            <h2>Chào người<br>giữ lời tri ân.</h2>
            <p class="muted">Đăng nhập để đọc và kiểm duyệt những lời nhắn được tự nguyện gửi đến.</p>
            @if(session('notice'))<div class="notice" role="status">{{ session('notice') }}</div>@endif
            @if($errors->any())<div class="alert" role="alert">{{ $errors->first() }}</div>@endif
            <form method="POST" action="{{ route('admin.authenticate') }}" class="login-form" data-pending>
                @csrf
                <label for="email">Email quản trị</label>
                <input id="email" type="email" name="email" value="{{ old('email') }}" autocomplete="username" required maxlength="254" placeholder="ten@truong.edu.vn">
                <label for="password">Mật khẩu</label>
                <input id="password" type="password" name="password" autocomplete="current-password" required placeholder="Nhập mật khẩu của bạn">
                <button class="button primary login-submit" type="submit">Vào không gian quản trị <span aria-hidden="true">↗</span></button>
            </form>
            <p class="access-note"><span aria-hidden="true">◇</span> Dành cho tài khoản quản trị, kiểm duyệt hoặc vận hành sân khấu.<br>Liên hệ người quản lý nếu bạn cần được cấp quyền.</p>
        </div>
        <footer>THE UNWRITTEN LESSON <span>ADMIN / 20.11</span></footer>
    </section>
</main>
@endsection
