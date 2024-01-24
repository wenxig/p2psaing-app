import { useUserStore } from '@s/user';
import { random, toNumber } from 'lodash-es';
import { HmacSHA256, SHA256 } from 'crypto-js';
import * as server from '@/db/network'
import db from '@/db';
import { toUserWebSave } from '@/utils/user';
import { peerSetup } from '@a/chat';
export async function signUp(val: User.Arg.sigeup) {
  const userStore = useUserStore()
  const lid = SHA256(random(9999999999).toString()).toString()
  const pid = HmacSHA256(val.email, val.password).toString()
  if (!(await server.get(pid))[1]) throw false
  userStore.$setUser({
    name: val.name,
    email: val.email,
    img: '',
    lid,
    uid: toNumber(await server.count()),
    link: {
      group: [],
      chat: []
    },
    pid,
    password: val.password
  })
  await userStore.commit()
  await peerSetup(lid)
  return toUserWebSave(userStore.user)
}
export async function login(val: User.Arg.login) {
  const pid = HmacSHA256(val.email, val.password).toString()
  const user = await server.get(pid)
  if (!user[1]) throw false
  const dbSaveData: User.WebDbSaveDeep = {
    ...user[0],
    pid,
    link: user[0].link
  }
  useUserStore().$setUser(dbSaveData)
  await db.lastLogin.set()
  await peerSetup(user[0].lid)
  return toUserWebSave(dbSaveData)
}