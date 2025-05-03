// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}', // Optional if you add components later
        './src/app/**/*.{js,ts,jsx,tsx,mdx}', // <--- Ensure this includes src/app
    ],
    theme: {
        extend: {
            // Add custom theme extensions if needed
        },
    },
    plugins: [],
}
export default config