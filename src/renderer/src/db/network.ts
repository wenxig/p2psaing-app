import axios, { AxiosError } from "axios";
import { useUserStore } from '@s/user';
import { isEmpty, isUndefined, isNumber, isObject, isString } from "lodash-es";
import { isUserWebSaveDeep } from "@/utils/user";
import { handleError } from "@/utils/axios";
const base = axios.create({
  baseURL: "https://tinywebdb.appinventor.space/api",
  method: "post"
})

export const sendEmail = async (to: string, subject: string, msg: string) => {
  if ([
    `https://v.api.aa1.cn/api/qqemail/new/?from_mail=__APP_NAME__@__APP_NAME__.surge.sh&subject=[__APP_NAME__]${subject}&message=${msg}&to=${to}`,
    `https://v.api.aa1.cn/api/mail/t/api.php?adress=${to}&title=[__APP_NAME__]${subject}&content=${msg}`
  ].every(async val => {
    try {
      const { data } = await axios.get(val);
      return !(data.status === "success" || data.Code === "1")
    } catch (error) {
      return false;
    }
  })) {
    throw new AxiosError("can`t send email")
  }
};
base.interceptors.response.use(undefined, handleError)
base.interceptors.request.use(config => {
  if (config.data.action == 'update') config.data.value = JSON.stringify(config.data.value)
  config.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
  config.data['user'] = "p2psaing"
  config.data['secret'] = "59c44c2f"
  return config
})
const main = axios.create({
  baseURL: "https://tinywebdb.appinventor.space",
  method: "post"
})
export async function get(key: string | number): Promise<[User.WebDbSaveDeep, true] | [undefined, false]> {
  const { data } = await base({
    data: {
      tag: key.toString(),
      action: 'get'
    }
  })
  if (data[key] == 'null' && data[key] == null) return [undefined, false]
  if (isObject(data[key])) return [data[key], true]
  return [JSON.parse(data[key]), true]
}

export function createUpdate() {
  let baseTag = ''
  let data: User.WebDbSaveDeep | User.WebDbSave | undefined | number
  let isCommited = false
  async function noTag(value: User.WebDbSaveDeep | User.WebDbSave | number) {
    const { user } = useUserStore()
    if (isUserWebSaveDeep(value)) return void await base({
      data: {
        tag: user.pid,
        value,
        action: 'update'
      }
    })
    if (isNumber(value)) return void await base({
      data: {
        tag: `time_uid-${user.uid}*email-${user.email}*`,
        value,
        action: 'update'
      }
    })
    return void await base({
      data: {
        tag: `uid-${user.uid}|email-${user.email}|`,
        value,
        action: 'update'
      }
    })
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
      if (isCommited) throw new Error('is commited!')
      isCommited = true
      if (value && isEmpty(baseTag)) return void await noTag(value)
      if (value && baseTag) return void await base({
        data: {
          tag: baseTag,
          value,
          action: 'update'
        }
      })
      if (!isUndefined(data) && isEmpty(baseTag)) return void await noTag(data)
      if (!isEmpty(baseTag) && !isEmpty(data)) return void await base({
        data: {
          tag: baseTag,
          value: data,
          action: 'update'
        }
      })
    },
    isCommited: () => isCommited
  }
  return todo
}
export async function delUser() {
  const { user } = useUserStore()
  await base({
    data: {
      tag: user.uid,
      action: 'delete'
    }
  })
  await base({
    data: {
      tag: `uid-${user.uid}|email-${user.email}|`,
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
  if (allKeys.length > 1) return allKeys.map((tag) => ({
    value: ((): User.WebDbSave => isString(result[tag]) ? JSON.parse(result[tag]) : result[tag])(),
    tag
  }))
  return result[allKeys[0]] = (<any[]>result[allKeys[0]]).map((value) => isString(value) ? JSON.parse(value) : value)
}
export const count = async (): Promise<number> => (await base({
  data: {
    action: "count"
  }
})).data.count

export const searchByUid = async (uid: number) => (await search(`uid-${uid}|`, 'value', undefined, 1))[0]
export const searchByEmail = async (email: string) => (await search(`|email-${email}|`, 'value', undefined, 1))[0]
export const getTimeByUid = async (uid: number) => (await search(`time_uid-${uid}*`, 'value', undefined, 1))[0] as unknown as number
export const getTimeByEmail = async (email: string) => (await search(`*email-${email}*`, 'value', undefined, 1))[0] as unknown as number

export const createTable = (name: string, password: string) => main.post('/signup', {
  user: name,
  pw1: password,
  pw2: password,
  ask: 'p2psaing',
  ans: 'good',
})
export default base