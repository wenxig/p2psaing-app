import { useUserStore } from '@s/user';
import { random, toNumber } from 'lodash-es';
import { HmacSHA256, SHA256 } from 'crypto-js';
import * as server from '@/db/network'
import db from '@/db';
export function useAuth() {
  return {
    signUp,
    login
  }
}
async function signUp(val: User.Arg.sigeup) {
  const userStore = useUserStore()
  const lid = SHA256(random(9999999999).toString()).toString()
  const pid = HmacSHA256(val.email, val.password).toString()
  if (!(await server.get(pid))[1]) {
    return false
  }
  const count = await server.count()
  let uid = toNumber(count) + 1
  const inpData: User.WebDbSave = {
    name: val.name,
    email: val.email,
    img: '',
    lid,
    uid
  }
  const userSave: User.WebDbSaveDeep = {
    ...inpData,
    link: {
      group: [],
      chat: []
    },
    pid,
    password: val.password
  }
  userStore.$setUser({
    user: userSave
  })
  await userStore.commit()
  await userStore.peerSetup()
  return true
}
async function login(val: User.Arg.login): Promise<[data: User.WebDbSaveDeep, pid: string, next: NextLoginFunction]> {
  const userStore = useUserStore()
  const pid = HmacSHA256(val.email, val.password).toString()
  const user = await server.get(pid)
  if (!user[1]) {
    throw false
  }
  return [user[0], pid, async () => { //next
    if (!user) {
      return false
    }
    const dbSaveData: User.WebDbSaveDeep = {
      ...user[0],
      pid,
      link: user[0].link
    }
    userStore.$setUser({
      user: dbSaveData
    })
    await db.lastLogin.set()
    await userStore.peerSetup()
    return true
  }]
}

export type NextLoginFunction = () => Promise<boolean>