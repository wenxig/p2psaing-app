export class AsyncConstructor {
  then: any
  constructor(asyncConstructor: () => any) {
    const init = (async () => {
      await asyncConstructor()
      delete this.then
      return this
    })()
    this.then = init.then.bind(init)
  }
}