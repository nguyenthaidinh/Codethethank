import { useSyncExternalStore } from "react";
import type { Letter } from "./letter";

export const SHARING_VERSION = "public-wall-live-v2";
export const SHARING_KEY = "project2011.public-wall.receipt.v1";
const api = (import.meta.env.VITE_GRATITUDE_API_BASE || "/api/v1").replace(
  /\/$/,
  "",
);
export interface PublicPayload {
  recipient: string;
  message: string;
  display_name: string;
  consent: { accepted: true; version: typeof SHARING_VERSION };
}
type Status =
  "uncertain" | "approved" | "pending" | "hidden" | "rejected" | "withdrawn";
interface Receipt {
  endpoint: string;
  key: string;
  token: string;
  payload: PublicPayload | null;
  id?: string;
  status: Status;
}
interface SharingState {
  receipt: Receipt | null;
  busy: boolean;
  notice: string;
  receiptStored: boolean;
}
const statuses: Status[] = [
  "uncertain",
  "approved",
  "pending",
  "hidden",
  "rejected",
  "withdrawn",
];
function restore(): Receipt | null {
  try {
    const row = JSON.parse(sessionStorage.getItem(SHARING_KEY) || "null");
    if (
      !row ||
      row.endpoint !== api ||
      !/^[0-9a-f-]{36}$/.test(row.key) ||
      !/^[0-9a-f]{64}$/.test(row.token) ||
      !statuses.includes(row.status)
    )
      return null;
    if (row.id && !/^[0-9a-f-]{36}$/.test(row.id)) return null;
    if (
      row.status !== "withdrawn" &&
      (!row.payload ||
        typeof row.payload.recipient !== "string" ||
        typeof row.payload.message !== "string" ||
        typeof row.payload.display_name !== "string" ||
        row.payload.consent?.accepted !== true ||
        row.payload.consent?.version !== SHARING_VERSION)
    )
      return null;
    return {
      endpoint: api,
      key: row.key,
      token: row.token,
      id: row.id,
      status: row.status,
      payload:
        row.status === "withdrawn"
          ? null
          : {
              recipient: row.payload.recipient,
              message: row.payload.message,
              display_name: row.payload.display_name,
              consent: { accepted: true, version: SHARING_VERSION },
            },
    };
  } catch {
    return null;
  }
}
let state: SharingState = {
  receipt: restore(),
  busy: false,
  notice: "",
  receiptStored: true,
};
const listeners = new Set<() => void>();
function publish(next: Partial<SharingState>) {
  state = { ...state, ...next };
  // This is a separate receipt for an explicitly submitted PUBLIC copy. Never reads/writes the draft/save keys.
  try {
    if (state.receipt)
      sessionStorage.setItem(SHARING_KEY, JSON.stringify(state.receipt));
    else sessionStorage.removeItem(SHARING_KEY);
    state = { ...state, receiptStored: true };
  } catch {
    state = { ...state, receiptStored: false };
  }
  listeners.forEach((listener) => listener());
}
export const usePublicSharing = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
  );
