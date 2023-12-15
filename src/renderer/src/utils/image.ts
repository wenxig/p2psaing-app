export async function compressionFile(file: File | Blob, type = 'image/webp', quality = 0.5, name?: string): Promise<[File, Blob]> {
  const canvas = useCanvas()
  let fileName = name ?? 'file.webp';
  if (file instanceof File) {
    fileName = file.name
  }
  const context = canvas.canvas.getContext('2d') as CanvasRenderingContext2D;
  const base64 = await fileToDataURL(file);
  const img = await dataURLToImage(base64);
  canvas.canvas.width = img.width;
  canvas.canvas.height = img.height;
  context.clearRect(0, 0, img.width, img.height);
  context.drawImage(img, 0, 0, img.width, img.height);
  const blob = await canvasToFile(canvas.canvas, type, quality) as Blob;
  const newFile = new File([blob], fileName, { type });
  canvas[Symbol.dispose]()
  return [newFile, blob];
}
export const fileToDataURL = (file: Blob | File): Promise<string> => {
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
export const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = dataURL
  })
}
export const canvasToFile = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), type, quality))
}
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