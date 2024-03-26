import { type App, vShow } from "vue"
import { useCustomElementMocks } from "./custom-element"

export function useMocks(app: App) {
	app.directive("visible", vShow)
	useCustomElementMocks(app)
}
