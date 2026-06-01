import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    electron([
      {
        entry: "electron/main.ts", // ← .ts now
      },
      {
        entry: "electron/preload.ts", // ← include preload too
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
});
