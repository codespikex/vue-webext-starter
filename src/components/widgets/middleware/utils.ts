import { MiddlewareLock } from "@/error"

export type NextFn = (err?: Error) => void
export type Middleware = (next: NextFn) => void

const locks = new Set<string>()

export async function withMiddleware<T>(
	middleware: Middleware[],
	cb: () => T,
	key: string
): Promise<T> {
	// no middleware to run
	if (!middleware.length) return cb()

	if (key && locks.has(key)) {
		throw new MiddlewareLock(`[${key}] already has a lock.`)
	}

	if (key) locks.add(key)

	middleware = [...middleware].reverse()

	return new Promise<T>((resolve, reject) => {
		const onError = (cb: Function) => {
			return (err?: Error) => {
				if (err) reject(err)
				else cb()
			}
		}

		const pipe = middleware.reduce(
			(next, prev) => onError(() => prev(next)),
			onError(() => resolve(cb()))
		)

		pipe()
	}).finally(() => {
		key && locks.delete(key)
	})
}

export function defineWithParams<
	T extends (...args: any) => any,
	Params extends Parameters<T>
>(fn: T) {
	return (...params: Head<Params>) => {
		return (next: Tail<Params>) => {
			return fn(...(params as any), next)
		}
	}
}

type Head<T extends any[]> = T extends [...infer T, any] ? T : any[]
type Tail<T extends any[]> = T extends [...any, infer T] ? T : any
