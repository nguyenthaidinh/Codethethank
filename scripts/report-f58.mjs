import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const root = "backend/proof-f58/";
const before = JSON.parse(
  readFileSync(root + "game-before.json", "utf8").replace(/^\uFEFF/, ""),
);
const ours = [
  "/src/finale/FinaleControls.tsx",
  "/src/finale/LetterExperience.tsx",
  "/src/finale/RevealControls.tsx",
];
const changed = before.filter(
  (row) =>
    createHash("sha256")
      .update(readFileSync(row.Path))
      .digest("hex")
      .toUpperCase() !== row.Hash,
);
const preservation = {
  checked: before.length,
  authorizedUiChanges: changed
    .filter((row) =>
      ours.some((path) => row.Path.replaceAll("\\", "/").endsWith(path)),
    )
    .map((row) => row.Path),
  concurrentChanges: changed
    .filter(
      (row) =>
        !ours.some((path) => row.Path.replaceAll("\\", "/").endsWith(path)),
    )
    .map((row) => row.Path),
  critical: before
    .filter((row) =>
      /src[\\/]finale[\\/](state|letter|reveal|PlayerRoom|FinaleVisual|CinematicReveal)\.(ts|tsx)$/.test(
        row.Path,
      ),
    )
    .map((row) => ({ path: row.Path, unchanged: !changed.includes(row) })),
};
writeFileSync(
  root + "preservation.json",
  JSON.stringify(preservation, null, 2),
);
const unit = JSON.parse(readFileSync(root + "unit-all.json", "utf8"));
const summary = {
  passed: unit.numPassedTests,
  failed: unit.numFailedTests,
  failures: unit.testResults.flatMap((result) =>
    result.assertionResults
      .filter((test) => test.status === "failed")
      .map((test) => ({
        file: result.name,
        name: test.fullName,
        details: test.failureMessages.map((message) => message.slice(0, 1300)),
      })),
  ),
};
writeFileSync(root + "unit-summary.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ preservation, unit: summary }, null, 2));
