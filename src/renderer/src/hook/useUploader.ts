import { useUserStore } from '@/store';
import axios from 'axios';
const user = useUserStore()
import { useAppStore } from '@/store';
import { storeToRefs } from 'pinia';
import { isUndefined } from 'lodash-es';
const appStoreValue = storeToRefs(useAppStore())

const useCanvas = () => {
  const canvas = document.createElement("canvas")
  return {
    canvas,
    [Symbol.dispose]() {
      document.body.appendChild(canvas)
      document.body.removeChild(canvas)
    }
  }
}

type GithubApikey = string; type SmmsApikey = string
namespace imgUploder {

  const db = `https://api.github.com/repos/wenxig/__APP_NAME__-app-db/contents`
  const db2 = "https://sm.ms/api/v2"
  let apiKey: [GithubApikey, SmmsApikey] = [window.getToken("github"), window.getToken("smms")]
  async function img_smms(file: File, imgName: string): Promise<[string, string?]> {
    if (user.user.value.delImg) {
      await axios.get(user.user.value.delImg as string, {
        headers: {
          "Authorization": apiKey[1],
          "Content-Type": "multipart/form-data;charset=UTF-8"
        },
        timeout: 5000
      })
      appStoreValue.settingPage.value.loadProgress = 35
    }
    const smfile = new File([file], `${user.user.value.pid}.${imgName}`)
    try {
      await axios.post(`https://sm.ms/api/v2/token`, {
        "username": 'wenxig',
        "password": 'hb094263'
      }, {
        headers: {
          "Content-Type": "multipart/form-data;charset=UTF-8"
        },
        timeout: 5000
      })
      appStoreValue.settingPage.value.loadProgress = 40
      const { data: imgData } = await axios.post(`${db2}/upload`, {
        smfile
      }, {
        headers: {
          "Content-Type": "multipart/form-data;charset=utf-8",
          "Authorization": apiKey[1]
        },
        timeout: 5000
      })
      appStoreValue.settingPage.value.loadProgress = 60
      return [imgData.data.url, imgData.data.delete]
    } catch (err: any) {
      throw false
    }
  }
  async function img_github(base64: string, imgName: string): Promise<[string]> {
    let putData
    const { data: { sha } } = await axios.get(`${db}/${user.user.value.pid}/img/${imgName}`, {
      headers: {
        "Authorization": apiKey[0],
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/vnd.github.v3+json"
      },
      timeout: 5000
    })
    putData = {
      branch: "master",
      content: base64,
      message: `add img by __APP_NAME__ api`,
      sha
    }
    appStoreValue.settingPage.value.loadProgress = 40
    try {
      await axios.put(`${db}/${user.user.value.pid}/img/${imgName}`, putData, {
        headers: {
          "Authorization": apiKey[0],
          "Content-Type": "application/json; charset=utf-8",
          "Accept": "application/vnd.github.v3+json"
        },
        timeout: 5000
      })
    } catch {
      throw false
    };
    appStoreValue.settingPage.value.loadProgress = 60
    return [`https://cdn.staticaly.com/gh/wenxig/__APP_NAME__-app-db@master/${user.user.value.pid}/img/${imgName}`]
  }
  export async function uploadImg(file: File, name: string): Promise<[string, string?]> {
    file = (await compressionFile(file))[0]
    appStoreValue.settingPage.value.loadProgress = 10
    const url = await fileToDataURL(file)
    appStoreValue.settingPage.value.loadProgress = 30
    const base64 = url.substring(url.indexOf(',') == -1 ? 0 : url.indexOf(',') + 1)
    let imgUrl: [string, string?]
    try {
      imgUrl = await img_github(base64, name)
    } catch {
      try {
        imgUrl = await img_smms(file, name)
      } catch (err) {
        console.log(err);
        throw new Error('false')
      }
    }
    appStoreValue.settingPage.value.loadProgress = 80
    if (!isUndefined(imgUrl[1])) {
      return imgUrl as [string, string]
    }
    return imgUrl as [string]
  }

  async function compressionFile(file: File, type = 'image/jpeg', quality = 0.5, name?: string): Promise<[File, Blob]> {
    const canvas = useCanvas()
    const fileName = name ?? file.name;
    const context = canvas.canvas.getContext('2d') as CanvasRenderingContext2D;
    const base64 = await fileToDataURL(file);
    const img = await dataURLToImage(base64);
    canvas.canvas.width = img.width;
    canvas.canvas.height = img.height;
    context.clearRect(0, 0, img.width, img.height);
    context.drawImage(img, 0, 0, img.width, img.height);
    const blob = await canvastoFile(canvas.canvas, type, quality) as Blob; // quality:0.5可根据实际情况计算
    const newFile = new File([blob], fileName, { type });
    canvas[Symbol.dispose]()
    return [newFile, blob];
  }
}

const fileToDataURL = (file: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = (e) => resolve((() => {
      if (e.target && e.target.result) {
        if (typeof e.target.result === "string") {
          return e.target.result
        }
        if (e.target.result instanceof ArrayBuffer) {
          return String.fromCharCode.apply(null, Array.from(new Uint8Array(e.target.result)))
        }
      }
      return ""
    })())
    reader.readAsDataURL(file)
  })
}
const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = dataURL
  })
}

const canvastoFile = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> => {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality))
}

namespace Uploader {
  export async function titleImg(file: File | undefined) {
    if (!file) return ""
    let imgName = `usertitle.title${file.name.slice(file.name.lastIndexOf('.'))}`
    let imgUrl: [string, string?]
    try {
      imgUrl = await imgUploder.uploadImg(file, imgName)
    } catch (err) {
      throw err
    }
    appStoreValue.settingPage.value.loadProgress = 80

    user.user.value.img = imgUrl[0]
    user.user.value.delImg = imgUrl[1]
    appStoreValue.settingPage.value.loadProgress = 100
    return imgUrl
  }
}

export default function useUploader() {
  return {
    titleImg: Uploader.titleImg
  }
}