import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { applyTheme } from "@/shared/lib/theme";

import { App } from "./app";
import "./styles/index.css";

applyTheme();

const root = document.getElementById("root");

if (!root) {
  throw new Error("앱을 표시할 root 요소가 없습니다.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
