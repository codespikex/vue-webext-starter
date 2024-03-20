<template>
	<div
		class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-100 py-6 sm:py-12 items-center"
	>
		<img
			class="absolute top-1/2 left-1/2 max-w-none w-full -translate-x-1/2 -translate-y-1/2 object-cover"
			src="https://play.tailwindcss.com/img/beams.jpg"
			alt=""
			width="1308"
		/>
		<div
			class="absolute inset-0 bg-[url(https://play.tailwindcss.com/img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
		></div>
		<slot></slot>
	</div>
</template>
