/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf5ff",  // Very light purple
          100: "#f3e8ff", // Light purple
          200: "#e9d5ff", // Medium light purple
          300: "#d8b4fe", // Light purple
          400: "#c084fc", // Medium purple
          500: "#a855f7", // Primary purple
          600: "#9333ea", // Medium dark purple
          700: "#7e22ce", // Dark purple
          800: "#6b21a8", // Darker purple
          900: "#581c87", // Very dark purple
        },
        teal: {
          50: "#e6fffb",
          100: "#b5f5ec",
          200: "#87e8de",
          300: "#5cdbd3",
          400: "#36cfc9",
          500: "#13c2c2",
          600: "#08979c",
          700: "#006d75",
          800: "#00474f",
          900: "#002329",
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-in",
        "counter-up": "counterUp 1s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 5px rgba(168, 85, 247, 0.5)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 20px rgba(168, 85, 247, 0.8)",
          },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        counterUp: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
