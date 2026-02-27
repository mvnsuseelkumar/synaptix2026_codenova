/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366F1',
                    50: '#ECEFFE',
                    100: '#D9DFFD',
                    200: '#B3BFFA',
                    300: '#8D9FF8',
                    400: '#6780F5',
                    500: '#6366F1',
                    600: '#4338CA',
                    700: '#3730A3',
                    800: '#312E81',
                    900: '#1E1B4B',
                },
                secondary: {
                    DEFAULT: '#8B5CF6',
                    500: '#8B5CF6',
                    600: '#7C3AED',
                },
                surface: {
                    DEFAULT: '#1E293B',
                    2: '#334155',
                },
                background: '#0F172A',
                muted: '#94A3B8',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                glow: '0 0 20px rgba(99, 102, 241, 0.15)',
                'glow-lg': '0 0 30px rgba(99, 102, 241, 0.25)',
            },
        },
    },
    plugins: [],
}
