/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',
                background: 'var(--bg-background)',
                'text-main': 'var(--text-main)',
                'text-muted': 'var(--text-muted)',
            },
            fontFamily: {
                pretendard: ['Pretendard', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
