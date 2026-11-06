import type { Config } from "tailwindcss";

// Zoriel Nest design tokens — glassmorphism redesign.
//
// Token NAMES are kept the same as before (brand/accent/ink/success/
// warning/danger) on purpose: every component and page already
// references these by name (bg-brand-800, text-ink-600, border-ink-200,
// etc.), so redefining the underlying hex values here restyles the
// entire site consistently without having to touch every call site.
//
//   - `brand` — the elegant navy-blue primary accent (CTAs, links,
//     primary buttons, active states).
//   - `accent` — soft blue/lavender supporting highlight (secondary
//     links, "coming soon" tags, info callouts) — distinct from brand
//     so the two don't visually compete.
//   - `ink` — cool navy-tinted neutrals for text, borders and the icy
//     page background (ink-50 is the lightest, used as the base
//     background tone across the app).
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EAF1FC",
          100: "#D3E3F8",
          200: "#A7C7F1",
          300: "#7AAAE9",
          400: "#4E8EE2",
          500: "#2E72C9",
          600: "#1F5BA8", // primary navy-blue — buttons, links
          700: "#184A87",
          800: "#123A6B", // deep navy — headings, strong CTAs
          900: "#0C2A4D",
        },
        accent: {
          50: "#F4F1FB",
          100: "#E7DFF6",
          200: "#CFC0ED",
          300: "#B6A1E4",
          400: "#9D83D9",
          500: "#8468C9", // soft lavender-blue highlight
          600: "#6D53AE",
          700: "#56428C",
        },
        ink: {
          50: "#EEF4FC", // icy-blue page background
          100: "#E1EBF9",
          200: "#CAD9EE", // thin translucent borders over glass
          300: "#A8BEDE",
          400: "#7E99C2",
          500: "#5C7AA3",
          600: "#445E82",
          700: "#334864", // secondary text
          800: "#1E2A42", // primary text / headings
          900: "#121B2C", // deepest navy text
        },
        success: "#1F8A6F",
        warning: "#C08A1F",
        danger: "#C23B3B",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.3rem" }],
        base: ["1rem", { lineHeight: "1.55rem" }],
        lg: ["1.125rem", { lineHeight: "1.65rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.6rem" }],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "14px",
        md: "14px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(18, 27, 44, 0.06)",
        card: "0 1px 2px rgba(18,27,44,0.04), 0 8px 28px rgba(30,64,120,0.10)",
        popover: "0 12px 36px rgba(18,27,44,0.16)",
        glass: "0 8px 32px rgba(30, 64, 120, 0.12)",
        "glass-lg": "0 20px 60px rgba(18, 27, 44, 0.18)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        content: "1200px",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.5s ease-out both",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
