/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                medical: {
                    50: '#F0F7FF',
                    100: '#E0EFFF',
                    200: '#B8DBFE',
                    300: '#7CC0FC',
                    400: '#3A9EF8',
                    500: '#1A7FE0',
                    600: '#0B63BF',   // Primary action
                    700: '#094F99',   // Primary deep
                    800: '#073E78',
                    900: '#0A2E5C',
                },
                surface: {
                    DEFAULT: '#F8FAFC',   // Page background
                    card: '#FFFFFF',       // Card background
                    raised: '#FFFFFF',     // Elevated surfaces
                    input: '#F1F5F9',      // Input fields
                    hover: '#F1F5F9',      // Hover state
                },
                // clinical colors kept for compatibility
                clinical: {
                    red: '#B91C1C',
                    'red-light': '#FEF2F2',
                    'red-muted': '#DC2626',
                    amber: '#B45309',
                    'amber-light': '#FFFBEB',
                },
            },

            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },

            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },

            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                'xl': '0.75rem',    // 12px
                '2xl': '1rem',      // 16px
                '3xl': '1.25rem',   // 20px
            },

            boxShadow: {
                'soft': '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.02)',
                'card': '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
                'hover': '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
                'glass': '0 2px 16px rgba(15,23,42,0.06)',
                'nav': '0 1px 3px rgba(15,23,42,0.05)',
                'elevated': '0 8px 24px rgba(15,23,42,0.08)',
            },

            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'subtle-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },

            animation: {
                'fade-in': 'fade-in 0.4s ease-out',
                'subtle-shift': 'subtle-shift 15s ease infinite',
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
