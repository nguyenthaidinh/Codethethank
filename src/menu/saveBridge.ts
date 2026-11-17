import {
  freshSlice,
  readSlice,
  SLICE_KEY,
  type SliceSave,
} from "../cinematic/director";
import type { Preferences } from "./preferences";

export function readCheckpoint(): SliceSave | null {
  try {
    const save = readSlice(localStorage.getItem(SLICE_KEY));
    return save !== freshSlice &&
      (save.beat !== "arrival" || save.observed.length > 0)
      ? save
      : null;
  } catch {
    return null;
  }
}
/** Pass the state directly: starting still works when storage is unavailable. */
export function prepareLaunch(
  save: SliceSave | null,
  preferences: Preferences,
): SliceSave {
  return {
    ...(save ?? freshSlice),
    observed: [...(save?.observed ?? [])],
    muted: preferences.muted,
    captions: preferences.captions,
    voice: preferences.voice ?? true,
    reduced:
      preferences.reduced ||
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    volume: 0.8,
    music: preferences.music > 0,
    sfx: preferences.effects > 0,
  };
}
