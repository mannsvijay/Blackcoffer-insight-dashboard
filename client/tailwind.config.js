/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0F1620",
        surface: "#161F2B",
        surfaceRaised: "#1C2733",
        border: "#232E3B",
        ink: "#E7EAEE",
        muted: "#8B96A5",
        gold: "#E3A857",
        teal: "#3FBFAA",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
