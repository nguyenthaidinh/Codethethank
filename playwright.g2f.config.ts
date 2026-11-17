import { defineConfig } from "@playwright/test";
import gameplay from "./playwright.config";
import menu from "./playwright.menu.config";

// The bundled Windows headless browser defaults to SwiftShader. Explicit ANGLE
// selects the accessible Intel GPU; original regression configs stay unchanged.
const base = process.env.G2F_SUITE === "menu" ? menu : gameplay;
export default defineConfig({
  ...base,
  use: {
    ...base.use,
    launchOptions: {
      args: process.platform === "win32" ? ["--use-angle=d3d11"] : [],
    },
  },
});
