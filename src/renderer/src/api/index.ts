import { z } from 'zod'
import { webSaveRule } from '@/utils/user'
export function isHandShake(value: unknown): value is Peer.Handshake {
  const rule = z.object({
    from: webSaveRule,
    encrypt: z.enum(['base']).or(z.boolean()),
    ok: z.boolean(),
    time: z.number(),
  }).strict()
  return rule.safeParse(value).success
}
export function isHandShakeHeader(value: unknown): value is Peer.HandshakeHeader {
  const rule = z.object({
    syn: z.number().optional(),
    seq: z.number().optional(),
    ack: z.number().optional(),
    _ack: z.number().optional(),
  }).strict()
  return rule.safeParse(value).success
}
export function isMsg(value: unknown): value is Peer.Msg.index {
  const ruls: z.ZodRawShape[] = [{
    type: z.enum(['text']),
    main: z.string()
  }
    , {
    type: z.enum(['img', 'file', 'video']),
    main: z.instanceof(Blob),
    md5: z.string()
  }
    , {
    type: z.enum(['appFunction']),
    main: z.any()
  }
    , {
    type: z.enum(['code']),
    main: z.string(),
    is: z.string()
  }
    , {
    type: z.enum(['equation']),
    main: z.string()
  }, {
    type: z.enum(['callback']),
    main: z.boolean()
  }]
  const baseMsg = z.object({
    from: z.number(),
    time: z.number()
  })
  return ruls.some(fn => {
    return baseMsg.extend(fn).strict().safeParse(value).success
  })
}
export function isRequest(value: unknown): value is Peer.Request {
  const rule = z.object({
    path: z.string().startsWith('/'),
    headers: z.any(),
    body: z.any()
  }).strict()
  return rule.safeParse(value).success
}
export function isResponse(value: unknown): value is Peer.Response {
  const rule = z.object({
    ok: z.boolean()
  })
  return rule.safeParse(value).success
}
export interface PeerPostConfig {
  useEncrypt?: Peer.Handshake['encrypt'],
  connection: Peer.Connection,
  chunk?: boolean
}
export type PeerOnPostHandleNextFn = (...value: any[]) => symbol
export type PeerOnPostHandleFn<T = Peer.Request | symbol | boolean> = (req: Peer.Request, beforeData: any[], next: PeerOnPostHandleNextFn) => Promise<T> | T
export type DefaultOnLinkHandle = (connection: Peer.Connection) => boolean | Promise<boolean>
