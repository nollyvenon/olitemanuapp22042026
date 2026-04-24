import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        destructive: 'var(--destructive)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        brand: {
          orange: '#FF9900',
          green: '#067d62',
          blue: '#146eb4',
          red: '#cc0c39',
          darkOrange: '#c45500',
          darkBlue: '#232f3e',
          almostBlack: '#0f1111',
          lightGray: '#d5d9d9',
          mediumGray: '#555555',
          darkGray: '#767676',
        },
      },
    },
  },
  plugins: [],
};

export default config;
