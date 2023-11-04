import Store from 'electron-store'; //node环境，有什么问题呢
const store = new Store();
export function useDatabase(user: string) {
  return {
    set: (key: string, value: any) => store.set(`${key}_${user}`, value),
    get: <T>(key: string, defaultValue?: T): T | undefined => (store.get(`${key}_${user}`) as T) ?? (defaultValue ?? undefined),
    has: (key: string) => store.has(`${key}_${user}`),
    delete: (key: string) => store.delete(`${key}_${user}`),
    clear: () => store.clear(),
    size: () => store.size,
    path: () => store.path
  }
}
