(() => {
    const form = document.querySelector("#share-form"),
        status = document.querySelector("#share-status"),
        send = document.querySelector("#send"),
        withdraw = document.querySelector("#withdraw");
    let policy,
        pending,
        receipt,
        busy = false;
    try {
        receipt = JSON.parse(sessionStorage.getItem("aion-wall-receipt"));
    } catch {}
    withdraw.hidden = !receipt;
    const randomHex = () =>
        Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
            b.toString(16).padStart(2, "0"),
        ).join("");
    fetch("/api/v1/sharing-policy", { cache: "no-store" })
        .then((r) => {
            if (!r.ok) throw Error();
            return r.json();
        })
        .then(({ data }) => {
            policy = data;
            document.querySelector("#policy").textContent = data.text;
            send.disabled = false;
        })
        .catch(() => {
            status.textContent =
                "Không tải được xác nhận chia sẻ. Vui lòng tải lại trang.";
        });
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (busy || !policy || !form.reportValidity()) return;
        const payload = {
            recipient: form.recipient.value,
            message: form.message.value,
            display_name: form.display_name.value,
            consent: {
                accepted: form.querySelector("#consent").checked,
                version: policy.version,
            },
        };
        if (
            pending &&
            JSON.stringify(pending.payload) !== JSON.stringify(payload)
        ) {
            status.textContent =
                "Lần gửi trước chưa được xác nhận. Giữ nguyên nội dung và thử gửi lại để tránh gửi trùng.";
            return;
        }
        pending ??= { payload, key: crypto.randomUUID(), token: randomHex() };
        busy = true;
        send.disabled = true;
        status.textContent = "Đang gửi ánh sáng của bạn…";
        try {
            const response = await fetch("/api/v1/submissions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "Idempotency-Key": pending.key,
                    "X-Receipt-Token": pending.token,
                },
                body: JSON.stringify(pending.payload),
                signal: AbortSignal.timeout(12000),
            });
            const body = await response.json();
            if (!response.ok) {
                if (response.status === 422) {
                    pending = null;
                    throw Error(
                        "Nội dung chưa hợp lệ. Kiểm tra độ dài và xác nhận chia sẻ.",
                    );
                }
                throw Error(
                    response.status === 429
                        ? "Bạn gửi hơi nhanh. Chờ một phút rồi thử lại."
                        : "Chưa xác nhận được lần gửi. Vui lòng thử lại với cùng nội dung.",
                );
            }
            receipt = { id: body.data.id, token: pending.token };
            try {
                sessionStorage.setItem(
                    "aion-wall-receipt",
                    JSON.stringify(receipt),
                );
            } catch {}
            status.textContent =
                body.data.status === "approved"
                    ? "Đã gửi! Lời chúc đã sẵn sàng lên màn hình ở chế độ Auto."
                    : `Trạng thái lời chúc: ${body.data.status}`;
            pending = null;
            withdraw.hidden = false;
            form.reset();
        } catch (error) {
            status.textContent =
                error.name === "TimeoutError"
                    ? "Kết nối chậm. Thử gửi lại cùng nội dung; hệ thống sẽ không tạo bản trùng."
                    : error.message;
        } finally {
            busy = false;
            send.disabled = false;
        }
    });
    withdraw.addEventListener("click", async () => {
        if (!receipt || busy) return;
        busy = true;
        withdraw.disabled = true;
        try {
            const response = await fetch(`/api/v1/submissions/${receipt.id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-Receipt-Token": receipt.token,
                },
                signal: AbortSignal.timeout(12000),
            });
            if (!response.ok) throw Error();
            receipt = null;
            try {
                sessionStorage.removeItem("aion-wall-receipt");
            } catch {}
            withdraw.hidden = true;
            status.textContent =
                "Đã gỡ lời chúc. Máy chiếu sẽ cập nhật ở nhịp kết nối tiếp theo.";
        } catch {
            status.textContent =
                "Chưa xác nhận gỡ được lời chúc. Vui lòng thử lại.";
        } finally {
            busy = false;
            withdraw.disabled = false;
        }
    });
})();
