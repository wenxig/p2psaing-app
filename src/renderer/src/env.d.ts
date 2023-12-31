/// <reference types="vite/client" />
/// <reference types="electron-vite/node" />
declare module 'element-plus/dist/locale/zh-cn'
declare module 'vue3-infinite-list'
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false