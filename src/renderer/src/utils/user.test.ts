import { expect, assertType, test } from 'vitest'
import { isUserWebSave, toUserWebSave, toUserWebSaveDeep, isUserWebSaveDeep } from './user'
test('fun:isUserWebSave', () => {
  expect(isUserWebSave({
    'name': 'a',
    'email': 'a',
    'img': 'asd',
    'lid': '1',
    uid: 1,
    introduction: '1'
  })).toBe(true)
})

test('fun:toUserWebSave', () => {
  assertType<User.WebDbSave>(toUserWebSave({
    'name': 'a',
    'email': 'a',
    'img': 'asd',
    'lid': '1',
    uid: 1,
    introduction: '1',
    sbsfdfsaf: 231,
    agsfa: [
      '2312',
      {
        "asdas": '32regfasd'
      }
    ]
  }))
})

test('fun:isUserWebSaveDeep', () => {
  expect(isUserWebSaveDeep({
    email: 'z.string()',
    img: 'z.string()',
    lid: 'z.string()',
    name: 'z.string()',
    uid: 1,
    // introduction: 'z.string()',
    password: 'z.string()',
    pid: 'z.string()',
    delImg: 'z.string()',
    link: ({
      group: [({
        uid: 1
      })],
      chat: [({
        cid: 'z.string()',
      })],
    })
  })).toBe(true)
})

test('fun:toUserWebSaveDeep', () => {
  assertType<User.WebDbSaveDeep>(toUserWebSaveDeep({
    email: 'z.string()',
    img: 'z.string()',
    lid: 'z.string()',
    name: 'z.string()',
    uid: 1,
    introductionnnnnn: 'z.string()',
    asdaadawdawd1231: ['fes0j90fds'],
    password: 'z.string()',
    pid: 'z.string()',
    delImg: 'z.string()',
    link: ({
      group: [({
        uid: 1
      })],
      chat: [({
        cid: 'z.string()',
      })],
    })
  }))
})
