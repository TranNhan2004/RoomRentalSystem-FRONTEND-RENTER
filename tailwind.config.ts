import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "mygreen": "#13C394",
        "mydarkgreen": "#11AB82",
        "mylightgreen": "#CFF9E0",
        "mygreen2": "#57ECA6",
      },
      animation: {
        bounce1: 'bounce 1.2s infinite ease-in-out 0s',
        bounce2: 'bounce 1.2s infinite ease-in-out 0.2s',
        bounce3: 'bounce 1.2s infinite ease-in-out 0.4s',
        spin: 'spin 2s linear infinite'
      },
      keyframes: {
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
    },
  },
  plugins: [],
} satisfies Config;