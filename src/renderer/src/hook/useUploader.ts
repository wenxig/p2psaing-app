import { useUserStore } from '@s/user';
import axios from 'axios';
import { useAppStore } from '@s/appdata';
import { handleError } from '@/utils/axios';
import { compressionFile } from '@/utils/image';
const appStore = useAppStore()
const userStore = useUserStore()

class ImgUploder {
  private smms = axios.create({
    baseURL: `https://sm.ms/api/v2`,
    headers: {
      "Content-Type": "multipart/form-data;charset=UTF-8",
      Authorization: 'bipd73BhOqJYyPnMr8e5kA64jtWREomu'
    }
  })
  constructor() {
    this.smms.interceptors.response.use(undefined, handleError)
  }
  private async *img_smms(file: File | Blob, imgName: string): AsyncGenerator<boolean | [string, string]> { //? 使用迭代器控制进度
    if (userStore.user.delImg) await axios.get(userStore.user.delImg!)
    yield true
    try {
      const { data: imgData } = await this.smms.postForm(`/upload`, { smfile: new File([file], `${userStore.user.pid}.${imgName}`) })
      return yield [imgData.data.url, imgData.data.delete]
    } catch {
      throw false
    }
  }
  protected async *uploadImg(file: File | Blob, name: string): AsyncGenerator<boolean | [string, string?]> { //? 使用迭代器控制进度
    file = (await compressionFile(file))[0]
    yield true
    try {
      for await (const val of this.img_smms(file, name)) {
        yield true
        if (typeof val === 'boolean') if (val == false) throw false
        else continue
        return yield val
      }
    } catch (err) {
      console.error(err);
      throw false
    }
  }
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
        await userStore.$commit()
        appStore.settingPage.loadProgress = 100
        return val
      }
    } catch (err) {
      throw err
    }
    return ['', '']
  }
  constructor() {
    super()
  }
}
export const uploader = new Uploader()