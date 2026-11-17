export const PREFERENCES_KEY = "unwritten.menu.preferences.v1";
export interface Preferences {
  music: number;
  effects: number;
  muted: boolean;
  captions: boolean;
  voice?: boolean;
  reduced: boolean;
  quality: "auto" | "low" | "high";
}
export const defaultPreferences: Preferences = {
  music: 0.55,
  effects: 0.65,
  muted: true,
  captions: true,
  voice: true,
  reduced: false,
  quality: "auto",
};
export function decodePreferences(raw: string | null): Preferences {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return { ...defaultPreferences };
    const level = (key: "music" | "effects") =>
      typeof value[key] === "number" && Number.isFinite(value[key])
        ? Math.min(1, Math.max(0, value[key]))
        : defaultPreferences[key];
    return {
      music: level("music"),
      effects: level("effects"),
      muted: typeof value.muted === "boolean" ? value.muted : true,
      captions: typeof value.captions === "boolean" ? value.captions : true,
      voice: typeof value.voice === "boolean" ? value.voice : true,
      reduced: typeof value.reduced === "boolean" ? value.reduced : false,
      quality: ["auto", "low", "high"].includes(value.quality)
        ? value.quality
        : "auto",
    };
  } catch {
    return { ...defaultPreferences };
  }
}
export function readPreferences(): Preferences {
  try {
    return decodePreferences(localStorage.getItem(PREFERENCES_KEY));
  } catch {
    return { ...defaultPreferences };
  }
}
