import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base works for GitHub Pages project sites and local `dist/` preview.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
