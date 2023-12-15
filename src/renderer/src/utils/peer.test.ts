import { expect, test } from 'vitest'
import { isMsg } from './peer'

test('fun:isMsg', () => {
  expect(isMsg(<User.Msg>{
    from: 123,
    time: 4133231,
    type: 'code',
    main: 'adfs',
    is: 'jsx',
    si: '1'
  })).toBe(false)
})
test('fun:isMsg2', () => {
  expect(isMsg(<User.Msg>{
    from: 123,
    time: 4133231,
    type: 'code',
    main: 'adfs',
    is: 'jsx',
  })).toBe(true)
})
