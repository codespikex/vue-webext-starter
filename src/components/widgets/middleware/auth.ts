import { defineWithParams, type NextFn } from "./utils"

type Options = {
	onAuth?: () => void
	onFail?: () => void
}

const wait = (ms: number) =>
	new Promise(r => setTimeout(() => r(undefined), ms))

export async function auth(opts: Options, next: NextFn) {
	await opts.onAuth?.()
	console.log("authenticating...")
	await wait(1000)
	console.log("authenticated")

	next()
}

auth.with = defineWithParams(auth)
