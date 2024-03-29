import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,vue}",
		"./preview/**/*.{js,ts,jsx,tsx,vue}"
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", ...fontFamily.sans]
			}
		}
	},
	plugins: []
} satisfies Config
