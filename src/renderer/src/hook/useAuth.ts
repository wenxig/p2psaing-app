import { useUserStore } from '@s/user';
import { isEmpty, toNumber } from 'lodash-es';
import { HmacSHA256 } from 'crypto-js';
const userStore = useUserStore()
export function useAuth() {
  return {
    signUp,
    login,
    login_saveDb,
    sendToServer
  }
}

const server = window.useServer()
async function signUp(val: User.UserObj) {
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
  const userSave = {
    ...inpData,
    img: "",
    link: {
      group: [],
      chat: []
    },
    uid: id,
    id: tag
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
async function login(val: User.loginArg): Promise<[User.WebDbSaveDeep, string]> {
  const tag = HmacSHA256(...[val.email, val.password]).toString()
  const userValue: User.WebDbSaveDeep | "null" = JSON.parse((await server.do({
    action: "get",
    tag
  })).data[tag])
  if (userValue == 'null' || !userValue) {
    throw false;
  }
  return [userValue, tag]
}
function login_saveDb(userValue: User.WebDbSaveDeep, key: string) {
  const link = userValue.link
  link.chat.forEach((_v, i) => {
    link.chat[i].msg = []
  })
  link.group.forEach((_v, i) => {
    link.group[i].msg = []
  })
  const dbSaveData: User.DbSave = {
    name: userValue.name,
    email: userValue.email,
    img: userValue.img,
    uid: userValue.uid,
    password: userValue.password,
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
  const svData = {
    ...userStore.user.value
  }
  svData['link']['chat'].forEach((_v, i) => {
    svData['link']['chat'][i].msg = []
  })
  svData['link']['group'].forEach((_v, i) => {
    svData['link']['chat'][i].msg = []
  })
  await server.do({
    action: "update",
    tag: `${userStore.user.value.id}`,
    value: JSON.stringify(svData) as any
  })
  const svData2: User.WebDbSave = {
    name: userStore.user.value.name,
    email: userStore.user.value.email,
    img: userStore.user.value.img,
    id: userStore.user.value.id
  }
  await server.do({
    action: "update",
    tag: `${userStore.user.value.uid}`,
    value: svData2
  })
}
