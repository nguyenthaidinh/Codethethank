import { freshSlice, type SliceSave } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
import { freshStay } from "../../src/stayed/state";
import { freshRipple } from "../../src/ripple/state";
/** Valid chapter boundary, used only for targeted QA. Fullgame test starts from menu. */
export const finaleReady: SliceSave = {
  ...freshSlice,
  beat: "explore",
  chapter: {
    version: 1,
    beat: "NEXT_SCENE_READY",
    signal: true,
    evidence: ["clock", "notebook", "laptop"],
    verdict: {
      ...freshVerdict,
      phase: "chapter02",
      found: ["presentation", "notes", "data"],
      tested: ["student07", "an"],
      selected: "an",
      linked: ["presentation", "notes"],
      stayed: {
        ...freshStay,
        phase: "next",
        read: ["outcome", "support"],
        page: "support",
        written: true,
        nextInspected: true,
      },
      ripple: {
        ...freshRipple,
        phase: "finale",
        questions: ["prediction", "opportunity"],
        milestones: 3,
        memories: ["evaluation", "stayed", "design"],
        played: ["echo.chair", "chair.chair", "reveal.music"],
      },
    },
  },
};
