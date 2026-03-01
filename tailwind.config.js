/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#ffaa00",
                "background-dark": "#1a1a1a",
                "surface-dark": "#242424",
                "surface-border": "#333333",
                "text-primary": "#e5e5e5",
                "text-secondary": "#a3a3a3",
                "accent-orange": "#ffaa00",
                "chart-green": "#86efac",
                "chart-red": "#fca5a5",
                "chart-teal": "#5eead4",
                "chart-purple": "#d8b4fe",
                "chart-blue": "#93c5fd",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
            },
        },
    },
    plugins: [],
}
