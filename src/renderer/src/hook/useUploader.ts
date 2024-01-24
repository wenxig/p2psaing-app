import { useUserStore } from '@s/user';
import axios from 'axios';
import { useAppStore } from '@s/appdata';
import { handleError } from '@/utils/axios';
import { compressionFile, fileToDataURL } from '@/utils/image';
const appStore = useAppStore()
const userStore = useUserStore()

class ImgUploder {
  private github = axios.create({
    baseURL: `https://api.github.com/repos/wenxig/__APP_NAME__-app-db/contents`,
    headers: {
      "Authorization": window.getToken("github"),
      "Content-Type": "application/json; charset=utf-8",
      "Accept": "application/vnd.github.v3+json"
    }
  })
  private smms = axios.create({
    baseURL: "https://sm.ms/api/v2",
    headers: {
      "Authorization": window.getToken("smms"),
      "Content-Type": "multipart/form-data;charset=UTF-8"
    }
  })
  constructor() {
    this.github.interceptors.response.use(undefined, handleError)
    this.smms.interceptors.response.use(undefined, handleError)
  }
  private async *img_smms(file: File | Blob, imgName: string): AsyncGenerator<boolean | [string, string]> { //? 使用迭代器控制进度
    if (userStore.user.delImg) await axios.get(userStore.user.delImg!)
    yield true
    try {
      const { data: imgData } = await this.smms.post(`/upload`, { smfile: new File([file], `${userStore.user.pid}.${imgName}`) })
      return yield [imgData.data.url, imgData.data.delete]
    } catch {
      throw false
    }
  }
  private async *img_github(base64: string, imgName: string): AsyncGenerator<boolean | [string]> { //? 使用迭代器控制进度
    const pid = userStore.user.pid
    const { data: { sha } } = await this.github.get(`/${pid}/img/${imgName}`)
    yield true
    appStore.settingPage.loadProgress = 40
    try {
      await this.github.put(`/${pid}/img/${imgName}`, {
        branch: "master",
        content: base64,
        message: `add img by __APP_NAME__ api`,
        sha
      })
      return yield [`https://cdn.staticaly.com/gh/wenxig/__APP_NAME__-app-db@master/${pid}/img/${imgName}`]
    } catch {
      throw false
    };
  }
  protected async *uploadImg(file: File | Blob, name: string): AsyncGenerator<boolean | [string, string?]> { //? 使用迭代器控制进度
    file = (await compressionFile(file))[0]
    yield true
    const url = await fileToDataURL(file)
    yield true
    try {
      for await (const val of this.img_github(url.substring(url.indexOf(',') == -1 ? 0 : url.indexOf(',') + 1), name)) {
        yield true
        if (typeof val === 'boolean') if (val == false) throw false
        else continue
        return yield val
      } //? 运行2次 
    } catch {
      try {
        for await (const val of this.img_smms(file, name)) {
          yield true
          if (typeof val === 'boolean') if (val == false) throw false
          else continue
          return yield val
        } //? 运行2次 
      } catch (err) {
        console.error(err);
        throw false
      }
    }
  }// todo 迭代4次
}

class Uploader extends ImgUploder {
  public async avatar(file: File | undefined) {
    if (!file) return ['', '']
    try {
      for await (const val of this.uploadImg(file, `usertitle.title${file.name.slice(file.name.lastIndexOf('.'))}`)) {
        appStore.settingPage.loadProgress += 20
        if (typeof val == 'boolean') if (val == false) throw false
        else continue
        userStore.user.img = val[0]
        userStore.user.delImg = val[1]
        await userStore.commit()
        appStore.settingPage.loadProgress = 100
        return val
      }
    } catch (err) {
      throw err
    }
    return ['', '']
  }
  constructor(){
    super()
  }
}
export const uploader = new Uploader()