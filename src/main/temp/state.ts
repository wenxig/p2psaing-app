export namespace UserDataStore {
  const data: Record<string, any> = {}
  export const setData = (key: string, val: string | Record<string, any>) => {
    if (typeof val === "string") {
      data[key] = JSON.parse(val)
      return
    }
    data[key] = val
  }
  export const getData = (key: string) => {
    return JSON.stringify(data[key])
  }
}