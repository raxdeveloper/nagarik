import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-0": "#fafafa",
        "bg-1": "#ffffff",
        "bg-2": "#f0f0f5",
        "nepal-red": "#DC143C",
        "nepal-blue": "#003893",
        "nepali-crimson": "#c01030",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#DC143C",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#003893",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f0f0f5",
          foreground: "#555555",
        },
        accent: {
          DEFAULT: "#f4f4f5",
          foreground: "#111111",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111111",
        },
        destructive: {
          DEFAULT: "#DC143C",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111111",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "glow-nepal-red":
          "radial-gradient(ellipse at center, rgba(220,20,60,0.15) 0%, transparent 70%)",
        "glow-nepal-blue":
          "radial-gradient(ellipse at center, rgba(0,56,147,0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.4s ease-out",
        "count-up": "countUp 1.5s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
