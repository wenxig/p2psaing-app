import '@/utils/axios';
import '@/assets/main.scss';
import App from './App.vue'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/loading/style/css'
import router from './router';
import { random } from 'lodash-es';
window.windowName = location.search.substring(1).split('=')[1] ?? 'index'
window.electronAPI.ipcRenderer.on(`reload_page_${window.windowName}`, () => location.reload())
window.addWindow = (name = random(123123123).toString()) => {
  window.electronAPI.ipcRenderer.sendSync('createMainlessWindow', name)
}
window.goHome = () => {
  window.location.href = `${window.location.origin}${location.pathname}/#/main${location.search}`
}
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use({
  install(app) {
    app.config.globalProperties.$electron = window.electronAPI
    app.config.globalProperties.$window = window
  },
})
app.mount("#app")
