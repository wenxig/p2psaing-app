import axios from "axios"
import { HmacSHA256 } from "crypto-js"

const url = import.meta.env.DEV ? "http://0.0.0.0:3000/" : "https://glacier-abounding-afrovenator.glitch.me/"
const api = axios.create({
  baseURL: url
})

async function mailCode(data: RouterData.EmailCode) {
  return await api.post('/sys/mailcode', data)
}
async function signUp(data: RouterData.SignUp) {
  return await api.post(`/user/${HmacSHA256(`${data.name}${data.password}`, data.code).toString()}`, data)
}
export {
  mailCode,
  signUp
}
export default api
