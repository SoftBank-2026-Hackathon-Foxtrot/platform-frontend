import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  server: {
    host: "127.0.0.1",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  fmt: { ignorePatterns: ["src/shared/ui/**"] },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    overrides: [
      {
        files: ["src/**"],
        rules: {
          "no-restricted-globals": [
            "error",
            { name: "fetch", message: "shared/api의 Axios와 TanStack Query를 사용하십시오." },
            { name: "XMLHttpRequest", message: "shared/api의 Axios를 사용하십시오." },
          ],
          "no-restricted-properties": [
            "error",
            {
              object: "globalThis",
              property: "fetch",
              message: "shared/api의 Axios를 사용하십시오.",
            },
            { object: "window", property: "fetch", message: "shared/api의 Axios를 사용하십시오." },
          ],
        },
      },
      {
        files: ["src/**"],
        excludeFiles: ["src/shared/api/**"],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              paths: [{ name: "axios", message: "@/shared/api의 공통 인스턴스를 사용하십시오." }],
              patterns: [
                { group: ["axios/*"], message: "@/shared/api의 공통 인스턴스를 사용하십시오." },
              ],
            },
          ],
        },
      },
    ],
    options: { typeAware: true, typeCheck: true },
  },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
