/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "../../packages/shared/src/**/*.{js,ts,jsx,tsx}" // Include shared if we put UI there
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                background: '#0f172a', // Slate 900
                surface: '#1e293b',    // Slate 800
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#ec4899', // Pink 500
                    foreground: '#ffffff',
                },
                accent: {
                    cyan: '#06b6d4',
                    violet: '#8b5cf6',
                    emerald: '#10b981',
                },
                glass: {
                    DEFAULT: 'rgba(30, 41, 59, 0.7)',
                    border: 'rgba(255, 255, 255, 0.1)',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
