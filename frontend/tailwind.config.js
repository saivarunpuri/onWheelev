/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#001616",
          surface: "#012323",
          card: "#013333",
          hover: "#014646",
          green: "#00F5D4",
          "green-dark": "#00D2B4",
          accent: "#016A6A",
          text: "#E0F2F1",
          muted: "#80CBC4",
          gray: {
            400: "#80A2A2",
            500: "#4D7D7D",
            600: "#3D6363",
            700: "#2D4C4C",
            800: "#025757",
            900: "#013F3F"
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        display: ['"Space Grotesk"', 'Outfit', 'sans-serif'],
        cyber: ['"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        'cyber-glow': '0 0 15px rgba(0, 245, 212, 0.25)',
        'cyber-glow-strong': '0 0 25px rgba(0, 245, 212, 0.45)',
        'cyber-accent-glow': '0 0 15px rgba(1, 106, 106, 0.25)',
      }
    },
  },
  plugins: [],
}
