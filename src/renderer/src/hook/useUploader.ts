import { useUserStore } from '@/store';
import axios from 'axios';
const user = useUserStore()
import { useAppStore } from '@/store';
import { storeToRefs } from 'pinia';
import { isUndefined } from 'lodash-es';
const appStoreValue = storeToRefs(useAppStore())
const loadProgress = appStoreValue.loadProgress

let canvas: HTMLCanvasElement


type GithubApikey = string; type SmmsApikey = string

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

namespace ImgUtill {
  const db = "https://api.github.com/repos/wenxig/p2pSaing-app-db/contents"
  const db2 = "https://sm.ms/api/v2"
  const apiKey: [GithubApikey, SmmsApikey] = [window.getToken('github'), window.getToken('smms')]
  export async function uploadImg(file: File, name: string): Promise<[string, string?]> {
    file = (await compressionFile(file))[0]
    loadProgress.value = 10
    const url = await fileToDataURL(file)
    loadProgress.value = 30
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
    loadProgress.value = 80
    if (!isUndefined(imgUrl[1])) {
      return imgUrl as [string, string]
    }
    return imgUrl as [string]
  }

  async function compressionFile(file: Blob, type = 'image/jpeg', quality = 0.5, name?: string): Promise<[File, Blob]> {
    const fileName = name ?? file.name;
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

namespace Uploader {
  export async function titleImg(file: File | undefined) {
    if (!file) return ""
    let imgName = `usertitle.title${file.name.slice(file.name.lastIndexOf('.'))}`
    let imgUrl: [string, string?]
    try {
      imgUrl = await ImgUtill.uploadImg(file, imgName)
    } catch (err) {
      throw err
    }
    user.user.value = {
      ...user.user.value,
      img: imgUrl[0],
      delImg: imgUrl[1] ?? undefined
    }
    loadProgress.value = 80

    user.user.value.img = imgUrl[0]
    user.user.value.delImg = imgUrl[1]
    loadProgress.value = 100
    return imgUrl
  }
}

export default function useUploader(canva: HTMLCanvasElement) {
  canvas = canva
  return {
    titleImg: Uploader.titleImg
  }
}