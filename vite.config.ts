import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Absolute base for GitHub Pages project site (avoids blank page without trailing slash).
export default defineConfig({
  plugins: [react()],
  base: "/uc1-scratch/",
});
