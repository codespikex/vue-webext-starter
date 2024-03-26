import {
	ExposeContext,
	type Exposed,
	type UnmountHook
} from "@/utils/custom-element"
import type { CustomElements } from "virtual:custom-elements"
import { type ObjectDirective, inject } from "vue"

export function useCustomElement<
	const TagName extends keyof CustomElements = "__default"
>(): Exposed<CustomElements[TagName]> {
	return inject(ExposeContext)!
}

export function onBeforeCustomElementUnmount(hook: UnmountHook) {
	useCustomElement().beforeUnmount(hook)
}

export function useCustomElementDirective(): ObjectDirective {
	const ce = inject<{ directive: ObjectDirective }>(ExposeContext, {
		directive: {}
	})

	return ce?.directive ?? {}
}
