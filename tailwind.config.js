/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Songti SC"', '"SimSun"', "serif"],
        body: ['"Microsoft YaHei"', '"PingFang SC"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
