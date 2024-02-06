import { round } from "lodash-es"
type SizeBlock = [width: number, height: number] | { width: number, height: number }

export function createSize(base: SizeBlock, max: SizeBlock, int = false): { width: number, height: number } {
  if (base instanceof Array) {
    var [width, height] = base
  } else {
    var { width, height } = base
  }
  if (max instanceof Array) {
    var [maxWidth, maxHeight] = max
  } else {
    var { width: maxWidth, height: maxHeight } = max
  }
  if (height > maxHeight) {
    width = (maxHeight / height) * width
    height = maxHeight
  }
  if (width > maxWidth) {
    height = (maxWidth / width) * height
    width = maxWidth
  }
  if (int) {
    height = round(height)
    width = round(width)
  }
  return { width, height }
}