/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#050a0e",
          900: "#0a1628",
          800: "#0f2040",
          700: "#162d58",
        },
        signal: {
          green: "#00e676",
          red: "#ff1744",
          amber: "#ffab00",
          blue: "#2979ff",
        },
        agent: {
          maker: "#7c3aed",
          taker: "#ea580c",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Inter'", "sans-serif"],
      },
      animation: {
        "pulse-green": "pulse-green 1.5s ease-in-out infinite",
        "slide-in": "slide-in 0.2s ease-out",
        "odds-flash": "odds-flash 0.4s ease-out",
      },
      keyframes: {
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,230,118,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(0,230,118,0.15)" },
        },
        "slide-in": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "odds-flash": {
          "0%": { backgroundColor: "rgba(41,121,255,0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};
