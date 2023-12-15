import axios, { AxiosError } from 'axios';
axios.defaults.retry = 3; //重试次数
axios.defaults.retryDelay = 1000;//重试延时
axios.defaults.shouldRetry = () => true;//重试条件，默认只要是错误都需要重试
axios.defaults.timeout = 5000
export const handleError = (err: AxiosError) => {
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
}
axios.interceptors.response.use(undefined, handleError);