export function publicPayload(letter: Letter): PublicPayload {
  return {
    recipient: letter.recipient.trim().normalize("NFC"),
    message: letter.message.trim().normalize("NFC"),
    display_name: (letter.displayName || "").trim().normalize("NFC"),
    consent: { accepted: true, version: SHARING_VERSION },
  };
}
export function samePublicCopy(
  letter: Letter,
  receipt = state.receipt,
): boolean {
  return (
    !!receipt?.payload &&
    JSON.stringify(publicPayload(letter)) === JSON.stringify(receipt.payload)
  );
}
export async function loadSharingPolicy(signal: AbortSignal): Promise<string> {
  const response = await fetch(`${api}/sharing-policy`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
    credentials: "omit",
    cache: "no-store",
  });
  if (!response.ok)
    throw Error(
      "Chưa kết nối được Live Wall. Bạn vẫn có thể tiếp tục riêng tư.",
    );
  const { data } = await response.json();
  if (data?.version !== SHARING_VERSION || typeof data.text !== "string")
    throw Error("Xác nhận chia sẻ đã thay đổi. Hãy tải lại trước khi gửi.");
  return data.text;
}
async function submit(receipt: Receipt) {
  publish({ receipt, busy: true, notice: "Đang gửi lời chúc…" });
  try {
    const response = await fetch(`${api}/submissions`, {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Idempotency-Key": receipt.key,
        "X-Receipt-Token": receipt.token,
      },
      body: JSON.stringify(receipt.payload),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      if (response.status === 422) {
        publish({ receipt: null });
        throw Error(
          "Lời chúc chưa hợp lệ. Kiểm tra độ dài, ký tự và người nhận rồi thử lại.",
        );
      }
      throw Error(
        response.status === 429
          ? "Bạn gửi hơi nhanh. Chờ một phút rồi thử lại cùng lời chúc."
          : "Chưa xác nhận được kết quả. Thử lại lời chúc bên dưới sẽ không tạo bản trùng.",
      );
    }
    const { data } = await response.json();
    if (
      !data?.id ||
      !statuses.includes(data.status) ||
      data.status === "uncertain"
    )
      throw Error("Phản hồi chưa hợp lệ. Vui lòng thử lại cùng lời chúc.");
    publish({
      receipt: {
        ...receipt,
        id: data.id,
        status: data.status,
        payload: data.status === "withdrawn" ? null : receipt.payload,
      },
      notice:
        data.status === "approved"
          ? "Đã gửi công khai · Lời chúc lên ngay khi Live Wall ở Auto và đang mở."
          : "Đã nhận trạng thái lời chúc từ máy chủ.",
    });
  } catch (error) {
    publish({
      notice:
        error instanceof Error &&
        !["TypeError", "TimeoutError"].includes(error.name)
          ? error.message
          : "Kết nối gián đoạn, chưa rõ kết quả. Không tự gửi lại; dùng nút thử lại bên dưới.",
    });
  } finally {
    publish({ busy: false });
  }
}
/** Only called by an explicit, content-bound consent gesture. Never from mount/restore/completion. */
export async function sendPublicLetter(letter: Letter, accepted: boolean) {
  if (state.busy || !accepted || letter.audience !== "public") return;
  if (
    !globalThis.crypto?.getRandomValues ||
    typeof globalThis.crypto.randomUUID !== "function"
  ) {
    publish({
      notice:
        "Gửi công khai cần kết nối HTTPS hoặc localhost. Bạn vẫn có thể tiếp tục riêng tư.",
    });
    return;
  }
  const payload = publicPayload(letter);
  if (!payload.recipient || !payload.message) return;
  if (state.receipt && state.receipt.status !== "withdrawn") {
    publish({
      notice:
        "Hãy gỡ bản công khai trước khi gửi một bản mới; bản nháp riêng tư vẫn giữ nguyên.",
    });
    return;
  }
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  await submit({
    endpoint: api,
    key: crypto.randomUUID(),
    token,
    payload,
    status: "uncertain",
  });
}
export async function retryPublicLetter(accepted: boolean) {
  if (
    !accepted ||
    state.busy ||
    state.receipt?.status !== "uncertain" ||
    !state.receipt.payload
  )
    return;
  await submit(state.receipt);
}
export async function withdrawPublicLetter() {
  const receipt = state.receipt;
  if (state.busy || !receipt?.id || receipt.status === "withdrawn") return;
  publish({ busy: true, notice: "Đang gỡ bản công khai…" });
  try {
    const response = await fetch(`${api}/submissions/${receipt.id}`, {
      method: "DELETE",
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json", "X-Receipt-Token": receipt.token },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw Error();
    const { data } = await response.json();
    if (data?.status !== "withdrawn") throw Error();
    publish({
      receipt: { ...receipt, payload: null, status: "withdrawn" },
      notice:
        "Đã gỡ bản công khai. Bản nháp và tiến trình game vẫn giữ nguyên.",
    });
  } catch {
    publish({
      notice:
        "Chưa xác nhận gỡ được. Bản công khai có thể vẫn đang chiếu; hãy thử gỡ lại.",
    });
  } finally {
    publish({ busy: false });
  }
}
