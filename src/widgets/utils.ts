import fontCss from "assets/css/font.css?inline"

import {
	defineCustomElement,
	type Component,
	type SetupFn,
	type DefineCustomElement,
	type DefineCustomElementInstance,
	type PropParams
} from "@/utils/custom-element"

import type { CustomElements } from "virtual:custom-elements"
import { withMiddleware } from "./middleware/utils"

const widgets = new Map<keyof CustomElements, DefineCustomElement>()
const singletonWidgets = new Map<
	keyof CustomElements,
	DefineCustomElementInstance
>()

const cssPromise = fetch(chrome.runtime.getURL("assets/global.css")).then(res =>
	res.text()
)

export async function useWidget<const T extends keyof CustomElements>(
	tagName: T,
	...args: PropParams<CustomElements[T]>
) {
	type Props = CustomElements[T]
	const props = args[0]

	if (!widgets.has(tagName)) {
		throw new Error(`[${tagName}] widget is not registered.`)
	}

	const proto = widgets.get(tagName)! as unknown as DefineCustomElement<Props>
	type WidgetInstance = DefineCustomElementInstance<Props>

	const isSingleton = proto.def.widget!.singleton
	const hasInstance = () =>
		isSingleton &&
		singletonWidgets.has(tagName) &&
		!singletonWidgets.get(tagName)!.unmounted

	if (!hasInstance() && singletonWidgets.has(tagName)) {
		singletonWidgets.delete(tagName)
	}

	const createWidget = () => {
		const instance = proto(props!)
		if (isSingleton) singletonWidgets.set(tagName, instance as any)

		return instance as unknown as WidgetInstance
	}

	const retreiveWidget = () => {
		if (hasInstance()) {
			const instance = singletonWidgets.get(tagName)!
			instance.setVisible(true)
			return instance as unknown as WidgetInstance
		} else return createWidget()
	}

	return withMiddleware(
		proto.def.widget!.middleware ?? [],
		retreiveWidget,
		tagName
	)
}

export function waitForAssets<T>(
	widget: T | Promise<T>,
	onLoad: (widget: T) => void,
	onFail?: (err: Error) => void
) {
	const register = (_widget: T) => cssPromise.then(() => onLoad(_widget))

	if (widget instanceof Promise) {
		typeof onFail === "function" && widget.catch(onFail)
		widget.then(_widget => register(_widget))
	} else register(widget)
}

export function setup<Def extends Component>(def: Def, setup?: SetupFn<Def>) {
	const widget = defineCustomElement(def, (app, ctx) => {
		attachCss(ctx.shadowRoot)
		attachFontCss(ctx.el)

		//TODO: Install global plugins or register components

		setup?.(app, ctx)
	})

	widgets.set(widget.tagName, widget as DefineCustomElement)

	return widget
}

function attachCss(shadowRoot: ShadowRoot) {
	cssPromise.then(css => {
		const sheet = new CSSStyleSheet()
		sheet.replaceSync(css)

		shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet]
	})
}

function attachFontCss(el: HTMLElement) {
	const style = document.createElement("style")
	style.innerText = fontCss.replace(
		"/assets/",
		chrome.runtime.getURL("assets/")
	)
	el.appendChild(style)
}
