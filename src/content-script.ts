import { useWidget, waitForAssets } from "./components/widgets"

const WelcomeWidget = useWidget("vue-welcome", { greeting: "Vue" })

waitForAssets(WelcomeWidget, instance => {
	document.body.appendChild(instance.mount())
})
