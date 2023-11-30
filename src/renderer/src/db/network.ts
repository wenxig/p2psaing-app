import axios from "axios";
import { useUserStore } from '@s/index';
import { isObject } from "lodash-es";
const base = axios.create({
  baseURL: "https://tinywebdb.appinventor.space/api",
  method: "post"
})
base.interceptors.request.use(config => {
  if (config.data.action == 'update')
    config.data.value = JSON.stringify(config.data.value)
  config.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
  config.data['user'] = "p2psaing"
  config.data['secret'] = "59c44c2f"
  return config
})

export async function get(tag: string): Promise<[User.WebDbSaveDeep, true] | [undefined, false]> {
  const result = await base({
    data: {
      tag,
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
export async function update(value: User.WebDbSave): Promise<void>
export async function update(value: User.WebDbSaveDeep): Promise<void>
export async function update(value: User.WebDbSaveDeep | User.WebDbSave): Promise<void> {
  const userData = useUserStore()
  if (typeof (<User.WebDbSaveDeep>value).link !== 'undefined') {
    await base({
      data: {
        tag: userData.user.value.uid,
        value,
        action: 'update'
      }
    })
    return
  }
  await base({
    data: {
      tag: `uid-${userData.user.value.uid}|email-${userData.user.value.email}`,
      value,
      action: 'update'
    }
  })
}
export async function uploadByTag(value: User.WebDbSave, tag: string): Promise<void>
export async function uploadByTag(value: User.WebDbSaveDeep, tag: string): Promise<void>
export async function uploadByTag(value: User.WebDbSaveDeep | User.WebDbSave, tag: string) {
  await base({
    data: {
      tag,
      value,
      action: 'update'
    }
  })
}

export async function delUser() {
  const userData = useUserStore()
  await base({
    data: {
      tag: userData.user.value.uid,
      action: 'delete'
    }
  })
  await base({
    data: {
      tag: `uid-${userData.user.value.uid}|email-${userData.user.value.email}|`,
      action: 'delete'
    }
  })
}
export async function search(tag: string | number, type: "tag", no?: number, count?: number): Promise<string[]>
export async function search(tag: string | number, type: "value", no?: number, count?: number): Promise<User.WebDbSave[]>
export async function search(tag: string | number, type: "both", no?: number, count?: number): Promise<Record<string, User.WebDbSave>>
export async function search(tag: string | number, type: "value" | "tag" | "both" = "both", no = 1, count = 100,): Promise<string[] | User.WebDbSave[] | Record<string, User.WebDbSave>> {
  const result = await base({
    data: {
      tag,
      action: 'search',
      no,
      count,
      type
    }
  })
  let results: any
  if (result.data?.tag instanceof Array || result.data?.value instanceof Array) {
    results = result.data.tag[Object.keys(result.data)[0]]
  }
  results = result.data

  if (type == 'value' && results instanceof Array) {
    results = results.filter(val => {
      if (typeof val == 'string') {
        return JSON.parse(val)
      }
      return val
    })
  }
  if (type == 'both' && isObject(results)) {
    Object.keys(results).forEach(key => {
      if (typeof results[key] === 'string') {
        results[key] = JSON.parse(results[key])
      }
    });
  }
  return results
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
export default base