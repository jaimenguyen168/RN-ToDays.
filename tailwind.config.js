/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./App.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#5B67CA",
          400: "#8F81FE",
          300: "",
          200: "#ECEAFF",
          100: "#F9FAFD",
        },
        success: {
          500: "#22C55E",
          600: "#0BA259",
          400: "#0CAF60",
          300: "#55C790",
        },
        warning: {
          500: "#FACC15",
          600: "#E6BB20",
          400: "#FFD023",
          300: "#FFDE65",
        },
        error: {
          500: "#F75555",
          600: "#E64462",
          400: "#FF4C6D",
          300: "#FF708A",
        },
      },
      fontFamily: {
        // 👇 This makes Hind Siliguri the default for "font-sans"
        sans: ["HindSiliguri_400Regular"],

        // Optional aliases if you want explicit usage
        medium: ["HindSiliguri_500Medium"],
        semibold: ["HindSiliguri_600SemiBold"],
        bold: ["HindSiliguri_700Bold"],
        light: ["HindSiliguri_300Light"],
      },
    },
  },
  plugins: [],
};
