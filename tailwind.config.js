/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { inter: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        ink: "#111827", // Título
        inputGray: "#D9D9D9", // Inputs
        brand: {
          600: "#047857", // Inicio gradiente
          500: "#10B981", // Fin gradiente
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(17,24,39,0.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
