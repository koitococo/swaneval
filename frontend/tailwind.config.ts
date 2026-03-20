/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ['"Inter Variable"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },
    extend: {
      keyframes: {
        "modal-expand": {
          from: { opacity: "0", transform: "scale(0.85)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "float-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "15%, 55%": { transform: "translateX(-5px)" },
          "35%, 75%": { transform: "translateX(5px)" },
        },
        "backdrop-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "modal-expand": "modal-expand 0.2s ease-out",
        "float-up": "float-up 0.25s ease-out forwards",
        "shake": "shake 0.4s ease-in-out",
        "backdrop-in": "backdrop-in 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: [
      {
        swan: {
          "primary": "#6366f1",
          "primary-content": "#ffffff",
          "secondary": "#ebebef",
          "secondary-content": "#17181c",
          "accent": "#8b5cf6",
          "accent-content": "#ffffff",
          "neutral": "#17181c",
          "neutral-content": "#f3f3f5",
          "base-100": "#ffffff",
          "base-200": "#f3f3f5",
          "base-300": "#e4e4e8",
          "base-content": "#17181c",
          "info": "#3b82f6",
          "info-content": "#ffffff",
          "success": "#10b981",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "0.875rem",
          "--rounded-btn": "0.625rem",
          "--rounded-badge": "999px",
          "--tab-radius": "999px",
          "--animation-btn": "0.15s",
          "--animation-input": "0.15s",
          "--btn-focus-scale": "0.97",
        },
      },
    ],
    darkTheme: false,
    logs: false,
  },
}
