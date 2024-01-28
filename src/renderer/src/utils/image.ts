export async function compressionFile(file: File | Blob, type = 'image/webp', quality = 0.5, name?: string): Promise<[File, Blob]> {
  const { [Symbol.dispose]: clearCanvas, canvas } = useCanvas()
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const img = await dataURLToImage(await fileToDataURL(file));
  canvas.width = img.width;
  canvas.height = img.height;
  context.clearRect(0, 0, img.width, img.height);
  context.drawImage(img, 0, 0, img.width, img.height);
  const blob = await canvasToFile(canvas, type, quality) as Blob;
  const newFile = new File([blob], file instanceof File ? (file.name) : (name ?? 'file.webp'), { type });
  clearCanvas()
  return [newFile, blob];
}
export const fileToDataURL = (file: Blob | File): Promise<string> => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onloadend = (e) => resolve((() => {
    if (e.target && e.target.result) {
      if (typeof e.target.result === "string") return e.target.result
      if (e.target.result instanceof ArrayBuffer) return String.fromCharCode.apply(null, Array.from(new Uint8Array(e.target.result)))
    }
    return ""
  })())
  reader.readAsDataURL(file)
})
export const fileToText = (file: Blob | File): Promise<string> => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onloadend = (e) => resolve((() => {
    if (e.target && e.target.result) {
      if (typeof e.target.result === "string") return e.target.result
      if (e.target.result instanceof ArrayBuffer) return String.fromCharCode.apply(null, Array.from(new Uint8Array(e.target.result)))
    }
    return ""
  })())
  reader.readAsText(file)
})

export function dataURLtoFile(dataUrl: string, fileName: string) {
  const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], fileName, { type: mime });
}

export const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = dataURL
  })
}
export const canvasToFile = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), type, quality))
export const useCanvas = () => {
  const canvas = document.createElement("canvas")
  return {
    canvas,
    [Symbol.dispose]() {
      document.body.appendChild(canvas)
      document.body.removeChild(canvas)
    }
  }
}
export function getBase64ImageSize(img: string) {
  const image = new Image()
  image.crossOrigin = ''
  image.src = img
  return new Promise<{ width: number, height: number }>((resolve) => {
    image.onload = function () {
      const { width, height } = image
      resolve({ width, height })
    }
  })
}
export function getBase64VideoSize(src: string) {
  const video = document.createElement('video')
  video.crossOrigin = ''
  video.src = src
  video.className = `hidden`
  video.preload = 'metadata'
  return new Promise<{ width: number, height: number }>((resolve) => {
    video.onloadedmetadata = function () {
      const { videoWidth, videoHeight } = video
      resolve({ width: videoWidth, height: videoHeight })
    }
  })
}

export const getVideoFrameImage = (url: string, width: number, height?: number) => new Promise<string>(resolve => {
  const video = document.createElement("video");
  video.setAttribute("crossOrigin", "anonymous");
  video.setAttribute("preload", "metadata");
  video.setAttribute("src", url);
  // 视频开始可能是黑屏状态
  video.currentTime = 1;
  video.addEventListener("loadeddata", function () {
    const canvas = document.createElement("canvas");
    const { videoWidth, videoHeight } = video;
    const _height = height || videoHeight * (width / videoWidth);
    canvas.width = width;
    canvas.height = _height;
    canvas.getContext("2d")!.drawImage(video, 0, 0, width, _height);
    resolve(canvas.toDataURL("image/jpeg"));
  });
});
