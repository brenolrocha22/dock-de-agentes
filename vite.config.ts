import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
    strictPort: true,
    // O Tauri recompila em src-tauri; vigiar essa pasta trava em arquivos em uso.
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
