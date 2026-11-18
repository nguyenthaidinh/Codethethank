import { useEffect, useRef, useState } from "react";
import type { AudioDirector } from "../cinematic/AudioDirector";
import { VoicePlayer, type VoicePosition } from "./VoicePlayer";
import { PREFERENCES_KEY, readPreferences } from "../menu/preferences";
export function useNarration(
  caption: string | null,
  audio: AudioDirector | null,
  enabled: boolean,
  paused: boolean,
  preference: boolean,
  position?: VoicePosition,
) {
  const player = useRef<VoicePlayer | null>(null);
  const [status, setStatus] = useState("idle");
  useEffect(() => {
    try {
      const preferences = readPreferences();
      if (preferences.voice !== preference)
        localStorage.setItem(
          PREFERENCES_KEY,
          JSON.stringify({ ...preferences, voice: preference }),
        );
    } catch {
      /* Voice remains usable when storage is blocked. */
    }
  }, [preference]);
  useEffect(() => {
    if (!audio) return;
    const voice = new VoicePlayer(audio, setStatus);
    player.current = voice;
    return () => {
      voice.dispose();
      if (player.current === voice) player.current = null;
    };
  }, [audio]);
  useEffect(() => {
    player.current?.update(caption, enabled, paused, position);
  }, [audio, caption, enabled, paused, position]);
  return { player, status };
}
