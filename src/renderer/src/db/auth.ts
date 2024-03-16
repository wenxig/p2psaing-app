import { useUserStore } from '@s/user';
import { random, toNumber } from 'lodash-es';
import { HmacSHA256, SHA256 } from 'crypto-js';
import { getSerectUser, count, hasUser } from '@/db/network'
import { toUserWebSave } from '@/utils/user';
import { useAppStore } from '@s/appdata';
import { createPeer } from '@/api';
export async function signUp(val: User.Arg.sigeup) {
  const userStore = useUserStore()
  const lid = SHA256(random(9999999999).toString()).toString()
  const pid = HmacSHA256(val.email, val.password).toString()
  if (await hasUser(val.email)) throw false
  userStore.$setUser({
    name: val.name,
    email: val.email,
    img: '',
    lid,
    uid: toNumber(await count()),
    pid,
  })
  await userStore.$commit()
  useAppStore().peer = await createPeer(lid) as any
  return toUserWebSave(userStore.user)
}
export async function login({ pid }: User.Arg.login) {
  const user = await getSerectUser(pid)
  if (!user) throw false
  const dbSaveData: User.WebDbSaveDeep = {
    ...user,
    pid,
  }
  const userStore = useUserStore()
  userStore.$setUser(dbSaveData)
  await userStore.$commit()
  useAppStore().peer = await createPeer(user.lid) as any
  return toUserWebSave(dbSaveData)
}