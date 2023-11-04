import axios from 'axios';
import { useUserStore } from '@/store';
const user = useUserStore()

import { useAppStore } from '@/store';
import { storeToRefs } from 'pinia';
import { isUndefined } from 'lodash-es';
const appStoreValue = storeToRefs(useAppStore())
const loadProgress = appStoreValue.loadProgress


type GithubApikey = string; type SmmsApikey = string
export default class imgUploder {
  private canvas: HTMLCanvasElement
  protected db = "https://api.github.com/repos/wenxig/p2pSaing-app-db/contents"
  protected db2 = "https://sm.ms/api/v2"
  private apiKey: [GithubApikey, SmmsApikey]
  constructor(canves: HTMLCanvasElement, githubApikey: GithubApikey, smmsApikey: SmmsApikey) {
    this.canvas = canves
    this.apiKey = [githubApikey, smmsApikey]
  }
  protected async img_smms(file: File, imgName: string): Promise<[string, string?]> {
    if (user.user.value.delImg) {
      await axios.get(user.user.value.delImg as string, {
        headers: {
          "Authorization": this.apiKey[1],
          "Content-Type": "multipart/form-data;charset=UTF-8"
        },
        timeout: 5000
      })
      loadProgress.value = 35
    }
    const smfile = new File([file], `${user.user.value.id}.${imgName}`)
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
      loadProgress.value = 40
      const { data: imgData } = await axios.post(`${this.db2}/upload`, {
        smfile
      }, {
        headers: {
          "Content-Type": "multipart/form-data;charset=utf-8",
          "Authorization": this.apiKey[1]
        },
        timeout: 5000
      })
      loadProgress.value = 60
      return [imgData.data.url, imgData.data.delete]
    } catch (err: any) {
      throw false
    }
  }
  protected async img_github(base64: string, imgName: string): Promise<[string]> {
    let putData
    const { data: { sha } } = await axios.get(`${this.db}/${user.user.value.id}/img/${imgName}`, {
      headers: {
        "Authorization": this.apiKey[0],
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/vnd.github.v3+json"
      },
      timeout: 5000
    })
    putData = {
      branch: "master",
      content: base64,
      message: "add img by p2psaing api",
      sha
    }
    loadProgress.value = 40
    try {
      await axios.put(`${this.db}/${user.user.value.id}/img/${imgName}`, putData, {
        headers: {
          "Authorization": this.apiKey[0],
          "Content-Type": "application/json; charset=utf-8",
          "Accept": "application/vnd.github.v3+json"
        },
        timeout: 5000
      })
    } catch {
      throw false
    };
    loadProgress.value = 60
    return [`https://cdn.staticaly.com/gh/wenxig/p2pSaing-app-db@master/${user.user.value.id}/img/${imgName}`]
  }
  protected async uploadImg(file: File, name: string): Promise<[string, string?]> {
    file = (await this.compressionFile(file))[0]
    loadProgress.value = 10
    const url = await fileToDataURL(file)
    loadProgress.value = 30
    const base64 = url.substring(url.indexOf(',') == -1 ? 0 : url.indexOf(',') + 1)
    let imgUrl: [string, string?]
    try {
      imgUrl = await this.img_github(base64, name)
    } catch {
      try {
        imgUrl = await this.img_smms(file, name)
      } catch (err) {
        console.log(err);
        throw new Error('false')
      }
    }
    loadProgress.value = 80
    if (!isUndefined(imgUrl[1])) {
      return imgUrl as [string, string]
    }
    return imgUrl as [string]
  }

  protected async compressionFile(file: Blob, type = 'image/jpeg', quality = 0.5, name?: string): Promise<[File, Blob]> {
    const fileName = name ?? file.name;
    const canvas = this.canvas;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const base64 = await fileToDataURL(file);
    const img = await dataURLToImage(base64);
    canvas.width = img.width;
    canvas.height = img.height;
    context.clearRect(0, 0, img.width, img.height);
    context.drawImage(img, 0, 0, img.width, img.height);
    const blob = await canvastoFile(canvas, type, quality) as Blob; // quality:0.5可根据实际情况计算
    const newFile = new File([blob], fileName, { type });
    return [newFile, blob];
  }
}

const fileToDataURL = (file: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    //@ts-ignore
    reader.onloadend = (e) => resolve((e.target as FileReader).result)
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