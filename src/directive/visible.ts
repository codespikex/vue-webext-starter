import type { Exposed } from "../utils/custom-element"
import type { ObjectDirective } from "@vue/runtime-core"

const OriginalDisplay = Symbol("_vod")
const Hidden = Symbol("_vsh")
const BmHook = Symbol("_bm")

interface VShowElement extends HTMLElement {
	// _vod = vue original display
	[OriginalDisplay]: string
	[Hidden]: boolean
	[BmHook]: Function
}

export function defineDirective(exposed: Exposed) {
	return {
		beforeMount(el, { value }, { transition }) {
			el[OriginalDisplay] = el.style.display === "none" ? "" : el.style.display
			if (transition && value) {
				transition.beforeEnter(el)
			} else {
				setDisplay(el, value)
			}
		},
		mounted(el, { value }, { transition }) {
			el[BmHook] = exposed.beforeUnmount({
				type: "transition",
				priority: 0,
				handler: () => {
					if (!transition) {
						return setDisplay(el, false)
					}

					return new Promise(resolve => {
						transition.leave(el, () => {
							setDisplay(el, false)
							resolve()
						})
					}) as Promise<void>
				}
			})

			if (transition && value) {
				transition.enter(el)
			}
		},
		updated(el, { value, oldValue }, { transition }) {
			if (!value === !oldValue) return
			if (transition) {
				if (value) {
					transition.beforeEnter(el)
					setDisplay(el, true)
					transition.enter(el)
				} else {
					transition.leave(el, () => {
						setDisplay(el, false)
					})
				}
			} else {
				setDisplay(el, value)
			}
		},
		beforeUnmount(el, { value }) {
			setDisplay(el, value)
			el[BmHook]?.()
		}
	} satisfies ObjectDirective<VShowElement>
}

function setDisplay(el: VShowElement, value: unknown): void {
	el.style.display = value ? el[OriginalDisplay] : "none"
	el[Hidden] = !value
}
