const setWatermark = (str: string, color: string) => {
  const id = '1.23452384164.123412415'
  if (document.getElementById(id) !== null) {
    document.body.removeChild(document.getElementById(id)!)
  }
  const can = document.createElement('canvas')!
  // 设置canvas画布大小
  can.width = 150
  can.height = 80

  const cans = can.getContext('2d')!
  cans.rotate(-20 * Math.PI / 180) // 水印旋转角度
  cans.font = '15px Vedana'
  cans.fillStyle = color
  cans.textAlign = 'center'
  cans.textBaseline = 'middle'
  cans.fillText(str, can.width / 2, can.height) // 水印在画布的位置x，y轴

  const div = document.createElement('div')
  div.id = id
  div.style.pointerEvents = 'none'
  div.style.top = '40px'
  div.style.left = '0px'
  div.style.opacity = '0.15'
  div.style.position = 'fixed'
  div.style.zIndex = '100000'
  div.style.width = document.documentElement.clientWidth + 'px'
  div.style.height = document.documentElement.clientHeight + 'px'
  div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat'
  document.body.appendChild(div)
  return id
}

export function useWaterMask() {
  // 添加水印方法
  const setWaterMarks = (str: string, color: string) => {
    let id = setWatermark(str, color)
    if (document.getElementById(id) === null) {
      id = setWatermark(str, color)
    }
  }

  // 移除水印方法
  const removeWatermark = () => {
    const id = '1.23452384164.123412415'
    if (document.getElementById(id) !== null) {
      document.body.removeChild(document.getElementById(id)!)
    }
  }
  return {
    add: setWaterMarks,
    remove: removeWatermark
  }
}