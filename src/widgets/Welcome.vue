<script lang="ts">
const TAG_NAME = "vue-welcome" as const

type Props = {
	greeting: string
}

declare module "virtual:custom-elements" {
	interface CustomElements {
		[TAG_NAME]: Props
	}
}
</script>
<script lang="ts" setup>
import { useCustomElement } from "@/composable/custom-element"
import { auth } from "./middleware"

defineOptions({
	name: "Welcome",
	widget: {
		tag: TAG_NAME,
		middleware: [auth.with({})]
	}
})

defineProps<Props>()

const ce = useCustomElement<"vue-welcome">()

const { directive: vCustomElement, unmount } = ce
</script>

<template>
	<transition name="fade" appear>
		<div
			class="fixed bottom-4 left-4 z-50"
			v-show="ce.visible"
			v-custom-element
		>
			<div
				class="relative bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10"
			>
				<div class="mx-auto max-w-md">
					<button
						class="absolute right-5 top-5 rounded p-1.5 text-slate-400 outline-none hover:bg-slate-100 focus-visible:ring"
						@click="unmount()"
					>
						<svg
							class="size-6"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<g fill="none" fill-rule="evenodd">
								<path
									d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
								/>
								<path
									fill="currentColor"
									d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414L12 13.414Z"
								/>
							</g>
						</svg>
					</button>

					<img
						class="h-6"
						src="https://play.tailwindcss.com/img/logo.svg"
						alt="Tailwind Play"
					/>
					<div class="divide-y divide-gray-300/50">
						<div class="space-y-6 py-8 text-base leading-7 text-gray-600">
							<p>
								An advanced online playground for Tailwind CSS, including
								support for things like:
							</p>
							<ul class="space-y-4">
								<li class="flex items-center">
									<svg
										class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="12" cy="12" r="11" />
										<path
											d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9"
											fill="none"
										/>
									</svg>
									<p class="ml-4">
										Customizing your
										<code class="text-sm font-bold text-gray-900"
											>tailwind.config.js</code
										>
										file
									</p>
								</li>
								<li class="flex items-center">
									<svg
										class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="12" cy="12" r="11" />
										<path
											d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9"
											fill="none"
										/>
									</svg>
									<p class="ml-4">
										Extracting classes with
										<code class="text-sm font-bold text-gray-900">@apply</code>
									</p>
								</li>
								<li class="flex items-center">
									<svg
										class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="12" cy="12" r="11" />
										<path
											d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9"
											fill="none"
										/>
									</svg>
									<p class="ml-4">Code completion with instant preview</p>
								</li>
							</ul>
							<p>
								Perfect for learning how the framework works, prototyping a new
								idea, or creating a demo to share online.
							</p>
						</div>
						<div class="pt-8 text-base font-semibold leading-7">
							<p class="text-gray-900">Want to dig deeper into Tailwind?</p>
							<p>
								<a
									class="text-sky-500 hover:text-sky-600"
									href="https://tailwindcss.com/docs"
									>Read the docs &rarr;</a
								>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>
