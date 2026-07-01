/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./assets/**/*.{js,jsx,ts,tsx}",
    "./templates/**/*.html.twig",
  ],
  theme: {
    extend: {
      screens: {
        'qhd': '1864px',
        '2qhd': '2500px'
      },
      spacing: {
        '6.5': '1.625rem',
        '8.5': '2.25rem'
      },
      colors: {
        color0: '#DAA520',
        gold: '#DAA520',
        'gold-muted': '#C9971A',
        stone: {
          50:  '#faf9f7',
          100: '#f4f2ee',
          200: '#e8e4dc',
          300: '#d6d0c4',
          400: '#b8b0a0',
          500: '#9a9080',
          600: '#7a7268',
          700: '#5e574f',
          800: '#3e3a34',
          900: '#141414',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require("tailwindcss-animate")
  ],
}

