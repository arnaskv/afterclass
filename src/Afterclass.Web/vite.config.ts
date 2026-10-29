/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, type ProxyOptions } from "vite";

// Under Aspire the API address arrives through service discovery variables; standalone `npm run dev`
// falls back to the API's launch profile.
const apiTarget =
  process.env.API_HTTP ??
  process.env.services__api__http__0 ??
  "http://localhost:5280";

// changeOrigin stays false so the API sees the browser's Host (localhost:5173) and builds OIDC
// redirect URIs on the same origin as the SPA.
const toApi: ProxyOptions = { target: apiTarget, changeOrigin: false };

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: Number(process.env.PORT ?? 5173),
    strictPort: true,
    proxy: {
      "/api": toApi,
      "/signin-oidc": toApi,
      "/signout-callback-oidc": toApi,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
