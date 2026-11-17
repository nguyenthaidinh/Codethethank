import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
// Format conversion only; preserve generated pixels and alpha, no artwork edits.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const name of ["city-sunset", "desk-memory", "canopy"]) {
    const source = readFileSync(`menu-artifacts/sources/${name}.png`).toString(
      "base64",
    );
    const webp = await page.evaluate(async (base64) => {
      const sourceImage = new Image();
      sourceImage.src = `data:image/png;base64,${base64}`;
      await sourceImage.decode();
      const canvas = document.createElement("canvas");
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;
      canvas.getContext("2d").drawImage(sourceImage, 0, 0);
      return canvas.toDataURL("image/webp", 0.88).split(",")[1];
    }, source);
    writeFileSync(`public/menu/${name}.webp`, Buffer.from(webp, "base64"));
    console.log(name, Buffer.from(webp, "base64").length);
  }
} finally {
  await browser.close();
}
