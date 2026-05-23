/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0B0C10",
          surface: "#121212",
          card: "#1E1E1E",
          hover: "#2A2A2A",
          green: "#00E576",
          "green-dark": "#00C853",
          accent: "#1DE9B6",
          text: "#FFFFFF",
          muted: "#987654", // neutral medium
          gray: {
            400: "#A0AEC0",
            500: "#718096",
            600: "#4A5568",
            700: "#2D3748",
            800: "#1A202C",
            900: "#171923"
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'cyber-glow': '0 0 15px rgba(0, 229, 118, 0.25)',
        'cyber-glow-strong': '0 0 25px rgba(0, 229, 118, 0.45)',
        'cyber-accent-glow': '0 0 15px rgba(29, 233, 182, 0.25)',
      }
    },
  },
  plugins: [],
}
