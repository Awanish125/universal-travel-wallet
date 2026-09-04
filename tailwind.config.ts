import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background, #050506)",
          secondary: "var(--background-secondary, #0B0B0D)",
        },
        surface: {
          DEFAULT: "var(--surface, rgba(255, 255, 255, 0.055))",
          strong: "var(--surface-strong, rgba(255, 255, 255, 0.085))",
          subtle: "var(--surface-subtle, rgba(255, 255, 255, 0.035))",
          solid: "var(--surface-solid, #151518)",
        },
        border: {
          DEFAULT: "var(--border, rgba(255, 255, 255, 0.12))",
          strong: "var(--border-strong, rgba(255, 255, 255, 0.18))",
        },
        accent: {
          DEFAULT: "var(--accent-primary, #4DA3FF)",
          strong: "var(--accent-strong, #68B4FF)",
          soft: "var(--accent-soft, rgba(77, 163, 255, 0.16))",
        },
        semantic: {
          success: "#35D07F",
          warning: "#FFB84D",
          danger: "#FF5F67",
          info: "#64B5FF",
        },
        text: {
          primary: "#F5F5F7",
          secondary: "#B8B8BE",
          muted: "#7E7E86",
          disabled: "#55555C",
        },
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        sheet: "28px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
