// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Make sure this includes your .tsx files
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
