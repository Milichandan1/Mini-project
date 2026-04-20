/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#101415",
        fog: "#f4f7f6",
        mint: "#45c4a0",
        coral: "#ff6b5f",
        amber: "#f3b743",
        violet: "#8f7cf6"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(69, 196, 160, 0.16)"
      }
    }
  },
  plugins: []
};
