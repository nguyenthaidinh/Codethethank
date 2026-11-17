import { existsSync, readFileSync, writeFileSync } from "node:fs";
const root = "docs/art/proof";
const read = path => JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
const samples = name => read(`${root}/${name}/runtime/headless-frame-intervals.json`).samplesMs;
const percentile = (values, p) => [...values].sort((a,b) => a-b)[Math.floor((values.length - 1) * p)];
const shots = ["01-classroom-wide", "02-rain-window", "03-an-workspace", "04-teacher-entrance", "05-chair-cinematic", "06-notebook", "07-mobile-notebook", "08-fallback-notebook"];
const captures = shots.map(name => {
  const pair = existsSync(`${root}/baseline/runtime/${name}-matched.json`) && existsSync(`${root}/after/runtime/${name}-matched.json`) ? `${name}-matched` : name;
  const before = read(`${root}/baseline/runtime/${pair}.json`).world;
  const after = read(`${root}/after/runtime/${pair}.json`).world;
  return {
    name, pair, before, after,
    cameraDelta: Math.hypot(...before.camera.map((v,i) => v-after.camera[i])),
  };
});
const bundle = name => read(`${root}/${name}/bundle.json`).find(file => file.Name.startsWith("CinematicGame-") && file.Name.endsWith(".js")).Length;
const warm = Object.fromEntries(["baseline", "after"].filter(name => existsSync(`${root}/${name}/runtime/warm-wide.json`)).map(name => {
  const result = read(`${root}/${name}/runtime/warm-wide.json`);
  return [name, { median: percentile(result.framesMs, .5), p90: percentile(result.framesMs, .9), world: result.world, audioContext: result.audioContext }];
}));
const result = {
  caveat: "Headless host observations, not real-device FPS, GPU time or allocated GPU bytes. Baseline triangles=2 was the overlay quad and is invalid for geometry comparison.",
  bundleBytes: { before: bundle("baseline"), after: bundle("after"), difference: bundle("after")-bundle("baseline") },
  frameIntervalsMs: Object.fromEntries(["baseline", "after"].map(name => [name, { median: percentile(samples(name), .5), p90: percentile(samples(name), .9), samples: samples(name).length }])),
  warmWide: warm,
  captures,
};
writeFileSync(`${root}/comparison.json`, JSON.stringify(result, null, 2));
writeFileSync(`${root}/COMPARISON.md`, `# Actual runtime comparison\n\n${result.caveat}\n\nCinematic bundle: ${(result.bundleBytes.before/1000).toFixed(2)} → ${(result.bundleBytes.after/1000).toFixed(2)} kB (${result.bundleBytes.difference >= 0 ? "+" : ""}${(result.bundleBytes.difference/1000).toFixed(2)} kB).\n\n| Capture | Before | After | Draw calls before → after | Camera eye delta |\n|---|---|---|---|---|\n${captures.map(c => `| ${c.name} | [image](baseline/runtime/${c.pair}.png) | [image](after/runtime/${c.pair}.png) | ${c.before.drawCalls} → ${c.after.drawCalls} | ${c.cameraDelta.toFixed(4)} |`).join("\n")}\n\nCamera eye units are approximate meters; pointer parallax can introduce <0.1 differences. Same named focus/viewport, presets retained except the doorway POV, which moved inside its physically sized aperture. Full camera state is in each JSON. The two cinematic rows use supplementary reduced-motion, debugger-frozen captures from hash-verified archived/current builds. Original moving frames and video remain available. Fallback camera zeros are placeholders, not physical camera coordinates. Triangles and resources are valid world-pass counters only in the after build.\n\nAutomation-host rAF intervals (entry and same audio-enabled scene after 10s warm-up):\n\n\`\`\`json\n${JSON.stringify({entry:result.frameIntervalsMs,warm:Object.fromEntries(Object.entries(warm).map(([name,value])=>[name,{median:value.median,p90:value.p90}]))},null,2)}\n\`\`\`\n\n[Selected B / default](after/runtime/01-classroom-wide.png), [proposal A / grounded](after/runtime/proposal-A-grounded-wide.png). Both use the real classroom, same runtime and gameplay. A is a lighting/material study using the same procedural assets.\n\n[Before canvas + master audio](baseline/runtime/teacher-chair-notebook-live-audio.webm), [after canvas + master audio](after/runtime/teacher-chair-notebook-live-audio.webm). The recordings capture the game canvas and audio, not the HTML HUD/subtitles; browser screenshots include the full UI.\n`);
