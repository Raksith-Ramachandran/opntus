import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        brand: {
          blue: "#6B8FD4",
          purple: "#A78FD4",
          green: "#8FD4A7",
          surface: "#F8F7FF",
          dark: "#12111A",
        },
      },
      animation: {
        breathe: "breathe 6s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.18" },
          "50%": { transform: "scale(1.08)", opacity: "0.26" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
