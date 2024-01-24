import { random } from 'lodash-es'
import { z } from 'zod'
export const webSaveRule = z.object({
  email: z.string(),
  img: z.string(),
  lid: z.string(),
  name: z.string(),
  uid: z.number(),
  introduction: z.string().optional()
})
export const linkRule = ({
  link: z.object({
    group: z.object({
      gid: z.string()
    }).array(),
    chat: z.object({
      uid: z.number()
    }).array(),
  })
})
export const linkRuleStrict = ({
  link: z.object({
    group: z.object({
      gid: z.string()
    }).strict().array(),
    chat: z.object({
      uid: z.number()
    }).strict().array(),
  })
})
export const webSaveDeepRule = z.object({
  email: z.string(),
  img: z.string(),
  lid: z.string(),
  name: z.string(),
  uid: z.number(),
  introduction: z.string().optional(),
  password: z.string(),
  pid: z.string(),
  delImg: z.string().optional()
})

export const isUserWebSave = (val: unknown): val is User.WebDbSave => webSaveRule.strict().safeParse(val).success
export const isUserWebSaveDeep = (val: unknown): val is User.WebDbSaveDeep => webSaveDeepRule.extend(linkRuleStrict).strict().safeParse(val).success
export const toUserWebSave = (val: unknown): User.WebDbSave => webSaveRule.parse(val)
export const toUserWebSaveDeep = (val: unknown): User.WebDbSaveDeep => webSaveDeepRule.extend(linkRule).parse(val)
export const createRandomUser = (): User.WebDbSave => ({
  email: `${random(0, 100000)}@gmail.com`,
  lid: `${random(100000, 999999)}${random(100000, 999999)}${random(100000, 999999)}`,
  uid: random(0, 100000),
  img: '/userIcon.png',
  name: `${random(100000, 999999)}`,
})
export const createEmptyDeepUser = (): User.WebDbSaveDeep => ({
  email: '',
  pid: '',
  lid: '',
  uid: NaN,
  img: '',
  link: {
    group: [],
    chat: []
  },
  name: '',
  password: ''
})