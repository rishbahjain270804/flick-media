import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: "#08090a",
          900: "#0e1013",
          850: "#13161a",
          800: "#191d22",
          700: "#22272e",
          600: "#2d333b",
          500: "#444c56",
          400: "#768390",
          300: "#adbac7",
          200: "#cdd9e5",
          100: "#f0f6fc",
        },
        slateGold: {
          DEFAULT: "#eab308",
          muted: "rgba(234, 179, 8, 0.12)",
          border: "rgba(234, 179, 8, 0.28)",
        },
        filmRed: {
          DEFAULT: "#ef4444",
          muted: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.28)",
        },
        tapeGreen: {
          DEFAULT: "#10b981",
          muted: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.28)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Consolas",
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
