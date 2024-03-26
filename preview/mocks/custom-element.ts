import { ref, unref, type App } from "vue"

export function useCustomElementMocks(app: App) {
	const visible = ref(true)

	const exposed = Object.freeze({
		app,
		tagName: "custom-element",
		unmounted: false,
		get props() {
			return app._instance?.props
		},
		get visible() {
			return unref(visible)
		},
		setVisible(value: boolean) {
			visible.value = value
		},
		get element() {
			return app._instance?.vnode.el
		},
		get parentElement() {
			return app._instance?.vnode.el?.parentElement
		},

		beforeUnmount: () => () => true,
		update: () => {},
		unmount() {
			visible.value = false
		},
		directive: {}
	})

	app.provide("$CE_EXPOSE", exposed)
}
