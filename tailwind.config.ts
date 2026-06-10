import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          darker: "rgb(var(--color-primary-darker) / <alpha-value>)",
          soft: "rgb(var(--color-primary-soft) / <alpha-value>)",
          muted: "rgb(var(--color-primary-muted) / <alpha-value>)",
        },
        cream: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          soft: "rgb(var(--color-surface-soft) / <alpha-value>)",
        },
        honey: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          dark: "rgb(var(--color-accent-dark) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          soft: "rgb(var(--color-ink-soft) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        sale: {
          bg: "rgb(var(--color-sale-bg) / <alpha-value>)",
          card: "rgb(var(--color-sale-card) / <alpha-value>)",
        }
      },
      boxShadow: {
        soft: "0 24px 70px rgba(19, 72, 111, 0.08)",
        lift: "0 28px 80px rgba(19, 72, 111, 0.14)",
        glass: "0 8px 32px 0 rgba(10, 38, 59, 0.07)",
        "glass-sm": "0 4px 16px 0 rgba(10, 38, 59, 0.05)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "sans-serif"]
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        ping: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        ping: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        bounce: 'bounce 1s ease-in-out infinite',
      },
      backgroundSize: {
        '200': '200% 200%',
      },
    }
  },
  plugins: []
};

export default config;
