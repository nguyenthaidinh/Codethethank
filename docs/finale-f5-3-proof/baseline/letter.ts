export const LETTER_KEY = "project2011.gratitude.v1";
export const MAX_MESSAGE = 500;
export const MAX_RECIPIENT = 60;
export interface Letter {
  version: 1;
  recipient: string;
  message: string;
  local: boolean;
}
export const blankLetter: Letter = {
  version: 1,
  recipient: "",
  message: "",
  local: true,
};
export function normalizeLetter(v: Letter): Letter {
  return {
    version: 1,
    recipient: Array.from(v.recipient.normalize("NFC"))
      .slice(0, MAX_RECIPIENT)
      .join(""),
    message: Array.from(v.message.normalize("NFC"))
      .slice(0, MAX_MESSAGE)
      .join(""),
    local: !!v.local,
  };
}
export function readLetter(): Letter {
  try {
    const v = JSON.parse(localStorage.getItem(LETTER_KEY) ?? "null");
    if (
      v?.version === 1 &&
      typeof v.recipient === "string" &&
      typeof v.message === "string" &&
      v.local === true
    )
      return normalizeLetter(v);
  } catch {
    /* Storage unavailable: keep an in-memory letter. */
  }
  return { ...blankLetter };
}
export function saveLetter(v: Letter): boolean {
  try {
    if (v.local)
      localStorage.setItem(LETTER_KEY, JSON.stringify(normalizeLetter(v)));
    else localStorage.removeItem(LETTER_KEY);
    return v.local;
  } catch {
    return false;
  }
}
export function removeLetter(): boolean {
  try {
    localStorage.removeItem(LETTER_KEY);
    return true;
  } catch {
    return false;
  }
}
