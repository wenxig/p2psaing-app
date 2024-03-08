namespace Api {
  type Code = import('./utils/user').Code
  type FailCode = import('./utils/user').FailCode
  interface Success<T = any> {
    code: Code.success;
    data: T;
  }
  interface Fail<T = any> {
    code: Code.fail;
    data: {
      message: T,
      code: FailCode
    };
  }
  type Response<TS = any, TF = any> = Success<TS> | Fail<TF>
}