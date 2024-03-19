import type {
	Component,
	DefineComponent,
	ComponentPublicInstance,
	App
} from "vue"
import { reactive, isProxy, createApp, shallowRef, unref } from "vue"
import type { CustomElements } from "virtual:custom-elements"

export type { Component }

type ExtractProps<Def extends Component> = Prettify<
	Def extends Component<infer CCPI>
		? CCPI extends ComponentPublicInstance<infer P>
			? P
			: {}
		: {}
>

type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export type SetupFn<Def extends Component> = (
	app: App<Element>,
	ctx: {
		el: HTMLElement
		props: ExtractProps<Def>
		exposed: Exposed<ExtractProps<Def>>
		shadowRoot: ShadowRoot
		parentEl: HTMLElement
	}
) => void

type UnmountHookFn = (controller?: AbortController) => void
type UnmountHookOptions = {
	priority: number
} & (
	| { type: "transition"; handler: () => void }
	| { type?: undefined; handler: UnmountHookFn }
)

export type UnmountHook = UnmountHookOptions | UnmountHookFn

export type PropParams<Props = object> =
	Partial<Props> extends Props ? [props?: Props] : [props: Props]

export type Exposed<Props = object> = Readonly<{
	app: App<Element>
	update(props: Partial<Props>): void
	get props(): Props
	get element(): HTMLElement
	get parentElement(): HTMLElement
	get tagName(): keyof CustomElements
	get unmounted(): boolean
	get visible(): boolean
	set visible(value: boolean)
	setVisible(value: boolean): void
	unmount(forceUnmount?: boolean): void
	beforeUnmount(hook: UnmountHook): () => boolean
}>

export type DefineCustomElementInstance<Props = object> = Readonly<
	Exposed<Props> & {
		mount(): HTMLElement
	}
>

export type DefineCustomElement<Props = object> = {
	(...args: PropParams<Props>): DefineCustomElementInstance<Props>
	readonly tagName: keyof CustomElements
	readonly def: DefineComponent
}

export const ExposeContext = "$CE_EXPOSE" as const

export function defineCustomElement<Def extends Component>(
	compDef: Def,
	setup?: SetupFn<Def>
) {
	const def = compDef as DefineComponent
	const widget = def.widget!
	const name = def.name ?? def.__name

	if (!widget) {
		throw new Error(`[widget] property is not defined on "${name}" component.`)
	}

	type Props = ExtractProps<Def>

	const proto = function (
		...args: PropParams<Props>
	): DefineCustomElementInstance<Props> {
		const _props = args[0] ?? ({} as Props)

		const props = (isProxy(_props) ? _props : reactive(_props)) as any as Props
		const visible = shallowRef(true)

		let _unmounted = false
		const app = createApp(compDef, props)
		const el: HTMLElement = document.createElement(widget.tag)
		const parentEl: HTMLElement = document.createElement("root")

		const shadowRoot = el.attachShadow({ mode: widget.shadowMode ?? "closed" })
		shadowRoot.appendChild(parentEl)

		const listenerController = new AbortController()
		addEventListenerAll(
			parentEl,
			(ev: Event) => {
				ev.stopPropagation()
			},
			listenerController.signal
		)

		const bm = new Map<UnmountHookFn, UnmountHookOptions>()

		const exposed = Object.freeze({
			app,
			update,
			get props() {
				return props
			},
			get element() {
				return el
			},
			get parentElement() {
				return parentEl
			},
			get unmounted() {
				return _unmounted
			},
			get tagName() {
				return widget.tag as keyof CustomElements
			},
			get visible() {
				return unref(visible)
			},
			set visible(value: boolean) {
				visible.value = value
			},
			setVisible(value: boolean) {
				visible.value = value
			},
			beforeUnmount,
			unmount
		})

		app.provide(ExposeContext, exposed)

		setup?.(app, { el, props, exposed, shadowRoot, parentEl })

		function mount(): HTMLElement {
			app.mount(parentEl)
			return el
		}

		function update(updates: Partial<Props>) {
			Object.assign(props, updates)
		}

		function beforeUnmount(hook: UnmountHook) {
			const options =
				typeof hook === "function"
					? { priority: 0, type: undefined, handler: hook }
					: hook
			const fn = typeof hook === "function" ? hook : hook.handler

			bm.set(fn, options)

			return () => bm.delete(fn)
		}

		function unmount(forceUnmount: boolean = false) {
			if (_unmounted) return
			_unmounted = true

			if (forceUnmount) {
				Array.from(bm.values())
					.filter(hook => hook.type !== "transition")
					.forEach(hook => hook.handler())

				bm.clear()
				listenerController.abort("app:unmounted")

				app.unmount()
				el.remove()
			} else {
				unmountAsync()
			}
		}

		async function unmountAsync() {
			const controller = new AbortController()
			const hooks = Array.from(bm.values()).sort(
				(a, b) => a.priority - b.priority
			)

			const normalHooks = hooks.filter(hook => hook.type !== "transition")
			const transitionHooks = hooks.filter(hook => hook.type === "transition")

			for (const { handler } of normalHooks) {
				await handler(controller)
				if (controller.signal.aborted) break
			}

			if (controller.signal.aborted) {
				_unmounted = false
			} else {
				if (transitionHooks.length) {
					await Promise.allSettled(transitionHooks.map(hook => hook.handler()))
				}

				bm.clear()
				listenerController.abort("app:unmounted")

				app.unmount()
				el.remove()
			}
		}

		return Object.freeze({
			...exposed,
			mount
		})
	}

	proto.tagName = widget.tag as keyof CustomElements
	proto.def = def

	return Object.freeze(proto)
}

function addEventListenerAll(
	target: HTMLElement,
	listener: Function,
	signal: AbortSignal
) {
	for (const key in target) {
		if (/^on/.test(key)) {
			const eventType = key.substring(2)
			target.addEventListener(eventType as any, listener as any, {
				capture: false,
				signal
			})
		}
	}
}
