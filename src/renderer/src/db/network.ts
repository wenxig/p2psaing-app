import axios from "axios";
import { useUserStore } from '@s/user';
import { isEmpty, isUndefined, isNumber, isObject, isString } from "lodash-es";
import { isUserWebSaveDeep } from "@/utils/user";
import { handleError } from "@/utils/axios";
const base = axios.create({
  baseURL: "https://tinywebdb.appinventor.space/api",
  method: "post"
})
base.interceptors.response.use(undefined, handleError)
base.interceptors.request.use(config => {
  if (config.data.action == 'update')
    config.data.value = JSON.stringify(config.data.value)
  config.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
  config.data['user'] = "p2psaing"
  config.data['secret'] = "59c44c2f"
  return config
})
const main = axios.create({
  baseURL: "https://tinywebdb.appinventor.space",
  method: "post"
})
export async function get(tag: string | number): Promise<[User.WebDbSaveDeep, true] | [undefined, false]> {
  const result = await base({
    data: {
      tag: tag.toString(),
      action: 'get'
    }
  })

  if (result.data[tag] == 'null' && result.data[tag] == null) {
    return [undefined, false]
  }
  if (isObject(result.data[tag])) {
    return [result.data[tag], true]
  }
  return [JSON.parse(result.data[tag]), true]
}

export function createUpdate() {
  let baseTag = ''
  let data: User.WebDbSaveDeep | User.WebDbSave | undefined | number
  let isCommited = false
  async function noTag(value: User.WebDbSaveDeep | User.WebDbSave | number) {
    const userData = useUserStore()
    if (isUserWebSaveDeep(value)) {
      await base({
        data: {
          tag: userData.user.pid,
          value,
          action: 'update'
        }
      })
      return
    }
    if (isNumber(value)) {
      await base({
        data: {
          tag: `time_uid-${userData.user.uid}*email-${userData.user.email}*`,
          value,
          action: 'update'
        }
      })
      return
    }
    await base({
      data: {
        tag: `uid-${userData.user.uid}|email-${userData.user.email}|`,
        value,
        action: 'update'
      }
    })
    return
  }

  const todo = {
    tag(tag: string) {
      baseTag = tag
      return todo
    },
    data(value: User.WebDbSaveDeep | User.WebDbSave | number) {
      data = value
      return todo
    },
    /**
     * 如果没有tag链，则自动推断tag并使用data(如果有)/入参
    */
    async commit(value?: User.WebDbSaveDeep | User.WebDbSave | number) {
      if (isCommited) {
        throw new Error('is commited!')
      }
      isCommited = true
      if (value && isEmpty(baseTag)) {
        await noTag(value)
        return
      }
      if (value && baseTag) {
        await base({
          data: {
            tag: baseTag,
            value,
            action: 'update'
          }
        })
        return
      }
      if (!isUndefined(data) && isEmpty(baseTag)) {
        await noTag(data)
        return
      }
      if (!isEmpty(baseTag) && !isEmpty(data)) {
        await base({
          data: {
            tag: baseTag,
            value: data,
            action: 'update'
          }
        })
        return
      }
    },
    isCommited: () => isCommited
  }
  return todo
}
export async function delUser() {
  const userData = useUserStore()
  await base({
    data: {
      tag: userData.user.uid,
      action: 'delete'
    }
  })
  await base({
    data: {
      tag: `uid-${userData.user.uid}|email-${userData.user.email}|`,
      action: 'delete'
    }
  })
}
export async function search(tag: string | number, type: "tag", no?: number, count?: number): Promise<string[]>
export async function search(tag: string | number, type: "value", no?: number, count?: number): Promise<User.WebDbSave[]>
export async function search(tag: string | number, type: "both", no?: number, count?: number): Promise<{ tag: string, value: User.WebDbSave }[]>
export async function search(tag: string | number, type: "value" | "tag" | "both" = "both", no = 1, count = 100,): Promise<string[] | User.WebDbSave[] | { tag: string, value: User.WebDbSave }[]> {
  const { data: result } = await base({
    data: {
      tag,
      action: 'search',
      no,
      count,
      type
    }
  })
  const allKeys = Object.keys(result)
  if (allKeys.length > 1) {
    return allKeys.map((tag) => {
      return {
        value: ((): User.WebDbSave => {
          if (isString(result[tag])) {
            return JSON.parse(result[tag])
          }
          return result[tag]
        })(),
        tag
      };
    })
  }
  result[allKeys[0]] = (<any[]>result[allKeys[0]]).map((value) => {
    if (isString(value)) {
      return JSON.parse(value)
    }
    return value
  })
  return result[allKeys[0]]
}
export async function count(): Promise<number> {
  const result = await base({
    data: {
      action: "count"
    }
  })
  return result.data.count
}

export async function searchByUid(uid: number) {
  const result = (await search(`uid-${uid}|`, 'value', undefined, 1))[0]
  return result
}
export async function searchByEmail(email: string) {
  const result = (await search(`|email-${email}|`, 'value', undefined, 1))[0]
  return result
}
export async function getTimeByUid(uid: number) {
  const result = (await search(`time_uid-${uid}*`, 'value', undefined, 1))[0]
  return result as unknown as number
}
export async function getTimeByEmail(email: string) {
  const result = (await search(`*email-${email}*`, 'value', undefined, 1))[0]
  return result as unknown as number
}

export function createTable(name: string, password: string) {
  return main.post('/signup', {
    user: name,
    pw1: password,
    pw2: password,
    ask: 'p2psaing',
    ans: 'good',
  })
}
export default base