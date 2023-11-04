import { useUserStore } from '@/store';
import imgUploder from './uploader/imgUploader';
const user = useUserStore()
import { useAppStore } from '@/store';
import { storeToRefs } from 'pinia';
const appStoreValue = storeToRefs(useAppStore())
const loadProgress = appStoreValue.loadProgress


export class Uploader extends imgUploder {
  constructor(canves: HTMLCanvasElement) {
    super(canves, window.getToken('github'), window.getToken('smms'))
  }
  public async titleImg(file: File | undefined) {
    if (!file) return ""
    let imgName = `usertitle.title${file.name.slice(file.name.lastIndexOf('.'))}`
    let imgUrl: [string, string?]
    try {
      imgUrl = await this.uploadImg(file, imgName)
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
