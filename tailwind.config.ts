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
          DEFAULT: "#10854F",
          dark: "#0A5C35",
          darker: "#05331D",
        },
        cream: "#F8F4EC",
        honey: "#F2C94C",
        ink: "#221A12",
        sale: {
          bg: "#082F19",
          card: "#0C3D22",
        }
      },
      boxShadow: {
        soft: "0 24px 70px rgba(31, 77, 58, 0.08)",
        lift: "0 28px 80px rgba(31, 77, 58, 0.12)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.05)",
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
