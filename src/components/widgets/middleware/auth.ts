import { defineWithParams, type NextFn } from "./utils"

type Options = {
	onAuth?: () => void
	onFail?: () => void
}

export async function auth(opts: Options, next: NextFn) {
	await opts.onAuth?.()

	next()
}

auth.with = defineWithParams(auth)
