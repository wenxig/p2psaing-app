import { useUserStore } from '@s/user';
import axios from 'axios';
import { useAppStore } from '@s/appdata';
import { handleError } from '@/utils/axios';
import { compressionFile, fileToDataURL } from '@/utils/image';
const appStoreValue = useAppStore()
const user = useUserStore()

namespace imgUploder {
  const github = axios.create({
    baseURL: `https://api.github.com/repos/wenxig/__APP_NAME__-app-db/contents`,
    headers: {
      "Authorization": window.getToken("github"),
      "Content-Type": "application/json; charset=utf-8",
      "Accept": "application/vnd.github.v3+json"
    }
  })
  const smms = axios.create({
    baseURL: "https://sm.ms/api/v2",
    headers: {
      "Authorization": window.getToken("smms"),
      "Content-Type": "multipart/form-data;charset=UTF-8"
    }
  })
  github.interceptors.response.use(undefined, handleError)
  smms.interceptors.response.use(undefined, handleError)
  async function* img_smms(file: File | Blob, imgName: string): AsyncGenerator<boolean | [string, string]> { //? 使用迭代器控制进度
    if (user.user.delImg) {
      await axios.get(user.user.delImg!)
    }
    yield true
    const smfile = new File([file], `${user.user.pid}.${imgName}`)
    try {
      const { data: imgData } = await smms.post(`/upload`, { smfile })
      yield [imgData.data.url, imgData.data.delete]
      return
    } catch {
      throw false
    }
  }
  async function* img_github(base64: string, imgName: string): AsyncGenerator<boolean | [string]> { //? 使用迭代器控制进度
    const { data: { sha } } = await github.get(`/${user.user.pid}/img/${imgName}`)
    yield true
    appStoreValue.settingPage.loadProgress = 40
    try {
      await github.put(`/${user.user.pid}/img/${imgName}`, {
        branch: "master",
        content: base64,
        message: `add img by __APP_NAME__ api`,
        sha
      })
      yield [`https://cdn.staticaly.com/gh/wenxig/__APP_NAME__-app-db@master/${user.user.pid}/img/${imgName}`]
      return
    } catch {
      throw false
    };
  }
  export async function* uploadImg(file: File | Blob, name: string): AsyncGenerator<boolean | [string, string?]> { //? 使用迭代器控制进度
    file = (await compressionFile(file))[0]
    yield true
    const url = await fileToDataURL(file)
    yield true
    const base64 = url.substring(url.indexOf(',') == -1 ? 0 : url.indexOf(',') + 1)
    try {
      for await (const val of img_github(base64, name)) {
        yield true
        if (typeof val === 'boolean') {
          if (val == false) {
            throw false
          }
          continue
        }
        yield val
        return
      } //? 运行2次 
    } catch {
      try {
        for await (const val of img_smms(file, name)) {
          yield true
          if (typeof val === 'boolean') {
            if (val == false) {
              throw false
            }
            continue
          }
          yield val
          return
        } //? 运行2次 
      } catch (err) {
        console.log(err);
        throw false
      }
    }
  }// todo 迭代4次
}


namespace Uploader {
  export async function titleImg(file: File | undefined) {
    if (!file) return ['', '']
    let imgName = `usertitle.title${file.name.slice(file.name.lastIndexOf('.'))}`
    try {
      for await (const val of imgUploder.uploadImg(file, imgName)) {
        appStoreValue.settingPage.loadProgress += 20
        if (typeof val == 'boolean') {
          if (val == false) {
            throw false
          }
          continue
        }
        user.user.img = val[0]
        user.user.delImg = val[1]
        await user.commit()
        appStoreValue.settingPage.loadProgress = 100
        return val
      }
    } catch (err) {
      throw err
    }
    return ['', '']
  }
}

export default function useUploader() {
  return {
    titleImg: Uploader.titleImg
  }
}