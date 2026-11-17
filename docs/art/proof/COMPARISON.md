# Actual runtime comparison

Headless host observations, not real-device FPS, GPU time or allocated GPU bytes. Baseline triangles=2 was the overlay quad and is invalid for geometry comparison.

Cinematic bundle: 606.62 → 638.43 kB (+31.80 kB).

| Capture | Before | After | Draw calls before → after | Camera eye delta |
|---|---|---|---|---|
| 01-classroom-wide | [image](baseline/runtime/01-classroom-wide.png) | [image](after/runtime/01-classroom-wide.png) | 82 → 107 | 0.0000 |
| 02-rain-window | [image](baseline/runtime/02-rain-window.png) | [image](after/runtime/02-rain-window.png) | 38 → 38 | 0.0000 |
| 03-an-workspace | [image](baseline/runtime/03-an-workspace.png) | [image](after/runtime/03-an-workspace.png) | 45 → 53 | 0.0000 |
| 04-teacher-entrance | [image](baseline/runtime/04-teacher-entrance-matched.png) | [image](after/runtime/04-teacher-entrance-matched.png) | 71 → 211 | 0.0000 |
| 05-chair-cinematic | [image](baseline/runtime/05-chair-cinematic-matched.png) | [image](after/runtime/05-chair-cinematic-matched.png) | 85 → 116 | 0.0000 |
| 06-notebook | [image](baseline/runtime/06-notebook.png) | [image](after/runtime/06-notebook.png) | 56 → 78 | 0.0000 |
| 07-mobile-notebook | [image](baseline/runtime/07-mobile-notebook.png) | [image](after/runtime/07-mobile-notebook.png) | 53 → 58 | 0.0000 |
| 08-fallback-notebook | [image](baseline/runtime/08-fallback-notebook.png) | [image](after/runtime/08-fallback-notebook.png) | 1 → 1 | 0.0000 |

Camera eye units are approximate meters; pointer parallax can introduce <0.1 differences. Same named focus/viewport, presets retained except the doorway POV, which moved inside its physically sized aperture. Full camera state is in each JSON. The two cinematic rows use supplementary reduced-motion, debugger-frozen captures from hash-verified archived/current builds. Original moving frames and video remain available. Fallback camera zeros are placeholders, not physical camera coordinates. Triangles and resources are valid world-pass counters only in the after build.

Automation-host rAF intervals (entry and same audio-enabled scene after 10s warm-up):

```json
{
  "entry": {
    "baseline": {
      "median": 49.900000000001455,
      "p90": 50,
      "samples": 47
    },
    "after": {
      "median": 100,
      "p90": 100.09999999999854,
      "samples": 47
    }
  },
  "warm": {
    "baseline": {
      "median": 49.899999999999636,
      "p90": 50
    },
    "after": {
      "median": 66.70000000000073,
      "p90": 83.39999999999964
    }
  }
}
```

[Selected B / default](after/runtime/01-classroom-wide.png), [proposal A / grounded](after/runtime/proposal-A-grounded-wide.png). Both use the real classroom, same runtime and gameplay. A is a lighting/material study using the same procedural assets.

[Before canvas + master audio](baseline/runtime/teacher-chair-notebook-live-audio.webm), [after canvas + master audio](after/runtime/teacher-chair-notebook-live-audio.webm). The recordings capture the game canvas and audio, not the HTML HUD/subtitles; browser screenshots include the full UI.
