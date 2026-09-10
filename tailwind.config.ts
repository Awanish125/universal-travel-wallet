import type { Config } from "tailwindcss";

const config: Config = {
  // The theme is night-first: `.light` on <html> switches to day mode, so the
  // dark variant means "html does NOT carry .light".
  darkMode: ["selector", "html:not(.light)"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          strong: "var(--surface-strong)",
          subtle: "var(--surface-subtle)",
          solid: "var(--surface-solid)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
        },
        // Alias of `accent`, kept because screens refer to the accent as the
        // brand accent. Both names resolve to the same token.
        brand: {
          accent: "var(--accent-primary)",
          strong: "var(--accent-strong)",
        },
        semantic: {
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
          info: "var(--info)",
        },
        // Shorthand text roles used across app screens.
        foreground: "var(--text-primary)",
        muted: {
          DEFAULT: "var(--surface-subtle)",
          foreground: "var(--text-muted)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#ffffff",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
      },
      boxShadow: {
        // Soft Tactile primitives (ADR 005 / design-system §5) exposed as
        // Tailwind utilities so screens can use them without bespoke CSS.
        "soft-outer":
          "-8px -8px 16px var(--shadow-highlight), 10px 10px 22px var(--shadow-shadow)",
        "soft-outer-sm":
          "-4px -4px 10px var(--shadow-highlight), 6px 6px 14px var(--shadow-shadow)",
        "soft-inner":
          "inset 4px 4px 10px var(--shadow-shadow), inset -4px -4px 10px var(--shadow-highlight)",
        "soft-accent": "0 10px 24px -8px var(--accent-shadow)",
      },
      backgroundImage: {
        "gradient-clay-primary": "linear-gradient(135deg, #9B8CFF 0%, #7C6FEF 55%, #5B4FE0 100%)",
        "gradient-clay-lavender": "linear-gradient(135deg, #C9B8FF 0%, #9B8CFF 100%)",
        "gradient-clay-mint": "linear-gradient(135deg, #8FE3C0 0%, #5FC9A8 100%)",
        "gradient-clay-pink": "linear-gradient(135deg, #F5A8D0 0%, #E884BC 100%)",
        "gradient-clay-peach": "linear-gradient(135deg, #F7C08A 0%, #F0A868 100%)",
        "gradient-clay-sky": "linear-gradient(135deg, #A8C6F5 0%, #7FA8E8 100%)",
        "gradient-clay-coral": "linear-gradient(135deg, #F2A0A3 0%, #E8797D 100%)",
        "gradient-clay-amber": "linear-gradient(135deg, #F7CE8A 0%, #F0B658 100%)",
        "gradient-clay-teal": "linear-gradient(135deg, #8AD4D0 0%, #5FB8B3 100%)",
      },
      borderRadius: {
        xs: "10px",
        sm: "14px",
        md: "18px",
        lg: "24px",
        xl: "28px",
        sheet: "32px",
        pill: "9999px",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans, ui-sans-serif)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
