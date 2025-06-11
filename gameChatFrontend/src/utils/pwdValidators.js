// 对比密码与确认密码
export const createConfirmPasswordValidator = (
  getPasswordToCompare,
  emptyMessage = '请再次输入密码',
  mismatchMessage = '两次输入的密码不一致'
) => {
  return (rule, value, callback) => {
    const passwordToCompare = getPasswordToCompare()

    if (!value) {
      callback(new Error(emptyMessage))
    } else if (value !== passwordToCompare) {
      callback(new Error(mismatchMessage))
    } else {
      callback()
    }
  }
}
