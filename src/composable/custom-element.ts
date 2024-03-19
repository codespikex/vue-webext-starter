import {
	ExposeContext,
	type Exposed,
	type UnmountHook
} from "@/utils/custom-element"
import type { CustomElements } from "virtual:custom-elements"
import { inject } from "vue"

export function useCustomElement<
	const TagName extends keyof CustomElements = "__default"
>(): Exposed<CustomElements[TagName]> {
	return inject(ExposeContext)!
}

export function onBeforeCustomElementUnmount(hook: UnmountHook) {
	useCustomElement().beforeUnmount(hook)
}
