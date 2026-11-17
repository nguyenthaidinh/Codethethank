<section class="pair-panel" aria-labelledby="tribute-title">
<span class="eyebrow">AION / LỜI CẢM ƠN</span><h2 id="tribute-title">Vì có thầy cô.<br>Vì có bạn.</h2>
<p>13 lượt thầy cô → danh sách bổ sung → người chơi. Hai lượt Thầy Tuấn được giữ riêng.</p>
<p id="tribute-current" role="status">Đang kiểm tra lượt tri ân…</p>
<details><summary>Danh sách thầy cô theo thứ tự</summary><ol>@foreach(config('tribute.teachers') as $teacher)<li>{{ $teacher['name'] }}</li>@endforeach</ol></details>
<form id="tribute-form" method="post" action="{{ route('admin.stage.tribute') }}">@csrf
<input type="hidden" name="revision" value="{{ $state->revision }}">
<label for="tribute-additional">Danh sách bổ sung · mỗi dòng một tên</label>
<textarea id="tribute-additional" name="additional" rows="4" maxlength="81000" placeholder="Bạn có thể bổ sung danh sách sau">{{ old('additional', collect($state->tribute['rows'] ?? [])->where('group', 'Những người đồng hành')->pluck('name')->implode("\n")) }}</textarea>
<label for="tribute-players">Người chơi · mỗi dòng một tên</label>
<textarea id="tribute-players" name="players" rows="4" maxlength="81000" placeholder="Nhập danh sách người chơi muốn cảm ơn">{{ old('players', collect($state->tribute['rows'] ?? [])->where('group', 'Cảm ơn bạn đã chơi')->pluck('name')->implode("\n")) }}</textarea>
<label for="tribute-seconds">Số giây dành cho mỗi tên (4–12)</label><input id="tribute-seconds" name="seconds" type="number" min="4" max="12" value="{{ old('seconds', $state->tribute['seconds'] ?? 4) }}" required>
<p id="tribute-estimate" role="status"></p>
<p>Chỉ nhập tên được phép trình chiếu công khai. Không tự lấy dữ liệu hoặc thư riêng tư từ game. Bắt đầu sẽ chốt danh sách; sửa ô nhập không đổi lượt đang chạy.</p>
<button class="button primary">Bắt đầu tri ân từ đầu</button>
</form>
<form method="post" action="{{ route('admin.stage.command') }}">@csrf<input type="hidden" name="revision" value="{{ $state->revision }}"><input type="hidden" name="action" value="tribute-stop"><button class="button quiet">Kết thúc tri ân · trở lại lời chúc</button></form>
<p>Nhạc từ video mới của bạn phát lặp liên tục, kể cả khi đã chạy hết danh sách. Tắt nhạc tại máy chiếu hoặc kết thúc tri ân để dừng. Preview không phát nhạc. Máy chiếu tự mở nhạc khi bắt đầu lượt tri ân mới. Nếu trình duyệt chặn tự phát, bấm nút cho phép phát nhạc một lần. Phím M bật/tắt nhạc. Emergency Blank hủy lượt tri ân và tắt nhạc; muốn chiếu lại, mở màn hình rồi bắt đầu lại.</p>
</section>
