/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "stats.html",
      emitFile: true,
      template: "treemap",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // UI component libraries
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
          ],

          // Data fetching and forms
          "data-vendor": [
            "@tanstack/react-query",
            "@tanstack/react-table",
            "react-hook-form",
            "@hookform/resolvers",
            "axios",
            "axios-auth-refresh",
          ],

          // Utilities and styling
          "utils-vendor": [
            "clsx",
            "class-variance-authority",
            "tailwind-merge",
            "zod",
            "date-fns",
            "lucide-react",
          ],

          // DnD and interactions
          "interaction-vendor": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/modifiers",
            "embla-carousel-react",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: "jsdom",
    include: ["**/*.test.tsx"],
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
