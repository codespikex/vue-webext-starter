import "@vue/runtime-core"

declare module "@vue/runtime-core" {
	export interface ComponentCustomOptions {
		widget?: {
			tag: string
			/** @default "closed" */
			shadowMode?: ShadowRootMode
			middleware?: Array<(next: (err?: Error) => void) => void>
			singleton?: true
		}
	}
}

export default {}
