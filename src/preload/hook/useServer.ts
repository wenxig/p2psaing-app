import axios from "axios";

export function useServer() {
  return {
    do(dat: any) {
      const data = dat as { user: string, secret: string, value: string } & any;
      data.user = import.meta.env.PRELOAD_VITE_TINYWEBDB_USER
      data.secret = import.meta.env.PRELOAD_VITE_TINYWEBDB_SECRET
      if (dat.action == 'update')
        data.value = JSON.stringify(dat.value)
      return axios.post("https://tinywebdb.appinventor.space/api", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        }
      })
    }
  }
}