import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
// Format conversion only; the generated original is preserved under ending-artifacts/sources.
const browser = await chromium.launch({ headless: true });
const name = process.argv[2] ?? "campus-night";
try {
  const page = await browser.newPage();
  const encoded = await page.evaluate(
    async (source) => {
      const image = new Image();
      image.src = `data:image/png;base64,${source}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
      return canvas.toDataURL("image/webp", 0.9).split(",")[1];
    },
    readFileSync(`ending-artifacts/sources/${name}.png`).toString("base64"),
  );
  const output = Buffer.from(encoded, "base64");
  writeFileSync(`public/ending/${name}.webp`, output);
  console.log(`${name}.webp: ${output.length} bytes`);
} finally {
  await browser.close();
}
