import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { applyLocale } from "@/shared/lib/i18n";
import { applyTheme } from "@/shared/lib/theme";
import { isDemoMode } from "@/shared/config";

import { App } from "./app";
import "./styles/index.css";

applyTheme();
applyLocale();

if (isDemoMode) {
  const { installDemoApi } = await import("./mocks/install");
  installDemoApi();
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("앱을 표시할 root 요소가 없습니다.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
