import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  sourcemap: true,
  base: process.env.NODE_ENV === "production" ? "/React_hw_project/" : "/",
  plugins: [react()],
});
