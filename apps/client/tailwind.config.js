/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        oswald: ["Oswald", "sans-serif"],
        exo: ["Exo", "sans-serif"],
        retro: ['"Courier New"', "monospace"],
      },
      backgroundImage: {
        "football-grass":
          "linear-gradient(90deg, #43a047 25%, #388e3c 25%, #388e3c 50%, #43a047 50%, #43a047 75%, #388e3c 75%, #388e3c 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        primary: "#1e6f40",
        secondary: "#17502f",
        accent: "#ffc400",
        bg: "#0a2617",
        "sidebar-bg": "#051a0e",
        "panel-bg": "#0d3320",
        victory: "#4caf50",
        defeat: "#f44336",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        animation: {
          scanline: "scanline 8s linear infinite",
        },
        keyframes: {
          scanline: {
            "0%": { top: "-100%" },
            "100%": { top: "100%" },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".no-spinner": {
          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: "0",
          },
          "&[type=number]": {
            "-moz-appearance": "textfield",
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
