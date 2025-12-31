/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#6366f1', // Indigo-500
                'primary-hover': '#4f46e5', // Indigo-600
                'bg-dark': '#0f172a', // Slate-900
                'text-main': '#f8fafc', // Slate-50
                'text-muted': '#94a3b8', // Slate-400
            },
            fontFamily: {
                pretendard: ['Pretendard', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
