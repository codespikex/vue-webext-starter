import { defineConfig } from "vite"
import { resolve as r } from "node:path"

import vue from "@vitejs/plugin-vue"
import { defineManifest } from "./scripts/manifest"

import pkg from "./package.json"

const __dirname = process.cwd()

const manifest = defineManifest(
	({ getChunk, createChunkEntry, createChunk }) => ({
		manifest_version: 3,
		minimum_chrome_version: "96",
		name: pkg.displayName,
		version: pkg.version,
		description: pkg.description,
		action: {
			default_icon: "./images/icon-512.png",
			default_popup: createChunk({
				fileName: "assets/popup.html",
				name: "popup-html",
				code: popupHTML(
					getChunk("global.css").fileName,
					getChunk("popup").fileName
				)
			}).fileName
		},
		icons: {
			16: "./images/icon-512.png",
			48: "./images/icon-512.png",
			128: "./images/icon-512.png"
		},
		background: {
			service_worker: getChunk("service-worker").fileName,
			type: "module"
		},
		permissions: ["tabs", "storage", "activeTab"],
		host_permissions: ["*://*/*"],
		content_scripts: [
			{
				matches: ["<all_urls>"],
				js: [
					createChunkEntry("content-script", {
						name: "content",
						fileName: "content.js"
					}).fileName
				]
			}
		],
		web_accessible_resources: [
			{
				matches: ["*://*/*"],
				resources: [
					getChunk("content-script", { isEntry: true }).fileName,
					"assets/chunks/*.js",
					getChunk("global.css").fileName,
					"images/*",
					"assets/*.png",
					"assets/*.ttf"
				]
			}
		]
	})
)

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": r(__dirname, "src"),
			"assets": r(__dirname, "assets")
		}
	},
	plugins: [vue(), manifest],
	build: {
		outDir: "build",
		rollupOptions: {
			input: [
				"src/popup.ts",
				"src/content-script.ts",
				"src/service-worker.ts",
				"assets/css/global.css"
			],
			output: {
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/chunks/[hash].js",
				assetFileNames: "assets/[name][extname]"
			}
		}
	}
})

function popupHTML(css: string, js: string) {
	return `<html>
<head>
	<link rel="stylesheet" href="/${css}">
</head>
<body>
	<div id="app"></div>
	<script src="/${js}" type="module"></script>
</body>
</html>`
}
