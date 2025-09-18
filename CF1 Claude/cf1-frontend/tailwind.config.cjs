/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      // Professional Typography Scale with conservative fluid sizing
      fontSize: {
        // Base text sizes with reduced scaling for professional appearance
        'responsive-xs': ['clamp(0.75rem, 0.25vw + 0.7rem, 0.8rem)', { lineHeight: '1.4' }],
        'responsive-sm': ['clamp(0.875rem, 0.3vw + 0.8rem, 0.95rem)', { lineHeight: '1.5' }],
        'responsive-base': ['clamp(1rem, 0.4vw + 0.9rem, 1.05rem)', { lineHeight: '1.5' }],
        'responsive-lg': ['clamp(1.125rem, 0.5vw + 1rem, 1.2rem)', { lineHeight: '1.4' }],
        'responsive-xl': ['clamp(1.25rem, 0.75vw + 1.1rem, 1.4rem)', { lineHeight: '1.3' }],
        'responsive-2xl': ['clamp(1.5rem, 1vw + 1.3rem, 1.75rem)', { lineHeight: '1.2' }],
        'responsive-3xl': ['clamp(1.875rem, 1.25vw + 1.6rem, 2.1rem)', { lineHeight: '1.1' }],
        'responsive-4xl': ['clamp(2rem, 1.5vw + 1.8rem, 2.4rem)', { lineHeight: '1.1' }],
        'responsive-5xl': ['clamp(2.25rem, 2vw + 2rem, 2.75rem)', { lineHeight: '1' }],
        'responsive-6xl': ['clamp(2.5rem, 2.5vw + 2.2rem, 3.2rem)', { lineHeight: '1' }],
      },

      // Professional Spacing Scale with conservative sizing
      spacing: {
        'responsive-1': 'clamp(0.25rem, 0.25vw + 0.2rem, 0.3rem)',
        'responsive-2': 'clamp(0.5rem, 0.5vw + 0.4rem, 0.6rem)',
        'responsive-3': 'clamp(0.75rem, 0.75vw + 0.6rem, 0.9rem)',
        'responsive-4': 'clamp(1rem, 1vw + 0.8rem, 1.2rem)',
        'responsive-5': 'clamp(1.25rem, 1.25vw + 1rem, 1.5rem)',
        'responsive-6': 'clamp(1.5rem, 1.5vw + 1.2rem, 1.8rem)',
        'responsive-8': 'clamp(2rem, 2vw + 1.6rem, 2.4rem)',
        'responsive-10': 'clamp(2.5rem, 2.5vw + 2rem, 3rem)',
        'responsive-12': 'clamp(3rem, 3vw + 2.4rem, 3.6rem)',
        'responsive-16': 'clamp(4rem, 4vw + 3.2rem, 4.8rem)',
      },

      // Professional Icon Sizes
      width: {
        'icon-xs': 'clamp(0.75rem, 0.5vw + 0.7rem, 0.9rem)',
        'icon-sm': 'clamp(1rem, 0.75vw + 0.9rem, 1.15rem)',
        'icon-md': 'clamp(1.125rem, 1vw + 1rem, 1.3rem)',
        'icon-lg': 'clamp(1.25rem, 1.25vw + 1.1rem, 1.5rem)',
        'icon-xl': 'clamp(1.5rem, 1.5vw + 1.3rem, 1.8rem)',
      },

      height: {
        'icon-xs': 'clamp(0.75rem, 0.5vw + 0.7rem, 0.9rem)',
        'icon-sm': 'clamp(1rem, 0.75vw + 0.9rem, 1.15rem)',
        'icon-md': 'clamp(1.125rem, 1vw + 1rem, 1.3rem)',
        'icon-lg': 'clamp(1.25rem, 1.25vw + 1.1rem, 1.5rem)',
        'icon-xl': 'clamp(1.5rem, 1.5vw + 1.3rem, 1.8rem)',
      },

      // Responsive Border Radius
      borderRadius: {
        'responsive-sm': 'clamp(0.25rem, 0.5vw + 0.125rem, 0.375rem)',
        'responsive-md': 'clamp(0.375rem, 0.75vw + 0.25rem, 0.5rem)',
        'responsive-lg': 'clamp(0.5rem, 1vw + 0.375rem, 0.75rem)',
        'responsive-xl': 'clamp(0.75rem, 1.5vw + 0.5rem, 1rem)',
      },

      // Container max-widths for consistent content areas
      maxWidth: {
        'content-sm': '640px',
        'content-md': '768px',
        'content-lg': '1024px',
        'content-xl': '1280px',
        'content-2xl': '1536px',
      },

      // Consistent aspect ratios
      aspectRatio: {
        'card': '4/3',
        'hero': '16/9',
        'square': '1/1',
      },

      // CF1-Specific Design System Colors
      colors: {
        'cf1': {
          'primary': {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6', // Primary blue
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          'accent': {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899', // Accent pink/red
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
          'neutral': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b', // Neutral gray
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          },
        },
      },

      // CF1 Component-Specific Classes
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Enterprise Shadow System
      boxShadow: {
        'cf1-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'cf1-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'cf1-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'cf1-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'cf1-button': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'cf1-button-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [
    // CF1 Design System Plugin
    function({ addUtilities, addComponents, theme }) {
      // CF1 Button Components
      addComponents({
        '.cf1-btn-primary': {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          },
          '&:active': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
          },
        },
        '.cf1-btn-secondary': {
          '@apply bg-cf1-neutral-100 hover:bg-cf1-neutral-200 active:bg-cf1-neutral-300': {},
          '@apply dark:bg-cf1-neutral-800 dark:hover:bg-cf1-neutral-700 dark:active:bg-cf1-neutral-600': {},
          '@apply border border-cf1-neutral-300 dark:border-cf1-neutral-600': {},
        },
        '.cf1-gradient-accent': {
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
          },
          '&:active': {
            background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
          },
        },
      });

      // CF1 Card Components
      addComponents({
        '.cf1-card': {
          '@apply bg-white dark:bg-cf1-neutral-900 rounded-responsive-lg': {},
          '@apply border border-cf1-neutral-200 dark:border-cf1-neutral-800': {},
          '@apply shadow-cf1-sm hover:shadow-cf1-md transition-shadow duration-300': {},
        },
        '.cf1-card-interactive': {
          '@apply cf1-card cursor-pointer': {},
          '@apply hover:border-cf1-primary-300 dark:hover:border-cf1-primary-700': {},
          '@apply hover:shadow-cf1-lg transition-all duration-300': {},
        },
      });

      // CF1 Form Components
      addComponents({
        '.cf1-input': {
          '@apply block w-full rounded-responsive-lg border border-cf1-neutral-300': {},
          '@apply dark:border-cf1-neutral-600 bg-white dark:bg-cf1-neutral-900': {},
          '@apply text-cf1-neutral-900 dark:text-cf1-neutral-100': {},
          '@apply placeholder-cf1-neutral-500 dark:placeholder-cf1-neutral-400': {},
          '@apply focus:ring-2 focus:ring-cf1-primary-500 focus:border-cf1-primary-500': {},
          '@apply px-responsive-3 py-responsive-2 text-responsive-sm': {},
          '@apply min-h-[44px] transition-colors duration-200': {},
        },
      });

      // CF1 Utility Classes
      addUtilities({
        '.cf1-focus': {
          '@apply focus:outline-none focus:ring-2 focus:ring-cf1-primary-500 focus:ring-offset-2': {},
          '@apply dark:focus:ring-offset-cf1-neutral-900': {},
        },
        '.cf1-text-gradient': {
          background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      });
    },
  ],
}
