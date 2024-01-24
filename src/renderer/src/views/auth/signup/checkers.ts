export class Checker {
  public checkName = (_rule: any, value: string, callback: any) => {
    if (!value) {
      return callback(new Error('请输入用户名'))
    }
    if (/yan|fei|[烟绯]/.test(value)) {
      return callback(new Error('包含敏感词语'))
    }
    callback()
  }
  public validatePass = (_rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请输入密码'))
      return
    }
    if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[a-z])[a-z0-9]{8,10}$/).test(value)) {
      callback(new Error('当前密码强度不够'))
    }
    callback()
  }
  public validatePass2 = (_rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请再次输入密码'))
    } else if (value !== this.from.password) {
      callback(new Error("两次密码不一样"))
    } else if (!((/^(?=.*\d)(?=.*[a-z])(?=.*[a-z])[a-z0-9]{8,10}$/).test(value))) {
      callback(new Error('当前密码强度不够'))
    } else {
      callback()
    }
  }
  public checkEmail = (_rule: any, value: any, callback: any) => {
    if (!value) {
      return callback(new Error('请输入邮箱'))
    }
    if (!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/).test(value)) {
      callback(new Error('好像不是邮箱捏'))
    }
    callback()
  }
  public checkCode = (_rule: any, value: any, callback: any) => {
    if (!value) {
      return callback(new Error('请输入邮箱验证码'))
    }
    if (this.emailPass != value) {
      callback(new Error('验证码不正确'))
    }
    callback()
  }
  get emailPass() {
    return this.emailPassGetter()
  }
  constructor(private emailPassGetter: () => string, private from: any) {

  }
}
