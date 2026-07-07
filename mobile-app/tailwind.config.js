/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        card: "#f8f8f8",
        muted: "#71717a",
        accent: {
          DEFAULT: "#10b981",
          soft: "#d1fae5",
        },
        primary: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["System", "SF Pro Display", "Roboto"],
        mono: ["SF Mono", "Roboto Mono"],
      },
    },
  },
  plugins: [],
};
