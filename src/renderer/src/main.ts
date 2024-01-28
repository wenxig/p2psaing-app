import '@/utils/axios';
import '@/assets/main.scss';
import App from './App.vue'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/message-box/style/css'
import { $setup, actor } from "./controller";
import { isEmpty } from 'lodash-es';

while (true) {
  console.log(window.ipc);
  
  if (!isEmpty(window.ipc)) {
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.use($setup())
    app.use({
      install(app) {
        app.config.globalProperties.$ipc = window.ipc
        app.config.globalProperties.$window = window
        app.config.globalProperties.$actor = actor
      },
    })
    app.mount("#app")
    actor.send({ type: 'loadPlugin' })
    break;
  }
}