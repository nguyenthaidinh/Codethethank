import { useEffect, useRef, useState } from "react";
import type { FinaleAction } from "./state";
import {
  MAX_DISPLAY_NAME,
  MAX_MESSAGE,
  MAX_RECIPIENT,
  type Letter,
} from "./letter";
import { prompts } from "./story";
import "./letter-experience.css";

function LetterPreview({ letter }: { letter: Letter }) {
  return (
    <article
      className="gratitude-preview"
      aria-label="Bản xem trước lời cảm ơn"
    >
      <span className="gratitude-kicker">20 / 11 · MỘT LỜI TRI ÂN</span>
      <h2>
        {letter.recipient ? `Gửi ${letter.recipient}` : "Gửi người đã ở lại"}
      </h2>
      <p className="gratitude-message">
        {letter.message || "Một lời cảm ơn có thể bắt đầu bằng vài chữ…"}
      </p>
      <p className="gratitude-signature">
        — {letter.displayName?.trim() || "Một người luôn nhớ"}
      </p>
      <small>Bản xem trước cá nhân · Chưa công khai.</small>
    </article>
  );
}

/** No network side effects. Audience is a preference; confirmation is ephemeral and content-bound. */
export function LetterExperience({
  phase,
  letter,
  update,
  persisted,
  erase,
  act,
}: {
  phase: "letter" | "review";
  letter: Letter;
  update: (letter: Letter, composing?: boolean) => void;
  persisted: boolean;
  erase: () => void;
  act: (action: FinaleAction) => void;
}) {
  const [composing, setComposing] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [consent, setConsent] = useState(false);
  const [confirmedContent, setConfirmedContent] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reviewing = phase === "review";
  const publicChoice = letter.audience === "public";
  // Content-bound confirmation cannot survive an edit, reload or pause/unmount.
  const fingerprint = JSON.stringify([
    letter.recipient,
    letter.message,
    letter.displayName,
    letter.audience,
  ]);
  const confirmed = confirmedContent === fingerprint;
  const publicReady = !!letter.recipient.trim() && !!letter.message.trim();
  useEffect(() => {
    if (reviewing) {
      heading.current?.focus();
      return;
    }
    const reduced =
      first.current?.closest(".motion-reduced") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        // Let the push-in finish before opening a mobile keyboard; never steal focus.
        if (
          !first.current
            ?.closest(".letter-experience")
            ?.contains(document.activeElement)
        )
          first.current?.focus();
      },
      reduced ? 0 : 1900,
    );
    return () => window.clearTimeout(timer);
  }, [reviewing]);
  const status = persisted
    ? "Chỉ lưu trên thiết bị này · Chưa công khai."
    : letter.local
      ? "Chưa có bản lưu trên thiết bị · Chỉ giữ trong phiên này."
      : "Chỉ giữ trong phiên này · Chưa công khai.";
  const input = (key: "recipient" | "message" | "displayName") => ({
    onCompositionStart: () => setComposing(true),
    onCompositionEnd: (
      e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setComposing(false);
      update({ ...letter, [key]: e.currentTarget.value });
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update({ ...letter, [key]: e.currentTarget.value }, composing),
  });
  return (
    <section
      className={`letter-experience ${reviewing ? "is-review" : ""}`}
      aria-label={
        reviewing ? "Đọc lại trước khi tạo sao" : "Lời cảm ơn riêng tư"
      }
    >
      <header className="gratitude-header">
        <div>
          <span className="gratitude-kicker">THE UNWRITTEN LESSON</span>
          <h1 ref={heading} tabIndex={-1}>
            {reviewing
              ? "Trước khi trao lời cảm ơn"
              : "Có một lời, dành riêng cho thầy cô."}
          </h1>
        </div>
        <span className="gratitude-private">Chưa công khai</span>
      </header>
      {!reviewing && (
        <div className="gratitude-tabs" aria-label="Chế độ soạn thư">
          <button
            type="button"
            aria-pressed={tab === "edit"}
            onClick={() => setTab("edit")}
          >
            Soạn lời nhắn
          </button>
          <button
            type="button"
            aria-pressed={tab === "preview"}
            disabled={composing}
            onClick={() => setTab("preview")}
          >
            Xem trước
          </button>
        </div>
      )}
      <div className="gratitude-layout" data-tab={tab}>
        {!reviewing && (
          <form
            className="gratitude-form"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (composing ||
                  e.nativeEvent.isComposing ||
                  e.nativeEvent.keyCode === 229)
              ) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!composing) act({ type: "review" });
            }}
          >
            <label htmlFor="recipient">
              Gửi đến <small>(tùy chọn khi giữ riêng tư)</small>
            </label>
            <input
              ref={first}
              id="recipient"
              value={letter.recipient}
              {...input("recipient")}
              autoComplete="off"
              placeholder="Thầy, cô mà bạn muốn cảm ơn…"
              aria-describedby="letter-limit"
            />
            <label htmlFor="gratitude">Lời muốn nói</label>
            <textarea
              id="gratitude"
              value={letter.message}
              {...input("message")}
              rows={5}
              placeholder="Cảm ơn vì…"
              aria-describedby="letter-limit"
            />
            <small id="letter-limit">
              {Array.from(letter.message.normalize("NFC")).length}/{MAX_MESSAGE}{" "}
              chữ · Tên người nhận tối đa {MAX_RECIPIENT} chữ.
            </small>
            <div className="gratitude-prompts" aria-label="Gợi ý lời cảm ơn">
              {prompts.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  disabled={composing}
                  onClick={() => {
                    update({ ...letter, message: p });
                    document.getElementById("gratitude")?.focus();
                  }}
                >
                  Gợi ý {i + 1}
                </button>
              ))}
            </div>
            <label htmlFor="display-name">
              Tên hiển thị <small>(tùy chọn)</small>
            </label>
            <input
              id="display-name"
              value={letter.displayName ?? ""}
              {...input("displayName")}
              autoComplete="off"
              placeholder="Tên hoặc bút danh của bạn"
              aria-describedby="display-limit"
            />
            <small id="display-limit">
              Tối đa {MAX_DISPLAY_NAME} chữ. Bỏ trống để dùng “Một người luôn
              nhớ”.
            </small>
            <fieldset disabled={composing} className="gratitude-audience">
              <legend>Bạn muốn giữ lời nhắn thế nào?</legend>
              <label>
                <input
                  type="radio"
                  name="audience"
                  checked={!publicChoice}
                  onChange={() => update({ ...letter, audience: "private" })}
                />
                Giữ riêng tư
              </label>
              <label>
                <input
                  type="radio"
                  name="audience"
                  checked={publicChoice}
                  onChange={() => update({ ...letter, audience: "public" })}
                />
                Muốn chia sẻ công khai
              </label>
              {publicChoice && (
                <p>
                  Dịch vụ gửi công khai chưa mở. Bạn có thể xem trước và xác
                  nhận lựa chọn; lời nhắn chưa được gửi và sẽ không tự gửi về
                  sau.
                </p>
              )}
            </fieldset>
            <label className="gratitude-check">
              <input
                type="checkbox"
                checked={letter.local}
                disabled={composing}
                onChange={(e) => update({ ...letter, local: e.target.checked })}
              />
              Lưu riêng bản nháp trên thiết bị này
            </label>
            <div className="gratitude-draft-actions">
              <button
                type="button"
                disabled={composing}
                onClick={() => update({ ...letter, local: true })}
              >
                Lưu bản nháp riêng tư
              </button>
              <button type="button" disabled={composing} onClick={erase}>
                Xóa nội dung đã lưu
              </button>
            </div>
          </form>
        )}
        <LetterPreview letter={letter} />
        {reviewing && (
          <div className="gratitude-confirmation">
            <h2>
              {publicChoice
                ? "Lựa chọn chia sẻ công khai"
                : "Một lời cảm ơn riêng tư"}
            </h2>
            {publicChoice ? (
              <>
                <p>
                  Dịch vụ gửi công khai chưa mở. Xác nhận ở đây chỉ ghi nhận lựa
                  chọn trong lần xem này; không gửi dữ liệu, không đưa lên tường
                  và không tự gửi về sau.
                </p>
                {!publicReady && (
                  <p role="status">
                    Hãy thêm người nhận và lời nhắn trước khi xác nhận lựa chọn
                    công khai.
                  </p>
                )}
                <label className="gratitude-check">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setConfirmedContent(null);
                    }}
                  />
                  Tôi muốn tên hiển thị, người nhận và lời nhắn này được công
                  khai sau khi duyệt, nếu tôi chủ động gửi khi dịch vụ mở.
                </label>
                <button
                  type="button"
                  disabled={!consent || !publicReady || confirmed}
                  onClick={() => setConfirmedContent(fingerprint)}
                >
                  Xác nhận lựa chọn công khai
                </button>
                {confirmed && (
                  <p role="status">
                    Đã xác nhận lựa chọn · Chưa gửi. Bạn vẫn có thể tiếp tục
                    bằng ngôi sao riêng tư.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    update({ ...letter, audience: "private" });
                    setConsent(false);
                    setConfirmedContent(null);
                  }}
                >
                  Đổi sang giữ riêng tư
                </button>
              </>
            ) : (
              <p>
                Lời nhắn chỉ xuất hiện trong phiên chơi của bạn. Không có nội
                dung nào được gửi lên mạng.
              </p>
            )}
            <small>{status}</small>
          </div>
        )}
      </div>
      <footer className="gratitude-footer">
        <small id="letter-status" role="status">
          {status}
        </small>
        <div>
          {reviewing ? (
            <>
              <button type="button" onClick={() => act({ type: "edit" })}>
                Sửa lời nhắn
              </button>
              <button
                type="button"
                className="gratitude-primary"
                disabled={publicChoice && !confirmed}
                onClick={() => act({ type: "commit" })}
              >
                Tạo ngôi sao riêng tư
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={composing}
                onClick={() => act({ type: "skip" })}
              >
                Bỏ qua lời nhắn
              </button>
              <button
                type="button"
                className="gratitude-primary"
                disabled={composing}
                onClick={() => {
                  if (!composing) act({ type: "review" });
                }}
              >
                Đọc lại lời cảm ơn
              </button>
            </>
          )}
        </div>
      </footer>
    </section>
  );
}
