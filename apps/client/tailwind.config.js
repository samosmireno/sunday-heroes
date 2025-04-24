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
        league: {
          50: "#FFFAEB",
          100: "#FFF5D6",
          200: "#FFEAAD",
          300: "#FFDF85",
          400: "#FFD45C",
          500: "#FFD700", // Your base gold color
          600: "#E6C200",
          700: "#BFA000",
          800: "#997F00",
          900: "#735F00",
        },
        // Forest green variant (based on #1E8449)
        knockout: {
          50: "#EBFAF0",
          100: "#D0F3DB",
          200: "#A1E7B7",
          300: "#71D894",
          400: "#42C870",
          500: "#2EAB57",
          600: "#1E8449", // Your base forest green color
          700: "#186A3B",
          800: "#12502C",
          900: "#0C361E",
        },
        // Medium blue variant (based on #2980B9)
        duel: {
          50: "#EBF5FB",
          100: "#D6EAF8",
          200: "#AED6F1",
          300: "#85C1E9",
          400: "#5DADE2",
          500: "#3498DB",
          600: "#2980B9", // Your base blue color
          700: "#21618C",
          800: "#1A4F72",
          900: "#133955",
        },
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
