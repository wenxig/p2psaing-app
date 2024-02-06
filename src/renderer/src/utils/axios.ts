import axios, { AxiosError } from 'axios';
axios.defaults.retry = Infinity; //重试次数
axios.defaults.retryDelay = 1000;//重试延时
axios.defaults.timeout = 5000
export const handleError = (err: AxiosError) => {
  const config = err.config;
  if (!config || !config.retry) return Promise.reject(err);
  config.__retryCount = config.__retryCount || 0;
  if (config.__retryCount >= config.retry) return Promise.reject(err);
  config.__retryCount += 1;
  if (config.__retryCount >= 5) return location.reload()
  return new Promise<void>(resolve => setTimeout(resolve, config.retryDelay || 1)).then(() => axios(config));
}
axios.interceptors.response.use(undefined, handleError);
