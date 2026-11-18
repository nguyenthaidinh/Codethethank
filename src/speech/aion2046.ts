import type { RipplePhase } from "../ripple/state";
import narration from "./aion-2046.json" with { type: "json" };

interface AionCue {
  start: number;
  end: number;
  text: string;
  file: string;
}

const cues: Partial<Record<RipplePhase, AionCue[]>> = narration;

export function aionCue(phase: RipplePhase, time: number) {
  return cues[phase]?.find((cue) => time >= cue.start && time < cue.end);
}
