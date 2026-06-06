import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import { useErrorBoundary } from './composables/useErrorBoundary.js'

const app = createApp(App)
app.config.errorHandler = (err, vm, info) => {
  const { captureError } = useErrorBoundary()
  captureError(err, vm, info)
}
app.use(createPinia())
app.use(router)
app.component('RecycleScroller', RecycleScroller)
app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)
app.mount('#app')
