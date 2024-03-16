import { produce, } from 'immer'
import { shallowRef } from 'vue'

export function useImmer<T extends object>(baseState: T) {
  type Updater = (updater: T) => void
  const state = shallowRef<T>(baseState)
  const update = (updater: Updater) => state.value = produce(state.value, updater)
  return [state, update] as const
}