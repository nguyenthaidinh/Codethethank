@extends('admin.layout')
@section('title', 'Ghép màn hình')
@section('head')<link rel="stylesheet" href="/wall-assets/wall.css">@endsection
@section('content')<main id="main" class="share-shell"><span class="eyebrow">AION · DISPLAY LINK</span><h1>Đưa ánh sáng<br>lên sân khấu.</h1><p>{{ $display->name }} · Có hiệu lực 12 giờ.</p><p>Liên kết dưới đây chứa quyền xem màn hình. Mở trên máy trình chiếu; không đăng công khai.</p><a id="paired-screen" class="button primary" href="{{ $url }}" target="_blank" rel="noopener noreferrer">Mở màn hình trình chiếu ↗</a><p>Nhấn F để toàn màn hình. B hoặc Esc che ngay tại máy. R bỏ che cục bộ; Emergency Blank từ bàn điều khiển vẫn được giữ.</p><a class="button quiet" href="{{ route('admin.stage') }}">Về bàn điều khiển</a></main>@endsection
