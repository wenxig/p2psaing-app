import { random } from 'lodash-es'
import { z, type TypeOf } from 'zod'
export const webSaveRule = z.object({
  email: z.string().email(),
  img: z.string(),
  lid: z.string(),
  name: z.string(),
  uid: z.number().int(),
  introduction: z.string().optional()
})
export type WebDbSave = TypeOf<typeof webSaveRule>

export const linkRule = z.object({
  group: z.object({
    gid: z.string()
  }).array(),
  chat: z.object({
    uid: z.number()
  }).array(),
})
export type Link = TypeOf<typeof linkRule>


export const webSaveDeepRule = z.object({
  email: z.string().email(),
  img: z.string(),
  lid: z.string(),
  name: z.string(),
  uid: z.number().int(),
  introduction: z.string().optional(),
  pid: z.string(),
  delImg: z.string().optional()
})
export type WebDbSaveDeep = TypeOf<typeof webSaveDeepRule>

export const isUserWebSave = (val: unknown): val is User.WebDbSave => webSaveRule.safeParse(val).success
export const isUserWebSaveDeep = (val: unknown): val is User.WebDbSaveDeep => webSaveDeepRule.safeParse(val).success
export const toUserWebSave = (val: unknown): User.WebDbSave => webSaveRule.parse(val)
export const toUserWebSaveDeep = (val: unknown): User.WebDbSaveDeep => webSaveDeepRule.parse(val)
export const createRandomUser = (): User.WebDbSave => ({
  email: `${random(0, 100000)}@gmail.com`,
  lid: `${random(100000, 999999)}${random(100000, 999999)}${random(100000, 999999)}`,
  uid: random(100000, 1000000),
  img: `https://picsum.photos/200?time=${(new Date()).getTime()}`,
  name: `${random(100000, 999999)}`,
})
export const createEmptyDeepUser = (): User.WebDbSaveDeep => ({
  email: '',
  pid: '',
  lid: '',
  uid: NaN,
  img: '',
  name: ''
})

export enum Code {
  success,
  fail
}
export enum FailCode {
  notFound,
  falseMethod,
  unauthorization,
  format
}