@extends('admin.layout')
@section('content')
<div class="workspace">
    <aside class="sidebar">
        @include('admin.brand')
        <div class="workspace-label"><span class="signal-dot"></span> KHÔNG GIAN TRI ÂN</div>
        <nav class="side-nav" aria-label="Lọc lời nhắn theo trạng thái">
            @can('control-stage')<a class="nav-item" href="{{ route('admin.stage') }}">✦ Điều khiển Live Wall</a>@endcan
            <p class="nav-caption">KIỂM DUYỆT</p>
            @foreach(config('admin.labels') as $key => $label)
                <a href="{{ route('admin.index', ['status' => $key]) }}" @class(['nav-item', 'active' => $status === $key]) @if($status === $key) aria-current="page" @endif><span class="status-mark {{ $key }}" aria-hidden="true"></span><span>{{ $label }}</span><b>{{ $counts[$key] ?? 0 }}</b></a>
            @endforeach
            <a href="{{ route('admin.index', ['status' => 'all']) }}" @class(['nav-item', 'active' => $status === 'all']) @if($status === 'all') aria-current="page" @endif><span aria-hidden="true">≡</span><span>Tất cả lời nhắn</span><b>{{ $counts->sum() }}</b></a>
        </nav>
        <div class="side-note"><span class="small-line"></span><p>Mỗi lời nhắn là một<br>điều đáng được lắng nghe.</p><small>Chỉ có lời nhắn đã được người gửi đồng ý chia sẻ.</small></div>
        <div class="account"><span class="avatar" aria-hidden="true">{{ mb_substr(auth('web')->user()->name, 0, 1) }}</span><div><strong>{{ auth('web')->user()->name }}</strong><small>{{ auth('web')->user()->role->value === 'admin' ? 'Quản trị viên' : 'Kiểm duyệt viên' }}</small></div></div>
        <form method="POST" action="{{ route('admin.logout') }}">@csrf<button class="logout" type="submit">Đăng xuất <span aria-hidden="true">↗</span></button></form>
    </aside>
    <main class="main-work" id="main">
        <header class="topline"><span>THE FINAL GIFT <i>/</i> QUẢN TRỊ</span><span class="top-date">{{ now()->timezone('Asia/Ho_Chi_Minh')->format('d.m.Y') }} <i>·</i> 20/11 — NGÀY TRI ÂN</span></header>
        <div class="page-heading"><div><span class="eyebrow">LẮNG NGHE · GÌN GIỮ · SẺ CHIA</span><h1>Lời nhắn tri ân<span class="heading-dot">.</span></h1><p>Lời chia sẻ mới được lên ngay. Theo dõi nội dung và ẩn khi cần.</p></div><a class="button quiet refresh" href="{{ request()->fullUrl() }}">↻ <span>Cập nhật</span></a></div>
        <div class="summary-strip" aria-label="Tổng quan kiểm duyệt">
            <a href="{{ route('admin.index', ['status' => 'pending']) }}"><span class="metric-name"><span class="status-mark pending"></span>Đang chờ lắng nghe</span><strong>{{ str_pad((string)($counts['pending'] ?? 0), 2, '0', STR_PAD_LEFT) }}</strong><small>Lời nhắn chờ duyệt</small></a>
            <a href="{{ route('admin.index', ['status' => 'approved']) }}"><span class="metric-name"><span class="status-mark approved"></span>Sẵn sàng hiển thị</span><strong>{{ str_pad((string)($counts['approved'] ?? 0), 2, '0', STR_PAD_LEFT) }}</strong><small>Lời chia sẻ mới được lên ngay; có thể ẩn tại đây</small></a>
            <div class="summary-note"><span class="eyebrow">MỘT NGUYÊN TẮC NHỎ</span><p>Giữ nguyên lời người viết.<br><em>Kiểm duyệt bằng sự trân trọng.</em></p></div>
        </div>
        @if(session('notice'))<div class="notice" role="status">✓ {{ session('notice') }}</div>@endif
        @if($errors->any())<div class="alert" role="alert">{{ $errors->first() }}</div>@endif
        <section class="review-grid" aria-label="Danh sách và bản đọc lời nhắn">
            <div class="inbox">
                <div class="inbox-head"><h2>{{ config('admin.labels')[$status] ?? 'Tất cả lời nhắn' }}</h2><span>{{ $rows->total() }} lời nhắn</span></div>
                <form method="GET" action="{{ route('admin.index') }}" class="search-form" role="search">
                    <input type="hidden" name="status" value="{{ $status }}">
                    <label class="sr-only" for="search">Tìm người nhận, người gửi hoặc nội dung</label>
                    <input id="search" name="q" value="{{ $query }}" maxlength="120" placeholder="Tìm tên hoặc nội dung…" type="search">
                    <button type="submit" aria-label="Tìm kiếm">⌕</button>
                </form>
                @if($query !== '')<div class="search-summary">Kết quả cho “{{ $query }}” <a href="{{ route('admin.index', ['status' => $status]) }}">Xóa bộ lọc</a></div>@endif
                <div class="message-list">
                @forelse($rows as $row)
                    <a href="{{ route('admin.index', array_merge(request()->only(['status', 'q', 'page']), ['selected' => $row->id])) }}#letter" @class(['message-row', 'selected' => $selected?->id === $row->id]) @if($selected?->id === $row->id) aria-current="true" @endif>
                        <div class="row-top"><span class="badge {{ $row->status->value }}">{{ config('admin.labels')[$row->status->value] }}</span><time>{{ $row->created_at->timezone('Asia/Ho_Chi_Minh')->format('d/m · H:i') }}</time></div>
                        <h3>{{ $row->recipient ? 'Gửi '.$row->recipient : 'Lời nhắn đã được rút lại' }}</h3>
                        <p>{{ $row->message ? \Illuminate\Support\Str::limit($row->message, 110) : 'Nội dung không còn được lưu trong kho lời nhắn.' }}</p>
                        <div class="row-bottom"><span>— {{ $row->display_name ?: ($row->status->value === 'withdrawn' ? 'Đã rút nội dung' : 'Người gửi ẩn danh') }}</span><span aria-hidden="true">↗</span></div>
                    </a>
                @empty
                    <div class="empty-list"><span class="empty-symbol" aria-hidden="true">◇</span><h3>{{ $query ? 'Chưa tìm thấy lời nhắn' : 'Một khoảng lặng dịu dàng' }}</h3><p>{{ $query ? 'Thử một tên hoặc từ khóa khác.' : 'Không có lời nhắn trong mục này. Bạn có thể xem các trạng thái khác.' }}</p></div>
                @endforelse
                </div>
                @if($rows->hasPages())<nav class="pagination" aria-label="Phân trang lời nhắn">@if($rows->previousPageUrl())<a href="{{ $rows->previousPageUrl() }}">← Trước</a>@else<span>← Trước</span>@endif<span>{{ $rows->currentPage() }} / {{ $rows->lastPage() }}</span>@if($rows->nextPageUrl())<a href="{{ $rows->nextPageUrl() }}">Sau →</a>@else<span>Sau →</span>@endif</nav>@endif
            </div>
            <section class="reading" id="letter" aria-label="Chi tiết lời nhắn" tabindex="-1">
            @if($selected)
                <div class="reading-head"><span class="eyebrow">BẢN ĐỌC KIỂM DUYỆT</span><span class="badge {{ $selected->status->value }}">{{ config('admin.labels')[$selected->status->value] }}</span></div>
                @if($selected->status->value !== 'withdrawn')
                <article class="letter-sheet" aria-label="Nội dung đầy đủ">
                    <div class="letter-kicker"><span class="small-line"></span> 20 / 11 · MỘT LỜI TRI ÂN</div>
                    <h2>Gửi {{ $selected->recipient }}</h2>
                    <p class="letter-body">{{ $selected->message }}</p>
                    <div class="letter-signature"><span>Với lòng biết ơn,</span><strong>{{ $selected->display_name ?: 'Người gửi ẩn danh' }}</strong></div>
                    <div class="letter-emblem" aria-hidden="true">✧</div>
                </article>
                <div class="consent-line"><span aria-hidden="true">✓</span><span>Người gửi đã đồng ý chia sẻ <time>{{ $selected->consented_at->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y · H:i') }}</time></span></div>
                <div class="decision-bar">
                @if($selected->status->value === 'pending')
                    <form method="POST" action="{{ route('admin.decide', $selected->id) }}" data-confirm="Duyệt lời nhắn này?" data-copy="Lời nhắn sẽ đủ điều kiện xuất hiện trên Live Wall đang hoạt động.">
                        @csrf<input type="hidden" name="version" value="{{ $selected->moderation_version }}"><input type="hidden" name="action" value="approve"><button class="button primary" type="submit">✓ Duyệt lời nhắn</button>
                    </form>
                @endif
                @if(in_array($selected->status->value, ['pending', 'approved']))
                    @php($decision = $selected->status->value === 'pending' ? 'reject' : 'hide')
                    <details class="decision-details"><summary>{{ $decision === 'reject' ? 'Từ chối lời nhắn' : 'Ẩn lời nhắn' }}</summary>
                        <form method="POST" action="{{ route('admin.decide', $selected->id) }}" data-confirm="{{ $decision === 'reject' ? 'Từ chối lời nhắn này?' : 'Ẩn lời nhắn này?' }}" data-copy="Quyết định và lý do sẽ được lưu trong lịch sử kiểm duyệt.">
                            @csrf<input type="hidden" name="version" value="{{ $selected->moderation_version }}"><input type="hidden" name="action" value="{{ $decision }}">
                            <label for="reason">Lý do {{ $decision === 'reject' ? 'từ chối' : 'ẩn' }}</label><select id="reason" name="reason" required><option value="">Chọn lý do…</option>@foreach(config('admin.reasons') as $key => $label)<option value="{{ $key }}">{{ $label }}</option>@endforeach</select>
                            <button class="button danger" type="submit">{{ $decision === 'reject' ? 'Xác nhận từ chối' : 'Xác nhận ẩn' }}</button>
                        </form>
                    </details>
                @elseif(in_array($selected->status->value, ['rejected', 'hidden']))
                    <form method="POST" action="{{ route('admin.decide', $selected->id) }}" data-confirm="Đưa lời nhắn về chờ duyệt?" data-copy="Lời nhắn sẽ cần được đọc và duyệt lại trước khi đủ điều kiện chia sẻ.">
                        @csrf<input type="hidden" name="version" value="{{ $selected->moderation_version }}"><input type="hidden" name="action" value="reopen"><button class="button quiet" type="submit">↶ Đưa về chờ duyệt</button>
                    </form>
                @endif
                </div>
                <p class="decision-note">Giữ nguyên nội dung người gửi. Mỗi quyết định đều được ghi nhận.</p>
                @else
                    <div class="withdrawn-letter"><span aria-hidden="true">◇</span><h2>Người gửi đã rút lời nhắn.</h2><p>Nội dung và tên đã được xóa khỏi kho đang sử dụng. Không thể kiểm duyệt hoặc khôi phục lời nhắn này.</p></div>
                @endif
                <details class="history"><summary>Lịch sử xử lý <span>{{ $history->count() }}</span></summary><ol>
                    @foreach($history as $event)
                        @php($eventLabels = ['submission.created' => 'Đã gửi để kiểm duyệt', 'submission.published' => 'Đã chia sẻ công khai ngay', 'submission.withdrawn' => 'Đã rút lời nhắn', 'moderation.approve' => 'Đã duyệt', 'moderation.reject' => 'Đã từ chối', 'moderation.hide' => 'Đã ẩn', 'moderation.reopen' => 'Đưa về chờ duyệt'])
                        <li><strong>{{ $eventLabels[$event->action] ?? 'Cập nhật trạng thái' }}</strong><span>{{ $event->actor_name ?: (str_starts_with($event->action, 'moderation.') ? 'Tài khoản không còn tồn tại' : 'Người gửi') }} · {{ \Illuminate\Support\Carbon::parse($event->created_at)->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i') }}</span>@if($event->reason_code)<small>{{ config('admin.reasons')[$event->reason_code] ?? 'Lý do không xác định' }}</small>@endif</li>
                    @endforeach
                </ol></details>
            @else
                <div class="empty-reading"><div class="empty-frame" aria-hidden="true">✧</div><span class="eyebrow">MỖI LỜI TRI ÂN ĐỀU CÓ MỘT CÂU CHUYỆN</span><h2>Dành một khoảng lặng<br>để lắng nghe.</h2><p>Chọn lời nhắn trong danh sách để đọc đầy đủ và xem xét.</p></div>
            @endif
            </section>
        </section>
        <footer class="work-footer"><span>THE UNWRITTEN LESSON · THE FINAL GIFT</span><span>Cập nhật lúc {{ now()->timezone('Asia/Ho_Chi_Minh')->format('H:i:s') }} · Giờ Việt Nam</span></footer>
    </main>
</div>
@endsection
