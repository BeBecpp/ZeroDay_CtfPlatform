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
        arena: {
          bg: "#030705",
          bg2: "#050807",
          panel: "#07110d",
          panel2: "#081a12",
          neon: "#39ff8a",
          cyan: "#3de8ff",
          amber: "#ffb347",
          danger: "#ff4466",
          muted: "#6a8a72",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Space Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        neon: "0 0 20px rgba(57, 255, 138, 0.3)",
        cyan: "0 0 20px rgba(61, 232, 255, 0.3)",
        "neon-lg": "0 0 40px rgba(57, 255, 138, 0.4)",
      },
      animation: {
        glitch: "glitch 2s infinite",
        "cursor-blink": "blink 1s step-end infinite",
        shake: "shake 0.5s ease-in-out",
        "breach-pulse": "breachPulse 1.5s ease-in-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "75%": { transform: "translateX(8px)" },
        },
        breachPulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(57, 255, 138, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(57, 255, 138, 0.8)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
