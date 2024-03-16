import axios, { AxiosError } from 'axios';
import { Code } from './user';
axios.defaults.retry = 5; //重试次数
axios.defaults.retryDelay = 1000;//重试延时
axios.defaults.timeout = 5000
export const handleError = (err: AxiosError) => {
  if (err.response && err.response.data && (<Api.Fail>err.response.data).code && (<Api.Fail>err.response.data).code == Code.fail) return Promise.reject(err);
  const config = err.config;
  if (!config || !config.retry || !config.__retryCount || config.retry <= config.__retryCount) return Promise.reject(err);
  config.__retryCount = config.__retryCount || 0;
  config.__retryCount += 1;
  return new Promise<void>(resolve => setTimeout(resolve, config.retryDelay || 1)).then(() => axios(config));
}
axios.interceptors.response.use(undefined, handleError);
