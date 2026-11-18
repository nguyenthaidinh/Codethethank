import { useEffect, useRef, useState } from "react";
import type { FinaleAction } from "./state";
import {
  MAX_DISPLAY_NAME,
  MAX_MESSAGE,
  MAX_RECIPIENT,
  type Letter,
} from "./letter";
import { prompts } from "./story";
import { PublicReceipt, PublicSharing } from "./PublicSharing";
import "./letter-experience.css";

function LetterPreview({ letter }: { letter: Letter }) {
  return (
    <article
      className="gratitude-preview"
      aria-label="Bản xem trước lời cảm ơn"
    >
      <span className="gratitude-kicker">BẢN XEM TRƯỚC</span>
      <h2>
        {letter.recipient ? `Gửi ${letter.recipient}` : "Gửi người đã ở lại"}
      </h2>
      <p className="gratitude-message">
        {letter.message || "Một lời cảm ơn có thể bắt đầu bằng vài chữ…"}
      </p>
      <p className="gratitude-signature">
        — {letter.displayName?.trim() || "Một người luôn nhớ"}
      </p>
      <small>Bản xem trước cá nhân · Gửi công khai là thao tác riêng.</small>
    </article>
  );
}

/** Audience remains a preference. Only the explicit PublicSharing action sends a public copy. */
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
  const first = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reviewing = phase === "review";
  const publicChoice = letter.audience === "public";
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
    ? "Bản nháp lưu riêng trên thiết bị này."
    : letter.local
      ? "Chưa có bản lưu trên thiết bị · Chỉ giữ trong phiên này."
      : "Bản nháp chỉ giữ trong phiên này.";
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
          <h1 ref={heading} tabIndex={-1}>
            {reviewing ? "Đọc lại lời cảm ơn" : "Viết lời cảm ơn"}
          </h1>
        </div>
        <span className="gratitude-private">Bản nháp cá nhân</span>
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
                  Ở bước đọc lại, bạn có thể chủ động gửi một bản sao lên Live
                  Wall. Chọn mục này chưa gửi dữ liệu; tải lại cũng không tự
                  gửi.
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
                <PublicSharing letter={letter} />
                <button
                  type="button"
                  onClick={() => {
                    update({ ...letter, audience: "private" });
                  }}
                >
                  Đổi sang giữ riêng tư
                </button>
              </>
            ) : (
              <p>
                Lựa chọn riêng tư không gửi lời nhắn lên mạng. Nếu trước đó đã
                gửi một bản công khai, bạn có thể gỡ bản ấy ở bên dưới.
              </p>
            )}
            <small>{status}</small>
            <PublicReceipt />
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
