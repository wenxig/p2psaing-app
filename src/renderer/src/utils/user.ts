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
      uid: z.number()
    }).array(),
    chat: z.object({
      cid: z.string()
    }).array(),
  })
})
export const linkRuleStrict = ({
  link: z.object({
    group: z.object({
      uid: z.number()
    }).strict().array(),
    chat: z.object({
      cid: z.string()
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

export function isUserWebSave(val: unknown): val is User.WebDbSave {
  return webSaveRule.strict().safeParse(val).success
}
export function isUserWebSaveDeep(val: unknown): val is User.WebDbSaveDeep {
  return webSaveDeepRule.extend(linkRuleStrict).strict().safeParse(val).success
}

export function toUserWebSave(val: unknown): User.WebDbSave {
  return webSaveRule.parse(val)
}
export function toUserWebSaveDeep(val: unknown): User.WebDbSaveDeep {
  return webSaveDeepRule.extend(linkRule).parse(val)
}

export function createRandomUser(): User.WebDbSave {
  return {
    email: `${random(0, 100000)}@gmail.com`,
    lid: `${random(100000, 999999)}${random(100000, 999999)}${random(100000, 999999)}`,
    uid: random(0, 100000),
    img: '/userIcon.png',
    name: `${random(100000, 999999)}`,
  }
}