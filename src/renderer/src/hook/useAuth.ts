import { useUserStore } from '@s/user';
import { isEmpty, random, toNumber } from 'lodash-es';
import { HmacSHA256, SHA256 } from 'crypto-js';
const userStore = useUserStore()
export function useAuth() {
  return {
    signUp,
    login,
    sendToServer
  }
}

const server = window.useServer()
async function signUp(val: User.arg.sigeup) {
  const inpData = {
    name: val.name,
    email: val.email,
    password: val.password
  }
  const tag = HmacSHA256(...[val.email, val.password]).toString()
  const isHaveUser = (await server.do({ action: "get", tag })).data[tag] != "null"
  if (isHaveUser) {
    return false
  }
  const { data: { count } } = await server.do({ action: "count" })
  let id = toNumber(count) + 1
  const userSave: User.DbSave = {
    ...inpData,
    img: "",
    link: {
      group: [],
      chat: []
    },
    uid: id,
    id: tag,
    lid: SHA256(random(10000000, 9999999999).toString()).toString()
  }
  userStore.user.value = userSave
  await server.do({
    action: "update",
    tag,
    value: userSave
  })
  await server.do({
    action: "update",
    tag: inpData.name,
    value: inpData
  })
  return true
}
async function login(val: User.arg.login): Promise<[uesrData: User.WebDbSaveDeep, userKey: string, next: typeof login_saveDb]> {
  const tag = HmacSHA256(val.email, val.password).toString()
  const userValue: User.WebDbSaveDeep | "null" = JSON.parse((await server.do({
    action: "get",
    tag
  })).data[tag])
  if (userValue == 'null' || !userValue) {
    throw false;
  }
  return [userValue, tag, login_saveDb]
}
function login_saveDb(userValue: User.WebDbSaveDeep, key: string) {
  const link = userValue.link
  const dbSaveData: User.DbSave = {
    ...userValue,
    id: key,
    link
  }
  userStore.user.value = dbSaveData
  return true
}
async function sendToServer() {
  if (isEmpty(userStore.user)) {
    return
  }
  await server.do({
    action: "update",
    tag: `${userStore.user.value.id}`,
    value: JSON.stringify(userStore.user.value) as any
  })
  const svData2: User.WebDbSave = {
    name: userStore.user.value.name,
    email: userStore.user.value.email,
    img: userStore.user.value.img,
    id: userStore.user.value.id
  }
  await server.do({
    action: "update",
    tag: `uid-${userStore.user.value.uid}|email-${userStore.user.value.email}`,
    value: svData2
  })
}
