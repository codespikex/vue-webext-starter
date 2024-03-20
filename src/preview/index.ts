import { createApp } from "vue"
import Preview from "./Preview.vue"
import PreviewMode from "./PreviewMode.vue"
import { useMocks } from "./mocks"

const app = createApp(Preview)
useMocks(app)
app.component("PreviewMode", PreviewMode)

app.mount("#app")
