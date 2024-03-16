import { z } from "zod"

export class Checker {
  public checkName = (_rule: any, value: string, callback: any) => {
    if (!value) return callback(new Error('请输入用户名'))
    if (/(yan)|(fei)|[烟绯]/ig.test(value)) { // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      return callback(new Error('包含异常词语'))
    }
    callback()
  }
  public validatePass = (_rule: any, value: any, callback: any) => {
    if (value === '') return callback(new Error('请输入密码'))
    callback()
  }
  public validatePass2 = (_rule: any, value: any, callback: any) => {
    if (value === '') return callback(new Error('请再次输入密码'))
    if (value !== this.from.password) return callback(new Error("两次密码不一样"))
    callback()
  }
  public checkEmail = (_rule: any, value: any, callback: any) => {
    if (!value) return callback(new Error('请输入邮箱'))
    if (!z.string().email().safeParse(value).success) return callback(new Error('好像不是邮箱捏'))
    callback()
  }
  public checkCode = (_rule: any, value: any, callback: any) => {
    if (!value) return callback(new Error('请输入邮箱验证码'))
    if (this.emailPass != value) return callback(new Error('验证码不正确'))
    callback()
  }
  get emailPass() {
    return this.emailPassGetter()
  }
  constructor(private emailPassGetter: () => string, private from: any) { }
}
