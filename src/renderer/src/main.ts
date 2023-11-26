import '@/utils/axios';
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/loading/style/css'
import '@/assets/main.scss';
import App from './App.vue'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use({
  install(app) {
    app.config.globalProperties.$electron=window.electronAPI
    app.config.globalProperties.$window = window
  },
})
app.mount("#app")