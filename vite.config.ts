import { defineConfig, loadEnv, mergeConfig } from "vite";
import type { PluginOption } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

export default defineConfig(async ({ command, mode }) => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      ...(isCapacitorBuild
        ? {
            pages: [{ path: "/", prerender: { enabled: true } }],
            prerender: {
              enabled: true,
              crawlLinks: true,
            },
          }
        : {}),
    }),
  ];

  // Capacitor builds are static SPA output — skip Nitro.
  if (command === "build" && !isCapacitorBuild) {
    const { nitro } = await import("nitro/vite");
    plugins.push(
      nitro({
        defaultPreset: "cloudflare-module",
      }),
    );
  }

  plugins.push(viteReact());

  const envDefine: Record<string, string> = {};
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return mergeConfig(
    {
      define: envDefine,
      resolve: {
        dedupe: [
          "react",
          "react-dom",
          "@tanstack/react-query",
          "@tanstack/react-router",
          "@tanstack/react-start",
        ],
      },
      server: {
        host: true,
        port: 8080,
      },
      plugins,
    },
    isCapacitorBuild
      ? {
          // Relative asset URLs work reliably inside the Android WebView.
          base: "./",
        }
      : {},
  );
});
