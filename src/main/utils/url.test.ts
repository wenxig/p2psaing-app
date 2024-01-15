import { expect, test } from 'vitest'
import { isUrlMatched } from './url'
test('fun:isUrlMatched', () => {
  expect(isUrlMatched('/state/:method/:key', '/state/get/value')).toBe(true)
})