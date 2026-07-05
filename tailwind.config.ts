import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12151A",
          soft: "#1B1F26",
        },
        paper: {
          DEFAULT: "#ECE7DE",
          dim: "#D9D3C6",
          soft: "#F5F2EB",
        },
        stamp: "#D1382A",
        brass: "#C9A227",
        swap: "#3F6B4A",
      },
      fontFamily: {
        display: ["var(--font-archivo-black)", "sans-serif"],
        body: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
