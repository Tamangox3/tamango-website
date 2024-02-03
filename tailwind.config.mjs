/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  plugins: [require("@tailwindcss/typography")],
  theme: {
    fontFamily: {
      sans: ["Arial", "sans-serif"],
    },
    colors: {
      white: "#fff",
      black: "#2E2E2E",
    },
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.black"),
            a: {
              fontWeight: "inherit",
              color: theme("colors.white"),
              "&:hover": {
                color: theme("colors.white"),
              },
            },
          },
        },
      }),
    },
  },
};
