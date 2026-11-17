import { useEffect, useState } from "react";
import type { Letter } from "./letter";
import {
  loadSharingPolicy,
  publicPayload,
  retryPublicLetter,
  samePublicCopy,
  sendPublicLetter,
  usePublicSharing,
  withdrawPublicLetter,
} from "./public-sharing";
import "./public-sharing.css";

export function PublicReceipt() {
  const { receipt, busy, notice, receiptStored } = usePublicSharing();
  const [retryConsent, setRetryConsent] = useState(false);
  if (!receipt && !notice) return null;
  return (
    <aside className="public-receipt" aria-label="Bản gửi Live Wall">
      {receipt && !receiptStored && (
        <p role="status">
          Trình duyệt không lưu được biên nhận. Hãy thử lại hoặc gỡ trước khi
          đóng hay tải lại trang.
        </p>
      )}
      <strong>
        {receipt?.status === "withdrawn"
          ? "Bản công khai đã được gỡ"
          : receipt?.status === "uncertain"
            ? "Lần gửi chưa rõ kết quả"
            : receipt
              ? "Bạn đã gửi một bản công khai"
              : "Live Wall"}
      </strong>
      {receipt?.status === "uncertain" && (
        <>
          <p>
            Lời đã chủ động gửi: <b>{receipt.payload?.recipient}</b>
          </p>
          <blockquote>{receipt.payload?.message}</blockquote>
          <small>— {receipt.payload?.display_name || "Ẩn danh"}</small>
          <label>
            <input
              type="checkbox"
              checked={retryConsent}
              disabled={busy}
              onChange={(event) => setRetryConsent(event.target.checked)}
            />{" "}
            Tôi xác nhận gửi lại đúng lời chúc ở trên, để hiển thị ngay.
          </label>
          <button
            disabled={busy || !retryConsent}
            onClick={() => {
              setRetryConsent(false);
              void retryPublicLetter(retryConsent);
            }}
          >
            Thử lại cùng lời chúc
          </button>
        </>
      )}
      {receipt?.id && receipt.status !== "withdrawn" && (
        <>
          <details>
            <summary>Xem bản đã gửi</summary>
            <p>Gửi {receipt.payload?.recipient}</p>
            <blockquote>{receipt.payload?.message}</blockquote>
            <small>— {receipt.payload?.display_name || "Ẩn danh"}</small>
          </details>
          <p>
            Xóa bản nháp hoặc đổi sang riêng tư không gỡ bản đã gửi. Dùng nút
            dưới đây để gỡ khỏi Live Wall.
          </p>
          <button disabled={busy} onClick={() => void withdrawPublicLetter()}>
            Gỡ bản công khai
          </button>
        </>
      )}
      <p role="status" aria-live="polite">
        {notice}
      </p>
    </aside>
  );
}

export function PublicSharing({ letter }: { letter: Letter }) {
  const { receipt, busy } = usePublicSharing();
  const [policy, setPolicy] = useState("");
  const [error, setError] = useState("");
  const [policyAttempt, setPolicyAttempt] = useState(0);
  const [acceptedCopy, setAcceptedCopy] = useState<string | null>(null);
  const fingerprint = JSON.stringify(publicPayload(letter));
  const accepted = acceptedCopy === fingerprint;
  useEffect(() => {
    const controller = new AbortController();
    loadSharingPolicy(controller.signal)
      .then(setPolicy)
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error.name === "TypeError" || error.name === "TimeoutError"
              ? "Chưa kết nối được Live Wall. Bạn vẫn có thể tiếp tục riêng tư."
              : error.message,
          );
      });
    return () => controller.abort();
  }, [policyAttempt]);
  const ready = !!letter.recipient.trim() && !!letter.message.trim();
  const alreadySent = !!receipt && receipt.status !== "withdrawn";
  return (
    <div className="public-sharing">
      <p>
        Một bản sao lời chúc sẽ lên màn hình sự kiện ngay, không chờ duyệt. Thư
        riêng tư chỉ được gửi khi bạn tự chọn thao tác dưới đây.
      </p>
      {!ready && (
        <p role="status">Hãy thêm người nhận và lời nhắn trước khi gửi.</p>
      )}
      {error && (
        <>
          <p role="status">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError("");
              setAcceptedCopy(null);
              setPolicyAttempt((attempt) => attempt + 1);
            }}
          >
            Thử kết nối lại
          </button>
        </>
      )}
      <label className="gratitude-check">
        <input
          type="checkbox"
          checked={accepted}
          disabled={!policy || busy || alreadySent}
          onChange={(event) =>
            setAcceptedCopy(event.target.checked ? fingerprint : null)
          }
        />
        {policy || "Đang tải xác nhận chia sẻ…"}
      </label>
      <button
        type="button"
        className="gratitude-primary"
        disabled={!accepted || !ready || busy || alreadySent}
        onClick={() => {
          setAcceptedCopy(null);
          void sendPublicLetter(letter, accepted);
        }}
      >
        {busy
          ? "Đang xử lý…"
          : samePublicCopy(letter) && receipt?.status === "approved"
            ? "Đã gửi lời chúc này"
            : "Gửi lên Live Wall"}
      </button>
      <small>
        Không cần gửi để hoàn thành game. Nếu sân khấu đang Manual hoặc được
        che, lời chúc chờ Auto mở lại.
      </small>
    </div>
  );
}
