import App from './App.vue'
import '@/assets/main.scss';
import { createApp } from 'vue'
import router from './router';
import { createPinia } from 'pinia';
import 'element-plus/es/components/message/style/css'
import axios from 'axios';
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use({
  install(app) {
    app.config.globalProperties.$ipc = {
      send: (msg: string, ...data: any[]) => window.ipcRenderer.send(msg, ...data),
      invoke: (msg: string, data: any) => window.ipcRenderer.invoke(msg, data)
    }
    app.config.globalProperties.$window = window
  },
})


//@ts-ignore
axios.defaults.retry = 3; //重试次数
//@ts-ignore
axios.defaults.retryDelay = 1000;//重试延时
//@ts-ignore
axios.defaults.shouldRetry = (error) => true;//重试条件，默认只要是错误都需要重试
axios.interceptors.response.use(undefined, (err) => {
  const config = err.config;
  if (!config || !config.retry || !config.shouldRetry || typeof config.shouldRetry != 'function' || !config.shouldRetry(err)) {
    return Promise.reject(err);
  }
  config.__retryCount = config.__retryCount || 0;
  if (config.__retryCount >= config.retry) {
    return Promise.reject(err);
  }
  config.__retryCount += 1;
  const delay = config.retryDelay || 1;
  return new Promise<void>(resolve => {
    setTimeout(resolve, delay);
  }).then(() => {
    return axios(config);
  });
});

app.directive('reload', (el: HTMLImageElement) => {
  const number = 3
  retry(el, number)
})

function retry(el: HTMLImageElement, number: number) {
  if (number > 0) {
    el.onerror = () => {
      retry(el, number - 1);
    };
    setTimeout(() => {
      el.src = el.src;
    }, 1000);
  } else {
    el.onerror = null;
  }
}
app.mount('#app')
