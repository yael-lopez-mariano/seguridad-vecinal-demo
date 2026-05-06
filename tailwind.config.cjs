/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { inter: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        ink: "#111827",
        inputGray: "#D9D9D9",
        brand: {
          600: "#047857",
          500: "#10B981",
        },
      },
      boxShadow: { card: "0 10px 30px rgba(17,24,39,0.08)" },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};
