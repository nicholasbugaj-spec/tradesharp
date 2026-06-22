import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#12121a",
        "surface-2": "#1a1a27",
        border: "#2a2a3d",
        "border-light": "#3a3a55",
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          light: "#818cf8",
        },
        accent: {
          DEFAULT: "#a855f7",
          hover: "#9333ea",
        },
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
        muted: "#6b7280",
        "text-primary": "#f1f5f9",
        "text-secondary": "#94a3b8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.3), transparent)",
        "card-gradient":
          "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(168,85,247,0.05) 100%)",
      },
      animation: {
        "fade-in":       "fadeIn 0.5s ease-out both",
        "fade-in-slow":  "fadeIn 1s ease-out both",
        "slide-up":      "slideUp 0.4s ease-out both",
        "slide-up-slow": "slideUp 0.7s ease-out both",
        "slide-down":    "slideDown 0.35s ease-out both",
        "slide-left":    "slideLeft 0.4s ease-out both",
        "slide-right":   "slideRight 0.4s ease-out both",
        "scale-in":      "scaleIn 0.3s ease-out both",
        "bounce-in":     "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "pulse-slow":    "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "pulse-glow":    "pulseGlow 2s ease-in-out infinite",
        "float":         "float 3s ease-in-out infinite",
        "float-slow":    "float 5s ease-in-out infinite",
        "spin-slow":     "spin 8s linear infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "glow":          "glow 2s ease-in-out infinite alternate",
        "bar-grow":      "barGrow 1s ease-out both",
        "count-up":      "fadeIn 0.8s ease-out both",
        "flicker":       "flicker 3s linear infinite",
        "gradient-x":    "gradientX 4s ease infinite",
        "typewriter":    "typewriter 2s steps(30) both",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%":   { opacity: "0", transform: "scale(0.7)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px 0px rgba(99,102,241,0.4)" },
          "50%":       { boxShadow: "0 0 24px 4px rgba(99,102,241,0.7)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%":   { textShadow: "0 0 4px rgba(99,102,241,0.3)" },
          "100%": { textShadow: "0 0 16px rgba(168,85,247,0.8), 0 0 32px rgba(99,102,241,0.4)" },
        },
        barGrow: {
          "0%":   { width: "0%" },
          "100%": { width: "var(--bar-width, 100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%":       { opacity: "1" },
          "93%":       { opacity: "0.4" },
          "94%":       { opacity: "1" },
          "96%":       { opacity: "0.6" },
          "97%":       { opacity: "1" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        typewriter: {
          "0%":   { width: "0" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
