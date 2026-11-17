(() => {
    const tributeForm = document.querySelector('#tribute-form');
    function estimate() {
        if (!tributeForm) return;
        const names = ['additional', 'players'].flatMap(name => tributeForm.elements[name].value.split(/\r?\n/).filter(line => line.trim()));
        const count = 13 + names.length;
        const seconds = count * Math.max(4, Math.min(12, Number(tributeForm.elements.seconds.value) || 4)) + 5;
        document.querySelector('#tribute-estimate').textContent = `${count} lượt tri ân · khoảng ${Math.floor(seconds / 60)} phút ${seconds % 60} giây. Giữ nguyên thứ tự và tên trùng.`;
    }
    tributeForm?.addEventListener('input', estimate);
    estimate();
    let busy = false;
    async function refresh() {
        if (busy || document.hidden) return;
        busy = true;
        try {
            const response = await fetch("/admin/stage/state", {
                cache: "no-store",
                headers: { Accept: "application/json" },
                signal: AbortSignal.timeout(4500),
            });
            if (!response.ok) throw Error();
            const state = await response.json();
            document.querySelectorAll("[name=revision]").forEach((input) => {
                input.value = state.revision;
            });
            document.querySelector("#stage-status").textContent =
                `${state.blank ? "ĐANG CHE" : "ĐANG CHIẾU"} · ${state.tribute ? "TRI ÂN" : state.mode.toUpperCase()} · Hiệu ứng ${state.effects ? "bật" : "tắt"}`;
            document.querySelector("#connection-status").textContent =
                "Đã kết nối máy chủ";
            const tributeStatus = document.querySelector('#tribute-current');
            if (tributeStatus) {
                const t = state.tribute;
                const index = t ? Math.floor((state.server_now_ms - t.started_at_ms) / (t.seconds * 1000)) : 0;
                tributeStatus.textContent = t ? (index >= t.count ? 'Đã cảm ơn hết danh sách · giữ màn kết.' : `Đang cuộn danh sách · ${Math.max(0, Math.min(99, Math.floor((state.server_now_ms - t.started_at_ms) / (t.seconds * t.count * 10))))}% · ${t.count} tên`) : 'Chưa chạy tri ân.';
            }
            const list = document.querySelector("#display-status");
            list.replaceChildren();
            for (const display of state.displays) {
                const row = document.createElement("p");
                row.textContent = `${display.name} · ${!display.online ? "Mất kết nối / chưa mở" : display.ack_revision >= state.revision ? "Đã nhận trạng thái hiện tại" : "Đang chờ xác nhận"}`;
                list.append(row);
            }
        } catch {
            document.querySelector("#connection-status").textContent =
                "Chưa xác nhận được kết nối. Kiểm tra máy chiếu trực tiếp.";
        } finally {
            busy = false;
        }
    }
    refresh();
    setInterval(refresh, 1800);
})();
