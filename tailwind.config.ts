import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sentix: {
          50: "#f0f4ff",
          100: "#dbe4fe",
          200: "#bfd0fe",
          300: "#93b2fd",
          400: "#608bfb",
          500: "#3b66f6",
          600: "#2547eb",
          700: "#1d35d8",
          800: "#1e2cb0",
          900: "#1e2a8a",
          950: "#171c54",
        },
        dark: {
          bg: "#0b0f19",
          card: "#111827",
          border: "#1f293d",
          hover: "#1e293b",
          muted: "#94a3b8"
        }
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      }
    },
  },
  plugins: [],
};
export default config;
