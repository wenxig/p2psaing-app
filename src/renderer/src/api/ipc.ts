import { z, type TypeOf } from "zod";


export const withValue = {
  getState: z.function().returns(z.any()).args(z.string()),
  getSelfState: z.function().returns(z.any()).args(z.string()),
  getVersion: z.function().returns(z.any()),
  getHttpComponents: z.function().returns(z.object({ name: z.string(), url: z.string() }).array()),

}

export const listeners = {
  onReload: z.function().returns(z.function().returns(z.void())).args(z.string(), z.function().returns(z.any())),
  onMessage: z.function().returns(z.function().returns(z.void())).args(z.string(), z.function().returns(z.any())),
}

export const withoutValue = {
  minimize: z.function().returns(z.void()),
  maximize: z.function().returns(z.void()),
  unmaximize: z.function().returns(z.void()),
  close: z.function().returns(z.void()),
  quitApp: z.function().returns(z.void()),
  toTop: z.function().returns(z.void()),
  relanch: z.function().returns(z.void()),
  reload: z.function().returns(z.void()).args(z.string()), // arg0:name
  openExternal: z.function().returns(z.void()).args(z.string()), // arg0:url
  copy: z.function().returns(z.void()).args(z.string()), // arg0:value

  setSize: z.function().returns(z.void()).args(z.object({ width: z.number(), height: z.number() })),
  setResizable: z.function().returns(z.void()).args(z.boolean()),
  setState: z.function().returns(z.void()).args(z.object({ key: z.string(), value: z.string() })),
  setSelfState: z.function().returns(z.void()).args(z.object({ key: z.string(), value: z.string() })),

  createWindow: z.function().returns(z.void()).args(z.any()),
  createChildWindow: z.function().returns(z.void()).args(z.any()),
}
export const ipc = {
  ...withValue,
  ...withoutValue,
  ...listeners
}

export const keysWithValue = Object.keys(withValue)
export const keysWithoutValue = Object.keys(withoutValue)
export const keysListeners = Object.keys(withoutValue)

const _s = z.object(ipc)
export type Ipc = TypeOf<typeof _s>
