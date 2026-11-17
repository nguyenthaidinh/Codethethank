@extends('admin.layout')
@section('title', 'Điều khiển sân khấu')
@section('head')<link rel="stylesheet" href="/wall-assets/wall.css"><script src="/wall-assets/stage.js" defer></script>@endsection
@section('content')
<main id="main" class="stage-shell">
<header class="stage-heading"><div><span class="eyebrow">AION / LIVE WALL · F5.7</span><h1>Giữ nhịp <em>ánh sáng.</em></h1><p>Lời chúc mới đồng ý chia sẻ được lên ngay, không chờ duyệt.</p></div><nav>@can('moderate-submissions')<a class="button quiet" href="{{ route('admin.index', ['status' => 'approved']) }}">Quản lý lời nhắn</a>@endcan<a class="button quiet" href="/gratitude" target="_blank" rel="noopener">Trang gửi lời chúc ↗</a><form method="post" action="{{ route('admin.logout') }}">@csrf<button class="button quiet">Đăng xuất</button></form></nav></header>
@if(session('notice'))<p class="stage-notice" role="status">{{ session('notice') }}</p>@endif
@if($errors->any())<p role="alert">{{ $errors->first() }}</p>@endif
<section class="stage-controls" aria-label="Điều khiển sân khấu"><div><span class="eyebrow">TRẠNG THÁI MÁY CHỦ</span><p id="stage-status">{{ $state->blank ? 'ĐANG CHE' : 'ĐANG CHIẾU' }} · {{ strtoupper($state->mode) }}</p><small id="connection-status">Đang kiểm tra kết nối…</small></div><div class="control-buttons">
@foreach(['auto'=>'Auto', 'manual'=>'Manual', 'next'=>'Lời tiếp theo', 'resume'=>'Mở lại màn hình', 'effects'=>'Bật / tắt hiệu ứng', 'blank'=>'Emergency Blank'] as $action=>$label)
<form method="post" action="{{ route('admin.stage.command') }}">@csrf<input type="hidden" name="revision" value="{{ $state->revision }}"><input type="hidden" name="action" value="{{ $action }}"><button class="button {{ $action === 'blank' ? 'emergency' : 'quiet' }}" data-command="{{ $action }}">{{ $label }}</button></form>
@endforeach
</div></section>
@include('wall.tribute-controls')
<div class="stage-grid"><section><div class="section-caption"><span class="eyebrow">PREVIEW / 16:9</span><span>B / Esc: che tại máy chiếu · R: bỏ che cục bộ · F: toàn màn hình</span></div><iframe class="stage-preview" src="{{ route('admin.stage.preview') }}" title="Xem trước màn hình trình chiếu" allow="fullscreen"></iframe><p class="stage-help">Auto luân phiên lời chúc; Manual giữ lời được chọn. Lệnh che không cần xác nhận. Máy chiếu mất kết nối sẽ tự che trong tối đa 6,5 giây.</p></section>
<aside class="pair-panel"><span class="eyebrow">KẾT NỐI MÁY CHIẾU</span><h2>Một cửa sổ<br>cho cả hội trường.</h2><form method="post" action="{{ route('admin.stage.pair') }}">@csrf<label for="display-name">Tên màn hình</label><input id="display-name" name="name" maxlength="80" value="Màn hình hội trường" required><button class="button primary">Tạo liên kết ghép màn hình</button></form><p>Liên kết có hiệu lực 12 giờ. Chỉ chia sẻ cho người vận hành.</p><div id="display-status" aria-live="polite"></div>
@foreach($displays as $display)<form class="revoke-row" method="post" action="{{ route('admin.stage.revoke', $display->id) }}">@csrf<span>{{ $display->name }}</span><button class="button quiet">Thu hồi</button></form>@endforeach
</aside></div>
<section class="stage-queue"><div class="section-caption"><div><span class="eyebrow">LỜI CHÚC CÔNG KHAI</span><h2>Chọn một lời để dừng lại.</h2></div><a class="button quiet" href="{{ route('admin.stage') }}">Cập nhật danh sách</a></div><div class="wish-grid">@forelse($rows as $row)<article><span class="eyebrow">GỬI {{ $row->recipient }}</span><p>{{ $row->message }}</p><footer><span>{{ $row->display_name ?: 'Một người biết ơn' }}</span><form method="post" action="{{ route('admin.stage.command') }}">@csrf<input type="hidden" name="revision" value="{{ $state->revision }}"><input type="hidden" name="action" value="select"><input type="hidden" name="id" value="{{ $row->id }}"><button class="button quiet">Chiếu riêng lời này</button></form></footer></article>@empty<p>Chưa có lời chúc công khai. Mở trang gửi lời chúc để bắt đầu.</p>@endforelse</div></section>
@if($rows->hasPages())<nav class="section-caption" aria-label="Phân trang">@if($rows->previousPageUrl())<a class="button quiet" href="{{ $rows->previousPageUrl() }}">← Trước</a>@endif<span>{{ $rows->currentPage() }} / {{ $rows->lastPage() }}</span>@if($rows->nextPageUrl())<a class="button quiet" href="{{ $rows->nextPageUrl() }}">Sau →</a>@endif</nav>@endif
</main>
@endsection
