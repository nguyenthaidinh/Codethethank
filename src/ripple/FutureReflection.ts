import type { FinaleSave } from "../finale/state";
import type { FutureShot } from "./FutureArrival";

type Reflection = FinaleSave & { phase: "memory" | "lesson" | "question" };

export function isFutureReflection(
  finale: FinaleSave | null,
): finale is Reflection {
  return !!finale && ["memory", "lesson", "question"].includes(finale.phase);
}

/** The reflection stays at the 2046 desk until the transition to the player room. */
export function futureReflectionShot(
  finale: Reflection,
  time: number,
  portrait: boolean,
  reduced: boolean,
): FutureShot {
  if (finale.phase === "memory" && finale.memoryFocus) {
    switch (finale.memoryFocus) {
      case "evaluation":
        return {
          eye: [2.7, 2.85, -0.2],
          at: [0.93, 1.09, -1.09],
          fov: portrait ? 54 : 40,
        };
      case "chair":
        return {
          eye: [3.65, 1.54, 2.5],
          at: [0.95, 0.69, 0.28],
          fov: portrait ? 53 : 43,
        };
      case "notebook":
        return {
          eye: [2.7, 2.62, 0.9],
          at: [0.26, 1.08, -0.73],
          fov: portrait ? 54 : 40,
        };
    }
  }
  const drift = reduced ? 0 : Math.min(1, time / 16) * 0.32;
  return {
    // Keep the narrow shot in front of the data loom rather than inside it.
    eye: portrait ? [3.25 - drift, 2.02, -3.45] : [3.68 - drift, 1.91, -3.82],
    at: [0.34, 1.35, 0.24],
    fov: portrait ? 58 : 41,
  };
}
