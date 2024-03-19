/// <reference types="chrome" />
import type { Plugin, ResolvedConfig } from "vite"

type OutputAsset = {
	fileName: string
	needsCodeReference: boolean
	name: string | undefined
	source: string | Uint8Array
	type: "asset"
}

type OutputChunk = {
	code: string
	map: null
	sourcemapFileName: string | null
	preliminaryFileName: string
	dynamicImports: string[]
	fileName: string
	implicitlyLoadedBefore: string[]
	importedBindings: {
		[imported: string]: string[]
	}
	imports: string[]
	modules: {
		[id: string]: any
	}
	referencedFiles: string[]
	exports: string[]
	facadeModuleId: string | null
	isDynamicEntry: boolean
	isEntry?: boolean
	isImplicitEntry?: boolean
	moduleIds: string[]
	name: string
	type: "chunk"
}

type OutputBundle = Record<string, any>
type GetChunkOption = {
	name?: string
	isEntry?: boolean
	fileName?: string
}

type Helpers = {
	getChunk: (id: string, opt?: GetChunkOption) => OutputChunk
	createChunkEntry: (id: string, opt?: GetChunkOption) => OutputChunk
	createChunk: (chunk: ChunkOpts) => OutputChunk
	isDev: () => boolean
	filter: {
		isString: (value: any) => value is string
	}
}

function createAsset(
	bundle: Record<string, any>,
	asset: Pick<OutputAsset, "name" | "fileName" | "source">
) {
	bundle[asset.fileName] = {
		needsCodeReference: false,
		type: "asset",
		...asset
	} as OutputAsset

	return bundle[asset.fileName] as OutputAsset
}

type ChunkOptions = Pick<
	OutputChunk,
	"name" | "fileName" | "code" | "isEntry" | "isImplicitEntry"
>
type ChunkOpts = ChunkOptions | (() => ChunkOptions)

function createChunk(bundle: OutputBundle, chunk: ChunkOpts) {
	chunk = typeof chunk === "function" ? chunk() : chunk

	bundle[chunk.fileName] = {
		map: null,
		sourcemapFileName: null,
		preliminaryFileName: chunk.fileName,
		dynamicImports: [],
		implicitlyLoadedBefore: [],
		importedBindings: {},
		imports: [],
		modules: {},
		referencedFiles: [],
		exports: [],
		facadeModuleId: null,
		isDynamicEntry: false,
		moduleIds: [],
		type: "chunk",
		isEntry: false,
		isImplicitEntry: false,
		...chunk
	} as OutputChunk

	return bundle[chunk.fileName] as OutputChunk
}

export function defineManifest(
	factory: (helpers: Helpers) => chrome.runtime.Manifest
) {
	let config: ResolvedConfig = undefined!
	const isDev = () => config.mode === "dev"

	function getChunk(
		bundle: OutputBundle,
		id: string,
		opt: GetChunkOption = {}
	): OutputChunk {
		if (id === "tailwind") console.log(bundle)

		const chunk = Object.values(bundle)
			.filter((chunk: OutputChunk) =>
				typeof opt.isEntry === "boolean" ? chunk.isEntry === opt.isEntry : true
			)
			.find((chunk: OutputChunk) => chunk.name === id)

		if (!chunk) {
			throw new Error(`[getChunk]: chunk with id "${id}" not found.`)
		}

		return chunk
	}

	function createChunkEntry(
		bundle: OutputBundle,
		id: string,
		opt: GetChunkOption = {}
	): OutputChunk {
		const chunk = getChunk(bundle, id, opt)
		const chunkFilename = chunk.fileName.split("/")
		chunkFilename.pop()
		const chunkId = opt.name ?? `${id}-entry`
		const baseFileName = opt.fileName ? opt.fileName : `${chunkId}.js`
		const fileName = chunkFilename.join("/") + `/${baseFileName}`

		delete opt.fileName
		delete opt.name

		if (bundle[fileName]) return bundle[fileName] as OutputChunk

		const code = `;(()=>{const runtime = chrome?.runtime || browser?.runtime; runtime && import(runtime.getURL("${chunk.fileName}"));})()`

		return createChunk(bundle, {
			name: chunkId,
			fileName,
			code,
			isEntry: true,
			isImplicitEntry: true,
			...opt
		})
	}

	return {
		name: "crx-manifest",
		enforce: "post",
		apply: "build",
		configResolved(_config) {
			config = _config
		},
		generateBundle(_, bundle) {
			const manifest = factory({
				getChunk: (...args) => getChunk(bundle, ...args),
				createChunkEntry: (...args) => createChunkEntry(bundle, ...args),
				createChunk: (...args) => createChunk(bundle, ...args),
				isDev,
				filter: {
					isString: (value: any): value is string => typeof value === "string"
				}
			})

			createAsset(bundle, {
				name: "manifest",
				fileName: "manifest.json",
				source: JSON.stringify(manifest, null, 2)
			})
		}
	} as Plugin
}
