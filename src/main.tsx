import { createRoot } from "react-dom/client";
import GameShell from "./menu/GameShell";
import { prepareTypography } from "./typography/fonts";
void prepareTypography().then(() => {
  createRoot(document.getElementById("root")!).render(<GameShell />);
});
