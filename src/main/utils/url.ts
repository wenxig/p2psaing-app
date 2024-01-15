export function isUrlMatched(base: string, check: string): boolean {
  const baseUrl = base.split('/').filter(s => !!s)
  const indexOfSearch = check.indexOf('?')
  const indexOfHash = check.indexOf('#')
  const indexOfSubStop = indexOfSearch == -1 ? (indexOfHash == -1 ? Infinity : indexOfHash) : indexOfSearch
  const checkUrl = check.substring(0, indexOfSubStop).split('/').filter(s => !!s)
  if (checkUrl.length != baseUrl.length) return false
  return baseUrl.every((path, index) => {
    const check = checkUrl[index]
    const isOptional = path.startsWith(':')
    return (isOptional && !!check) || check == path
  })
}
export function createMessageCenterRouterUrl<P extends Record<string, string>, T extends Record<string, string>>(base: string, check: string): MessageCenterRouterUrl<P, T> {
  const baseUrl = base.split('/').filter(s => !!s)
  const indexOfSearch = check.indexOf('?')
  const checkPath = check.substring(0, indexOfSearch == -1 ? undefined : indexOfSearch)
  const checkUrl = checkPath.split('/').filter(s => !!s)
  const checkSearch: any = {}
  const indexOfHash = check.indexOf('#')
  check.substring(indexOfSearch + 1, indexOfHash).split('&').map(v => v.split('=')).forEach(([key, value]) => (!!key) && (checkSearch[key] = value))
  const checkHash = indexOfHash + 1 ? check.substring(indexOfHash + 1) : ""
  const checkParams: any = {}
  baseUrl.forEach((path, index) => {
    if (!path.startsWith(":")) return
    const check = checkUrl[index]
    checkParams[path.substring(1)] = check
  })
  return {
    fullPath: check,
    hash: checkHash,
    params: checkParams,
    path: checkPath,
    query: checkSearch
  }
}
export interface MessageCenterRouterUrl<TParams extends Record<string, string>, TQuery extends Record<string, string>> {
  params: TParams,
  fullPath: string,
  path: string,
  query: TQuery,
  hash: string
}