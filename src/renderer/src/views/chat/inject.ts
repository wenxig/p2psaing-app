import type { InjectionKey } from 'vue'
interface SendMsg {
  text(): void
  equation(): void
  code(): void
  video(dataUrl: string): void
  image(dataUrl: string): void
  article(dataUrl: string): void
  file(dataUrl: string,name:string): void
}
export const useSender = Symbol() as InjectionKey<<T extends keyof SendMsg>(key:T,...v:Parameters<SendMsg[T]>)=>void>
export const useIsSending = Symbol() as InjectionKey<{ 
  time: number, 
  isSending: boolean,
  succeed: boolean,
  fail: boolean
}[]>
