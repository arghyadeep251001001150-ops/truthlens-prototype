/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Trustworthy primary teal & blue palette
        primary: {
          DEFAULT: "#0284c7", // Trustworthy Ocean Blue / Refined Blue
          hover: "#0369a1",
          light: "#e0f2fe",
          dark: "#075985"
        },
        teal: {
          brand: "#0d9488",
          hover: "#0f766e",
          light: "#ccfbf1",
          50: "#f0fdfa",
          100: "#ccfbf1",
          600: "#0d9488",
          700: "#0f766e",
        },
        // Functional Verdict Colors
        verdict: {
          true: {
            bg: "#ecfdf5",
            border: "#a7f3d0",
            text: "#065f46",
            accent: "#059669"
          },
          false: {
            bg: "#fff1f2",
            border: "#fecdd3",
            text: "#9f1239",
            accent: "#e11d48"
          },
          disputed: {
            bg: "#fffbeb",
            border: "#fde68a",
            text: "#92400e",
            accent: "#d97706"
          }
        },
        // Slate neutrals for clean contrast
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        }
      },
      spacing: {
        "container-max": "1120px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        cardHover: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        clean: "0 4px 20px -2px rgba(15, 23, 42, 0.06)",
      }
    },
  },
  plugins: [],
}
